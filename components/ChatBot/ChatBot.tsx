"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useChatBot } from "@/contexts/ChatBotContextProps";

export default function ChatBot() {
  const { messages, isTyping, sendMessage } = useChatBot();
  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll xuống cuối mỗi khi messages hoặc isTyping thay đổi
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    sendMessage(text);
    setInputValue("");
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-4 right-4 w-96 h-96 bg-white/80 backdrop-blur-sm text-black border border-gray-300 shadow-lg rounded-lg z-50 p-4 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Chatbot</h2>
            <button onClick={() => setIsOpen(false)} title="Thu nhỏ">
              ➖
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto mb-3 space-y-2"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[75%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              </div>
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-2 rounded-l bg-gray-100 border border-gray-300 focus:outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-r"
            >
              Gửi
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-full shadow-lg z-50 text-2xl"
          title="Mở Chat"
        >
          💬
        </button>
      )}
    </>
  );
}
