import { type CSSProperties, type DragEvent, type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faBookmark,
  faCalendarDays,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faDownload,
  faEllipsis,
  faExpand,
  faFilter,
  faFileImage,
  faFolder,
  faGripVertical,
  faListCheck,
  faMagnifyingGlass,
  faPen,
  faPeopleArrows,
  faTableCells,
  faTag,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { campaign, projectWorkItems, resourceBookings } from "../../data/cocaColaCampaign";
import { FeedDocumentView, tagTone } from "./DocumentFrame";
import { ProofingContent } from "./ExecutionProofing";
import { WorkspaceFrame } from "./WorkspaceFrame";

const BILLBOARD_IMAGE = "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=900&q=80";
const BILLBOARD_TAGS = ["3D", "billboard", "Coca-Cola"];
const FINAL_PROOF_COMMENT_MS = 1500;
const APPROVE_AT_MS = 1500;
const CLOSE_PREVIEW_AT_MS = 2700;

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

type ResourceSearchPhase = "idle" | "dropdown" | "typing" | "selected" | "dragging" | "assigned" | "clearing";

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

const leaveBookings = [
  { person: "Rachel", label: "Leave", start: 14, span: 3 },
  { person: "Arthur", label: "Leave", start: 20, span: 2 },
  { person: "Daniel", label: "Leave", start: 6, span: 2 },
  { person: "Maya", label: "Leave", start: 10, span: 3 },
  { person: "Leo", label: "Leave", start: 16, span: 4 },
  { person: "Clara", label: "Leave", start: 8, span: 2 },
];

const photoshopPeople = new Set(["Arthur", "Leo", "Maya"]);

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

type ResourcePlannerProps = {
  onProjectNavigate?: () => void;
};

export function ResourcePlanner({ onProjectNavigate }: ResourcePlannerProps) {
  const [openJob, setOpenJob] = useState<string | null>(null);
  const [autoApproveProof, setAutoApproveProof] = useState(false);
  const [modalTab, setModalTab] = useState<"FEED" | "PROOFING">("FEED");
  const [annotationOpen, setAnnotationOpen] = useState(false);
  const [annotationClosing, setAnnotationClosing] = useState(false);
  const [annotationStage, setAnnotationStage] = useState<"review" | "billing">("review");
  const [proofAnimationPhase, setProofAnimationPhase] = useState<"preview" | "comments">("preview");
  const [taskAnimating, setTaskAnimating] = useState(false);
  const [thumbnailClicking, setThumbnailClicking] = useState(false);
  const [backlog, setBacklog] = useState(getInitialBacklog);
  const [assignments, setAssignments] = useState<ScheduledItem[]>(getInitialAssignments);
  const [resizeInteraction, setResizeInteraction] = useState<ResizeInteraction | null>(null);
  const [resourceSearchPhase, setResourceSearchPhase] = useState<ResourceSearchPhase>("idle");
  const [resourceSearchText, setResourceSearchText] = useState("");
  const [resourceResultsVisible, setResourceResultsVisible] = useState(false);
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
    setResourceResultsVisible(false);
    setDraggingJob(null);
    setBacklog(getInitialBacklog());
    setAssignments(getInitialAssignments());
  };

  const closeAnnotationAnimated = () => {
    setAnnotationClosing(true);
    const unmountTimer = window.setTimeout(() => {
      setAnnotationOpen(false);
      setAnnotationClosing(false);
    }, 360);
    automationTimers.current.push(unmountTimer);
  };

  const stopResourceAnimation = () => {
    clearAutomationTimers();
    setResourceSearchPhase("idle");
    setResourceSearchText("");
    setResourceResultsVisible(false);
    setDraggingJob(null);
    setTaskAnimating(false);
    setProofAnimationPhase("preview");
    setThumbnailClicking(false);
    setAnnotationClosing(false);
  };

  const runGuidedThumbnailOpen = () => {
    // Play just the thumbnail click visual; the annotation modal opens in
    // the next guided step so the first comment appears right after the click,
    // matching the manual thumbnail click timing.
    const clickTimer = window.setTimeout(() => setThumbnailClicking(true), 520);
    const releaseTimer = window.setTimeout(() => setThumbnailClicking(false), 1000);
    automationTimers.current.push(clickTimer, releaseTimer);
  };

  const runSearchAutomation = () => {
    clearAutomationTimers();
    setOpenJob(null);
    setBacklog(getInitialBacklog());
    setAssignments(getInitialAssignments());
    setResourceSearchPhase("dropdown");
    setResourceSearchText("");
    setResourceResultsVisible(false);
    setDraggingJob(null);

    const word = "photoshop";
    automationTimers.current.push(window.setTimeout(() => {
      setResourceSearchPhase("typing");
      word.split("").forEach((_, index) => {
        automationTimers.current.push(window.setTimeout(() => {
          setResourceSearchText(word.slice(0, index + 1));
        }, index * 86));
      });
    }, 360));

    automationTimers.current.push(window.setTimeout(() => {
      setResourceResultsVisible(true);
      setResourceSearchPhase("selected");
    }, 1260));

    automationTimers.current.push(window.setTimeout(() => {
      const nextJob = getInitialBacklog()[0];
      if (!nextJob) return;
      setDraggingJob(nextJob);
      setResourceSearchPhase("dragging");
    }, 1720));

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
    }, 2480));
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
      if (stepId === "resource-open-job") {
        stopResourceAnimation();
        setOpenJob(null);
        setModalTab("FEED");
        setAnnotationOpen(false);
        setAnnotationStage("review");
        setTaskAnimating(false);
        setThumbnailClicking(false);
        setAutoApproveProof(false);
        return;
      }

      if (stepId === "client-side-review") {
        stopResourceAnimation();
        setOpenJob("Create 3D asset");
        setModalTab("FEED");
        setAnnotationOpen(false);
        setAnnotationStage("review");
        setProofAnimationPhase("preview");
        setTaskAnimating(false);
        setThumbnailClicking(false);
        setAutoApproveProof(false);
        runGuidedThumbnailOpen();
        return;
      }

      if (stepId === "annotate-asset") {
        stopResourceAnimation();
        setOpenJob("Create 3D asset");
        setModalTab("FEED");
        setAnnotationOpen(true);
        setAnnotationStage("review");
        // Reset to "preview" first so conditionally-rendered comments/pins
        // unmount, then flip to "comments" on the next frame so they remount
        // fresh and CSS animations replay from t=0.
        setProofAnimationPhase("preview");
        setTaskAnimating(false);
        setThumbnailClicking(false);
        const phaseTimer = window.setTimeout(() => {
          setProofAnimationPhase("comments");
          // Schedule the approve flip from the SAME moment the comments mount,
          // so comment 2 / pin 2 / Client annotation / approve pulse all hit
          // simultaneously instead of drifting due to React render delay.
          const approveTimer = window.setTimeout(() => setAnnotationStage("billing"), APPROVE_AT_MS);
          const closeTimer = window.setTimeout(closeAnnotationAnimated, CLOSE_PREVIEW_AT_MS);
          automationTimers.current.push(approveTimer, closeTimer);
        }, 16);
        automationTimers.current.push(phaseTimer);
        return;
      }

      if (stepId === "navigate-project") {
        stopResourceAnimation();
        setOpenJob("Create 3D asset");
        setModalTab("FEED");
        setAnnotationOpen(false);
        setAnnotationStage("billing");
        setProofAnimationPhase("preview");
        setTaskAnimating(false);
        setThumbnailClicking(false);
        return;
      }

      if (stepId === "resource-planning-view") {
        setAnnotationOpen(false);
        setAnnotationStage("review");
        setTaskAnimating(false);
        setThumbnailClicking(false);
        setOpenJob(null);
        runSearchAutomation();
        return;
      }
    };

    window.addEventListener("guided-demo-step-active", handleGuidedStep);
    return () => window.removeEventListener("guided-demo-step-active", handleGuidedStep);
  }, []);

  const openAnnotationFromFeed = () => {
    clearAutomationTimers();
    setThumbnailClicking(false);
    setAnnotationOpen(true);
    setAnnotationStage("review");
    // Same two-step phase shift as the guided demo so the inner elements
    // mount fresh and the comments/pins/approval pulse stay in sync.
    setProofAnimationPhase("preview");
    const phaseTimer = window.setTimeout(() => {
      setProofAnimationPhase("comments");
      const approveTimer = window.setTimeout(() => setAnnotationStage("billing"), APPROVE_AT_MS);
      const closeTimer = window.setTimeout(closeAnnotationAnimated, CLOSE_PREVIEW_AT_MS);
      automationTimers.current.push(approveTimer, closeTimer);
    }, 16);
    automationTimers.current.push(phaseTimer);
  };

  useEffect(() => () => clearAutomationTimers(), []);

  const openProofingJob = (item: ScheduledItem) => {
    if (item.title !== "Create 3D asset") return;
    setAutoApproveProof(false);
    setTaskAnimating(true);
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
            className={[
              "allocation-search",
              resourceSearchPhase !== "idle" ? "active" : "",
              resourceSearchPhase === "clearing" ? "clearing" : "",
            ].filter(Boolean).join(" ")}
            data-tour-anchor="resource-search"
            onClick={runSearchAutomation}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            {resourceSearchPhase === "selected" || resourceSearchPhase === "dragging" || resourceSearchPhase === "assigned" || resourceSearchPhase === "clearing" ? (
              <span className="allocation-skill-badge">Photoshop</span>
            ) : (
              <input placeholder="Search" readOnly value={resourceSearchText} />
            )}
            {(resourceSearchPhase === "dropdown" || resourceSearchPhase === "typing") && (
              <span className="allocation-skill-dropdown">
                <button type="button"><em>Department</em> Creative</button>
                <button className={resourceSearchText === "photoshop" ? "selected" : ""} type="button">
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
              {resourcePeople.map((person, index) => (
                <div
                  className={[
                    "allocation-row",
                    resourceResultsVisible ? "filtered" : "",
                    photoshopPeople.has(person.name) ? "skill-match" : "",
                  ].filter(Boolean).join(" ")}
                  data-person={person.name}
                  key={person.name}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, person.name, 11)}
                  style={{ "--row-depth": rowDepthFor(person.name), "--result-delay": `${Math.min(index, 5) * 55}ms` } as CSSProperties}
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
                  <strong>{openJob === "Create 3D asset" ? "3D Billboard – Create 3D asset" : openJob}</strong>
                  <small>
                    {campaign.client} <b>/</b>{" "}
                    <button className="modal-project-breadcrumb" data-tour-anchor="modal-project-breadcrumb" onClick={onProjectNavigate} type="button">
                      {campaign.campaign}
                    </button>{" "}
                    <b>/</b> Jobs <b>/</b> 3D Billboard <b>/</b> Create 3D asset
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
                <button
                  className={tab === modalTab ? "active" : ""}
                  data-tour-anchor={tab === "PROOFING" ? "job-proofing-tab" : undefined}
                  key={tab}
                  onClick={() => {
                    if (tab === "FEED" || tab === "PROOFING") setModalTab(tab as "FEED" | "PROOFING");
                  }}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </nav>
            <div className="resource-job-proofing" data-tour-anchor="resource-job-proofing">
              {modalTab === "FEED" ? (
                <FeedDocumentView
                  feedHideChecklist
                  feedStageLabel={annotationStage === "billing" ? "To be Billed" : "Under Client Review"}
                  feedStageActionLabel={annotationStage === "billing" ? "" : "Awaiting approval"}
                  feedStageActionAnchor="feed-stage-action"
                  feedStageTimestamp="04 Jun 2026, 14:22"
                  feedDateRange={{ start: "18 Jun 2026", end: "21 Jun 2026" }}
                  feedTags={BILLBOARD_TAGS}
                  feedTaskAnimating={taskAnimating}
                  feedDescriptionContent={
                    <div className="asset-approval-description">
                      <p>3D digital billboard for the Coca-Cola Summer Assets campaign — animated render of the new summer can, optimised for large-format LED displays.</p>
                      <p>
                        <strong>Specs:</strong><br />
                        1920×1080 + 3840×2160 (4K)<br />
                        H.264 .mp4 + .png hero frame
                      </p>
                      <p>
                        <strong>Delivery:</strong><br />
                        21 Jun 2026 — Coca-Cola digital network
                      </p>
                      <div className="feed-documents">
                        <button
                          className={`feed-document-asset feed-document-button${thumbnailClicking ? " is-clicking" : ""}`}
                          data-tour-anchor="asset-thumbnail-preview"
                          onClick={openAnnotationFromFeed}
                          type="button"
                        >
                          <img
                            src={BILLBOARD_IMAGE.replace("w=900", "w=360")}
                            alt="3D billboard render preview"
                          />
                          <div>
                            <strong>3D Billboard render</strong>
                            <small>Image</small>
                          </div>
                        </button>
                        <article>
                          <span><FontAwesomeIcon icon={faFileImage} /></span>
                          <div>
                            <strong>Creative Brief</strong>
                            <small>Creative brief</small>
                          </div>
                        </article>
                      </div>
                    </div>
                  }
                  onFeedStageAction={openAnnotationFromFeed}
                />
              ) : (
                <ProofingContent autoApprove={autoApproveProof} />
              )}
            </div>
          </section>
          {annotationOpen && (
            <AnnotationPreview
              closing={annotationClosing}
              phase={proofAnimationPhase}
              stage={annotationStage}
              onClose={closeAnnotationAnimated}
            />
          )}
        </div>,
        document.querySelector(".product-window") ?? document.body,
      )}
    </WorkspaceFrame>
  );
}

function AnnotationPreview({ closing, phase, stage, onClose }: { closing?: boolean; phase: "preview" | "comments"; stage: "review" | "billing"; onClose: () => void }) {
  const isBilling = stage === "billing";
  const annotations = [
    { name: "Client", avatar: campaign.team[2].avatar, time: "04 Jun 2026, 14:25", text: "Approved for final delivery." },
    { name: "Sofia Martins", avatar: campaign.team[0].avatar, time: "04 Jun 2026, 14:24", text: "Color and framing look good." },
  ];
  return (
    <div
      className={`annotation-preview-backdrop${closing ? " is-closing" : ""}`}
      onMouseDown={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <section
        className={`annotation-preview${isBilling ? " is-approved" : ""}${phase === "comments" ? " is-commenting" : ""}${closing ? " is-closing" : ""}`}
        data-tour-anchor="annotation-preview"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="annotation-preview-header">
          <div className="annotation-preview-title">
            <span className="annotation-preview-icon"><FontAwesomeIcon icon={faFolder} /></span>
            <strong>3D-Billboard-CocaCola_1000x540.jpg</strong>
          </div>
          <div className="annotation-preview-actions">
            <button aria-label="Bookmark" type="button"><FontAwesomeIcon icon={faBookmark} /></button>
            <button aria-label="Download" type="button"><FontAwesomeIcon icon={faDownload} /></button>
            <button aria-label="Close annotation preview" onClick={onClose} type="button">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </header>
        <div className="annotation-preview-body">
          <div className="annotation-image-wrap">
            <button aria-label="Expand" className="annotation-image-expand" type="button">
              <FontAwesomeIcon icon={faExpand} />
            </button>
            <img
              src={BILLBOARD_IMAGE}
              alt="3D billboard render preview"
            />
            {phase === "comments" && (
              <>
                <span className="proof-pin one">1</span>
                <span className="proof-pin two">2</span>
                <div className="proof-image-comment one">
                  <strong>Sofia</strong>
                  <span>Color and framing look good.</span>
                </div>
                <div className="proof-image-comment two">
                  <strong>Client</strong>
                  <span>Approved for final delivery.</span>
                </div>
              </>
            )}
          </div>
          <aside className="annotation-preview-side">
            <section className="annotation-section">
              <header>
                <FontAwesomeIcon icon={faEllipsis} />
                <span>FILE APPROVAL</span>
              </header>
              <div className="annotation-approval">
                <span className={`annotation-approval-pill approved${isBilling ? " is-active" : ""}`}>
                  <FontAwesomeIcon icon={faCircleCheck} /> APPROVED
                </span>
                <span className={`annotation-approval-pill rejected${isBilling ? "" : " is-muted"}`}>
                  <FontAwesomeIcon icon={faCircleXmark} /> REJECTED
                </span>
              </div>
            </section>
            <section className="annotation-section">
              <header>
                <FontAwesomeIcon icon={faTag} />
                <span>TAGS</span>
              </header>
              <div className="annotation-tag-list">
                {BILLBOARD_TAGS.map((tag, index) => (
                  <span className="tag-pill" data-tone={tagTone(index)} key={tag}>{tag}</span>
                ))}
              </div>
            </section>
            <section className="annotation-section">
              <header>
                <FontAwesomeIcon icon={faPen} />
                <span>ANNOTATIONS</span>
              </header>
              <div className="annotation-list">
                {phase === "comments" && annotations.map((item) => (
                  <article key={`${item.name}-${item.time}-${item.text}`}>
                    <img className="avatar photo" src={item.avatar} alt="" />
                    <div>
                      <div className="annotation-list-row">
                        <strong>{item.name}</strong>
                        <small>{item.time}</small>
                      </div>
                      <p>{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="annotation-section">
              <header>
                <FontAwesomeIcon icon={faCircleInfo} />
                <span>INFO</span>
              </header>
              <dl className="annotation-info">
                <div><dt>Name</dt><dd>3D-Billboard-CocaCola_1000x540.jpg</dd></div>
                <div><dt>Version</dt><dd>1</dd></div>
                <div><dt>Size</dt><dd>312.45 KB</dd></div>
                <div><dt>Type</dt><dd>image</dd></div>
                <div><dt>Extension</dt><dd>.jpg</dd></div>
                <div><dt>Created On</dt><dd>04 Jun 2026, 14:22</dd></div>
                <div><dt>Created By</dt><dd>Arthur</dd></div>
              </dl>
            </section>
          </aside>
        </div>
      </section>
    </div>
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
