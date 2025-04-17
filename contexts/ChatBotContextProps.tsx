"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCookie } from "cookies-next";
import botService from "@/services/bot.service";

/** Kiểu tin nhắn trong ChatBot */
export interface ChatMessage {
  sender: "user" | "bot";
  content: string;
  timestamp: Date;
}

/** Kiểu giá trị mà Context cung cấp */
interface ChatBotContextProps {
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
}

/** Khởi tạo context */
const ChatBotContext = createContext<ChatBotContextProps | undefined>(undefined);

export const ChatBotProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Khởi tạo SignalR connection một lần
  useEffect(() => {
    // Start connection
    botService.startConnection().then(() => {
      // Đăng ký lắng nghe event "ReceiveBotMessage"
      botService.onMessageReceived((botReply) => {
        // Mỗi khi server gửi tin nhắn (botReply), ta cập nhật vào state
        const newMsg: ChatMessage = {
          sender: "bot",
          content: botReply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMsg]);
      });
    });

    // Cleanup: khi unmount, dừng kết nối
    return () => {
      botService.stopConnection();
    };
  }, []);

  /**
   * Hàm gửi tin nhắn của user lên server
   *  - Lưu tin nhắn user vào state
   *  - Gọi botService để invoke method SignalR
   */
  const sendMessage = (content: string) => {
    // Lưu vào state local (thêm tin nhắn user)
    const userMsg: ChatMessage = {
      sender: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Lấy userId (accountId) nếu cần
    const userId = Number(getCookie("accountId")) || 0;

    // Gửi qua SignalR
    botService.sendMessageToBot(userId, content);
  };

  return (
    <ChatBotContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatBotContext.Provider>
  );
};

/** Custom hook để sử dụng ChatBotContext */
export const useChatBot = (): ChatBotContextProps => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error("useChatBot must be used within a ChatBotProvider");
  }
  return context;
};
