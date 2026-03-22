import StatCard from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  return (
    <section>
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">Everything looks good in your home.</p>

      <div className="grid three">
        <StatCard label="Temperature" value="24" unit="°C" status="Normal" tone="success" />
        <StatCard label="Humidity" value="46" unit="%" status="Normal" tone="success" />
        <StatCard label="Light Intensity" value="680" unit="lux" status="Good" tone="success" />
      </div>
    </section>
  );
}
