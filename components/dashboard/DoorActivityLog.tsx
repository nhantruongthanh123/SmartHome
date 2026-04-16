"use client";
import React from "react";
import { DoorLog } from "@/src/types/door";
import { Clock, LogIn, LogOut, History } from "lucide-react";

interface DoorActivityLogProps {
  logs: DoorLog[];
}

export default function DoorActivityLog({ logs }: DoorActivityLogProps) {
  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card-surface p-6 rounded-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-box">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold card-title">Recent Door Activity</h3>
            <p className="text-sm card-muted">History of entry and security events</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-xs font-bold uppercase tracking-wider card-muted">Status</th>
              <th className="pb-3 text-xs font-bold uppercase tracking-wider card-muted text-center">Date</th>
              <th className="pb-3 text-xs font-bold uppercase tracking-wider card-muted text-center">Opened</th>
              <th className="pb-3 text-xs font-bold uppercase tracking-wider card-muted text-center">Closed</th>
              <th className="pb-3 text-xs font-bold uppercase tracking-wider card-muted text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center card-muted text-sm">
                  No recent activity recorded.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${log.closedAt ? "bg-green-500" : "bg-orange-500 animate-pulse"}`} />
                      <span className={`text-sm font-semibold ${log.closedAt ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                        {log.closedAt ? "COMPLETED" : "IN PROGRESS"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-sm card-title text-center font-medium">
                    {formatDate(log.openedAt)}
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-sm card-title font-mono">
                      <LogIn size={14} className="text-blue-500" />
                      {formatTime(log.openedAt)}
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-sm card-title font-mono">
                      {log.closedAt ? (
                        <>
                          <LogOut size={14} className="text-red-500" />
                          {formatTime(log.closedAt)}
                        </>
                      ) : (
                        <span className="text-xs italic card-muted">Waiting...</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 w-fit ml-auto">
                      <Clock size={14} />
                      {log.duration ? `${log.duration}s` : "--"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
