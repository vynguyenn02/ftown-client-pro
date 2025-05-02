// lib/useRequireAuth.tsx
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // chưa login → giữ lại đường dẫn và chuyển đến /login
      router.replace({
        pathname: "/login",
        query: { from: router.asPath },
      });
    }
  }, [router]);
}
