"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProductService from "@/services/product.service";
import { Product as APIProduct } from "@/types"; // Lấy kiểu Product gốc

// Nếu muốn giữ interface riêng, bạn có thể định nghĩa dưới đây.
// (Hoặc dùng trực tiếp kiểu Product từ "@/types" và bỏ map() chuyển đổi).
interface Product {
  productId: number;
  productName: string;
  imagePath: string;
  price: number;
  discountedPrice: number;
  categoryName: string;
  colors: string[];
}

// Hàm format giá tiền (VD: 620.000đ)
const formatPrice = (price: number): string => {
  return price.toLocaleString("vi-VN") + "đ";
};

export default function BestSeller() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Gọi API getBestSellerProducts với top = 4
    ProductService.getBestSellerProducts(4)
      .then((response) => {
        // Map lại nếu type khác nhau (Product với ProductName)
        const transformedProducts: Product[] = response.data.data.map(
          (p: APIProduct) => ({
            productId: p.productId,
            productName: p.productName, // Lấy từ p.name
            imagePath: p.imagePath,
            price: p.price,
            discountedPrice: p.discountedPrice,
            categoryName: p.categoryName,
            colors: p.colors,
          })
        );
        setProducts(transformedProducts);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching best seller products:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mt-10 w-full px-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex space-x-6 text-xl font-semibold">
          <span className="border-b-2 border-black pb-1">BEST SELLER</span>
          
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
            // Tính phần trăm giảm
            const discountPercent =
              product.discountedPrice < product.price
                ? Math.round(
                    ((product.price - product.discountedPrice) / product.price) *
                      100
                  )
                : 0;

            return (
              <div
                key={product.productId}
                // Thêm text-center vào container
                className="group cursor-pointer text-center border border-transparent hover:border-4 hover:border-gray-300 transition-all duration-300"
                onClick={() => router.push(`/product/${product.productId}`)}
              >
                {/* Ảnh sản phẩm */}
                <div className="relative h-[300px] w-full overflow-hidden">
                  <Image
                    src={product.imagePath}
                    alt={product.productName}
                    layout="fill"
                    objectFit="contain"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Khối thông tin sản phẩm */}
                <div className="mt-3 px-2">
                  {/* Tên sản phẩm */}
                  <p className="text-sm md:text-base text-gray-600">
                    {product.productName}
                  </p>

                  {/* Giá sản phẩm (discount nếu có) */}
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
                </div>

                {/* Màu sắc (nếu có) */}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex justify-center space-x-2 mt-2">
                    {product.colors.map((color, index) => (
                      <span
                        key={index}
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
