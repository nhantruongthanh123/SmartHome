type StatCardProps = {
  label: string;
  value: string;
  unit: string;
  status: string;
  tone: "success" | "danger";
};

export default function StatCard({ label, value, unit, status, tone }: StatCardProps) {
  return (
    <article className="card">
      <span className={`badge ${tone}`}>{status}</span>
      <p className="stat-label">{label}</p>
      <p className="stat-value">
        {value}
        {unit}
      </p>
    </article>
  );
}
