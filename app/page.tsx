"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown"; // Import react-markdown

type Message = { text: string; sender: "user" | "bot" };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true); // Start with loading true to wait for chatbot initialization
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to the bottom

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize chatbot and send the first message
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "initialize" }), // Special message to initialize the chatbot
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        const botReply = data?.response?.trim() || "Hello! How can I assist you today?";
        const botMessage: Message = { text: botReply, sender: "bot" };

        setMessages([botMessage]); // Set the initial chatbot message
      } catch (error) {
        console.error("Error initializing chatbot:", error);
        setMessages([{ text: "Error initializing chatbot.", sender: "bot" }]);
      } finally {
        setLoading(false); // Allow user interaction after initialization
      }
    };

    initializeChatbot();
  }, []);

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
      const botReply = data?.response?.trim() || "I'm not sure how to respond.";
      const botMessage: Message = { text: botReply, sender: "bot" };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { text: "Error connecting to the server.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-between px-10 bg-emerald-800 font-poppins">
      <div className="text-white">
        <h1 className="text-5xl font-bold mb-4 shadow-emerald-950">DCCS Carlo Bot</h1>
        <p className="text-lg font-medium">Your school assistant chatbot</p>
      </div>
      <div className="max-w w-full p-4 rounded-4xl shadow-md bg-gray-50">
        <div className="h-80 overflow-y-auto p-2 border-b border-gray-300">
          
          
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end my-2 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              
              {/* Bot Icon*/}
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}



              {/* Message*/}
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
                  <ReactMarkdown>{msg.text}</ReactMarkdown> // Render bot messages as Markdown
                ) : (
                  msg.text // Render user messages as plain text
                )}
                <div
                  className={`absolute w-0 h-0 border-t-8 border-l-8 border-transparent ${
                    msg.sender === "user"
                      ? "border-t-emerald-700 right-2 bottom-0 transform rotate-90"
                      : "border-t-gray-200 left-2 bottom-0 transform -rotate-90"
                  }`}
                />
              </div>


              {/* User Icon*/}
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center ml-2">
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path className="bg-grey"
                      fillRule="evenodd"
                      d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}


          <div ref={messagesEndRef} /> {/* Scroll to this element */}
        </div>






        <div className="flex mt-2 text-gray-700">
          <input
            type="text"
            className="flex-1 p-3 rounded-l-2xl focus:outline-none bg-gray-200"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="bg-emerald-700 text-white px-4 py-2 rounded-r-2xl hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? (
              "..."
            ) : (
              <svg
                className="w-6 h-6 text-white rotate-90" // Rotate the icon using Tailwind
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