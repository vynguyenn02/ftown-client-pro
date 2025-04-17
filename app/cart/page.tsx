"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { AiOutlineDelete } from "react-icons/ai";
import cartService from "@/services/cart.service";
import { CartItem, CheckoutRequest, CheckoutResponse } from "@/types";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";

// BroadcastChannel để lắng nghe sự kiện logout
let bc: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  bc = new BroadcastChannel("funky-logout");
}

interface ConfirmModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmModal = ({
  visible,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative bg-white p-6 rounded shadow-md z-10 max-w-sm w-full">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
            Không
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">
            Có
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});

  // Hàm fetch lại giỏ hàng
  const fetchCart = async () => {
    const acc = getCookie("accountId");
    if (!acc) {
      setCart([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await cartService.getCart(Number(acc));
      if (res.data.status) {
        const items = res.data.data.map((item: CartItem) => ({
          ...item,
          isSelected: item.isSelected ?? false,
          isValid: item.isValid ?? true,
        }));
        setCart(items);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lấy giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe logout
  useEffect(() => {
    if (bc) bc.onmessage = (ev) => ev.data === "logout" && setCart([]);
    return () => { if (bc) bc.onmessage = null; };
  }, []);

  // Lần đầu load giỏ hàng
  useEffect(() => {
    fetchCart();
  }, []);

  // Chọn/bỏ chọn
  const handleSelect = (id: number, checked: boolean) =>
    setCart((prev) =>
      prev.map((item) =>
        item.productVariantId === id ? { ...item, isSelected: checked } : item
      )
    );

  // Thay đổi số lượng, và nếu giảm xuống 0 thì fetchCart để loại bỏ ngay
  const handleEditQuantity = (id: number, change: number) => {
    const acc = getCookie("accountId");
    if (!acc) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }
    // Tìm item hiện tại để kiểm tra quantity
    const current = cart.find((i) => i.productVariantId === id);
    cartService
      .editCart(Number(acc), { productVariantId: id, quantityChange: change })
      .then((res) => {
        if (res.data.status) {
          // nếu quantity ban đầu + change <= 0, fetch lại cả cart
          if (current && current.quantity + change <= 0) {
            fetchCart();
          } else {
            setCart((prev) =>
              prev.map((item) =>
                item.productVariantId === id
                  ? { ...item, quantity: item.quantity + change }
                  : item
              )
            );
          }
          bc?.postMessage("cartUpdated");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Có lỗi xảy ra khi cập nhật số lượng!"));
  };

  // Xóa 1 item
  const handleRemoveItem = (id: number) => {
    setConfirmMessage("Bạn có chắc chắn muốn xóa sản phẩm khỏi giỏ hàng?");
    setOnConfirm(() => () => {
      const backup = [...cart];
      setCart((prev) => prev.filter((i) => i.productVariantId !== id));
      setConfirmVisible(false);

      const acc = getCookie("accountId");
      if (!acc) {
        toast.error("Bạn chưa đăng nhập!");
        setCart(backup);
        return;
      }
      cartService
        .removeCartItem(Number(acc), id)
        .then((res) => {
          if (res.data.status) {
            toast.success(res.data.message);
            bc?.postMessage("cartUpdated");
          } else {
            toast.error(res.data.message);
            setCart(backup);
          }
        })
        .catch(() => {
          toast.error("Có lỗi khi xóa sản phẩm!");
          setCart(backup);
        });
    });
    setConfirmVisible(true);
  };

  // Xóa tất cả
  const handleRemoveAll = () => {
    setConfirmMessage("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?");
    setOnConfirm(() => () => {
      const acc = getCookie("accountId");
      if (!acc) {
        toast.error("Bạn chưa đăng nhập!");
        setConfirmVisible(false);
        return;
      }
      cartService
        .removeAllCartItem(Number(acc))
        .then((res) => {
          if (res.data.status) {
            toast.success(res.data.message);
            setCart([]);
            bc?.postMessage("cartUpdated");
          } else {
            toast.error(res.data.message);
          }
        })
        .catch(() => toast.error("Có lỗi xảy ra khi xóa tất cả sản phẩm!"));
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  };

  // Thanh toán
  const handleCheckout = async () => {
    const selected = cart.filter((i) => i.isSelected);
    if (selected.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }
    const invalid = selected.find((i) => !i.isValid);
    if (invalid) {
      toast.error(invalid.message || "Sản phẩm không hợp lệ.");
      return;
    }
    const payload: CheckoutRequest = {
      accountId: Number(getCookie("accountId")),
      selectedProductVariantIds: selected.map((i) => i.productVariantId),
    };
    try {
      const res = await cartService.checkout(payload);
      const data: CheckoutResponse = res.data;
      localStorage.setItem("checkoutData", JSON.stringify(data));
      router.push("/cart/checkout");
    } catch {
      toast.error("Có lỗi xảy ra khi thanh toán!");
    }
  };

  // Tính tổng tiền
  const totalAmount = cart
    .filter((i) => i.isSelected)
    .reduce((sum, i) => sum + i.discountedPrice * i.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex flex-1 pt-24">
        <div className="w-full max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-bold mb-6 text-center md:text-left">
            Giỏ hàng của bạn
          </h1>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <img
                src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1741405966/z6323749454613_8d6194817d47210d63f49e97d9b4ad22_oqwewn.jpg"
                alt="Loading..."
                className="w-16 h-16 animate-spin"
              />
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table-fixed w-full border-collapse mb-6">
                <thead>
                  <tr className="border-b font-semibold">
                    <th className="w-1/12 px-4 py-3 text-center">Chọn</th>
                    <th className="w-5/12 px-4 py-3 text-left">Thông tin sản phẩm</th>
                    <th className="w-2/12 px-4 py-3 text-center">Đơn giá</th>
                    <th className="w-2/12 px-4 py-3 text-center">Số lượng</th>
                    <th className="w-2/12 px-4 py-3 text-center">Thành tiền</th>
                    <th className="w-1/12 px-4 py-3 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <tr key={item.productVariantId} className="border-b">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.isSelected || false}
                            onChange={(e) =>
                              handleSelect(item.productVariantId, e.target.checked)
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.imagePath}
                              alt={item.productName}
                              className="w-20 h-20 object-cover border"
                            />
                            <div>
                              <p className="font-semibold">{item.productName}</p>
                              <p className="text-sm text-gray-500">
                                Size: {item.size} – Màu:{" "}
                                <span
                                  className="inline-block w-4 h-4 border rounded-full ml-1"
                                  style={{ backgroundColor: item.color }}
                                />
                              </p>
                              {!item.isValid && (
                                <p className="text-red-500 text-sm mt-1">{item.message}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-red-500 font-medium">
                          {item.discountedPrice.toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center space-x-2 justify-center">
                            <button
                              onClick={() =>
                                handleEditQuantity(item.productVariantId, -1)
                              }
                              className="border px-2 py-1 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() =>
                                handleEditQuantity(item.productVariantId, 1)
                              }
                              className="border px-2 py-1 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {(item.discountedPrice * item.quantity).toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.productVariantId)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <AiOutlineDelete size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">
                        Giỏ hàng trống
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
                <button onClick={handleRemoveAll} className="px-4 py-2 bg-red-500 text-white rounded">
                  Xóa tất cả
                </button>
                <div className="text-lg font-semibold">
                  Tổng tiền:{" "}
                  <span className="text-red-600 text-xl">
                    {totalAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCheckout}
                  disabled={cart.filter((i) => i.isSelected).some((i) => !i.isValid)}
                  className={`px-6 py-3 font-semibold text-lg rounded text-white bg-[#222222B3] ${
                    cart.filter((i) => i.isSelected).some((i) => !i.isValid)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                >
                  Thanh toán
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <ConfirmModal
        visible={confirmVisible}
        message={confirmMessage}
        onConfirm={onConfirm}
        onCancel={() => setConfirmVisible(false)}
      />
    </div>
  );
}
