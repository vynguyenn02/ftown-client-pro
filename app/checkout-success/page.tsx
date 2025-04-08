"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function CheckoutSuccess() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/"); 
    }, 5000);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 justify-center items-center">
        <div className="text-center bg-white shadow-lg p-6 ">
          <h2 className="text-2xl font-bold text-graygray-600">Thanh toán thành công!</h2>
          <p className="text-lg text-gray-600 mt-2">Đơn hàng của bạn đã được xác nhận.</p>
          <img 
            src="/success-icon.png" 
            alt="Success" 
            className="w-20 h-20 mx-auto mt-4"
          />
          <p className="text-gray-500 mt-2">Bạn sẽ được chuyển về trang chủ sau vài giây...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
