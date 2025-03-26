"use client";

import { useState } from "react";

type Message = { text: string; sender: "user" | "bot" };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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
      const botReply = data?.reply?.trim() || "I'm not sure how to respond.";
      const botMessage: Message = { text: botReply, sender: "bot" };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { text: "Error connecting to the server.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full p-4 border rounded-lg shadow-md bg-white">
        <div className="h-80 overflow-y-auto p-2 border-b">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`my-2 p-2 rounded-lg ${
                msg.sender === "user" ? "bg-blue-500 text-white text-right" : "bg-gray-200 text-black text-left"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex mt-2 text-black">
          <input
            type="text"
            className="flex-1 border p-2 rounded-l-lg focus:outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
