"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import ProfileService from "@/services/profile.service";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";

// Import các hàm từ thư viện pc-vn (dùng require để tránh lỗi .d.ts)
const { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } = require("pc-vn");

// Định nghĩa kiểu địa chỉ trong giao diện (mapping các field theo API)
type AddressItem = {
  id: number;
  name: string;       // Tên người nhận
  phone: string;
  country: string;    // Quốc gia
  province: string;   // Tỉnh/Thành phố
  district: string;   // Quận/Huyện
  ward: string;       // Phường/Xã (dùng làm city trong request)
  detail: string;     // Địa chỉ chi tiết
  isDefault?: boolean;
};

export default function AddressPage() {
  const router = useRouter();

  // Danh sách địa chỉ từ API
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  
  // State điều khiển popup Thêm địa chỉ
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [email, setEmail] = useState("");
  const [addressType, setAddressType] = useState<"home" | "office">("home");
  const [isDefault, setIsDefault] = useState(false);

  // States cho dropdown địa chỉ dựa trên thư viện pc-vn
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Lấy danh sách tỉnh khi khởi chạy trang
  useEffect(() => {
    const fetchProvinces = async () => {
      const provs = await getProvinces();
      setProvinces(provs);
    };
    fetchProvinces();
  }, []);

  // Khi chọn tỉnh, lấy danh sách quận/huyện
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        const dists = await getDistrictsByProvinceCode(selectedProvince);
        setDistricts(dists);
      };
      fetchDistricts();
    } else {
      setDistricts([]);
    }
    setSelectedDistrict("");
    setWards([]);
    setSelectedWard("");
  }, [selectedProvince]);

  // Khi chọn quận/huyện, lấy danh sách phường/xã
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        const ws = await getWardsByDistrictCode(selectedDistrict);
        setWards(ws);
      };
      fetchWards();
    } else {
      setWards([]);
    }
    setSelectedWard("");
  }, [selectedDistrict]);

  // Lấy danh sách địa chỉ từ BE khi trang load
  useEffect(() => {
    const accountId = Number(getCookie("accountId"));
    if (!accountId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    ProfileService.getShippingAddress(accountId)
      .then((res) => {
        if (res.data.status) {
          // Map dữ liệu trả về thành kiểu AddressItem
          const mappedAddresses: AddressItem[] = res.data.data.map((item: any) => ({
            id: item.id, // giả sử BE trả về id
            name: item.recipientName, // chuyển từ recipientName
            phone: item.recipientPhone, // chuyển từ recipientPhone
            country: item.country,
            province: item.province,
            district: item.district, // BE trả về district (không phải dicstrict)
            ward: item.city, // Sử dụng trường city làm ward
            detail: item.address, // Sử dụng trường address làm detail
            isDefault: item.isDefault,
            addressType: item.addressType, // nếu có
          }));
          setAddresses(mappedAddresses);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error: any) => {
        toast.error(`Error fetching shipping addresses: ${error.message || error}`);
        console.error("Error fetching shipping addresses:", error);
      });
  }, [router]);
  

  // Xử lý lưu địa chỉ mới và gọi API createShippingAddress
  const handleSaveAddress = async () => {
    // Lấy accountId từ cookie
    const accountId = Number(getCookie("accountId"));
    if (!accountId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }

    // Tạo đối tượng request theo kiểu CreateShippingAddressRequest
    const request = {
      accountId: accountId,
      address: detailAddress,
      city: selectedWard, // Dùng phường/xã làm "city"
      province: provinces.find((p: any) => p.code === selectedProvince)?.name || "",
      district: districts.find((d: any) => d.code === selectedDistrict)?.name || "",
      country: "Vietnam",
      recipientName: fullName,
      recipientPhone: phone,
      email: email,
      isDefault: isDefault,
    };

    try {
      const response = await ProfileService.createShippingAddress(request);
      if (response.data.status) {
        toast.success("Thêm địa chỉ thành công!");

        // Nếu API trả về thành công, cập nhật danh sách địa chỉ
        const newAddress: AddressItem = {
          id: Date.now(), // Hoặc lấy id từ response nếu có
          name: fullName,
          phone: phone,
          country: "Vietnam",
          province: request.province,
          district: request.district,
          ward: selectedWard,
          detail: detailAddress,
          isDefault: isDefault,
        };
        setAddresses((prev) => {
          if (isDefault) {
            return [...prev.map(addr => ({ ...addr, isDefault: false })), newAddress];
          }
          return [...prev, newAddress];
        });
        resetForm();
        setShowAddAddress(false);
      } else {
        toast.error(`Lỗi tạo địa chỉ: ${response.data.message}`);
        console.error("Error creating shipping address:", response.data.message);
      }
    } catch (error: any) {
      toast.error(`Error calling createShippingAddress API: ${error?.message || error}`);
      console.error("Error calling createShippingAddress API:", error);
    }
  };

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setDetailAddress("");
    setEmail("");
    setAddressType("home");
    setIsDefault(false);
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 justify-center pt-20">
        <div className="container mx-auto flex gap-8 p-6">
          <Sidebar />
          {/* Nội dung: Sổ địa chỉ */}
          <section className="w-3/4 bg-white p-6 shadow-md relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">Quản lý sổ địa chỉ</h2>
              <button
                className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition"
                onClick={() => setShowAddAddress(true)}
              >
                Thêm địa chỉ mới
              </button>
            </div>

            {/* Danh sách địa chỉ */}
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white p-4 rounded-md shadow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{addr.name}</h3>
                      <p className="text-gray-600">{addr.phone}</p>
                      <p className="text-gray-600">
                        {addr.detail}, {addr.district}, {addr.province}, {addr.country}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        
                        {addr.isDefault && (
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 text-sm">
                            Mặc định
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="text-black hover:underline">Sửa</button>
                      <span className="text-gray-400">|</span>
                      <button
                        className="text-black hover:underline"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Popup (drawer) Thêm địa chỉ */}
            {showAddAddress && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setShowAddAddress(false)}
                />
                <div
                  className={`fixed top-0 right-0 w-full md:w-[400px] h-full bg-white z-50 p-6 transition-transform duration-300 ${
                    showAddAddress ? "translate-x-0" : "translate-x-full"
                  }`}
                  style={{ boxShadow: "-2px 0 5px rgba(0,0,0,0.1)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-black">Thêm địa chỉ mới</h2>
                    <button className="text-black" onClick={() => setShowAddAddress(false)}>
                      X
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* Họ và tên */}
                    <div>
                      <label className="block text-black">Họ và tên</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300"
                        placeholder="Nhập họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-black">Số điện thoại</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-black">Email</label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-300"
                        placeholder="Nhập email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {/* Địa chỉ chi tiết */}
                    <div>
                      <label className="block text-black">Địa chỉ chi tiết</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300"
                        placeholder="VD: Số 101, Tòa nhà XYZ"
                        value={detailAddress}
                        onChange={(e) => setDetailAddress(e.target.value)}
                      />
                    </div>
                    {/* Chọn Tỉnh/Thành */}
                    <div>
                      <label className="block text-black">Chọn Tỉnh/Thành</label>
                      <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="w-full p-2 border border-gray-300"
                      >
                        <option value="">-- Chọn Tỉnh/Thành --</option>
                        {provinces.map((prov: any) => (
                          <option key={prov.code} value={prov.code}>
                            {prov.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Chọn Quận/Huyện */}
                    <div>
                      <label className="block text-black">Chọn Quận/Huyện</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full p-2 border border-gray-300"
                        disabled={!selectedProvince}
                      >
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map((dist: any) => (
                          <option key={dist.code} value={dist.code}>
                            {dist.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Chọn Phường/Xã */}
                    <div>
                      <label className="block text-black">Chọn Phường/Xã</label>
                      <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="w-full p-2 border border-gray-300"
                        disabled={!selectedDistrict}
                      >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map((ward: any) => (
                          <option key={ward.code} value={ward.name}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Loại địa chỉ */}
                    <div>
                      <label className="block text-black mb-1">Loại địa chỉ</label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="addressType"
                            className="mr-2"
                            checked={addressType === "home"}
                            onChange={() => setAddressType("home")}
                          />
                          Nhà
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="addressType"
                            className="mr-2"
                            checked={addressType === "office"}
                            onChange={() => setAddressType("office")}
                          />
                          Văn phòng
                        </label>
                      </div>
                    </div>
                    {/* Đặt làm mặc định */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={isDefault}
                        onChange={() => setIsDefault(!isDefault)}
                      />
                      <span className="text-black">Đặt làm địa chỉ mặc định</span>
                    </div>
                    {/* Nút lưu */}
                    <button className="w-full bg-black text-white p-3" onClick={handleSaveAddress}>
                      Hoàn tất
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
