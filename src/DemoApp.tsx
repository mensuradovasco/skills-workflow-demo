import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBell,
  faBriefcase,
  faCalculator,
  faChartPie,
  faCheck,
  faChevronLeft,
  faCircleQuestion,
  faClipboardList,
  faComments,
  faEllipsis,
  faFolderOpen,
  faHouse,
  faListCheck,
  faMagnifyingGlass,
  faPaperPlane,
  faPaperclip,
  faPeopleArrows,
  faPlay,
  faXmark,
  faUsers,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { AppShell } from "./components/layout/AppShell";
import { Badge } from "./components/ui/Badge";
import { Card } from "./components/ui/Card";
import {
  AgencyProfitabilityWorkspace,
  BudgetWorkspace,
  JobsWorkspace,
  ProjectsWorkspace,
  RequestsWorkspace,
  ResourcesWorkspace,
  TasksWorkspace,
} from "./components/product/AgencyWorkspaces";
import { BudgetBuilder } from "./components/product/BudgetBuilder";
import { ClientList } from "./components/product/ClientList";
import { ExecutionProofing } from "./components/product/ExecutionProofing";
import { Profitability } from "./components/product/Profitability";
import { ProjectSetup } from "./components/product/ProjectSetup";
import { ResourcePlanner } from "./components/product/ResourcePlanner";
import { TaskBoard } from "./components/product/TaskBoard";
import { campaign, demoSteps, type DemoStep } from "./data/cocaColaCampaign";
import { stepDelay } from "./motion/transitions";

const stepDurations: Record<DemoStep, number> = {
  request: 5200,
  budget: 5600,
  approval: 6800,
  project: 4400,
  tasks: 4800,
  resources: 5200,
  execution: 4200,
  proofing: 4200,
  profitability: 5600,
};

type WorkspaceView =
  | "clients"
  | "jobs"
  | "projects"
  | "requests"
  | "tasks"
  | "budget"
  | "resources"
  | "profitability";

const railItems: Array<{ icon: IconDefinition; label: string; workspace: WorkspaceView | "home" }> = [
  { icon: faHouse, label: "Home", workspace: "home" },
  { icon: faUsers, label: "Clients", workspace: "clients" },
  { icon: faBriefcase, label: "Jobs", workspace: "jobs" },
  { icon: faFolderOpen, label: "Projects", workspace: "projects" },
  { icon: faClipboardList, label: "Requests", workspace: "requests" },
  { icon: faListCheck, label: "Tasks", workspace: "tasks" },
  { icon: faCalculator, label: "Budget", workspace: "budget" },
  { icon: faPeopleArrows, label: "Resources", workspace: "resources" },
  { icon: faChartPie, label: "Profitability", workspace: "profitability" },
];

export function DemoApp() {
  const initialRoute = getInitialRoute();
  const [activeStep, setActiveStep] = useState<DemoStep>(initialRoute.step);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceView | null>(initialRoute.workspace);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const activeIndex = useMemo(
    () => demoSteps.findIndex((step) => step.id === activeStep),
    [activeStep],
  );
  const activeMeta = activeIndex >= 0 ? demoSteps[activeIndex] : { verb: "Manage" };
  const activeRailIndex = railIndexForWorkspace(activeWorkspace, activeStep);
  const bodyMode = activeWorkspace ? "workspace-mode" : activeStep === "request" ? "home-mode" : "document-mode";

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (activeIndex < 0) return;
    const timer = window.setTimeout(() => {
      const next = demoSteps[(activeIndex + 1) % demoSteps.length];
      setActiveStep(next.id);
    }, stepDurations[activeStep]);

    return () => window.clearTimeout(timer);
  }, [activeIndex, activeStep, isAutoPlaying]);

  return (
    <AppShell activeStep={activeStep} onStepChange={(step) => {
      setActiveWorkspace(null);
      setActiveStep(step);
    }}>
      <section className="demo-stage" key={`${activeStep}-${activeWorkspace ?? "flow"}`}>
        <div className="stage-copy">
          <div>
            <div className="stage-meta">
              <span className="eyebrow">{activeMeta.verb}</span>
              <span className="flow-step-pill">Step {activeIndex + 1} of {demoSteps.length}</span>
            </div>
            <h2>{stageTitle(activeStep)}</h2>
            <p>{stageDescription(activeStep)}</p>
          </div>
          <div className="stage-actions">
            <button className="ghost-button" onClick={() => {
              setActiveWorkspace(null);
              setIsAutoPlaying((value) => !value);
            }}>
              {isAutoPlaying ? "Pause flow" : "Play flow"}
            </button>
          </div>
        </div>
        <div className="product-window">
          <div className="skills-topbar">
            <div className="skills-logo">
              <img src="/assets/skills-logo-white.png" alt="Skills Workflow" />
            </div>
            <div className="topbar-tools">
              <button aria-label="Search"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
              <button aria-label="Help"><FontAwesomeIcon icon={faCircleQuestion} /></button>
              <button
                aria-label="Messages"
                className={isChatOpen ? "active" : ""}
                onClick={() => setIsChatOpen((value) => !value)}
              >
                <FontAwesomeIcon icon={faComments} />
              </button>
              <button
                className={activeStep === "request" ? "notification-trigger has-alert" : "notification-trigger"}
                aria-label="Alerts"
                onClick={() => {
                  setActiveWorkspace(null);
                  setActiveStep("request");
                  setIsAutoPlaying(false);
                }}
              >
                <FontAwesomeIcon icon={faBell} />
                {activeStep === "request" && <span>1</span>}
              </button>
              <strong>vasco.mensurado</strong>
            </div>
          </div>
          <div className={`skills-body ${bodyMode}`}>
            <aside className="app-rail" aria-label="Product navigation">
              {railItems.map((item, index) => (
                <button
                  aria-label={item.label}
                  className={index === activeRailIndex ? "active" : ""}
                  key={item.label}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    if (item.workspace === "home") {
                      setActiveWorkspace(null);
                      setActiveStep("request");
                      return;
                    }
                    setActiveWorkspace(item.workspace);
                  }}
                  title={item.label}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </button>
              ))}
            </aside>
          <div className="app-content">
              {activeWorkspace ? (
                <WorkspaceContent workspace={activeWorkspace} />
              ) : (
                <StepContent
                  step={activeStep}
                  onNavigate={(step) => {
                    setActiveWorkspace(null);
                    setActiveStep(step);
                  }}
                />
              )}
            </div>
          </div>
          {isChatOpen && <ChatDrawer onClose={() => setIsChatOpen(false)} />}
        </div>
      </section>
    </AppShell>
  );
}

const taskImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=120&q=80",
];

const homeTasks = [
  ["Summer Refresh Campaign", "Coca-Cola", "Overdue"],
  ["3D Billboard Adaptation", "Samsung", "1 day"],
  ["Digital Creative Launch", "Nike", "3 days"],
  ["Beauty Product Reveal", "L'Oreal", "4 days"],
  ["Retail Toolkit QA", "HP", "5 days"],
];

const homeMessages = [
  ["Sofia Martins", "Can we review the estimate before noon?"],
  ["Rachel Green", "Creative and production tasks are ready to assign."],
  ["Arthur Mendes", "KV v3 is uploaded for proofing."],
];

const chatMessages = [
  {
    author: "Sofia Martins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    text: "Can we include the retail poster system and 15s cutdowns in the first estimate?",
    time: "09:48",
  },
  {
    author: "Rachel Green",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
    text: "Yes. I am converting the request into a budget now and linking the scope to the project plan.",
    time: "09:52",
    mine: true,
  },
  {
    author: "Maya Chen",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
    text: "Creative territory and copy routes can start as soon as the estimate is approved.",
    time: "10:04",
  },
  {
    author: "Arthur Mendes",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
    text: "I will prepare the key visual frame and the OOH adaptation slots.",
    time: "10:07",
  },
  {
    author: "Rachel Green",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
    text: "Perfect. I will share the estimate for approval and then auto-create the delivery tasks.",
    time: "10:11",
    mine: true,
  },
];

const spotlightImages = [
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=420&q=80",
];

function WorkspaceContent({ workspace }: { workspace: WorkspaceView }) {
  if (workspace === "clients") return <ClientList />;
  if (workspace === "jobs") return <JobsWorkspace />;
  if (workspace === "projects") return <ProjectsWorkspace />;
  if (workspace === "requests") return <RequestsWorkspace />;
  if (workspace === "tasks") return <TasksWorkspace />;
  if (workspace === "budget") return <BudgetWorkspace />;
  if (workspace === "resources") return <ResourcesWorkspace />;
  return <AgencyProfitabilityWorkspace />;
}

function ChatDrawer({ onClose }: { onClose: () => void }) {
  return (
    <aside className="chat-drawer" aria-label="Messages">
      <header className="chat-drawer-top">
        <button aria-label="Close messages" onClick={onClose}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="chat-project-title">
          <span><img src="/assets/client-logos/coca-cola.svg" alt="" /></span>
          <div>
            <strong>Summer Refresh Campaign</strong>
            <small>Coca-Cola / Client Services</small>
          </div>
        </div>
        <button aria-label="More message actions">
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </header>
      <div className="chat-participants">
        {[campaign.team[0], campaign.team[1], campaign.team[2], campaign.team[3]].map((member) => (
          <img className="avatar photo" src={member.avatar} alt="" key={member.name} />
        ))}
        <span>+3</span>
      </div>
      <div className="chat-date">Today, 10:05</div>
      <div className="chat-thread">
        {chatMessages.map((message) => (
          <article className={message.mine ? "chat-message mine" : "chat-message"} key={`${message.author}-${message.time}`}>
            {!message.mine && <img className="avatar photo" src={message.avatar} alt="" />}
            <div>
              {!message.mine && <strong>{message.author}</strong>}
              <p>{message.text}</p>
              <small>{message.time}</small>
            </div>
          </article>
        ))}
      </div>
      <footer className="chat-composer">
        <input placeholder="Type your message here..." />
        <button aria-label="Attach file"><FontAwesomeIcon icon={faPaperclip} /></button>
        <button aria-label="Send message"><FontAwesomeIcon icon={faPaperPlane} /></button>
        <button aria-label="Close messages" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
      </footer>
    </aside>
  );
}

function StepContent({
  step,
  onNavigate,
}: {
  step: DemoStep;
  onNavigate: (step: DemoStep) => void;
}) {
  if (step === "request") {
    return (
      <div className="home-screen">
        <div className="home-top-strip">
          <span><FontAwesomeIcon icon={faHouse} /></span>
          <strong>Home</strong>
        </div>
        <div className="home-main">
          <div className="welcome-copy">
            <h3>Hi Rachel,</h3>
            <p>
              There are <strong>5 project updates</strong> and <em>12 tasks</em> planned for today.
              <br />
              Also 4 days until your holidays!
            </p>
          </div>
          <div className="mini-section">
            <h4>My tasks</h4>
            {homeTasks.map(([name, client, due], index) => (
              <div className="task-row fade-up" key={name} style={stepDelay(index * 80)}>
                <img className="task-thumb" src={taskImages[index]} alt="" />
                <div>
                  <strong>{name}</strong>
                  <small>{client}</small>
                </div>
                <Badge tone={due === "Overdue" ? "red" : "neutral"}>{due}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="home-side">
          <div className="spotlight">
            <h4>Project Spotlight</h4>
            <p>Most recent and delayed</p>
            {["Nike Fashion Week", "Samsung Billboard", "Coca-Cola Summer", "L'Oreal Reveal"].map((item, index) => (
              <div className="spotlight-tile" key={item}>
                <img src={spotlightImages[index]} alt="" />
                <small>{item}</small>
              </div>
            ))}
          </div>
          <div className="team-cloud">
            <h4>Team</h4>
            <div>
              {campaign.team.concat(campaign.team).map((member, index) => (
                <img className="avatar photo" src={member.avatar} alt="" key={`${member.name}-${index}`} />
              ))}
            </div>
          </div>
          <div className="vacations-panel">
            <h4>On vacations</h4>
            <div>
              {campaign.team.map((person) => (
                <img className="avatar photo" src={person.avatar} alt="" key={person.name} />
              ))}
            </div>
          </div>
          <div className="messages-panel">
            <h4>Messages</h4>
            {homeMessages.map(([sender, message], index) => (
              <div className="message-row" key={`${sender}-${message}`}>
                <img className="avatar photo" src={campaign.team[index].avatar} alt="" />
                <p><small>{sender}</small>{message}<br /><strong>Chat</strong></p>
              </div>
            ))}
          </div>
        </div>
        <div className="request-notification slide-in" style={stepDelay(520)}>
          <div className="brand-avatar client-logo-badge">
            <img src={campaign.clientLogo} alt={campaign.client} />
          </div>
          <div>
            <small>New client request</small>
            <strong>{campaign.client}</strong>
            <span>{campaign.campaign}</span>
            <em>Scope: social, video, retail and OOH</em>
          </div>
          <HotspotButton
            icon="magic"
            label="Create Budget"
            tooltip="Click the notification to generate the budget from the incoming request."
            onClick={() => onNavigate("budget")}
          />
        </div>
      </div>
    );
  }

  if (step === "budget") {
    return (
      <div className="focused-screen budget-opening-screen">
        <BudgetBuilder />
        <HotspotButton
          className="top-right-action budget-send-action"
          icon="send"
          label="Send"
          tooltip="Send the estimate for client approval."
          onClick={() => onNavigate("approval")}
        />
      </div>
    );
  }

  if (step === "approval") {
    return (
      <div className="focused-screen approval-flow-screen clickable-panel">
        <BudgetBuilder />
        <aside className="approval-status-panel">
          <span className="approval-check">
            <FontAwesomeIcon icon={faCheck} />
          </span>
          <div>
            <small>Client approved estimate</small>
            <h3>Budget approved</h3>
            <p>Coca Cola approved the estimate. Deliverables are now cleared for project creation.</p>
          </div>
          <div className="approval-deliverables">
            {campaign.request.deliverables.map((item, index) => (
              <div className="approval-deliverable" key={item} style={stepDelay(index * 140 + 180)}>
                <span>
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <strong>{item}</strong>
                <em>Approved</em>
              </div>
            ))}
          </div>
          <div className="approval-project-handoff">
            <strong>Next: create project</strong>
            <span>Budget, scope, dates and deliverables will move into the project workspace.</span>
          </div>
        </aside>
        <HotspotButton
          className="top-right-action approval-next-action"
          icon="magic"
          label="Project"
          tooltip="The budget is approved. Go to the project screen."
          onClick={() => onNavigate("project")}
        />
      </div>
    );
  }

  if (step === "project") {
    return (
      <div className="clickable-panel">
        <ProjectSetup />
        <HotspotButton
          className="top-right-action"
          icon="check"
          label="Tasks"
          tooltip="Open the tasks automatically created from the budget."
          onClick={() => onNavigate("tasks")}
        />
      </div>
    );
  }

  if (step === "tasks") {
    return (
      <div className="clickable-panel">
        <TaskBoard />
        <HotspotButton
          className="top-right-action"
          label="Plan"
          tooltip="Move to resource planning and assign the right people."
          onClick={() => onNavigate("resources")}
        />
      </div>
    );
  }

  if (step === "resources") {
    return (
      <div className="clickable-panel">
        <ResourcePlanner />
        <HotspotButton
          className="top-right-action"
          icon="play"
          label="Start"
          tooltip="Start execution once the team has capacity."
          onClick={() => onNavigate("execution")}
        />
      </div>
    );
  }

  if (step === "execution") {
    return (
      <div className="clickable-panel">
        <ExecutionProofing />
        <HotspotButton
          className="top-right-action"
          label="Review"
          tooltip="Open the approval/proofing step."
          onClick={() => onNavigate("proofing")}
        />
      </div>
    );
  }

  if (step === "proofing") {
    return (
      <div className="clickable-panel">
        <ExecutionProofing />
        <HotspotButton
          className="top-right-action"
          label="Track"
          tooltip="Move to profitability and plan-vs-actual tracking."
          onClick={() => onNavigate("profitability")}
        />
      </div>
    );
  }

  return <Profitability />;
}

function HotspotButton({
  className = "",
  icon,
  label,
  tooltip,
  onClick,
}: {
  className?: string;
  icon?: "send" | "magic" | "check" | "play";
  label: string;
  tooltip: string;
  onClick: () => void;
}) {
  const iconMap = {
    send: faPaperPlane,
    magic: faWandMagicSparkles,
    check: faCheck,
    play: faPlay,
  };

  return (
    <button className={`hotspot-zone ${className}`} onClick={onClick}>
      <span className="hotspot-action-label">
        {icon && <FontAwesomeIcon icon={iconMap[icon]} />}
        {label}
      </span>
      <span className="hotspot-tooltip">{tooltip}</span>
    </button>
  );
}

function stageTitle(step: DemoStep) {
  const titles: Record<DemoStep, string> = {
    request: "A new client request arrives.",
    budget: "The estimate builds itself from scope.",
    approval: "Approval turns the budget into action.",
    project: "The project setup is automatic.",
    tasks: "The workflow is ready before kickoff.",
    resources: "Capacity and skills guide assignments.",
    execution: "Work moves forward with time captured.",
    proofing: "Creative review stays inside the workflow.",
    profitability: "Profitability updates as the project runs.",
  };
  return titles[step];
}

function stageDescription(step: DemoStep) {
  const descriptions: Record<DemoStep, string> = {
    request:
      "Start on a realistic homepage view. The request appears as an overlay, like the Figma demo reference.",
    budget:
      "Services, roles, hours, costs, and margin appear progressively so the value creation is obvious.",
    approval:
      "The commercial decision becomes the trigger for delivery, keeping finance and project setup connected.",
    project:
      "A clean project workspace appears with the budget, timeline, task template, and team already linked.",
    tasks:
      "Tasks come from the approved scope and follow agency delivery stages.",
    resources:
      "The demo highlights skill matching and workload visibility instead of manual resource hunting.",
    execution:
      "Moving work through the board updates status and keeps time tracking close to the task.",
    proofing:
      "Asset review feels connected to delivery, not like a separate client feedback island.",
    profitability:
      "The close lands on the business outcome: plan vs actual hours, margin, billing, and forecast clarity.",
  };
  return descriptions[step];
}

function railIndexForWorkspace(workspace: WorkspaceView | null, step: DemoStep) {
  if (!workspace) return step === "request" ? 0 : -1;

  const indexes: Record<WorkspaceView, number> = {
    clients: 1,
    jobs: 2,
    projects: 3,
    requests: 4,
    tasks: 5,
    budget: 6,
    resources: 7,
    profitability: 8,
  };
  return indexes[workspace];
}

function getInitialRoute(): { step: DemoStep; workspace: WorkspaceView | null } {
  if (typeof window === "undefined") return { step: "request", workspace: null };

  const params = new URLSearchParams(window.location.search);
  const step = params.get("step");
  const workspace = params.get("workspace");
  const validStep = demoSteps.some((item) => item.id === step) ? step as DemoStep : "request";
  const validWorkspaces: WorkspaceView[] = ["clients", "jobs", "projects", "requests", "tasks", "budget", "resources", "profitability"];
  const validWorkspace = validWorkspaces.includes(workspace as WorkspaceView) ? workspace as WorkspaceView : null;

  return {
    step: validWorkspace ? "request" : validStep,
    workspace: validWorkspace,
  };
}
