"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ReturnCheckOutResponse, SubmitReturnRequest } from "@/types";
import orderService from "@/services/order.service";

// Khởi tạo BroadcastChannel để lắng nghe sự kiện "logout"
let bc: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  bc = new BroadcastChannel("funky-logout");
}

export default function ReturnCommitPage() {
  const router = useRouter();

  // Data từ localStorage
  const [returnCheckoutData, setReturnCheckoutData] = useState<ReturnCheckOutResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Các field trong form
  const [reason, setReason] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [refundOption, setRefundOption] = useState(""); // "Đổi hàng" hoặc "Hoàn tiền"
  const [refundMethod, setRefundMethod] = useState("Hoàn tiền qua ngân hàng");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [email, setEmail] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  // Lắng nghe logout qua BroadcastChannel
  useEffect(() => {
    if (bc) {
      bc.onmessage = (ev) => {
        if (ev.data === "logout") {
          setReturnCheckoutData(null);
          router.push("/login");
        }
      };
    }
    return () => {
      if (bc) bc.onmessage = null;
    };
  }, [router]);

  // Load dữ liệu từ localStorage
  useEffect(() => {
    const data = localStorage.getItem("returnCheckoutData");
    if (data) {
      try {
        const parsed = JSON.parse(data) as ReturnCheckOutResponse;
        setReturnCheckoutData(parsed);
      } catch (err) {
        console.error("Error parsing data:", err);
        toast.error("Dữ liệu trả hàng không hợp lệ!");
        router.push("/profile/return-item");
      }
    } else {
      toast.error("Không tìm thấy dữ liệu trả hàng!");
      router.push("/profile/return-item");
    }
    setLoading(false);
  }, [router]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;   // tránh null
    const selected = Array.from(files);
    setMediaFiles(prev => [...prev, ...selected]);
  };

  const handleSubmit = async () => {
    if (!returnCheckoutData) return;

    const payload: SubmitReturnRequest = {
      returnCheckoutSessionId: returnCheckoutData.returnCheckoutSessionId,
      email,
      returnReason: reason,
      returnOption: refundOption,
      returnDescription: reasonDetail,
      refundMethod,
      bankName,
      bankAccountName,
      bankAccountNumber,
      mediaFiles,
    };

    try {
      const res = await orderService.submitReturnRequest(payload);
      if (res.data.status) {
        toast.success(res.data.message || "Tạo yêu cầu trả hàng thành công!");
        router.push("/profile/return-item");
      } else {
        toast.error(res.data.message || "Tạo yêu cầu trả hàng thất bại!");
      }
    } catch (err: any) {
      console.error("Submit return request error:", err);
      toast.error("Có lỗi xảy ra khi gửi yêu cầu trả hàng!");
    }
  };

  if (loading || !returnCheckoutData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1741405966/z6323749454613_8d6194817d47210d63f49e97d9b4ad22_oqwewn.jpg"
          alt="Loading..."
          className="w-16 h-16 animate-spin"
        />
      </div>
    );
  }

  const totalRefund = returnCheckoutData.totalRefundAmount;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 pt-28 pb-10 px-6">
        <div className="container mx-auto flex gap-8">
          <Sidebar />

          <div className="flex-1 bg-white shadow-md p-6">
            {/* Sản phẩm đã chọn */}
            <h2 className="text-lg font-semibold mb-3">Sản phẩm đã chọn</h2>
            {returnCheckoutData.returnItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/70x70?text=No+Image"}
                    alt={item.productName}
                    className="w-16 h-16 border object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-700">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {item.size} -{" "}
                      <span
                        className="inline-block w-4 h-4 border border-gray-300"
                        style={{ backgroundColor: item.color }}
                      />
                    </p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-gray-700 font-semibold">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </p>
              </div>
            ))}

            {/* Lý do trả/đổi */}
            <div className="mt-6 border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Chọn lý do</h2>
              <select
                className="border px-3 py-2 w-full md:w-1/2"
                value={reason}
                onChange={e => setReason(e.target.value)}
              >
                <option value="">Chọn lý do</option>
                {returnCheckoutData.returnReasons.map((rs, i) => (
                  <option key={i} value={rs}>{rs}</option>
                ))}
              </select>
              <textarea
                className="border px-3 py-2 w-full md:w-2/3 h-20 resize-none mt-4"
                maxLength={2000}
                value={reasonDetail}
                onChange={e => setReasonDetail(e.target.value)}
                placeholder="Nhập chi tiết lý do..."
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {reasonDetail.length} / 2000
              </div>
            </div>

            {/* Phương án trả hàng */}
            <div className="mt-6 border-b pb-4">
              <h2 className="text-lg font-semibold mb-3">Phương án</h2>
              <div className="flex items-center gap-6">
                {returnCheckoutData.returnOptions.map((opt, idx) => (
                  <label key={idx} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="returnOption"
                      className="mr-2"
                      value={opt}
                      checked={refundOption === opt}
                      onChange={() => setRefundOption(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Chỉ hiển thị khi chọn "Hoàn tiền" */}
            {refundOption === "Hoàn tiền" && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">Thông tin hoàn tiền</h2>
                <p className="text-gray-600 mb-2">
                  Số tiền tạm tính:{" "}
                  <span className="font-semibold">{totalRefund.toLocaleString("vi-VN")}₫</span>
                </p>

                {/* Thông tin ngân hàng */}
                <div className="flex flex-col md:flex-row gap-4 mt-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên ngân hàng
                    </label>
                    <input
                      type="text"
                      className="border px-3 py-2 w-full"
                      placeholder="VD: Vietcombank"
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chủ tài khoản
                    </label>
                    <input
                      type="text"
                      className="border px-3 py-2 w-full"
                      placeholder="VD: Nguyen Van A"
                      value={bankAccountName}
                      onChange={e => setBankAccountName(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      className="border px-3 py-2 w-full"
                      placeholder="VD: 0123456789"
                      value={bankAccountNumber}
                      onChange={e => setBankAccountNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email nhận thông báo (nếu cần) */}
                <div className="flex flex-col md:flex-row gap-4 mt-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (nếu cần nhận thông báo)
                    </label>
                    <input
                      type="email"
                      className="border px-3 py-2 w-full"
                      placeholder="VD: abc@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Upload hình ảnh/video */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tải lên hình ảnh/video
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="border px-3 py-2 w-full md:w-2/3"
                onChange={handleFileChange}
              />
            </div>

            {/* Nút Hoàn thành */}
            <div className="text-right mt-6">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-black text-white font-semibold rounded"
              >
                Hoàn thành
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
