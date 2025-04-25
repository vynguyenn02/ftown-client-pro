"use client";

import { getCookie } from "cookies-next";
import * as signalR from "@microsoft/signalr";

// URL của hub chat
const CHAT_HUB_URL = "https://ftbotservicee.azurewebsites.net/bothub";

class BotService {
  private hubConnection: signalR.HubConnection | null = null;
  private isStarting: boolean = false;

  constructor() {
    this.createConnection();
  }

  /**
   * Tạo mới hoặc tái tạo đối tượng HubConnection
   */
  private createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => {
          const token = getCookie("token");
          return typeof token === "string" ? token : "";
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  /**
   * Bắt đầu kết nối nếu đang ở trạng thái Disconnected
   */
  public async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      this.createConnection();
    }
    const conn = this.hubConnection!;
    const state = conn.state;

    if (state === signalR.HubConnectionState.Connected) {
      console.log("BotService: Đã kết nối, bỏ qua start");
      return;
    }
    if (state === signalR.HubConnectionState.Connecting || this.isStarting) {
      console.log("BotService: Đang kết nối, bỏ qua start");
      return;
    }
    if (state === signalR.HubConnectionState.Disconnecting) {
      console.log(" BotService: Đang ngắt kết nối, chờ stop xong...");
      try { await conn.stop(); } catch {}
    }

    this.isStarting = true;
    try {
      console.log("BotService: Bắt đầu kết nối...");
      await conn.start();
      console.log("BotService: Kết nối thành công. Trạng thái:", conn.state);
    } catch (err: any) {
      const msg = err?.message ?? err;
      console.error("BotService: Lỗi khi kết nối:", msg);
      if (msg.includes("Handshake was canceled")) {
        console.warn("Handshake bị hủy, thử lại sau 2s");
        setTimeout(() => this.startConnection(), 2000);
      } else {
        setTimeout(() => this.startConnection(), 5000);
      }
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Ngắt kết nối nếu đang Connected
   */
  public async stopConnection(): Promise<void> {
    if (!this.hubConnection) return;
    const conn = this.hubConnection;
    if (conn.state !== signalR.HubConnectionState.Connected) {
      console.log("BotService: Chưa kết nối, bỏ qua stop. Trạng thái:", conn.state);
      return;
    }
    try {
      console.log("🔌 BotService: Ngắt kết nối...");
      await conn.stop();
      console.log("BotService: Ngắt xong. Trạng thái:", conn.state);
    } catch (err) {
      console.error("BotService: Lỗi khi ngắt:", err);
    }
  }

  /**
   * Đăng ký handler cho sự kiện ReceiveMessage
   */
  public onMessageReceived(callback: (sender: string, message: string) => void) {
    if (!this.hubConnection) return;
    // Bỏ handler cũ rồi đăng ký lại để tránh nhân đôi
    this.hubConnection.off("ReceiveMessage");
    this.hubConnection.on("ReceiveMessage", (sender: string, message: string) => {
      callback(sender, message);
    });
  }

  /**
   * Gửi tin nhắn đến server chỉ khi đã kết nối
   */
  public async sendMessageToBot(userId: number, content: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.warn("BotService: Chưa kết nối, không thể gửi. Trạng thái:", this.hubConnection?.state);
      return;
    }
    try {
      await this.hubConnection.invoke("SendMessage", userId, content);
    } catch (err) {
      console.error("BotService: Lỗi khi gửi tin nhắn:", err);
    }
  }
}

const botService = new BotService();
export default botService;
