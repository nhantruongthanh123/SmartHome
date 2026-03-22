import Image from "next/image";

type StatCardProps = {
  label: string;
  value: string;
  unit: string;
  status: string;
  tone: "success" | "danger";
  location: string;
  iconSrc: string;
  iconVariant: "temperature" | "humidity" | "light";
};

export default function StatCard({
  label,
  value,
  unit,
  status,
  tone,
  location,
  iconSrc,
  iconVariant,
}: StatCardProps) {
  return (
    <article className="card stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon ${iconVariant}`}>
          <Image src={iconSrc} alt="" width={24} height={24} aria-hidden="true" />
        </span>
        <span className={`badge ${tone}`}>{status}</span>
      </div>

      <p className="stat-label"> Welcome to Smart Home </p>
      <p className="stat-value">
        {value}
        {unit}
      </p>
      <p className="stat-location">{location}</p>
    </article>
  );
}
