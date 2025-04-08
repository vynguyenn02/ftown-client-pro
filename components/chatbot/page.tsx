"use client";
import { useState } from "react";

export default function Chatbot() {
  // State kiểm soát chatbot đang mở (isOpen = true) hay đã thu nhỏ (isOpen = false)
  const [isOpen, setIsOpen] = useState(true);

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
            {/* Nút thu nhỏ (dùng icon thay chữ) */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-black text-2xl leading-none"
              title="Thu nhỏ"
            >
              {/* Biểu tượng thu nhỏ, ví dụ ➖ */}
              ➖
            </button>
          </div>

          {/* Khu vực hiển thị tin nhắn */}
          <div className="flex-1 overflow-y-auto mb-4">
            <p className="text-sm">Chào bạn! Mình có thể giúp gì cho bạn hôm nay?</p>
            {/* ... nội dung chat ... */}
          </div>

          {/* Ô nhập tin nhắn */}
          <div>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="
                w-full p-2 rounded
                bg-gray-100 border border-gray-300
                text-black focus:outline-none focus:ring-2 focus:ring-gray-400
              "
            />
          </div>
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
          {/* Biểu tượng mở rộng, ví dụ 💬 */}
          💬
        </button>
      )}
    </>
  );
}
