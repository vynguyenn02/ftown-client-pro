// app/layout.tsx
import "styles/tailwind.css";
import "styles/global.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import NotificationWidget from "@/components/NotificationWidget/NotificationWidget";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import theme from "@/styles/antd.styles";
import { NotificationProvider } from "@/contexts/NotificationContextProps";

export const metadata: Metadata = {
  title: {
    template: "%s | Funkytown",
    default: "Funkytown",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <NotificationProvider>
            <AntdRegistry>
              <ConfigProvider theme={theme}>
                {children}
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
