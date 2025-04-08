"use client";
import { getCookie } from "cookies-next";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { NotificationResponse } from "@/types";
// Sử dụng base URL của API (port 443)
const SIGNALR_HUB_URL = "https://localhost:7270/notificationHub";

// Kiểu dữ liệu trả về từ API BE
class NotificationService {
  private hubConnection: signalR.HubConnection | null = null;

  constructor() {
    this.createConnection();
  }

  // Tạo mới connection từ đầu với token hiện tại
  private createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => {
          const token = getCookie("token");
          console.log("accessTokenFactory: token =", token);
          return typeof token === "string" ? token : "";
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    console.log("NotificationService: hubConnection created.");
  }

  // Khởi động connection, nếu connection không ở trạng thái Disconnected thì dừng trước khi start lại
  public async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      this.createConnection();
    }
    if (this.hubConnection!.state !== signalR.HubConnectionState.Disconnected) {
      console.warn(
        "⚠️ SignalR is not in Disconnected state. Current:",
        this.hubConnection!.state,
        "Stopping connection first..."
      );
      await this.stopConnection();
    }

    try {
      console.log("NotificationService: Starting connection...");
      await this.hubConnection!.start();
      console.log("✅ SignalR connection established. State:", this.hubConnection!.state);
    } catch (err) {
      console.error("❌ Error starting SignalR connection:", err);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  // Dừng connection nếu đang kết nối
  public async stopConnection(): Promise<void> {
    if (!this.hubConnection) return;

    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.log("ℹ️ Hub is not connected. Skip stop. Current state:", this.hubConnection.state);
      return;
    }

    try {
      console.log("NotificationService: Stopping connection...");
      await this.hubConnection.stop();
      console.log("🔌 SignalR disconnected. State:", this.hubConnection.state);
    } catch (err) {
      console.error("❌ Error disconnecting SignalR:", err);
    }
  }

  // Reset connection: dừng connection cũ, tạo mới và khởi động lại
  public async resetConnection(): Promise<void> {
    console.log("NotificationService: Resetting connection...");
    await this.stopConnection();
    this.createConnection();
    await this.startConnection();
  }

  // Đăng ký sự kiện nhận thông báo từ SignalR
  public onNotificationReceived(callback: (title: string, message: string) => void): void {
    const connection = this.hubConnection;
    if (!connection) return;
    connection.off("ReceiveNotification");
    console.log("NotificationService: Registering ReceiveNotification handler.");
    connection.on("ReceiveNotification", (title: string, message: string) => {
      console.log("🔔 Received notification in service:", title, message);
      callback(title, message);
    });
  }

  // Gửi thông báo đến user cụ thể qua SignalR
  public async sendNotificationTo(userId: string, title: string, message: string): Promise<void> {
    const connection = this.hubConnection;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.warn("⚠️ Hub is not connected. Cannot send notification. Current state:", connection?.state);
      return;
    }

    try {
      console.log("NotificationService: Sending notification to userId:", userId, title, message);
      await connection.invoke("SendNotification", userId, title, message);
      console.log("✅ Notification sent successfully.");
    } catch (err) {
      console.error("❌ Error sending notification:", err);
    }
  }

  // Phương thức fetch danh sách thông báo từ API BE dựa trên accountId (đổi thành userId)
  public async fetchNotificationsByAccountId(): Promise<NotificationResponse> {
    const accountId = getCookie("accountId");
    if (!accountId) {
      throw new Error("Không tìm thấy cookie accountId");
    }
    try {
      const response = await axios.get<NotificationResponse>(
        `https://localhost:7270/api/notifications/user/${accountId}`
      );
      console.log("NotificationService: Fetched notifications:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      throw err;
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
