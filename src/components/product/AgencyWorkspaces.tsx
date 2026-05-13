import {
  faCalculator,
  faChartPie,
  faClipboardList,
  faFolderOpen,
  faListCheck,
  faPeopleArrows,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ListTable, type ListColumn } from "./DocumentFrame";
import { WorkspaceFrame } from "./WorkspaceFrame";
import { DSAnalyticsCard, DSPieChart } from "./DesignSystem";
import { campaign } from "../../data/cocaColaCampaign";

export function JobsWorkspace() {
  return (
    <WorkspaceFrame
      accent="#f0c94e"
      icon={faListCheck}
      subtitle="All"
      tabs={[]}
      title="Jobs"
    >
      <WorkspaceFilterRow filterLabel="Working region" />
      <WorkspaceSimpleCards cards={jobsSimpleCards} />
      <ListTable groups={agencyJobGroups} />
    </WorkspaceFrame>
  );
}

export function RequestsWorkspace() {
  return (
    <WorkspaceFrame
      accent="#5b8ed6"
      icon={faClipboardList}
      subtitle="All"
      tabs={[]}
      title="Requests"
    >
      <WorkspaceFilterRow filterLabel="Source" />
      <WorkspaceSimpleCards cards={requestsSimpleCards} />
      <ListTable groups={requestGroups} />
    </WorkspaceFrame>
  );
}

export function ProjectsWorkspace() {
  const columns: Array<{ cards: string[]; title: string }> = [
    { title: "New", cards: ["Creative Brief", "Delivery List"] },
    { title: "In progress", cards: [campaign.campaign, "Landing Page", "15s Video"] },
    { title: "Client review", cards: ["3D Digital Banner", "Final Approval"] },
    { title: "Delivered", cards: ["Estimate / Budget"] },
  ];

  return (
    <WorkspaceFrame
      accent="#bdb2f4"
      icon={faFolderOpen}
      subtitle="All"
      tabs={[]}
      title="Projects"
    >
      <WorkspaceFilterRow filterLabel="Stage" />
      <div className="workspace-kanban">
        {columns.map(({ title, cards }, index) => (
          <section className="workspace-kanban-column" key={title}>
            <header>
              <span className={`workspace-dot dot-${index}`} />
              <strong>{title}</strong>
              <small>{cards.length}</small>
            </header>
            {cards.map((card, cardIndex) => (
              <article className="workspace-project-card" key={card}>
                <img src={workspaceImages[(index + cardIndex) % workspaceImages.length]} alt="" />
                <div>
                  <strong>{card}</strong>
                  <small>{projectClientFor(card)}</small>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>
    </WorkspaceFrame>
  );
}

export function TasksWorkspace() {
  return (
    <WorkspaceFrame
      accent="#a7a16f"
      icon={faListCheck}
      subtitle="All"
      tabs={[]}
      title="Tasks"
    >
      <WorkspaceFilterRow filterLabel="Owner" />
      <WorkspaceSimpleCards cards={tasksSimpleCards} />
      <ListTable groups={taskGroups} />
    </WorkspaceFrame>
  );
}

export function BudgetWorkspace() {
  return (
    <WorkspaceFrame
      accent="#9b877e"
      icon={faCalculator}
      subtitle="All"
      tabs={[]}
      title="Budgets"
    >
      <WorkspaceFilterRow filterLabel="Client" />
      <WorkspaceSimpleCards cards={budgetSimpleCards} />
      <ListTable groups={estimateGroups} />
    </WorkspaceFrame>
  );
}

export function ResourceMetricsWorkspace() {
  return (
    <WorkspaceFrame
      accent="#63c7c0"
      icon={faPeopleArrows}
      subtitle="All"
      tabs={[]}
      title="Resource metrics"
    >
      <WorkspaceFilterRow filterLabel="Department" />
      <WorkspaceSimpleCards cards={resourcesSimpleCards} />
      <ListTable groups={resourceGroups} />
    </WorkspaceFrame>
  );
}

export function AgencyProfitabilityWorkspace() {
  const [rows, setRows] = useState<ProfitRow[]>(initialProfitRows);
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: "2026-01-01", to: "2026-09-30" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const flashClearRef = useRef<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: number;
    const billNext = () => {
      setRows((current) => {
        const billableIndex = current.findIndex((row) => row.stage === "To be billed");
        if (billableIndex === -1) return current;
        const target = current[billableIndex];
        setFlashingId(target.id);
        if (flashClearRef.current) window.clearTimeout(flashClearRef.current);
        flashClearRef.current = window.setTimeout(() => setFlashingId(null), 900);
        return current.map((row, index) => {
          if (index !== billableIndex) return row;
          return {
            ...row,
            stage: "Billed",
            billed: row.income,
            toBill: 0,
            billedPct: 100,
            flashKey: (row.flashKey ?? 0) + 1,
          };
        });
      });
      timer = window.setTimeout(billNext, 1100);
    };
    timer = window.setTimeout(billNext, 600);
    return () => {
      window.clearTimeout(timer);
      if (flashClearRef.current) window.clearTimeout(flashClearRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isDatePickerOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setIsDatePickerOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isDatePickerOpen]);

  const filteredRows = useMemo(
    () => rows.filter((row) => row.billingDate >= dateRange.from && row.billingDate <= dateRange.to),
    [dateRange.from, dateRange.to, rows],
  );
  const groups = useMemo(() => [{ label: "", rows: filteredRows }], [filteredRows]);
  const totals = useMemo(() => {
    const income = filteredRows.reduce((sum, row) => sum + row.income, 0);
    const cost = filteredRows.reduce((sum, row) => sum + row.cost, 0);
    const billed = filteredRows.reduce((sum, row) => sum + row.billed, 0);
    const margin = income > 0 ? Math.round(((income - cost) / income) * 100) : 0;
    return { billed, income, margin };
  }, [filteredRows]);

  const profitCards = useMemo<ProfitabilityAnalyticsCard[]>(() => [
    {
      metricLabel: "Total margin",
      kpiValue: <TweenNumber value={totals.margin} format={(value) => `${Math.round(value)}%`} />,
      delta: "+8.5%",
      sectionLabel: "Margin by client",
      bars: [85, 69, 53, 40],
      baseBars: [30, 26, 19, 14],
      images: [clientAssets.cocaCola, clientAssets.samsung, clientAssets.loreal, clientAssets.hp],
      labels: ["Coca-Cola", "Samsung", "L'Oreal", "HP"],
      yAxis: ["45%", "30%", "15%", "0%"],
    },
    {
      metricLabel: "Total revenue",
      kpiValue: <TweenNumber value={totals.income} format={formatCompactEuro} />,
      delta: "+12.4%",
      sectionLabel: "Revenue by department",
      bars: [93, 69, 55, 36],
      baseBars: [33, 25, 22, 11],
      labels: ["Creative", "Design", "Video", "Strategy"],
      yAxis: ["€450k", "€300k", "€150k", "€0"],
    },
    {
      metricLabel: "Total billing",
      kpiValue: <TweenNumber value={totals.billed} format={formatCompactEuro} />,
      delta: "+18.2%",
      sectionLabel: "Billing forecast · next 4 months",
      bars: [62, 72, 76, 76],
      baseBars: [24, 28, 30, 30],
      labels: ["Aug", "Sep", "Oct", "Nov"],
      yAxis: ["€450k", "€300k", "€150k", "€0"],
    },
  ], [totals]);

  return (
    <WorkspaceFrame
      accent="#57c69a"
      icon={faChartPie}
      subtitle="All"
      tabs={[]}
      title="Profitability"
    >
      <div className="workspace-profitability">
        <div className="profitability-date-filter" aria-label="Profitability date filter" ref={pickerRef}>
          <span>Period</span>
          <div className="profitability-date-picker-control">
            <button
              className="profitability-date-trigger"
              type="button"
              aria-expanded={isDatePickerOpen}
              onClick={() => setIsDatePickerOpen((open) => !open)}
            >
              {formatDateRangeLabel(dateRange.from, dateRange.to)}
            </button>
            {isDatePickerOpen && (
              <div className="profitability-date-popover">
                <div className="profitability-date-popover-head">
                  <strong>Date range</strong>
                  <small>Filter profitability totals</small>
                </div>
                <div className="profitability-date-fields">
                  <label>
                    <span>From</span>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(event) => setDateRange((current) => ({ ...current, from: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span>To</span>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(event) => setDateRange((current) => ({ ...current, to: event.target.value }))}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="profitability-date-presets" aria-label="Quick date ranges">
            <button type="button" onClick={() => setDateRange({ from: "2026-01-01", to: "2026-09-30" })}>All</button>
            <button type="button" onClick={() => setDateRange({ from: "2026-01-01", to: "2026-03-31" })}>Q1</button>
            <button type="button" onClick={() => setDateRange({ from: "2026-04-01", to: "2026-06-30" })}>Q2</button>
            <button type="button" onClick={() => setDateRange({ from: "2026-07-01", to: "2026-09-30" })}>Q3</button>
          </div>
        </div>
        <ProfitabilityAnalyticsCards cards={profitCards} />
        <ListTable
          columns={profitColumns}
          groups={groups}
          rowKey={(row) => row.id}
          rowClassName={(row) => (row.id === flashingId ? "row-billed-flash" : undefined)}
        />
      </div>
    </WorkspaceFrame>
  );
}

type WorkspaceAnalyticsPieSlice = { color: string; label: string; value: number };

type WorkspaceAnalyticsCard = {
  bars?: number[];
  baseBars?: number[];
  delta?: string;
  images?: string[];
  kpiValue: ReactNode;
  labels?: string[];
  metricLabel: string;
  pieSlices?: WorkspaceAnalyticsPieSlice[];
  sectionLabel: string;
  yAxis?: string[];
};

type ProfitabilityAnalyticsCard = WorkspaceAnalyticsCard;

function WorkspaceAnalyticsCards({ cards }: { cards: WorkspaceAnalyticsCard[] }) {
  return (
    <section className="profit-card2-row">
      {cards.map(({ bars, baseBars, delta, images, kpiValue, labels, metricLabel, pieSlices, sectionLabel, yAxis }) => (
        <article className="profit-card2" key={metricLabel}>
          <div className="profit-card2-copy">
            <div className="profit-card2-top">
              <span>{metricLabel}</span>
              {delta && <b>↗ {delta}</b>}
            </div>
            <strong>{kpiValue}</strong>
            <small>{sectionLabel}</small>
          </div>
          {pieSlices ? (
            <DSPieChart title="" slices={pieSlices} />
          ) : (
            <div className="mini-bar-chart">
              {yAxis && (
                <ul className="mini-bar-yaxis" aria-hidden="true">
                  {yAxis.map((label) => (
                    <li key={label} data-label={label} />
                  ))}
                </ul>
              )}
              {(bars ?? []).map((height, index) => {
                const baseHeight = baseBars?.[index];
                const baseRatio = baseHeight !== undefined && height > 0
                  ? Math.min(100, Math.max(0, (baseHeight / height) * 100))
                  : null;
                const style = { "--bar-height": `${height}%` } as CSSProperties;
                if (baseRatio !== null) {
                  (style as CSSProperties & Record<string, string>)["--bar-base-pct"] = `${baseRatio}%`;
                }

                return (
                  <div className="mini-bar-item" key={`${metricLabel}-${index}`}>
                    <span style={style} />
                    {images?.[index] ? (
                      <img src={images[index]} alt={labels?.[index] ?? ""} />
                    ) : (
                      <small>{labels?.[index] ?? index + 1}</small>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </article>
      ))}
    </section>
  );
}

type WorkspaceBarCard = {
  kind: "bar";
  title: string;
  bars: number[];
  labels: string[];
  yAxis: string[];
};

type WorkspacePieCard = {
  kind: "pie";
  title: string;
  slices: WorkspaceAnalyticsPieSlice[];
  valueFormat?: "percent" | "euro";
};

type WorkspaceSimpleCard = WorkspaceBarCard | WorkspacePieCard;

function WorkspaceSimpleCards({ cards }: { cards: WorkspaceSimpleCard[] }) {
  return (
    <section className="workspace-chart-row">
      {cards.map((card) =>
        card.kind === "pie" ? (
          <DSPieChart key={card.title} title={card.title} slices={card.slices} valueFormat={card.valueFormat} />
        ) : (
          <DSAnalyticsCard key={card.title} title={card.title} bars={card.bars} labels={card.labels} yAxis={card.yAxis} />
        ),
      )}
    </section>
  );
}

const ProfitabilityAnalyticsCards = WorkspaceAnalyticsCards;

function formatCompactEuro(value: number) {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(2)}m`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${Math.round(value)}`;
}

function formatDateRangeLabel(from: string, to: string) {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const sameYear = fromDate.getFullYear() === toDate.getFullYear();
  const shortFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const longFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (sameYear) return `${shortFormatter.format(fromDate)} - ${shortFormatter.format(toDate)}, ${toDate.getFullYear()}`;
  return `${longFormatter.format(fromDate)} - ${longFormatter.format(toDate)}`;
}

function WorkspaceFilterRow({ filterLabel }: { filterLabel: string }) {
  const [dateRange, setDateRange] = useState({ from: "2026-01-01", to: "2026-09-30" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDatePickerOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setIsDatePickerOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isDatePickerOpen]);

  return (
    <div className="workspace-filter-row">
      <div className="profitability-date-filter" aria-label="Date filter" ref={pickerRef}>
        <span>Period</span>
        <div className="profitability-date-picker-control">
          <button
            className="profitability-date-trigger"
            type="button"
            aria-expanded={isDatePickerOpen}
            onClick={() => setIsDatePickerOpen((open) => !open)}
          >
            {formatDateRangeLabel(dateRange.from, dateRange.to)}
          </button>
          {isDatePickerOpen && (
            <div className="profitability-date-popover">
              <div className="profitability-date-popover-head">
                <strong>Date range</strong>
                <small>Filter list by date</small>
              </div>
              <div className="profitability-date-fields">
                <label>
                  <span>From</span>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(event) => setDateRange((current) => ({ ...current, from: event.target.value }))}
                  />
                </label>
                <label>
                  <span>To</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(event) => setDateRange((current) => ({ ...current, to: event.target.value }))}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
        <div className="profitability-date-presets" aria-label="Quick date ranges">
          <button type="button" onClick={() => setDateRange({ from: "2026-01-01", to: "2026-09-30" })}>All</button>
          <button type="button" onClick={() => setDateRange({ from: "2026-01-01", to: "2026-03-31" })}>Q1</button>
          <button type="button" onClick={() => setDateRange({ from: "2026-04-01", to: "2026-06-30" })}>Q2</button>
          <button type="button" onClick={() => setDateRange({ from: "2026-07-01", to: "2026-09-30" })}>Q3</button>
        </div>
      </div>
      <label>
        <span>{filterLabel}</span>
        <input placeholder="All" />
      </label>
    </div>
  );
}

const workspaceImages = [
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=420&q=80",
];

const clientAssets = {
  cocaCola: "/assets/client-logos/coca-cola.svg",
  hp: "/assets/client-logos/hp.svg",
  loreal: "/assets/client-logos/loreal.svg",
  nike: "/assets/client-logos/nike.svg",
  samsung: "/assets/client-logos/samsung.svg",
};

const projectAssets = {
  billboard: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=120&q=80",
  launch: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=120&q=80",
  motion: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=120&q=80",
  retail: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=120&q=80",
};

function projectClientFor(card: string) {
  if (card.includes("Launch")) return "L'Oreal";
  if (card.includes("Billboard")) return "Samsung";
  return campaign.client;
}

const COUNT_AXIS = ["100", "75", "50", "0"];
const PERCENT_AXIS = ["100%", "75%", "50%", "0%"];
const EURO_AXIS = ["€600k", "€400k", "€200k", "€0"];

const jobsSimpleCards: WorkspaceSimpleCard[] = [
  { kind: "bar", title: "Jobs by region", bars: [32, 48, 72, 58, 86], labels: ["EU", "UK", "BR", "US", "MEA"], yAxis: COUNT_AXIS },
  {
    kind: "pie",
    title: "Jobs by department",
    slices: [
      { label: "Creative", value: 38, color: "#9D87E0" },
      { label: "Design", value: 27, color: "#5DBE8A" },
      { label: "Video", value: 21, color: "#F1C338" },
      { label: "Strategy", value: 14, color: "#4FC3E5" },
    ],
  },
  { kind: "bar", title: "Jobs per client", bars: [92, 66, 54, 39, 28], labels: ["Coca-Cola", "Samsung", "Nike", "L'Oreal", "HP"], yAxis: COUNT_AXIS },
];

const requestsSimpleCards: WorkspaceSimpleCard[] = [
  { kind: "bar", title: "Requests by source", bars: [64, 42, 26, 18, 12], labels: ["Email", "Form", "Slack", "Phone", "Other"], yAxis: COUNT_AXIS },
  { kind: "bar", title: "Requests by qualification stage", bars: [82, 55, 38, 21, 14], labels: ["New", "Triage", "Quote", "Sent", "Won"], yAxis: COUNT_AXIS },
  {
    kind: "pie",
    title: "Requests by client tier",
    slices: [
      { label: "Strategic", value: 42, color: "#5b8ed6" },
      { label: "Growth", value: 28, color: "#F1C338" },
      { label: "New", value: 18, color: "#5DBE8A" },
      { label: "Pilot", value: 12, color: "#B14E5C" },
    ],
  },
];

const tasksSimpleCards: WorkspaceSimpleCard[] = [
  { kind: "bar", title: "Tasks by workflow stage", bars: [48, 76, 54, 31, 17], labels: ["To do", "In progress", "Review", "Blocked", "Done"], yAxis: COUNT_AXIS },
  {
    kind: "pie",
    title: "Tasks by department",
    slices: [
      { label: "Creative", value: 34, color: "#9D87E0" },
      { label: "Design", value: 28, color: "#5DBE8A" },
      { label: "Video", value: 18, color: "#F1C338" },
      { label: "Strategy", value: 12, color: "#4FC3E5" },
      { label: "Account", value: 8, color: "#B14E5C" },
    ],
  },
  { kind: "bar", title: "Tasks due this week", bars: [22, 34, 58, 44, 26, 18, 12], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], yAxis: COUNT_AXIS },
];

const budgetSimpleCards: WorkspaceSimpleCard[] = [
  { kind: "bar", title: "Estimates by approval stage", bars: [34, 58, 74, 22, 16], labels: ["Draft", "Sent", "Won", "Lost", "Hold"], yAxis: COUNT_AXIS },
  { kind: "bar", title: "Estimate value by department", bars: [82, 61, 44, 39, 28, 19], labels: ["Creative", "Design", "Video", "Strategy", "Account", "Other"], yAxis: EURO_AXIS },
  { kind: "bar", title: "Estimates per client", bars: [76, 48, 31, 24, 12], labels: ["Coca-Cola", "Samsung", "Nike", "L'Oreal", "HP"], yAxis: EURO_AXIS },
];

const resourcesSimpleCards: WorkspaceSimpleCard[] = [
  { kind: "bar", title: "Capacity by department", bars: [78, 62, 49, 35, 22], labels: ["Creative", "Design", "Video", "Strategy", "Account"], yAxis: PERCENT_AXIS },
  { kind: "bar", title: "Booked hours by skill", bars: [86, 73, 58, 42, 33, 18], labels: ["Photoshop", "After FX", "Figma", "Illustrator", "Premiere", "Maya"], yAxis: PERCENT_AXIS },
  {
    kind: "pie",
    title: "Department mix",
    slices: [
      { label: "Creative", value: 34, color: "#9D87E0" },
      { label: "Design", value: 26, color: "#5DBE8A" },
      { label: "Video", value: 22, color: "#F1C338" },
      { label: "Strategy", value: 12, color: "#4FC3E5" },
      { label: "Account", value: 6, color: "#B14E5C" },
    ],
  },
];

const agencyJobGroups = [
  {
    label: "To approve (4)",
    tone: "red",
    rows: [
      { title: "Estimate / Budget approval", image: clientAssets.cocaCola, type: "Job", company: "Coca-Cola", department: "Account", classification: "€15,000", date: "04 Jun 2026 12", priority: "High" as const },
      { title: "Client Request / Brief review", image: clientAssets.cocaCola, type: "Job", company: "Coca-Cola", department: "Creative", classification: campaign.campaign, date: "06 Jun 2026 15", priority: "Medium" as const },
    ],
  },
  {
    label: "In progress (8)",
    tone: "blue",
    rows: [
      { title: "Landing Page", image: projectAssets.retail, type: "Deliverable", company: "Coca-Cola", department: "Design", classification: "Website", date: "18 Jun 2026 18", priority: "High" as const },
      { title: "15s Video", image: projectAssets.motion, type: "Deliverable", company: "Coca-Cola", department: "Video", classification: "Video", date: "20 Jun 2026 18", priority: "High" as const },
      { title: "3D Digital Banner", image: projectAssets.billboard, type: "Deliverable", company: "Coca-Cola", department: "Design", classification: "3D Banner", date: "21 Jun 2026 18", priority: "Medium" as const },
      { title: "New Launch", image: clientAssets.loreal, type: "Job", company: "L'Oreal", department: "Strategy", classification: "Product launch", date: "22 Jun 2026 18", priority: "Low" as const },
    ],
  },
];

const requestGroups = [
  {
    label: "New requests (3)",
    tone: "blue",
    rows: [
      { title: "Create key assets for a summer campaign", image: clientAssets.cocaCola, type: "Request", company: "Coca-Cola", department: "Client Services", classification: campaign.campaign, date: "03 Jun 2026 10", priority: "High" as const },
      { title: "Digital launch estimate", image: clientAssets.loreal, type: "Request", company: "L'Oreal", department: "Account", classification: "Product launch", date: "05 Jun 2026 11", priority: "Medium" as const },
    ],
  },
];

const estimateGroups = [
  {
    label: "Awaiting approval (3)",
    tone: "red",
    rows: [
      { title: "Coca-Cola Summer Assets Estimate", image: clientAssets.cocaCola, type: "Estimate", company: "Coca-Cola", department: "Account", classification: "€15,000", date: "04 Jun 2026 12", priority: "High" as const },
      { title: "New Launch Digital Estimate", image: clientAssets.loreal, type: "Estimate", company: "L'Oreal", department: "Strategy", classification: "€42.5k", date: "06 Jun 2026 11", priority: "Medium" as const },
    ],
  },
  {
    label: "Approved (5)",
    tone: "green",
    rows: [
      { title: "3D Billboard Production", image: clientAssets.samsung, type: "Estimate", company: "Samsung", department: "Production", classification: "€31.0k", date: "12 Jun 2026 18", priority: "Medium" as const },
      { title: "Website Landing Page", image: projectAssets.retail, type: "Deliverable", company: "Coca-Cola", department: "Design", classification: "Approved scope", date: "18 Jun 2026 18", priority: "Low" as const },
      { title: "15s Video", image: projectAssets.motion, type: "Deliverable", company: "Coca-Cola", department: "Video", classification: "Approved scope", date: "20 Jun 2026 18", priority: "Medium" as const },
    ],
  },
];

const resourceGroups = [
  {
    label: "Deliverable allocation (3)",
    tone: "blue",
    rows: [
      { title: "Landing Page", image: projectAssets.retail, type: "Deliverable", company: "Coca-Cola", department: "Design", classification: "Arthur / 9 days", date: "18 Jun 2026 18", priority: "High" as const },
      { title: "15s Video", image: projectAssets.motion, type: "Deliverable", company: "Coca-Cola", department: "Video", classification: "Daniel / 4 days", date: "20 Jun 2026 18", priority: "Medium" as const },
      { title: "3D Digital Banner", image: projectAssets.billboard, type: "Deliverable", company: "Coca-Cola", department: "Design", classification: "Arthur / 3 days", date: "21 Jun 2026 18", priority: "Medium" as const },
    ],
  },
  {
    label: "Over capacity (2)",
    tone: "red",
    rows: [
      { title: "Arthur Mendes", image: campaign.team[1].avatar, type: "Designer", company: "Internal", department: "Design", classification: "112% booked", date: "This week", priority: "High" as const },
      { title: "Rachel Green", image: campaign.team[0].avatar, type: "Producer", company: "Internal", department: "Client Services", classification: "104% booked", date: "This week", priority: "Medium" as const },
    ],
  },
  {
    label: "Available (4)",
    tone: "green",
    rows: [
      { title: "Daniel Brooks", image: campaign.team[2].avatar, type: "Editor", company: "Internal", department: "Video", classification: "68% booked", date: "This week", priority: "Low" as const },
    ],
  },
];

type ProfitStage = "New" | "To be billed" | "Billed";
type ProfitCurrency = "USD" | "BRL" | "EUR";

type ProfitRow = {
  id: string;
  billingDate: string;
  client: string;
  clientLogo: string;
  project: string;
  responsibleName: string;
  responsibleAvatar: string;
  stage: ProfitStage;
  currency: ProfitCurrency;
  income: number;
  cost: number;
  marginPct: number;
  billedPct: number;
  billed: number;
  toBill: number;
  flashKey?: number;
};

const stageTone: Record<ProfitStage, string> = {
  "New": "blue",
  "To be billed": "amber",
  "Billed": "green",
};

const formatMoney = (value: number) => Math.round(value).toLocaleString("en-US");
const formatPct = (value: number) => `${Math.round(value)}%`;

const marginTone = (value: number) => (value >= 30 ? "green" : value >= 15 ? "amber" : "red");
const billedTone = (value: number) => (value >= 60 ? "green" : value >= 25 ? "amber" : "red");

function TweenNumber({ value, format, duration = 720 }: { value: number; format: (n: number) => string; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (value === fromRef.current) return;
    const start = performance.now();
    const from = fromRef.current;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) raf = window.requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = window.requestAnimationFrame(tick);

    const el = elRef.current;
    if (el) {
      el.classList.remove("tween-flash");
      void el.offsetWidth;
      el.classList.add("tween-flash");
    }

    return () => window.cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span ref={elRef} className="tween-cell">{format(display)}</span>;
}

const profitColumns: ListColumn<ProfitRow>[] = [
  {
    key: "client",
    label: "Client",
    cellClassName: "doc-title-cell",
    width: "minmax(110px, 0.8fr)",
    render: (row) => (
      <>
        <img src={row.clientLogo} alt="" />
        <strong>{row.client}</strong>
      </>
    ),
  },
  { key: "project", label: "Project", width: "minmax(150px, 1.1fr)", render: (row) => row.project },
  {
    key: "responsible",
    label: "Responsible",
    width: "minmax(140px, 0.85fr)",
    cellClassName: "responsible-cell",
    render: (row) => (
      <>
        <img src={row.responsibleAvatar} alt="" />
        <span>{row.responsibleName}</span>
      </>
    ),
  },
  {
    key: "stage",
    label: "Stage",
    width: "minmax(110px, 0.6fr)",
    render: (row) => (
      <span className={`stage-tag tone-${stageTone[row.stage]}`}>
        <i />
        {row.stage}
      </span>
    ),
  },
  {
    key: "currency",
    label: "Currency",
    width: "minmax(64px, 0.36fr)",
    render: (row) => <span className="currency-tag">{row.currency}</span>,
  },
  { key: "income", label: "Income", align: "right", width: "minmax(82px, 0.5fr)", render: (row) => formatMoney(row.income) },
  { key: "cost", label: "Cost", align: "right", width: "minmax(74px, 0.45fr)", render: (row) => formatMoney(row.cost) },
  {
    key: "margin",
    label: "Margin %",
    align: "right",
    width: "minmax(78px, 0.45fr)",
    render: (row) => <span className={`pct tone-${marginTone(row.marginPct)}`}>{row.marginPct}%</span>,
  },
  {
    key: "billedPct",
    label: "Billed %",
    align: "right",
    width: "minmax(78px, 0.45fr)",
    render: (row) => (
      <span className={`pct tone-${billedTone(row.billedPct)}`}>
        <TweenNumber value={row.billedPct} format={formatPct} />
      </span>
    ),
  },
  {
    key: "billed",
    label: "Billed",
    align: "right",
    width: "minmax(82px, 0.5fr)",
    render: (row) => <TweenNumber value={row.billed} format={formatMoney} />,
  },
  {
    key: "toBill",
    label: "To bill",
    align: "right",
    width: "minmax(86px, 0.55fr)",
    render: (row) => <TweenNumber value={row.toBill} format={formatMoney} />,
  },
];

const team = campaign.team;

const initialProfitRows: ProfitRow[] = [
  { id: "cc-summer", billingDate: "2026-01-16", client: "Coca-Cola", clientLogo: clientAssets.cocaCola, project: "Summer Campaign", responsibleName: team[0].name, responsibleAvatar: team[0].avatar, stage: "To be billed", currency: "USD", income: 391341, cost: 344381, marginPct: 12, billedPct: 51, billed: 200000, toBill: 191341 },
  { id: "loreal-launch", billingDate: "2026-01-08", client: "L'Oreal", clientLogo: clientAssets.loreal, project: "New Launch", responsibleName: team[3].name, responsibleAvatar: team[3].avatar, stage: "New", currency: "EUR", income: 276200, cost: 69050, marginPct: 75, billedPct: 54, billed: 150000, toBill: 126200 },
  { id: "hp-3d", billingDate: "2026-01-26", client: "HP", clientLogo: clientAssets.hp, project: "3D Production", responsibleName: team[1].name, responsibleAvatar: team[1].avatar, stage: "Billed", currency: "USD", income: 261000, cost: 146160, marginPct: 44, billedPct: 100, billed: 261000, toBill: 0 },
  { id: "samsung-digital", billingDate: "2026-02-05", client: "Samsung", clientLogo: clientAssets.samsung, project: "Digital Creative", responsibleName: team[2].name, responsibleAvatar: team[2].avatar, stage: "To be billed", currency: "BRL", income: 21256, cost: 15517, marginPct: 27, billedPct: 37, billed: 8000, toBill: 13256 },
  { id: "samsung-billboard", billingDate: "2026-04-18", client: "Samsung", clientLogo: clientAssets.samsung, project: "Billboard Production", responsibleName: team[1].name, responsibleAvatar: team[1].avatar, stage: "To be billed", currency: "BRL", income: 20047, cost: 9624, marginPct: 4, billedPct: 24, billed: 5000, toBill: 15047 },
  { id: "nike-retail", billingDate: "2026-05-26", client: "Nike", clientLogo: clientAssets.nike, project: "Retail Activation", responsibleName: team[4].name, responsibleAvatar: team[4].avatar, stage: "New", currency: "USD", income: 38200, cost: 12500, marginPct: 67, billedPct: 0, billed: 0, toBill: 38200 },
  { id: "cc-spring", billingDate: "2026-06-06", client: "Coca-Cola", clientLogo: clientAssets.cocaCola, project: "Spring Promo", responsibleName: team[3].name, responsibleAvatar: team[3].avatar, stage: "To be billed", currency: "USD", income: 84500, cost: 51200, marginPct: 39, billedPct: 25, billed: 21125, toBill: 63375 },
  { id: "loreal-q3", billingDate: "2026-07-15", client: "L'Oreal", clientLogo: clientAssets.loreal, project: "Q3 Digital", responsibleName: team[2].name, responsibleAvatar: team[2].avatar, stage: "New", currency: "EUR", income: 58000, cost: 32400, marginPct: 44, billedPct: 0, billed: 0, toBill: 58000 },
  { id: "hp-spring", billingDate: "2026-08-22", client: "HP", clientLogo: clientAssets.hp, project: "Spring Launch", responsibleName: team[0].name, responsibleAvatar: team[0].avatar, stage: "To be billed", currency: "BRL", income: 72500, cost: 39200, marginPct: 46, billedPct: 12, billed: 8700, toBill: 63800 },
  { id: "nike-holiday", billingDate: "2026-09-28", client: "Nike", clientLogo: clientAssets.nike, project: "Holiday Edit", responsibleName: team[1].name, responsibleAvatar: team[1].avatar, stage: "Billed", currency: "USD", income: 31400, cost: 18900, marginPct: 40, billedPct: 100, billed: 31400, toBill: 0 },
];

const taskGroups = [
  {
    label: "My tasks (5)",
    tone: "green",
    rows: [
      { title: "Design landing page", image: projectAssets.retail, type: "Task", company: "Coca-Cola", department: "Design", classification: "Website", date: "18 Jun 2026 18", priority: "High" as const },
      { title: "Edit 15s video", image: projectAssets.motion, type: "Task", company: "Coca-Cola", department: "Video", classification: "Video", date: "20 Jun 2026 18", priority: "Medium" as const },
      { title: "Final approval", image: clientAssets.cocaCola, type: "Task", company: "Coca-Cola", department: "Client Services", classification: "Delivery", date: "24 Jun 2026 15", priority: "None" as const },
    ],
  },
];
