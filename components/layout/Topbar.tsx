"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "../toggle/ThemeToggle";

export default function Topbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user || {
    name: "Guest",
    image: "",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`topbar-user-link flex items-center gap-3 pl-4 cursor-pointer group py-1.5 px-2 rounded-2xl transition-all ${
              isOpen ? "bg-[#f1f5f9] dark:bg-[#273449]" : ""
            }`}
          >
            <div className="text-right hidden md:block">
              <p className="topbar-user-name text-[14px] font-bold leading-tight transition-colors">
                {user.name}
              </p>
              <p className="topbar-user-role text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                {"USER"}
              </p>
            </div>

            <div className="w-10 h-10 bg-slate-100 dark:bg-[#273449] rounded-2xl overflow-hidden flex items-center justify-center text-[#2563eb] dark:text-blue-400 text-[13px] font-bold shadow-sm group-hover:rotate-3 transition-all border-2 border-white dark:border-[#334155]">
              {user.image && user.image !== "" ? (
                <img
                  src={user.image}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span>{user.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <ChevronDown
              size={14}
              className={`topbar-user-arrow transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Actual Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-[#dbe2ee] dark:border-[#334155] py-2 animate-in fade-in zoom-in duration-200 z-[60]">
              <div className="px-4 py-3 border-bottom dark:border-[#334155] mb-2">
                <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Account</p>
                <p className="text-sm font-bold truncate">{user.email || user.name}</p>
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-[#475569] dark:text-[#cbd5e1] hover:bg-[#f1f5f9] dark:hover:bg-[#273449] hover:text-[#2563eb] transition-all"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-[#475569] dark:text-[#cbd5e1] hover:bg-[#f1f5f9] dark:hover:bg-[#273449] hover:text-[#2563eb] transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>

              <div className="h-[1px] bg-[#dbe2ee] dark:bg-[#334155] my-2 mx-2" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

