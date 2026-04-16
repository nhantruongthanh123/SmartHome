import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
  lastUpdated?: Date | null;
}

export default function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  color = "blue",
  lastUpdated,
}: StatCardProps) {
  const [timeAgo, setTimeAgo] = React.useState<string>("");

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  };

  React.useEffect(() => {
    const updateTime = () => {
      if (!lastUpdated) {
        setTimeAgo("No data");
        return;
      }

      const diffInSeconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
      
      if (diffInSeconds < 30) {
        setTimeAgo("Just now");
      } else if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds}s ago`);
      } else if (diffInSeconds < 3600) {
        setTimeAgo(`${Math.floor(diffInSeconds / 60)}m ago`);
      } else if (diffInSeconds < 86400) {
        setTimeAgo(`${Math.floor(diffInSeconds / 3600)}h ago`);
      } else {
        setTimeAgo(`${Math.floor(diffInSeconds / 86400)}d ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Cập nhật mỗi 10 giây
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="card-surface p-6 rounded-3xl flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div
          className={`p-3 rounded-2xl ${colorClasses[color] || colorClasses.blue}`}
        >
          {icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          {trend && (
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${colorClasses[color]}`}
            >
              {trend}
            </span>
          )}
          <span className="text-[10px] font-medium card-muted whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
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
