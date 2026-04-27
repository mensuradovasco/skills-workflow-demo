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
    title: "Create Budget",
    body: "Click the notification to generate the budget from the incoming request.",
    placement: "left",
  },
  {
    id: "estimate-budget",
    target: { step: "budget" },
    selector: '[data-tour-anchor="budget-hours"]',
    title: "Adjust Hours",
    body: "Confirm the hours adjustment before the estimate is sent.",
    placement: "left",
  },
  {
    id: "budget-feed",
    target: { step: "budget" },
    selector: '[data-tour-anchor="budget-feed-tab"]',
    title: "Open Feed",
    body: "When the quote is ready, open the Feed to move the estimate through workflow.",
    placement: "bottom",
  },
  {
    id: "send-estimate",
    target: { step: "budget", view: "budgetFeed" },
    selector: '[data-tour-anchor="budget-stage-approval"]',
    title: "Send Estimate",
    body: "Use the workflow action bar to send the estimate for client approval.",
    placement: "left",
  },
  {
    id: "approval-project",
    target: { step: "approval", view: "budgetFeed" },
    selector: '[data-tour-anchor="approval-project"]',
    title: "Project",
    body: "The budget is approved. Go to the project screen.",
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
