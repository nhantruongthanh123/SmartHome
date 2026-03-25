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
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
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
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <div className="flex items-baseline gap-1 mt-1">
          <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
          <span className="text-slate-400 text-sm font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );
}
