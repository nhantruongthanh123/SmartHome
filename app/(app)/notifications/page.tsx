"use client";

import React from "react";
import { useSmartHome } from "@/src/contexts/SmartHomeContext";
import { Bell, Info, AlertTriangle, ShieldAlert, CheckCircle, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useSmartHome();

  const getIcon = (type: string) => {
    switch (type) {
      case "INFO":
        return <Info className="text-blue-500" size={24} />;
      case "WARNING":
        return <AlertTriangle className="text-orange-500" size={24} />;
      case "CRITICAL":
        return <ShieldAlert className="text-red-500" size={24} />;
      case "SUCCESS":
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Bell className="text-gray-500" size={24} />;
    }
  };

  const getBgStyle = (type: string, read: boolean) => {
    if (read) return "bg-card border-border opacity-70";
    switch (type) {
      case "INFO":
        return "bg-blue-500/10 border-blue-500/20";
      case "WARNING":
        return "bg-orange-500/10 border-orange-500/20";
      case "CRITICAL":
        return "bg-red-500/10 border-red-500/20";
      case "SUCCESS":
        return "bg-green-500/10 border-green-500/20";
      default:
        return "bg-card border-border";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold card-title flex items-center gap-2">
            <Bell size={24} />
            Notifications
          </h2>
          <p className="card-muted text-sm mt-1">
            You have {unreadCount} unread system {unreadCount === 1 ? 'alert' : 'alerts'}.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-600 px-4 py-2 bg-blue-500/10 rounded-xl transition-colors"
          >
            <Check size={16} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-border">
            <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="font-bold text-lg">No Notifications</h3>
            <p className="text-sm card-muted">We will let you know if anything needs your attention.</p>
          </div>
        ) : (
          notifications.map((notice) => (
            <div
              key={notice.id}
              className={`p-4 rounded-2xl border flex items-start gap-4 transition-all duration-300 ${getBgStyle(
                notice.type,
                notice.read
              )}`}
            >
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                {getIcon(notice.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold ${notice.read ? 'text-gray-500' : ''}`}>
                    {notice.title}
                  </h4>
                  <span className="text-xs font-semibold text-gray-400">
                    {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notice.read ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {notice.message}
                </p>
              </div>
              {!notice.read && (
                <button
                  onClick={() => markAsRead(notice.id)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors tooltip"
                  title="Mark as read"
                >
                  <Check size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
