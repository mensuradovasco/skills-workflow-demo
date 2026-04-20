import {
  faCalculator,
  faChartPie,
  faClipboardList,
  faFolderOpen,
  faListCheck,
  faPeopleArrows,
} from "@fortawesome/free-solid-svg-icons";
import type { CSSProperties } from "react";
import { ListTable } from "./DocumentFrame";
import { WorkspaceFrame } from "./WorkspaceFrame";
import { campaign } from "../../data/cocaColaCampaign";

export function JobsWorkspace() {
  return (
    <WorkspaceFrame
      accent="#f0c94e"
      icon={faListCheck}
      subtitle="All"
      title="Jobs"
    >
      <WorkspaceListWithAnalytics charts={jobAnalytics} filterLabel="Working region" />
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
      tabs={["INBOX", "TO QUALIFY", "ESTIMATES", "APPROVALS"]}
      title="Requests"
    >
      <WorkspaceListWithAnalytics charts={requestAnalytics} filterLabel="Source" />
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
      tabs={["KANBAN", "LIST", "CALENDAR", "GANTT", "ARCHIVE"]}
      title="Projects"
    >
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
      tabs={["MY TASKS", "TEAM TASKS", "KANBAN", "CALENDAR"]}
      title="Tasks"
    >
      <WorkspaceListWithAnalytics charts={taskAnalytics} filterLabel="Owner" />
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
      tabs={["ESTIMATES", "APPROVALS", "BILLING", "TEMPLATES"]}
      title="Budgets"
    >
      <WorkspaceListWithAnalytics charts={estimateAnalytics} filterLabel="Client" />
      <ListTable groups={estimateGroups} />
    </WorkspaceFrame>
  );
}

export function ResourcesWorkspace() {
  return (
    <WorkspaceFrame
      accent="#63c7c0"
      icon={faPeopleArrows}
      subtitle="All"
      tabs={["ALLOCATION", "PEOPLE", "SKILLS", "CAPACITY"]}
      title="Resources"
    >
      <WorkspaceListWithAnalytics charts={resourceAnalytics} filterLabel="Department" />
      <ListTable groups={resourceGroups} />
    </WorkspaceFrame>
  );
}

export function AgencyProfitabilityWorkspace() {
  return (
    <WorkspaceFrame
      accent="#57c69a"
      icon={faChartPie}
      subtitle="All"
      tabs={["AGENCY", "CLIENTS", "PROJECTS", "FORECAST"]}
      title="Profitability"
    >
      <div className="workspace-profitability">
        <div className="profit-mini-cards">
          <article><small>Agency margin</small><strong>38%</strong></article>
          <article><small>Revenue forecast</small><strong>€1.42m</strong></article>
          <article><small>Billing remaining</small><strong>€312k</strong></article>
        </div>
        <WorkspaceListWithAnalytics compact charts={profitAnalytics} filterLabel="Period" />
        <ListTable groups={profitabilityGroups} />
      </div>
    </WorkspaceFrame>
  );
}

type WorkspaceAnalytics = Array<{
  bars: number[];
  images?: string[];
  labels?: string[];
  title: string;
  values?: number[];
}>;

function WorkspaceListWithAnalytics({
  charts,
  compact = false,
  filterLabel,
}: {
  charts: WorkspaceAnalytics;
  compact?: boolean;
  filterLabel: string;
}) {
  return (
    <section className={compact ? "workspace-analytics compact" : "workspace-analytics"}>
      <div className="workspace-filter-row">
        <button className="active">Export</button>
        <button>Client</button>
        <button>No mail</button>
        <label>
          <span>{filterLabel}</span>
          <input placeholder="All" />
        </label>
      </div>
      <div className="workspace-chart-row">
        {charts.map(({ bars, images, labels, title, values }) => (
          <article className="workspace-chart-card" key={title}>
            <header>{title}</header>
            <div className="mini-bar-chart">
              {bars.map((height, index) => (
                <div className="mini-bar-item" key={`${title}-${index}`}>
                  <span
                    title={`${values?.[index] ?? height} total jobs`}
                    style={{ "--bar-height": `${height}%` } as CSSProperties}
                  />
                  {images?.[index] ? (
                    <img src={images[index]} alt={labels?.[index] ?? ""} />
                  ) : (
                    <small>{labels?.[index] ?? index + 1}</small>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
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

const jobAnalytics: WorkspaceAnalytics = [
  {
    title: "Jobs by region",
    bars: [32, 48, 72, 58, 86],
    labels: ["EU", "UK", "BR", "US", "MEA"],
    values: [18, 27, 41, 33, 49],
  },
  {
    title: "Jobs by executor",
    bars: [82, 74, 58, 46],
    images: campaign.team.map((member) => member.avatar),
    labels: campaign.team.map((member) => member.name),
    values: [31, 28, 22, 17],
  },
  {
    title: "Jobs per client",
    bars: [92, 66, 54, 39, 28],
    images: [clientAssets.cocaCola, clientAssets.samsung, clientAssets.nike, clientAssets.loreal, clientAssets.hp],
    labels: ["Coca-Cola", "Samsung", "Nike", "L'Oreal", "HP"],
    values: [46, 33, 27, 19, 14],
  },
];

const requestAnalytics: WorkspaceAnalytics = [
  { title: "Requests by source", bars: [64, 42, 26, 18, 12] },
  { title: "Requests by qualification stage", bars: [82, 55, 38, 21, 14] },
  { title: "Requests by client tier", bars: [72, 36, 22, 12, 9] },
];

const taskAnalytics: WorkspaceAnalytics = [
  { title: "Tasks by owner", bars: [72, 68, 51, 42, 28] },
  { title: "Tasks by workflow stage", bars: [48, 76, 54, 31, 17] },
  { title: "Tasks due this week", bars: [22, 34, 58, 44, 26, 18, 12] },
];

const estimateAnalytics: WorkspaceAnalytics = [
  { title: "Estimates by approval stage", bars: [34, 58, 74, 22, 16] },
  { title: "Estimate value by department", bars: [82, 61, 44, 39, 28, 19] },
  { title: "Estimates per client", bars: [76, 48, 31, 24, 12] },
];

const resourceAnalytics: WorkspaceAnalytics = [
  { title: "Capacity by department", bars: [78, 62, 49, 35, 22] },
  { title: "Booked hours by skill", bars: [86, 73, 58, 42, 33, 18] },
  { title: "Availability by week", bars: [28, 41, 54, 63, 47, 36] },
];

const profitAnalytics: WorkspaceAnalytics = [
  { title: "Margin by client", bars: [74, 66, 42, 31, 22] },
  { title: "Revenue by department", bars: [88, 72, 54, 39, 28] },
  { title: "Forecast by month", bars: [38, 46, 59, 72, 84, 91] },
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

const profitabilityGroups = [
  {
    label: "Client profitability",
    tone: "green",
    rows: [
      { title: "Coca-Cola", image: clientAssets.cocaCola, type: "Client", company: "Coca-Cola", department: "Client Services", classification: "On plan", date: "€15,000", priority: "Low" as const },
      { title: "Samsung", image: clientAssets.samsung, type: "Client", company: "Samsung", department: "Production", classification: "34% margin", date: "€122.4k", priority: "Medium" as const },
      { title: "L'Oreal", image: clientAssets.loreal, type: "Client", company: "L'Oreal", department: "Strategy", classification: "29% margin", date: "€42.5k", priority: "High" as const },
    ],
  },
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
