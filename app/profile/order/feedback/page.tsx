"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";

import orderService from "@/services/order.service";
import feedbackService from "@/services/feedback.service";
import { GetReturnItemResponse, ReturnData } from "@/types";

// Dữ liệu feedback trên FE
type FeedbackData = {
  orderDetailId: number;
  productId: number;
  productVariantId: number;
  Title: string;
  rating: number;
  comment: string;
  imageFile: File | null;
};

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("orderId");
  const orderId = rawOrderId ? Number(rawOrderId) : null;

  const [items, setItems] = useState<ReturnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);

  // Lấy danh sách sản phẩm cần đánh giá
  useEffect(() => {
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    if (!orderId) {
      toast.error("Thiếu orderId trên URL!");
      router.push("/profile/order");
      return;
    }

    orderService
      .getOrdersReturnRequest(Number(accId), orderId)
      .then((res) => {
        if (res.data.status) {
          setItems(res.data.data);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        console.error("Error fetching items for feedback:", err);
        toast.error("Có lỗi khi lấy sản phẩm!");
      })
      .finally(() => setLoading(false));
  }, [orderId, router]);

  // Khởi tạo feedbacks khi items thay đổi
  useEffect(() => {
    if (items.length) {
      const init = items.map((item) => ({
        orderDetailId: item.orderDetailId,
        productId: item.productId,
        productVariantId: item.productVariantId,
        Title: item.productName,
        rating: 0,
        comment: "",
        imageFile: null,
      }));
      setFeedbacks(init);
    }
  }, [items]);

  const handleRatingChange = (variantId: number, value: number) => {
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.productVariantId === variantId ? { ...fb, rating: value } : fb
      )
    );
  };

  const handleCommentChange = (variantId: number, value: string) => {
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.productVariantId === variantId ? { ...fb, comment: value } : fb
      )
    );
  };

  const handleImageChange = (
    variantId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.productVariantId === variantId ? { ...fb, imageFile: file } : fb
      )
    );
  };

  // Gửi feedback bằng multipart/form-data
  const handleSubmitAllFeedback = async () => {
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    feedbacks.forEach((fb, idx) => {
      formData.append(
        `feedbacks[${idx}].orderDetailId`,
        fb.orderDetailId.toString()
      );
      formData.append(`feedbacks[${idx}].accountId`, accId);
      formData.append(
        `feedbacks[${idx}].productId`,
        fb.productId.toString()
      );
      formData.append(`feedbacks[${idx}].Title`, fb.Title);
      formData.append(
        `feedbacks[${idx}].rating`,
        fb.rating.toString()
      );
      formData.append(`feedbacks[${idx}].comment`, fb.comment);
      formData.append(
        `feedbacks[${idx}].createdDate`,
        new Date().toISOString()
      );
      if (fb.imageFile) {
        formData.append(
          `feedbacks[${idx}].imageFile`,
          fb.imageFile
        );
      }
    });

    console.log("Submitting FormData:", Array.from(formData.entries()));
    try {
      const res = await feedbackService.createFeedback(formData);
      console.log("Feedback submission response:", res);
      if (res.data.status) {
        toast.success(res.data.message);
        router.push("/profile/order");
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá!");
    }
  };

  if (loading) {
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 pt-20">
        <div className="container mx-auto flex gap-4 p-6">
          <Sidebar />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h1>
            {items.length === 0 ? (
              <p className="text-gray-500">
                Không có sản phẩm nào để đánh giá.
              </p>
            ) : (
              <div className="space-y-6">
                {feedbacks.map((fb) => {
                  const item = items.find(
                    (i) => i.productVariantId === fb.productVariantId
                  );
                  if (!item) return null;
                  return (
                    <div
                      key={fb.productVariantId}
                      className="border p-4 bg-white rounded"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={
                            item.imageUrl ||
                            "https://via.placeholder.com/70x70?text=No+Image"
                          }
                          alt={item.productName}
                          className="w-16 h-16 object-cover border rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.priceAtPurchase.toLocaleString("vi-VN")}₫ x{" "}
                            {item.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            Size: {item.size} - Màu:{" "}
                            <span
                              className="inline-block w-4 h-4 border ml-1 align-middle"
                              style={{ backgroundColor: item.color }}
                            />
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 flex items-center">
                        <p className="mr-4">Đánh giá:</p>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() =>
                              handleRatingChange(item.productVariantId, value)
                            }
                            className={`text-3xl mx-1 transition-transform duration-200 ${
                              fb.rating >= value
                                ? "text-yellow-400 hover:scale-125"
                                : "text-gray-300 hover:scale-110"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Nhận xét:
                        </label>
                        <textarea
                          className="w-full border p-2 text-sm focus:outline-none focus:border-blue-400"
                          rows={3}
                          placeholder="Viết nhận xét..."
                          value={fb.comment}
                          onChange={(e) =>
                            handleCommentChange(
                              item.productVariantId,
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Tải lên hình ảnh (tùy chọn):
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(item.productVariantId, e)
                          }
                        />
                        {fb.imageFile && (
                          <p className="text-sm text-green-600 mt-1">
                            {fb.imageFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {items.length > 0 && (
              <div className="text-right mt-6">
                <button
                  onClick={handleSubmitAllFeedback}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-3 text-sm font-semibold transition-colors"
                >
                  Gửi đánh giá
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
