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

type AddressItem = {
  id: number;
  name: string;
  phone: string;
  country: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  email?: string;
  addressType?: "home" | "office";
  isDefault?: boolean;
};

export default function AddressPage() {
  const router = useRouter();

  // Danh sách địa chỉ từ API
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  
  // State hiển thị Drawer cho thêm/sửa địa chỉ
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);

  // Các state của form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [email, setEmail] = useState("");
  const [addressType, setAddressType] = useState<"home" | "office">("home");
  const [isDefault, setIsDefault] = useState(false);

  // State để lưu thông báo lỗi cho từng trường
  const [fullNameError, setFullNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // States cho dropdown địa chỉ từ thư viện pc-vn
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Các hàm xử lý validate ngay khi người dùng nhập
  const handleFullNameChange = (value: string) => {
    setFullName(value);
    if (!/^[\p{L}\s]+$/u.test(value)) {
      setFullNameError("Họ và tên chỉ được chứa chữ và khoảng trắng, không cho phép số.");
    } else {
      setFullNameError("");
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (!/^\d{10}$/.test(value)) {
      setPhoneError("Số điện thoại phải chứa đúng 10 số.");
    } else {
      setPhoneError("");
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) {
      setEmailError("Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.");
    } else {
      setEmailError("");
    }
  };

  // Hàm validate tổng hợp khi bấm nút (nếu cần kiểm tra thêm các trường khác)
  const validateForm = () => {
    if (fullNameError || phoneError || emailError) {
      toast.error("Vui lòng chỉnh sửa các lỗi trước khi lưu!");
      return false;
    }
    // Ngoài ra, nếu các trường rỗng thì cũng có thể thông báo lỗi
    if (!fullName || !phone || !email) {
      toast.error("Vui lòng điền đầy đủ các trường cần thiết.");
      return false;
    }
    return true;
  };

  // Lấy danh sách tỉnh
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

  // Lấy danh sách địa chỉ từ API và mapping dữ liệu
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
          const mappedAddresses: AddressItem[] = res.data.data.map((item: any) => ({
            id: item.addressId,
            name: item.recipientName,
            phone: item.recipientPhone,
            country: item.country,
            province: item.province,
            district: item.district,
            ward: item.city,
            detail: item.address,
            email: item.email,
            isDefault: item.isDefault,
            addressType: item.addressType,
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

  // Khi đang ở chế độ sửa và danh sách quận/huyện đã load
  useEffect(() => {
    if (editingAddress && districts.length > 0) {
      const districtObj = districts.find((d: any) => d.name === editingAddress.district);
      if (districtObj) {
        setSelectedDistrict(districtObj.code);
      }
    }
  }, [districts, editingAddress]);

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
    setEditingAddress(null);
    // Reset thông báo lỗi
    setFullNameError("");
    setPhoneError("");
    setEmailError("");
  };

  // Xử lý tạo địa chỉ mới
  const handleSaveAddress = async () => {
    if (!validateForm()) return;
    const accountId = Number(getCookie("accountId"));
    if (!accountId) {
      toast.error("Bạn chưa đăng nhập!");
      router.push("/login");
      return;
    }
    const request = {
      accountId,
      address: detailAddress,
      city: selectedWard,
      province: provinces.find((p: any) => p.code === selectedProvince)?.name || "",
      district: districts.find((d: any) => d.code === selectedDistrict)?.name || "",
      country: "Vietnam",
      recipientName: fullName,
      recipientPhone: phone,
      email,
      isDefault,
    };

    try {
      const response = await ProfileService.createShippingAddress(request);
      if (response.data.status) {
        toast.success("Thêm địa chỉ thành công!");
        const newAddress: AddressItem = {
          id: Date.now(),
          name: fullName,
          phone,
          country: "Vietnam",
          province: request.province,
          district: request.district,
          ward: selectedWard,
          detail: detailAddress,
          email,
          isDefault,
          addressType,
        };
        setAddresses((prev) => 
          isDefault
            ? [...prev.map(addr => ({ ...addr, isDefault: false })), newAddress]
            : [...prev, newAddress]
        );
        resetForm();
        setShowDrawer(false);
      } else {
        toast.error(`Lỗi tạo địa chỉ: ${response.data.message}`);
      }
    } catch (error: any) {
      toast.error(`Error calling createShippingAddress API: ${error?.message || error}`);
    }
  };

  // Xử lý cập nhật địa chỉ
  const handleUpdateAddress = async () => {
    if (!validateForm()) return;
    const accountId = Number(getCookie("accountId"));
    if (!accountId || !editingAddress) {
      toast.error("Bạn chưa đăng nhập hoặc không có địa chỉ để sửa!");
      router.push("/login");
      return;
    }
    const request = {
      accountId,
      address: detailAddress,
      city: selectedWard,
      province: provinces.find((p: any) => p.code === selectedProvince)?.name || "",
      district: districts.find((d: any) => d.code === selectedDistrict)?.name || "",
      country: "Vietnam",
      recipientName: fullName,
      recipientPhone: phone,
      email,
      isDefault,
    };

    try {
      const response = await ProfileService.updateShippingAddress(editingAddress.id, request);
      if (response.data.status) {
        toast.success("Cập nhật địa chỉ thành công!");
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === editingAddress.id
              ? {
                  ...addr,
                  name: fullName,
                  phone,
                  detail: detailAddress,
                  province: request.province,
                  district: request.district,
                  ward: selectedWard,
                  email,
                  isDefault,
                  addressType,
                }
              : isDefault ? { ...addr, isDefault: false } : addr
          )
        );
        resetForm();
        setShowDrawer(false);
      } else {
        toast.error(`Lỗi cập nhật địa chỉ: ${response.data.message}`);
      }
    } catch (error: any) {
      toast.error(`Error calling updateShippingAddress API: ${error?.message || error}`);
    }
  };

  const handleEditAddress = (address: AddressItem) => {
    setEditingAddress(address);
    setShowDrawer(true);
    setFullName(address.name);
    setPhone(address.phone);
    setDetailAddress(address.detail);
    setEmail(address.email || "");
    setIsDefault(!!address.isDefault);
    setAddressType(address.addressType || "home");

    const provinceObj = provinces.find((p: any) => p.name === address.province);
    setSelectedProvince(provinceObj ? provinceObj.code : "");
    setSelectedDistrict("");
  };

  useEffect(() => {
    if (editingAddress && wards.length > 0) {
      const wardObj = wards.find((w: any) => w.name === editingAddress.ward);
      setSelectedWard(wardObj ? wardObj.name : "");
    }
  }, [wards, editingAddress]);

  const handleDeleteAddress = async (id: number) => {
    try {
      const response = await ProfileService.removeShippingAddress(id);
      if (response.data.status) {
        toast.success("Xóa địa chỉ thành công!");
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error(`Lỗi xóa địa chỉ: ${response.data.message}`);
      }
    } catch (error: any) {
      toast.error(`Error calling removeShippingAddress API: ${error?.message || error}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 justify-center pt-20">
        <div className="container mx-auto flex gap-8 p-6">
          <Sidebar />
          <section className="w-3/4 bg-white p-6 shadow-md relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">Quản lý sổ địa chỉ</h2>
              <button
                className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition"
                onClick={() => {
                  resetForm();
                  setShowDrawer(true);
                }}
              >
                Thêm địa chỉ mới
              </button>
            </div>

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
                      {addr.isDefault && (
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 text-sm">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        className="text-black hover:underline"
                        onClick={() => handleEditAddress(addr)}
                      >
                        Sửa
                      </button>
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

            {showDrawer && (
              <>
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => {
                    resetForm();
                    setShowDrawer(false);
                  }}
                />
                <div
                  className={`fixed top-0 right-0 w-full md:w-[400px] h-full bg-white z-50 p-6 transition-transform duration-300 ${
                    showDrawer ? "translate-x-0" : "translate-x-full"
                  }`}
                  style={{ boxShadow: "-2px 0 5px rgba(0,0,0,0.1)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-black">
                      {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                    </h2>
                    <button
                      className="text-black"
                      onClick={() => {
                        resetForm();
                        setShowDrawer(false);
                      }}
                    >
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
                        onChange={(e) => handleFullNameChange(e.target.value)}
                      />
                      {fullNameError && (
                        <p className="text-red-500 text-sm">{fullNameError}</p>
                      )}
                    </div>
                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-black">Số điện thoại</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-sm">{phoneError}</p>
                      )}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-black">Email</label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-300"
                        placeholder="Nhập email (vd: example@gmail.com)"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm">{emailError}</p>
                      )}
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
                    {/* Nút xác nhận */}
                    <button
                      className="w-full bg-black text-white p-3"
                      onClick={editingAddress ? handleUpdateAddress : handleSaveAddress}
                    >
                      {editingAddress ? "Cập nhật" : "Hoàn tất"}
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
