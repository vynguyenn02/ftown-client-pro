            "use client";

            import { Modal, Form, Input, Button, message, Select } from "antd";
            import { useEffect, useState } from "react";
            import profileService from "@/services/profile.service";
            import { CreateShippingAddressRequest, ShippingAddress } from "@/types";
            const { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } = require("pc-vn");

            type AddAddressModalProps = {
            visible?: boolean;
            accountId: number;
            onCancel: () => void;
            onSuccess: (newAddress: ShippingAddress) => void;
            };

            export default function AddAddressModal({
            visible,
            accountId,
            onCancel,
            onSuccess,
            }: AddAddressModalProps) {
            const [loading, setLoading] = useState(false);
            const [form] = Form.useForm();

            // States cho dropdown địa chỉ (dùng mã code để điều khiển)
            const [provinces, setProvinces] = useState<any[]>([]);
            const [districts, setDistricts] = useState<any[]>([]);
            const [wards, setWards] = useState<any[]>([]);
            const [selectedProvince, setSelectedProvince] = useState("");
            const [selectedDistrict, setSelectedDistrict] = useState("");
            const [selectedWard, setSelectedWard] = useState("");

            // Load danh sách tỉnh khi component mount
            useEffect(() => {
                const allProvinces = getProvinces();
                setProvinces(allProvinces);
            }, []);

            const handleProvinceChange = (value: string) => {
                setSelectedProvince(value);
                // Lấy tên của tỉnh/thành phố tương ứng và lưu vào form
                const provinceName = provinces.find((prov: any) => prov.code === value)?.name || "";
                form.setFieldValue("province", provinceName);
                // Cập nhật danh sách quận/huyện dựa theo mã tỉnh
                const districtsList = getDistrictsByProvinceCode(value);
                setDistricts(districtsList);
                // Reset các giá trị quận và phường
                setSelectedDistrict("");
                setWards([]);
                setSelectedWard("");
            };

            const handleDistrictChange = (value: string) => {
                setSelectedDistrict(value);
                // Lấy tên của quận/huyện tương ứng và lưu vào form
                const districtName = districts.find((dist: any) => dist.code === value)?.name || "";
                form.setFieldValue("district", districtName);
                // Cập nhật danh sách phường/xã dựa theo mã quận/huyện
                const wardsList = getWardsByDistrictCode(value);
                setWards(wardsList);
                setSelectedWard("");
            };

            const handleWardChange = (value: string) => {
                setSelectedWard(value);
                // Lấy tên của phường/xã tương ứng và lưu vào form field "city"
                const wardName = wards.find((ward: any) => ward.code === value)?.name || "";
                form.setFieldValue("city", wardName);
            };

            const handleFinish = async (values: any) => {
                setLoading(true);
                try {
                const payload: CreateShippingAddressRequest = {
                    accountId,
                    isDefault: false,
                    country: "Vietnam",
                    ...values,
                };
                const res = await profileService.createShippingAddress(payload);
                if (res.data.status) {
                    message.success("Thêm địa chỉ thành công!");
                    // Giả sử API trả về địa chỉ mới dưới dạng res.data.data
                    const newAddress: ShippingAddress = res.data.data;
                    onSuccess(newAddress);
                    form.resetFields();
                    // Reset lại các state
                    setSelectedProvince("");
                    setSelectedDistrict("");
                    setSelectedWard("");
                    setDistricts([]);
                    setWards([]);
                } else {
                    message.error(res.data.message || "Thêm địa chỉ thất bại!");
                }
                } catch (error: any) {
                console.error("Error:", error);
                message.error(error.message || "Đã có lỗi xảy ra!");
                } finally {
                setLoading(false);
                }
            };

            return (
                <Modal
                title="Thêm địa chỉ mới"
                open={visible}
                onCancel={onCancel}
                footer={null}
                >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item
                    name="recipientName"
                    label="Tên người nhận"
                    rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
                    >
                    <Input />
                    </Form.Item>
                    <Form.Item
                    name="recipientPhone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                    <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                    <Input />
                    </Form.Item>
                    <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                    <Input />
                    </Form.Item>
                    {/* Dropdown chọn Tỉnh/Thành phố */}
                    <Form.Item
                    name="province"
                    label="Tỉnh/Thành phố"
                    rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
                    >
                    <Select
                        placeholder="Chọn tỉnh/thành phố"
                        value={selectedProvince || undefined}
                        onChange={handleProvinceChange}
                        allowClear
                    >
                        {provinces.map((prov) => (
                        <Select.Option key={prov.code} value={prov.code}>
                            {prov.name}
                        </Select.Option>
                        ))}
                    </Select>
                    </Form.Item>
                    {/* Dropdown chọn Quận/Huyện */}
                    <Form.Item
                    name="district"
                    label="Quận/Huyện"
                    rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
                    >
                    <Select
                        placeholder="Chọn quận/huyện"
                        value={selectedDistrict || undefined}
                        onChange={handleDistrictChange}
                        allowClear
                        disabled={!selectedProvince}
                    >
                        {districts.map((dist) => (
                        <Select.Option key={dist.code} value={dist.code}>
                            {dist.name}
                        </Select.Option>
                        ))}
                    </Select>
                    </Form.Item>
                    {/* Dropdown chọn Phường/Xã (lưu vào field "city") */}
                    <Form.Item
                    name="city"
                    label="Phường/Xã"
                    rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
                    >
                    <Select
                        placeholder="Chọn phường/xã"
                        value={selectedWard || undefined}
                        onChange={handleWardChange}
                        allowClear
                        disabled={!selectedDistrict}
                    >
                        {wards.map((ward) => (
                        <Select.Option key={ward.code} value={ward.code}>
                            {ward.name}
                        </Select.Option>
                        ))}
                    </Select>
                    </Form.Item>
                    <Form.Item>
                    <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{ backgroundColor: "black", borderColor: "black" }}
                    >
                    Thêm địa chỉ
                    </Button>

                    </Form.Item>
                </Form>
                </Modal>
            );
            }
