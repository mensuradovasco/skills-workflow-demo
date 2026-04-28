import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faChevronDown,
  faChevronRight,
  faCircleCheck,
  faReceipt,
  faScrewdriverWrench,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { type CSSProperties, useEffect, useRef, useState } from "react";
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
    name: "Landing Page",
    description: "Design and build for the summer campaign page",
    service: "Website",
  },
  {
    id: "2",
    name: "15s Video",
    description: "Short campaign edit for paid and owned channels",
    service: "Video",
  },
  {
    id: "3",
    name: "3D Digital Banner",
    description: "3D product asset adapted into a digital banner",
    service: "3D Banner",
  },
];

const resourceGroups = [
  {
    deliverable: "1. Landing Page",
    rows: [
      { order: "1.1", role: "Creative", user: "Rachel", group: "Creative", rate: 150, cost: 150, hours: 6 },
      { order: "1.2", role: "Designer", user: "Arthur", group: "Design", rate: 125, cost: 125, hours: 24 },
    ],
  },
  {
    deliverable: "2. 15s Video",
    rows: [
      { order: "2.1", role: "Creative", user: "Rachel", group: "Creative", rate: 150, cost: 150, hours: 6 },
      { order: "2.2", role: "Editor", user: "Daniel", group: "Video", rate: 125, cost: 125, hours: 18 },
    ],
  },
  {
    deliverable: "3. 3D Digital Banner",
    rows: [
      { order: "3.1", role: "Creative", user: "Rachel", group: "Creative", rate: 150, cost: 150, hours: 8 },
      { order: "3.2", role: "Designer", user: "Arthur", group: "Design", rate: 125, cost: 125, hours: 24 },
    ],
  },
];

const services = [
  { order: "2.3", deliverable: "15s Video", item: "Stock music license", supplier: "Musicbed", quantity: 1, unit: 600 },
  { order: "3.3", deliverable: "3D Digital Banner", item: "3D render support", supplier: "Studio Eleven", quantity: 1, unit: 1200 },
];

const expenses = [
  { order: "1.3", deliverable: "Landing Page", item: "Image license", supplier: "Getty", quantity: 1, unit: 300 },
  { order: "3.4", deliverable: "3D Digital Banner", item: "File packaging and archive", supplier: "Internal", quantity: 1, unit: 400 },
];

type BudgetCostRow = {
  deliverable: string;
  item: string;
  order: string;
  quantity: number;
  supplier: string;
  unit: number;
};

const deliverableNameFromGroup = (name: string) => name.replace(/^\d+\.\s*/, "");

const totalExternalCostFor = (
  rows: Array<{ deliverable: string; quantity: number; unit: number }>,
  deliverable: string,
) =>
  rows
    .filter((row) => row.deliverable === deliverable)
    .reduce((sum, row) => sum + row.quantity * row.unit, 0);

type BudgetBuilderProps = {
  estimateStatus?: "ready" | "sent" | "approved";
  feedStageActionLabel?: string;
  feedStageLabel?: string;
  initialTab?: string;
  onProjectNavigate?: () => void;
};

export function BudgetBuilder({ estimateStatus = "ready", feedStageActionLabel, feedStageLabel, initialTab, onProjectNavigate }: BudgetBuilderProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab ?? "QUOTES");
  const [hoursByOrder, setHoursByOrder] = useState<Record<string, number>>({});
  const [estimateFlowStatus, setEstimateFlowStatus] = useState<"ready" | "sent" | "approved">(estimateStatus);
  const approvalTimerRef = useRef<number | null>(null);
  const [openSections, setOpenSections] = useState({
    resources: true,
    services: false,
    expenses: false,
  });
  const [openDeliverables, setOpenDeliverables] = useState<Record<string, boolean>>({
    "Landing Page": true,
  });
  const tabs = ["FEED", "CHECKLIST", "INFO", "QUOTES", "ESTIMATE BUILDER", "EXPENSES", "PROFITABILITY"];
  const hoursFor = (order: string, fallback: number) => hoursByOrder[order] ?? fallback;
  const totalResourceCostForQuote = (deliverable: string) =>
    resourceGroups
      .filter((group) => deliverableNameFromGroup(group.deliverable) === deliverable)
      .reduce(
        (sum, group) => sum + group.rows.reduce((groupSum, row) => groupSum + row.cost * hoursFor(row.order, row.hours), 0),
        0,
      );
  const quoteDeliverables = deliverables.map((item) => {
    const resources = totalResourceCostForQuote(item.name);
    const serviceCosts = totalExternalCostFor(services, item.name);
    const expensesCosts = totalExternalCostFor(expenses, item.name);
    const hours = resourceGroups
      .filter((group) => deliverableNameFromGroup(group.deliverable) === item.name)
      .reduce((sum, group) => sum + group.rows.reduce((groupSum, row) => groupSum + hoursFor(row.order, row.hours), 0), 0);
    const totalCost = resources + serviceCosts + expensesCosts;
    const projectManagementShare = item.id === "1" ? 1300 : item.id === "2" ? 250 : 100;
    const totalIncome = totalCost + projectManagementShare;

    return {
      ...item,
      expensesCosts,
      hours,
      resources,
      serviceCosts,
      totalCost,
      totalIncome,
    };
  });
  const quoteTotals = {
    deliverables: quoteDeliverables.reduce((sum, item) => sum + item.totalCost, 0),
    resources: quoteDeliverables.reduce((sum, item) => sum + item.resources, 0),
    services: quoteDeliverables.reduce((sum, item) => sum + item.serviceCosts, 0),
    expenses: quoteDeliverables.reduce((sum, item) => sum + item.expensesCosts, 0),
    income: quoteDeliverables.reduce((sum, item) => sum + item.totalIncome, 0),
    hours: quoteDeliverables.reduce((sum, item) => sum + item.hours, 0),
  };
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };
  const toggleDeliverable = (deliverable: string) => {
    setOpenDeliverables((current) => ({ ...current, [deliverable]: !current[deliverable] }));
  };

  useEffect(() => {
    setSelectedTab(initialTab ?? "QUOTES");
  }, [initialTab]);

  useEffect(() => {
    setEstimateFlowStatus(estimateStatus);
  }, [estimateStatus]);

  const sendEstimateForApproval = () => {
    if (estimateFlowStatus === "approved") return;
    if (approvalTimerRef.current) window.clearTimeout(approvalTimerRef.current);
    setEstimateFlowStatus("sent");
    approvalTimerRef.current = window.setTimeout(() => {
      setEstimateFlowStatus("approved");
      approvalTimerRef.current = null;
    }, 1100);
  };

  useEffect(() => {
    const handleGuidedStepComplete = (event: Event) => {
      const stepId = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (stepId === "estimate-budget") {
        setHoursByOrder((current) => ({ ...current, "1.2": 20 }));
        sendEstimateForApproval();
      }
    };
    const handleGuidedStepActive = (event: Event) => {
      const stepId = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (stepId === "estimate-budget") {
        if (approvalTimerRef.current) window.clearTimeout(approvalTimerRef.current);
        approvalTimerRef.current = null;
        setEstimateFlowStatus("ready");
      }
    };

    window.addEventListener("guided-demo-step-complete", handleGuidedStepComplete);
    window.addEventListener("guided-demo-step-active", handleGuidedStepActive);
    return () => {
      window.removeEventListener("guided-demo-step-complete", handleGuidedStepComplete);
      window.removeEventListener("guided-demo-step-active", handleGuidedStepActive);
      if (approvalTimerRef.current) window.clearTimeout(approvalTimerRef.current);
    };
  }, []);

  const isApproved = estimateFlowStatus === "approved";
  const estimateSent = estimateFlowStatus !== "ready";
  const approvalClassName = isApproved ? "approved" : "pending";
  const stageLabel = isApproved ? "Client approved" : estimateSent ? "Sent for approval" : "Ready for approval";
  const stageActionLabel = isApproved ? "Generate project" : estimateSent ? "Awaiting approval" : (feedStageActionLabel ?? "Send estimate");
  const stageClassName = isApproved
    ? "feed-stage-card budget-stage-card approved"
    : estimateSent
      ? "feed-stage-card budget-stage-card sent"
      : "feed-stage-card budget-stage-card";

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
              <small className="budget-hierarchy">
                <span>{campaign.client}</span>
                <span>/</span>
                <span>2026 Contract</span>
                <span>/</span>
                <button
                  className={onProjectNavigate ? "budget-hierarchy-link" : "budget-hierarchy-link is-static"}
                  onClick={onProjectNavigate}
                  type="button"
                >
                  Coca-Cola Summer Assets
                </button>
                <span>/</span>
                <span className="budget-hierarchy-current">Summer Assets Budget</span>
              </small>
            </div>
          </div>
        </div>
          <div className="budget-tabs">
            {tabs.map((tab) => (
            <button
              className={tab === selectedTab ? "active" : ""}
              data-tour-anchor={tab === "FEED" ? "budget-feed-tab" : undefined}
              key={tab}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>
      <div className="budget-ai-sweep" aria-hidden="true" />
      {selectedTab === "FEED" ? <FeedDocumentView feedStageActionLabel={feedStageActionLabel} feedStageLabel={feedStageLabel} /> : <div className="budget-quote-workspace">
        <main className="budget-quote-main">
          <section className="budget-deliverables-panel" data-tour-anchor="estimate-budget">
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
              <span>Hours</span>
              <span>Total cost</span>
              <span>Total income</span>
              <span>Approved</span>
            </div>
            {quoteDeliverables.map((item, index) => (
              <div
                className={isApproved ? "budget-deliverable-row approved" : "budget-deliverable-row pending"}
                key={item.id}
                style={{ "--approval-delay": `${index * 100 + 120}ms` } as CSSProperties}
              >
                <span>{item.id}</span>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
                <span>{item.service}</span>
                <span>{item.hours}</span>
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
              <span>{quoteTotals.hours}</span>
              <span>{formatCurrency(quoteTotals.deliverables)}</span>
              <span>{formatCurrency(quoteTotals.income)}</span>
              <span />
            </div>
          </div>
          </section>

          <section className={openSections.resources ? "budget-quote-section resources open" : "budget-quote-section collapsed"}>
          <button className="budget-section-header" onClick={() => toggleSection("resources")}>
            <span><FontAwesomeIcon icon={openSections.resources ? faChevronDown : faChevronRight} /></span>
            <strong><FontAwesomeIcon icon={faUserGroup} /> Resources</strong>
            <em>{formatCurrency(quoteTotals.resources)}</em>
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
                {(() => {
                  const deliverableName = deliverableNameFromGroup(group.deliverable);
                  const isOpen = openDeliverables[deliverableName] ?? false;

                  return (
                    <>
                <button className="budget-resource-group-title" type="button" onClick={() => toggleDeliverable(deliverableName)}>
                  <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
                  <strong>{group.deliverable}</strong>
                  <em>{formatCurrency(group.rows.reduce((sum, row) => sum + row.cost * hoursFor(row.order, row.hours), 0))}</em>
                </button>
                {isOpen && group.rows.map((row) => {
                  const hours = hoursFor(row.order, row.hours);
                  return (
                  <div
                    className={`${hoursByOrder[row.order] === undefined ? "budget-resource-row" : "budget-resource-row adjusted"} ${approvalClassName}`}
                    key={`${group.deliverable}-${row.order}`}
                    style={{ "--approval-delay": `${resourceApprovalDelay(row.order)}ms` } as CSSProperties}
                  >
                    <span>{row.order}</span>
                    <strong>{row.role}</strong>
                    <span>{row.user}</span>
                    <span>{formatCurrency(row.rate)}</span>
                    <span>{formatCurrency(row.cost)}</span>
                    <span className="budget-hours-cell" data-tour-anchor={row.order === "1.2" ? "budget-hours" : undefined}>
                      <strong>{hours}</strong>
                    </span>
                    <span>{((hours / 180) * 100).toFixed(2)}%</span>
                    <span>{formatCurrency(row.cost * hours)}</span>
                    <span><FontAwesomeIcon icon={faCircleCheck} /></span>
                  </div>
                  );
                })}
                    </>
                  );
                })()}
              </div>
            ))}
          </div>}
          </section>

          <section className={openSections.services ? "budget-quote-section open" : "budget-quote-section collapsed"}>
          <button className="budget-section-header" onClick={() => toggleSection("services")}>
            <span><FontAwesomeIcon icon={openSections.services ? faChevronDown : faChevronRight} /></span>
            <strong><FontAwesomeIcon icon={faScrewdriverWrench} /> Services</strong>
            <em>{formatCurrency(quoteTotals.services)}</em>
          </button>
          {openSections.services && (
            <BudgetCostTable
              approved={isApproved}
              openDeliverables={openDeliverables}
              rows={services}
              toggleDeliverable={toggleDeliverable}
            />
          )}
          </section>

          <section className={openSections.expenses ? "budget-quote-section open" : "budget-quote-section collapsed"}>
          <button className="budget-section-header" onClick={() => toggleSection("expenses")}>
            <span><FontAwesomeIcon icon={openSections.expenses ? faChevronDown : faChevronRight} /></span>
            <strong><FontAwesomeIcon icon={faReceipt} /> Expenses</strong>
            <em>{formatCurrency(quoteTotals.expenses)}</em>
          </button>
          {openSections.expenses && (
            <BudgetCostTable
              approved={isApproved}
              openDeliverables={openDeliverables}
              rows={expenses}
              toggleDeliverable={toggleDeliverable}
            />
          )}
          </section>
        </main>

        <aside className="budget-side-panel">
          <section className={stageClassName}>
            <header>
              <small>04 Jun 2026, 13:31</small>
            </header>
            <div>
              <strong>Stage</strong>
              <span><i /> {stageLabel}</span>
              <button
                className="feed-stage-action"
                data-tour-anchor="budget-estimate-stage"
                onClick={isApproved ? onProjectNavigate : sendEstimateForApproval}
                type="button"
              >
                {stageActionLabel}
              </button>
            </div>
          </section>

          <section className={estimateSent ? "budget-estimate-summary approved" : "budget-estimate-summary"}>
            <small>Estimate total</small>
            <strong>{formatCurrency(quoteTotals.income)}</strong>
            <p>Website, 15s video, 3D banner, concept, and project management.</p>
            {estimateSent && <em>{isApproved ? "Total budget approved" : "Total budget sent for approval"}</em>}
            <span>{deliverables.length} deliverables</span>
            <span>{quoteTotals.hours} planned hours</span>
            <span>Total margin 36%</span>
          </section>

          <section className="budget-side-card team">
            <header>
              <strong>Team</strong>
              <em>Assigned</em>
            </header>
            <div>
              {campaign.team.slice(0, 4).map((member) => (
                <img className="avatar photo" src={member.avatar} alt={member.name} key={member.name} />
              ))}
            </div>
          </section>
        </aside>
      </div>}
    </Card>
  );
}

function BudgetCostTable({
  approved,
  openDeliverables,
  rows,
  toggleDeliverable,
}: {
  approved: boolean;
  openDeliverables: Record<string, boolean>;
  rows: BudgetCostRow[];
  toggleDeliverable: (deliverable: string) => void;
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
      {deliverables.map((deliverable) => {
        const deliverableRows = rows.filter((row) => row.deliverable === deliverable.name);
        const deliverableTotal = deliverableRows.reduce((sum, row) => sum + row.quantity * row.unit, 0);

        return (
          <div className="budget-resource-group" key={deliverable.name}>
            <button className="budget-resource-group-title" type="button" onClick={() => toggleDeliverable(deliverable.name)}>
              <FontAwesomeIcon icon={(openDeliverables[deliverable.name] ?? false) ? faChevronDown : faChevronRight} />
              <strong>{deliverable.id}. {deliverable.name}</strong>
              <em>{formatCurrency(deliverableTotal)}</em>
            </button>
            {(openDeliverables[deliverable.name] ?? false) && deliverableRows.map((row) => (
              <div
                className={approved ? "budget-cost-row approved" : "budget-cost-row pending"}
                key={`${row.order}-${row.item}`}
                style={{ "--approval-delay": `${resourceApprovalDelay(row.order)}ms` } as CSSProperties}
              >
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
          </div>
        );
      })}
        </div>
  );
}

function resourceApprovalDelay(order: string) {
  const digits = Number(order.replace(/\D/g, ""));
  if (!Number.isFinite(digits)) return 120;
  return digits * 100 + 120;
}
