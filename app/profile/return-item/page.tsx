"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import orderService from "@/services/order.service";
import { Order } from "@/types";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";

// BroadcastChannel cho sự kiện logout
let bc: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  bc = new BroadcastChannel("funky-logout");
}

// Type-guard: payload có pagination hay không
function isPagination<T>(obj: any): obj is { items: T[] } {
  return obj && typeof obj === "object" && Array.isArray(obj.items);
}

// Helper cho badge status
const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// 2. Sửa getStatusColorClass sử dụng toLowerCase()
const getStatusColorClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "cancel":
      return "bg-red-100 text-red-500";
    case "shipped":
      return "bg-green-100 text-green-500";
    case "shipping":
      return "bg-blue-100 text-blue-500";
    case "pending confirmed":
      return "bg-yellow-100 text-yellow-500";
    case "confirmed":
      return "bg-gray-100 text-gray-500";
    case "completed":
      return "bg-purple-100 text-purple-500";
    case "return requested":
      return "bg-indigo-100 text-indigo-500"; // nếu cần
    case "return approved":
      return "bg-green-100 text-green-500";
    case "return rejected":
      return "bg-red-100 text-red-500";
    case "processed":
      return "bg-gray-100 text-gray-500"; // ví dụ cho tab Đã xử lý
    default:
      return "bg-gray-100 text-gray-500";
  }
};
// Tabs: thêm tab 'Đã xử lý'
const tabs = [
  { label: "Hoàn thành",       value: "Completed" },
  { label: "Yêu cầu trả hàng", value: "Return Requested" },
  { label: "Đã xử lý",         value: "Processed" },
];

export default function ReturnItemPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Completed");
  const [searchValue, setSearchValue] = useState("");

  // Lắng nghe logout
  useEffect(() => {
    if (bc) {
      bc.onmessage = ev => {
        if (ev.data === "logout") {
          setOrders([]);
        }
      };
    }
    return () => { if (bc) bc.onmessage = null; };
  }, []);

  // Fetch orders cho cả ba tab
  const fetchOrders = async () => {
    const accountId = Number(getCookie("accountId"));
    if (!accountId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      let list: Order[] = [];

      if (activeTab === "Completed") {
        const res = await orderService.getOrdersReturnByAccountId(accountId);
        if (res.data.status) {
          const payload = res.data.data;
          list = isPagination<Order>(payload) ? payload.items : payload as Order[];
        }
      } else if (activeTab === "Return Requested") {
        const res = await orderService.getOrdersByAccountId(accountId, "Return Requested");
        if (res.data.status) {
          const payload = res.data.data;
          list = isPagination<Order>(payload) ? payload.items : payload as Order[];
        }
      } else if (activeTab === "Processed") {
        // Lấy cả Return Approved và Return Rejected
        const [approvedRes, rejectedRes] = await Promise.all([
          orderService.getOrdersByAccountId(accountId, "Return Approved"),
          orderService.getOrdersByAccountId(accountId, "Return Rejected"),
        ]);

        if (approvedRes.data.status && rejectedRes.data.status) {
          const approvedData = approvedRes.data.data;
          const rejectedData = rejectedRes.data.data;

          const approvedItems = isPagination<Order>(approvedData)
            ? approvedData.items
            : approvedData as Order[];
          const rejectedItems = isPagination<Order>(rejectedData)
            ? rejectedData.items
            : rejectedData as Order[];

          list = [...approvedItems, ...rejectedItems];
        }
      }

      setOrders(list);
    } catch {
      toast.error("Có lỗi xảy ra khi lấy đơn hàng!");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Khi đổi tab hoặc router thay đổi
  useEffect(() => {
    fetchOrders();
  }, [activeTab, router]);

  // Lọc theo mã đơn hoặc tên sản phẩm
  const filteredOrders = orders.filter(order => {
    if (!searchValue) return true;
    const inId = order.orderId.toString().includes(searchValue);
    const inName = order.items.some(item =>
      item.productName.toLowerCase().includes(searchValue.toLowerCase())
    );
    return inId || inName;
  });

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
            {/* Search + Tabs */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.value}
                    className={`flex-1 text-center px-3 py-2 border text-sm ${
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
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
                  className="border border-gray-300 w-full pr-8 pl-3 py-2 text-sm focus:outline-none"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                />
                <span className="absolute right-2 top-2 text-gray-400">🔍</span>
              </div>
            </div>

            {/* Danh sách đơn */}
            {filteredOrders.length === 0 ? (
              <p className="text-gray-500">Không có đơn hàng nào.</p>
            ) : (
              filteredOrders.map(order => (
                <div
                  key={order.orderId}
                  className="border p-4 mb-4 bg-white space-y-3 hover:bg-gray-50 cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                          <span className="text-gray-600">Đơn hàng #{order.orderId}</span>
                          <span
                    className={`border px-2 py-1 text-sm font-medium ${getStatusColorClass(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>

                  </div>

                  {/* Items */}
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 border-b pb-2 mb-2 last:border-none"
                    >
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/70"}
                        alt={item.productName || "Sản phẩm"}
                        className="w-16 h-16 object-cover border"
                      />
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-gray-500">
                          {item.priceAtPurchase.toLocaleString("vi-VN")}₫ x {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} – Color:{" "}
                          <span
                            className="inline-block w-4 h-4 border rounded ml-1"
                            style={{ backgroundColor: item.color }}
                          />
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Summary & Actions */}
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-gray-600">
                        Phí ship: {order.shippingCost.toLocaleString("vi-VN")}₫
                      </p>
                      <p className="text-gray-900">
                        Tổng:{" "}
                        <strong className="text-gray-800">
                          {(order.subTotal + order.shippingCost).toLocaleString("vi-VN")}₫
                        </strong>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {/* Chỉ show nút đổi/trả với đơn đã hoàn thành */}
                      {order.status.toLowerCase() === "completed" && (
                        <button
                          onClick={() => router.push(`/profile/order/${order.orderId}`)}
                          className="bg-red-600 text-white px-4 py-2 text-sm rounded"
                        >
                          ĐỔI/ TRẢ HÀNG
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
