"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cpu, User, Bell, Settings } from "lucide-react";
import { useSmartHome } from "@/src/contexts/SmartHomeContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useSmartHome();

  return (
    <aside className={`sidebar-shell h-screen flex flex-col gap-8 shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? "w-64 p-6" : "w-[88px] py-6 px-3"}`}>
      {/* Logo Section */}
      <div className={`flex items-center ${isSidebarOpen ? "gap-3 px-2" : "justify-center"}`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
        {isSidebarOpen && <h1 className="sidebar-brand-title font-bold text-xl whitespace-nowrap">SmartHome</h1>}
      </div>

      {/* Main Navigation */}
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
        {isSidebarOpen ? (
          <p className="sidebar-quick-label text-[10px] font-bold uppercase tracking-widest px-2 mb-4 whitespace-nowrap">
            Quick Actions
          </p>
        ) : (
          <div className="h-[2px] bg-border mx-4 w-8 mb-4"></div>
        )}
        
        <nav className="flex flex-col gap-2">
          <Link href="/notifications">
            <MenuItem 
              icon={<Bell size={18} />} 
              label="Notifications" 
              active={pathname === "/notifications"}
            />
          </Link>
          <Link href="/settings">
            <MenuItem 
              icon={<Settings size={18} />} 
              label="Settings" 
              active={pathname === "/settings"}
            />
          </Link>
        </nav>
      </div>

      {/* Footer / Version */}
      <div className={`mt-auto ${isSidebarOpen ? "px-2" : "px-0"}`}>
        <div className={`sidebar-footer-card rounded-2xl ${isSidebarOpen ? "p-4" : "p-3 flex justify-center"}`}>
          <p className="sidebar-footer-text text-[10px] text-center font-medium whitespace-nowrap">
            {isSidebarOpen ? "DADN - Nhom 17 v1.0" : "v1"}
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
  const { isSidebarOpen } = useSmartHome();
  
  return (
    <div
      className={`menu-item flex items-center py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${active ? "active" : ""} ${isSidebarOpen ? "gap-3 px-3" : "justify-center"}`}
      title={!isSidebarOpen ? label : ""}
    >
      <div className="shrink-0">{icon}</div>
      {isSidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">{label}</span>}
    </div>
  );
}
