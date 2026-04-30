import type { DemoStep } from "./cocaColaCampaign";

export type GuidedDemoPlacement = "top" | "right" | "bottom" | "left";

export type GuidedDemoTarget = {
  step: DemoStep;
  view?: "default" | "approvedBudget" | "budgetFeed" | "documents" | "gantt" | "kanban" | "calendar" | "jobs";
};

export type GuidedDemoStep = {
  actionLabel?: string;
  advanceDelayMs?: number;
  autoAdvanceMs?: number;
  id: string;
  nextAdvancesOnly?: boolean;
  target: GuidedDemoTarget;
  selector: string;
  title: string;
  body: string;
  placement: GuidedDemoPlacement;
  waitFor?: string;
  waitingTitle?: string;
  waitingBody?: string;
};

export function guidedStageIds(steps: GuidedDemoStep[]): DemoStep[] {
  const seen = new Set<DemoStep>();
  const order: DemoStep[] = [];
  for (const step of steps) {
    if (!seen.has(step.target.step)) {
      seen.add(step.target.step);
      order.push(step.target.step);
    }
  }
  return order;
}

export const guidedDemoSteps: GuidedDemoStep[] = [
  {
    actionLabel: "Structure brief",
    id: "client-request",
    target: { step: "request" },
    selector: '[data-tour-anchor="client-request"]',
    title: "New client request",
    body: "You've got a new client request. Let me structure this into a Brief and walk you through how to manage a campaign from briefing to billing.",
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
    body: "Review the estimate and send it for client approval.",
    placement: "left",
  },
  {
    id: "approval-project",
    target: { step: "budget" },
    selector: '[data-tour-anchor="budget-estimate-stage"]',
    waitFor: '[data-tour-anchor="budget-estimate-stage"][data-stage-state="approved"]',
    title: "Generate Project",
    body: "The client approved the estimate. Generate the project from the approved budget.",
    waitingTitle: "Awaiting client feedback",
    waitingBody: "I sent the estimate to the client. Hold tight while they review it…",
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
    autoAdvanceMs: 2900,
    id: "resource-planning-view",
    nextAdvancesOnly: true,
    target: { step: "resources" },
    selector: '[data-tour-anchor="resource-search"]',
    title: "Finding the right person",
    body: "Searching for Photoshop, filtering the team by skill, and reassigning the job to the most available teammate.",
    placement: "left",
  },
  {
    id: "resource-open-job",
    target: { step: "resources" },
    selector: '[data-tour-anchor="resource-create-3d-asset"]',
    title: "Open Job",
    body: "Open the Create 3D asset job. Arthur uploads the asset to the feed and logs the hours he worked.",
    placement: "left",
  },
  {
    autoAdvanceMs: 3200,
    id: "resource-job-proofing-tab",
    nextAdvancesOnly: true,
    target: { step: "resources" },
    selector: '[data-tour-anchor="job-proofing-tab"]',
    waitFor: '[data-tour-anchor="job-proofing-tab"]',
    title: "Switching to Proofing",
    body: "Opening the same asset on the proofing tab so the client can review it.",
    placement: "left",
  },
  {
    autoAdvanceMs: 3500,
    id: "resource-proofing-track",
    target: { step: "resources" },
    selector: '[data-tour-anchor="proof-send-approval"]',
    waitFor: '[data-tour-anchor="proof-send-approval"]',
    title: "Sending for client approval",
    body: "Sharing the proof with the client, capturing their comments, and moving it to client-approved and ready to bill.",
    placement: "left",
  },
];
