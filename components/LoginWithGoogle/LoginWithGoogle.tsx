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
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse?.credential;
    console.log("[LoginWithGoogle] idToken:", idToken);
    if (!idToken) {
      toast.error("Không nhận được ID Token từ Google.");
      return;
    }

    try {
      const payload: GoogleLoginRequest = { idToken };
      const res = await loginService.postGoogleLogin(payload);

      // Debug response
      console.log("[LoginWithGoogle] full response:", res);
      console.log("[LoginWithGoogle] response.data:", res.data);

      const body: GoogleLoginResponse = res.data;

      // Nếu BE có trả status/message, bạn có thể kiểm tra thêm:
      if (body.status === false) {
        toast.error(body.message || "Đăng nhập Google thất bại");
        return;
      }

      // Lấy token + account trực tiếp từ root của response
      const { token, account } = body;
      if (!token) {
        toast.error("Không lấy được token từ server");
        return;
      }

      setCookie("token", token, { maxAge: 60 * 60 * 24 });
      setCookie("accountId", account.accountId, { maxAge: 60 * 60 * 24 });
      setCookie("userName", account.fullName, { maxAge: 60 * 60 * 24 });

      toast.success("Đăng nhập Google thành công!");
      router.push("/");
    } catch (err) {
      console.error("Lỗi Google‑login:", err);
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