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

// Định nghĩa kiểu địa chỉ hiển thị trên giao diện (mapping các field theo API)
type AddressItem = {
  id: number;
  name: string;       // Tên người nhận
  phone: string;
  country: string;    // Quốc gia
  province: string;   // Tên Tỉnh/Thành phố
  district: string;   // Tên Quận/Huyện
  ward: string;       // Tên Phường/Xã (dùng làm city trong request)
  detail: string;     // Địa chỉ chi tiết
  email?: string;
  addressType?: "home" | "office";
  isDefault?: boolean;
};

export default function AddressPage() {
  const router = useRouter();

  // Danh sách địa chỉ từ API
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  
  // State điều khiển hiển thị Drawer (popup) cho Thêm/Sửa địa chỉ
  const [showDrawer, setShowDrawer] = useState(false);

  // State để kiểm soát chế độ sửa hay thêm: nếu có giá trị thì đang ở chế độ sửa
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);

  // Các state của form
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
    // Reset district và ward khi thay đổi tỉnh
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
    // Reset ward khi thay đổi quận/huyện
    setSelectedWard("");
  }, [selectedDistrict]);

  // Khi danh sách địa chỉ từ BE load, mapping dữ liệu trả về sang kiểu AddressItem
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
          // Giả sử BE trả về mảng đối tượng và mỗi đối tượng có các trường được mapping
          const mappedAddresses: AddressItem[] = res.data.data.map((item: any) => ({
            id: item.addressId, // giả sử BE trả về trường id (hoặc addressId tùy API)
            name: item.recipientName,
            phone: item.recipientPhone,
            country: item.country,
            province: item.province,
            district: item.district,
            ward: item.city, // sử dụng trường city làm tên phường/xã
            detail: item.address,
            email: item.email,
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

  // Khi đang ở chế độ sửa và danh sách các quận/huyện được load, tự động chọn quận/huyện dựa trên dữ liệu editingAddress
  useEffect(() => {
    if (editingAddress && districts.length > 0) {
      const districtObj = districts.find((d: any) => d.name === editingAddress.district);
      if (districtObj) {
        setSelectedDistrict(districtObj.code);
      }
    }
  }, [districts, editingAddress]);

  // Hàm reset form sau khi thêm/sửa
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
    // Reset trạng thái sửa
    setEditingAddress(null);
  };

  // Xử lý lưu địa chỉ mới (create)
  const handleSaveAddress = async () => {
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
          email: email,
          isDefault: isDefault,
          addressType: addressType,
        };
        setAddresses((prev) => {
          if (isDefault) {
            // Nếu thêm mới địa chỉ mặc định, cập nhật lại các địa chỉ khác
            return [...prev.map(addr => ({ ...addr, isDefault: false })), newAddress];
          }
          return [...prev, newAddress];
        });
        resetForm();
        setShowDrawer(false);
      } else {
        toast.error(`Lỗi tạo địa chỉ: ${response.data.message}`);
        console.error("Error creating shipping address:", response.data.message);
      }
    } catch (error: any) {
      toast.error(`Error calling createShippingAddress API: ${error?.message || error}`);
      console.error("Error calling createShippingAddress API:", error);
    }
  };

  // Xử lý cập nhật địa chỉ (update)
  const handleUpdateAddress = async () => {
    const accountId = Number(getCookie("accountId"));
    if (!accountId || !editingAddress) {
      toast.error("Bạn chưa đăng nhập hoặc không có địa chỉ để sửa!");
      router.push("/login");
      return;
    }

    const request = {
      accountId: accountId,
      address: detailAddress,
      city: selectedWard,
      province: provinces.find((p: any) => p.code === selectedProvince)?.name || "",
      district: districts.find((d: any) => d.code === selectedDistrict)?.name || "",
      country: "Vietnam",
      recipientName: fullName,
      recipientPhone: phone,
      email: email,
      isDefault: isDefault,
    };

    try {
      // Lưu ý: Sử dụng API updateShippingAddress đã tích hợp endpoint (với {id} là address id)
      const response = await ProfileService.updateShippingAddress(editingAddress.id, request);
      if (response.data.status) {
        toast.success("Cập nhật địa chỉ thành công!");

        // Cập nhật lại danh sách địa chỉ với dữ liệu mới
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === editingAddress.id
              ? {
                  ...addr,
                  name: fullName,
                  phone: phone,
                  detail: detailAddress,
                  province: request.province,
                  district: request.district,
                  ward: selectedWard,
                  email: email,
                  isDefault: isDefault,
                  addressType: addressType,
                }
              : isDefault ? { ...addr, isDefault: false } : addr
          )
        );
        resetForm();
        setShowDrawer(false);
      } else {
        toast.error(`Lỗi cập nhật địa chỉ: ${response.data.message}`);
        console.error("Error updating shipping address:", response.data.message);
      }
    } catch (error: any) {
      toast.error(`Error calling updateShippingAddress API: ${error?.message || error}`);
      console.error("Error calling updateShippingAddress API:", error);
    }
  };

  // Xử lý khi người dùng bấm nút "Sửa": autofill form với dữ liệu của địa chỉ được chọn
  // Lần đầu set tỉnh, quận khi người dùng bấm Sửa
const handleEditAddress = (address: AddressItem) => {
  setEditingAddress(address);
  setShowDrawer(true);
  // Autofill các trường
  setFullName(address.name);
  setPhone(address.phone);
  setDetailAddress(address.detail);
  setEmail(address.email || "");
  setIsDefault(!!address.isDefault);
  setAddressType(address.addressType || "home");
  
  // Tìm province code
  const provinceObj = provinces.find((p: any) => p.name === address.province);
  if (provinceObj) {
    setSelectedProvince(provinceObj.code);
  } else {
    setSelectedProvince("");
  }
  
  // Chưa set selectedWard ở đây. 
  // Chỉ reset selectedDistrict, chờ useEffect chạy.
  setSelectedDistrict("");
};

// Sau đó, khi quận/huyện đã load -> wards được load -> new effect
useEffect(() => {
  // Chỉ thực thi nếu đang sửa và đã có wards
  if (editingAddress && wards.length > 0) {
    // Kiểm tra xem ward trả về từ BE có khớp với ward.name nào trong mảng wards không
    const wardObj = wards.find((w: any) => w.name === editingAddress.ward);
    if (wardObj) {
      // Cuối cùng setSelectedWard bằng ward.name
      setSelectedWard(wardObj.name);
    } else {
      // Nếu không tìm thấy, có thể setSelectedWard("")
      setSelectedWard("");
    }
  }
}, [wards, editingAddress]);


  // Xử lý xóa địa chỉ (chỉ cập nhật giao diện, cần tích hợp API xóa nếu có)
  const handleDeleteAddress = async (id: number) => {
    try {
      const response = await ProfileService.removeShippingAddress(id);
      if (response.data.status) {
        toast.success("Xóa địa chỉ thành công!");
        // Cập nhật lại danh sách địa chỉ trên giao diện
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error(`Lỗi xóa địa chỉ: ${response.data.message}`);
        console.error("Error removing shipping address:", response.data.message);
      }
    } catch (error: any) {
      toast.error(`Error calling removeShippingAddress API: ${error?.message || error}`);
      console.error("Error calling removeShippingAddress API:", error);
    }
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
                onClick={() => {
                  // Nếu đang ở chế độ sửa, reset form để thêm mới
                  resetForm();
                  setShowDrawer(true);
                }}
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
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 text-sm">Mặc định</span>
                        )}
                      </div>
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
            {/* Drawer cho thêm/sửa địa chỉ */}
            {showDrawer && (
              <>
                {/* Overlay */}
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
