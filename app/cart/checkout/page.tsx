"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Image } from "antd";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import AddAddressModal from "@/components/AddAddressModal/AddAddressModal";
import { CheckoutResponse, ShippingAddress } from "@/types";
import toast from "react-hot-toast";
import orderService from "@/services/order.service";
import { getCookie } from "cookies-next";

// BroadcastChannel để lắng nghe sự kiện logout
let bc: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  bc = new BroadcastChannel("funky-logout");
}

export default function CheckOutPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Luôn lấy accountId từ cookie (không phụ thuộc vào shippingAddresses)
  const accountId = Number(getCookie("accountId")) || 0;

  useEffect(() => {
    if (bc) {
      bc.onmessage = (ev) => {
        if (ev.data === "logout") {
          setCheckoutData(null);
          router.push("/login");
        }
      };
    }
    return () => {
      if (bc) bc.onmessage = null;
    };
  }, [router]);

  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (data) {
      try {
        const parsed = JSON.parse(data) as CheckoutResponse;
        setCheckoutData(parsed);
        if (parsed.shippingAddresses && parsed.shippingAddresses.length > 0) {
          const defaultAddress: ShippingAddress =
            parsed.shippingAddresses.find(
              (addr: ShippingAddress) => addr.isDefault
            ) ?? parsed.shippingAddresses[0]!;
          setSelectedAddress(defaultAddress.addressId);
        } else {
          setSelectedAddress(-1);
          setShowAddAddressModal(true);
        }
        
        
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu Checkout:", error);
        toast.error("Dữ liệu đơn hàng không hợp lệ!");
        router.push("/cart");
      }
    } else {
      toast.error("Không tìm thấy dữ liệu đơn hàng!");
      router.push("/cart");
    }
  }, [router]);
  

  const handleSelectAddress = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log("handleSelectAddress triggered, value:", value);
    if (value === "-1") {
      setShowAddAddressModal(true);
    } else {
      setSelectedAddress(Number(value));
    }
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    if (!selectedAddress || !selectedPayment) {
      toast.error("Vui lòng chọn địa chỉ giao hàng và phương thức thanh toán!");
      return;
    }
    setIsSubmitting(true);

    const shippingAddress: ShippingAddress | undefined = checkoutData?.shippingAddresses.find(
      (addr: ShippingAddress) => addr.addressId === selectedAddress
    );
    if (!shippingAddress) {
      toast.error("Địa chỉ giao hàng không hợp lệ!");
      return;
    }

    const paymentMethodToSend = selectedPayment === "COD" ? "COD" : "PAYOS";

    const payload = {
      accountId: shippingAddress.accountId, // hoặc bạn có thể truyền accountId lấy từ cookie
      checkOutSessionId: checkoutData?.checkOutSessionId || "",
      shippingAddressId: selectedAddress,
      paymentMethod: paymentMethodToSend,
    };

    try {
      const res = await orderService.createOrder(payload);
      if (!res.data.status) {
        toast.error(res.data.message || "Đặt hàng thất bại");
        return;
      }
      toast.success("Đặt hàng thành công!");
      // Xóa dữ liệu checkout khỏi localStorage
      localStorage.removeItem("checkoutData");
      if (paymentMethodToSend === "PAYOS" && res.data.data.paymentUrl) {
        window.location.href = res.data.data.paymentUrl;
      } else {
        router.replace("/profile/order");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Đã có lỗi xảy ra!");
    }
  };

  // Callback khi thêm địa chỉ mới thành công
  const handleAddAddressSuccess = (newAddress: ShippingAddress) => {
    setCheckoutData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        shippingAddresses: [...prev.shippingAddresses, newAddress],
      };
    });
    setSelectedAddress(newAddress.addressId);
    setShowAddAddressModal(false);
  };

  const selectedAddressInfo = checkoutData?.shippingAddresses.find(
    (addr: ShippingAddress) => addr.addressId === selectedAddress
  );

  if (!checkoutData) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex flex-1 justify-center pt-20 px-2 md:px-6 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row gap-8">
          {/* Cột trái: Thông tin thanh toán / giao hàng */}
          <div className="w-full md:w-2/3 p-4 md:p-6 border border-gray-200 shadow-sm space-y-4">
            <h1 className="text-2xl font-bold">funkytown</h1>
            <h3 className="text-xl font-semibold mt-4">Thông tin thanh toán</h3>

            {/* Dropdown chọn địa chỉ đã lưu */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-semibold">Chọn địa chỉ đã lưu</label>
              <select
                className="border rounded p-2 w-full"
                value={selectedAddress ?? ""}
                onChange={handleSelectAddress}
              >
                <option value="-1">Thêm địa chỉ mới...</option>
                {checkoutData.shippingAddresses.map((addr: ShippingAddress) => (
                  <option key={addr.addressId} value={addr.addressId}>
                    {addr.recipientName} - {addr.address}, {addr.city} - {addr.district} - {addr.province}
                  </option>
                ))}
              </select>
            </div>

            {/* Hiển thị chi tiết địa chỉ được chọn */}
            {selectedAddress && selectedAddressInfo && (
              <div className="mt-4 p-4 border bg-gray-50">
                <p>
                  <strong>Tên người nhận:</strong> {selectedAddressInfo.recipientName}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {selectedAddressInfo.recipientPhone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedAddressInfo.email || "N/A"}
                </p>
              </div>
            )}

            <h3 className="text-xl font-semibold mt-4">Phương thức thanh toán</h3>
            <div className="space-y-2">
              {checkoutData.availablePaymentMethods.map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    className="mr-2"
                    value={method}
                    onChange={() => setSelectedPayment(method)}
                  />
                  {method === "COD" ? "Thanh toán khi nhận hàng" : "Thanh toán online"}
                </label>
              ))}
            </div>
            <button
        onClick={handlePlaceOrder}
        disabled={isSubmitting}
        className={`mt-6 w-full px-6 py-3 font-semibold text-lg rounded text-white
          bg-black ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
      >
        {isSubmitting ? "Đang đặt hàng..." : "ĐẶT HÀNG"}
      </button>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="w-full md:w-1/3 p-4 md:p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold">Giỏ hàng của bạn</h3>
            {checkoutData.items.length > 0 ? (
              checkoutData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white shadow-sm border">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-12 h-12 object-cover border border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-800">{item.productName}</p>
                    <p className="text-gray-500">
                      Size: {item.size} - Màu:{" "}
                      <span
                        className="inline-block w-4 h-4 border border-gray-300"
                        style={{ backgroundColor: item.color }}
                      />
                    </p>
                    <p className="text-gray-900 font-bold">
                      {item.priceAtPurchase.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không có sản phẩm nào trong đơn hàng.</p>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between text-base font-semibold">
                <span>Tạm tính</span>
                <span>{checkoutData.subTotal.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Phí vận chuyển</span>
                <span>{checkoutData.shippingCost.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2">
                <span>Tổng cộng</span>
                <span>
                  {(checkoutData.subTotal + checkoutData.shippingCost).toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hiển thị modal thêm địa chỉ mới */}
      <AddAddressModal
        visible={showAddAddressModal}
        accountId={accountId}
        onCancel={() => setShowAddAddressModal(false)}
        onSuccess={handleAddAddressSuccess}
      />

      <Footer />
    </div>
  );
}
