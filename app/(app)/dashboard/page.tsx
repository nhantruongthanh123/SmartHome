"use client";
import React, { useEffect, useState } from "react";
import { useSensorMQTT } from "@/src/hooks/useSensorMQTT";
import SensorCard from "@/components/dashboard/StatCard";
import {
  Thermometer,
  Droplets,
  Sun,
  LineChart as ChartIcon,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const mockHistoryData = [
  { time: "08:00", temp: 25, humi: 60, light: 400 },
  { time: "10:00", temp: 28, humi: 55, light: 600 },
  { time: "12:00", temp: 32, humi: 50, light: 800 },
  { time: "14:00", temp: 36, humi: 45, light: 900 },
  { time: "16:00", temp: 39, humi: 52, light: 500 },
  { time: "18:00", temp: 27, humi: 58, light: 300 },
  { time: "20:00", temp: 26, humi: 62, light: 100 },
];

export default function DashboardPage() {
  const { temperature, humidity, light, toggleDevice, isConnected } =
    useSensorMQTT();
  const [isAutoMode, setIsAutoMode] = useState(true);

  const lastMock = mockHistoryData[mockHistoryData.length - 1];

  const displayTemp = temperature !== 0 ? temperature : lastMock.temp;
  const displayHumi = humidity !== 0 ? humidity : lastMock.humi;
  const displayLight = light !== 0 ? light : lastMock.light;

  // --- LOGIC MODULE 2: GIÁM SÁT & CẢNH BÁO ---
  useEffect(() => {
    const tempVal = parseFloat(displayTemp.toString());
    const lightVal = parseFloat(displayLight.toString());

    if (tempVal > 35) {
      toast.error("CẢNH BÁO: Nhiệt độ phòng quá cao!", {
        description: `Hiện tại: ${tempVal}°C. Hệ thống sẽ tự kích hoạt làm mát.`,
        duration: 5000,
      });
    }

    if (isAutoMode && isConnected) {
      if (tempVal > 30) toggleDevice("fan" as any, "ON");
      else if (tempVal < 28) toggleDevice("fan" as any, "OFF");

      if (lightVal < 200) toggleDevice("led" as any, "ON");
      else if (lightVal > 500) toggleDevice("led" as any, "OFF");
    }
  }, [displayTemp, displayLight, isAutoMode, isConnected, toggleDevice]);

  return (
    <div className="flex flex-col gap-8 p-4 max-w-7xl mx-auto">
      <Toaster position="top-right" richColors />

      {/* Header Dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Smart Home Dashboard
          </h2>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            {isConnected ? "System Online" : "System Offline"}
          </p>
        </div>

        <button
          onClick={() => setIsAutoMode(!isAutoMode)}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${
            isAutoMode
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-400 border-slate-200"
          }`}
        >
          {isAutoMode ? "AUTO MODE: ON" : "AUTO MODE: OFF"}
        </button>
      </div>

      {/* GRID SENSOR CARDS (MODULE 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SensorCard
          label="Nhiệt độ"
          value={displayTemp.toString()}
          unit="°C"
          icon={<Thermometer size={20} />}
          trend={parseFloat(displayTemp.toString()) > 30 ? "Cao" : "Ổn định"}
          color={parseFloat(displayTemp.toString()) > 35 ? "red" : "blue"}
        />
        <SensorCard
          label="Độ ẩm"
          value={displayHumi.toString()}
          unit="%"
          icon={<Droplets size={20} />}
          trend="Bình thường"
          color="blue"
        />
        <SensorCard
          label="Ánh sáng"
          value={displayLight.toString()}
          unit="Lux"
          icon={<Sun size={20} />}
          trend={parseFloat(displayLight.toString()) < 200 ? "Yếu" : "Tốt"}
          color="blue"
        />
      </div>

      {/* BIỂU ĐỒ LỊCH SỬ (MODULE 4) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ChartIcon size={20} />
          </div>
          <div>
            <h3 className="text-s font-bold text-blue-800">Trend Chart</h3>
            <p className="text-s text-blue-400">Daily Data Insights</p>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockHistoryData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#000000", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#000000", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Line
                name="Nhiệt độ (°C)"
                type="monotone"
                dataKey="temp"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Độ ẩm (%)"
                type="monotone"
                dataKey="humi"
                stroke="#1c4783"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
