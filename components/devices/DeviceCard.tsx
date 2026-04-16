"use client";
import React, { useState, useEffect } from "react";

interface DeviceCardProps {
  name: string;
  statusText?: string;
  icon: React.ReactNode;
  onToggle?: (isOn: boolean) => void;
  defaultOn?: boolean;
  children?: React.ReactNode;
}

export default function DeviceCard({
  name,
  statusText,
  icon,
  onToggle,
  defaultOn = false,
  children,
}: DeviceCardProps) {
  const [active, setActive] = useState(defaultOn);

  // Đồng bộ với dữ liệu bên ngoài khi trang load
  useEffect(() => {
    setActive(defaultOn);
  }, [defaultOn]);
  const handleToggle = () => {
    const nextState = !active;
    setActive(nextState);
    if (onToggle) onToggle(nextState);
  };

  return (
    <div
      className="card-surface p-6 rounded-3xl flex flex-col gap-6 transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        {/* Icon đổi màu */}
        <div
          className={`p-3 rounded-2xl transition-all duration-300 ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}
        >
          {icon}
        </div>

        {/* Nút Toggle */}
        <button
          onClick={handleToggle}
          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? "device-track-on" : "device-track-off"
            }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${active ? "right-1" : "left-1"}`}
          />
        </button>
      </div>

      <div className="flex flex-col">
        <h3 className="card-title font-bold text-lg leading-tight">
          {name}
        </h3>

        <div className="h-5 mt-1 overflow-hidden">
          {active ? (
            <p className="device-status-on text-[11px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-1 duration-200">
              {statusText ? statusText : "DEVICE IS ON"}
            </p>
          ) : null}
        </div>
      </div>

      <div className="device-footer pt-4 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
