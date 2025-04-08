"use client";

import { useNotification } from "@/contexts/NotificationContextProps";
import { useEffect } from "react";

export default function NotificationWidget() {
  const { transientNotifications, setTransientNotifications } = useNotification();

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    transientNotifications.forEach((noti) => {
      const timer = setTimeout(() => {
        setTransientNotifications((prev) => prev.filter((item) => item !== noti));
      }, 60_000); // xoá sau 60 giây
      timers.push(timer);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [transientNotifications, setTransientNotifications]);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 space-y-3">
      {transientNotifications.slice(0, 3).map((noti, index) => (
        <div
          key={index}
          className="bg-white border shadow-md rounded p-4 animate-fade-in-down"
        >
          <div className="font-semibold text-black">{noti.title}</div>
          <div className="text-sm text-gray-700">{noti.message}</div>
          <div className="text-xs text-gray-400 mt-1">
            {noti.receivedAt.toLocaleTimeString("vi-VN")}
          </div>
        </div>
      ))}
    </div>
  );
}
