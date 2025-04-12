"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BestSeller from "@/components/BestSeller/BestSeller";
import productService from "@/services/product.service";
import { Product } from "@/types";

// Hàm format giá tiền (VD: 620.000đ)
const formatPrice = (price: number) => {
  return price.toLocaleString("vi-VN") + "đ";
};

export default function ProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Lấy giá trị category từ URL nếu có (ví dụ: /products?category=áo)
  const initialCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [filterText, setFilterText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Mỗi khi query params thay đổi, cập nhật lại state selectedCategory.
  useEffect(() => {
    const categoryFromQuery = searchParams.get("category") || "";
    setSelectedCategory(categoryFromQuery);
  }, [searchParams]);

  // Gọi API mỗi khi selectedCategory thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response;
        if (selectedCategory) {
          response = await productService.getAllProductsByCategory(selectedCategory, 1, 30);
        } else {
          response = await productService.getAllProducts(1, 30);
        }
        console.log("Full Response:", response);
        console.log("Fetched Products:", response.data);
        setProducts(response.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Lọc sản phẩm theo tên (tìm kiếm trên client)
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Banner */}
      <div className="w-full">
        <img
          src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1743516399/Frame_3_d8lltq.png"
          alt="COLLECTION"
          className="w-full"
        />
      </div>

      <main className="flex-1 px-6 pt-10 lg:px-20">
        {/* Header section với tiêu đề và ô lọc */}
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-lg font-bold uppercase">
            Sản phẩm {selectedCategory ? `- ${selectedCategory}` : ""}
          </h2>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="border border-gray-300 px-3 py-1"
            />
            <select
              value={selectedCategory}
              onChange={(e) => {
                const category = e.target.value;
                setSelectedCategory(category);
                // Đồng bộ URL với lựa chọn của người dùng
                router.push(`/product?category=${encodeURIComponent(category)}`);
              }}
              className="border border-gray-300 px-3 py-1 ml-3"
            >
              <option value="">Tất cả</option>
              <option value="áo">Áo</option>
              <option value="quần">Quần</option>
              <option value="áo khoác">Áo khoác</option>
              <option value="phụ kiện">Phụ kiện</option>
            </select>
          </div>
        </div>

        {/* Grid hiển thị sản phẩm */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            // Tính phần trăm giảm dựa trên giá gốc và giá đã giảm
            const discountPercent = Math.round(
              ((product.price - product.discountedPrice) / product.price) * 100
            );

            return (
              <div
                key={product.productId}
                className="group text-center cursor-pointer border border-transparent hover:border-4 hover:border-[#808080] transition-all duration-300"
                onClick={() => router.push(`/product/${product.productId}`)}
              >
                <div className="overflow-hidden">
                  <img
                    src={product.imagePath}
                    alt={product.name}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Tên sản phẩm */}
                <p className="mt-3 text-sm md:text-base text-gray-500">{product.name}</p>

                {/* Giá sản phẩm */}
                {product.discountedPrice && product.discountedPrice < product.price ? (
                  <div className="flex items-baseline justify-center gap-2 mt-1">
                    <span className="text-base md:text-lg font-semibold text-black">
                      {formatPrice(product.discountedPrice)}
                    </span>
                    <span className="bg-blue-600 text-white text-xs px-1 md:px-2 py-0.5 rounded">
                      -{discountPercent}%
                    </span>
                    <span className="text-sm md:text-base text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ) : (
                  <p className="text-base md:text-lg font-semibold mt-1">
                    {formatPrice(product.price)}
                  </p>
                )}

                {/* Hiển thị màu sắc (swatches) */}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex justify-center space-x-2 mt-2">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="inline-block w-4 h-4 border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BestSeller nếu cần */}
        <BestSeller />
      </main>

      <Footer />
    </div>
  );
}
