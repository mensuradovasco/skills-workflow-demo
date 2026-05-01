import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBell,
  faBriefcase,
  faBug,
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
  faLightbulb,
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
import { ClientBrief } from "./components/product/ClientBrief";
import { ClientList } from "./components/product/ClientList";
import { ExecutionProofing } from "./components/product/ExecutionProofing";
import {
  AIDock,
  GUIDED_DEMO_STEP_KEY,
  GUIDED_DEMO_VERSION,
  GUIDED_DEMO_VERSION_KEY,
} from "./components/product/AIDock";
import { Profitability } from "./components/product/Profitability";
import { ProjectSetup } from "./components/product/ProjectSetup";
import { ResourcePlanner } from "./components/product/ResourcePlanner";
import { TaskBoard } from "./components/product/TaskBoard";
import { campaign, demoSteps, type DemoStep } from "./data/cocaColaCampaign";
import {
  firstGuidedIndexForStage,
  guidedDemoSteps,
  guidedStepStage,
  type GuidedDemoTarget,
} from "./data/guidedDemo";
import { stepDelay } from "./motion/transitions";

const stepDurations: Record<DemoStep, number> = {
  request: 5200,
  brief: 6800,
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
  const [navHistory, setNavHistory] = useState<DemoStep[]>([initialRoute.step]);

  useEffect(() => {
    setNavHistory((prev) => {
      if (prev[prev.length - 1] === activeStep) return prev;
      const filtered = prev.filter((s) => s !== activeStep);
      return [...filtered, activeStep].slice(-3);
    });
  }, [activeStep]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceView | null>(initialRoute.workspace);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isGuidedDemoActive, setIsGuidedDemoActive] = useState(() => readGuidedDemoPreference());
  const [guidedStepRequest, setGuidedStepRequest] = useState<number | null>(null);
  const [tourView, setTourView] = useState<TourView>(null);
  const [activeGuidedStepId, setActiveGuidedStepId] = useState<string | null>(null);

  useEffect(() => {
    const handleStep = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id ?? null;
      setActiveGuidedStepId(id);
    };
    window.addEventListener("guided-demo-step-active", handleStep);
    return () => window.removeEventListener("guided-demo-step-active", handleStep);
  }, []);

  const railActiveStep = useMemo<DemoStep>(() => {
    if (!activeGuidedStepId) return activeStep;
    const guidedStep = guidedDemoSteps.find((s) => s.id === activeGuidedStepId);
    return guidedStep ? guidedStepStage(guidedStep) : activeStep;
  }, [activeGuidedStepId, activeStep]);

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
    setActiveWorkspace(target.workspace ?? null);
    setTourView(target.view ?? null);
    setActiveStep(target.step);
  }, []);

  const handleManualNavigation = useCallback(() => {
    setGuidedDemoActive(false);
    setIsAutoPlaying(false);
    setTourView(null);
    setActiveGuidedStepId(null);
  }, [setGuidedDemoActive]);

  const isGuidedProxyClick = () => document.body.dataset.guidedClickProxy === "true";
  const startGuidedDemoFromRequest = useCallback(() => {
    window.localStorage.setItem(GUIDED_DEMO_VERSION_KEY, GUIDED_DEMO_VERSION);
    window.localStorage.setItem(GUIDED_DEMO_STEP_KEY, "1");
    setGuidedStepRequest(null);
    window.setTimeout(() => setGuidedStepRequest(1), 0);
    setGuidedDemoActive(true);
    setActiveWorkspace(null);
    setTourView(guidedDemoSteps[1]?.target.view ?? null);
    setActiveStep(guidedDemoSteps[1]?.target.step ?? "brief");
  }, [setGuidedDemoActive]);

  const jumpToGuidedStage = useCallback((step: DemoStep) => {
    const guidedIndex = firstGuidedIndexForStage(guidedDemoSteps, step);
    setIsAutoPlaying(false);

    if (guidedIndex == null) {
      setActiveWorkspace(null);
      setTourView(null);
      setActiveStep(step);
      return;
    }

    const target = guidedDemoSteps[guidedIndex].target;
    setGuidedStepRequest(null);
    window.setTimeout(() => setGuidedStepRequest(guidedIndex), 0);
    window.localStorage.setItem(GUIDED_DEMO_STEP_KEY, String(guidedIndex));
    setTourView(target.view ?? null);
    setActiveStep(target.step);
    setActiveWorkspace(target.workspace ?? null);
    setGuidedDemoActive(true);
  }, [setGuidedDemoActive]);

  return (
    <AppShell activeStep={railActiveStep} guidedActive={isGuidedDemoActive} onStepChange={jumpToGuidedStage}>
      <section className="demo-stage">
        <div className="product-window">
          <div className="skills-topbar">
            <div className="skills-logo">
              <img src="https://cdn.prod.website-files.com/689701f28dcfeea6454a8a48/69e8c8ea231a90b0dd55cfb8_logo-1-white%402x.png" alt="Skills Workflow" />
            </div>
            <div className="skills-breadcrumbs">
              {navHistory.map((step, idx, arr) => (
                <span key={`${step}-${idx}`}>
                  {idx === arr.length - 1 ? <strong>{crumbLabel(step)}</strong> : crumbLabel(step)}
                </span>
              ))}
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
                  if (!isGuidedProxyClick()) handleManualNavigation();
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
          <div className="product-shell">
            <div className="product-main">
              <div className={`skills-body ${bodyMode}`}>
                <aside className="app-rail" aria-label="Product navigation">
                  {railItems.map((item, index) => (
                    <button
                      aria-label={item.label}
                      className={index === activeRailIndex ? "active" : ""}
                      data-tour-anchor={
                        item.workspace === "resources"
                          ? "resources-sidebar-button"
                          : item.workspace === "profitability"
                            ? "profitability-sidebar-button"
                            : undefined
                      }
                      key={item.label}
                      onClick={() => {
                        if (!isGuidedProxyClick()) handleManualNavigation();
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
                      onStartGuidedDemoFromRequest={startGuidedDemoFromRequest}
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
            </div>
          </div>
        </div>
      </section>
      <AIDock
        active={isGuidedDemoActive}
        onActiveChange={setGuidedDemoActive}
        onNavigate={navigateForGuidedDemo}
        requestedStepIndex={guidedStepRequest}
        steps={guidedDemoSteps}
      />
    </AppShell>
  );
}

const taskImages = [
  "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=240&q=80",
];

const homeTasks = [
  ["Design landing page hero", "Coca-Cola Summer Assets", "Today"],
  ["Color grade hero shot", "Spotify Q3 Review", "1 day"],
  ["Build 3D digital banner", "Samsung Galaxy Launch", "2 days"],
  ["Storyboard product reveal", "L'Oreal Beauty Cutdown", "4 days"],
];

// RAG mapping for the My tasks badges. Today is the most urgent (red),
// upcoming due dates degrade through amber to green, and Done is calm green.
function taskDueTone(due: string): "red" | "amber" | "green" | "neutral" {
  const value = due.toLowerCase();
  if (value === "today" || value === "overdue") return "red";
  if (value.startsWith("1 ") || value.startsWith("2 ")) return "amber";
  if (value === "done" || value.match(/^\d+\s+days?$/)) return "green";
  return "neutral";
}

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

const homeCapacity = [
  {
    name: "Rachel",
    role: "Account Management",
    load: 62,
    color: "#f5b93f",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Arthur",
    role: "Design",
    load: 74,
    color: "#ed6b65",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Sofia",
    role: "Client Services",
    load: 45,
    color: "#63c7c0",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Maya",
    role: "Creative Direction",
    load: 58,
    color: "#7d69d8",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
  },
];

// Different teammates than the capacity panel — these are the people away
// this week, so the avatars don't repeat what's already in Team Capacity.
const homeVacations = [
  { name: "Liam", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=96&q=80" },
  { name: "Aiko", avatar: "https://images.unsplash.com/photo-1557555187-23d685287bc3?auto=format&fit=crop&w=96&q=80" },
  { name: "Marco", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=96&q=80" },
  { name: "Priya", avatar: "https://images.unsplash.com/photo-1521252659862-eec69941b071?auto=format&fit=crop&w=96&q=80" },
  { name: "Diego", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=96&q=80" },
];

const spotlightImages = [
  "https://images.unsplash.com/photo-1565962622954-efc7f367ea0e?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=420&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=420&q=80",
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

type AssistantMessage = {
  author: string;
  mine?: boolean;
  text: string;
  time: string;
};

const assistantMessages: AssistantMessage[] = [
  {
    author: "Skills AI Assistant",
    text: "I can answer questions, find conflicts, draft updates, create follow-up items, and help move work through the system.",
    time: "Now",
  },
  {
    author: "You",
    text: "Check resource conflicts for Coca-Cola - Summer Assets.",
    time: "Now",
    mine: true,
  },
  {
    author: "Skills AI Assistant",
    text: "Arthur overlaps with Nike Autumn Refresh after the 3D Banner task, and Rachel has Spotify review time during approvals. I can draft reassignments next.",
    time: "Now",
  },
];

const assistantQuickActions = [
  {
    icon: faBug,
    label: "Report a problem",
    prompt: "Report a problem with Coca-Cola - Summer Assets.",
  },
  {
    icon: faLightbulb,
    label: "Request a feature",
    prompt: "Request a feature for this workflow.",
  },
  {
    icon: faMagnifyingGlass,
    label: "Search job",
    prompt: "Search for the Coca-Cola Summer Assets job.",
  },
];

function AssistantPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState(assistantMessages);
  const [draft, setDraft] = useState("");

  const sendPrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const nextMessages: AssistantMessage[] = [
      ...messages,
      { author: "You", text: trimmed, time: "Now", mine: true },
      { author: "Skills AI Assistant", text: getAssistantReply(trimmed), time: "Now" },
    ];

    setMessages(nextMessages);
    setDraft("");
  };

  const sendMessage = () => {
    sendPrompt(draft);
  };

  return (
    <aside className="chat-drawer assistant-panel" aria-label="Assistant">
      <header className="chat-drawer-top">
        <button aria-label="Close assistant" onClick={onClose}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="chat-project-title">
          <span><FontAwesomeIcon icon={faComments} /></span>
          <div>
            <strong>Skills AI Assistant</strong>
            <small>How can I help you today</small>
          </div>
        </div>
        <button aria-label="More assistant actions">
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </header>
      <div className="chat-date">AI help across project, budget, tasks, resources, and delivery</div>
      <div className="assistant-quick-actions" aria-label="Assistant shortcuts">
        {assistantQuickActions.map((action) => (
          <button key={action.label} onClick={() => sendPrompt(action.prompt)} type="button">
            <span><FontAwesomeIcon icon={action.icon} /></span>
            <strong>{action.label}</strong>
          </button>
        ))}
      </div>
      <div className="chat-thread">
        {messages.map((message) => (
          <article className={message.mine ? "chat-message mine" : "chat-message"} key={`${message.author}-${message.time}-${message.text}`}>
            {!message.mine && <span className="assistant-avatar">AI</span>}
            <div>
              {!message.mine && <strong>{message.author}</strong>}
              <p>{message.text}</p>
              <small>{message.time}</small>
            </div>
          </article>
        ))}
      </div>
      <footer className="chat-composer">
        <input
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          placeholder="Ask the AI assistant to help in the workspace..."
          value={draft}
        />
        <button aria-label="Attach context"><FontAwesomeIcon icon={faPaperclip} /></button>
        <button aria-label="Send message" onClick={sendMessage}><FontAwesomeIcon icon={faPaperPlane} /></button>
        <button aria-label="Close assistant" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
      </footer>
    </aside>
  );
}

function getAssistantReply(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("resource") || lower.includes("conflict")) {
    return "Arthur overlaps with Nike Autumn Refresh after the 3D Banner task, and Rachel has Spotify review time during approvals. I can suggest reassignments or rebalance dates.";
  }

  if (lower.includes("problem") || lower.includes("bug")) {
    return "I can capture the issue, attach this project context, and route it to the right operations owner with the current screen and job details.";
  }

  if (lower.includes("feature")) {
    return "I can turn that into a feature request with the workflow area, expected outcome, and affected roles so product can review it cleanly.";
  }

  if (lower.includes("search") || lower.includes("job")) {
    return "I found Coca-Cola - Summer Assets. It includes the approved budget, project plan, task board, resource allocation, proofing, and profitability view.";
  }

  if (lower.includes("campaign") || lower.includes("project")) {
    return "I can help create a new campaign structure, duplicate this workflow, or prepare a project from an approved estimate.";
  }

  if (lower.includes("budget") || lower.includes("estimate")) {
    return "I can review the estimate, explain the line items, or help prepare the next approval step.";
  }

  return "I can help with project setup, tasks, resources, approvals, deliverables, and budget tracking inside this workspace.";
}

function StepContent({
  guidedMode,
  step,
  tourView,
  onNavigate,
  onStartGuidedDemoFromRequest,
}: {
  guidedMode: boolean;
  step: DemoStep;
  tourView: TourView;
  onNavigate: (step: DemoStep) => void;
  onStartGuidedDemoFromRequest: () => void;
}) {
  if (step === "request") {
    return (
      <div className="home-screen">
        <header className="document-header home-document-header">
          <div className="document-header-main">
            <div className="document-title">
              <span className="document-icon"><FontAwesomeIcon icon={faHouse} /></span>
              <strong>Home</strong>
            </div>
            <div className="document-actions">
              <button aria-label="More actions"><FontAwesomeIcon icon={faEllipsis} /></button>
            </div>
          </div>
        </header>
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
              <div
                className={`task-row fade-up${index === 0 ? " is-active" : ""}`}
                key={name}
                style={stepDelay(index * 80)}
              >
                <img className="task-thumb" src={taskImages[index]} alt="" />
                <div>
                  <strong>{name}</strong>
                  <small className="task-client">{client}</small>
                </div>
                <Badge tone={taskDueTone(due)}>{due}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="home-side">
          <div className="spotlight">
            <h4>Project Spotlight</h4>
            <p>Most recent and delayed</p>
            {[
              { name: "Coca-Cola summer assets", stage: "Under approval" },
              { name: "Nike hero refresh", stage: "In progress" },
              { name: "Samsung launch page", stage: "In progress" },
            ].map((project, index) => (
              <div className="spotlight-tile" key={project.name} data-stage={project.stage.toLowerCase().replace(/\s+/g, "-")}>
                <img src={spotlightImages[index]} alt="" />
                <span className="spotlight-stage">{project.stage}</span>
                <small>{project.name}</small>
              </div>
            ))}
          </div>
          <div className="team-week">
            <h4>Your team this week</h4>
            <div className="capacity-list">
              {homeCapacity.map((member) => (
                <div className="capacity-row" key={member.name}>
                  <img className="avatar photo" src={member.avatar} alt={member.name} />
                  <div className="capacity-copy">
                    <strong>{member.name}</strong>
                    <small>{member.role}</small>
                  </div>
                  <div className="capacity-meter" aria-label={`${member.name} capacity ${member.load}%`}>
                    <span style={{ width: `${member.load}%`, background: member.color }} />
                  </div>
                  <em>{member.load}%</em>
                </div>
              ))}
            </div>
            <div className="team-week-vacations" aria-label="On vacations">
              <span className="team-week-vacations-label">On vacations</span>
              <div className="team-week-vacations-list">
                {homeVacations.map((person) => (
                  <img className="avatar photo" src={person.avatar} alt={person.name} key={person.name} />
                ))}
              </div>
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
        {guidedMode && (
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
          </div>
        )}
      </div>
    );
  }

  if (step === "brief") {
    return (
      <div className="focused-screen brief-structuring-screen">
        <ClientBrief onGenerateBudget={() => onNavigate("budget")} />
      </div>
    );
  }

  if (step === "budget") {
    return (
      <div className="focused-screen budget-opening-screen">
        <BudgetBuilder
          estimateStatus={tourView === "approvedBudget" ? "approved" : "ready"}
          initialTab={tourView === "budgetFeed" ? "FEED" : undefined}
          onProjectNavigate={() => onNavigate("project")}
        />
      </div>
    );
  }

  if (step === "approval") {
    return (
      <div className="focused-screen approval-flow-screen clickable-panel">
        <BudgetBuilder
          estimateStatus="approved"
          onProjectNavigate={() => onNavigate("project")}
        />
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
                      : tourView === "resourceUtilization"
                        ? "RESOURCE UTILIZATION"
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
        <ResourcePlanner onProjectNavigate={() => onNavigate("project")} />
        {!guidedMode && (
          <HotspotButton
            className="top-right-action"
            icon="play"
            label="Approve & bill"
            onClick={() => onNavigate("proofing")}
            tooltip="Move the deliverables into final approval and billing."
          />
        )}
      </div>
    );
  }

  if (step === "execution" || step === "proofing") {
    return (
      <div className="clickable-panel">
        <ExecutionProofing />
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

function stageTitleShort(step: DemoStep) {
  const meta = demoSteps.find((item) => item.id === step);
  return meta?.label ?? "Workspace";
}

function crumbLabel(step: DemoStep): string {
  const labels: Record<DemoStep, string> = {
    request: "Home",
    brief: "Coca-Cola Summer Campaign Brief",
    budget: "Coca-Cola Summer Assets Budget",
    approval: "Coca-Cola Summer Assets Budget",
    project: "Coca-Cola - Summer Assets",
    tasks: "Coca-Cola - Summer Assets",
    resources: "Resource Allocation",
    execution: "Coca-Cola - Summer Assets",
    proofing: "3D Billboard – Create 3D asset",
    profitability: "Coca-Cola - Summer Assets",
  };
  return labels[step] ?? stageTitleShort(step);
}

function stageTitle(step: DemoStep) {
  const titles: Record<DemoStep, string> = {
    request: "Coca-Cola sends a summer asset request.",
    brief: "AI structures the request into a working brief.",
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
    brief:
      "Before pricing anything, the request becomes a clear brief with scope, deliverables, deadlines, and team ownership.",
    budget:
      "The structured brief now becomes a priced estimate, keeping understanding and costing in the right order.",
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
