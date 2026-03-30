"use client";
import React, { useState, useRef, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  Mail,
  Camera,
  Shield,
  Bell,
  LogOut,
  CalendarDays,
  Hash,
  Check,
  Loader2,
  X
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    avatar: "",
    role: "USER",
    createdAt: "",
    updatedAt: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          // Cập nhật dữ liệu từ DB vào state (nếu trường nào null thì để chuỗi rỗng)
          setUserData({
            id: data.id,
            name: data.name || "",
            email: data.email || "",
            role: "USER",
            avatar: data.image || "",
            createdAt: data.createdAt || "", 
            updatedAt: data.updatedAt || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user profile: ", error);
      } finally {
        setLoading(false); // Tắt hiệu ứng tải
      }
    };

    fetchUserProfile();
  }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần duy nhất khi mở trang

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        // Giới hạn 4MB
        toast.error("Please select an image smaller than 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(file);
        setPreviewImage(reader.result as string);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      
      // Nếu người dùng có chọn file mới thì mới gửi đi
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData, // Gửi FormData thay vì JSON
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUserData({ 
          ...userData, 
          name: updatedUser.name, 
          avatar: updatedUser.image 
        });
        setPreviewImage(null);
        setSelectedFile(null);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    const toastId = toast.loading("Signing out...");
    
    try {
      // Hàm này sẽ: 
      // 1. Gọi API logout ngầm của NextAuth
      // 2. Xóa sạch Cookie trên trình duyệt
      // 3. Tự động redirect về trang chủ hoặc trang login
      await signOut({ callbackUrl: "/login" }); 
    } catch (error) {
      toast.error("Failed to sign out", { id: toastId });
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ""; 
    
    const date = new Date(dateString);
    
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
                    {/* Ưu tiên hiển thị ảnh xem trước (previewImage), nếu không có thì lấy ảnh từ DB (userData.avatar) */}
                    {previewImage || (userData.avatar && userData.avatar !== "") ? (
                      <img
                        src={previewImage || userData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      // Nếu cả hai đều rỗng -> Hiện Icon User mặc định
                      <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <User size={48} strokeWidth={1.5} />
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
                      {userData.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl text-slate-600">
                    <Mail size={18} className="text-blue-500" />
                    <span className="text-sm font-medium truncate">
                      {userData.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl text-slate-600">
                    <CalendarDays size={18} className="text-blue-500" />
                    <span className="text-sm font-medium truncate">
                      {formatDateTime(userData.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {previewImage && (
              <div className="flex gap-3 animate-in fade-in zoom-in-95 duration-300">
                {/* Nút Cancel */}
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setSelectedFile(null);
                  }}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-slate-600 font-bold bg-white border-2 border-slate-100 rounded-[2rem] hover:border-slate-200 hover:bg-slate-50 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={18} strokeWidth={2.5} />
                  <span>Cancel</span>
                </button>

                {/* Nút Save Avatar */}
                <button
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 active:scale-[0.98] disabled:from-blue-400 disabled:to-indigo-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} strokeWidth={2.5} />
                      <span>Save Avatar</span>
                    </>
                  )}
                </button>
              </div>
            )}


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
                  onClick={() => {
                    if (isEditing) {
                      handleSaveProfile(); 
                    } else {
                      setIsEditing(true); 
                    }
                  }}
                  disabled={isSaving}
                  className="px-5 py-2 bg-slate-50 text-blue-600 text-sm font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    User Name
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
                    User ID
                  </label>
                  <input
                    disabled={true}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                    value={userData.id}
                    onChange={(e) =>
                      setUserData({ ...userData, id: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">
                    Email Address
                  </label>
                  <input
                    disabled={true}
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
