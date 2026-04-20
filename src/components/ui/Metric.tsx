type MetricProps = {
  label: string;
  value: string;
  trend?: string;
};

export function Metric({ label, value, trend }: MetricProps) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {trend && <small>{trend}</small>}
    </div>
  );
}
