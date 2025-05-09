"use client";

import { useEffect, useState } from "react";
import storeService from "@/services/store.service";
import { Store } from "@/types";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function ContactPage() {
  
  const [stores, setStores] = useState<Store[]>([]);
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await storeService.getAllStores(); 
        // Vì response.data là một object có key "data" chứa mảng cửa hàng,
        // nên ta cần lấy response.data.data để set state
        console.log("Store data:", response.data);
        setStores(response.data.data);
      } catch (error) {
        console.error("Error fetching store data:", error);
      }
    };
  
    fetchStores();
  }, []);
  

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-6 pt-20 lg:px-20">
        {/* Tiêu đề */}
        <h1 className="mb-10 text-center text-3xl font-bold"></h1>

        {/* Danh sách cửa hàng */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {stores.map((store) => (
            <StoreCard
              key={store.storeId}
              name={store.storeName}
              address={store.location}
              imageUrl={store.imagePath}
            />
          ))}
        </div>

        {/* Thông tin liên hệ & Form */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Thông tin liên hệ */}
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Thông tin liên hệ</h2>
            <ContactInfo label="Hotline" value="1900 123456" />
            <ContactInfo label="Instagram" value="funkytown.gallery" />
            <ContactInfo label="Facebook" value="Funky Town" />
            <ContactInfo label="Shopee" value="funkytown.gallery" />
            <ContactInfo label="Email tuyển dụng" value="hr@funkytown.vn" />
          </div>

          {/* Form liên hệ */}
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* Component hiển thị thông tin cửa hàng */
function StoreCard({ name, address, imageUrl }: { name: string; address: string; imageUrl: string }) {
  return (
    <div className="overflow-hidden border shadow-md">
      <img src={imageUrl} alt={name} className="h-64 w-full object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-gray-600">{address}</p>
        <button className="mt-4 bg-[#222222B3] px-4 py-2 text-white">Xem cửa hàng</button>
      </div>
    </div>
  );
}

/* Component hiển thị một dòng thông tin liên hệ */
function ContactInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <p className="font-semibold">{label}</p>
      <p className="text-gray-600">{value}</p>
    </div>
  );
}

/* Form liên hệ */
function ContactForm() {
  return (
    <form className="bg-gray-100 p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Gửi một lời nhắn</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium">Tên</label>
        <input type="text" className="w-full border p-2" placeholder="Nhập tên của bạn" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Email *</label>
        <input type="email" className="w-full border p-2" placeholder="Nhập email của bạn" required />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Số điện thoại</label>
        <input type="tel" className="w-full border p-2" placeholder="Nhập số điện thoại" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Bình luận</label>
        <textarea className="w-full border p-2" placeholder="Nhập bình luận của bạn" rows={4}></textarea>
      </div>
      <button type="submit" className="w-full bg-[#222222B3] py-2 text-white">
        Gửi tin nhắn
      </button>
    </form>
  );
}
