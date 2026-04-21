import { useCallback, useEffect, useMemo, useState } from "react";
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
import { GUIDED_DEMO_VERSION, GuidedWalkthrough } from "./components/product/GuidedWalkthrough";
import { Profitability } from "./components/product/Profitability";
import { ProjectSetup } from "./components/product/ProjectSetup";
import { ResourcePlanner } from "./components/product/ResourcePlanner";
import { TaskBoard } from "./components/product/TaskBoard";
import { campaign, demoSteps, type DemoStep } from "./data/cocaColaCampaign";
import { guidedDemoSteps, type GuidedDemoTarget } from "./data/guidedDemo";
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

type TourView = GuidedDemoTarget["view"] | null;

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
  const [isGuidedDemoActive, setIsGuidedDemoActive] = useState(() => readGuidedDemoPreference());
  const [restartGuidedDemo, setRestartGuidedDemo] = useState<(() => void) | null>(null);
  const [tourView, setTourView] = useState<TourView>(null);

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

  const setGuidedDemoActive = useCallback((active: boolean) => {
    setIsGuidedDemoActive(active);
    window.localStorage.setItem("skills-workflow-guided-demo-active", active ? "true" : "false");
  }, []);

  const navigateForGuidedDemo = useCallback((target: GuidedDemoTarget) => {
    setIsAutoPlaying(false);
    setIsChatOpen(false);
    setActiveWorkspace(null);
    setTourView(target.view ?? null);
    setActiveStep(target.step);
  }, []);

  const handleManualNavigation = useCallback(() => {
    setGuidedDemoActive(false);
    setIsAutoPlaying(false);
    setTourView(null);
  }, [setGuidedDemoActive]);

  return (
    <AppShell activeStep={activeStep} onStepChange={(step) => {
      setActiveWorkspace(null);
      setTourView(null);
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
              if (isGuidedDemoActive) {
                setGuidedDemoActive(false);
                return;
              }
              restartGuidedDemo?.();
            }}>
              {isGuidedDemoActive ? "Exit guided demo" : "Start guided demo"}
            </button>
            <button className="ghost-button" onClick={() => {
              setActiveWorkspace(null);
              setTourView(null);
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
                  handleManualNavigation();
                  setActiveWorkspace(null);
                  setActiveStep("request");
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
                  data-tour-anchor={item.workspace === "resources" ? "resources-sidebar-button" : undefined}
                  key={item.label}
                  onClick={() => {
                    handleManualNavigation();
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
                  guidedMode={isGuidedDemoActive}
                  tourView={tourView}
                  onNavigate={(step) => {
                    setActiveWorkspace(null);
                    setTourView(null);
                    setActiveStep(step);
                  }}
                />
              )}
            </div>
          </div>
          {isChatOpen && <ChatDrawer onClose={() => setIsChatOpen(false)} />}
          <GuidedWalkthrough
            active={isGuidedDemoActive}
            onActiveChange={setGuidedDemoActive}
            onNavigate={navigateForGuidedDemo}
            onRestartReady={(restart) => setRestartGuidedDemo(() => restart)}
            steps={guidedDemoSteps}
          />
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
  ["Coca-Cola - Summer Assets", "Coca-Cola", "Today"],
  ["Define idea", "Coca-Cola", "Done"],
  ["Design landing page", "Coca-Cola", "2 days"],
  ["Edit 15s video", "Coca-Cola", "4 days"],
  ["Create 3D asset", "Coca-Cola", "5 days"],
];

const homeMessages = [
  ["Sofia Martins", "Can we review the €15,000 estimate before noon?"],
  ["Rachel Green", "The project plan is linked to the approved estimate."],
  ["Arthur Mendes", "Landing page and 3D banner tasks are ready."],
];

const chatMessages = [
  {
    author: "Sofia Martins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    text: "Can we include the landing page, 15s video and 3D banner in one estimate?",
    time: "09:48",
  },
  {
    author: "Rachel Green",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
    text: "Yes. I am converting the request into a €15,000 estimate and linking the scope to the project plan.",
    time: "09:52",
    mine: true,
  },
  {
    author: "Daniel Brooks",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
    text: "The 15s edit can start as soon as the estimate is approved.",
    time: "10:04",
  },
  {
    author: "Arthur Mendes",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
    text: "I will prepare the landing page design and 3D banner asset.",
    time: "10:07",
  },
  {
    author: "Rachel Green",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
    text: "Perfect. I will share the estimate for approval and then create the phase tasks.",
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
            <strong>{campaign.campaign}</strong>
            <small>Coca-Cola / Client Services</small>
          </div>
        </div>
        <button aria-label="More message actions">
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </header>
      <div className="chat-participants">
        {campaign.team.map((member) => (
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
  guidedMode,
  step,
  tourView,
  onNavigate,
}: {
  guidedMode: boolean;
  step: DemoStep;
  tourView: TourView;
  onNavigate: (step: DemoStep) => void;
}) {
  if (step === "request") {
    return (
      <div className="home-screen">
        <div className="home-top-strip">
          <span><FontAwesomeIcon icon={faHouse} /></span>
          <strong>{campaign.organization}</strong>
        </div>
        <div className="home-main">
          <div className="welcome-copy">
            <h3>Hi Rachel,</h3>
            <p>
              There are <strong>5 project updates</strong> and <em>8 tasks</em> planned for today.
              <br />
              Coca-Cola - Summer Assets is ready to move from estimate to delivery.
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
            {["Coca-Cola Summer Assets", "Estimate approved", "Landing page", "Delivery list"].map((item, index) => (
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
        <div className="request-notification slide-in" data-tour-anchor="client-request" style={stepDelay(520)}>
          <div className="brand-avatar client-logo-badge">
            <img src={campaign.clientLogo} alt={campaign.client} />
          </div>
          <div>
            <small>New client request</small>
            <strong>{campaign.client}</strong>
            <span>{campaign.campaign}</span>
            <em>Scope: website, 15s video and 3D banner</em>
          </div>
          {!guidedMode && (
            <HotspotButton
              icon="magic"
              label="Create Budget"
              tooltip="Click the notification to generate the budget from the incoming request."
              onClick={() => onNavigate("budget")}
            />
          )}
        </div>
      </div>
    );
  }

  if (step === "budget") {
    return (
      <div className="focused-screen budget-opening-screen">
        <BudgetBuilder initialTab={tourView === "budgetFeed" ? "FEED" : undefined} />
        {!guidedMode && (
          <HotspotButton
            className="top-right-action budget-send-action"
            icon="send"
            label="Send"
            tooltip="Send the estimate for client approval."
            onClick={() => onNavigate("approval")}
          />
        )}
      </div>
    );
  }

  if (step === "approval") {
    return (
      <div className="focused-screen approval-flow-screen clickable-panel">
        <BudgetBuilder
          feedStageActionLabel="Request changes"
          feedStageLabel="Approve by Client"
          initialTab={tourView === "budgetFeed" ? "FEED" : undefined}
        />
        <aside className="approval-status-panel">
          <span className="approval-check">
            <FontAwesomeIcon icon={faCheck} />
          </span>
          <div>
            <small>Client approved estimate</small>
            <h3>Budget approved</h3>
            <p>Coca-Cola approved the €15,000 estimate. Deliverables are now cleared for project creation.</p>
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
          <div className="approval-project-handoff" data-tour-anchor="approval-project">
            <strong>Next: create project</strong>
            <span>Budget, scope, dates and deliverables will move into the project workspace.</span>
          </div>
        </aside>
        {!guidedMode && (
          <HotspotButton
            className="top-right-action approval-next-action"
            icon="magic"
            label="Project"
            onClick={() => onNavigate("project")}
            tooltip="The budget is approved. Go to the project screen."
          />
        )}
      </div>
    );
  }

  if (step === "project") {
    return (
      <div className="clickable-panel">
        <div data-tour-anchor="project-overview">
          <ProjectSetup
            initialTab={
              tourView === "documents"
                ? "FEED"
                : tourView === "gantt"
                  ? "GANTT"
                  : tourView === "kanban"
                    ? "KANBAN"
                    : tourView === "calendar"
                      ? "CALENDAR"
                      : tourView === "jobs"
                        ? "KANBAN BY PERSON"
                        : undefined
            }
          />
        </div>
        {!guidedMode && (
          <HotspotButton
            className="top-right-action"
            icon="check"
            label="Tasks"
            onClick={() => onNavigate("tasks")}
            tooltip="Open the tasks automatically created from the budget."
          />
        )}
      </div>
    );
  }

  if (step === "tasks") {
    return (
      <div className="clickable-panel">
        <div data-tour-anchor="phase-tasks">
          <TaskBoard />
        </div>
        {!guidedMode && (
          <HotspotButton
            className="top-right-action"
            label="Plan"
            onClick={() => onNavigate("resources")}
            tooltip="Move to resource planning and assign the right people."
          />
        )}
      </div>
    );
  }

  if (step === "resources") {
    return (
      <div className="clickable-panel">
        <ResourcePlanner />
        {!guidedMode && (
          <HotspotButton
            className="top-right-action"
            icon="play"
            label="Start"
            onClick={() => onNavigate("execution")}
            tooltip="Start execution once the team has capacity."
          />
        )}
      </div>
    );
  }

  if (step === "execution") {
    return (
      <div className="clickable-panel">
        <ExecutionProofing />
        {!guidedMode && (
          <HotspotButton
            className="top-right-action"
            label="Review"
            onClick={() => onNavigate("proofing")}
            tooltip="Open the approval/proofing step."
          />
        )}
      </div>
    );
  }

  if (step === "proofing") {
    return (
      <div className="clickable-panel">
        <ExecutionProofing />
        {!guidedMode && (
          <HotspotButton
            className="top-right-action"
            label="Track"
            onClick={() => onNavigate("profitability")}
            tooltip="Move to profitability and plan-vs-actual tracking."
          />
        )}
      </div>
    );
  }

  return <Profitability />;
}

function HotspotButton({
  className = "",
  icon,
  label,
  onClick,
  tooltip,
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
    request: "Coca-Cola sends a summer asset request.",
    budget: "The €15,000 estimate builds from scope.",
    approval: "Approval turns the budget into action.",
    project: "The project workspace carries the same story.",
    tasks: "The five phases become clear tasks.",
    resources: "Capacity and skills guide assignments.",
    execution: "Work moves forward with time captured.",
    proofing: "Creative review stays inside the workflow.",
    profitability: "Budget tracking stays connected to delivery.",
  };
  return titles[step];
}

function stageDescription(step: DemoStep) {
  const descriptions: Record<DemoStep, string> = {
    request:
      "Start in the Coca-Cola workspace. The request appears as the first operational signal.",
    budget:
      "Concept, website, video, 3D banner, and project management roll into one approved estimate.",
    approval:
      "The commercial decision becomes the trigger for delivery, keeping finance and project setup connected.",
    project:
      "A clean project workspace appears with the brief, budget, documents, timeline, and team already linked.",
    tasks:
      "Tasks follow Concept, Website, Video, 3D Banner, and Delivery.",
    resources:
      "The demo highlights skill matching and workload visibility instead of manual resource hunting.",
    execution:
      "Moving work through the board keeps status, assets, and approvals close to the task.",
    proofing:
      "Asset review feels connected to delivery, not like a separate client feedback island.",
    profitability:
      "The close lands on the business outcome: approved budget, planned work, billing, and delivery readiness.",
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

function readGuidedDemoPreference() {
  if (typeof window === "undefined") return true;
  if (window.localStorage.getItem("skills-workflow-guided-demo-version") !== GUIDED_DEMO_VERSION) return true;
  return window.localStorage.getItem("skills-workflow-guided-demo-active") !== "false";
}
