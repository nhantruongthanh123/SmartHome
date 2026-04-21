"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User, Settings, LogOut, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "../toggle/ThemeToggle";
import { UserProfile } from "@/src/types/user";
import { useSmartHome } from "@/src/contexts/SmartHomeContext";

export default function Topbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const { unreadCount, markAllAsRead, toggleSidebar } = useSmartHome();
 
  // Unified user object for display
  const userDisplay = {
    name: userData?.name || session?.user?.name || "Guest",
    email: userData?.email || (session?.user as any)?.email || "",
    image: userData?.image || session?.user?.image || "",
  };

  // Fetch real-time user info from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/user/profile");
          if (res.ok) {
            const data = await res.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

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
      {/* 0. Hamburger Menu */}
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 2. Cụm bên phải: Thông báo & Profile */}
      <div className="flex items-center gap-4">
        {/* Nút thông báo: Bo tròn mượt */}
        <Link 
          href="/notifications"
          onClick={markAllAsRead}
          className="topbar-notify-btn p-2.5 rounded-full transition-all relative group flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#0f172a] shadow-sm animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div>
          <ThemeToggle />
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`topbar-user-link flex items-center gap-3 pl-4 cursor-pointer group py-1.5 px-2 rounded-2xl transition-all ${isOpen ? "bg-[#f1f5f9] dark:bg-[#273449]" : ""
              }`}
          >
            <div className="text-right hidden md:block">
              <p className="topbar-user-name text-[14px] font-bold leading-tight transition-colors">
                {userDisplay.name}
              </p>
              <p className="topbar-user-role text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                {"USER"}
              </p>
            </div>

            <div className="w-10 h-10 bg-slate-100 dark:bg-[#273449] rounded-2xl overflow-hidden flex items-center justify-center text-[#2563eb] dark:text-blue-400 text-[13px] font-bold shadow-sm group-hover:rotate-3 transition-all border-2 border-white dark:border-[#334155]">
              {userDisplay.image && userDisplay.image !== "" ? (
                <img
                  src={userDisplay.image}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span>{userDisplay.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <ChevronDown
              size={14}
              className={`topbar-user-arrow transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
            />
          </div>

          {/* Actual Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-card rounded-[1.5rem] shadow-2xl border border-border py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
              <div className="px-5 py-4 border-b border-border mb-2">
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] mb-1">Account</p>
                <p className="text-sm font-bold text-text truncate">{userDisplay.email || userDisplay.name}</p>
              </div>

              <div className="px-2 space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-text rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={18} className="opacity-70" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-text rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={18} className="opacity-70" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="h-px bg-border my-2 mx-4" />

              <div className="px-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 rounded-xl hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

