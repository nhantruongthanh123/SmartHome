// Đường dẫn: app/(app)/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useSensorMQTT } from "@/src/hooks/useSensorMQTT"; 
import SensorCard from "@/components/dashboard/StatCard"; 
import SensorChart from "@/components/dashboard/SensorChart"; 
import {
  Thermometer,
  Droplets,
  Sun,
  LineChart as ChartIcon,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function DashboardPage() {
  // 1. Rút TOÀN BỘ dữ liệu real-time từ Hook ra (bao gồm cả mảng Lịch sử)
  const { 
    temperature, humidity, light, 
    tempHistory, humiHistory, lightHistory, // <--- Lấy mảng dữ liệu thật
    toggleDevice, isConnected 
  } = useSensorMQTT();
  
  const [isAutoMode, setIsAutoMode] = useState(true);

  // --- LOGIC MODULE 2: GIÁM SÁT & CẢNH BÁO ---
  useEffect(() => {
    if (temperature > 35) {
      toast.error("CẢNH BÁO: Nhiệt độ phòng quá cao!", {
        description: `Hiện tại: ${temperature}°C. Hệ thống sẽ tự kích hoạt làm mát.`,
        duration: 5000,
      });
    }

    if (isAutoMode && isConnected) {
      if (temperature > 30) toggleDevice("fan" as any, "ON");
      else if (temperature < 28) toggleDevice("fan" as any, "OFF");

      if (light < 200) toggleDevice("led" as any, "ON");
      else if (light > 500) toggleDevice("led" as any, "OFF");
    }
  }, [temperature, light, isAutoMode, isConnected, toggleDevice]);

  return (
    <div className="flex flex-col gap-8 p-4 max-w-7xl mx-auto">
      <Toaster position="top-right" richColors />

      {/* Header Dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Smart Home Dashboard
          </h2>
          <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            {isConnected ? "System Online" : "System Offline"}
          </p>
        </div>

        <button
          onClick={() => setIsAutoMode(!isAutoMode)}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${
            isAutoMode
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {isAutoMode ? "AUTO MODE: ON" : "AUTO MODE: OFF"}
        </button>
      </div>

      {/* GRID SENSOR CARDS (MODULE 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SensorCard
          label="Nhiệt độ"
          value={temperature.toString()}
          unit="°C"
          icon={<Thermometer size={24} />}
          trend={temperature > 30 ? "Cao" : "Ổn định"}
          color={temperature > 35 ? "red" : "blue"}
        />
        <SensorCard
          label="Độ ẩm"
          value={humidity.toString()}
          unit="%"
          icon={<Droplets size={24} />}
          trend="Bình thường"
          color="blue"
        />
        <SensorCard
          label="Ánh sáng"
          value={light.toString()}
          unit="Lux"
          icon={<Sun size={24} />}
          trend={light < 200 ? "Yếu" : "Tốt"}
          color="orange"
        />
      </div>

      {/* BIỂU ĐỒ LỊCH SỬ (MODULE 4) */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <ChartIcon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Real-time Analytics</h3>
            <p className="text-sm text-slate-500">Live sensor data tracking</p>
          </div>
        </div>

        {/* Dùng Grid để chia 2 biểu đồ nằm cạnh nhau trên màn hình to */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Nhiệt độ truyền mảng tempHistory thật vào */}
          <SensorChart 
            title="Temperature Trend" 
            data={tempHistory} 
            color="#ef4444" // Màu đỏ cho nhiệt độ
          />
          
          {/* Chart Độ ẩm truyền mảng humiHistory thật vào */}
          <SensorChart 
            title="Humidity Trend" 
            data={humiHistory} 
            color="#3b82f6" // Màu xanh cho độ ẩm
          />
        </div>
      </div>
    </div>
  );
}