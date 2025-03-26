import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: 
            [
              {
                 text: message }] }],
      }),
    });

    const text = await response.text(); // Get raw response text
    console.log("Raw API Response:", text);

    if (!response.ok) {
      return NextResponse.json({ error: `API error: ${response.statusText}` }, { status: response.status });
    }

    const data = JSON.parse(text);
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Request Error:", error);
    return NextResponse.json({ error: "Error communicating with Gemini API" }, { status: 500 });
  }
}