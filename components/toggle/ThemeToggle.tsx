"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Chỉ hiển thị nút sau khi trang đã load xong ở Client để tránh lỗi Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-2.5 w-10 h-10" />; // Trả về khoảng trống tạm thời

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="theme-toggle-btn p-2.5 rounded-2xl transition-all border"
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-slate-600" />
      )}
    </button>
  );
}