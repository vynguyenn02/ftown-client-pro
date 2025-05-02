"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCookie } from "cookies-next";
import ProductService from "@/services/product.service";
import { Product as APIProduct } from "@/types";

interface Product {
  productId: number;
  productName: string;
  imagePath: string;
  price: number;
  discountedPrice: number;
  categoryName: string;
  colors: string[];
}

// format giá theo VNĐ
const formatPrice = (price: number) =>
  price.toLocaleString("vi-VN") + "đ";

export default function Suggest() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const raw = getCookie("accountId");
    const accountId = raw
      ? Number(Array.isArray(raw) ? raw[0] : raw)
      : undefined;
    if (!accountId) return;

    setLoading(true);
    ProductService.getAllSuggest(accountId)
      .then((res) => {
        const list: Product[] = res.data.data.map((p: APIProduct) => ({
          productId: p.productId,
          productName: p.name,        // p.name từ API
          imagePath: p.imagePath,
          price: p.price,
          discountedPrice: p.discountedPrice,
          categoryName: p.categoryName,
          colors: p.colors,
        }));
        setProducts(list);
      })
      .catch((err) => {
        console.error("Error fetching suggest products:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-10 w-full px-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex space-x-6 text-xl font-semibold">
          <span className="border-b-2 border-black pb-1">
            CÓ THỂ BẠN SẼ THÍCH
          </span>
        </div>
      </div>

      {/* Product List */}
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        {loading ? (
          <div className="flex items-center justify-center h-64 w-full">
            <img
              src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1741405966/z6323749454613_8d6194817d47210d63f49e97d9b4ad22_oqwewn.jpg"
              alt="Loading..."
              className="w-16 h-16 animate-spin"
            />
          </div>
        ) : (
          products.map((product) => {
            const discountPercent =
              product.discountedPrice < product.price
                ? Math.round(
                    ((product.price - product.discountedPrice) /
                      product.price) *
                      100
                  )
                : 0;

            return (
              <div
                key={product.productId}
                className="group cursor-pointer text-center border border-transparent hover:border-4 hover:border-gray-300 transition-all duration-300"
                onClick={() =>
                  router.push(`/product/${product.productId}`)
                }
              >
                {/* Image */}
                <div className="relative h-[300px] w-full overflow-hidden">
                  <Image
                    src={product.imagePath}
                    alt={product.productName}
                    fill
                    style={{ objectFit: "contain" }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Info */}
                <div className="mt-3 px-2">
                  <p className="text-sm md:text-base text-gray-600">
                    {product.productName}
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
                </div>

                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="flex justify-center space-x-2 mt-2">
                    {product.colors.map((color, i) => (
                      <span
                        key={i}
                        className="inline-block w-4 h-4 border border-gray-300 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
