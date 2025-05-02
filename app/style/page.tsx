"use client";

import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";

import ProductService from "@/services/product.service";
import { PreferredStyle } from "@/types";

export default function StylePage() {
  const [styles, setStyles] = useState<PreferredStyle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const raw = getCookie("accountId");
  const accountId = raw
    ? Number(Array.isArray(raw) ? raw[0] : raw)
    : undefined;

  useEffect(() => {
    if (!accountId) {
      toast.error("Không tìm thấy accountId trong cookie.");
      setLoading(false);
      return;
    }
    ProductService.getPreferredStyles(accountId)
      .then((resp) => {
        if (resp.data.status) setStyles(resp.data.data);
        else toast.error(resp.data.message);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Lỗi khi gọi API.");
      })
      .finally(() => setLoading(false));
  }, [accountId]);

  const handleToggle = (styleId: number) =>
    setStyles((prev) =>
      prev.map((s) =>
        s.styleId === styleId ? { ...s, isSelected: !s.isSelected } : s
      )
    );

  const handleSave = async () => {
    if (!accountId) return;
    const selectedIds = styles.filter((s) => s.isSelected).map((s) => s.styleId);

    setSaving(true);
    try {
      const resp = await ProductService.updatePreferredStyles(
        accountId,
        selectedIds
      );
      if (resp.data.status) toast.success(resp.data.message);
      else toast.error(resp.data.message);
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi khi cập nhật server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Đang tải...</p>
      </div>
    );

  const chosen = styles.filter((s) => s.isSelected);
  const notChosen = styles.filter((s) => !s.isSelected);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex flex-1 pt-24">
        <div className="container mx-auto flex gap-10 px-10">
          <Sidebar />

          <section className="w-full md:w-3/4 bg-white p-8 shadow-md">
            <h1 className="text-2xl font-semibold mb-6">
              Chọn phong cách yêu thích
            </h1>

            {/* Đã chọn */}
            <div className="mb-4">
              <h2 className="font-medium mb-2">Đã chọn</h2>
              <div className="flex flex-wrap gap-2">
                {chosen.length > 0 ? (
                  chosen.map((s) => (
                    <button
                      key={s.styleId}
                      onClick={() => handleToggle(s.styleId)}
                      className="px-4 py-2 bg-black text-white rounded-full flex items-center gap-2"
                    >
                      {s.styleName}
                      <span className="font-bold">×</span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">Chưa có style nào được chọn</p>
                )}
              </div>
            </div>

            {/* Chưa chọn */}
            <div className="mb-6">
              <h2 className="font-medium mb-2">Chưa chọn</h2>
              <div className="flex flex-wrap gap-2">
                {notChosen.map((s) => (
                  <button
                    key={s.styleId}
                    onClick={() => handleToggle(s.styleId)}
                    className="px-4 py-2 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-100 transition"
                  >
                    {s.styleName}
                  </button>
                ))}
              </div>
            </div>

            {/* Lưu */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-black text-white rounded-full disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
