"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import orderService from "@/services/order.service";
import { GetOrdersResponse, Order } from "@/types";

// Helper to map status to tailwind color classes
const getStatusColorClass = (status: string) => {
  switch (status) {
    case "Cancel":
      return "bg-red-100 text-red-500";
    case "Delivered":
      return "bg-green-100 text-green-500";
    case "Shipping":
      return "bg-blue-100 text-blue-500";
    case "Pending Confirmed":
      return "bg-yellow-100 text-yellow-500";
    case "Confirmed":
      return "bg-gray-100 text-gray-500";
    case "Completed":
      return "bg-purple-100 text-purple-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

const tabs = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xác nhận", value: "Pending Confirmed" },
  { label: "Đã xác nhận", value: "Confirmed" },
  { label: "Đang giao hàng", value: "Shipping" },
  { label: "Đã giao hàng", value: "Delivered" },
  { label: "Hoàn thành", value: "Completed" },
  { label: "Đã hủy", value: "Cancel" },
];

export default function OrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchValue, setSearchValue] = useState<string>("");
  const [showAll, setShowAll] = useState<boolean>(false);

  // Confirm received handler
  const handleConfirmReceived = (orderId: number) => {
    const accountId = Number(getCookie("accountId"));
    if (!accountId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }

    // call BE confirmReceive (assumes signature confirmReceive(orderId, changedBy))
    orderService
      .confirmReceive(orderId, accountId)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          fetchOrders(); // reload list
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => {
        toast.error("Có lỗi xảy ra khi xác nhận đơn hàng!");
      });
  };

  // Fetch orders based on active tab
  const fetchOrders = () => {
    const accountId = Number(getCookie("accountId"));
    if (!accountId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }

    setLoading(true);
    const apiCall =
      activeTab === "ALL"
        ? orderService.getAllOrdersByAccountId(accountId)
        : orderService.getOrdersByAccountId(accountId, activeTab);

    apiCall
      .then((res) => {
        if (res.data.status) {
          setOrders(res.data.data);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => {
        toast.error("Có lỗi xảy ra khi lấy đơn hàng!");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setShowAll(false);
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Filtering by search input
  const filtered = orders.filter((order) => {
    if (!searchValue) return true;
    const matchId = order.orderId.toString().includes(searchValue);
    const matchItem = order.items.some((i) =>
      i.productName.toLowerCase().includes(searchValue.toLowerCase())
    );
    return matchId || matchItem;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 5);

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 justify-center pt-20">
        <div className="container mx-auto flex gap-8 p-6">
          <Sidebar />
          <div className="flex-1 bg-white p-6 shadow-md">
            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex gap-2 flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    className={`px-3 py-2 border text-sm ${
                      activeTab === tab.value
                        ? "bg-black text-white"
                        : "bg-white text-gray-600"
                    }`}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
                  className="border border-gray-300 w-full pr-3 pl-3 py-2 text-sm focus:outline-none"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>

            {/* Order list */}
            {filtered.length === 0 ? (
              <p className="text-gray-500">Không có đơn hàng nào.</p>
            ) : (
              <>
                {displayed.map((order) => (
                  <Link
                    key={order.orderId}
                    href={`/profile/order/${order.orderId}`}
                  >
                    <div className="border p-4 mb-4 bg-white hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600">
                          Đơn hàng #{order.orderId}
                        </span>
                        <span
                          className={`px-2 py-1 text-sm font-medium border ${getStatusColorClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 border-b pb-2 mb-2 last:border-none last:mb-0"
                        >
                          <img
                            src={
                              item.imageUrl ||
                              "https://via.placeholder.com/70x70?text=No+Image"
                            }
                            alt={item.productName}
                            width={70}
                            height={70}
                            className="object-cover border"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-700">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Giá:{" "}
                              {item.priceAtPurchase.toLocaleString("vi-VN")}đ
                            </p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </p>
                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                              <span>Size: {item.size}</span>
                              <span className="flex items-center gap-1">
                                Color:
                                <span
                                  className="w-4 h-4 border inline-block"
                                  style={{ backgroundColor: item.color }}
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-gray-600">
                          Tạm tính:{" "}
                          <span className="font-semibold text-gray-800">
                            {order.subTotal.toLocaleString("vi-VN")}đ
                          </span>
                        </span>
                        <div className="flex gap-2">
                          {order.status === "Delivered" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmReceived(order.orderId);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded"
                            >
                              Đã nhận được hàng
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Xem thêm */}
                {filtered.length > 5 && !showAll && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowAll(true)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 text-sm rounded"
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
