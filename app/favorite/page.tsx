"use client";

import React, { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import productService from "@/services/product.service";
import { FavoriteProduct } from "@/types";
import { useRouter } from "next/navigation";


export default function FavoritePage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const accId = getCookie("accountId");
      if (!accId) {
        toast.error("Bạn chưa đăng nhập!");
        setLoading(false);
        return;
      }
      try {
        const res = await productService.getAllFavoriteProducts(Number(accId));
        if (res.data.status) {
          setFavorites(res.data.data);
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast.error("Có lỗi xảy ra khi lấy danh sách yêu thích");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  // Hàm xóa yêu thích (nếu cần) - hoặc gọi API xóa
  const removeFavorite = async (productId: number) => {
    const accId = getCookie("accountId");
    if (!accId) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }
    try {
      const res = await productService.deleteFavoriteProduct(Number(accId), productId);
      if (res.data.status) {
        toast.success(res.data.message);
        // Cập nhật lại danh sách favorites sau khi xóa
        setFavorites((prev) => prev.filter((item) => item.productId !== productId));
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      console.error("Error deleting favorite:", error);
      toast.error("Có lỗi xảy ra khi xóa yêu thích!");
    }
  };
  

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="pt-20 px-4 container mx-auto flex-1">
        {/* Tiêu đề trang + nút tạo danh sách mới */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Danh sách yêu thích của tôi</h1>
        </div>

        {/* Tabs: Danh sách yêu thích / Chỉnh sửa */}
        <div className="flex space-x-4 border-b mb-6">
        </div>

        {loading ? (
         <div className="flex items-center justify-center h-screen">
         <img
           src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1741405966/z6323749454613_8d6194817d47210d63f49e97d9b4ad22_oqwewn.jpg"
           alt="Loading..."
           className="w-16 h-16 animate-spin"
         />
       </div>
        ) : (
          <div>
            {favorites.length === 0 ? (
              <p className="text-gray-500">Không có sản phẩm yêu thích nào.</p>
            ) : (
              <div>
                {/* Thanh công cụ: Chọn tất cả, Chọn sản phẩm, Sao chép danh sách */}
                <div className="flex justify-between mb-4 text-gray-500 text-sm">
                  <span>Danh sách yêu thích hiện tại có {favorites.length} sản phẩm</span>
                  <div className="flex space-x-2">
                  </div>
                </div>

                {/* Hiển thị danh sách sản phẩm yêu thích */}
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((item) => (
                    <li
                      key={item.productId}
                      className="border p-3 rounded flex flex-col"
                    >
                      {/* Ảnh sản phẩm */}
                      <img onClick={() => router.push(`/product/${item.productId}`)}
                        src={item.imagePath}
                        alt={item.name}
                        className="w-full h-auto object-cover mb-3"
                      />
                      {/* Tên sản phẩm */}
                      <p className="text-lg font-semibold line-clamp-2 mb-2">
                        {item.name}
                      </p>
                      {/* Giá (có giảm giá thì hiển thị badge % và giá gốc gạch ngang) */}
                      <div className="mb-2">
                        {item.discountedPrice && item.discountedPrice < item.price ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 font-semibold">
                              {item.discountedPrice.toLocaleString("vi-VN")}₫
                            </span>
                            <span className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded leading-none">
                              -{Math.round(((item.price - item.discountedPrice) / item.price) * 100)}%
                            </span>
                            <span className="line-through text-sm text-gray-400">
                              {item.price.toLocaleString("vi-VN")}₫
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-800">
                            {item.price.toLocaleString("vi-VN")}₫
                          </span>
                        )}
                      </div>
                      {/* Nút thêm vào giỏ hàng / Xóa khỏi yêu thích (tùy ý) */}
                      <div className="mt-auto flex space-x-2">
                        <button  onClick={() => router.push(`/product/${item.productId}`)}  className="bg-black text-white px-3 py-2 rounded-md">
                          Thêm vào giỏ hàng
                          
                        </button>
                        <button
                          onClick={() => removeFavorite(item.productId)}
                          className="border border-red-500 text-red-500 px-3 py-2 rounded-md hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
