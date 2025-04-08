// "use client";

// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import notificationService from "@/services/notification.service";
// import { NotificationResponse } from "@/types";

// export interface NotificationItem {
//   title: string;
//   message: string;
//   receivedAt: Date;
// }

// interface NotificationContextProps {
//   notificationCount: number;
//   notifications: NotificationItem[];
//   setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
// }

// const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

// export const NotificationProvider = ({ children }: { children: ReactNode }) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);

//   useEffect(() => {
//     // 1. Lấy danh sách thông báo ban đầu từ API BE thông qua NotificationService
//     notificationService.fetchNotificationsByAccountId()
//       .then((res: NotificationResponse) => {
//         if (res.status) {
//           const mappedNotifications = res.data.map((item) => ({
//             title: item.title,
//             message: item.content, // BE truyền 'content' => FE dùng làm 'message'
//             receivedAt: new Date(item.createdDate),
//           }));
//           setNotifications(mappedNotifications);
//         } else {
//           console.error("Failed to fetch notifications:", res.message);
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching notifications:", err);
//       });

//     // 2. Khởi tạo kết nối SignalR và đăng ký sự kiện nhận thông báo mới
//     notificationService.startConnection();
//     notificationService.onNotificationReceived((title, message) => {
//       setNotifications((prev) => [
//         {
//           title,
//           message,
//           receivedAt: new Date(),
//         },
//         ...prev,
//       ]);
//     });
//   }, []);

//   return (
//     <NotificationContext.Provider
//       value={{
//         notificationCount: notifications.length,
//         notifications,
//         setNotifications,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotification = () => {
//   const context = useContext(NotificationContext);
//   if (context === undefined) {
//     throw new Error("useNotification must be used within a NotificationProvider");
//   }
//   return context;
// };
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCookie } from "cookies-next";
import notificationService from "@/services/notification.service";
import { NotificationResponse } from "@/types";

export interface NotificationItem {
  title: string;
  message: string;
  receivedAt: Date;
}

interface NotificationContextProps {
  persistentNotifications: NotificationItem[];
  transientNotifications: NotificationItem[];
  setTransientNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  notificationCount: number;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [persistentNotifications, setPersistentNotifications] = useState<NotificationItem[]>([]);
  const [transientNotifications, setTransientNotifications] = useState<NotificationItem[]>([]);

  // Fetch danh sách thông báo từ API (persistent)
  useEffect(() => {
    notificationService
      .fetchNotificationsByAccountId()
      .then((res: NotificationResponse) => {
        if (res.status) {
          const mapped = res.data.map((item) => ({
            title: item.title,
            message: item.content,
            receivedAt: new Date(item.createdDate),
          }));
          setPersistentNotifications(mapped);
        } else {
          console.error("Failed to fetch notifications:", res.message);
        }
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
      });
  }, []);

  // Khởi tạo SignalR và đăng ký realtime notifications
  useEffect(() => {
    notificationService.startConnection();
    notificationService.onNotificationReceived((title, message) => {
      const newNoti: NotificationItem = {
        title,
        message,
        receivedAt: new Date(),
      };
      // Cập nhật persistent (không tự xoá)
      setPersistentNotifications((prev) => [newNoti, ...prev]);
      // Đồng thời cập nhật transient (dùng cho toast)
      setTransientNotifications((prev) => [newNoti, ...prev]);
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notificationCount: persistentNotifications.length,
        persistentNotifications,
        transientNotifications,
        setTransientNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
