"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dropdown, Menu, Badge, Input, AutoComplete } from "antd";
import Link from "next/link";
import { getCookie, deleteCookie } from "cookies-next";
import {
  HeartOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import cartService from "@/services/cart.service";
import ProductService from "@/services/product.service";
import { Product } from "@/types";
import { useNotification } from "@/contexts/NotificationContextProps";

let bc: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  bc = new BroadcastChannel("funky-logout");
}

export default function Header() {
  const router = useRouter();
  const [showLogo, setShowLogo] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // Lấy notificationCount & notifications từ context
  const { notificationCount, persistentNotifications } = useNotification();

  // State để toggle dropdown thông báo
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowLogo((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = getCookie("token");
    const storedName = getCookie("userName");
    if (token && storedName) {
      setUserName(storedName as string);
    }
    const accId = getCookie("accountId");
    if (accId) {
      const accountId = Number(accId);
      console.log("Header: Fetching cart for accountId =", accountId);
      cartService
        .getCart(accountId)
        .then((res) => {
          if (res.data.status) {
            const total = res.data.data.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            setCartCount(total);
          }
        })
        .catch((err) => {
          console.error("Error fetching cart for header:", err);
        });
    }
  }, []);

  // Lắng nghe logout broadcast
  useEffect(() => {
    if (bc) {
      bc.onmessage = (ev) => {
        if (ev.data === "logout") {
          setCartCount(0);
        } else if (ev.data === "cartUpdated") {
          const accId = getCookie("accountId");
          if (accId) {
            const accountId = Number(accId);
            cartService.getCart(accountId)
              .then((res) => {
                if (res.data.status) {
                  const total = res.data.data.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );
                  setCartCount(total);
                }
              })
              .catch((err) => {
                console.error("Error updating cart count:", err);
              });
          }
        }
      };
    }
    return () => {
      if (bc) bc.onmessage = null;
    };
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    deleteCookie("token");
    deleteCookie("userName");
    deleteCookie("accountId");
    setUserName(null);
    setCartCount(0);
    if (bc) {
      bc.postMessage("logout");
    }
    router.push("/login");
  };

  const userMenu = (
    <Menu
      items={[
        !userName
          ? {
              key: "signup",
              label: <Link href="/signup">Sign Up</Link>,
            }
          : null,
        !userName
          ? {
              key: "login",
              label: <Link href="/login">Login</Link>,
            }
          : null,
        userName && {
          key: "profile",
          label: <Link href="/profile">Xin chào, {userName}</Link>,
        },
        userName && {
          key: "logout",
          label: (
            <button onClick={handleLogout} className="w-full text-left">
              Logout
            </button>
          ),
        },
      ].filter(Boolean) as any}
      className="!bg-transparent text-black shadow-lg border border-gray-300 backdrop-blur-md"
    />
  );

  const shopMenu = (
    <div className="absolute left-0 top-full hidden w-44 bg-transparent text-black shadow-lg border border-gray-300 backdrop-blur-md group-hover:block">
      <Link
        href="/product?category=áo"
        className="block px-4 py-2 hover:bg-gray-200"
      >
        Áo
      </Link>
      <Link
        href="/product?category=quần"
        className="block px-4 py-2 hover:bg-gray-200"
      >
        Quần
      </Link>
      <Link
        href="/product?category=áo khoác"
        className="block px-4 py-2 hover:bg-gray-200"
      >
        Áo khoác
      </Link>
      <Link
        href="/product?category=phụ kiện"
        className="block px-4 py-2 hover:bg-gray-200"
      >
        Phụ kiện
      </Link>
    </div>
  );

  const handleSearch = (value: string) => {
    if (!value) {
      setSearchResults([]);
      return;
    }
    ProductService.getAllProducts(1, 30)
      .then((res) => {
        if (res.data.status) {
          const filtered = res.data.data.filter((product: Product) =>
            product.name.toLowerCase().includes(value.toLowerCase())
          );
          setSearchResults(filtered);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  };

  const handleSelect = (value: string, option: any) => {
    if (option.productId) {
      router.push(`/product/${option.productId}`);
    }
  };

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full bg-[#F5F5F2B3] shadow-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="relative flex h-12 w-48 items-center justify-center">
            <Link
              href="/"
              className="absolute left-0 top-0 flex h-full w-full items-center justify-center"
            >
              <div
                className={`absolute transition-opacity duration-700 ${
                  showLogo ? "opacity-0" : "opacity-100"
                }`}
              >
                <h1 className="whitespace-nowrap text-xl font-bold graffiti-font">
                  FUNKYTOWN GALLERY
                </h1>
              </div>
              <div
                className={`absolute transition-opacity duration-700 ${
                  showLogo ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1741405966/z6323749454613_8d6194817d47210d63f49e97d9b4ad22_oqwewn.jpg"
                  alt="FUNKYTOWN GALLERY Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Menu */}
          <nav>
            <ul className="flex space-x-8">
              <li className="group relative">
                <Link href="/product" className="relative font-medium text-black">
                  Shop
                </Link>
                {shopMenu}
              </li>
              <li>
                <Link
                  href="/contact"
                  className="relative font-medium text-black hover:underline"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/aboutus"
                  className="relative font-medium text-black hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                
              </li>
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 relative">
            {/* Search */}
            <AutoComplete
              options={searchResults.map((product) => ({
                value: product.name,
                label: (
                  <div className="flex items-center">
                    <img
                      src={product.imagePath}
                      alt={product.name}
                      className="w-10 h-10 object-cover mr-3"
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.price}</div>
                    </div>
                  </div>
                ),
                productId: product.productId,
              }))}
              onSearch={handleSearch}
              onSelect={handleSelect}
              placeholder="What are you looking for?"
              style={{ width: 240 }}
              dropdownClassName="big-dropdown"
            >
              <Input suffix={<SearchOutlined />} />
            </AutoComplete>

            {/* Favorite */}
            <Link href="/favorite">
              <HeartOutlined className="cursor-pointer text-xl hover:text-black" />
            </Link>

               {/* Notifications (Chuông) */}
          <div className="relative" ref={dropdownRef}>
            <Badge count={notificationCount} showZero>
              <BellOutlined
                className="cursor-pointer text-xl hover:text-black"
                onClick={() => setShowNotifications((prev) => !prev)}
              />
            </Badge>

           {/* Dropdown Thông báo sử dụng persistentNotifications */}
            {showNotifications && (
              <div className="absolute right-0 top-8 mt-2 w-80 bg-white shadow-md rounded p-4 z-50 max-h-80 overflow-y-auto">
                <h3 className="font-bold text-lg mb-2">Thông báo</h3>
                {persistentNotifications.length === 0 ? (
                  <div className="text-gray-500">Không có thông báo nào.</div>
                ) : (
                  persistentNotifications.map((noti, index) => (
                    <div key={index} className="border-b last:border-none mb-2 pb-2">
                      <div className="font-medium">{noti.title}</div>
                      <div className="text-sm text-gray-700">{noti.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {noti.receivedAt.toLocaleString("vi-VN")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
            {/* Cart */}
            <Link href="/cart">
              <Badge count={cartCount} showZero>
                <ShoppingCartOutlined className="cursor-pointer text-xl hover:text-black" />
              </Badge>
            </Link>

            {/* User Icon: nếu đã login thì dẫn thẳng qua /profile */}
            <Dropdown overlay={userMenu} trigger={["hover"]}>
  <UserOutlined
    className="text-xl hover:text-black cursor-pointer"
    onClick={userName ? () => router.push("/profile") : undefined}
  />
</Dropdown>
        </div>
        </div>
      </header>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap");
        .graffiti-font {
          font-family: "Permanent Marker", cursive;
        }
      `}</style>

      <style jsx global>{`
        .big-dropdown {
          width: 400px !important;
        }
        .big-dropdown .ant-select-item {
          padding: 16px 20px !important;
          font-size: 18px !important;
        }
        .big-dropdown .ant-select-item-option-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .big-dropdown .ant-select-item-option-content img {
          width: 500px !important;
          height: 50px !important;
        }
      `}</style>
    </>
  );
}
