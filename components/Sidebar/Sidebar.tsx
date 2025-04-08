"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCookie } from "cookies-next";
import { Layout, Menu, Avatar } from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  RetweetOutlined,
  HeartOutlined,
  StarOutlined,
} from "@ant-design/icons";

import ProfileService from "@/services/profile.service";
import { Profile } from "@/types";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const pathname = usePathname();
  const selectedKey = pathname;

  useEffect(() => {
    const accountIdCookie = getCookie("accountId");
    if (accountIdCookie) {
      const accountId = Number(accountIdCookie);
      ProfileService.getCustomerProfile(accountId)
        .then((res) => {
          if (res.data.status) {
            setProfile(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
        });
    }
  }, []);

  return (
    <>
      <Sider
        width={400}
        style={{
          background: "#fff",
          minHeight: "100vh",
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header nhỏ (avatar, tên user) */}
        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {/* Nếu có imagePath thì hiển thị ảnh, không thì hiển thị icon */}
          {profile?.imagePath ? (
            <Avatar size={48} src={profile.imagePath} />
          ) : (
            <Avatar size={48} icon={<UserOutlined />} />
          )}
          <div>
            {/* Hiển thị fullname, nếu không có thì mặc định "Guest User" */}
            <div style={{ fontWeight: 600 }}>
              {profile?.fullName || "Guest User"}
            </div>
            {/* Có thể hiển thị thêm email hoặc vai trò tại đây */}
            <div style={{ fontSize: 12, color: "#999" }}>
              {profile?.email || "No email"}
            </div>
          </div>
        </div>

        {/* Menu chính */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ borderRight: 0 }}
          className="mySidebar"
        >
          {/* Quản lý tài khoản */}
          <Menu.ItemGroup key="group1" title="Quản lý tài khoản">
            <Menu.Item key="/profile" icon={<UserOutlined />}>
              <Link href="/profile">Hồ sơ</Link>
            </Menu.Item>
            <Menu.Item key="/profile/address" icon={<EnvironmentOutlined />}>
              <Link href="/profile/address">Sổ địa chỉ</Link>
            </Menu.Item>
          </Menu.ItemGroup>

          {/* Đơn hàng */}
          <Menu.ItemGroup key="group2" title="Đơn hàng">
            <Menu.Item key="/profile/order" icon={<ShoppingOutlined />}>
              <Link href="/profile/order">Đơn hàng của tôi</Link>
            </Menu.Item>
            <Menu.Item key="/profile/return-item" icon={<RetweetOutlined />}>
              <Link href="/profile/return-item">Trả hàng/ Hoàn tiền</Link>
            </Menu.Item>
          </Menu.ItemGroup>

          {/* Yêu thích */}
          <Menu.ItemGroup key="group3" title="Yêu thích">
            <Menu.Item key="/profile/favorite" icon={<HeartOutlined />}>
              Danh sách yêu thích
            </Menu.Item>
            <Menu.Item key="/profile/style" icon={<StarOutlined />}>
              Phong cách phối đồ
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu>
      </Sider>

      {/* Style override cho menu */}
      <style jsx global>{`
        .mySidebar .ant-menu-item:hover {
          background-color: rgb(25, 48, 39) !important;
          color: #fff !important;
        }
        .mySidebar .ant-menu-item-selected {
          background-color: rgb(20, 41, 25) !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
