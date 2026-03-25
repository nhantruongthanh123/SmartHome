"use client";
import React, { useState, useRef } from "react";
import {
  User,
  Mail,
  Camera,
  Shield,
  Bell,
  LogOut,
  Save,
  Hash,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null); 

  const [userData, setUserData] = useState({
    name: "Thanh Nhân",
    email: "thanhnhan@hcmut.edu.vn",
    role: "Administrator",
    studentId: "231xxxx",
    avatar: "TN",
  });

  // Hàm xử lý khi chọn ảnh từ máy
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // Giới hạn 2MB
        toast.error("File quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        toast.success("Đã tải ảnh lên thành công!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = () => {
    toast.loading("Signing out...");
    setTimeout(() => router.push("/login"), 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/50 p-4 lg:p-10 animate-in fade-in duration-500">
      <Toaster position="top-right" richColors />

      <div className="max-w-5xl mx-auto">
        <div className="mb-10 ml-2">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            User Profile
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage your personal information and security
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* CỘT TRÁI: Thẻ Profile chính */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="px-6 pb-8 -mt-12 text-center">
                <div className="relative inline-block">
                  <div className="w-28 h-28 bg-white p-1.5 rounded-full shadow-lg overflow-hidden">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {userData.avatar}
                      </div>
                    )}
                  </div>

                  {/* Nút Camera để chọn file */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-white rounded-full border border-slate-100 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Camera size={16} className="text-slate-600" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                <h3 className="mt-4 text-xl font-bold text-slate-800">
                  {userData.name}
                </h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                  {userData.role}
                </span>

                <div className="mt-8 space-y-4 text-left">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl text-slate-600">
                    <Hash size={18} className="text-blue-500" />
                    <span className="text-sm font-bold truncate">
                      {userData.studentId}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl text-slate-600">
                    <Mail size={18} className="text-blue-500" />
                    <span className="text-sm font-medium truncate">
                      {userData.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full group flex items-center justify-center gap-3 p-4 text-red-500 font-bold bg-white border border-red-50 rounded-[2rem] hover:bg-red-100 transition-all shadow-sm active:scale-95"
            >
              <LogOut
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
              <span>Sign Out</span>
            </button>
          </div>

          {/* CỘT PHẢI: Form chi tiết */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <User size={22} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">
                    Personal Information
                  </h4>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-5 py-2 bg-slate-50 text-blue-600 text-sm font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all"
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    Full Name
                  </label>
                  <input
                    disabled={!isEditing}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    Student ID
                  </label>
                  <input
                    disabled={!isEditing}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                    value={userData.studentId}
                    onChange={(e) =>
                      setUserData({ ...userData, studentId: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    Email Address
                  </label>
                  <input
                    disabled={!isEditing}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <Shield size={22} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">
                  Security & Preferences
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-50 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                      <Bell size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Push Notifications
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Alerts on triggers
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-50 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        2FA Security
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Extra account safety
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
