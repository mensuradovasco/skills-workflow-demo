export type DemoStep =
  | "request"
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
