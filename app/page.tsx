"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion"; // Import Framer Motion
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";

// Dynamically import the Lottie Player with SSR disabled
const Player = dynamic(() => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player), {
  ssr: false,
});

type Message = { text: string; sender: "user" | "bot" };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // For chatbot responses
  const [uploading, setUploading] = useState(false); // For file uploads
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize chatbot and send the first message
  useEffect(() => {
    const initializeChatbot = async () => {
      setUploading(true); // Show full-screen loading screen during initialization
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "initialize" }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        const botReply = data?.response?.trim() || "Hello! How can I assist you today?";
        const botMessage: Message = { text: botReply, sender: "bot" };

        setMessages([botMessage]);
      } catch (error) {
        console.error("Error initializing chatbot:", error);
        setMessages([{ text: "Error initializing chatbot.", sender: "bot" }]);
      } finally {
        setUploading(false); // Hide the full-screen loading screen after initialization
      }
    };

    initializeChatbot();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true); // Show small loading indicator for chatbot response

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      const botReply = data?.response?.trim() || "I'm not sure how to respond.";
      const botMessage: Message = { text: botReply, sender: "bot" };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { text: "Error connecting to the server.", sender: "bot" }]);
    } finally {
      setLoading(false); // Hide the small loading indicator after processing
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (

    <div className="relative min-h-screen flex items-center justify-between gap-x-10 px-10 font-poppins bg-emerald-800">
      
      
      {/* Full-Screen Loading Screen for File Uploads */}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Player
            autoplay
            loop
            src="/Animation - 1743677201415.json"
            style={{ height: "200px", width: "200px" }}
          />
          <p className="text-white text-xl mt-4">Waking Up Carlo...</p>
        </div>
      )}
      
      <a href="https://www.doncarlocavinaschool.com/" target="_blank" rel="noopener noreferrer">
      <div>
        <img
          src="/DCCS LOGO.ico"
          alt="DCCS Logo"
          className="absolute left-12 z-0 top-3 w-10 h-10 drop-shadow-lg"
        />
        <p className="absolute left-26 z-0 top-5 text-m font-bold text-white drop-shadow-lg">
          Don Carlo Cavina School
        </p>
      </div>
      </a>
      
      {/* Main Content */}
      <div className="text-white">
        {/* Lottie Animation */}
        <Player
          autoplay
          loop
          src="/Animation - 1743677201415.json"
          style={{ height: "275px", width: "275px" }}
          className="drop-shadow-lg ml-1"
        />

        {/* Title */}
        <h1 className="text-5xl font-extrabold mb-4 ml-3 shadow-emerald-950 drop-shadow-lg text-center">
          Carlo Bot
        </h1>
        <p className="text-lg ml-3 font-medium drop-shadow-lg">
          Your school assistant chatbot. Ask me anything about Don Carlo Cavina School!
        </p>
        <p className="text-lg ml-3 font-bold drop-shadow-lg">by Franz Perez (BSCS-3A)</p>
      </div>
      <div className="max-w w-full p-4 rounded-4xl shadow-md bg-gray-50 drop-shadow-lg">
        <div className="h-80 overflow-y-auto p-2 border-b border-gray-300">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex items-end my-2 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Bot Icon */}
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                  <img
                    src="/dccs_logo.png"
                    alt="Bot Icon"
                    className="w-6 h-6 mix-blend-multiply"
                  />
                </div>
              )}

              {/* Message */}
              <div
                className={`relative max-w-1/2 p-3 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-emerald-700 text-white text-right"
                    : "bg-gray-200 text-black text-left"
                }`}
                style={{
                  borderRadius: msg.sender === "user" ? "20px 20px 0 20px" : "20px 20px 20px 0",
                }}
              >
                {msg.sender === "bot" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ children }) => <ul className="list-disc list-inside ml-4">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside ml-4">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
                <div
                  className={`absolute w-0 h-0 border-t-8 border-l-8 border-transparent ${
                    msg.sender === "user"
                      ? "border-t-emerald-700 right-2 bottom-0 transform rotate-90"
                      : "border-t-gray-200 left-2 bottom-0 transform -rotate-90"
                  }`}
                />
              </div>
            </motion.div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex mt-2 text-gray-700">
          <input
            type="text"
            className="flex-1 p-3 rounded-l-2xl focus:outline-none bg-gray-200"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || uploading}
          />
          <button
            className="bg-emerald-700 text-white px-4 py-2 rounded-r-2xl hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center"
            onClick={sendMessage}
            disabled={loading || uploading}
          >
            {loading ? (
              <span className="loader" /> // Add a small spinner or dots here
            ) : (
              <svg
                className="w-6 h-6 text-white rotate-90"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}