"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BestSeller from "@/components/BestSeller/BestSeller";
import Suggest from "@/components/Suggest/Suggest";

import productService from "@/services/product.service";
import { Product } from "@/types";

// format giá theo VNĐ
const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

export default function ProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // value category từ query
  const initialCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterText, setFilterText] = useState("");

  // accountId lấy từ cookie
  const raw = getCookie("accountId");
  const accountId = raw
    ? Number(Array.isArray(raw) ? raw[0] : raw)
    : undefined;

  // sync category khi URL thay đổi
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  // fetch product khi category thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const resp = selectedCategory
          ? await productService.getAllProductsByCategory(
              selectedCategory,
              1,
              30
            )
          : await productService.getAllProducts(1, 30);

        setProducts(resp.data.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // filter theo tên
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // khi click vào 1 product
  const handleClick = (productId: number) => {
    if (accountId) {
      productService
        .postInteraction(accountId, productId)
        .catch((_) => {
          /* swallow error */
        });
    }
    router.push(`/product/${productId}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-6 pt-24 lg:px-20">
        {/* Tiêu đề + filter */}
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-lg font-bold uppercase">
            Sản phẩm {selectedCategory && `- ${selectedCategory}`}
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
                const cat = e.target.value;
                setSelectedCategory(cat);
                router.push(`/product?category=${encodeURIComponent(cat)}`);
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

        {/* Grid sản phẩm */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const discountPercent = product.discountedPrice
              ? Math.round(
                  ((product.price - product.discountedPrice) /
                    product.price) *
                    100
                )
              : 0;

            return (
              <div
                key={product.productId}
                className="group text-center cursor-pointer border border-transparent hover:border-4 hover:border-gray-300 transition-all duration-300"
                onClick={() => handleClick(product.productId)}
              >
                <div className="overflow-hidden">
                  <img
                    src={product.imagePath}
                    alt={product.name}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <p className="mt-3 text-sm md:text-base text-gray-500">
                  {product.name}
                </p>

                {product.discountedPrice < product.price ? (
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

                {product.colors?.length > 0 && (
                  <div className="flex justify-center space-x-2 mt-2">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="inline-block w-4 h-4 border border-gray-300 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <BestSeller />
        <Suggest />
      </main>

      <Footer />
    </div>
  );
}
