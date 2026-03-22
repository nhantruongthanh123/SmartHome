"use client";

import { usePathname } from "next/navigation";

const titleByPath: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/devices": "Device Management",
};

export default function Topbar() {
  const pathname = usePathname();
  const title = titleByPath[pathname] ?? "Smart Home";

  return (
    <header className="topbar">
      <h1>{title}</h1>
      <input className="search" placeholder="Search devices, scenes..." type="search" />
    </header>
  );
}
