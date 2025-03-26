import { NextResponse } from "next/server";
require("dotenv").config();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("node:fs");
const mime = require("mime-types");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

// Cache for uploaded files
let cachedFiles = [];

async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

async function waitForFilesActive(files) {
  console.log("Waiting for file processing...");
  for (const name of files.map((file) => file.name)) {
    let file = await fileManager.getFile(name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(name);
    }
    if (file.state !== "ACTIVE") {
      throw Error(`File ${file.name} failed to process`);
    }
  }
  console.log("...all files ready\n");
}

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: [],
  responseMimeType: "text/plain",
};

async function initializeFiles() {
  if (cachedFiles.length === 0) {
    const files = [
      await uploadToGemini("public\\Context\\Contacts.md", "text/markdown"),
      await uploadToGemini("public\\Context\\Personnel.md", "text/markdown"),
      await uploadToGemini("public\\Context\\Extra.md", "text/markdown"),
      await uploadToGemini("public\\Context\\Philosophy-Mission-Vision.md", "text/markdown"),
      await uploadToGemini("public\\Context\\Initial.md", "text/markdown"),
    ];

    await waitForFilesActive(files);

    cachedFiles = files.map((file) => ({
      mimeType: file.mimeType,
      fileUri: file.uri,
    }));
  }
}

async function run(userInput) {
  await initializeFiles();

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: cachedFiles.map((file) => ({
          fileData: { mimeType: file.mimeType, fileUri: file.fileUri },
        })).concat({ text: "follow these" }),
      },
      {
        role: "model",
        parts: [
          { text: "Hello! I am Carlo, the official chatbot for Don Carlo Cavina School. How may I help you with school-related information?\n" },
        ],
      },
      {
        role: "user",
        parts: [{ text: userInput }],
      },
    ],
  });

  const result = await chatSession.sendMessage(userInput);
  const responseText = result.response.text();

  console.log(responseText);
  return responseText;
}

// Export the POST method for Next.js
export async function POST(req) {
  try {
    const { message } = await req.json(); // Extract user input from the request body
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await run(message);
    return NextResponse.json({ response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}