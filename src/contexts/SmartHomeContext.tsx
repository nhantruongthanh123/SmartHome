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
      
      // Exclusion period: 18h to 6h tomorrow (inclusive if checking hour directly)
      // "Except from 18h -> 6h tomorrow" means it only alerts if current hour is BETWEEN 6:00 and 17:59.
      const isExclusionTime = currentHour >= 18 || currentHour < 6;

      const currentTimeMs = now.getTime();
      const threeHoursMs = 3 * 60 * 60 * 1000;
      const oneHourMs = 60 * 60 * 1000;

      // Check LED
      if (mqttData.ledStatus) {
        if (!ledStartRef.current) {
          ledStartRef.current = currentTimeMs;
        } else {
          const duration = currentTimeMs - ledStartRef.current;
          if (duration >= threeHoursMs && !isExclusionTime) {
            // Throttle notification to once per hour if it stays on
            if (currentTimeMs - lastLedAlertRef.current >= oneHourMs) {
              addNotification(
                "Light Left ON",
                "The light has been ON for more than 3 hours during daytime.",
                "WARNING"
              );
              lastLedAlertRef.current = currentTimeMs;
            }
          }
        }
      } else {
        ledStartRef.current = null;
      }

      // Check FAN
      if (mqttData.fanStatus) {
        if (!fanStartRef.current) {
          fanStartRef.current = currentTimeMs;
        } else {
          const duration = currentTimeMs - fanStartRef.current;
          if (duration >= threeHoursMs && !isExclusionTime) {
             if (currentTimeMs - lastFanAlertRef.current >= oneHourMs) {
                addNotification(
                  "Fan Left ON",
                  "The fan has been running for more than 3 hours.",
                  "WARNING"
                );
                lastFanAlertRef.current = currentTimeMs;
             }
          }
        }
      } else {
        fanStartRef.current = null;
      }
    };

    // Evaluate duration every 1 minute
    const interval = setInterval(checkDuration, 60000);
    return () => clearInterval(interval);
  }, [mqttData.ledStatus, mqttData.fanStatus]);


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
