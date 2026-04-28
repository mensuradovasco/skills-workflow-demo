import type { DemoStep } from "./cocaColaCampaign";

export type GuidedDemoPlacement = "top" | "right" | "bottom" | "left";

export type GuidedDemoTarget = {
  step: DemoStep;
  view?: "default" | "approvedBudget" | "budgetFeed" | "documents" | "gantt" | "kanban" | "calendar" | "jobs";
};

export type GuidedDemoStep = {
  advanceDelayMs?: number;
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
    target: { step: "budget", view: "approvedBudget" },
    selector: '[data-tour-anchor="budget-estimate-stage"]',
    title: "Generate Project",
    body: "The client approved the estimate. Generate the project from the approved budget.",
    placement: "left",
  },
  {
    id: "project-kanban",
    target: { step: "project", view: "gantt" },
    selector: '[data-tour-anchor="project-kanban-tab"]',
    title: "Kanban",
    body: "Click the Kanban tab to see tasks organized by stage.",
    placement: "bottom",
  },
  {
    id: "project-calendar",
    target: { step: "project", view: "kanban" },
    selector: '[data-tour-anchor="project-calendar-tab"]',
    title: "Calendar",
    body: "Then open the Calendar tab to view the same work on the schedule.",
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
    advanceDelayMs: 2900,
    id: "resource-planning-view",
    target: { step: "resources" },
    selector: '[data-tour-anchor="resource-search"]',
    title: "Resources",
    body: "Search Photoshop, select the skill, filter the team, and let the job move to the most available person.",
    placement: "left",
  },
  {
    id: "resource-open-job",
    target: { step: "resources" },
    selector: '[data-tour-anchor="resource-create-3d-asset"]',
    title: "Open Job",
    body: "Open the Create 3D asset job from the resource plan without leaving the allocation workspace.",
    placement: "left",
  },
  {
    id: "resource-proofing-track",
    target: { step: "resources" },
    selector: '[data-tour-anchor="proof-send-approval"]',
    waitFor: '[data-tour-anchor="proof-send-approval"]',
    title: "Send to client approval",
    body: "Send the 3D asset proof to the client and watch it land approved.",
    placement: "left",
  },
];
