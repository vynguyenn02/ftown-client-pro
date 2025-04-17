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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getCookie } from "cookies-next";
import { usePathname } from "next/navigation";
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
  setTransientNotifications: React.Dispatch<
    React.SetStateAction<NotificationItem[]>
  >;
  notificationCount: number;
}

const NotificationContext = createContext<
  NotificationContextProps | undefined
>(undefined);

export const NotificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // ——————————————————————————————————————————————
  // 1) State lưu cookie-accountId & token, khởi tạo khi mount
  // ——————————————————————————————————————————————
  const [accountId, setAccountId] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? (getCookie("accountId") as string) || null
      : null
  );
  const [token, setToken] = useState<string>(() =>
    typeof window !== "undefined" ? (getCookie("token") as string) || "" : ""
  );

  // State để lưu notifications
  const [persistentNotifications, setPersistentNotifications] = useState<
    NotificationItem[]
  >([]);
  const [transientNotifications, setTransientNotifications] = useState<
    NotificationItem[]
  >([]);

  // Dùng usePathname để phát hiện khi router thay đổi URL (sau login/logout)
  const pathname = usePathname();

  // ——————————————————————————————————————————————
  // 2) Theo dõi cookie thay đổi => cập nhật lại accountId & token
  // ——————————————————————————————————————————————
  useEffect(() => {
    const newAcc = (getCookie("accountId") as string) || null;
    const newTok = (getCookie("token") as string) || "";
    if (newAcc !== accountId) {
      setAccountId(newAcc);
    }
    if (newTok !== token) {
      setToken(newTok);
    }
  }, [pathname]);

  // ——————————————————————————————————————————————
  // 3) Khi thay đổi accountId => XÓA cũ, FETCH mới
  // ——————————————————————————————————————————————
  useEffect(() => {
    // clear cũ
    setPersistentNotifications([]);
    setTransientNotifications([]);

    if (!accountId) return;

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
          console.error("Fetch notifications failed:", res.message);
        }
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
      });
  }, [accountId]);

  // ——————————————————————————————————————————————
  // 4) Khi thay đổi token hoặc accountId => RESET SignalR connection
  // ——————————————————————————————————————————————
  useEffect(() => {
    if (!token || !accountId) return;

    notificationService
      .resetConnection()
      .then(() => {
        // luôn unregister rồi register handler
        notificationService.onNotificationReceived((title, message) => {
          const newNoti: NotificationItem = {
            title,
            message,
            receivedAt: new Date(),
          };
          setPersistentNotifications((prev) => [newNoti, ...prev]);
          setTransientNotifications((prev) => [newNoti, ...prev]);
        });
      })
      .catch((err) => {
        console.error("Error resetting SignalR connection:", err);
      });

    // cleanup khi unmount hoặc token/accountId thay đổi tiếp
    return () => {
      notificationService.stopConnection().catch(console.error);
    };
  }, [token, accountId]);

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

export const useNotification = (): NotificationContextProps => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return ctx;
};
