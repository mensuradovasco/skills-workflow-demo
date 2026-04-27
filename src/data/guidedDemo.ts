import type { DemoStep } from "./cocaColaCampaign";

export type GuidedDemoPlacement = "top" | "right" | "bottom" | "left";

export type GuidedDemoTarget = {
  step: DemoStep;
  view?: "default" | "budgetFeed" | "documents" | "gantt" | "kanban" | "calendar" | "jobs";
};

export type GuidedDemoStep = {
  id: string;
  target: GuidedDemoTarget;
  selector: string;
  title: string;
  body: string;
  placement: GuidedDemoPlacement;
  waitFor?: string;
};

export const guidedDemoSteps: GuidedDemoStep[] = [
  {
    id: "client-request",
    target: { step: "request" },
    selector: '[data-tour-anchor="client-request"]',
    title: "Structure Brief",
    body: "Open the new Coca-Cola request and let AI turn it into a structured project brief.",
    placement: "left",
  },
  {
    id: "structure-brief",
    target: { step: "brief" },
    selector: '[data-tour-anchor="generate-budget-from-brief"]',
    title: "Generate Budget",
    body: "The brief is structured. Now generate the budget from the confirmed scope, deliverables, dates, and team.",
    placement: "left",
  },
  {
    id: "estimate-budget",
    target: { step: "budget" },
    selector: '[data-tour-anchor="budget-estimate-stage"]',
    title: "Send Estimate for Approval",
    body: "Review the estimate total, planned hours, and scope, then send the estimate for client approval.",
    placement: "left",
  },
  {
    id: "approval-project",
    target: { step: "approval" },
    selector: '[data-tour-anchor="approval-project"]',
    title: "Project",
    body: "The total budget is approved. Create the project from the approved estimate.",
    placement: "left",
  },
  {
    id: "project-gantt",
    target: { step: "project", view: "gantt" },
    selector: '[data-tour-anchor="project-gantt-timeline"]',
    title: "Adjust Timeline",
    body: "Use the Gantt timeline to review and adjust the Website phase before switching views.",
    placement: "left",
  },
  {
    id: "project-calendar",
    target: { step: "project", view: "gantt" },
    selector: '[data-tour-anchor="project-calendar-tab"]',
    title: "Calendar",
    body: "Click the Calendar tab to switch this project into the schedule view.",
    placement: "bottom",
  },
  {
    id: "project-jobs",
    target: { step: "project", view: "calendar" },
    selector: '[data-tour-anchor="project-jobs-tab"]',
    title: "Kanban by Person",
    body: "Then click Kanban by Person to see each person’s jobs grouped by owner.",
    placement: "bottom",
  },
  {
    id: "project-jobs-view",
    target: { step: "project", view: "jobs" },
    selector: '[data-tour-anchor="resources-sidebar-button"]',
    title: "Start",
    body: "From the by-person board, open Resources in the sidebar to review team capacity and assignments.",
    placement: "right",
  },
  {
    id: "resource-planning-view",
    target: { step: "resources" },
    selector: '[data-tour-anchor="resource-search"]',
    title: "Resources",
    body: "Search the resource board to review this project in the context of other team bookings and spot conflicts.",
    placement: "left",
  },
  {
    id: "execution-review",
    target: { step: "execution" },
    selector: '[data-tour-anchor="execution-review"]',
    title: "Review",
    body: "Open the approval and proofing step.",
    placement: "left",
  },
  {
    id: "proofing-track",
    target: { step: "proofing" },
    selector: '[data-tour-anchor="proofing-track"]',
    title: "Track",
    body: "Move to profitability and plan-vs-actual tracking.",
    placement: "left",
  },
];
