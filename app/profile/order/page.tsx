"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import orderService from "@/services/order.service";
import { Order } from "@/types";

// map status → tailwind
const getStatusColorClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "cancel":
      return "bg-red-100 text-red-500";
    case "delivered":
      return "bg-green-100 text-green-500";
    case "shipping":
      return "bg-blue-100 text-blue-500";
    case "pending confirmed":
      return "bg-yellow-100 text-yellow-500";
    case "confirmed":
      return "bg-gray-100 text-gray-500";
    case "completed":              // chỉ cần viết lowercase ở đây
      return "bg-purple-100 text-purple-500";
    case "return approved":
      return "bg-green-100 text-green-500";
    case "return rejected":
      return "bg-red-100 text-red-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
};
const formatStatus = (status: string) => {
  return status
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchValue, setSearchValue] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});
  
  const pollRef = useRef<NodeJS.Timeout>();

  const confirmStatuses = ["Pending Confirmed", "Paid", "Pending Payment"];

  // Fetch orders with spinner
  const fetchOrders = async () => {
    const accId = Number(getCookie("accountId"));
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await orderService.getAllOrdersByAccountId(accId, 1, 10);
      if (!res.data.status) {
        toast.error(res.data.message);
      } else {
        let data = res.data.data.items as Order[];
        if (activeTab === "ALL") {
          // no filter
        } else if (activeTab === "Pending Confirmed") {
          data = data.filter(o => confirmStatuses.includes(o.status));
        } else {
          data = data.filter(o => o.status === activeTab);
        }
        setOrders(data);
      }
    } catch {
      toast.error("Lấy đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Refresh orders without spinner (for polling)
  const refreshOrders = async () => {
    const accId = Number(getCookie("accountId"));
    if (!accId) return;
    try {
      const res = await orderService.getAllOrdersByAccountId(accId, 1, 10);
      if (res.data.status) {
        let data = res.data.data.items as Order[];
        if (activeTab === "ALL") {
        } else if (activeTab === "Pending Confirmed") {
          data = data.filter(o => confirmStatuses.includes(o.status));
        } else {
          data = data.filter(o => o.status === activeTab);
        }
        setOrders(data);
      }
    } catch {
      // silent fail
    }
  };

  // Confirm received
  const handleConfirmReceived = (orderId: number) => {
    const accId = Number(getCookie("accountId"));
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    orderService
      .confirmReceive(orderId, accId)
      .then(res => {
        if (res.data.status) {
          toast.success(res.data.message);
          fetchOrders();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Xác nhận thất bại"));
  };  

  // Cancel order
  const handleCancelOrder = (orderId: number) => {
    const accId = Number(getCookie("accountId"));
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    orderService
      .cancelOrder(orderId, accId)
      .then(res => {
        if (res.data.status) {
          toast.success(res.data.message);
          fetchOrders();         // reload lại danh sách
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Hủy đơn thất bại"));
  };

  // Tab change effect
  useEffect(() => {
    setShowAll(false);
    fetchOrders();
  }, [activeTab]);

  // Polling effect
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    const skipStatuses = ["completed", "cancel", "return requested", "return approved", "return rejected"];

    const poll = async () => {
      const toSync = orders.filter(
        o => o.ghnid && !skipStatuses.includes(o.status.toLowerCase())
      );
      await Promise.all(
        toSync.map(o => orderService.orderStatusNewest(o.ghnid))
      );
      refreshOrders();
    };

    poll();
    pollRef.current = setInterval(poll, 30_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orders, activeTab]);

  // Client-side filtering & pagination
  const filtered = orders.filter(o => {
    if (!searchValue) return true;
    return (
      o.orderId.toString().includes(searchValue) ||
      o.items.some(i =>
        i.productName.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  });
  const displayed = showAll ? filtered : filtered.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1741405966/z6323749454613_8d6194817d47210d63f49e97d9b4ad22_oqwewn.jpg"
          alt="Loading"
          className="w-16 h-16 animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto flex gap-8 p-6">
          <Sidebar />
          <div className="flex-1 bg-white p-6 shadow-md">
            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
              <div className="flex flex-wrap gap-2">
                {tabs.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setActiveTab(t.value)}
                    className={`px-3 py-2 border text-sm ${
                      activeTab === t.value
                        ? "bg-black text-white"
                        : "bg-white text-gray-600"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Tìm mã đơn hoặc tên sản phẩm…"
                className="border px-3 py-2 w-full md:w-64"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <p className="text-gray-500">Không có đơn hàng nào.</p>
            ) : (
              <> 
                {displayed.map(o => (
                  <Link key={o.orderId} href={`/profile/order/${o.orderId}`}>
                    <div className="border p-4 mb-4 bg-white hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between mb-3">
                        <span>Đơn hàng #{o.orderId}</span>
                        <span
                        className={`px-2 py-1 text-sm border ${getStatusColorClass(o.status)}`}
                      >
                        {formatStatus(o.status)}
                      </span>
                      </div>

                      {o.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 border-b pb-2 mb-2 last:border-none"
                        >
                          <img
                            src={it.imageUrl}
                            alt={it.productName}
                            className="w-16 h-16 object-cover border rounded"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{it.productName}</p>
                            <p className="text-sm text-gray-600">
                              Giá: {it.priceAtPurchase.toLocaleString("vi-VN")}₫ x {it.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Size: {it.size} – Color: 
                              <span
                                className="inline-block w-4 h-4 border rounded ml-1"
                                style={{ backgroundColor: it.color }}
                              />
                            </p>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-center mt-3">
                        <div className="mt-3 space-y-1">
                          <p className="text-gray-600">
                            Phí vận chuyển: {o.shippingCost.toLocaleString("vi-VN")}₫
                          </p>
                          <p className="text-gray-900">
                            Tổng: 
                            <strong>
                              {(o.subTotal + o.shippingCost).toLocaleString("vi-VN")}₫
                            </strong>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {o.status === "Delivered" && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleConfirmReceived(o.orderId);
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                            >
                              Đã nhận được hàng
                          </button>
                           )}
                           { o.status === "Pending Confirmed" && (
                           <button
                           onClick={e => {
                             e.stopPropagation();
                             e.preventDefault();
                             setConfirmMessage("Bạn có chắc chắn muốn hủy đơn hàng này?");
                             // gán callback thật
                             setOnConfirm(() => () => handleCancelOrder(o.orderId));
                             setShowConfirm(true);
                           }}
                           className="bg-red-600 text-white px-4 py-2 rounded text-sm"
                         >
                           Hủy Đơn
                         </button>
                         
                          ) }

                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {filtered.length > 5 && !showAll && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowAll(true)}
                      className="bg-gray-600 text-white px-6 py-2 rounded"
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
      {showConfirm && (
  <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full">
      <p className="text-gray-800">{confirmMessage}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
        >
          Không
        </button>
        <button
          onClick={() => {
            onConfirm();
            setShowConfirm(false);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Có
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
