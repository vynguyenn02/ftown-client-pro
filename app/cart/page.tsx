"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

/** 
 * Component xác nhận custom.
 * Popup có nền overlay màu nâu trong suốt (sử dụng mã màu #8B4513).
 */
interface ConfirmModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmModal = ({ visible, message, onConfirm, onCancel }: ConfirmModalProps) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay nền nâu với độ trong suốt */}
      <div className="absolute inset-0 bg-[#FFFFFF] opacity-50"></div>
      {/* Modal */}
      <div className="relative bg-white p-6 rounded shadow-md z-10">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
            Không
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#8B4513] text-white rounded">
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

  // State cho modal xác nhận
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});

  // Lắng nghe sự kiện logout
  useEffect(() => {
    if (bc) {
      bc.onmessage = (ev) => {
        if (ev.data === "logout") {
          setCart([]);
        }
      };
    }
    return () => {
      if (bc) bc.onmessage = null;
    };
  }, []);

  // Fetch giỏ hàng ban đầu
  useEffect(() => {
    const accId = getCookie("accountId");
    if (!accId) {
      setLoading(false);
      return;
    }
    const accountId = Number(accId);
    cartService
      .getCart(accountId)
      .then((res) => {
        if (res.data.status) {
          const updated = res.data.data.map((item: CartItem) => ({
            ...item,
            isSelected: false,
          }));
          setCart(updated);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Có lỗi xảy ra khi lấy giỏ hàng!"))
      .finally(() => setLoading(false));
  }, []);

  // Chọn/bỏ chọn sản phẩm
  const handleSelect = (productVariantId: number, checked: boolean) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productVariantId === productVariantId
          ? { ...item, isSelected: checked }
          : item
      )
    );
  };

  // Hàm chỉnh sửa số lượng của sản phẩm (API editCart)
  const handleEditQuantity = (productVariantId: number, change: number) => {
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }
    const accountId = Number(accId);
    console.log("Edit Cart Request:", {
      accountId,
      productVariantId,
      quantityChange: change,
    });

    cartService
      .editCart(accountId, { productVariantId, quantityChange: change })
      .then((res) => {
        console.log("Edit Cart Response:", res);
        if (res.data.status) {
          toast.success(res.data.message);
          // Cập nhật state cục bộ bằng cách tăng/giảm số lượng
          setCart((prevCart) =>
            prevCart.map((item) =>
              item.productVariantId === productVariantId
                ? { ...item, quantity: item.quantity + change }
                : item
            )
          );
          // Phát thông điệp broadcast "cartUpdated"
          bc?.postMessage("cartUpdated");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error) => {
        console.error("Error in editCart:", error);
        toast.error("Có lỗi xảy ra khi cập nhật số lượng!");
      });
  };

  // Hàm thực hiện xóa 1 sản phẩm khỏi giỏ hàng
  const performRemoveItem = (productVariantId: number) => {
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }
    const accountId = Number(accId);
    cartService
    .removeCartItem(accountId, productVariantId)
    .then((res) => {
      if (res.data.status) {
        toast.success(res.data.message);
        setCart((prevCart) =>
          prevCart.filter(
            (item) => item.productVariantId !== productVariantId
          )
        );
      } else {
        toast.error(res.data.message);
      }
    })
    .catch(() => toast.error("Có lỗi xảy ra khi xóa sản phẩm!"));
  
  };

  // Hàm xử lý xóa sản phẩm bằng modal xác nhận thay vì window.confirm
  const handleRemoveItem = (productVariantId: number) => {
    // Hiển thị modal xác nhận
    setConfirmMessage("Bạn có chắc chắn muốn xóa sản phẩm khỏi giỏ hàng?");
    setOnConfirm(() => () => {
      // Lưu lại state hiện tại để có thể rollback nếu có lỗi
      const prevCart = [...cart];
      // Cập nhật UI ngay lập tức
      setCart(prevCart.filter(item => item.productVariantId !== productVariantId));
      setConfirmVisible(false);
  
      // Sau đó gọi API xóa sản phẩm
      const accId = getCookie("accountId");
      if (!accId) {
        toast.error("Bạn chưa đăng nhập!");
        setCart(prevCart);
        return;
      }
      const accountId = Number(accId);
      cartService
        .removeCartItem(accountId, productVariantId)
        .then((res) => {
          if (res.data.status) {
            toast.success(res.data.message);
            // Phát thông điệp broadcast để cập nhật cartCount
            bc?.postMessage("cartUpdated");
          } else {
            toast.error(res.data.message);
            // Nếu API báo lỗi, rollback lại state
            setCart(prevCart);
          }
        })
        .catch(() => {
          toast.error("Có lỗi xảy ra khi xóa sản phẩm!");
          // Rollback lại nếu có lỗi
          setCart(prevCart);
        });
    });
    setConfirmVisible(true);
  };
  
  
  // Hàm thực hiện xóa tất cả sản phẩm khỏi giỏ hàng
  const performRemoveAllItems = () => {
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }
    const accountId = Number(accId);
    cartService
      .removeAllCartItem(accountId)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          setCart([]);
          // Phát thông điệp broadcast để cập nhật cartCount
          bc?.postMessage("cartUpdated");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Có lỗi xảy ra khi xóa tất cả sản phẩm!"));
  };

  // Hàm xử lý xóa tất cả sản phẩm bằng modal xác nhận
  const handleRemoveAllItems = () => {
    setConfirmMessage("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?");
    setOnConfirm(() => () => {
      performRemoveAllItems();
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  };

  // Xử lý thanh toán
  const handleCheckout = async () => {
    const selectedItems = cart.filter((item) => item.isSelected);
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }
    const variantIds = selectedItems.map((item) => item.productVariantId);
    const accountId = Number(getCookie("accountId"));
    try {
      const payload: CheckoutRequest = {
        accountId,
        selectedProductVariantIds: variantIds,
      };
      const response = await cartService.checkout(payload);
      const checkoutData: CheckoutResponse = response.data;
      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      router.push("/cart/checkout");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thanh toán!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex flex-1 justify-center pt-24 px-6">
        <div className="container mx-auto flex flex-col md:flex-row gap-6">
          {/* Danh sách sản phẩm trong giỏ */}
          <div className="w-full md:w-2/3 bg-white shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">GIỎ HÀNG</h2>
            {/* Nút "Xóa tất cả" hiện nếu có sản phẩm trong giỏ */}
            {!loading && cart.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleRemoveAllItems}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <img
                  src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1741405966/z6323749454613_8d6194817d47210d63f49e97d9b4ad22_oqwewn.jpg"
                  alt="Loading..."
                  className="w-16 h-16 animate-spin"
                />
              </div>
            ) : cart.length === 0 ? (
              <p className="text-center py-10">Giỏ hàng trống</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-700">
                    <th className="p-3">Chọn</th>
                    <th className="p-3">Sản phẩm</th>
                    <th className="p-3">Số lượng</th>
                    <th className="p-3">Giá</th>
                    <th className="p-3">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.productVariantId} className="border-b text-gray-800">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={item.isSelected || false}
                          onChange={(e) => handleSelect(item.productVariantId, e.target.checked)}
                        />
                      </td>
                      <td className="flex items-center gap-4 p-3">
                        <img
                          src={item.imagePath}
                          alt={item.productName}
                          className="w-20 h-20 object-cover"
                        />
                        <div>
                          <p>{item.productName}</p>
                          <p className="text-gray-500">
                            Size {item.size} - Màu:
                            <span
                              className="inline-block w-4 h-4 ml-1 border border-gray-300 align-middle"
                              style={{ backgroundColor: item.color }}
                            />
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleEditQuantity(item.productVariantId, -1)}
                            className="px-2 py-1 border"
                          >
                            -
                          </button>
                          <span className="px-3">{item.quantity}</span>
                          <button
                            onClick={() => handleEditQuantity(item.productVariantId, 1)}
                            className="px-2 py-1 border"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 font-semibold">
                        {(item.discountedPrice * item.quantity).toLocaleString("vi-VN")}₫
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleRemoveItem(item.productVariantId)}>
                          <AiOutlineDelete size={20} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Cột thanh toán */}
          <div className="w-full md:w-1/3 bg-white shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Tổng tiền</h3>
            <p className="text-lg font-semibold mb-4">
              {cart
                .filter((item) => item.isSelected)
                .reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0)
                .toLocaleString("vi-VN")}
              ₫
            </p>
            <button
              onClick={handleCheckout}
              className="mt-6 w-full px-6 py-3 bg-[#222222B3] text-white font-semibold text-lg"
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </main>
      <Footer />
      {/* Hiển thị ConfirmModal nếu cần */}
      <ConfirmModal
        visible={confirmVisible}
        message={confirmMessage}
        onConfirm={onConfirm}
        onCancel={() => setConfirmVisible(false)}
      />
    </div>
  );
}
