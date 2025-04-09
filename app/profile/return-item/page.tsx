"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import orderService from "@/services/order.service";
import { Order } from "@/types";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import Link from "next/link";

// BroadcastChannel for logout events
let bc: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  bc = new BroadcastChannel("funky-logout");
}

// Helper function for status badge styling
const getStatusColorClass = (status: string) => {
  switch (status) {
    case "Cancel":
      return "bg-red-100 text-red-500";
    case "Shipped":
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
  { label: "Hoàn thành", value: "Completed" },
  { label: "Đã trả hàng", value: "Cancel" },
];

export default function ReturnItemPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Completed");
  const [searchValue, setSearchValue] = useState("");

  // Listen for logout events
  useEffect(() => {
    if (bc) {
      bc.onmessage = (ev) => {
        if (ev.data === "logout") {
          setOrders([]);
        }
      };
    }
    return () => {
      if (bc) bc.onmessage = null;
    };
  }, []);

  // Function to fetch orders based on activeTab
  const fetchOrders = () => {
    const accountId = Number(getCookie("accountId"));
    if (!accountId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    setLoading(true);
    if (activeTab === "Completed") {
      orderService
        . getOrdersReturnByAccountId(accountId)
        .then((res) => {
          if (res.data.status) {
            setOrders(res.data.data);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch(() => toast.error("Có lỗi xảy ra khi lấy đơn hàng hoàn thành!"))
        .finally(() => setLoading(false));
    } else if (activeTab === "Cancel") {
      orderService
        .getOrdersByAccountId(accountId, "Cancel")
        .then((res) => {
          if (res.data.status) {
            setOrders(res.data.data);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch(() => toast.error("Có lỗi xảy ra khi lấy đơn hàng đã trả hàng!"))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, router]);

  // Filter orders by search value (orderId or product name)
  const filteredOrders = orders.filter((order) => {
    if (searchValue) {
      const inOrderId = order.orderId.toString().includes(searchValue);
      const inItems = order.items.some((item) =>
        item.productName.toLowerCase().includes(searchValue.toLowerCase())
      );
      return inOrderId || inItems;
    }
    return true;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1741405966/z6323749454613_8d6194817d47210d63f49e97d9b4ad22_oqwewn.jpg"
          alt="Loading..."
          className="w-16 h-16 animate-spin"
        />
      </div>
    );

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
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    className={`flex-1 text-center px-3 py-2 border text-sm ${
                      activeTab === tab.value ? "bg-black text-white" : "bg-white text-gray-600"
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
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <span className="absolute right-2 top-2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16h.01M12 16h.01M16 16h.01M9 20h6m-7-4v-2a4 4 0 114 4H8a4 4 0 01-4-4V6a4 4 0 014-4 4 4 0 014 4v2"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* Order list */}
            {filteredOrders.length === 0 ? (
              <p className="text-gray-500">Không có đơn hàng nào.</p>
            ) : (
              filteredOrders.map((order) => (
                // <Link key={order.orderId} href={`/profile/order/${order.orderId}`}>
                  <div className="border p-4 mb-4 bg-white space-y-3 cursor-pointer hover:bg-gray-50">
                    {/* Order header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-col text-gray-600">
                        <span className="text-sm">Đơn hàng #{order.orderId}</span>
                      </div>
                      <div>
                        <span
                          className={`border border-gray-300 px-2 py-1 text-sm font-medium ${getStatusColorClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 border-b pb-2 mb-2 last:border-none last:mb-0 last:pb-0"
                      >
                        <img
                          src={item.imageUrl || "https://via.placeholder.com/70x70?text=No+Image"}
                          alt={item.productName || "Sản phẩm"}
                          width={70}
                          height={70}
                          className="object-cover border"
                        />
                        <div className="flex-1 text-gray-700">
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-gray-500">
                            {item.priceAtPurchase.toLocaleString("vi-VN")}đ x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Order summary and buttons */}
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">
                        Tạm tính:{" "}
                        <span className="font-semibold text-gray-800">
                          {order.subTotal.toLocaleString("vi-VN")}đ
                        </span>
                      </p>
                      <div className="flex gap-2">
                        {order.status === "completed" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push("/profile/order/feedback");
                              }}
                              className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold"
                            >
                              Đánh giá
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profile/order/${order.orderId}`);
                              }}
                              className="bg-red-600 text-white px-4 py-2 text-sm font-semibold"
                            >
                              ĐỔI/ TRẢ HÀNG
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                // </Link>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
