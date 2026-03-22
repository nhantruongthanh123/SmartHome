import StatCard from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  return (
    <section>
      <h2 className="page-title"> Welcome to Smart Home </h2>
      <p className="page-subtitle">Everything looks good in your home.</p>

      <div className="grid three">
        <StatCard
          label="Temperature"
          value="24"
          unit="°C"
          status="Normal"
          tone="success"
          location="Living Room"
          iconSrc="/icons/temperature.svg"
          iconVariant="temperature"
        />
        <StatCard
          label="Humidity"
          value="46"
          unit="%"
          status="Normal"
          tone="success"
          location="Optimal Range"
          iconSrc="/icons/humidity.svg"
          iconVariant="humidity"
        />
        <StatCard
          label="Light Intensity"
          value="680"
          unit="lux"
          status="Good"
          tone="success"
          location="Balcony Area"
          iconSrc="/icons/light.svg"
          iconVariant="light"
        />
      </div>
    </section>
  );
}
