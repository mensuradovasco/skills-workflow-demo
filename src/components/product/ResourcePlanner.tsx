import { type CSSProperties, type DragEvent, type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faCalendarDays,
  faChevronLeft,
  faChevronRight,
  faEllipsis,
  faFilter,
  faFileImage,
  faGripVertical,
  faListCheck,
  faMagnifyingGlass,
  faPeopleArrows,
  faTableCells,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { campaign, projectWorkItems, resourceBookings } from "../../data/cocaColaCampaign";
import { ProofingContent } from "./ExecutionProofing";
import { WorkspaceFrame } from "./WorkspaceFrame";

type BacklogItem = {
  color: string;
  days: string;
  id: string;
  kind: string;
  title: string;
};

type ScheduledItem = {
  color: string;
  id: string;
  person: string;
  source: "existing" | "dropped";
  span: number;
  start: number;
  title: string;
};

type ResizeInteraction = {
  id: string;
  mode: "start" | "end";
  span: number;
  start: number;
  startX: number;
};

type ResourceSearchPhase = "idle" | "dropdown" | "typing" | "selected" | "dragging" | "assigned";

const calendarDays = ["25", "26", "27", "28", "29", "30", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];

const initialBacklog: BacklogItem[] = [
  { id: "landing-design", title: "Design landing page", kind: "Website task", days: "4d", color: "#68c39f" },
  { id: "landing-page", title: "Landing Page", kind: "Deliverable", days: "9d", color: "#56b9e5" },
  { id: "landing-build", title: "Build page", kind: "Website task", days: "5d", color: "#4c7bd9" },
  { id: "video", title: "15s Video", kind: "Deliverable", days: "4d", color: "#f4a94a" },
  { id: "banner", title: "3D Digital Banner", kind: "Deliverable", days: "3d", color: "#7aa66a" },
  { id: "delivery", title: "Delivery List", kind: "Document", days: "1d", color: "#70c44f" },
];

const extraResources = [
  {
    name: "Mia",
    role: "Motion Designer",
    load: 58,
    skill: "Motion",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Leo",
    role: "3D Artist",
    load: 71,
    skill: "3D",
    avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=96&q=80",
  },
];

const resourcePeople = [
  ...campaign.team,
  ...extraResources.filter((extra) => !campaign.team.some((member) => member.name === extra.name)),
];

const photoshopResourcePeople = [
  campaign.team.find((person) => person.name === "Arthur"),
  extraResources.find((person) => person.name === "Leo"),
  {
    name: "Ines",
    role: "Visual Designer",
    load: 42,
    skill: "Photoshop",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Clara",
    role: "Retoucher",
    load: 36,
    skill: "Photoshop",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Bruno",
    role: "Digital Designer",
    load: 51,
    skill: "Photoshop",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
  },
  campaign.team.find((person) => person.name === "Maya"),
].filter((person): person is (typeof resourcePeople)[number] => Boolean(person));

const leaveBookings = [
  { person: "Rachel", label: "Leave", start: 14, span: 3 },
  { person: "Arthur", label: "Leave", start: 20, span: 2 },
  { person: "Daniel", label: "Leave", start: 6, span: 2 },
  { person: "Maya", label: "Leave", start: 10, span: 3 },
  { person: "Leo", label: "Leave", start: 16, span: 4 },
  { person: "Clara", label: "Leave", start: 8, span: 2 },
];

const photoshopPeople = new Set(photoshopResourcePeople.map((person) => person.name));

function getInitialBacklog() {
  return initialBacklog.map((item) => {
    const match = projectWorkItems.find((task) => task.name === item.title);
    return match ? { ...item, days: match.duration } : item;
  });
}

function getInitialAssignments(): ScheduledItem[] {
  return resourceBookings.map((booking) => ({
    color: booking.color,
    id: `${booking.person}-${booking.title}-${booking.start}`,
    person: booking.person,
    source: "existing",
    span: booking.span,
    start: booking.start,
    title: booking.title,
  }));
}

export function ResourcePlanner() {
  const [openJob, setOpenJob] = useState<string | null>(null);
  const [backlog, setBacklog] = useState(getInitialBacklog);
  const [assignments, setAssignments] = useState<ScheduledItem[]>(getInitialAssignments);
  const [resizeInteraction, setResizeInteraction] = useState<ResizeInteraction | null>(null);
  const [resourceSearchPhase, setResourceSearchPhase] = useState<ResourceSearchPhase>("idle");
  const [resourceSearchText, setResourceSearchText] = useState("");
  const [draggingJob, setDraggingJob] = useState<BacklogItem | null>(null);
  const [dropOffset, setDropOffset] = useState<{ x: number; y: number } | null>(null);
  const ghostRef = useRef<HTMLSpanElement | null>(null);
  const rowsRef = useRef<HTMLDivElement | null>(null);
  const automationTimers = useRef<number[]>([]);

  useLayoutEffect(() => {
    if (resourceSearchPhase !== "dragging") {
      setDropOffset(null);
      return;
    }
    const ghost = ghostRef.current;
    const arthurTrack = rowsRef.current?.querySelector<HTMLDivElement>('[data-person="Arthur"] .allocation-track');
    if (!ghost || !arthurTrack) return;
    const dropStart = 13;
    const dropSpan = 4;
    const arthurAssignments = assignments.filter((item) => item.person === "Arthur");
    const probe = { start: dropStart, span: dropSpan, __probe: true };
    const stacked = stackBookings([...arthurAssignments, probe]);
    const placedBar = stacked.items.find((item) => (item as typeof probe).__probe);
    const stackIndex = placedBar?.stackIndex ?? 0;
    const ghostRect = ghost.getBoundingClientRect();
    const trackRect = arthurTrack.getBoundingClientRect();
    const targetX = trackRect.left + dropStart * 32;
    const targetY = trackRect.top + 13 + stackIndex * 28;
    setDropOffset({
      x: Math.round(targetX - ghostRect.left),
      y: Math.round(targetY - ghostRect.top),
    });
  }, [assignments, resourceSearchPhase]);

  const handleDrop = (event: DragEvent<HTMLDivElement>, person: string, start: number) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain");
    const item = backlog.find((entry) => entry.id === itemId);
    if (!item) return;
    setBacklog((items) => items.filter((entry) => entry.id !== itemId));
    setAssignments((items) => [
      ...items,
      {
        color: item.color,
        id: item.id,
        person,
        source: "dropped",
        span: 4,
        start,
        title: item.title,
      },
    ]);
  };

  const rowDepthFor = (person: string) => {
    return stackBookings(assignments.filter((item) => item.person === person)).depth;
  };

  const clearAutomationTimers = () => {
    automationTimers.current.forEach((timer) => window.clearTimeout(timer));
    automationTimers.current = [];
  };

  const resetSearchAutomation = () => {
    clearAutomationTimers();
    setResourceSearchPhase("idle");
    setResourceSearchText("");
    setDraggingJob(null);
    setBacklog(getInitialBacklog());
    setAssignments(getInitialAssignments());
  };

  const runSearchAutomation = () => {
    clearAutomationTimers();
    setOpenJob(null);
    setBacklog(getInitialBacklog());
    setAssignments(getInitialAssignments());
    setResourceSearchPhase("dropdown");
    setResourceSearchText("");
    setDraggingJob(null);

    const word = "photo";
    automationTimers.current.push(window.setTimeout(() => {
      setResourceSearchPhase("typing");
      word.split("").forEach((_, index) => {
        automationTimers.current.push(window.setTimeout(() => {
          setResourceSearchText(word.slice(0, index + 1));
        }, index * 86));
      });
    }, 360));

    automationTimers.current.push(window.setTimeout(() => {
      setResourceSearchPhase("selected");
    }, 960));

    automationTimers.current.push(window.setTimeout(() => {
      const nextJob = getInitialBacklog()[0];
      if (!nextJob) return;
      setDraggingJob(nextJob);
      setResourceSearchPhase("dragging");
    }, 1420));

    automationTimers.current.push(window.setTimeout(() => {
      const nextJob = getInitialBacklog()[0];
      if (!nextJob) return;

      setBacklog((items) => items.filter((item) => item.id !== nextJob.id));
      setAssignments((items) => [
        ...items,
        {
          color: nextJob.color,
          id: `auto-photoshop-${nextJob.id}`,
          person: "Arthur",
          source: "dropped",
          span: 4,
          start: 13,
          title: nextJob.title,
        },
      ]);
      setDraggingJob(null);
      setResourceSearchPhase("assigned");
    }, 2180));
  };

  const startResize = (event: MouseEvent<HTMLSpanElement>, item: ScheduledItem, mode: "start" | "end") => {
    event.preventDefault();
    event.stopPropagation();
    setResizeInteraction({
      id: item.id,
      mode,
      span: item.span,
      start: item.start,
      startX: event.clientX,
    });
  };

  useEffect(() => {
    if (!resizeInteraction) return;

    const handleMove = (event: globalThis.MouseEvent) => {
      const dayDelta = Math.round((event.clientX - resizeInteraction.startX) / 32);
      setAssignments((items) => items.map((item) => {
        if (item.id !== resizeInteraction.id) return item;

        if (resizeInteraction.mode === "start") {
          const nextStart = clamp(resizeInteraction.start + dayDelta, 0, resizeInteraction.start + resizeInteraction.span - 1);
          const nextSpan = clamp(resizeInteraction.span + (resizeInteraction.start - nextStart), 1, calendarDays.length - nextStart);
          return { ...item, start: nextStart, span: nextSpan };
        }

        const nextSpan = clamp(resizeInteraction.span + dayDelta, 1, calendarDays.length - resizeInteraction.start);
        return { ...item, span: nextSpan };
      }));
    };

    const handleUp = () => setResizeInteraction(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [resizeInteraction]);

  useEffect(() => {
    const handleGuidedStep = (event: Event) => {
      const stepId = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (stepId === "resource-proofing-track") {
        setOpenJob("Create 3D asset");
        return;
      }

      if (stepId === "resource-planning-view") {
        setOpenJob(null);
        resetSearchAutomation();
        return;
      }

      if (stepId === "resource-open-job") {
        setOpenJob(null);
      }
    };

    window.addEventListener("guided-demo-step-active", handleGuidedStep);
    return () => window.removeEventListener("guided-demo-step-active", handleGuidedStep);
  }, []);

  useEffect(() => () => clearAutomationTimers(), []);

  const openProofingJob = (item: ScheduledItem) => {
    if (item.title !== "Create 3D asset") return;
    setOpenJob(item.title);
  };

  return (
    <WorkspaceFrame
      accent="#63c7c0"
      icon={faPeopleArrows}
      subtitle="All"
      tabs={["ALLOCATION", "PEOPLE", "SKILLS", "CAPACITY", "HOURS"]}
      title="Resource Allocation"
    >
      <div className="allocation-document" data-tour-anchor="resource-planning">
        <div className="allocation-toolbar">
          <button><FontAwesomeIcon icon={faFilter} /> Auto</button>
          <label
            className={resourceSearchPhase !== "idle" ? "allocation-search active" : "allocation-search"}
            data-tour-anchor="resource-search"
            onClick={runSearchAutomation}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            {resourceSearchPhase === "selected" || resourceSearchPhase === "dragging" || resourceSearchPhase === "assigned" ? (
              <span className="allocation-skill-badge">Photoshop</span>
            ) : (
              <input placeholder="Search" readOnly value={resourceSearchText} />
            )}
            {(resourceSearchPhase === "dropdown" || resourceSearchPhase === "typing") && (
              <span className="allocation-skill-dropdown">
                <button type="button"><em>Department</em> Creative</button>
                <button className={resourceSearchPhase === "selected" || resourceSearchPhase === "dragging" || resourceSearchPhase === "assigned" ? "selected" : ""} type="button">
                  <em>Skill</em> Photoshop
                </button>
                <button type="button"><em>Skill</em> Photo retouching</button>
                <button type="button"><em>Role</em> Photographer</button>
              </span>
            )}
          </label>
          <div className="allocation-toolbar-icons">
            {[faTableCells, faArrowsRotate, faCalendarDays, faChevronLeft, faChevronRight].map((icon) => (
              <button key={icon.iconName}><FontAwesomeIcon icon={icon} /></button>
            ))}
          </div>
          <strong>24 Jun 2026</strong>
        </div>
        <div className="allocation-layout">
          <div className="allocation-main">
            <div className="allocation-grid-head">
              <span>Resources</span>
              <div className="allocation-months">
                <strong>Jun 2026</strong>
                <strong>Jul 2026</strong>
              </div>
              <div className="allocation-days">
                {calendarDays.map((day, index) => <span className={index === 13 ? "today" : ""} key={`${day}-${index}`}>{day}</span>)}
              </div>
            </div>
            <div className="allocation-rows" ref={rowsRef}>
              {(resourceSearchPhase === "selected" || resourceSearchPhase === "dragging" || resourceSearchPhase === "assigned"
                ? photoshopResourcePeople
                : resourcePeople
              ).map((person) => (
                <div
                  className={[
                    "allocation-row",
                    resourceSearchPhase === "selected" || resourceSearchPhase === "dragging" || resourceSearchPhase === "assigned" ? "filtered" : "",
                    photoshopPeople.has(person.name) ? "skill-match" : "",
                  ].filter(Boolean).join(" ")}
                  data-person={person.name}
                  key={person.name}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, person.name, 11)}
                  style={{ "--row-depth": rowDepthFor(person.name) } as CSSProperties}
                >
                  <div className="allocation-person">
                    <img className="avatar photo" src={person.avatar} alt="" />
                    <div>
                      <strong>{person.name}</strong>
                      <small>{person.role}</small>
                    </div>
                  </div>
                  <div className="allocation-track">
                    {calendarDays.map((day, index) => <span className="allocation-cell" key={`${person.name}-${day}-${index}`} />)}
                    {leaveBookings.filter((leave) => leave.person === person.name).map((leave) => (
                      <span
                        className="allocation-leave"
                        key={`${leave.person}-${leave.start}`}
                        style={{ "--bar-start": leave.start, "--bar-span": leave.span } as CSSProperties}
                      >
                        {leave.label}
                      </span>
                    ))}
                    {stackBookings(assignments.filter((item) => item.person === person.name)).items.map((item) => (
                      <span
                        className={item.source === "dropped" ? "allocation-bar dropped" : "allocation-bar"}
                        data-tour-anchor={item.title === "Create 3D asset" ? "resource-create-3d-asset" : undefined}
                        key={item.id}
                        onClick={() => openProofingJob(item)}
                        style={{ "--bar-color": item.color, "--bar-row": item.stackIndex, "--bar-start": item.start, "--bar-span": item.span } as CSSProperties}
                      >
                        <span
                          className="allocation-resize-handle start"
                          onClick={(event) => event.stopPropagation()}
                          onMouseDown={(event) => startResize(event, item, "start")}
                        />
                        {item.title}
                        <span
                          className="allocation-resize-handle end"
                          onClick={(event) => event.stopPropagation()}
                          onMouseDown={(event) => startResize(event, item, "end")}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="allocation-backlog">
            <h4>Unassigned work</h4>
            <p>Drag work onto available people while comparing agency workload, project conflicts, and leave.</p>
            {draggingJob && (
              <span
                className="allocation-drag-ghost"
                ref={ghostRef}
                style={{
                  "--item-color": draggingJob.color,
                  ...(dropOffset && { "--drop-x": `${dropOffset.x}px`, "--drop-y": `${dropOffset.y}px` }),
                } as CSSProperties}
              >
                {draggingJob.title}
              </span>
            )}
            {backlog.map((item) => (
              <article
                draggable
                className={draggingJob?.id === item.id ? "allocation-backlog-card is-dragging-source" : "allocation-backlog-card"}
                key={item.id}
                onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)}
                style={{ "--item-color": item.color } as CSSProperties}
              >
                <FontAwesomeIcon icon={faGripVertical} />
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.kind} / {item.days}</small>
                </div>
              </article>
            ))}
          </aside>
        </div>
      </div>
      {openJob && createPortal(
        <div className="resource-job-modal-backdrop" onMouseDown={() => setOpenJob(null)}>
          <section className="resource-job-modal" onMouseDown={(event) => event.stopPropagation()}>
            <header className="resource-job-header">
              <div className="resource-job-title">
                <span><FontAwesomeIcon icon={faListCheck} /></span>
                <div>
                  <strong>{openJob}</strong>
                  <small>
                    Skills Workflow <b>/</b> Coca-Cola - Summer Assets <b>/</b> Jobs <b>/</b> CC-JOB-003
                  </small>
                </div>
              </div>
              <div className="resource-job-actions">
                <button aria-label="More actions"><FontAwesomeIcon icon={faEllipsis} /></button>
                <button aria-label="Close job" onClick={() => setOpenJob(null)}><FontAwesomeIcon icon={faXmark} /></button>
              </div>
            </header>
            <nav className="resource-job-tabs">
              {["FEED", "INFO", "TASKS", "FILES", "PROOFING", "APPROVALS", "HISTORY"].map((tab) => (
                <button className={tab === "PROOFING" ? "active" : ""} key={tab}>{tab}</button>
              ))}
            </nav>
            <div className="resource-job-proofing" data-tour-anchor="resource-job-proofing">
              <ProofingContent />
            </div>
          </section>
        </div>,
        document.querySelector(".product-window") ?? document.body,
      )}
    </WorkspaceFrame>
  );
}

function stackBookings<T extends { start: number; span: number }>(bookings: T[]) {
  const lanes: number[] = [];
  const items = [...bookings]
    .sort((a, b) => a.start - b.start)
    .map((booking) => {
      const end = booking.start + booking.span;
      const laneIndex = lanes.findIndex((laneEnd) => booking.start >= laneEnd);
      const stackIndex = laneIndex === -1 ? lanes.length : laneIndex;
      lanes[stackIndex] = end;
      return { ...booking, stackIndex };
    });

  return { depth: Math.max(1, lanes.length), items };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
