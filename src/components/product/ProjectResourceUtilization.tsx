import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faChartColumn, faClock, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { campaign, estimateTotals } from "../../data/cocaColaCampaign";

const weeklyHours = [
  { actual: 6, planned: 10, week: "03 Jun" },
  { actual: 14, planned: 16, week: "10 Jun" },
  { actual: 24, planned: 22, week: "17 Jun" },
  { actual: 19, planned: 24, week: "24 Jun" },
  { actual: 17, planned: 20, week: "01 Jul" },
  { actual: 11, planned: 16, week: "08 Jul" },
];

const roleHours = [
  { actual: 25, label: "Creative", planned: 28 },
  { actual: 48, label: "Designer", planned: 56 },
  { actual: 18, label: "Editor", planned: 24 },
];

const departmentHours = [
  { actual: 25, label: "Creative", planned: 28 },
  { actual: 48, label: "Design", planned: 56 },
  { actual: 18, label: "Video", planned: 24 },
  { actual: 0, label: "Client Services", planned: 0 },
];

const formatHours = (value: number) => `${value}h`;

function total(rows: Array<{ actual: number; planned: number }>, key: "actual" | "planned") {
  return rows.reduce((sum, row) => sum + row[key], 0);
}

function pct(value: number, max: number) {
  return max === 0 ? 0 : Math.max(4, Math.round((value / max) * 100));
}

function barStyle(value: number, max: number, index: number) {
  return {
    "--bar-delay": `${index * 80 + 120}ms`,
    "--bar-height": `${pct(value, max)}%`,
  } as CSSProperties;
}

function CompactComparisonBars({
  max,
  rows,
}: {
  max: number;
  rows: Array<{ actual: number; label: string; planned: number }>;
}) {
  return (
    <div className="utilization-compare-list">
      {rows.map((row) => (
        <article key={row.label}>
          <header>
            <strong>{row.label}</strong>
            <small>{formatHours(row.planned)} contracted / {formatHours(row.actual)} consumed</small>
          </header>
          <div className="utilization-comparison-track">
            <span className="planned" style={{ width: `${pct(row.planned, max)}%` }} />
            <span className="actual" style={{ width: `${pct(row.actual, max)}%` }} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProjectResourceUtilization() {
  const plannedTotal = estimateTotals.hours;
  const finalActualTotal = total(weeklyHours, "actual");

  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const animatedWeeklyHours = weeklyHours.map((row) => ({
    ...row,
    actual: Math.round(row.actual * progress),
  }));
  const animatedRoleHours = roleHours.map((row) => ({
    ...row,
    actual: Math.round(row.actual * progress),
  }));
  const animatedDepartmentHours = departmentHours.map((row) => ({
    ...row,
    actual: Math.round(row.actual * progress),
  }));

  const actualTotal = Math.round(finalActualTotal * progress);
  const utilization = Math.round((actualTotal / plannedTotal) * 100);
  const variance = actualTotal - plannedTotal;
  const weekMax = Math.max(...weeklyHours.flatMap((row) => [row.planned, row.actual]));
  const roleMax = Math.max(...roleHours.flatMap((row) => [row.planned, row.actual]));
  const departmentMax = Math.max(...departmentHours.flatMap((row) => [row.planned, row.actual]));

  return (
    <div className="project-utilization" data-tour-anchor="project-resource-utilization-view">
      <section className="utilization-summary">
        <article>
          <FontAwesomeIcon icon={faClock} />
          <small>Project contracted hours</small>
          <strong>{formatHours(plannedTotal)}</strong>
        </article>
        <article>
          <FontAwesomeIcon icon={faChartColumn} />
          <small>Project consumed hours</small>
          <strong>{formatHours(actualTotal)}</strong>
        </article>
        <article>
          <FontAwesomeIcon icon={faBriefcase} />
          <small>Utilization %</small>
          <strong>{utilization}%</strong>
        </article>
        <article className={`utilization-remaining ${variance <= 0 ? "is-positive" : "is-negative"}`}>
          <FontAwesomeIcon icon={faUsers} />
          <small>Hours remaining</small>
          <strong>{formatHours(Math.abs(variance))}</strong>
        </article>
      </section>

      <section className="utilization-chart-card utilization-monthly-card">
        <header>
          <div>
            <strong>Weekly hours distribution</strong>
            <small>{campaign.campaign} contracted hours vs consumed time by week</small>
          </div>
          <div className="utilization-legend">
            <span><i className="planned" /> Contracted</span>
            <span><i className="actual" /> Consumed</span>
          </div>
        </header>
        <div className="utilization-month-chart">
          {animatedWeeklyHours.map((row, index) => (
            <article key={row.week} style={{ "--bar-delay": `${index * 80 + 120}ms` } as CSSProperties}>
              <div className="utilization-month-bars">
                <span className="planned" style={barStyle(row.planned, weekMax, index)}><em>{row.planned}</em></span>
                <span className="actual" style={barStyle(row.actual, weekMax, index)}><em>{row.actual}</em></span>
              </div>
              <small>{row.week}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="utilization-secondary-grid">
        <div className="utilization-chart-card">
          <header>
            <div>
              <strong>Utilization by role</strong>
              <small>Contracted hours compared to consumed time</small>
            </div>
          </header>
          <CompactComparisonBars max={roleMax} rows={animatedRoleHours} />
        </div>
        <div className="utilization-chart-card">
          <header>
            <div>
              <strong>Utilization by department</strong>
              <small>Where project hours are being consumed</small>
            </div>
          </header>
          <CompactComparisonBars max={departmentMax} rows={animatedDepartmentHours} />
        </div>
      </section>
    </div>
  );
}
