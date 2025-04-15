"use client";

import { useEffect, useState } from "react";
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

/**
 * Component xác nhận (modal) dùng để hỏi lại người dùng khi xóa sản phẩm hoặc xóa tất cả.
 * Bạn có thể thay đổi màu nền overlay thành #8B4513 nếu cần.
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
      {/* Overlay, bạn có thể thay đổi màu sắc và độ trong suốt tại đây */}
      <div className="absolute inset-0 bg-[#8B4513] opacity-50"></div>
      <div className="relative bg-white p-6 rounded shadow-md z-10 max-w-sm w-full">
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

  // Lắng nghe sự kiện logout qua BroadcastChannel
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

  // Lấy dữ liệu giỏ hàng ban đầu
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
          // Nếu dữ liệu trả về không có thuộc tính isSelected thì thêm vào
          const updated = res.data.data.map((item: CartItem) => ({
            ...item,
            isSelected: item.isSelected ?? false,
          }));
          setCart(updated);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Có lỗi xảy ra khi lấy giỏ hàng!"))
      .finally(() => setLoading(false));
  }, []);

  // Hàm chọn/bỏ chọn sản phẩm
  const handleSelect = (productVariantId: number, checked: boolean) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productVariantId === productVariantId ? { ...item, isSelected: checked } : item
      )
    );
  };

  // Hàm chỉnh sửa số lượng sản phẩm (tăng/giảm)
  const handleEditQuantity = (productVariantId: number, change: number) => {
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }
    const accountId = Number(accId);

    cartService
      .editCart(accountId, { productVariantId, quantityChange: change })
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          setCart((prevCart) =>
            prevCart.map((item) =>
              item.productVariantId === productVariantId
                ? { ...item, quantity: item.quantity + change }
                : item
            )
          );
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

  // Hàm xóa 1 sản phẩm (sử dụng modal xác nhận)
  const handleRemoveItem = (productVariantId: number) => {
    setConfirmMessage("Bạn có chắc chắn muốn xóa sản phẩm khỏi giỏ hàng?");
    setOnConfirm(() => () => {
      const prevCart = [...cart];
      setCart(prevCart.filter((item) => item.productVariantId !== productVariantId));
      setConfirmVisible(false);

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
            bc?.postMessage("cartUpdated");
          } else {
            toast.error(res.data.message);
            setCart(prevCart);
          }
        })
        .catch(() => {
          toast.error("Có lỗi xảy ra khi xóa sản phẩm!");
          setCart(prevCart);
        });
    });
    setConfirmVisible(true);
  };

  // Hàm xóa tất cả sản phẩm trong giỏ hàng
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
          bc?.postMessage("cartUpdated");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Có lỗi xảy ra khi xóa tất cả sản phẩm!"));
  };

  // Xác nhận xóa tất cả sản phẩm
  const handleRemoveAllItems = () => {
    setConfirmMessage("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?");
    setOnConfirm(() => () => {
      performRemoveAllItems();
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  };

  // Hàm xử lý thanh toán chỉ với những sản phẩm được chọn
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

  // Tổng tiền dựa trên các sản phẩm được chọn
  const totalAmount = cart
    .filter((item) => item.isSelected)
    .reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex flex-1 justify-center pt-24 px-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center md:text-left">
            Giỏ hàng của bạn
          </h1>

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
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="border-b font-semibold">
                    {/* Cột checkbox */}
                    <th className="py-3 text-left w-[5%]">Chọn</th>
                    <th className="py-3 text-left w-[35%]">Thông tin sản phẩm</th>
                    <th className="py-3 text-left w-[15%]">Đơn giá</th>
                    <th className="py-3 text-left w-[15%]">Số lượng</th>
                    <th className="py-3 text-left w-[15%]">Thành tiền</th>
                    <th className="py-3 text-left w-[15%]">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.productVariantId} className="border-b">
                      {/* Checkbox chọn sản phẩm */}
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={item.isSelected || false}
                          onChange={(e) => handleSelect(item.productVariantId, e.target.checked)}
                        />
                      </td>

                      {/* Thông tin sản phẩm */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.imagePath}
                            alt={item.productName}
                            className="w-20 h-20 object-cover border"
                          />
                          <div>
                            <p className="font-semibold">{item.productName}</p>
                            <p className="text-sm text-gray-500">
                              Size: {item.size} - Màu:{" "}
                              <span
                                className="inline-block w-4 h-4 border border-gray-300 align-middle ml-1"
                                style={{ backgroundColor: item.color }}
                              />
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Đơn giá */}
                      <td className="py-3 px-2 text-red-500 font-medium">
                        {item.discountedPrice.toLocaleString("vi-VN")}₫
                      </td>

                      {/* Số lượng với nút tăng/giảm */}
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditQuantity(item.productVariantId, -1)}
                            className="border px-2 py-1 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => handleEditQuantity(item.productVariantId, 1)}
                            className="border px-2 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Thành tiền */}
                      <td className="py-3 px-2 font-semibold">
                        {(item.discountedPrice * item.quantity).toLocaleString("vi-VN")}₫
                      </td>

                      {/* Nút xóa sản phẩm */}
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleRemoveItem(item.productVariantId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <AiOutlineDelete size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Nút "Xóa tất cả" và hiển thị tổng tiền của các sản phẩm được chọn */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
                <button
                  onClick={handleRemoveAllItems}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Xóa tất cả
                </button>
                <div className="text-lg font-semibold">
                  Tổng tiền:{" "}
                  <span className="text-red-600 text-xl">
                    {totalAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              {/* Nút thanh toán dựa trên các sản phẩm đã chọn */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCheckout}
                  className="px-6 py-3 bg-[#222222B3] text-white font-semibold text-lg rounded hover:opacity-90"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Modal xác nhận các hành động xóa */}
      <ConfirmModal
        visible={confirmVisible}
        message={confirmMessage}
        onConfirm={onConfirm}
        onCancel={() => setConfirmVisible(false)}
      />
    </div>
  );
}
