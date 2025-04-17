// /services/bot.service.ts
"use client";

import { getCookie } from "cookies-next";
import * as signalR from "@microsoft/signalr";

// Đổi URL: BotHub được map tại "/bothub" trên server
const CHAT_HUB_URL = "https://localhost:7009/bothub";

class BotService {
  private hubConnection: signalR.HubConnection | null = null;

  constructor() {
    this.createConnection();
  }

  private createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => {
          // Lấy token từ cookie nếu cần
          const token = getCookie("token");
          console.log("BotService: accessTokenFactory: token =", token);
          return typeof token === "string" ? token : "";
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  // Khởi động kết nối
  public async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      this.createConnection();
    }
    // Nếu kết nối không ở trạng thái Disconnected thì dừng trước khi start lại
    if (this.hubConnection!.state !== signalR.HubConnectionState.Disconnected) {
      await this.stopConnection();
    }
    try {
      await this.hubConnection!.start();
      console.log("✅ BotService: SignalR connection established:", this.hubConnection!.state);
    } catch (err) {
      console.error("❌ BotService: Error starting connection:", err);
      // Thử kết nối lại sau 5 giây nếu gặp lỗi
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  // Dừng kết nối
  public async stopConnection(): Promise<void> {
    if (!this.hubConnection) return;
    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.log("ℹ️ BotService: Hub is not connected. Skip stop. State:", this.hubConnection.state);
      return;
    }
    try {
      await this.hubConnection.stop();
      console.log("🔌 BotService: Disconnected. State:", this.hubConnection.state);
    } catch (err) {
      console.error("❌ BotService: Error disconnecting:", err);
    }
  }

  // Reset kết nối: dừng, tạo mới và khởi động lại
  public async resetConnection(): Promise<void> {
    await this.stopConnection();
    this.createConnection();
    await this.startConnection();
  }

  /**
   * Đăng ký sự kiện nhận tin nhắn từ server.
   * Server gửi sự kiện "ReceiveMessage" với 2 tham số: sender và message.
   */
  public onMessageReceived(callback: (sender: string, content: string) => void): void {
    if (!this.hubConnection) return;
    // Hủy đăng ký sự kiện cũ để tránh trùng lặp
    this.hubConnection.off("ReceiveMessage");
    this.hubConnection.on("ReceiveMessage", (sender: string, message: string) => {
      console.log("📥 BotService: Received message from", sender, ":", message);
      callback(sender, message);
    });
  }

  /**
   * Gửi tin nhắn của user lên server qua SignalR.
   * Gọi method "SendMessage" của BotHub:
   *     public async Task SendMessage(int userId, string message)
   */
  public async sendMessageToBot(userId: number, content: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.warn("⚠️ BotService: Hub is not connected. Cannot send message. State:", this.hubConnection?.state);
      return;
    }
    try {
      console.log(`BotService: Sending message to bot. userId=${userId}, content=${content}`);
      await this.hubConnection.invoke("SendMessage", userId, content);
      console.log("✅ BotService: Message sent successfully.");
    } catch (err) {
      console.error("❌ BotService: Error sending message:", err);
    }
  }
}

const botService = new BotService();
export default botService;
