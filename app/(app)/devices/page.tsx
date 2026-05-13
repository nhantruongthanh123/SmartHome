"use client";
import React, { useState, useEffect } from "react";
import DeviceCard from "@/components/devices/DeviceCard";
import { useSmartHome } from "@/src/contexts/SmartHomeContext";
import { Sun, Wind, Droplets, Save, Loader2, DoorOpen, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Threshold, DeviceType } from "@/src/types/threshold";

// --- Component con: Nhập ngưỡng Min/Max ---
function ThresholdSettings({
  label,
  unit,
  initialData,
  onSave,
  isSaving
}: {
  label: string;
  unit: string;
  initialData: Partial<Threshold>;
  onSave: (min: number, max: number, active: boolean) => void;
  isSaving?: boolean;
}) {
  const [min, setMin] = useState(initialData.minVal || 0);
  const [max, setMax] = useState(initialData.maxVal || 0);
  const [active, setActive] = useState(initialData.isActive || false);

  useEffect(() => {
    setMin(initialData.minVal ?? 0);
    setMax(initialData.maxVal ?? 0);
    setActive(initialData.isActive ?? false);
  }, [initialData]);

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label} Settings</span>
        <button
          onClick={() => setActive(!active)}
          className={`w-8 h-4 rounded-full transition-all ${active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <div className={`w-3 h-3 bg-white rounded-full transition-all mt-0.5 ml-0.5 ${active ? 'translate-x-4' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold card-muted uppercase tracking-wider">Turn ON when</label>
          <div className="relative">
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(parseFloat(e.target.value))}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
            />
            <span className="absolute right-3 top-2 text-[10px] card-muted font-bold">{unit}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold card-muted uppercase tracking-wider">Turn OFF when</label>
          <div className="relative">
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(parseFloat(e.target.value))}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
            />
            <span className="absolute right-3 top-2 text-[10px] card-muted font-bold">{unit}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onSave(min, max, active)}
        disabled={isSaving}
        className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Save Configuration
      </button>
    </div>
  );
}

// --- Component chính: Trang quản lý thiết bị ---
export default function DevicePage() {
  const {
    toggleDevice, isConnected,
    ledStatus, fanStatus, pumpStatus,
    doorStatus, motionStatus, doorTimer,
    thresholds, refreshThresholds
  } = useSmartHome();
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<DeviceType | string | null>(null);


  const handleSaveThreshold = async (type: DeviceType | string, minVal: number, maxVal: number, isActive: boolean) => {
    setSavingKey(type);
    try {
      const res = await fetch("/api/thresholds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceType: type, minVal, maxVal, isActive }),
      });
      if (res.ok) {
        toast.success(`${type} automation thresholds saved!`);
        await refreshThresholds();
      } else {
        toast.error("Failed to save changes");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSavingKey(null);
    }
  };

  const getThreshold = (type: string): Threshold => {
    return thresholds.find(t => t.deviceType === type) || { userId: '', deviceType: type, minVal: 0, maxVal: 0, isActive: false };
  };

  return (
    <section className="flex flex-col gap-6 bg-main min-h-screen">
      <Toaster position="top-right" richColors />
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-extrabold card-title">Device Management</h2>
          <p className="text-sm card-muted">
            Configure automation thresholds and manual controls.
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isConnected ? "bg-green-100 text-green-600 dark:bg-green-900/20" : "bg-red-100 text-red-600"}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {isConnected ? "Server Connected" : "Connection Lost"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {/* LIGHTING CARD */}
        <DeviceCard
          name="Smart Lighting"
          icon={<Sun size={24} />}
          onToggle={(status) => toggleDevice("led" as any, status ? "ON" : "OFF")}
          defaultOn={ledStatus}
        >
          <ThresholdSettings
            label="LUX"
            unit="lx"
            initialData={getThreshold("LIGHT")}
            isSaving={savingKey === "LIGHT"}
            onSave={(min, max, active) => handleSaveThreshold("LIGHT", min, max, active)}
          />
        </DeviceCard>

        {/* FAN CARD */}
        <DeviceCard
          name="Cooling Fan"
          icon={<Wind size={24} />}
          onToggle={(status) => toggleDevice("fan" as any, status ? "ON" : "OFF")}
          defaultOn={fanStatus}
        >
          <ThresholdSettings
            label="TEMP"
            unit="°C"
            initialData={getThreshold("TEMPERATURE")}
            isSaving={savingKey === "TEMPERATURE"}
            onSave={(min, max, active) => handleSaveThreshold("TEMPERATURE", min, max, active)}
          />
        </DeviceCard>

        {/* PUMP CARD */}
        <DeviceCard
          name="Smart Pump"
          icon={<Droplets size={24} />}
          onToggle={(status) => toggleDevice("pump" as any, status ? "ON" : "OFF")}
          defaultOn={pumpStatus}
        >
          <ThresholdSettings
            label="MOISTURE"
            unit="%"
            initialData={getThreshold("HUMIDITY")}
            isSaving={savingKey === "HUMIDITY"}
            onSave={(min, max, active) => handleSaveThreshold("HUMIDITY", min, max, active)}
          />
        </DeviceCard>

        {/* DOOR CONTROL CARD */}
        <DeviceCard
          name="Door Control"
          statusText={doorStatus ? "DOOR IS OPEN" : "DOOR IS CLOSED"}
          icon={doorStatus ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
          defaultOn={doorStatus}
          onToggle={(status) => toggleDevice("door", status ? "ON" : "OFF")}
        >
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border">
            <p className="text-[10px] card-muted font-medium leading-relaxed">
              Click the toggle to manually open or close the door.
            </p>

            <div className={`mt-2 p-3 rounded-xl flex items-center gap-3 transition-colors ${doorStatus ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30' : 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30'}`}>
              <div className={`w-2 h-2 rounded-full ${doorStatus ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${doorStatus ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                {doorStatus ? "SECURITY ALERT: DOOR OPEN" : "SECURITY SECURE: CLOSED"}
              </span>
            </div>
          </div>
        </DeviceCard>
      </div>
    </section>
  );
}
