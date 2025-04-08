"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { FcGoogle } from "react-icons/fc";
import loginService from "@/services/login.service";
import { LoginRequest } from "@/types";
import { setCookie } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LogInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: LoginRequest = {
      email,
      password,
    };

    try {
      const response = await loginService.postLogin(payload);
      console.log("Login response (full):", response);
      console.log("Login response.data:", response.data);

      if (response.data.status) {
        // Lấy message từ BE và hiển thị toast
        toast.success(response.data.message);

        // Lấy token từ response
        const token = response.data.data?.token;
        if (token) {
          setCookie("token", token, { maxAge: 60 * 60 * 24 }); // 1 ngày
        }

        // Lấy thông tin account: fullName và accountId
        const account = response.data.data?.account;
        if (account) {
          if (account.fullName) {
            setCookie("userName", account.fullName, { maxAge: 60 * 60 * 24 });
          }
          if (account.accountId) {
            setCookie("accountId", account.accountId, { maxAge: 60 * 60 * 24 });
          }
        }

        // Lấy redirect từ query parameter, nếu không có thì redirect về trang chủ
        const redirect = searchParams.get("redirect") || "/";
        router.push(redirect);
      } else {
        console.log("BE error message:", response.data.message);
        toast.error(response.data.message);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      console.log("Error detail:", err.response?.data);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="grid max-w-4xl grid-cols-1 md:grid-cols-2 overflow-hidden rounded-lg bg-white shadow-lg">
          {/* Hình ảnh bên trái */}
          <div className="hidden md:flex items-center justify-center bg-blue-50 p-6">
            <Image
              src="https://levents.asia/cdn/shop/files/L1240512-min.jpg?v=1730359132&width=500"
              alt="Shopping Illustration"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
          {/* Form đăng nhập bên phải */}
          <div className="w-full p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-center">Đăng nhập</h2>
            <p className="text-gray-500 text-center mt-2">
              Đăng nhập vào tài khoản của bạn
            </p>
            <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md hover:opacity-90"
              >
                Đăng nhập
              </button>
            </form>
            <div className="mt-4 text-center">
              <button className="flex w-full items-center justify-center border py-2 rounded-md hover:bg-gray-100">
                <FcGoogle className="mr-2 text-2xl" /> Đăng nhập bằng Google
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
