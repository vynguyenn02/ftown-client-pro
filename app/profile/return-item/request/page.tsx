"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import orderService from "@/services/order.service";
import { ReturnData, CreateCheckoutRequest } from "@/types";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function ReturnRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("orderId");
  const orderId = rawOrderId ? Number(rawOrderId) : null;

  const [returnItems, setReturnItems] = useState<
    (ReturnData & { isSelected: boolean; maxQuantity: number; currentQuantity: number })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturnItems = async () => {
      if (!orderId || isNaN(orderId)) {
        toast.error("Order ID không hợp lệ");
        router.push("/profile/return-item");
        return;
      }
      const accId = getCookie("accountId");
      if (!accId) {
        toast.error("Bạn chưa đăng nhập!");
        router.push("/login");
        return;
      }
      const accountId = Number(accId);
      try {
        const res = await orderService.getOrdersReturnRequest(accountId, orderId);
        if (res.data.status) {
          const items = res.data.data.map((item: ReturnData) => ({
            ...item,
            isSelected: false,
            maxQuantity: item.quantity,
            currentQuantity: 1,
          }));
          setReturnItems(items);
        } else {
          toast.error(res.data.message);
        }
      } catch (err: any) {
        console.error("Error fetching return items:", err);
        toast.error("Có lỗi xảy ra khi lấy sản phẩm trả hàng!");
      } finally {
        setLoading(false);
      }
    };

    fetchReturnItems();
  }, [orderId, router]);

  const handleCheckboxChange = (productVariantId: number, checked: boolean) => {
    setReturnItems((prev) =>
      prev.map((item) =>
        item.productVariantId === productVariantId
          ? { ...item, isSelected: checked }
          : item
      )
    );
  };

  const handleDecrement = (productVariantId: number) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.productVariantId === productVariantId) {
          const q = item.currentQuantity - 1;
          return { ...item, currentQuantity: q < 1 ? 1 : q };
        }
        return item;
      })
    );
  };

  const handleIncrement = (productVariantId: number) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.productVariantId === productVariantId) {
          const q = item.currentQuantity + 1;
          return {
            ...item,
            currentQuantity: q > item.maxQuantity ? item.maxQuantity : q,
          };
        }
        return item;
      })
    );
  };

  const handleContinue = async () => {
    const selected = returnItems.filter((item) => item.isSelected);
    if (selected.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để trả hàng.");
      return;
    }

    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    const accountId = Number(accId);

    if (!orderId || isNaN(orderId)) {
      toast.error("Order ID không hợp lệ!");
      router.push("/profile/return-item");
      return;
    }

    const payload: CreateCheckoutRequest = {
      orderId: orderId.toString(),
      accountId,
      selectedItems: selected.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.currentQuantity,
      })),
    };

    try {
      const res = await orderService.checkoutReturn(payload);
      localStorage.setItem("returnCheckoutData", JSON.stringify(res.data));
      toast.success("Yêu cầu trả hàng đã được tạo thành công!");
      router.push("/profile/return-item/request/return-commit");
    } catch (error: any) {
      console.error("Error during checkout return:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi xử lý trả hàng!");
      }
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-32 p-6">
        <div className="container mx-auto flex gap-8">
          <Sidebar />
          <div className="flex-1 bg-white p-6 shadow-md">
            <h1 className="text-2xl font-bold mb-4">
              Chi tiết đơn hàng cần trả #{orderId}
            </h1>
            {returnItems.length === 0 ? (
              <p className="text-gray-500">Không có sản phẩm nào để trả hàng.</p>
            ) : (
              <div className="space-y-4">
                {returnItems.map((item) => {
                  const totalPrice = item.priceAtPurchase * item.currentQuantity;
                  return (
                    <div
                      key={item.productVariantId}
                      className="flex items-center gap-4 border p-4 rounded"
                    >
                      <div>
                        <input
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={(e) =>
                            handleCheckboxChange(item.productVariantId, e.target.checked)
                          }
                        />
                      </div>
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/70x70?text=No+Image"}
                        alt={item.productName}
                        className="w-16 h-16 object-cover border"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-gray-500">
                          Size: {item.size} | Màu:{" "}
                          <span
                            className="inline-block w-4 h-4 border border-gray-300"
                            style={{
                              backgroundColor: item.color.startsWith("#")
                                ? item.color
                                : `#${item.color}`,
                            }}
                          />
                        </p>
                        <p className="text-gray-500">
                          {item.priceAtPurchase.toLocaleString("vi-VN")}₫ x {item.currentQuantity}
                        </p>
                        <p className="text-gray-800 font-semibold">
                          Thành tiền: {totalPrice.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrement(item.productVariantId)}
                          disabled={item.currentQuantity <= 1}
                          className={`px-2 py-1 border rounded ${
                            item.currentQuantity <= 1
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          –
                        </button>
                        <span>{item.currentQuantity}</span>
                        <button
                          onClick={() => handleIncrement(item.productVariantId)}
                          disabled={item.currentQuantity >= item.maxQuantity}
                          className={`px-2 py-1 border rounded ${
                            item.currentQuantity >= item.maxQuantity
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2 pt-10">
              <button
                onClick={() => router.push("/profile/return-item")}
                className="bg-black text-white px-6 py-3 font-semibold text-lg rounded"
              >
                Quay lại đơn trả hàng
              </button>
              <button
                onClick={handleContinue}
                className="bg-black text-white px-6 py-3 font-semibold text-lg rounded"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
