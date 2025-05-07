"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import registerService from "@/services/signup.service";
import { RegisterRequest } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Mật khẩu phải có ít nhất một ký tự viết hoa";
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd)) {
      return "Mật khẩu phải có ít nhất một ký tự đặc biệt";
    }
    return null;
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    // validate ngay khi nhập
    setPasswordError(validatePassword(pwd));
    // nếu confirm đã nhập rồi thì cũng re-validate confirm
    if (confirmPassword) {
      setConfirmError(pwd === confirmPassword ? null : "Xác nhận mật khẩu không khớp");
    }
  };

  const handleConfirmChange = (cpwd: string) => {
    setConfirmPassword(cpwd);
    setConfirmError(cpwd === password ? null : "Xác nhận mật khẩu không khớp");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // nếu vẫn còn lỗi
    const pwdErr = validatePassword(password);
    const cpErr = password === confirmPassword ? null : "Xác nhận mật khẩu không khớp";

    setPasswordError(pwdErr);
    setConfirmError(cpErr);

    if (pwdErr || cpErr) {
      return; // không submit nếu còn error
    }

    const payload: RegisterRequest = {
      username,
      email,
      password,
      isActive: true,
    };

    try {
      const response = await registerService.postRegister(payload);
      if (response.data.status) {
        toast.success(response.data.message);
        router.push("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (err: any) {
      console.error("Register error:", err);
      const msg = err.response?.data?.message ?? "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(msg);
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
              src="https://images.pexels.com/photos/5325589/pexels-photo-5325589.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Shopping Illustration"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
          {/* Form đăng ký bên phải */}
          <div className="w-full p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-center">Tạo tài khoản</h2>
            <p className="text-gray-500 text-center mt-2">Đăng ký tài khoản mới để tiếp tục</p>
            <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Tên đăng nhập"
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-gray-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div>
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-gray-300
                    ${passwordError ? "border-red-500" : ""}`}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-gray-300
                    ${confirmError ? "border-red-500" : ""}`}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmChange(e.target.value)}
                  required
                />
                {confirmError && (
                  <p className="text-red-500 text-sm mt-1">{confirmError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md hover:opacity-90"
              >
                Đăng Ký
              </button>
            </form>
            <div className="mt-4 text-center">
              <button className="flex w-full items-center justify-center border py-2 rounded-md hover:bg-gray-100">
                <FcGoogle className="mr-2 text-2xl" /> Đăng ký bằng Google
              </button>
            </div>
            <p className="mt-6 text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-blue-500 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
