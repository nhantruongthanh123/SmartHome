"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSensorMQTT } from "@/src/hooks/useSensorMQTT";
import { useSession } from "next-auth/react";

export type NotificationType = "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}

// Extract the return type of useSensorMQTT
type SensorMQTTType = ReturnType<typeof useSensorMQTT>;

// Combine Sensor data + Notification data
interface SmartHomeContextValue extends SensorMQTTType {
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type: NotificationType) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  // Thresholds & Auto Mode
  thresholds: any[];
  isAutoMode: boolean;
  handleToggleAutoMode: () => Promise<void>;
  refreshThresholds: () => Promise<void>;
  // Door Logs
  doorLogs: any[];
  refreshDoorLogs: () => Promise<void>;
}

const SmartHomeContext = createContext<SmartHomeContextValue | null>(null);

export function SmartHomeProvider({ children }: { children: React.ReactNode }) {
  const mqttData = useSensorMQTT();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Throttle references (store timestamps)
  const lastTempAlertRef = useRef<number>(0);
  const lastLedAlertRef = useRef<number>(0);
  const lastFanAlertRef = useRef<number>(0);

  // Status start times
  const ledStartRef = useRef<number | null>(null);
  const fanStartRef = useRef<number | null>(null);
  
  const hasNotifiedLogin = useRef<boolean>(false);

  // Sidebar UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // --- THRESHOLDS & AUTO MODE ---
  const [thresholds, setThresholds] = useState<any[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const refreshThresholds = async () => {
    try {
      const res = await fetch("/api/thresholds");
      if (res.ok) {
        const data = await res.json();
        setThresholds(data);
        const anyActive = data.some((t: any) =>
          ["LIGHT", "TEMPERATURE", "HUMIDITY"].includes(t.deviceType) && t.isActive
        );
        setIsAutoMode(anyActive);
      }
    } catch (err) {
      console.error("Failed to fetch thresholds in context", err);
    }
  };

  useEffect(() => {
    refreshThresholds();
  }, [status]);

  const handleToggleAutoMode = async () => {
    const nextState = !isAutoMode;
    const sensors = ["LIGHT", "TEMPERATURE", "HUMIDITY"];
    setIsAutoMode(nextState);
    try {
      await Promise.all(sensors.map(type =>
        fetch("/api/thresholds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceType: type, isActive: nextState }),
        })
      ));
      await refreshThresholds();
    } catch (err) {
      console.error("Failed to toggle Auto Mode", err);
      setIsAutoMode(!nextState);
    }
  };

  // --- DOOR LOGS ---
  const [doorLogs, setDoorLogs] = useState<any[]>([]);
  const lastLoggedStatusRef = useRef<boolean | null>(null);

  const refreshDoorLogs = async () => {
    try {
      const res = await fetch("/api/door/log");
      if (res.ok) {
        const data = await res.json();
        setDoorLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch door logs in context", err);
    }
  };

  useEffect(() => {
    if (status === "authenticated") refreshDoorLogs();
  }, [status]);

  // Handle logging when door status changes
  useEffect(() => {
    if (lastLoggedStatusRef.current === mqttData.doorStatus) return;

    const performLogging = async () => {
      try {
        const res = await fetch("/api/door/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: mqttData.doorStatus ? "OPEN" : "CLOSE" }),
        });
        if (res.ok) {
          // QUAN TRỌNG: Chỉ refresh logs SAU KHI POST thành công
          await refreshDoorLogs();
        }
      } catch (err) {
        console.error("Failed to log door event", err);
      } finally {
        lastLoggedStatusRef.current = mqttData.doorStatus;
      }
    };

    if (lastLoggedStatusRef.current !== null) {
      performLogging();
    } else {
      lastLoggedStatusRef.current = mqttData.doorStatus;
    }
  }, [mqttData.doorStatus]);

  const addNotification = (title: string, message: string, type: NotificationType) => {
    const newNotice: AppNotification = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [newNotice, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // --- 1. LOGIN NOTIFICATION ---
  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasNotifiedLogin.current) {
      hasNotifiedLogin.current = true;
      addNotification(
        "Welcome Back",
        `Hello ${session.user.name || "User"}, your smart home system is active and ready.`,
        "SUCCESS"
      );
    }
  }, [status, session]);

  // --- 2. TEMPERATURE > 30 ALERT (1 HOUR THROTTLE) ---
  useEffect(() => {
    if (mqttData.temperature > 30) {
      const now = Date.now();
      const oneHourMs = 60 * 60 * 1000;
      
      if (now - lastTempAlertRef.current >= oneHourMs) {
        addNotification(
          "High Temperature Alert",
          `The temperature is currently ${mqttData.temperature}°C, which is above 30°C.`,
          "CRITICAL"
        );
        lastTempAlertRef.current = now;
      }
    }
  }, [mqttData.temperature]);

  // --- 3. FAN / LIGHT > 3 HOURS ALERT ---
  useEffect(() => {
    const checkDuration = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const isExclusionTime = currentHour >= 18 || currentHour < 6;

      const currentTimeMs = now.getTime();
      const threeHoursMs = 3 * 60 * 60 * 1000;
      const oneHourMs = 60 * 60 * 1000;

      // Check LED
      if (mqttData.ledStatus) {
        if (!ledStartRef.current) ledStartRef.current = currentTimeMs;
        else if (currentTimeMs - ledStartRef.current >= threeHoursMs && !isExclusionTime) {
          if (currentTimeMs - lastLedAlertRef.current >= oneHourMs) {
            addNotification("Light Left ON", "The light has been ON for more than 3 hours during daytime.", "WARNING");
            lastLedAlertRef.current = currentTimeMs;
          }
        }
      } else ledStartRef.current = null;

      // Check FAN
      if (mqttData.fanStatus) {
        if (!fanStartRef.current) fanStartRef.current = currentTimeMs;
        else if (currentTimeMs - fanStartRef.current >= threeHoursMs && !isExclusionTime) {
          if (currentTimeMs - lastFanAlertRef.current >= oneHourMs) {
            addNotification("Fan Left ON", "The fan has been running for more than 3 hours.", "WARNING");
            lastFanAlertRef.current = currentTimeMs;
          }
        }
      } else fanStartRef.current = null;
    };

    const interval = setInterval(checkDuration, 60000);
    return () => clearInterval(interval);
  }, [mqttData.ledStatus, mqttData.fanStatus]);

  // --- 4. GLOBAL AUTOMATION LOGIC ---
  useEffect(() => {
    if (isAutoMode && mqttData.isConnected && thresholds.length > 0) {
      const getLimit = (type: string) => thresholds.find(t => t.deviceType === type) || { minVal: null, maxVal: null, isActive: false };
      
      const tempLimits = getLimit("TEMPERATURE");
      const lightLimits = getLimit("LIGHT");
      const humiLimits = getLimit("HUMIDITY");

      // Logic Quạt (FAN)
      if (tempLimits.isActive) {
        if (tempLimits.maxVal !== null && mqttData.temperature > tempLimits.maxVal) mqttData.toggleDevice("fan" as any, "ON");
        else if (tempLimits.minVal !== null && mqttData.temperature < tempLimits.minVal) mqttData.toggleDevice("fan" as any, "OFF");
      }

      // Logic Đèn (LED)
      if (lightLimits.isActive) {
        if (lightLimits.minVal !== null && mqttData.light < lightLimits.minVal) mqttData.toggleDevice("led" as any, "ON");
        else if (lightLimits.maxVal !== null && mqttData.light > lightLimits.maxVal) mqttData.toggleDevice("led" as any, "OFF");
      }

      // Logic Máy bơm (PUMP)
      if (humiLimits.isActive) {
        if (humiLimits.minVal !== null && mqttData.humidity < humiLimits.minVal) mqttData.toggleDevice("pump" as any, "ON");
        else if (humiLimits.maxVal !== null && mqttData.humidity > humiLimits.maxVal) mqttData.toggleDevice("pump" as any, "OFF");
      }
    }
  }, [mqttData.temperature, mqttData.humidity, mqttData.light, isAutoMode, mqttData.isConnected, thresholds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SmartHomeContext.Provider
      value={{
        ...mqttData,
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
        isSidebarOpen,
        toggleSidebar,
        thresholds,
        isAutoMode,
        handleToggleAutoMode,
        refreshThresholds,
        doorLogs,
        refreshDoorLogs,
      }}
    >
      {children}
    </SmartHomeContext.Provider>
  );
}

export function useSmartHome() {
  const context = useContext(SmartHomeContext);
  if (!context) {
    throw new Error("useSmartHome must be used within a SmartHomeProvider");
  }
  return context;
}
