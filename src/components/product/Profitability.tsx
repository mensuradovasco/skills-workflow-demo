import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faCircleCheck, faCoins, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { DocumentFrame } from "./DocumentFrame";

const bars = [82, 64, 52, 48, 39, 22, 18, 16];
const rows = [
  ["Creative territory", "Creative", "GBP 18,400", "42%", "Approved"],
  ["15s motion cutdowns", "Audiovisual", "GBP 14,900", "36%", "In progress"],
  ["Retail poster system", "Design", "GBP 21,700", "44%", "Approved"],
  ["OOH artwork adaptation", "Production", "GBP 9,800", "31%", "To approve"],
];

export function Profitability() {
  return (
    <DocumentFrame
      activeTab="PROFITABILITY"
      accent="#57c69a"
      icon={faChartLine}
      tabs={["FEED", "INFO", "BILLS", "PLANNED COSTS", "PROFITABILITY", "AUDIT"]}
      title="Profitability"
    >
      <div className="profitability-document">
        <section className="profit-hero">
          <article>
            <FontAwesomeIcon icon={faCoins} />
            <small>Revenue forecast</small>
            <strong>GBP 94.7k</strong>
          </article>
          <article>
            <FontAwesomeIcon icon={faChartLine} />
            <small>Gross margin</small>
            <strong>41%</strong>
          </article>
          <article>
            <FontAwesomeIcon icon={faFileInvoiceDollar} />
            <small>Billing remaining</small>
            <strong>GBP 31.2k</strong>
          </article>
        </section>
        <section className="profit-charts">
          <div className="profit-bars">
            <header>
              <strong>Margin planned and remaining</strong>
              <small>Balance by company</small>
            </header>
            <div>
              {bars.map((height, index) => (
                <span style={{ height: `${height}%` }} key={`${height}-${index}`} />
              ))}
            </div>
          </div>
          <div className="profit-line">
            <header>
              <strong>Performance by month</strong>
              <small>Plan, actual and forecast</small>
            </header>
            <svg viewBox="0 0 420 160" role="img" aria-label="Profitability line chart">
              <polyline points="0,118 70,82 140,108 210,54 280,78 350,68 420,36" />
              <polyline points="0,102 70,96 140,126 210,92 280,88 350,76 420,104" />
              <polyline points="0,118 70,42 140,82 210,128 280,132 350,136 420,44" />
            </svg>
          </div>
        </section>
        <div className="profit-table">
          <div className="profit-table-head">
            <span>Area</span>
            <span>Department</span>
            <span>Revenue</span>
            <span>Margin</span>
            <span>Stage</span>
          </div>
          {rows.map(([area, department, revenue, margin, stage]) => (
            <div className="profit-table-row" key={area}>
              <strong>{area}</strong>
              <span>{department}</span>
              <span>{revenue}</span>
              <span>{margin}</span>
              <span><FontAwesomeIcon icon={faCircleCheck} /> {stage}</span>
            </div>
          ))}
        </div>
      </div>
    </DocumentFrame>
  );
}
