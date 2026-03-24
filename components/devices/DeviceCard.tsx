"use client";
import React, { useState, useEffect } from "react";

interface DeviceCardProps {
  name: string;
  statusText?: string;
  icon: React.ReactNode;
  onToggle?: (isOn: boolean) => void;
  disabled?: boolean;
  defaultOn?: boolean;
  children?: React.ReactNode;
}

export default function DeviceCard({
  name,
  statusText,
  icon,
  onToggle,
  disabled,
  defaultOn = false,
  children,
}: DeviceCardProps) {
  const [active, setActive] = useState(defaultOn);

  // Đồng bộ với dữ liệu bên ngoài khi trang load
  useEffect(() => {
    setActive(defaultOn);
  }, [defaultOn]);

  const handleToggle = () => {
    if (disabled) return;
    const nextState = !active;
    setActive(nextState);
    if (onToggle) onToggle(nextState);
  };

  return (
    <div
      className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6 transition-all duration-300 ${disabled ? "opacity-50" : ""}`}
    >
      <div className="flex justify-between items-start">
        {/* Icon đổi màu */}
        <div
          className={`p-3 rounded-2xl transition-all duration-300 ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 text-slate-400"}`}
        >
          {icon}
        </div>

        {/* Nút Toggle */}
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
            active ? "bg-blue-600" : "bg-slate-200"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${active ? "right-1" : "left-1"}`}
          />
        </button>
      </div>

      <div className="flex flex-col">
        <h3 className="font-bold text-slate-800 text-lg leading-tight">
          {name}
        </h3>

        <div className="h-5 mt-1 overflow-hidden">
          {active ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 animate-in fade-in slide-in-from-top-1 duration-200">
              {statusText ? statusText : "DEVICE IS ON"}
            </p>
          ) : null}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
