"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import orderService from "@/services/order.service";
import { OrderDetailData } from "@/types";
import { getCookie } from "cookies-next";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawOrderId = params?.orderId;

  if (!rawOrderId || Array.isArray(rawOrderId)) {
    toast.error("Order ID không hợp lệ!");
    return null;
  }
  const orderId = parseInt(rawOrderId, 10);
  if (isNaN(orderId)) {
    toast.error("Order ID không hợp lệ!");
    return null;
  }

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      // Lấy accountId từ cookie
      const rawAcc = getCookie("accountId");
      const accountId = rawAcc
        ? Number(Array.isArray(rawAcc) ? rawAcc[0] : rawAcc)
        : undefined;

      if (!accountId) {
        toast.error("Thiếu accountId. Vui lòng đăng nhập lại!");
        setLoading(false);
        return;
      }

      try {
        const res = await orderService.getOrderDetailByOrderId(
          orderId,
          accountId
        );
        if (res.data.status) {
          setOrder(res.data.data);
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        console.error("Error fetching order detail:", error);
        toast.error("Có lỗi xảy ra khi lấy chi tiết đơn hàng!");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

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

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <div className="container mx-auto p-6">
            <p className="text-gray-500">Không tìm thấy đơn hàng hoặc đã bị xóa.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPayment = order.orderTotal + order.shippingCost;

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto flex gap-8 p-6">
          <Sidebar />

          <div className="flex-1 space-y-4">
            <div className="bg-white p-4 shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">
                  Đơn hàng{" "}
                  {new Date(order.createdDate).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  {new Date(order.createdDate).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  #{order.orderId}
                </h2>
                <span className="text-green-500 text-sm">{order.status}</span>
              </div>
              <p className="text-sm text-gray-500">
                Rất mong được phục vụ bạn trong lần tới.
              </p>
            </div>

            <div className="bg-white p-4 shadow">
              <h3 className="text-md font-semibold mb-3">Thông tin nhận hàng</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Tên người nhận:</span>{" "}
                  {order.fullName || "Chưa có"}
                </p>
                <p>
                  <span className="font-medium">SĐT:</span>{" "}
                  {order.phoneNumber || "Chưa có"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.email || "Chưa có"}
                </p>
                <p>
                  <span className="font-medium">Địa chỉ:</span>{" "}
                  {order.address}, {order.district}, {order.city},{" "}
                  {order.province}, {order.country}
                </p>
                <p>
                  <span className="font-medium">Phương thức thanh toán:</span>{" "}
                  {order.paymentMethod || "Chưa có"}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 shadow">
              <h3 className="text-md font-semibold mb-3">Danh sách sản phẩm</h3>
              {order.orderItems.map((item) => {
                const totalItemPrice = item.priceAtPurchase * item.quantity;
                return (
                  <div
                    key={item.productVariantId}
                    onClick={() => router.push(`/product/${item.productId}`)}
                    className="flex items-center gap-4 mb-4 border-b last:border-none pb-4 cursor-pointer hover:bg-gray-50"
                  >
                    <img
                      src={
                        item.imageUrl ||
                        "https://via.placeholder.com/70x70?text=No+Image"
                      }
                      alt={item.productName}
                      className="w-16 h-16 object-cover border rounded"
                    />
                    <div className="text-sm flex-1">
                      <p className="font-medium text-gray-800">
                        {item.productName}
                      </p>
                      <p className="text-gray-600">Size: {item.size}</p>
                      <p className="text-gray-600 flex items-center">
                        Màu:{" "}
                        <span
                          className="ml-2 inline-block w-4 h-4 border"
                          style={{ backgroundColor: item.color }}
                        />
                      </p>
                      <p className="text-gray-600">
                        Giá: {item.priceAtPurchase.toLocaleString("vi-VN")}₫ x{" "}
                        {item.quantity}
                      </p>
                      <p className="text-gray-800 font-semibold">
                        Thành tiền: {totalItemPrice.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-4 shadow space-y-4">
              <div>
                <h3 className="text-md font-semibold mb-3">
                  Tổng thanh toán
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{order.orderTotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí ship</span>
                    <span>{order.shippingCost.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 mt-2">
                    <span>Tổng cộng</span>
                    <span>{totalPayment.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>
              </div>

              {order.status.toLowerCase() === "completed" ? (
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const accId = getCookie("accountId")?.toString() || "";
                      router.push(
                        `/profile/order/feedback?orderId=${order.orderId}&accountId=${accId}`
                      );
                    }}
                    disabled={order.isFeedback}
                    className={`px-4 py-2 text-sm font-semibold rounded
                      ${order.isFeedback
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {order.isFeedback ? "Đã đánh giá" : "Đánh giá"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/profile/return-item/request?orderId=${order.orderId}`
                      );
                    }}
                    className="bg-red-600 text-white px-4 py-2 text-sm font-semibold rounded"
                  >
                    Đổi/Trả hàng
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push("/product")}
                    className="bg-green-600 text-white px-4 py-2 text-sm font-semibold rounded"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
