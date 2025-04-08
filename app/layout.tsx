"use client"; // 👈 thêm dòng này nếu bạn cần toàn bộ là Client Component

import "styles/tailwind.css";
import "styles/global.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { Toaster } from "react-hot-toast";
import NotificationWidget from "@/components/NotificationWidget/NotificationWidget";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import theme from "@/styles/antd.styles";
import { NotificationProvider } from "@/contexts/NotificationContextProps";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <NotificationProvider>
            <AntdRegistry>
              <ConfigProvider theme={theme}>
                <Suspense fallback={<div className="p-8 text-center">Loading app...</div>}>
                  {children}
                </Suspense>
                <NotificationWidget />
              </ConfigProvider>
              <Toaster toastOptions={{ duration: 3000 }} />
            </AntdRegistry>
          </NotificationProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
