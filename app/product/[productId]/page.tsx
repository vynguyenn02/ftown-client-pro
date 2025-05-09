"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BestSeller from "@/components/BestSeller/BestSeller";
import { getCookie } from "cookies-next";

import productService from "@/services/product.service";
import cartService from "@/services/cart.service";
import feedbackService from "@/services/feedback.service";

import { ProductDetail, Variant, CartItem, Feedback } from "@/types";
import {
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineRight,
  AiOutlineHeart,
  AiFillHeart,
} from "react-icons/ai";
import toast from "react-hot-toast";

// Import antd Button (sử dụng antd cho nút yêu thích)
import { Button } from "antd";

// Import component ZoomableImage (phóng to ảnh)
import ZoomableImage from "@/components/ZoomableImage/ZoomableImage";
let bc: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  bc = new BroadcastChannel("funky-logout");
}


/** Component hiển thị sao đánh giá (1-5) */
function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        fill={i <= rating ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        className={`w-5 h-5 ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.023 6.243a1 1 0 00.95.69h6.62c.969 0 1.371 1.24.588 1.81l-5.353 3.756a1 1 0 00-.364 1.118l2.023 6.243c.3.921-.755 1.688-1.541 1.118L12 18.347l-5.897 4.258c-.786.57-1.84-.197-1.54-1.118l2.022-6.243a1 1 0 00-.364-1.118L1.868 11.67c-.783-.57-.38-1.81.588-1.81h6.62a1 1 0 00.951-.69l2.022-6.243z"
        />
      </svg>
    );
  }
  return <div className="flex">{stars}</div>;
}

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const pathname = usePathname();

  // Thông tin sản phẩm
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Quản lý giỏ hàng (drawer)
  const [showDrawer, setShowDrawer] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Danh sách feedback
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [showAllFeedback, setShowAllFeedback] = useState(false);

  // Quản lý các Drawer thông tin / chính sách
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [showShippingDrawer, setShowShippingDrawer] = useState(false);
  const [showReturnDrawer, setShowReturnDrawer] = useState(false);

  // State để theo dõi sản phẩm đã được yêu thích
  const [isFavorite, setIsFavorite] = useState(false);

  /** Lấy thông tin sản phẩm */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = parseInt(params.productId, 10);
        if (isNaN(productId)) {
          return notFound();
        }
        const accId = getCookie("accountId");
        let res;
        if (accId) {
          const accountId = Number(accId);
          res = await productService.getProductById(productId, accountId);
        } else {
          res = await productService.getProductById(productId);
        }
        const data = res.data.data;
        if (!data) {
          return notFound();
        }
        setProduct(data);
        setSelectedImage(data.imagePath);
        if (typeof data.isFavorite !== "undefined") {
          setIsFavorite(data.isFavorite);
        } else {
          setIsFavorite(false);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Không thể lấy thông tin sản phẩm!");
      }
    };
    fetchProduct();
  }, [params.productId]);

  /** Lấy danh sách feedback (ban đầu fetch 3 feedback) */
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const productId = parseInt(params.productId, 10);
        if (isNaN(productId)) return;
        const res = await feedbackService.getFeedbackByProductId(productId, 1, 10);
        if (res.data.status) {
          setFeedbackList(res.data.data);
        } else {
          toast.error(res.data.message || "Không thể lấy đánh giá!");
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        toast.error("Có lỗi khi lấy đánh giá sản phẩm!");
      }
    };
    fetchFeedback();
  }, [params.productId]);

  /** Hàm gọi API để lấy tất cả feedback */
  const handleShowAllFeedback = async () => {
    try {
      const productId = parseInt(params.productId, 10);
      if (isNaN(productId)) return;
      const res = await feedbackService.getFeedbackByProductId(productId, 1, 999);
      if (res.data.status) {
        setFeedbackList(res.data.data);
        setShowAllFeedback(true);
      } else {
        toast.error(res.data.message || "Không thể lấy đánh giá!");
      }
    } catch (err) {
      console.error("Error fetching all feedback:", err);
      toast.error("Có lỗi khi lấy đánh giá sản phẩm!");
    }
  };

  /** Lấy giỏ hàng */
  const fetchCart = async (accountId: number) => {
    try {
      const res = await cartService.getCart(accountId);
      if (res.data.status) {
        setCartItems(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      toast.error("Có lỗi xảy ra khi lấy giỏ hàng!");
    }
  };

  /**
   * Khi người dùng chọn color:
   *  - setSelectedColor
   *  - Tìm variant có color = color & size = selectedSize (nếu đã chọn size)
   *  - Cập nhật selectedVariant & selectedImage = variant.imagePath
   */
  const handleColorChange = (color: string) => {
    if (!product) return;
    setSelectedColor(color);
    const found = product.variants.find(
      (v) => v.color === color && (selectedSize ? v.size === selectedSize : true)
    );
    if (found) {
      setSelectedVariant(found);
      setSelectedImage(found.imagePath);
    } else {
      setSelectedVariant(null);
      setSelectedImage(product.imagePath);
    }
  };

  /**
   * Khi người dùng chọn size:
   *  - setSelectedSize
   *  - Tìm variant có size = size & color = selectedColor (nếu đã chọn color)
   *  - Cập nhật selectedVariant & selectedImage = variant.imagePath
   */
  const handleSizeChange = (size: string) => {
    if (!product) return;
    setSelectedSize(size);
    const found = product.variants.find(
      (v) => v.size === size && (selectedColor ? v.color === selectedColor : true)
    );
    if (found) {
      setSelectedVariant(found);
      setSelectedImage(found.imagePath);
    } else {
      setSelectedVariant(null);
      setSelectedImage(product.imagePath);
    }
  };

  /** Hàm tăng/giảm số lượng sản phẩm trong giỏ (gọi API editCart) */
 /** Hàm tăng/giảm số lượng trong Drawer giỏ hàng */
const handleEditQuantity = (productVariantId: number, change: number) => {
  const accId = getCookie("accountId");
  if (!accId) {
    toast.error("Bạn chưa đăng nhập!");
    return;
  }
  const accountId = Number(accId);

  // Lấy số lượng hiện tại của item để kiểm tra
  const currentItem = cartItems.find(
    (item) => item.productVariantId === productVariantId
  );

  cartService
    .editCart(accountId, { productVariantId, quantityChange: change })
    .then((res) => {
      if (res.data.status) {
        toast.success(res.data.message);

        if (currentItem && currentItem.quantity + change <= 0) {
          // nếu sau khi thay đổi số lượng <= 0 thì fetch lại toàn bộ giỏ
          fetchCart(accountId);
        } else {
          // ngược lại chỉ update số lượng trong state
          setCartItems((prev) =>
            prev.map((item) =>
              item.productVariantId === productVariantId
                ? { ...item, quantity: item.quantity + change }
                : item
            )
          );
        }

        // gửi broadcast để các nơi khác (Header, Cart page) cũng cập nhật
        bc?.postMessage("cartUpdated");
      } else {
        toast.error(res.data.message);
      }
    })
    .catch(() => toast.error("Có lỗi xảy ra khi cập nhật số lượng!"));
};

  const handleRemoveItem = (productVariantId: number) => {
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
          setCartItems((prev) =>
            prev.filter((i) => i.productVariantId !== productVariantId)
          );
          // Gửi broadcast event cập nhật giỏ hàng
          bc?.postMessage("cartUpdated");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Có lỗi xảy ra khi xóa sản phẩm!"));
  };  
  /** Thêm sản phẩm vào giỏ */
  const handleAddToCart = async () => {
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    const accountId = Number(accId);
    if (!selectedVariant) {
      toast.error("Vui lòng chọn size và màu!");
      return;
    }
    if (!product) {
      toast.error("Sản phẩm không tồn tại!");
      return;
    }
  
    const variantPrice =
      selectedVariant.discountedPrice &&
      selectedVariant.discountedPrice < selectedVariant.price
        ? selectedVariant.discountedPrice
        : selectedVariant.price;
  
    try {
      const payload = {
        productId: product.productId,
        size: selectedVariant.size,
        color: selectedVariant.color,
        quantity,
        price: variantPrice,
      };
      const res = await cartService.addProductToCart(accountId, payload);
      if (res.data.status) {
        toast.success(res.data.message);
        await fetchCart(accountId);
        setShowDrawer(true);
        // Phát event để Header cập nhật cart count
        bc?.postMessage("cartUpdated");
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ hàng!");
    }
  };
  

  /** Hàm xử lý thêm/bỏ sản phẩm vào danh sách yêu thích */
  const handleFavorite = async () => {
    if (!product) {
      toast.error("Sản phẩm không tồn tại!");
      return;
    }
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    const accountId = Number(accId);
    try {
      if (!isFavorite) {
        const res = await productService.postFavoriteProduct(accountId, product.productId);
        if (res.data.status) {
          toast.success(res.data.message);
          setIsFavorite(true);
        } else {
          toast.error(res.data.message);
        }
      } else {
        const res = await productService.deleteFavoriteProduct(accountId, product.productId);
        if (res.data.status) {
          toast.success(res.data.message);
          setIsFavorite(false);
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error("Có lỗi xảy ra khi thay đổi yêu thích!");
    }
  };

  // Nếu sản phẩm chưa load xong => hiển thị loading
  if (!product) {
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);

  // Nếu chưa chọn variant, bạn có thể cho phép người dùng chọn (hoặc thông báo yêu cầu chọn)
  const isOutOfStock =
    selectedVariant && selectedVariant.stockQuantity !== null
      ? selectedVariant.stockQuantity === 0
      : false;

  // Nếu chưa chọn variant thì hiển thị variant mặc định (đầu tiên)
  const displayedVariant =
    selectedVariant || (product.variants.length > 0 ? product.variants[0] : null);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-6 pt-24 lg:px-20 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
          {/* Cột trái: Hình ảnh sản phẩm */}
          <div className="flex-1">
            <div className="overflow-hidden relative border group">
              <ZoomableImage src={selectedImage} alt={product.name} />
            </div>
            {product.imagePaths && product.imagePaths.length > 0 && (
              <div className="flex mt-4 space-x-2">
                {product.imagePaths.map((imgPath, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 border cursor-pointer overflow-hidden ${
                      selectedImage === imgPath ? "border-2 border-gray-400" : ""
                    }`}
                    onClick={() => setSelectedImage(imgPath)}
                  >
                    <img
                      src={imgPath}
                      alt={`Thumb ${index}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin sản phẩm */}
          <div className="flex-1">
            <h1 className="text-2xl font-medium mb-4">{product.name}</h1>

            {/* Chọn size */}
            <div className="mt-4">
              <p className="mb-2">Chọn size:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(product.variants.map((v) => v.size))).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`px-4 py-2 border font-medium ${
                      selectedSize === size ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn màu */}
            <div className="mt-4">
              <p className="mb-2">Chọn màu:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(product.variants.map((v) => v.color))).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 border-2 ${
                      selectedColor === color ? "border-black" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Hiển thị giá */}
            <div className="mt-4">
              {displayedVariant && displayedVariant.discountedPrice < displayedVariant.price ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-semibold text-black">
                    {displayedVariant.discountedPrice.toLocaleString("vi-VN")}VND
                  </span>
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded leading-none">
                    -{Math.round(
                      ((displayedVariant.price - displayedVariant.discountedPrice) /
                        displayedVariant.price) *
                        100
                    )}
                    %
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    {displayedVariant.price.toLocaleString("vi-VN")}VND
                  </span>
                </div>
              ) : (
                <p className="text-xl font-medium">
                  {displayedVariant
                    ? displayedVariant.price.toLocaleString("vi-VN") + "₫"
                    : "N/A"}
                </p>
              )}
            </div>

            {/* Chọn số lượng */}
            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-200"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200"
              >
                +
              </button>
            </div>

            {/* Nút thêm vào giỏ và Yêu thích */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`mt-6 w-full px-6 py-3 font-semibold text-lg ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#222222B3] text-white"
              }`}
            >
              {isOutOfStock ? "HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}
            </button>

            <Button
              onClick={handleFavorite}
              icon={
                isFavorite ? (
                  <AiFillHeart style={{ color: "red", fontSize: 20 }} />
                ) : (
                  <AiOutlineHeart style={{ color: "#eee", fontSize: 20 }} />
                )
              }
              className="mt-6 w-full px-6 py-3 bg-[#222222B3] text-white font-semibold text-lg flex items-center justify-center gap-2"
            >
              {isFavorite ? "ĐÃ YÊU THÍCH" : "THÊM VÀO YÊU THÍCH"}
            </Button>

            {/* Thông tin sản phẩm, Chính sách vận chuyển, Đổi trả */}
            <div className="mt-6 border-t pt-4 space-y-1">
              <button
                onClick={() => setShowInfoDrawer(true)}
                className="flex justify-between items-center w-full text-left py-3"
              >
                <span>Thông tin sản phẩm</span>
                <AiOutlineRight />
              </button>
              <button
                onClick={() => setShowReturnDrawer(true)}
                className="flex justify-between items-center w-full text-left py-3"
              >
                <span>Chính sách đổi trả</span>
                <AiOutlineRight />
              </button>
            </div>
          </div>
        </div>

        {/* Khu vực đánh giá sản phẩm */}
        <div className="max-w-6xl mx-auto mt-10">
          <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>
          {feedbackList.length > 0 ? (
            <div className="space-y-6">
              {feedbackList.map((fb) => (
                <div key={fb.feedbackId} className="border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Tên: {fb.account}</p>
                    <StarRating rating={fb.rating} />
                  </div>
                  <p className="text-gray-400 text-sm">{fb.createdDate}</p>
                  <p className="mt-2 text-gray-700">{fb.comment}</p>
                  {fb.imagePath && fb.imagePath !== "string" && (
                    <div className="mt-2">
                      <img
                        src={fb.imagePath}
                        alt="Feedback"
                        className="w-32 h-32 object-cover border"
                      />
                    </div>
                  )}
                </div>
              ))}
              {!showAllFeedback && feedbackList.length >= 3 && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleShowAllFeedback}
                    className="text-black-500 underline"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>

        <BestSeller />

        {/* Drawer giỏ hàng */}
        {showDrawer && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowDrawer(false)}
            />
            <div
              className="fixed top-0 right-0 w-full md:w-[500px] h-full bg-white text-black z-50 flex flex-col"
              style={{ boxShadow: "-2px 0 5px rgba(0,0,0,0.1)" }}
            >
              <div className="p-4 flex items-center justify-between border-b">
                <h2 className="text-lg font-bold">Giỏ hàng của bạn</h2>
                <button onClick={() => setShowDrawer(false)}>
                  <AiOutlineClose className="text-xl" />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
                <p className="text-sm text-center mb-4">
                  Cảm ơn bạn đã tin tưởng FUNKYTOWN
                  <br />
                  HÃY HOÀN TẤT THANH TOÁN NHÉ!
                </p>
                <div className="space-y-4 overflow-auto">
                  {cartItems.map((item) => {
                    const itemTotal = item.discountedPrice * item.quantity;
                    return (
                      <div
                        key={item.productVariantId}
                        className="border p-3 rounded flex items-center justify-between"
                      >
                        {/* Phần ảnh và thông tin sản phẩm */}
                        <div className="flex items-center gap-4">
                          <img
                            src={item.imagePath}
                            alt={item.productName}
                            className="w-20 h-20 object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-500">
                              Size: {item.size} | Màu:{" "}
                              <span
                                className="inline-block w-4 h-4 ml-1 border border-gray-300 align-middle"
                                style={{ backgroundColor: item.color }}
                              />
                            </p>
                            {/* Giá hiển thị với giảm giá (nếu có) */}
                            {item.discountedPrice &&
                            item.discountedPrice < item.price ? (
                              <div className="text-sm flex items-center gap-2">
                                <span className="text-lg font-semibold text-black">
                                  {item.discountedPrice.toLocaleString("vi-VN")}₫
                                </span>
                                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded leading-none">
                                  -{Math.round(((item.price - item.discountedPrice) / item.price) * 100)}%
                                </span>
                                <span className="text-lg text-gray-400 line-through">
                                  {item.price.toLocaleString("vi-VN")}₫
                                </span>
                                <span className="ml-2">x {item.quantity}</span>
                              </div>
                            ) : (
                              <p className="text-sm">
                                {item.price.toLocaleString("vi-VN")}₫ x {item.quantity}
                              </p>
                            )}
                            <p className="text-sm font-medium mt-1">
                              {itemTotal.toLocaleString("vi-VN")}₫
                            </p>
                            {/* Nút tăng/giảm số lượng */}
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() =>
                                  handleEditQuantity(item.productVariantId, -1)
                                }
                                className="px-2 py-1 border text-sm"
                              >
                                -
                              </button>
                              <span className="text-sm">{item.quantity}</span>
                              <button
                                onClick={() =>
                                  handleEditQuantity(item.productVariantId, 1)
                                }
                                className="px-2 py-1 border text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* Nút xóa sản phẩm */}
                        <button
                          onClick={() => handleRemoveItem(item.productVariantId)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <AiOutlineDelete size={20} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Phí ship được cố định 30k cho mỗi đơn hàng.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Tạm tính</span>
                    <span className="font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowDrawer(false);
                      router.push("/cart");
                    }}
                    className="w-full bg-black text-white py-2 font-semibold text-lg"
                  >
                    Thanh Toán
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Drawer: Thông tin sản phẩm */}
        {showInfoDrawer && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowInfoDrawer(false)}
            />
            <div
              className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-white text-black z-50 flex flex-col"
              style={{ boxShadow: "-2px 0 5px rgba(0,0,0,0.1)" }}
            >
              <div className="p-4 flex items-center justify-between border-b">
                <h2 className="text-lg">Thông tin sản phẩm</h2>
                <button onClick={() => setShowInfoDrawer(false)}>
                  <AiOutlineClose className="text-xl" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-auto text-sm text-gray-700">
                <p className="mb-2">Model: {product.model}</p>
                <p className="mb-2">Origin: {product.origin}</p>
                <p className="mb-2">Occasion: {product.occasion}</p>
                <p className="mb-2">Style: {product.style}</p>
                <p className="mb-2">Material: {product.material}</p>
                <div className="mb-2">
                  <span>Description:</span>
                  <p className="text-gray-600 whitespace-pre-line mt-1">{product.description}</p>
                </div>
              </div>
            </div>
          </>
        )}

    

        {/* Drawer: Chính sách đổi trả */}
        {showReturnDrawer && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowReturnDrawer(false)}
            />
            <div
              className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-white text-black z-50 flex flex-col"
              style={{ boxShadow: "-2px 0 5px rgba(0,0,0,0.1)" }}
            >
              <div className="p-4 flex items-center justify-between border-b">
                <h2 className="text-lg">Chính sách đổi trả</h2>
                <button onClick={() => setShowReturnDrawer(false)}>
                  <AiOutlineClose className="text-xl" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-auto text-sm text-gray-700">
                <p className="mb-2">
                  - Thời gian đổi trả trong vòng 7 ngày kể từ khi đơn hàng hoàn thành.
                </p>
                <p className="mb-2">
                  - Sản phẩm đổi trả phải còn nguyên tem, mác, chưa qua sử dụng.
                </p>
                <p className="mb-2">
                  - Quý khách vui lòng liên hệ hotline hoặc fanpage để được hỗ trợ đổi trả.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      <style jsx>{`
        :global(body) {
          font-family: "Poppins", sans-serif;
        }
      `}</style>
    </div>
  );
}
