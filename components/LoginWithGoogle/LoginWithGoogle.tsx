"use client";

import React from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import toast from "react-hot-toast";
import { env } from "@/env.mjs";

import loginService from "@/services/login.service";
import { GoogleLoginRequest, GoogleLoginResponse } from "@/types";

export default function LoginWithGoogle() {
  const router = useRouter();
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      toast.error("Không nhận được ID Token từ Google.");
      return;
    }

    try {
      const payload: GoogleLoginRequest = { idToken };
      const res = await loginService.postGoogleLogin(payload);

      // 1) Kiểm tra HTTP-level status
      const rootStatus = res.data.status;
      const rootMessage = res.data.message;
      if (!rootStatus) {
        toast.error(rootMessage || "Đăng nhập Google thất bại");
        return;
      }

      // 2) Kiểm tra inner success
      const inner = (res.data as GoogleLoginResponse).data;
      if (!inner.success) {
        toast.error(inner.errors.join(", ") || "Không thể đăng nhập bằng Google");
        return;
      }

      // 3) Lấy token và account từ inner.data
      const { token, account } = inner;
      if (!token) {
        toast.error("Server không trả về token");
        return;
      }

      // 4) Lưu cookie và chuyển trang
      setCookie("token", token, { maxAge: 60 * 60 * 24 });
      setCookie("accountId", account.accountId.toString(), { maxAge: 60 * 60 * 24 });
      setCookie("userName", account.fullName, { maxAge: 60 * 60 * 24 });

      toast.success("Đăng nhập Google thành công!");
      router.push("/");
    } catch (err) {
      console.error("Lỗi Google-login:", err);
      toast.error("Không thể kết nối đến server.");
    }
  };

  const handleError = () => {
    toast.error("Đăng nhập Google thất bại");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex justify-center mt-4">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
    </GoogleOAuthProvider>
  );
}