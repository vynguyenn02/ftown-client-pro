"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import { getCookie } from "cookies-next";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import ProfileService from "@/services/profile.service";
import { Profile, EditProfileRequest } from "@/types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [formData, setFormData] = useState<Profile | null>(null);
  const [dob, setDob] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Khi fetch profile thành công, chuyển đổi dateOfBirth từ string "YYYY-MM-DD" sang Date
  useEffect(() => {
    const accountIdCookie = getCookie("accountId");
    if (accountIdCookie) {
      const accountId = Number(accountIdCookie);
      ProfileService.getCustomerProfile(accountId)
        .then((res) => {
          if (res.data.status) {
            const profileData = res.data.data;
            // dateOfBirth là string "YYYY-MM-DD"
            const d = profileData.dateOfBirth;
            setFormData(profileData);
            setDob(d ? new Date(d) : null);
          }
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
          toast.error("Có lỗi xảy ra khi lấy thông tin hồ sơ!");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Cập nhật các trường input khác
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Cập nhật ngày sinh khi chọn từ react-datepicker
  const handleDobChange = (date: Date | null) => {
    setDob(date);
    if (!formData) return;
    // Nếu date = null, dùng chuỗi rỗng
    const dateStr: string = date?.toISOString().split("T")[0] ?? "";
    setFormData({
      ...formData,
      dateOfBirth: dateStr,
    });
  };

  // Hàm gọi API edit profile sử dụng toast để hiển thị response từ backend
  const handleSave = () => {
    if (!formData) return;

    const accountIdCookie = getCookie("accountId");
    if (!accountIdCookie) return;

    const accountId = Number(accountIdCookie);

    // Sử dụng dob hoặc formData.dateOfBirth (đã được cập nhật) làm chuỗi "YYYY-MM-DD"
    const dateStr: string = dob?.toISOString().split("T")[0] ?? "";

    const editRequest: EditProfileRequest = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      dateOfBirth: dateStr,
      gender: formData.gender,
      customerType: formData.customerType,
      preferredPaymentMethod: formData.preferredPaymentMethod,
    };

    ProfileService.editCustomerProfile(accountId, editRequest)
      .then((res) => {
        console.log("Edit response:", res.data);
        if (res.data.status && res.data.data.success) {
          toast.success("Cập nhật hồ sơ thành công!");
        } else {
          toast.error("Cập nhật hồ sơ thất bại: " + res.data.message);
        }
      })
      .catch((err) => {
        console.error("Error editing profile:", err);
        toast.error("Đã có lỗi xảy ra khi cập nhật hồ sơ!");
      });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex flex-1 justify-center pt-20">
        <div className="container mx-auto flex gap-8 p-6">
          <Sidebar />

          {/* Profile Form */}
          <section className="w-3/4 bg-white p-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-500 mb-6">
              Chỉnh sửa hồ sơ
            </h2>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : formData ? (
              <div className="grid grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 bg-gray-100 focus:ring-2 focus:ring-red-400"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 bg-gray-100 focus:ring-2 focus:ring-red-400"
                  />
                </div>
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 bg-gray-100 focus:ring-2 focus:ring-red-400"
                  />
                </div>
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 bg-gray-100 focus:ring-2 focus:ring-red-400"
                  />
                </div>
                {/* Image Path */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image Path
                  </label>
                  <input
                    type="text"
                    name="imagePath"
                    value={formData.imagePath || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 bg-gray-100 focus:ring-2 focus:ring-red-400"
                  />
                </div> */}
                {/* Ngày sinh - sử dụng react-datepicker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ngày sinh
                  </label>
                  <DatePicker
                    selected={dob}
                    onChange={handleDobChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Chọn ngày sinh"
                    className="mt-1 block w-full p-3 bg-gray-100 focus:ring-2 focus:ring-red-400"
                  />
                </div>
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Giới tính
                  </label>
                  <input
                    type="text"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 bg-gray-100 focus:ring-2 focus:ring-red-400"
                  />
                </div>
                {/* Preferred Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phương thức thanh toán ưu tiên
                  </label>
                  <input
                    type="text"
                    name="preferredPaymentMethod"
                    value={formData.preferredPaymentMethod}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 bg-gray-100 focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
            ) : (
              <p>Không tìm thấy thông tin hồ sơ.</p>
            )}

            {/* Buttons */}
            <div className="mt-6 flex justify-between">
              <Link href="/">
                <button className="text-gray-500 hover:text-gray-700">
                  Hủy thay đổi
                </button>
              </Link>
              <button
                onClick={handleSave}
                className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition"
              >
                Lưu
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
