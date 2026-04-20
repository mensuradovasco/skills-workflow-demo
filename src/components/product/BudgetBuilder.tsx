import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faChevronDown,
  faChevronRight,
  faCircleCheck,
  faLayerGroup,
  faReceipt,
  faScrewdriverWrench,
  faUserGroup,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Card } from "../ui/Card";
import { campaign } from "../../data/cocaColaCampaign";
import { FeedDocumentView } from "./DocumentFrame";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const deliverables = [
  {
    id: "1",
    name: "3D OOH Banner",
    description: "3D key visual adaptation for outdoor and paid social",
    service: "Creative production",
  },
  {
    id: "2",
    name: "Retail POS Toolkit",
    description: "Poster system, shelf strips and store activation artwork",
    service: "Retail adaptation",
  },
  {
    id: "3",
    name: "Campaign Consulting",
    description: "Account planning, creative direction and client management",
    service: "Consulting",
  },
];

const resourceGroups = [
  {
    deliverable: "1. 3D OOH Banner",
    rows: [
      { order: "1.1", role: "Account Director", user: "Rachel", group: "Client Services", rate: 250, cost: 250, hours: 8 },
      { order: "1.2", role: "Creative Director", user: "Maya", group: "Creative", rate: 210, cost: 210, hours: 10 },
      { order: "1.3", role: "Senior Designer", user: "Arthur", group: "Design", rate: 150, cost: 150, hours: 32 },
      { order: "1.4", role: "Motion Designer", user: "Daniel", group: "Motion", rate: 170, cost: 170, hours: 22 },
    ],
  },
  {
    deliverable: "2. Retail POS Toolkit",
    rows: [
      { order: "2.1", role: "Producer", user: "Rachel", group: "Production", rate: 150, cost: 150, hours: 12 },
      { order: "2.2", role: "Designer", user: "Arthur", group: "Design", rate: 150, cost: 150, hours: 28 },
      { order: "2.3", role: "Copywriter", user: "Maya", group: "Creative", rate: 170, cost: 170, hours: 10 },
      { order: "2.4", role: "Artwork QA", user: "Paul", group: "Studio", rate: 120, cost: 120, hours: 14 },
    ],
  },
  {
    deliverable: "3. Campaign Consulting",
    rows: [
      { order: "3.1", role: "Strategy Director", user: "Wendy", group: "Brand Strategy", rate: 250, cost: 250, hours: 14 },
      { order: "3.2", role: "Account Director", user: "Rachel", group: "Client Services", rate: 250, cost: 250, hours: 18 },
      { order: "3.3", role: "Creative Review", user: "Maya", group: "Creative", rate: 180, cost: 180, hours: 8 },
    ],
  },
];

const services = [
  { order: "1.5", deliverable: "3D OOH Banner", item: "3D render support", supplier: "Studio Eleven", quantity: 1, unit: 5200 },
  { order: "1.6", deliverable: "3D OOH Banner", item: "Outdoor mockup production", supplier: "Media Lab", quantity: 1, unit: 3000 },
  { order: "2.5", deliverable: "Retail POS Toolkit", item: "Print proofing package", supplier: "Prime Print", quantity: 1, unit: 3600 },
  { order: "2.6", deliverable: "Retail POS Toolkit", item: "POS adaptation support", supplier: "Retail Works", quantity: 1, unit: 2800 },
  { order: "3.4", deliverable: "Campaign Consulting", item: "Market insight sprint", supplier: "Brand Desk", quantity: 1, unit: 2200 },
];

const expenses = [
  { order: "1.7", deliverable: "3D OOH Banner", item: "Stock imagery", supplier: "Getty", quantity: 4, unit: 300 },
  { order: "2.7", deliverable: "Retail POS Toolkit", item: "Print samples", supplier: "Prime Print", quantity: 7, unit: 180 },
  { order: "2.8", deliverable: "Retail POS Toolkit", item: "Courier delivery", supplier: "DHL", quantity: 3, unit: 280 },
  { order: "3.5", deliverable: "Campaign Consulting", item: "Client workshop travel", supplier: "Internal", quantity: 1, unit: 950 },
];

const deliverableNameFromGroup = (name: string) => name.replace(/^\d+\.\s*/, "");

const totalResourceCostFor = (deliverable: string) =>
  resourceGroups
    .filter((group) => deliverableNameFromGroup(group.deliverable) === deliverable)
    .reduce((sum, group) => sum + group.rows.reduce((groupSum, row) => groupSum + row.cost * row.hours, 0), 0);

const totalExternalCostFor = (
  rows: Array<{ deliverable: string; quantity: number; unit: number }>,
  deliverable: string,
) =>
  rows
    .filter((row) => row.deliverable === deliverable)
    .reduce((sum, row) => sum + row.quantity * row.unit, 0);

const deliverableQuotes = deliverables.map((item) => {
  const resources = totalResourceCostFor(item.name);
  const serviceCosts = totalExternalCostFor(services, item.name);
  const expensesCosts = totalExternalCostFor(expenses, item.name);
  const totalCost = resources + serviceCosts + expensesCosts;
  const totalIncome = Math.round(totalCost * 1.32);

  return {
    ...item,
    resources,
    serviceCosts,
    expensesCosts,
    totalCost,
    totalIncome,
  };
});

const sectionTotals = {
  deliverables: deliverableQuotes.reduce((sum, item) => sum + item.totalCost, 0),
  resources: deliverableQuotes.reduce((sum, item) => sum + item.resources, 0),
  services: deliverableQuotes.reduce((sum, item) => sum + item.serviceCosts, 0),
  expenses: deliverableQuotes.reduce((sum, item) => sum + item.expensesCosts, 0),
  income: deliverableQuotes.reduce((sum, item) => sum + item.totalIncome, 0),
  hours: resourceGroups.reduce((sum, group) => sum + group.rows.reduce((groupSum, row) => groupSum + row.hours, 0), 0),
};

export function BudgetBuilder() {
  const [selectedTab, setSelectedTab] = useState("QUOTES");
  const [openSections, setOpenSections] = useState({
    resources: true,
    services: false,
    expenses: false,
  });
  const tabs = ["FEED", "CHECKLIST", "INFO", "QUOTES", "ESTIMATE BUILDER", "EXPENSES", "PROFITABILITY"];
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  return (
    <Card className="budget-card">
      <header className="budget-document-header">
        <div className="budget-app-header">
          <div className="budget-title">
            <span className="budget-menu"><FontAwesomeIcon icon={faCalculator} /></span>
            <span className="brand-avatar mini client-logo-badge">
              <img src={campaign.clientLogo} alt={campaign.client} />
            </span>
            <div>
              <strong>Budget</strong>
              <small>{campaign.client} <span>/</span> 2026 <span>/</span> Contract <span>/</span> {campaign.campaign}</small>
            </div>
          </div>
          <button className="ai-fab" aria-label="AI budget assistant">
            <FontAwesomeIcon icon={faWandMagicSparkles} />
          </button>
        </div>
        <div className="budget-tabs">
          {tabs.map((tab) => (
            <button className={tab === selectedTab ? "active" : ""} key={tab} onClick={() => setSelectedTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
      </header>
      <div className="budget-ai-sweep" aria-hidden="true" />
      {selectedTab === "FEED" ? <FeedDocumentView /> : <div className="budget-quote-workspace">
        <section className="budget-deliverables-panel">
          <header>
            <strong>Deliverables</strong>
            <div className="budget-toggle-group">
              <button className="active">All</button>
              <button>Approved</button>
            </div>
          </header>
          <div className="budget-deliverable-table">
            <div className="budget-deliverable-row head">
              <span>Order</span>
              <span>Name</span>
              <span>Description</span>
              <span>Service</span>
              <span>Total cost</span>
              <span>Total income</span>
              <span>Approved</span>
            </div>
            {deliverableQuotes.map((item) => (
              <div className="budget-deliverable-row" key={item.id}>
                <span>{item.id}</span>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
                <span>{item.service}</span>
                <span>{formatCurrency(item.totalCost)}</span>
                <span>{formatCurrency(item.totalIncome)}</span>
                <span><FontAwesomeIcon icon={faCircleCheck} /></span>
              </div>
            ))}
            <div className="budget-deliverable-row total">
              <span />
              <strong>Total estimate</strong>
              <span />
              <span />
              <span>{formatCurrency(sectionTotals.deliverables)}</span>
              <span>{formatCurrency(sectionTotals.income)}</span>
              <span />
            </div>
          </div>
        </section>

        <section className={openSections.resources ? "budget-quote-section resources open" : "budget-quote-section collapsed"}>
          <button className="budget-section-header" onClick={() => toggleSection("resources")}>
            <span><FontAwesomeIcon icon={openSections.resources ? faChevronDown : faChevronRight} /></span>
            <strong><FontAwesomeIcon icon={faUserGroup} /> Resources</strong>
            <em>{formatCurrency(sectionTotals.resources)}</em>
          </button>
          {openSections.resources && <div className="budget-resource-table">
            <div className="budget-resource-row head">
              <span>Order</span>
              <span>Typology group</span>
              <span>User</span>
              <span>Table rate</span>
              <span>Unit cost</span>
              <span>Hours</span>
              <span>Utilization</span>
              <span>Total cost</span>
              <span>Approved</span>
            </div>
            {resourceGroups.map((group) => (
              <div className="budget-resource-group" key={group.deliverable}>
                <div className="budget-resource-group-title">
                  <FontAwesomeIcon icon={faLayerGroup} />
                  <strong>{group.deliverable}</strong>
                </div>
                {group.rows.map((row) => (
                  <div className="budget-resource-row" key={`${group.deliverable}-${row.order}`}>
                    <span>{row.order}</span>
                    <strong>{row.role}</strong>
                    <span>{row.user}</span>
                    <span>{formatCurrency(row.rate)}</span>
                    <span>{formatCurrency(row.cost)}</span>
                    <span>{row.hours}</span>
                    <span>{((row.hours / 180) * 100).toFixed(2)}%</span>
                    <span>{formatCurrency(row.cost * row.hours)}</span>
                    <span><FontAwesomeIcon icon={faCircleCheck} /></span>
                  </div>
                ))}
              </div>
            ))}
            <div className="budget-resource-row total">
              <span />
              <strong>Resources total</strong>
              <span />
              <span />
              <span />
              <span>{sectionTotals.hours}</span>
              <span />
              <span>{formatCurrency(sectionTotals.resources)}</span>
              <span />
            </div>
          </div>}
        </section>

        <section className={openSections.services ? "budget-quote-section open" : "budget-quote-section collapsed"}>
          <button className="budget-section-header" onClick={() => toggleSection("services")}>
            <span><FontAwesomeIcon icon={openSections.services ? faChevronDown : faChevronRight} /></span>
            <strong><FontAwesomeIcon icon={faScrewdriverWrench} /> Services</strong>
            <em>{formatCurrency(sectionTotals.services)}</em>
          </button>
          {openSections.services && <BudgetCostTable rows={services} total={sectionTotals.services} totalLabel="Services total" />}
        </section>

        <section className={openSections.expenses ? "budget-quote-section open" : "budget-quote-section collapsed"}>
          <button className="budget-section-header" onClick={() => toggleSection("expenses")}>
            <span><FontAwesomeIcon icon={openSections.expenses ? faChevronDown : faChevronRight} /></span>
            <strong><FontAwesomeIcon icon={faReceipt} /> Expenses</strong>
            <em>{formatCurrency(sectionTotals.expenses)}</em>
          </button>
          {openSections.expenses && <BudgetCostTable rows={expenses} total={sectionTotals.expenses} totalLabel="Expenses total" />}
        </section>
      </div>}
    </Card>
  );
}

function BudgetCostTable({
  rows,
  total,
  totalLabel,
}: {
  rows: Array<{ deliverable: string; item: string; order: string; quantity: number; supplier: string; unit: number }>;
  total: number;
  totalLabel: string;
}) {
  return (
    <div className="budget-cost-table">
      <div className="budget-cost-row head">
        <span>Order</span>
        <span>Deliverable</span>
        <span>Item</span>
        <span>Supplier</span>
        <span>Qty</span>
        <span>Unit cost</span>
        <span>Total cost</span>
        <span>Approved</span>
      </div>
      {rows.map((row) => (
        <div className="budget-cost-row" key={`${row.order}-${row.item}`}>
          <span>{row.order}</span>
          <strong>{row.deliverable}</strong>
          <span>{row.item}</span>
          <span>{row.supplier}</span>
          <span>{row.quantity}</span>
          <span>{formatCurrency(row.unit)}</span>
          <span>{formatCurrency(row.quantity * row.unit)}</span>
          <span><FontAwesomeIcon icon={faCircleCheck} /></span>
        </div>
      ))}
      <div className="budget-cost-row total">
        <span />
        <strong>{totalLabel}</strong>
        <span />
        <span />
        <span />
        <span />
        <span>{formatCurrency(total)}</span>
        <span />
      </div>
    </div>
  );
}
