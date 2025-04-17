"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getCookie } from "cookies-next";
import botService from "@/services/bot.service";

export interface ChatMessage {
  sender: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatBotContextProps {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => void;
}

const ChatBotContext = createContext<ChatBotContextProps | undefined>(undefined);

export const ChatBotProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    botService.startConnection().then(() => {
      botService.onMessageReceived((sender, message) => {
        // Bỏ qua echo của user, chỉ hiển thị khi sender === "assistant"
        if (sender !== "assistant") return;

        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", content: message, timestamp: new Date() },
        ]);
      });
    });

    return () => {
      botService.stopConnection();
    };
  }, []);

  const sendMessage = (content: string) => {
    // Thêm ngay tin nhắn user
    setMessages((prev) => [
      ...prev,
      { sender: "user", content, timestamp: new Date() },
    ]);
    // Hiển thị typing indicator
    setIsTyping(true);

    const userId = Number(getCookie("accountId")) || 0;
    botService.sendMessageToBot(userId, content);
  };

  return (
    <ChatBotContext.Provider value={{ messages, isTyping, sendMessage }}>
      {children}
    </ChatBotContext.Provider>
  );
};

export const useChatBot = (): ChatBotContextProps => {
  const ctx = useContext(ChatBotContext);
  if (!ctx) {
    throw new Error("useChatBot must be used within ChatBotProvider");
  }
  return ctx;
};
