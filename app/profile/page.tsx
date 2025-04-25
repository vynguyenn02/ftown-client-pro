"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import ProfileService from "@/services/profile.service";
import { Profile } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dob, setDob] = useState<Date | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});

  useEffect(() => {
    const acc = getCookie("accountId");
    if (!acc) { setLoading(false); return; }
    ProfileService.getCustomerProfile(Number(acc))
      .then(res => {
        if (res.data.status) {
          const p = res.data.data as Profile;
          setProfile(p);
          setDob(new Date(p.dateOfBirth));
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => toast.error("Lỗi khi tải hồ sơ"))
      .finally(() => setLoading(false));
  }, []);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!/^[\w.%+-]+@gmail\.com$/i.test(value)) {
          return 'Email phải thuộc miền @gmail.com';
        }
        break;
      case 'phoneNumber':
        if (!/^\d{10}$/.test(value)) {
          return 'Số điện thoại phải có đúng 10 chữ số';
        }
        break;
      case 'fullName':
        if (!value.trim()) {
          return 'Họ và tên không được bỏ trống';
        }
        break;
    }
    return '';
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(e.target.files?.[0] ?? null);
  };

  const handleDob = (date: Date | null) => {
    setDob(date);
    if (!profile) return;
    const dateStr = date?.toISOString().slice(0, 10) ?? '';
    setProfile({ ...profile, dateOfBirth: dateStr });
    setErrors(prev => {
      const { dateOfBirth, ...rest } = prev;
      if (!date) return { ...rest, dateOfBirth: 'Vui lòng chọn ngày sinh' };
      return rest;
    });
  };

  const isFormValid = () => {
    if (!profile) return false;
    const newErrs: typeof errors = {};
    ['fullName','email','phoneNumber'].forEach(field => {
      const v = (profile as any)[field] || '';
      const err = validateField(field, v);
      if (err) newErrs[field as keyof Profile] = err;
    });
    if (!dob) newErrs.dateOfBirth = 'Vui lòng chọn ngày sinh';
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSave = async () => {
    if (!profile || !isFormValid()) {
      toast.error('Vui lòng sửa các lỗi trong form');
      return;
    }
    const acc = getCookie('accountId');
    if (!acc) { toast.error('Thiếu accountId'); return; }
    const fd = new FormData();
    fd.append('fullName', profile.fullName);
    fd.append('email', profile.email);
    fd.append('phoneNumber', profile.phoneNumber || '');
    fd.append('address', profile.address || '');
    fd.append('dateOfBirth', dob?.toISOString().slice(0,10) ?? '');
    fd.append('gender', profile.gender || '');
    fd.append('preferredPaymentMethod', profile.preferredPaymentMethod || '');
    if (avatarFile) fd.append('avatarImage', avatarFile, avatarFile.name);

    try {
      const res = await ProfileService.editCustomerProfile(Number(acc), fd);
      if (res.data.status && res.data.data.success) {
        toast.success('Cập nhật hồ sơ thành công');
      } else {
        toast.error(`Lỗi: ${res.data.data.message}`);
      }
    } catch {
      toast.error('Đã có lỗi khi lưu hồ sơ');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex flex-1 pt-24">
        <div className="container mx-auto flex gap-10 px-10">
          <Sidebar />
          <section className="w-full md:w-3/4 bg-white p-8 shadow-md ">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Chỉnh sửa hồ sơ</h2>

            {loading 
              ? <p>Đang tải...</p> 
              : !profile 
                ? <p>Không tìm thấy hồ sơ</p> 
                : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div>
                  <label className="block mb-1 font-medium">Họ và tên</label>
                  <input
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInput}
                    className={`w-full p-3 border rounded ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleInput}
                    className={`w-full p-3 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-1 font-medium">Số điện thoại</label>
                  <input
                    name="phoneNumber"
                    value={profile.phoneNumber || ''}
                    onChange={handleInput}
                    className={`w-full p-3 border rounded ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block mb-1 font-medium">Địa chỉ</label>
                  <input
                    name="address"
                    value={profile.address || ''}
                    onChange={handleInput}
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block mb-1 font-medium">Ngày sinh</label>
                  <DatePicker
                    selected={dob}
                    onChange={handleDob}
                    dateFormat="yyyy-MM-dd"
                    className={`w-full p-3 border rounded ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block mb-1 font-medium">Giới tính</label>
                  <select
                    name="gender"
                    value={profile.gender || ''}
                    onChange={handleInput}
                    className="w-full p-3 border border-gray-300 rounded bg-white"
                  >
                    <option value="" disabled>Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Preferred Payment */}
                <div>
                  <label className="block mb-1 font-medium">Phương thức thanh toán</label>
                  <select
                    name="preferredPaymentMethod"
                    value={profile.preferredPaymentMethod || ''}
                    onChange={handleInput}
                    className="w-full p-3 border border-gray-300 rounded bg-white"
                  >
                    <option value="" disabled>Chọn phương thức</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="PAYOS">PayOS</option>
                  </select>
                </div>

                {/* Avatar Upload (span full width) */}
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Ảnh đại diện</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="block w-full text-sm text-gray-600"
                  />
                </div>

              </div>
            )}

            {/* Buttons */}
            {!loading && profile && (
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={!profile}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  Lưu
                </button>
              </div>
            )}

          </section>
        </div>
      </main>
      <Footer />
    </div>
);
}
