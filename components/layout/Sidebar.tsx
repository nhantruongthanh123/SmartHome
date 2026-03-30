"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cpu, User, Plus, Bell, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-shell w-64 h-screen flex flex-col p-6 gap-8 shrink-0">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
        <h1 className="sidebar-brand-title font-bold text-xl">SmartHome</h1>
      </div>

      {/* Main Navigation - Đã bọc thẻ Link */}
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard">
          <MenuItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
        </Link>
        <Link href="/devices">
          <MenuItem
            icon={<Cpu size={18} />}
            label="Device Management"
            active={pathname === "/devices"}
          />
        </Link>
        <Link href="/profile">
          <MenuItem
            icon={<User size={18} />}
            label="User Profile"
            active={pathname === "/profile"}
          />
        </Link>
      </nav>

      {/* QUICK ACTIONS SECTION */}
      <div className="mt-4">
        <p className="sidebar-quick-label text-[10px] font-bold uppercase tracking-widest px-2 mb-4">
          Quick Actions
        </p>
        <nav className="flex flex-col gap-2">
          <MenuItem icon={<Plus size={18} />} label="Add Device" />
          <MenuItem icon={<Bell size={18} />} label="Notifications" />
          <MenuItem icon={<Settings size={18} />} label="Settings" />
        </nav>
      </div>

      {/* Footer / Version */}
      <div className="mt-auto px-2">
        <div className="sidebar-footer-card p-4 rounded-2xl">
          <p className="sidebar-footer-text text-[10px] text-center font-medium">
            DADN - Nhom 17 v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}

function MenuItem({
  icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`menu-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${active ? "active" : ""}`}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
