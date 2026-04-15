"use client";
import React, { useState } from "react";
import DeviceCard from "@/components/devices/DeviceCard";
import { useSensorMQTT } from "@/src/hooks/useSensorMQTT";
import { Sun, Wind, Droplets } from "lucide-react";

// --- Component con: Thanh trượt độ sáng có nhảy số ---
function BrightnessSlider({
  initialValue = 80,
  onChange,
}: {
  initialValue?: number;
  onChange?: (val: number) => void;
}) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value);
    setValue(newVal);
    if (onChange) onChange(newVal);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[13px] font-bold card-muted uppercase tracking-wider">
        <span>Manual Brightness</span>
        <span className="text-blue-600 dark:text-blue-400 font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={handleChange}
        className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
      />
    </div>
  );
}

// --- Component chính: Trang quản lý thiết bị ---
export default function DevicePage() {
  const { toggleDevice, isConnected } = useSensorMQTT();

  return (
    <section className="flex flex-col gap-6 bg-main min-h-screen">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-extrabold card-title">Your Devices</h2>
          <p className="text-sm card-muted">
            Manage and monitor all your smart modules in one place.
          </p>
        </div>
        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
          {isConnected ? "" : "Disconnected from Server"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* THẺ 1: SMART LIGHTING */}
        <DeviceCard
          name="Smart Lighting"
          icon={<Sun size={24} />}
          onToggle={(status) =>
            toggleDevice("led" as any, status ? "ON" : "OFF")
          }
        >
          <div className="flex flex-col gap-4">
            <BrightnessSlider
              initialValue={80}
              onChange={(val) => console.log("Brightness level:", val)}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              <label className="text-[10px] font-bold card-muted uppercase tracking-wider">
                Enable Light Threshold
              </label>
            </div>
          </div>
        </DeviceCard>

        {/* THẺ 2: COOLING FAN */}
        <DeviceCard
          name="Cooling Fan"
          icon={<Wind size={24} />}
          onToggle={(status) =>
            toggleDevice("fan" as any, status ? "ON" : "OFF")
          }
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500 accent-blue-600"
            />
            <label className="text-[10px] font-bold card-muted uppercase tracking-wider">
              Enable Auto Mode (28°C Threshold)
            </label>
          </div>
        </DeviceCard>

        {/* THẺ 3: SMART PUMP*/}
        <DeviceCard
          name="Smart Pump"
          icon={<Droplets size={24} />}
          onToggle={(status) =>
            toggleDevice("pump" as any, status ? "ON" : "OFF")
          }
        >
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold card-muted uppercase tracking-wider">
              Recent Activity
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-[10px] card-muted font-medium">
                Last run:{" "}
                <span className="font-bold card-title">Auto Mode</span> - 5
                mins ago
              </p>
            </div>
          </div>
        </DeviceCard>
      </div>
    </section>
  );
}
