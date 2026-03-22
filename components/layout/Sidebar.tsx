"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/devices", label: "Device Management" },
  { href: "/profile", label: "User Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge" aria-hidden="true" />
        <div>
          <p className="brand-title">SmartHome</p>
          <p className="brand-subtitle">Control Panel</p>
        </div>
      </div>

      <nav aria-label="Main navigation">
        <ul className="nav-list">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link className={`nav-link${isActive ? " active" : ""}`} href={item.href}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
