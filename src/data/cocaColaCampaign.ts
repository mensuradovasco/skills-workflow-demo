export type DemoStep =
  | "request"
  | "brief"
  | "budget"
  | "approval"
  | "project"
  | "tasks"
  | "resources"
  | "execution"
  | "proofing"
  | "profitability";

export const demoSteps: Array<{ id: DemoStep; label: string; verb: string }> = [
  { id: "request", label: "Request", verb: "Capture" },
  { id: "brief", label: "Brief", verb: "Structure" },
  { id: "budget", label: "Budget", verb: "Estimate" },
  { id: "approval", label: "Approval", verb: "Approve" },
  { id: "project", label: "Project", verb: "Create" },
  { id: "tasks", label: "Tasks", verb: "Build" },
  { id: "resources", label: "Resources", verb: "Assign" },
  { id: "execution", label: "Execution", verb: "Move" },
  { id: "proofing", label: "Proofing", verb: "Review" },
  { id: "profitability", label: "Profitability", verb: "Track" },
];

export const campaign = {
  organization: "Coca-Cola",
  client: "Coca-Cola",
  campaign: "Coca-Cola - Summer Assets",
  brandMark: "CC",
  clientLogo: "/assets/client-logos/coca-cola.svg",
  workspaceSections: ["Projects", "Documents", "Estimates", "Resources", "Deliverables"],
  status: "In progress",
  request: {
    receivedFrom: "Sofia Martins, Brand Director",
    objective: "Create key assets for a summer campaign.",
    budgetRange: "€15,000",
    dueDate: "25 Jun 2026",
    channels: ["Website", "Video", "3D Banner"],
    deliverables: ["Website Landing Page", "15s Video", "3D Digital Banner"],
  },
  documents: [
    { title: "Client Request / Brief", type: "Brief", status: "Request received" },
    { title: "Estimate / Budget", type: "Estimate", status: "Approved" },
    { title: "Project Plan", type: "Plan", status: "In progress" },
    { title: "Creative Brief", type: "Brief", status: "In progress" },
    { title: "Delivery List", type: "Delivery", status: "Ready for delivery" },
  ],
  deliverables: [
    { name: "Landing Page", status: "In progress", owner: "Designer", dueDate: "18 Jun" },
    { name: "15s Video", status: "In progress", owner: "Editor", dueDate: "20 Jun" },
    { name: "3D Digital Banner", status: "Queued", owner: "Designer", dueDate: "21 Jun" },
  ],
  phases: [
    {
      name: "Concept",
      status: "Approved",
      tasks: ["Define idea", "Quick client approval"],
    },
    {
      name: "Website",
      status: "In progress",
      tasks: ["Design landing page", "Build page"],
    },
    {
      name: "Video",
      status: "In progress",
      tasks: ["Edit 15s video"],
    },
    {
      name: "3D Banner",
      status: "Queued",
      tasks: ["Create 3D asset"],
    },
    {
      name: "Delivery",
      status: "Ready for delivery",
      tasks: ["Final approval", "Deliver files"],
    },
  ],
  budget: {
    total: 15000,
    currency: "EUR",
    lineItems: [
      { service: "Concept & Creative", role: "Creative", hours: 18, amount: 3000, margin: 35 },
      { service: "Website", role: "Designer", hours: 32, amount: 4000, margin: 38 },
      { service: "Video", role: "Editor", hours: 24, amount: 3000, margin: 34 },
      { service: "3D Banner", role: "Designer", hours: 24, amount: 3500, margin: 36 },
      { service: "Project Management", role: "Creative", hours: 10, amount: 1500, margin: 30 },
    ],
  },
  estimate: [
    {
      service: "Concept & Creative",
      role: "Creative",
      hours: 18,
      rate: 167,
      margin: 35,
    },
    {
      service: "Website",
      role: "Designer",
      hours: 32,
      rate: 125,
      margin: 38,
    },
    {
      service: "Video",
      role: "Editor",
      hours: 24,
      rate: 125,
      margin: 34,
    },
    {
      service: "3D Banner",
      role: "Designer",
      hours: 24,
      rate: 146,
      margin: 36,
    },
    { service: "Project Management", role: "Creative", hours: 10, rate: 150, margin: 30 },
  ],
  team: [
    {
      name: "Rachel",
      role: "Creative",
      load: 62,
      skill: "Concept",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Arthur",
      role: "Designer",
      load: 74,
      skill: "Photoshop",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Daniel",
      role: "Editor",
      load: 68,
      skill: "Video",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Sofia",
      role: "Client Services",
      load: 45,
      skill: "Approvals",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Maya",
      role: "Creative Direction",
      load: 58,
      skill: "Concept",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&q=80",
    },
  ],
  tasks: [
    { title: "Define idea", stage: "Approved", owner: "Rachel", eta: "Done" },
    { title: "Quick client approval", stage: "Approved", owner: "Rachel", eta: "Done" },
    { title: "Design landing page", stage: "In progress", owner: "Arthur", eta: "2 days" },
    { title: "Build page", stage: "In progress", owner: "Arthur", eta: "3 days" },
    { title: "Edit 15s video", stage: "In progress", owner: "Daniel", eta: "4 days" },
    { title: "Create 3D asset", stage: "Queued", owner: "Arthur", eta: "5 days" },
    { title: "Final approval", stage: "Queued", owner: "Rachel", eta: "6 days" },
    { title: "Deliver files", stage: "Queued", owner: "Rachel", eta: "7 days" },
  ],
  proof: {
    asset: "Landing Page v1",
    comment: "Can we make the summer headline clearer before final approval?",
    reviewer: "Sofia Martins",
  },
};

export const projectTimelineRows = [
  { wbs: "1", name: "Concept", type: "Phase", stage: "Approved", start: "03 Jun", end: "07 Jun", duration: "4 days", left: 2, width: 12, color: "green", progress: "100%", owner: "Rachel", channel: "Concept", dueDate: "06/07", comments: 1, reference: "COCA-CONCEPT" },
  { wbs: "1.1", name: "Define idea", type: "Task", stage: "Approved", start: "03 Jun", end: "05 Jun", duration: "2 days", left: 2, width: 6, color: "green", progress: "100%", owner: "Maya", channel: "Concept", dueDate: "06/05", comments: 1, reference: "COCA-DEFINE", priority: "Low", tags: ["Concept", "Strategy"] },
  { wbs: "1.2", name: "Quick client approval", type: "Approval", stage: "Approved", start: "06 Jun", end: "07 Jun", duration: "1 day", left: 8, width: 4, color: "green", progress: "100%", owner: "Sofia", channel: "Concept", dueDate: "06/07", comments: 1, reference: "COCA-APPROVAL", priority: "Medium", tags: ["Concept", "Stakeholder"] },
  { wbs: "2", name: "Website", type: "Phase", stage: "In progress", start: "08 Jun", end: "18 Jun", duration: "10 days", left: 15, width: 26, color: "blue", progress: "55%", owner: "Arthur", channel: "Website", dueDate: "06/18", comments: 2, reference: "COCA-WEBSITE", priority: "High", tags: ["Website"] },
  { wbs: "2.1", name: "Design landing page", type: "Design", stage: "In progress", start: "08 Jun", end: "12 Jun", duration: "4 days", left: 15, width: 12, color: "blue", progress: "70%", owner: "Arthur", channel: "Website", dueDate: "06/12", comments: 3, reference: "COCA-WEB-DESIGN", priority: "High", tags: ["UX", "Figma", "Web"] },
  { wbs: "2.2", name: "Build page", type: "Build", stage: "In progress", start: "13 Jun", end: "18 Jun", duration: "5 days", left: 28, width: 13, color: "blue", progress: "35%", owner: "Arthur", channel: "Website", dueDate: "06/18", comments: 1, reference: "COCA-WEB-BUILD", priority: "High", tags: ["Webflow", "HTML"] },
  { wbs: "3", name: "Video", type: "Phase", stage: "Internal review", start: "16 Jun", end: "20 Jun", duration: "4 days", left: 39, width: 13, color: "cyan", progress: "30%", owner: "Daniel", channel: "Video", dueDate: "06/20", comments: 0, reference: "COCA-VIDEO" },
  { wbs: "3.1", name: "Edit 15s video", type: "Edit", stage: "Internal review", start: "16 Jun", end: "20 Jun", duration: "4 days", left: 39, width: 13, color: "cyan", progress: "30%", owner: "Daniel", channel: "Video", dueDate: "06/20", comments: 4, reference: "COCA-VIDEO-15", priority: "Medium", tags: ["Premiere", "Video"] },
  { wbs: "4", name: "3D Banner", type: "Phase", stage: "Queued", start: "18 Jun", end: "21 Jun", duration: "3 days", left: 53, width: 10, color: "gold", progress: "0%", owner: "Arthur", channel: "3D Banner", dueDate: "06/21", comments: 0, reference: "COCA-3D" },
  { wbs: "4.1", name: "Create 3D asset", type: "Design", stage: "Queued", start: "18 Jun", end: "21 Jun", duration: "3 days", left: 53, width: 10, color: "gold", progress: "0%", owner: "Arthur", channel: "3D Banner", dueDate: "06/21", comments: 2, reference: "COCA-3D-BANNER", priority: "High", tags: ["Photoshop", "3D", "After Effects"] },
  { wbs: "5", name: "Delivery", type: "Phase", stage: "Client approval", start: "22 Jun", end: "25 Jun", duration: "3 days", left: 68, width: 14, color: "green", progress: "0%", owner: "Rachel", channel: "Delivery", dueDate: "06/25", comments: 0, reference: "COCA-DEL" },
  { wbs: "5.1", name: "Final approval", type: "Approval", stage: "Client approval", start: "22 Jun", end: "24 Jun", duration: "2 days", left: 68, width: 8, color: "blue", progress: "", owner: "Rachel", channel: "Delivery", dueDate: "06/24", comments: 1, reference: "COCA-FINAL", priority: "High", tags: ["Review", "Stakeholder"] },
  { wbs: "5.2", name: "Deliver files", type: "Delivery", stage: "Ready for delivery", start: "25 Jun", end: "25 Jun", duration: "1 day", left: 78, width: 4, color: "green", progress: "", owner: "Rachel", channel: "Delivery", dueDate: "06/25", comments: 1, reference: "COCA-DELIVERY", priority: "Medium", tags: ["Export", "Handoff"] },
] as const;

export const projectWorkItems = projectTimelineRows.filter((item) => item.type !== "Phase");

export const resourceBookings = [
  { person: "Rachel", title: "Define idea", project: campaign.campaign, start: 0, span: 6, color: "#8f7be8" },
  { person: "Rachel", title: "Final approval", project: campaign.campaign, start: 16, span: 5, color: "#58b8e4" },
  { person: "Arthur", title: "Design landing page", project: campaign.campaign, start: 4, span: 8, color: "#56b9e5" },
  { person: "Arthur", title: "Create 3D asset", project: campaign.campaign, start: 12, span: 6, color: "#4c7bd9" },
  { person: "Daniel", title: "Edit 15s video", project: campaign.campaign, start: 10, span: 8, color: "#f4a94a" },
  { person: "Arthur", title: "Nike Autumn Refresh", project: "Nike Autumn Refresh", start: 18, span: 5, color: "#7c8aa5" },
  { person: "Rachel", title: "Spotify Q3 Review", project: "Spotify Q3 Review", start: 8, span: 4, color: "#6f7c94" },
] as const;

export const estimateTotals = campaign.estimate.reduce(
  (totals, item) => {
    const total = item.hours * item.rate;
    return {
      hours: totals.hours + item.hours,
      total: totals.total + total,
    };
  },
  { hours: 0, total: 0 },
);
