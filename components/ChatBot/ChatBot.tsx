"use client";
import { useState, FormEvent } from "react";
import { useChatBot } from "@/contexts/ChatBotContextProps";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  // Lấy messages + hàm sendMessage từ context
  const { messages, sendMessage } = useChatBot();

  // Xử lý gửi tin nhắn
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue("");
  };

  return (
    <>
      {isOpen ? (
        <div
          className="
            fixed bottom-4 right-4
            w-96 h-96
            bg-white/70 backdrop-blur-sm
            text-black
            border border-gray-300 shadow-lg
            rounded-lg z-50
            p-4 flex flex-col
          "
        >
          {/* Header chatbot */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Chatbot</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-black text-2xl leading-none"
              title="Thu nhỏ"
            >
              ➖
            </button>
          </div>

          {/* Khu vực hiển thị tin nhắn */}
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <p
                  className={`
                    inline-block px-3 py-2 rounded-md
                    ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }
                  `}
                >
                  {msg.content}
                </p>
              </div>
            ))}
          </div>

          {/* Ô nhập tin nhắn */}
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="
                flex-1 p-2 rounded-l
                bg-gray-100 border border-gray-300
                text-black focus:outline-none focus:ring-2 focus:ring-gray-400
              "
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
        // Nếu isOpen = false => chỉ hiện 1 nút nhỏ
        <button
          onClick={() => setIsOpen(true)}
          className="
            fixed bottom-4 right-4
            bg-black text-white px-4 py-2
            rounded-full shadow-lg z-50
            text-2xl leading-none
          "
          title="Mở Chat"
        >
          💬
        </button>
      )}
    </>
  );
}
