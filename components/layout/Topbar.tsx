"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "../toggle/ThemeToggle";

export default function Topbar() {
  const { data: session } = useSession();
  const user = session?.user || {
    name: "Guest",
    image: "",
  };


  return (
    <header className="topbar-shell h-20 backdrop-blur-lg flex items-center justify-between px-8 shrink-0 z-50 sticky top-0">
      <div className="flex-1 max-w-md relative group">
        <Search
          className="topbar-search-icon absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search devices, scenes..."
          className="topbar-search-input w-full rounded-2xl py-2.5 pl-12 pr-4 text-sm transition-all outline-none"
        />
      </div>

      {/* 2. Cụm bên phải: Thông báo & Profile */}
      <div className="flex items-center gap-4">
        {/* Nút thông báo: Bo tròn mượt */}
        <button className="topbar-notify-btn p-2.5 rounded-full transition-all relative group">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:animate-ping" />
        </button>

        <div>
          <ThemeToggle />
        </div>

        <Link href="/profile">
          <div className="topbar-user-link flex items-center gap-3 pl-4 cursor-pointer group py-1.5 px-2 rounded-2xl transition-all">
            <div className="text-right hidden md:block">
              <p className="topbar-user-name text-[14px] font-bold leading-tight transition-colors">
                {user.name}
              </p>
              <p className="topbar-user-role text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                {"USER"}
              </p>
            </div>

            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl overflow-hidden flex items-center justify-center text-white text-[13px] font-bold shadow-lg shadow-blue-200/50 group-hover:rotate-3 transition-all border-2 border-white">
              {user.image && user.image !== "" ? (
                <img 
                  src={user.image} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                  // Thêm onError để nếu link ảnh bị lỗi thì nó hiện chữ cái đầu tên bạn
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                // Hiện chữ cái đầu của tên (ví dụ: Nhân -> N) khi không có ảnh
                <span>{user.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <ChevronDown
              size={14}
              className="topbar-user-arrow transition-all"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
