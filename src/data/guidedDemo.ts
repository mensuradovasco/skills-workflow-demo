import type { DemoStep } from "./cocaColaCampaign";

export type GuidedDemoPlacement = "top" | "right" | "bottom" | "left";

export type GuidedDemoTarget = {
  step: DemoStep;
  view?: "default" | "approvedBudget" | "budgetFeed" | "documents" | "gantt" | "kanban" | "calendar" | "jobs" | "resourceUtilization";
  workspace?: "clients" | "jobs" | "projects" | "requests" | "tasks" | "budget" | "resources" | "profitability";
};

export type GuidedDemoStep = {
  actionLabel?: string;
  advanceDelayMs?: number;
  autoAdvanceMs?: number;
  id: string;
  nextAdvancesOnly?: boolean;
  railStep?: DemoStep;
  spotlight?: boolean;
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
    const stage = guidedStepStage(step);
    if (!seen.has(stage)) {
      seen.add(stage);
      order.push(stage);
    }
  }
  return order;
}

export function guidedStepStage(step: GuidedDemoStep): DemoStep {
  return step.railStep ?? step.target.step;
}

export function firstGuidedIndexForStage(steps: GuidedDemoStep[], stage: DemoStep) {
  const index = steps.findIndex((step) => guidedStepStage(step) === stage);
  return index >= 0 ? index : null;
}

export const guidedDemoSteps: GuidedDemoStep[] = [
  {
    actionLabel: "Structure brief",
    id: "client-request",
    target: { step: "request" },
    selector: '[data-tour-anchor="client-request"]',
    title: "New client request",
    body: "A new client request just landed. I'll structure it into a brief and walk you through the campaign from briefing to billing.",
    placement: "left",
  },
  {
    id: "structure-brief",
    target: { step: "brief" },
    selector: '[data-tour-anchor="generate-budget-from-brief"]',
    title: "Generate Budget",
    body: "Brief is structured with scope, deliverables, dates, and team. Generate the budget straight from it.",
    placement: "left",
  },
  {
    id: "estimate-budget",
    target: { step: "budget" },
    selector: '[data-tour-anchor="budget-estimate-stage"]',
    title: "Send Estimate for Approval",
    body: "Estimate's priced and ready — send it over for client approval.",
    placement: "left",
  },
  {
    id: "approval-project",
    target: { step: "budget" },
    selector: '[data-tour-anchor="budget-estimate-stage"]',
    waitFor: '[data-tour-anchor="budget-estimate-stage"][data-stage-state="approved"]',
    title: "Generate Project",
    body: "Estimate approved. Spin up the project workspace from the approved budget.",
    waitingTitle: "Awaiting client feedback",
    waitingBody: "Estimate is with the client. Hold tight while they review it…",
    placement: "left",
  },
  {
    id: "project-kanban",
    target: { step: "project", view: "gantt" },
    selector: '[data-tour-anchor="project-kanban-tab"]',
    title: "Kanban",
    body: "Project is live. Open the Kanban tab to see tasks organized by stage.",
    placement: "bottom",
  },
  {
    id: "project-calendar",
    target: { step: "project", view: "kanban" },
    selector: '[data-tour-anchor="project-calendar-tab"]',
    title: "Calendar",
    body: "Same work, different lens — switch to Calendar to see it on the schedule.",
    placement: "bottom",
  },
  {
    id: "project-jobs",
    target: { step: "project", view: "calendar" },
    selector: '[data-tour-anchor="project-jobs-tab"]',
    title: "Kanban by Person",
    body: "Now group the same jobs by owner — Kanban by Person.",
    placement: "bottom",
  },
  {
    id: "project-jobs-view",
    target: { step: "project", view: "jobs" },
    selector: '[data-tour-anchor="resources-sidebar-button"]',
    title: "Resources",
    body: "From the by-person board, jump into Resources to check team capacity and assignments.",
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
    title: "Open the 3D job",
    body: "Open the 3D billboard task. The asset opens straight in Under Client Review.",
    placement: "left",
  },
  {
    autoAdvanceMs: 1100,
    id: "client-side-review",
    nextAdvancesOnly: true,
    railStep: "proofing",
    spotlight: false,
    target: { step: "resources" },
    selector: '[data-tour-anchor="asset-thumbnail-preview"]',
    waitFor: '[data-tour-anchor="asset-thumbnail-preview"]',
    title: "Open the proof",
    body: "The 3D billboard asset is ready for review. Open the image thumbnail to launch proofing.",
    placement: "left",
  },
  {
    autoAdvanceMs: 5200,
    id: "annotate-asset",
    nextAdvancesOnly: true,
    railStep: "proofing",
    spotlight: false,
    target: { step: "resources" },
    selector: '[data-tour-anchor="annotation-preview"]',
    waitFor: '[data-tour-anchor="annotation-preview"]',
    title: "Client review & billing",
    body: "Client opens the proof, drops annotations, signs off — stage flips from Under Client Review to To be Billed.",
    placement: "left",
  },
  {
    actionLabel: "Open project",
    id: "navigate-project",
    railStep: "proofing",
    target: { step: "resources" },
    selector: '[data-tour-anchor="modal-project-breadcrumb"]',
    waitFor: '[data-tour-anchor="modal-project-breadcrumb"]',
    title: "Back to the project",
    body: "Asset's billed. Open the project to track delivery and overall budget.",
    placement: "bottom",
  },
  {
    actionLabel: "Open profitability",
    id: "open-profitability-workspace",
    railStep: "profitability",
    target: { step: "project", view: "resourceUtilization" },
    selector: '[data-tour-anchor="profitability-sidebar-button"]',
    waitFor: '[data-tour-anchor="profitability-sidebar-button"]',
    title: "Planned vs Actual → Profitability",
    body: "Project Burn shows planned vs actual by week, role, and department. From here, jump to the Profitability workspace for billing, margin, and forecast across the agency.",
    placement: "right",
  },
  {
    id: "profitability-workspace",
    railStep: "billing",
    spotlight: false,
    target: { step: "profitability", workspace: "profitability" },
    selector: '[data-tour-anchor="profitability-workspace"]',
    waitFor: '[data-tour-anchor="profitability-workspace"]',
    title: "Billing & profitability",
    body: "This dashboard brings the project outcome back into the business view: billing remaining, margin, forecast, and profitability by client or project.",
    placement: "left",
  },
];
