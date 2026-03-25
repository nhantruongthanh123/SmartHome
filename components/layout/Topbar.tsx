"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";

const USER_MOCK = {
  name: "Thanh Nhân",
  email: "thanhnhan@hcmut.edu.vn",
  avatar: "TN",
  role: "Admin",
};

export default function Topbar() {
  return (
    <header className="h-20 bg-white/70 backdrop-blur-lg flex items-center justify-between px-8 border-b border-slate-100/80 shrink-0 z-50 sticky top-0">
      <div className="flex-1 max-w-md relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-blue-600 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search devices, scenes..."
          className="w-full bg-slate-100/50 border border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/30 rounded-2xl py-2.5 pl-12 pr-4 text-sm transition-all outline-none text-slate-600 placeholder:text-slate-400"
        />
      </div>

      {/* 2. Cụm bên phải: Thông báo & Profile */}
      <div className="flex items-center gap-4">
        {/* Nút thông báo: Bo tròn mượt */}
        <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-all relative group">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:animate-ping" />
        </button>

        <Link href="/profile">
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100 cursor-pointer group hover:bg-slate-50/50 py-1.5 px-2 rounded-2xl transition-all">
            <div className="text-right hidden md:block">
              <p className="text-[14px] font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">
                {USER_MOCK.name}
              </p>
              <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mt-0.5">
                {USER_MOCK.role}
              </p>
            </div>

            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl overflow-hidden flex items-center justify-center text-white text-[13px] font-bold shadow-lg shadow-blue-200/50 group-hover:rotate-3 transition-all border-2 border-white">
              {USER_MOCK.avatar}
            </div>

            <ChevronDown
              size={14}
              className="text-slate-300 group-hover:text-blue-500 transition-all"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
