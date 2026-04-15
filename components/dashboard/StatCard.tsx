import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export default function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  color = "blue",
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  };

  return (
    <div className="card-surface p-6 rounded-3xl flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div
          className={`p-3 rounded-2xl ${colorClasses[color] || colorClasses.blue}`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${colorClasses[color]}`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="card-muted text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <div className="flex items-baseline gap-1 mt-1">
          <h4 className="card-title text-2xl font-bold">{value}</h4>
          <span className="card-muted text-sm font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );
}
