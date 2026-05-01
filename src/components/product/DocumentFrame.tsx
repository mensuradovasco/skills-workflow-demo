import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCheck,
  faClipboardCheck,
  faCommentDots,
  faCircle,
  faEllipsisVertical,
  faFileImage,
  faFileLines,
  faFilter,
  faListCheck,
  faMagnifyingGlass,
  faPaperclip,
  faPlus,
  faTableColumns,
  faTableList,
  faTag,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { campaign, projectTimelineRows, projectWorkItems } from "../../data/cocaColaCampaign";

type DocumentFrameProps = {
  activeTab?: string;
  accent?: string;
  calendarContent?: ReactNode;
  children: ReactNode;
  feedChecklist?: string[];
  feedDescriptionContent?: ReactNode;
  feedHideChecklist?: boolean;
  feedHideHistorySearch?: boolean;
  feedStageActionAnchor?: string;
  feedStageActionLabel?: string;
  feedStageLabel?: string;
  feedStageTimestamp?: string;
  feedReviewAnimation?: boolean;
  feedDateRange?: { start: string; end: string };
  feedTags?: string[];
  feedTaskAnimating?: boolean;
  feedTeamAnimated?: boolean;
  onFeedStageAction?: () => void;
  hideToolbar?: boolean;
  icon?: IconDefinition;
  initialTab?: string;
  jobsContent?: ReactNode;
  resourceUtilizationContent?: ReactNode;
  tabAnchors?: Record<string, string>;
  tabs?: string[];
  title?: string;
};

const defaultTabs = ["FEED", "INFO", "JOBS", "FILES", "GANTT", "PROFITABILITY"];

export function DocumentFrame({
  accent = "#bdb2f4",
  activeTab = "ACTIVITIES",
  calendarContent,
  children,
  feedChecklist,
  feedDescriptionContent,
  feedHideChecklist,
  feedHideHistorySearch,
  feedStageActionAnchor,
  feedStageActionLabel,
  feedStageLabel,
  feedStageTimestamp,
  feedReviewAnimation,
  feedDateRange,
  feedTags,
  feedTaskAnimating,
  feedTeamAnimated,
  hideToolbar = false,
  icon = faFileLines,
  initialTab,
  jobsContent,
  onFeedStageAction,
  resourceUtilizationContent,
  tabAnchors,
  tabs = defaultTabs,
  title = campaign.campaign,
}: DocumentFrameProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab ?? activeTab);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const style = { "--doc-accent": accent } as CSSProperties;

  useEffect(() => {
    setSelectedTab(initialTab ?? activeTab);
  }, [activeTab, initialTab]);

  useEffect(() => {
    tabRefs.current[selectedTab]?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [selectedTab]);

  return (
    <section className="document-frame" style={style}>
      <header className="document-header">
        <div className="document-header-main">
          <div className="document-title">
            <span className="document-icon"><FontAwesomeIcon icon={icon} /></span>
            <span className="brand-avatar mini client-logo-badge">
              <img src={campaign.clientLogo} alt={campaign.client} />
            </span>
            <div>
              <strong>{title}</strong>
              <small>
                {campaign.client} <span>/</span> {campaign.campaign}
              </small>
            </div>
          </div>
          <div className="document-actions">
            <button><FontAwesomeIcon icon={faPlus} /></button>
            <button><FontAwesomeIcon icon={faTableColumns} /></button>
            <button><FontAwesomeIcon icon={faEllipsisVertical} /></button>
          </div>
        </div>
        <div className="document-tabs">
          {tabs.map((tab) => (
            <button
              className={tab === selectedTab ? "active" : ""}
              data-tour-anchor={tabAnchors?.[tab]}
              key={tab}
              onClick={() => setSelectedTab(tab)}
              ref={(element) => {
                tabRefs.current[tab] = element;
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>
      {!hideToolbar && selectedTab !== "FEED" && (
        <div className="document-toolbar">
          <div className="toolbar-icons">
            <button><FontAwesomeIcon icon={faFilter} /></button>
            <button><FontAwesomeIcon icon={faTableList} /></button>
          </div>
          <label>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input placeholder="Search..." />
          </label>
        </div>
      )}
      <div className="document-tab-content" key={selectedTab}>
        {renderTabContent(selectedTab, activeTab, children, {
          calendarContent,
          feedChecklist,
          feedDescriptionContent,
          feedHideChecklist,
          feedHideHistorySearch,
          feedStageActionAnchor,
          feedStageActionLabel,
          feedStageLabel,
          feedStageTimestamp,
          feedReviewAnimation,
          feedDateRange,
          feedTags,
          feedTaskAnimating,
          feedTeamAnimated,
          jobsContent,
          onFeedStageAction,
          resourceUtilizationContent,
        })}
      </div>
    </section>
  );
}

function renderTabContent(
  selectedTab: string,
  activeTab: string,
  children: ReactNode,
  feedState?: {
    calendarContent?: ReactNode;
    feedChecklist?: string[];
    feedDescriptionContent?: ReactNode;
    feedHideChecklist?: boolean;
    feedHideHistorySearch?: boolean;
    feedStageActionAnchor?: string;
    feedStageActionLabel?: string;
    feedStageLabel?: string;
    feedStageTimestamp?: string;
    feedReviewAnimation?: boolean;
    feedDateRange?: { start: string; end: string };
    feedTags?: string[];
    feedTaskAnimating?: boolean;
    feedTeamAnimated?: boolean;
    jobsContent?: ReactNode;
    onFeedStageAction?: () => void;
    resourceUtilizationContent?: ReactNode;
  },
) {
  if (selectedTab === "FEED") return <FeedDocumentView {...feedState} />;

  if (selectedTab === activeTab) return children;

  if (selectedTab === "RESOURCE UTILIZATION") {
    return feedState?.resourceUtilizationContent ?? <InfoListView tab={selectedTab} />;
  }

  if (["JOBS", "KANBAN BY PERSON", "TASKS", "WORKFLOW", "ESTIMATES"].includes(selectedTab)) {
    return feedState?.jobsContent ?? <JobsListView />;
  }

  if (selectedTab === "KANBAN") {
    return <ProjectKanbanView />;
  }

  if (selectedTab === "PROFITABILITY" || selectedTab === "BILLS" || selectedTab === "PLANNED COSTS") {
    return <ProfitabilityTabView />;
  }

  if (selectedTab === "GANTT" || selectedTab === "CALENDAR") {
    return selectedTab === "CALENDAR" ? (feedState?.calendarContent ?? children) : children;
  }

  if (selectedTab === "FILES" || selectedTab === "PROOFING" || selectedTab === "APPROVALS") {
    return <FilesListView />;
  }

  return <InfoListView tab={selectedTab} />;
}

export function FeedDocumentView({
  feedChecklist,
  feedDescriptionContent,
  feedHideChecklist = false,
  feedHideHistorySearch = false,
  feedStageActionAnchor = "budget-stage-approval",
  feedStageActionLabel,
  feedStageLabel,
  feedStageTimestamp = "04 Jun 2026, 13:31",
  feedReviewAnimation = false,
  feedDateRange,
  feedTags,
  feedTaskAnimating = false,
  feedTeamAnimated = false,
  onFeedStageAction,
}: {
  feedChecklist?: string[];
  feedDescriptionContent?: ReactNode;
  feedHideChecklist?: boolean;
  feedHideHistorySearch?: boolean;
  feedStageActionAnchor?: string;
  feedStageActionLabel?: string;
  feedStageLabel?: string;
  feedStageTimestamp?: string;
  feedReviewAnimation?: boolean;
  feedDateRange?: { start: string; end: string };
  feedTags?: string[];
  feedTaskAnimating?: boolean;
  feedTeamAnimated?: boolean;
  onFeedStageAction?: () => void;
}) {
  const [stageLabel, setStageLabel] = useState(feedStageLabel ?? "In progress");
  const [stageActionLabel, setStageActionLabel] = useState(feedStageActionLabel ?? "Send estimate");
  const [reviewStarted, setReviewStarted] = useState(feedReviewAnimation);
  const requester = campaign.team[0];
  const responsible = campaign.team.slice(0, 3);
  const executors = campaign.team.slice(1);
  const associated = campaign.team.slice(0, 2);
  const checklist = feedChecklist ?? [
    "Client Request / Brief",
    "Estimate / Budget",
    "Project Plan",
    "Creative Brief",
    "Delivery List",
  ];
  const history = [
    { name: "Rachel", time: "15:01", date: "24 March", action: "moved estimate to", stage: "Approved" },
    { name: "Arthur", time: "14:45", date: "24 March", action: "started", stage: "Landing Page" },
  ];

  useEffect(() => {
    setStageLabel(feedStageLabel ?? "In progress");
    setStageActionLabel(feedStageActionLabel ?? "Send estimate");
    setReviewStarted(feedReviewAnimation);
  }, [feedReviewAnimation, feedStageActionLabel, feedStageLabel]);

  useEffect(() => {
    const handleGuidedStepComplete = (event: Event) => {
      const stepId = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (stepId === "client-request") {
        setStageLabel("In progress");
        setStageActionLabel("Send estimate");
      }
      if (stepId === "send-estimate") {
        setStageLabel("Client approval");
        setStageActionLabel("Awaiting approval");
      }
    };

    window.addEventListener("guided-demo-step-complete", handleGuidedStepComplete);
    return () => window.removeEventListener("guided-demo-step-complete", handleGuidedStepComplete);
  }, []);

  return (
    <div className={`document-feed${feedTaskAnimating ? " feed-task-animating" : ""}`}>
      <main className="feed-main">
        <section className="feed-description">
          <header>
            <span><FontAwesomeIcon icon={faFileLines} /></span>
            <strong>Description</strong>
          </header>
          <div className="feed-version-control" aria-label="Description version">
            <div>
              <strong>Rachel</strong>
              <small>{feedStageTimestamp}</small>
            </div>
            <img className="avatar photo" src={requester.avatar} alt="Rachel" />
          </div>
          <div className="feed-description-box">
            <div className="feed-description-content">
              {feedDescriptionContent ?? (
                <>
                  <p>Client request: create key assets for a Coca-Cola summer campaign.</p>
                  <p>
                    <strong>Scope:</strong><br />
                    Website Landing Page<br />
                    15s Video<br />
                    3D Digital Banner
                  </p>
                  <p>
                    <strong>Timeline:</strong><br />
                    Concept, Website, Video, 3D Banner, Delivery
                  </p>
                  <p>
                    <strong>Cost:</strong><br />
                    €15,000 approved
                  </p>
                  <div className="feed-documents" data-tour-anchor="project-documents">
                    <article>
                      <img
                        src="https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=360&q=80"
                        alt="Coca-Cola creative preview"
                      />
                      <div>
                        <strong>Summer asset reference</strong>
                        <small>Image</small>
                      </div>
                    </article>
                    <article>
                      <span><FontAwesomeIcon icon={faFileImage} /></span>
                      <div>
                        <strong>Creative Brief</strong>
                        <small>Creative brief</small>
                      </div>
                    </article>
                  </div>
                </>
              )}
            </div>
            {!feedHideChecklist && (
              <div className="feed-checklist">
                <div className="feed-check-row head">
                  <span>Description</span>
                  <span>Date</span>
                  <span>Done</span>
                </div>
                {checklist.map((item, index) => (
                  <div className={index === 1 ? "feed-check-row selected" : "feed-check-row"} key={item}>
                    <span>{item}</span>
                    <span>04 Jun 2026</span>
                    <span>
                      <FontAwesomeIcon icon={faCheck} />
                      {index < 3 && <img className="avatar photo" src={campaign.team[index % campaign.team.length].avatar} alt="" />}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="feed-composer">
          <div
            className={feedReviewAnimation ? `brief-review-composer${reviewStarted ? " is-reviewing" : ""}` : undefined}
          >
            <img className="avatar photo" src={requester.avatar} alt="" />
            {feedReviewAnimation && reviewStarted ? (
              <>
                <span className="brief-review-initial-placeholder">Click to start typing. Say something, assign people or drag a file.</span>
                <span className="brief-review-type">
                  Brief reviewed, ready for estimation.
                  <em>30 min added to timesheets</em>
                </span>
                <span className="brief-review-flyout">
                  Brief reviewed, ready for estimation.
                  <em>30 min added to timesheets</em>
                </span>
                <span className="brief-review-placeholder">Click to start typing. Say something, assign people or drag a file.</span>
              </>
            ) : (
              <span>Click to start typing. Say something, assign people or drag a file.</span>
            )}
            <nav>
              <button aria-label="More actions"><FontAwesomeIcon icon={faEllipsisVertical} /></button>
              <button aria-label="Attach file"><FontAwesomeIcon icon={faPaperclip} /></button>
              <button aria-label="Assign people"><FontAwesomeIcon icon={faUserGroup} /></button>
              <button aria-label="Add tag"><FontAwesomeIcon icon={faTag} /></button>
            </nav>
          </div>
        </section>

        <section className="feed-history">
          {!feedHideHistorySearch && (
            <header>
              <span />
              <label><FontAwesomeIcon icon={faMagnifyingGlass} /><input placeholder="Search..." /></label>
            </header>
          )}
          {feedReviewAnimation && reviewStarted && (
            <article className="brief-review-feed-post">
              <img className="avatar photo" src={requester.avatar} alt="" />
              <p>
                <strong>Rachel</strong> <small>09:52, 24 March</small><br />
                Brief reviewed, ready for estimation.<br />
                <em>30 min added to timesheets</em>
              </p>
            </article>
          )}
          {history.map((item) => (
            <article key={`${item.name}-${item.time}`}>
              <img className="avatar photo" src={campaign.team[1].avatar} alt="" />
              <p><strong>{item.name}</strong> <small>{item.time}, {item.date}</small><br />{item.action} <mark>{item.stage}</mark></p>
            </article>
          ))}
        </section>
      </main>

      <aside className="feed-side-panel">
        <FeedStageCard
          actionAnchor={feedStageActionAnchor}
          actionLabel={stageActionLabel}
          dateRange={feedDateRange}
          defaultDate={feedStageTimestamp}
          onAction={onFeedStageAction}
          stageLabel={stageLabel}
        />

        <section className="feed-meta-card compact">
          <header>
            <FontAwesomeIcon icon={faTag} />
            <strong>Tags</strong>
            {feedTags && feedTags.length > 0 && (
              <span className="feed-tag-list">
                {feedTags.map((tag, index) => (
                  <span className="tag-pill" data-tone={tagTone(index)} key={tag}>{tag}</span>
                ))}
              </span>
            )}
            <button><FontAwesomeIcon icon={faPlus} /></button>
          </header>
        </section>

        <section className="feed-meta-card">
          <header>
            <FontAwesomeIcon icon={faUserGroup} />
            <strong>Team</strong>
          </header>
          <FeedTeamRow animated={feedTeamAnimated} label="Requester" people={[requester]} />
          <FeedTeamRow animated={feedTeamAnimated} label="Responsible" people={responsible} />
          <FeedTeamRow animated={feedTeamAnimated} label="Executor" people={executors} prefix="EC" />
          <FeedTeamRow animated={feedTeamAnimated} label="Associated" people={associated} client />
        </section>
      </aside>
    </div>
  );
}

export function FeedStageCard({
  actionAnchor,
  actionLabel,
  className,
  dateRange,
  defaultDate = "04 Jun 2026, 13:31",
  onAction,
  stageLabel,
  stageState,
}: {
  actionAnchor?: string;
  actionLabel: string;
  className?: string;
  dateRange?: { start: string; end: string };
  defaultDate?: string;
  onAction?: () => void;
  stageLabel: string;
  stageState?: string;
}) {
  const stageDateRange = dateRange ?? {
    start: defaultDate.split(",")[0],
    end: campaign.request.dueDate,
  };

  return (
    <section className={["feed-stage-card", className].filter(Boolean).join(" ")}>
      <header>
        <div className="feed-stage-header-dates">
          <div>
            <small>Start</small>
            <strong>{stageDateRange.start}</strong>
          </div>
          <div>
            <small>End</small>
            <strong>{stageDateRange.end}</strong>
          </div>
        </div>
      </header>
      <div className="feed-stage-status">
        <strong>Stage</strong>
        <span><i /> {stageLabel}</span>
        {actionLabel && (
          <button
            className="feed-stage-action"
            data-tour-anchor={actionAnchor}
            data-stage-state={stageState}
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </section>
  );
}

export function tagTone(index: number) {
  const tones = ["red", "amber", "green", "blue", "purple"];
  return tones[index % tones.length];
}

function FeedTeamRow({ animated = false, client, label, people, prefix }: { animated?: boolean; client?: boolean; label: string; people: typeof campaign.team; prefix?: string }) {
  return (
    <div className={animated ? "feed-team-row animated" : "feed-team-row"}>
      <small>{label}</small>
      <div>
        {prefix && <em>{prefix}</em>}
        {people.map((person, index) => (
          <img
            className="avatar photo"
            src={person.avatar}
            alt={person.name}
            key={`${label}-${person.name}`}
            style={animated ? ({ "--brief-delay": `${index * 80 + 240}ms` } as CSSProperties) : undefined}
          />
        ))}
        {client && (
          <span
            className="brand-avatar mini client-logo-badge"
            style={animated ? ({ "--brief-delay": `${people.length * 80 + 320}ms` } as CSSProperties) : undefined}
          >
            <img src={campaign.clientLogo} alt={campaign.client} />
          </span>
        )}
      </div>
    </div>
  );
}

function JobsListView() {
  return (
    <ListTable
      groups={[
        {
          label: "To approve (2)",
          tone: "red",
          rows: [
            { title: "Client Request / Brief", type: "Document", department: "Client Services", classification: campaign.campaign, date: "03 Jun 2026 10", priority: "High" },
            { title: "Estimate / Budget", type: "Estimate", department: "Account", classification: "€15,000", date: "04 Jun 2026 12", priority: "High" },
          ],
        },
        {
          label: "Approved (4)",
          tone: "green",
          rows: [
            { title: "Define idea", type: "Task", department: "Creative", classification: "Concept", date: "07 Jun 2026 18", priority: "Medium" },
            { title: "Design landing page", type: "Task", department: "Design", classification: "Website", date: "10 Jun 2026 18", priority: "Medium" },
            { title: "Edit 15s video", type: "Task", department: "Video", classification: "Video", date: "18 Jun 2026 18", priority: "Medium" },
            { title: "Create 3D asset", type: "Task", department: "Design", classification: "3D Banner", date: "21 Jun 2026 18", priority: "Low" },
          ],
        },
        {
          label: "Under approval (1)",
          tone: "blue",
          rows: [
            { title: "Final approval", type: "Approval", department: "Client Services", classification: "Delivery", date: "24 Jun 2026 15", priority: "None" },
          ],
        },
      ]}
    />
  );
}

function InfoListView({ tab }: { tab: string }) {
  return (
    <div className="document-tab-panel">
      <div className="document-info-grid">
        {[
          ["Client", campaign.client],
          ["Project", campaign.campaign],
          ["Owner", campaign.request.receivedFrom],
          ["Budget", "€15,000"],
          ["Due date", campaign.request.dueDate],
          ["Selected tab", tab],
        ].map(([label, value]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProjectKanbanView() {
  const columns = [
    {
      title: "Briefing",
      tone: "blue",
      cards: projectWorkItems.filter((item) => item.stage === "Approved"),
    },
    {
      title: "In progress",
      tone: "gold",
      cards: projectWorkItems.filter((item) => item.stage === "In progress"),
    },
    {
      title: "Internal review",
      tone: "green",
      cards: projectWorkItems.filter((item) => item.stage === "Internal review" || item.stage === "Queued"),
    },
    {
      title: "Client approval",
      tone: "red",
      cards: projectWorkItems.filter((item) => item.stage === "Client approval" || item.stage === "Ready for delivery"),
    },
  ];

  return (
    <div className="document-kanban">
      {columns.map((column) => (
        <section className="kanban-column" key={column.title}>
          <header>
            <span className={column.tone} />
            <strong>{column.title}</strong>
            <small>{column.cards.length}</small>
          </header>
          {column.cards.map((card, index) => (
            <KanbanWorkCard card={card} index={index} key={card.reference} />
          ))}
        </section>
      ))}
    </div>
  );
}

function findParentName(wbs: string): string | null {
  if (!wbs.includes(".")) return null;
  const parentWbs = wbs.split(".")[0];
  const parent = projectTimelineRows.find((row) => row.wbs === parentWbs);
  return parent?.name ?? null;
}

type KanbanWorkCardData = {
  name: string;
  type: string;
  stage: string;
  start: string;
  end: string;
  progress: string;
  comments: number;
  reference: string;
  wbs: string;
  priority?: string;
  tags?: ReadonlyArray<string>;
};

export function KanbanWorkCard({ card, index }: { card: KanbanWorkCardData; index: number }) {
  const parent = findParentName(card.wbs);
  return (
    <article className="kanban-card">
      <div className="kanban-card-strip">
        <span><FontAwesomeIcon icon={faListCheck} /></span>
        <strong>{card.name}</strong>
      </div>
      <div className="kanban-card-body">
        <span className="kanban-card-tag type-tag">{card.type}</span>
        <div className="kanban-card-tags">
          {card.tags?.map((tag) => (
            <span className="kanban-card-tag" key={tag}>{tag}</span>
          ))}
        </div>
        <div className="kanban-card-status">
          <FontAwesomeIcon icon={faCircle} />
          <span>{card.stage}</span>
        </div>
        <div className="kanban-card-meta">
          <KanbanDateRange start={card.start} end={card.end} progress={parseProgress(card.progress)} />
          <span className="comments"><FontAwesomeIcon icon={faCommentDots} />{card.comments}</span>
          <KanbanPriorityMeter level={card.priority} />
          <div className="kanban-card-avatars">
            {campaign.team.slice(0, index % 2 === 0 ? 3 : 2).map((member) => (
              <img className="avatar photo" src={member.avatar} alt="" key={member.name} />
            ))}
          </div>
          <small>{card.reference}</small>
          {parent && <small className="kanban-card-parent">{parent}</small>}
        </div>
      </div>
    </article>
  );
}

function parseProgress(value: string | undefined): number {
  if (!value) return 0;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

function KanbanPriorityMeter({ level }: { level?: string }) {
  const filled = level === "High" ? 3 : level === "Medium" ? 2 : 1;
  const tone = (level ?? "Low").toLowerCase();
  return (
    <span className={`priority-meter priority-${tone}`} aria-label={`Priority ${level ?? "Low"}`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= filled ? "filled" : ""} />
      ))}
    </span>
  );
}

function KanbanDateRange({ start, end, progress }: { start: string; end: string; progress: number }) {
  const pct = Math.min(Math.max(progress, 0), 100);
  return (
    <span className="kanban-date-range">
      <span className="kanban-date-range-fill" style={{ width: `${pct}%` }} />
      <span className="kanban-date-range-text">{start} – {end}</span>
    </span>
  );
}

function FilesListView() {
  return (
    <ListTable
      groups={[
        {
          label: "Proofing assets (3)",
          tone: "blue",
          rows: [
            { title: "Landing Page v1", type: "File", department: "Design", classification: "Proofing", date: "18 Jun 2026 18", priority: "High" },
            { title: "15s Video edit", type: "File", department: "Video", classification: "Proofing", date: "20 Jun 2026 15", priority: "Medium" },
            { title: "3D Digital Banner", type: "File", department: "Design", classification: "Proofing", date: "21 Jun 2026 15", priority: "Medium" },
          ],
        },
      ]}
    />
  );
}

function ProfitabilityTabView() {
  const rows = [
    ["Approved budget", "€15,000", "Approved", "100%"],
    ["Planned cost", "€13,750", "In progress", "92%"],
    ["Billing remaining", "€7,500", "To invoice", "50%"],
    ["Actual hours", "44h", "Tracked", "41%"],
  ];

  return (
    <div className="document-profit-tab">
      <div className="profit-mini-cards">
        <article><small>Budget</small><strong>€15,000</strong></article>
        <article><small>Forecast</small><strong>On plan</strong></article>
        <article><small>Remaining</small><strong>€7,500</strong></article>
      </div>
      <div className="profit-tab-table">
        {rows.map(([label, value, stage, margin]) => (
          <div key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
            <span>{stage}</span>
            <mark>{margin}</mark>
          </div>
        ))}
      </div>
    </div>
  );
}

type ListRow = {
  classification?: string;
  company?: string;
  date?: string;
  department?: string;
  division?: string;
  image?: string;
  owner?: string;
  priority?: "High" | "Medium" | "Low" | "None";
  status?: string;
  title: string;
  type?: string;
};

export type ListColumn<T> = {
  align?: "right";
  cellClassName?: string;
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  width?: string;
};

type ListGroup<T> = { label: string; rows: T[]; tone?: string };

type ListTableProps<T> = {
  columns?: ListColumn<T>[];
  groups: Array<ListGroup<T>>;
};

const defaultListColumns: ListColumn<ListRow>[] = [
  {
    key: "title",
    label: "Title",
    cellClassName: "doc-title-cell",
    width: "minmax(220px, 1.65fr)",
    render: (row) => (
      <>
        {row.image && <img src={row.image} alt="" />}
        <strong>{row.title}</strong>
      </>
    ),
  },
  { key: "type", label: "Type", width: "minmax(92px, 0.72fr)", render: (row) => row.type ?? "Task" },
  { key: "company", label: "Company", width: "minmax(120px, 0.78fr)", render: (row) => row.company ?? "Company 1" },
  { key: "division", label: "Division", width: "minmax(86px, 0.62fr)", render: (row) => row.division ?? "Brazil" },
  { key: "department", label: "Department", width: "minmax(128px, 0.9fr)", render: (row) => row.department ?? "Client Services" },
  { key: "classification", label: "Classification", width: "minmax(142px, 1fr)", render: (row) => row.classification ?? row.owner ?? campaign.campaign },
  { key: "date", label: "Due date", width: "minmax(122px, 0.76fr)", render: (row) => <mark>{row.date ?? "05 May 2026 00"}</mark> },
  { key: "priority", label: "Priority", width: "minmax(110px, 0.7fr)", render: (row) => <b className={`priority ${row.priority ?? "Medium"}`}>{row.priority ?? "Medium"}</b> },
];

export function ListTable(props: { groups: Array<ListGroup<ListRow>> }): ReactElement;
export function ListTable<T>(props: { columns: ListColumn<T>[]; groups: Array<ListGroup<T>> }): ReactElement;
export function ListTable<T = ListRow>({ columns, groups }: ListTableProps<T>) {
  const cols = (columns ?? (defaultListColumns as unknown as ListColumn<T>[]));
  const gridTemplate = cols.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");
  const rowStyle = { "--doc-grid-columns": gridTemplate } as CSSProperties;

  return (
    <div className="document-table">
      <div className="doc-row doc-head" style={rowStyle}>
        {cols.map((c) => (
          <span key={c.key} className={c.align === "right" ? "num" : undefined}>{c.label}</span>
        ))}
      </div>
      {groups.map((group) => (
        <div className="doc-group" key={group.label}>
          {group.label && (
            <div className={`doc-group-label ${group.tone ?? ""}`}>
              <span />
              {group.label}
            </div>
          )}
          {group.rows.map((row, rowIndex) => (
            <div className="doc-row" key={`${group.label}-${rowIndex}`} style={rowStyle}>
              {cols.map((c) => (
                <span
                  key={c.key}
                  className={[c.cellClassName, c.align === "right" ? "num" : ""].filter(Boolean).join(" ") || undefined}
                >
                  {c.render(row)}
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
