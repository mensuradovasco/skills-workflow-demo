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
  client: "Coca-Cola",
  campaign: "Summer Refresh Campaign",
  brandMark: "CC",
  clientLogo: "/assets/client-logos/coca-cola.svg",
  request: {
    receivedFrom: "Sofia Martins, Brand Director",
    objective:
      "Launch a summer refresh campaign across paid social, retail, outdoor, and short-form video.",
    budgetRange: "GBP 85k-120k",
    dueDate: "25 Jun 2026",
    channels: ["Social", "OOH", "Retail", "Video"],
    deliverables: [
      "Campaign key visual",
      "Paid social toolkit",
      "Retail poster system",
      "15s motion cutdowns",
    ],
  },
  estimate: [
    {
      service: "Strategy",
      role: "Account Director",
      hours: 18,
      rate: 160,
      margin: 42,
    },
    {
      service: "Creative",
      role: "Copywriter",
      hours: 42,
      rate: 120,
      margin: 38,
    },
    {
      service: "Design",
      role: "Senior Designer",
      hours: 56,
      rate: 130,
      margin: 41,
    },
    {
      service: "Motion",
      role: "Motion Designer",
      hours: 38,
      rate: 140,
      margin: 36,
    },
    {
      service: "Production",
      role: "Producer",
      hours: 24,
      rate: 150,
      margin: 33,
    },
  ],
  team: [
    {
      name: "Rachel",
      role: "Producer",
      load: 62,
      skill: "Campaign ops",
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
      name: "Maya",
      role: "Copywriter",
      load: 51,
      skill: "Social",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Daniel",
      role: "Motion",
      load: 68,
      skill: "After Effects",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80",
    },
  ],
  tasks: [
    { title: "Validate scope and assumptions", stage: "Ready", owner: "Rachel", eta: "Today" },
    { title: "Prepare client estimate", stage: "Ready", owner: "Rachel", eta: "Today" },
    { title: "Creative territory and copy routes", stage: "In progress", owner: "Maya", eta: "2 days" },
    { title: "Key visual and retail poster design", stage: "In progress", owner: "Arthur", eta: "4 days" },
    { title: "15s motion cutdowns", stage: "Queued", owner: "Daniel", eta: "6 days" },
    { title: "Client proofing and final approval", stage: "Queued", owner: "Rachel", eta: "8 days" },
  ],
  proof: {
    asset: "Summer Refresh KV v3",
    comment: "Can we make the product bottle more visible in the retail version?",
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
