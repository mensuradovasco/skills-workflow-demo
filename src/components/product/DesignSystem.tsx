import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBriefcase,
  faCalculator,
  faChartLine,
  faChartPie,
  faChevronLeft,
  faClipboardList,
  faClock,
  faHourglassStart,
  faPeopleGroup,
  faToolbox,
  faUserGroup,
  faCommentDots,
  faEllipsisVertical,
  faFileContract,
  faFileInvoiceDollar,
  faFolderOpen,
  faListCheck,
  faPaperPlane,
  faPlay,
  faPlus,
  faReceipt,
  faUmbrellaBeach,
  faUsers,
  faCircleCheck,
  faCircleXmark,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { WorkspaceFrame } from "./WorkspaceFrame";
import { DocumentFrame, FeedDescription, ListTable } from "./DocumentFrame";

type EntityToken = {
  id: string;
  name: string;
  accent: string;
  bg: string;
  icon: IconDefinition;
  description: string;
  surfaces: Array<"document" | "workspace" | "modal">;
};

// Entity tokens mirror the Skills Workflow Module Dependencies diagram. Order
// follows the deployment / dependency order: Campaign → Brief → Project →
// Estimate → Bill → Job → Sub-Job/Task → Timesheets → Burn Reports, plus the
// supporting entities (Expenses, Purchase Order, Absences, Resourcing) and
// demo-specific entities (Client, Asset/Proof).
const entities: EntityToken[] = [
  { id: "client", name: "Client", accent: "#7d69d8", bg: "#f1eefb", icon: faUsers, description: "Companies the agency delivers work for.", surfaces: ["document", "workspace"] },
  { id: "contract", name: "Contract", accent: "#4FC3E5", bg: "#e3f5fb", icon: faBriefcase, description: "Master agreement with the client. Briefs, estimates, and projects are scoped under it.", surfaces: ["document", "workspace"] },
  // TODO(pro-icons): swap Brief → fal fa-users-class once @fortawesome/pro-light-svg-icons is installed
  { id: "brief", name: "Brief", accent: "#5DBE8A", bg: "#e3f4ea", icon: faPeopleGroup, description: "Structured scope, deliverables, dates, team.", surfaces: ["document"] },
  { id: "project", name: "Project", accent: "#9D87E0", bg: "#efeafa", icon: faClipboardList, description: "Approved estimate becomes a working project.", surfaces: ["document", "workspace"] },
  { id: "expenses", name: "Expenses", accent: "#8FCD92", bg: "#e8f5e9", icon: faReceipt, description: "Out-of-pocket and reimbursable costs tied to a project.", surfaces: ["document", "workspace"] },
  { id: "estimate", name: "Estimate", accent: "#9B7E6E", bg: "#f0eae6", icon: faCalculator, description: "Priced estimate built from the brief, then approved by the client.", surfaces: ["document", "workspace"] },
  { id: "bill", name: "Bill", accent: "#B14E5C", bg: "#f6e3e6", icon: faFileInvoiceDollar, description: "Issued to the client based on the approved estimate.", surfaces: ["document", "workspace"] },
  { id: "purchase-order", name: "Purchase Order", accent: "#F4A6B5", bg: "#fdebef", icon: faFileContract, description: "Outbound commitment to a vendor for project costs.", surfaces: ["document", "workspace"] },
  { id: "job", name: "Job", accent: "#F1C338", bg: "#fdf3d2", icon: faToolbox, description: "Deliverable-level work with assignment + status.", surfaces: ["document", "workspace", "modal"] },
  { id: "absences", name: "Absences", accent: "#93B6DB", bg: "#e6eef7", icon: faUmbrellaBeach, description: "Holidays and time off — affect resource capacity.", surfaces: ["workspace"] },
  { id: "subjob-task", name: "Sub-Job / Task", accent: "#B5A957", bg: "#f3f1e2", icon: faListCheck, description: "Work units inside a job — what people actually do day-to-day.", surfaces: ["document", "workspace"] },
  // TODO(pro-icons): swap Resourcing → fal fa-poll-people once Pro is installed
  { id: "resourcing", name: "Resourcing", accent: "#2EC0BA", bg: "#dff5f4", icon: faUserGroup, description: "People, skills, capacity, and assignments.", surfaces: ["document", "workspace"] },
  // TODO(pro-icons): swap Timesheets → fal fa-hourglass-start (already using solid hourglass-start, just for weight)
  { id: "timesheets", name: "Timesheets", accent: "#5BD2D5", bg: "#e0f6f7", icon: faHourglassStart, description: "Hours logged by people against jobs and tasks.", surfaces: ["document", "workspace"] },
  { id: "burn-reports", name: "Burn Reports", accent: "#1A6BB5", bg: "#dceaf6", icon: faChartLine, description: "Planned vs actual by week, role, department — rolls up into agency profitability.", surfaces: ["document", "workspace"] },
  { id: "asset", name: "Asset / Proof", accent: "#f6a94a", bg: "#fdf0df", icon: faFolderOpen, description: "Creative files reviewed and approved (demo-specific).", surfaces: ["document", "modal"] },
  { id: "profitability", name: "Profitability", accent: "#57c69a", bg: "#e2f5ec", icon: faChartPie, description: "Billing remaining, margin, forecast — agency-wide rollup.", surfaces: ["document", "workspace"] },
];

const stageStates = [
  { tone: "blue", label: "New", description: "Just created." },
  { tone: "amber", label: "To be billed", description: "Approved, ready for billing." },
  { tone: "purple", label: "In review", description: "Awaiting feedback." },
  { tone: "green", label: "Billed / Done", description: "Closed out." },
];

const priorityLevels = ["High", "Medium", "Low", "None"] as const;

const motionTokens: Array<{ name: string; duration: string; usage: string }> = [
  { name: "stepDelay", duration: "stagger", usage: "Sequenced reveals across rail steps." },
  { name: "slide-in", duration: "320ms", usage: "Document content entering from the right." },
  { name: "fade-up", duration: "260ms", usage: "Metric cards and small content blocks." },
  { name: "profitBarRise", duration: "720ms", usage: "Mini bar charts grow from baseline." },
  { name: "profitRowEnter", duration: "520ms", usage: "Profitability rows stagger in." },
  { name: "profitRowBilledFlash", duration: "900ms", usage: "Row pulse when stage flips to Billed." },
  { name: "tweenCellFlash", duration: "700ms", usage: "Numeric cells highlight on value change." },
  { name: "thumbnailProofClick", duration: "540ms", usage: "Asset thumbnail bounce on click." },
  { name: "proofPreviewFromThumbnail", duration: "460ms", usage: "Modal grows out of the thumbnail." },
  { name: "modalFadeIn", duration: "180ms", usage: "Modal backdrop appears." },
  { name: "aiDockPulse", duration: "1.6s loop", usage: "Skills AI assistant indicator." },
];

type DesignSystemProps = {
  onBack: () => void;
};

export function DesignSystem({ onBack }: DesignSystemProps) {
  return (
    <div className="design-system">
      <header className="design-system-hero">
        <button className="design-system-back" onClick={onBack} type="button">
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Back to demo</span>
        </button>
        <div className="design-system-hero-content">
          <span className="design-system-eyebrow">Skills Workflow · Interactive Demo</span>
          <h1>Design System</h1>
          <p>
            Reusable building blocks of the briefing-to-billing experience. Grouped by intent so we
            can extend the demo without drifting.
          </p>
        </div>
        <nav className="design-system-toc" aria-label="Sections">
          <a href="#foundations">Foundations</a>
          <a href="#elements">Elements</a>
          <a href="#patterns">Patterns</a>
          <a href="#motion">Motion</a>
        </nav>
      </header>

      <Group id="foundations" eyebrow="Group 01" title="Foundations" description="Color, status, and the typographic scale that everything else inherits.">
        <Subsection title="Entities & accents" hint="Each entity carries an accent + a tint (≈10% of accent) + an icon. Cards reuse the Job/Deliverable header pattern so the entity's color is the first thing you see.">
          <div className="ds-entity-grid">
            {entities.map((entity) => (
              <article className="ds-composed-card ds-entity-card" key={entity.id}>
                <header
                  className="ds-composed-header"
                  style={{ "--ds-accent": entity.accent, "--ds-bg": entity.bg } as React.CSSProperties}
                >
                  <span className="ds-entity-icon">
                    <FontAwesomeIcon icon={entity.icon} />
                  </span>
                  <div>
                    <strong>{entity.name}</strong>
                    <small>{entity.id}</small>
                  </div>
                </header>
                <div className="ds-composed-body compact">
                  <p>{entity.description}</p>
                  <footer>
                    <div className="ds-entity-tokens">
                      <div className="ds-token-swatch" style={{ background: entity.accent }} />
                      <div className="ds-token-swatch tint" style={{ background: entity.bg }} />
                      <code>{entity.accent.toUpperCase()}</code>
                    </div>
                  </footer>
                  <div className="ds-entity-surfaces">
                    {entity.surfaces.map((s) => (
                      <span key={s} className={`ds-surface-pill ${s}`}>{s}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Subsection>

        <Subsection title="Status tones" hint="Color-coded stage states for tables and headers.">
          <div className="ds-stage-row">
            {stageStates.map((s) => (
              <div className="ds-stage-card" key={s.tone}>
                <span className={`stage-tag tone-${s.tone}`}>
                  <i />
                  {s.label}
                </span>
                <p>{s.description}</p>
                <code>tone-{s.tone}</code>
              </div>
            ))}
          </div>
        </Subsection>

        <Subsection title="Typography" hint="Sizes used across documents, workspaces, and the marketing shell.">
          <div className="ds-type-grid">
            <article>
              <span className="ds-type-label">H1 · Hero</span>
              <h2 className="ds-type-h1">Briefing to billing</h2>
            </article>
            <article>
              <span className="ds-type-label">H2 · Section</span>
              <h3 className="ds-type-h2">Coca-Cola Summer Assets</h3>
            </article>
            <article>
              <span className="ds-type-label">H3 · Card</span>
              <h4 className="ds-type-h3">Approved budget</h4>
            </article>
            <article>
              <span className="ds-type-label">Body</span>
              <p className="ds-type-body">A 3D digital billboard for the Coca-Cola Summer Assets campaign — animated render optimised for large-format LED.</p>
            </article>
            <article>
              <span className="ds-type-label">Eyebrow</span>
              <small className="ds-type-eyebrow">DESCRIPTION</small>
            </article>
          </div>
        </Subsection>
      </Group>

      <Group id="elements" eyebrow="Group 02" title="Elements" description="Inline atoms that combine into larger patterns.">
        <Subsection title="Pills & badges" hint="Metadata: priorities, percentages, currencies, tags.">
          <div className="ds-pill-grid">
            <div className="ds-pill-cluster">
              <h4>Priority</h4>
              <div className="ds-pill-row">
                {priorityLevels.map((p) => (
                  <b key={p} className={`priority ${p}`}>{p}</b>
                ))}
              </div>
            </div>
            <div className="ds-pill-cluster">
              <h4>Margin / Billed %</h4>
              <div className="ds-pill-row">
                <span className="pct tone-green">75%</span>
                <span className="pct tone-amber">27%</span>
                <span className="pct tone-red">4%</span>
              </div>
            </div>
            <div className="ds-pill-cluster">
              <h4>Currency</h4>
              <div className="ds-pill-row">
                <span className="currency-tag">EUR</span>
                <span className="currency-tag">USD</span>
                <span className="currency-tag">BRL</span>
              </div>
            </div>
            <div className="ds-pill-cluster">
              <h4>Tags</h4>
              <div className="ds-pill-row">
                <span className="tag-pill" data-tone="0">3D</span>
                <span className="tag-pill" data-tone="1">billboard</span>
                <span className="tag-pill" data-tone="2">Coca-Cola</span>
              </div>
            </div>
            <div className="ds-pill-cluster">
              <h4>Approval</h4>
              <div className="ds-pill-row">
                <span className="annotation-approval-pill approved is-active">
                  <FontAwesomeIcon icon={faCircleCheck} /> APPROVED
                </span>
                <span className="annotation-approval-pill rejected is-muted">
                  <FontAwesomeIcon icon={faCircleXmark} /> REJECTED
                </span>
              </div>
            </div>
          </div>
        </Subsection>

        <Subsection title="Buttons" hint="Click controls used across the AI dock and demo hotspots.">
          <div className="ds-button-grid">
            <div className="ds-button-cluster">
              <h4>AI dock</h4>
              <div className="ds-button-row">
                <button className="ai-dock-primary" type="button">Continue</button>
                <button className="ai-dock-ghost" type="button">Back</button>
              </div>
            </div>
            <div className="ds-button-cluster">
              <h4>Hotspots</h4>
              <div className="ds-button-row">
                <span className="hotspot-zone ds-static-hotspot">
                  <span className="hotspot-action-label">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Send for approval
                  </span>
                </span>
                <span className="hotspot-zone ds-static-hotspot">
                  <span className="hotspot-action-label">
                    <FontAwesomeIcon icon={faPlay} />
                    Approve & bill
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Subsection>

        <Subsection title="Avatars" hint="People shown via photo avatars; teams overlap with a count.">
          <div className="ds-avatar-row">
            <img className="avatar photo" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=96&q=80" alt="" />
            <img className="avatar photo" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80" alt="" />
            <img className="avatar photo" src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80" alt="" />
            <img className="avatar photo" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80" alt="" />
            <span className="ds-avatar-overflow">+3</span>
          </div>
        </Subsection>
      </Group>

      <Group id="patterns" eyebrow="Group 03" title="Workspace blocks" description="The kit for assembling a new 'All [entity]' workspace. Drop these in order: header → tabs → filter bar → analytics → grouped list. The atoms here can stand alone or be composed.">
        <Subsection title="Workspace header" hint="The real WorkspaceFrame — entity icon + title + subtitle (active view) + header actions. No client image; that's the document header.">
          <div className="ds-component-frame">
            <WorkspaceFrame accent="#57c69a" icon={faChartPie} title="Profitability" subtitle="All" tabs={[]}>{null}</WorkspaceFrame>
          </div>
          <div className="ds-component-frame">
            <WorkspaceFrame accent="#f0c94e" icon={faBriefcase} title="Jobs" subtitle="All" tabs={[]}>{null}</WorkspaceFrame>
          </div>
          <div className="ds-component-frame">
            <WorkspaceFrame accent="#5b8ed6" icon={faClipboardList} title="Requests" subtitle="All" tabs={[]}>{null}</WorkspaceFrame>
          </div>
        </Subsection>

        <Subsection title="Document header" hint="The real DocumentFrame — entity icon + client logo + title + breadcrumb + actions, with its tab strip. The client image is what makes it a document.">
          <div className="ds-component-frame">
            <DocumentFrame
              accent="#f6a94a"
              activeTab="FEED"
              icon={faCommentDots}
              tabs={["FEED", "INFO", "FILES", "PROOFING", "APPROVALS", "HISTORY"]}
              title="3D Billboard – Create 3D asset"
            >
              <div className="ds-frame-placeholder">Tab content lives here.</div>
            </DocumentFrame>
          </div>
          <div className="ds-component-frame">
            <DocumentFrame
              accent="#bdb2f4"
              activeTab="FEED"
              icon={faFolderOpen}
              tabs={["FEED", "INFO", "TASKS", "FILES", "GANTT", "CALENDAR"]}
              title="Coca-Cola — Summer Assets"
            >
              <div className="ds-frame-placeholder">Tab content lives here.</div>
            </DocumentFrame>
          </div>
        </Subsection>

        <Subsection title="Tab strip" hint="Sits below the header. First tab is active. Workspaces use view tabs (Allocation / People / Skills / etc); documents use record tabs (FEED / INFO / FILES / etc).">
          <span className="ds-tab-label">Workspace tabs</span>
          <DSTabStrip tabs={["ALLOCATION", "PEOPLE", "SKILLS", "CAPACITY", "HOURS"]} />
          <DSTabStrip tabs={["ESTIMATES", "APPROVALS", "BILLING", "TEMPLATES"]} />
          <span className="ds-tab-label">Document tabs</span>
          <DSTabStrip tabs={["FEED", "INFO", "FILES", "PROOFING", "APPROVALS", "HISTORY"]} />
          <DSTabStrip tabs={["FEED", "INFO", "TASKS", "FILES", "GANTT", "CALENDAR"]} />
        </Subsection>

        <Subsection title="Filter bar" hint="Pill chips + labelled filter input — same pattern as the Profitability quick range. Active state uses the brand blue; the labelled pill on the right is the primary scoped filter (region, owner, client).">
          <div className="ds-block-card">
            <div className="workspace-filter-row">
              <button className="active" type="button">Export</button>
              <button type="button">Client</button>
              <button type="button">No mail</button>
              <label>
                <span>Working region</span>
                <input placeholder="All" />
              </label>
            </div>
          </div>
          <div className="ds-block-card">
            <div className="workspace-filter-row">
              <button className="active" type="button">All</button>
              <button type="button">Q1</button>
              <button type="button">Q2</button>
              <button type="button">Q3</button>
              <button type="button">Q4</button>
            </div>
          </div>
        </Subsection>

        <Subsection title="Header actions" hint="Top-right of the workspace: create, open, more.">
          <div className="ds-block-card ds-block-row">
            <div className="workspace-actions" style={{ display: "flex", gap: 8 }}>
              <button aria-label="Create"><FontAwesomeIcon icon={faPlus} /></button>
              <button aria-label="Open"><FontAwesomeIcon icon={faArrowRight} /></button>
              <button aria-label="More"><FontAwesomeIcon icon={faEllipsisVertical} /></button>
            </div>
            <small>workspace-actions · icon-only round buttons</small>
          </div>
        </Subsection>

        <Subsection title="Description / info box" hint="The real FeedDescription component — header strip, version-control row (name + timestamp + avatar on the edge), prose body, optional checklist.">
          <div className="ds-component-frame ds-feed-description-wrap">
            <FeedDescription feedHideChecklist />
          </div>
        </Subsection>

        <Subsection title="Analytics card" hint="Bar (with optional Y-axis labels + image/text labels under each bar) and donut variants. Bars rise on mount via profitBarRise; donut slices fade in.">
          <div className="ds-analytics-row">
            <DSAnalyticsCard title="Jobs by region" labels={["EU", "UK", "BR", "US", "MEA"]} bars={[32, 48, 72, 58, 86]} />
            <DSAnalyticsCard
              title="Margin by client"
              labels={["Coca-Cola", "Samsung", "L'Oreal", "HP"]}
              bars={[85, 69, 53, 40]}
              yAxis={["45%", "30%", "15%", "0%"]}
            />
            <DSPieChart
              title="Revenue by department"
              slices={[
                { label: "Creative", value: 38, color: "#9D87E0" },
                { label: "Design", value: 27, color: "#5DBE8A" },
                { label: "Video", value: 21, color: "#F1C338" },
                { label: "Strategy", value: 14, color: "#4FC3E5" },
              ]}
            />
          </div>
        </Subsection>

        <Subsection title="Analytics card 2" hint="Combines a top KPI, prior-period comparison, and chart breakdown in one card. Use when the metric context is as important as the chart.">
          <div className="ds-analytics-row">
            <DSAnalyticsCardWithTotals
              eyebrow="Agency total margin"
              kpiValue="41%"
              delta="+8.5%"
              sectionLabel="Margin by client"
              labels={["Coca-Cola", "Samsung", "L'Oreal", "HP"]}
              bars={[85, 69, 53, 40]}
              baseBars={[30, 26, 19, 14]}
              yAxis={["45%", "30%", "15%", "0%"]}
              images={[
                "/assets/client-logos/coca-cola.svg",
                "/assets/client-logos/samsung.svg",
                "/assets/client-logos/loreal.svg",
                "/assets/client-logos/hp.svg",
              ]}
            />
            <DSAnalyticsCardWithTotals
              eyebrow="Agency total revenue"
              kpiValue="€1.25m"
              delta="+12.4%"
              sectionLabel="Revenue by department"
              labels={["Creative", "Design", "Video", "Strategy"]}
              bars={[93, 69, 55, 36]}
              baseBars={[33, 25, 22, 11]}
              yAxis={["€450k", "€300k", "€150k", "€0"]}
            />
            <DSAnalyticsCardWithTotals
              eyebrow="Agency total billing"
              kpiValue="€1.43m"
              delta="+18.2%"
              sectionLabel="Billing forecast · next 4 months"
              labels={["Aug", "Sep", "Oct", "Nov"]}
              bars={[62, 72, 76, 76]}
              baseBars={[24, 28, 30, 30]}
              yAxis={["€450k", "€300k", "€150k", "€0"]}
            />
          </div>
        </Subsection>

        <Subsection title="Group labels" hint="Tone-coded section headers inside the list — collapsed counts (4) and a left dot color. Use for workflow stage groupings (Awaiting, In progress, Approved, etc).">
          <div className="ds-block-card">
            <div className="doc-group-label red"><span />To approve (4)</div>
            <div className="doc-group-label blue"><span />In progress (8)</div>
            <div className="doc-group-label amber"><span />Awaiting approval (3)</div>
            <div className="doc-group-label green"><span />Approved (5)</div>
          </div>
        </Subsection>

        <Subsection title="List columns & cells" hint="The column header sits above grouped rows. Cells share patterns: title (image + strong), responsible (avatar + name), num (right-aligned), pill / pct / currency / stage / priority.">
          <div className="ds-cell-grid">
            <DSCell label="Title cell">
              <span className="doc-title-cell">
                <img src="https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=80&q=80" alt="" />
                <strong>3D Digital Banner</strong>
              </span>
            </DSCell>
            <DSCell label="Responsible cell">
              <span className="responsible-cell">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80" alt="" />
                <span>Sofia Martins</span>
              </span>
            </DSCell>
            <DSCell label="Stage cell">
              <span className="stage-tag tone-amber"><i />To be billed</span>
            </DSCell>
            <DSCell label="Pct cell">
              <span className="pct tone-green">38%</span>
            </DSCell>
            <DSCell label="Currency cell">
              <span className="currency-tag">EUR</span>
            </DSCell>
            <DSCell label="Priority cell">
              <b className="priority High">High</b>
            </DSCell>
            <DSCell label="Numeric (right) cell">
              <span className="num">€7,500</span>
            </DSCell>
            <DSCell label="Date cell">
              <mark>21 Jun 2026 18</mark>
            </DSCell>
          </div>
        </Subsection>

        <Subsection title="Complete grouped list" hint="A full assembled list — column header + multiple toned groups + rows. This is the canonical workspace body.">
          <DSCompleteList />
        </Subsection>

        <Subsection title="Cards" hint="Composed patterns — atoms combined into the cards used across the product. Each card layers icon + title + meta + body + footer chips.">
          <div className="ds-card-grid">
            <div className="ds-card-cluster">
              <h4>Project card</h4>
              <p className="ds-card-uses">Image · title · client · stage · team avatars</p>
              <article className="ds-composed-card ds-composed-project">
                <img className="ds-composed-cover" src="https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=420&q=80" alt="" />
                <div className="ds-composed-body">
                  <header>
                    <strong>Summer Assets</strong>
                    <span className="stage-tag tone-amber"><i />In progress</span>
                  </header>
                  <p>3D billboard, landing page, 15s video — animated render for large-format LED.</p>
                  <footer>
                    <div className="ds-composed-team">
                      <img className="avatar photo" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=96&q=80" alt="" />
                      <img className="avatar photo" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80" alt="" />
                      <img className="avatar photo" src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80" alt="" />
                    </div>
                    <span className="ds-composed-meta">21 Jun 2026 · Coca-Cola</span>
                  </footer>
                </div>
              </article>
            </div>

            <div className="ds-card-cluster">
              <h4>Project spotlight tile</h4>
              <p className="ds-card-uses">Cover image · stage chip · title · type</p>
              <div className="ds-spotlight-grid">
                {[
                  {
                    name: "Coca-Cola summer assets",
                    stage: "Under approval",
                    type: "Creative",
                    image: "https://images.unsplash.com/photo-1565962622954-efc7f367ea0e?auto=format&fit=crop&w=420&q=80",
                  },
                  {
                    name: "Nike hero refresh",
                    stage: "In progress",
                    type: "Digital",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=420&q=80",
                  },
                  {
                    name: "Samsung launch page",
                    stage: "In progress",
                    type: "Social media",
                    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=420&q=80",
                  },
                ].map((project) => (
                  <div
                    className="spotlight-tile"
                    key={project.name}
                    data-stage={project.stage.toLowerCase().replace(/\s+/g, "-")}
                  >
                    <img src={project.image} alt="" />
                    <span className="spotlight-stage">{project.stage}</span>
                    <small>
                      <strong>{project.name}</strong>
                      <span className="spotlight-type">{project.type}</span>
                    </small>
                  </div>
                ))}
              </div>
            </div>

            <div className="ds-card-cluster">
              <h4>Job / Deliverable</h4>
              <p className="ds-card-uses">Entity icon · title · breadcrumb · stage · priority</p>
              <article className="ds-composed-card">
                <header className="ds-composed-header" style={{ "--ds-accent": "#f6a94a", "--ds-bg": "#fdf0df" } as React.CSSProperties}>
                  <span className="ds-entity-icon">
                    <FontAwesomeIcon icon={faCommentDots} />
                  </span>
                  <div>
                    <strong>3D Billboard – Create 3D asset</strong>
                    <small>Coca-Cola / Summer Assets</small>
                  </div>
                </header>
                <div className="ds-composed-body compact">
                  <p>Animated render of the new summer can, optimised for large-format LED displays.</p>
                  <footer>
                    <span className="stage-tag tone-purple"><i />In review</span>
                    <b className="priority High">High</b>
                    <span className="ds-composed-meta">3d</span>
                  </footer>
                </div>
              </article>
            </div>

            <div className="ds-card-cluster">
              <h4>Approval queue item</h4>
              <p className="ds-card-uses">Status icon · title · sub-status</p>
              <article className="proof-list-item ds-static">
                <FontAwesomeIcon icon={faClock} />
                <div>
                  <strong>Landing Page</strong>
                  <small>Under approval</small>
                </div>
              </article>
              <article className="proof-list-item ds-static">
                <FontAwesomeIcon icon={faCommentDots} />
                <div>
                  <strong>15s Video</strong>
                  <small>In progress</small>
                </div>
              </article>
              <article className="proof-list-item ds-static">
                <FontAwesomeIcon icon={faCircleCheck} />
                <div>
                  <strong>3D Digital Banner</strong>
                  <small>Ready for delivery</small>
                </div>
              </article>
            </div>

            <div className="ds-card-cluster">
              <h4>Metric card</h4>
              <p className="ds-card-uses">Eyebrow · icon · value · trend pill</p>
              <div className="profit-mini-cards" style={{ display: "grid", gap: 12 }}>
                <article>
                  <small>Approved budget</small>
                  <strong>€15,000</strong>
                </article>
                <article>
                  <small>Billing remaining</small>
                  <strong>€7,500</strong>
                </article>
                <article>
                  <small>Margin</small>
                  <strong>38% <span className="pct tone-green" style={{ marginLeft: 6, fontSize: 11 }}>+4%</span></strong>
                </article>
              </div>
            </div>

            <div className="ds-card-cluster">
              <h4>Asset thumbnail</h4>
              <p className="ds-card-uses">Image · filename · filetype · tags</p>
              <article className="ds-composed-asset">
                <img src="https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=240&q=80" alt="" />
                <div>
                  <strong>3D-Billboard-CocaCola.jpg</strong>
                  <small>Image · 1920×1080</small>
                  <div className="ds-composed-tags">
                    <span className="tag-pill" data-tone="0">3D</span>
                    <span className="tag-pill" data-tone="1">billboard</span>
                  </div>
                </div>
              </article>
            </div>

            <div className="ds-card-cluster">
              <h4>Profitability row</h4>
              <p className="ds-card-uses">Logo · project · responsible · stage · margin · billed</p>
              <article className="ds-composed-row">
                <img src="/assets/client-logos/coca-cola.svg" alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                <div>
                  <strong>Summer Campaign</strong>
                  <small>Coca-Cola</small>
                </div>
                <span className="stage-tag tone-amber"><i />To be billed</span>
                <span className="pct tone-amber">12%</span>
                <span className="ds-composed-num">€191k</span>
              </article>
            </div>
          </div>
        </Subsection>

        <Subsection title="AI assistant" hint="Persistent launcher pinned to the platform shell's right edge.">
          <div className="ds-ai-row">
            <span className="ds-ai-launcher-static">
              <span className="ds-ai-pulse" />
              <span>Skills AI</span>
              <kbd>⌘K</kbd>
            </span>
            <p>Always anchored to the frame, scrolling with it. Click to open the chat dock; drag horizontally or resize.</p>
          </div>
        </Subsection>
      </Group>

      <Group id="motion" eyebrow="Group 04" title="Motion" description="Named animations live in styles.css and motion/transitions.ts. Reuse these — don't introduce new ones casually.">
        <Subsection title="Animation tokens" hint="Each name is the keyframe or class to reach for.">
          <div className="ds-motion-grid">
            {motionTokens.map((m) => (
              <div className="ds-motion-card" key={m.name}>
                <code>{m.name}</code>
                <small>{m.duration}</small>
                <p>{m.usage}</p>
              </div>
            ))}
          </div>
        </Subsection>
      </Group>

      <footer className="design-system-footer">
        <p>Generated from the entity model in <code>src/data/cocaColaCampaign.ts</code> and components under <code>src/components/product</code>. Update both to keep this page accurate.</p>
      </footer>
    </div>
  );
}

function Group({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="design-system-group" id={id}>
      <header className="design-system-group-header">
        <span className="design-system-group-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="design-system-group-body">{children}</div>
    </section>
  );
}

function Subsection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="design-system-subsection">
      <header>
        <h3>{title}</h3>
        {hint && <p>{hint}</p>}
      </header>
      <div>{children}</div>
    </section>
  );
}

function DSTabStrip({ tabs }: { tabs: string[] }) {
  return (
    <nav className="ds-tab-strip" aria-label="Tabs">
      {tabs.map((tab, idx) => (
        <button key={tab} className={idx === 0 ? "active" : ""} type="button">
          {tab}
        </button>
      ))}
    </nav>
  );
}

export function DSAnalyticsCard({
  title,
  labels,
  bars,
  yAxis,
}: {
  title: string;
  labels: string[];
  bars: number[];
  yAxis?: string[];
}) {
  return (
    <article className="workspace-chart-card ds-analytics-card">
      <header>{title}</header>
      <div className="mini-bar-chart">
        {yAxis && (
          <ul className="mini-bar-yaxis" aria-hidden="true">
            {yAxis.map((label) => (
              <li key={label} data-label={label} />
            ))}
          </ul>
        )}
        {bars.map((height, index) => (
          <div className="mini-bar-item" key={`${title}-${index}`}>
            <span style={{ "--bar-height": `${height}%` } as React.CSSProperties} />
            <small>{labels[index] ?? index + 1}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function DSAnalyticsCardWithTotals({
  eyebrow,
  kpiValue,
  subtitle,
  delta,
  deltaTone = "positive",
  sectionLabel,
  labels,
  bars,
  baseBars,
  yAxis,
  images,
}: {
  eyebrow: string;
  kpiValue: string;
  subtitle?: string;
  delta?: string;
  deltaTone?: "positive" | "negative";
  sectionLabel: string;
  labels: string[];
  bars: number[];
  baseBars?: number[];
  yAxis?: string[];
  images?: string[];
}) {
  return (
    <article className="workspace-chart-card ds-analytics-card with-totals">
      <div className="chart-card-totals">
        <div className="chart-card-totals-top">
          <span className="chart-card-eyebrow">{eyebrow}</span>
          {delta && (
            <span className={`chart-card-delta ${deltaTone}`}>
              <span aria-hidden="true">↗</span>
              {delta}
            </span>
          )}
        </div>
        <strong className="chart-card-kpi">{kpiValue}</strong>
        {subtitle && <span className="chart-card-subtitle">{subtitle}</span>}
        <span className="chart-card-section-label">{sectionLabel}</span>
      </div>
      <div className="mini-bar-chart">
        {yAxis && (
          <ul className="mini-bar-yaxis" aria-hidden="true">
            {yAxis.map((label) => (
              <li key={label} data-label={label} />
            ))}
          </ul>
        )}
        {bars.map((height, index) => {
          const baseHeight = baseBars?.[index];
          const baseRatio = baseHeight !== undefined && height > 0
            ? Math.min(100, Math.max(0, (baseHeight / height) * 100))
            : null;
          const style: React.CSSProperties = { "--bar-height": `${height}%` } as React.CSSProperties;
          if (baseRatio !== null) {
            (style as React.CSSProperties & Record<string, string>)["--bar-base-pct"] = `${baseRatio}%`;
          }
          return (
            <div className="mini-bar-item" key={`${eyebrow}-${index}`}>
              <span style={style} />
              {images?.[index] ? (
                <img src={images[index]} alt={labels[index] ?? ""} />
              ) : (
                <small>{labels[index] ?? index + 1}</small>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function DSPieChart({
  title,
  slices,
  valueFormat = "percent",
}: {
  title: string;
  slices: Array<{ label: string; value: number; color: string }>;
  valueFormat?: "percent" | "euro";
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let cursor = 0;
  const stops = slices.map((s) => {
    const start = (cursor / total) * 100;
    cursor += s.value;
    const end = (cursor / total) * 100;
    return `${s.color} ${start}% ${end}%`;
  });
  const gradient = `conic-gradient(${stops.join(", ")})`;

  const formatValue = (v: number) => {
    if (valueFormat === "euro") {
      if (v >= 1000) return `€${(v / 1000).toFixed(1)}m`;
      return `€${v}k`;
    }
    return `${Math.round((v / total) * 100)}%`;
  };

  return (
    <article className="workspace-chart-card ds-pie-card">
      <header>{title}</header>
      <div className="ds-pie-body">
        <div className="ds-pie" style={{ background: gradient }} />
        <ul className="ds-pie-legend">
          {slices.map((s) => (
            <li key={s.label}>
              <span className="ds-pie-dot" style={{ background: s.color }} />
              <span>{s.label}</span>
              <strong>{formatValue(s.value)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function DSCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ds-cell-card">
      <small>{label}</small>
      <div>{children}</div>
    </div>
  );
}

function DSCompleteList() {
  const groups = [
    {
      label: "To approve (2)",
      tone: "red",
      rows: [
        { title: "Estimate / Budget approval", image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=80&q=80", type: "Job", company: "Coca-Cola", department: "Account", classification: "€15,000", date: "04 Jun 2026 12", priority: "High" as const },
        { title: "Brief review", image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=80&q=80", type: "Job", company: "Coca-Cola", department: "Creative", classification: "Summer Assets", date: "06 Jun 2026 15", priority: "Medium" as const },
      ],
    },
    {
      label: "In progress (3)",
      tone: "blue",
      rows: [
        { title: "Landing Page", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=80&q=80", type: "Deliverable", company: "Coca-Cola", department: "Design", classification: "Website", date: "18 Jun 2026 18", priority: "High" as const },
        { title: "15s Video", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=80&q=80", type: "Deliverable", company: "Coca-Cola", department: "Video", classification: "Video", date: "20 Jun 2026 18", priority: "Medium" as const },
        { title: "3D Digital Banner", image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=80&q=80", type: "Deliverable", company: "Coca-Cola", department: "Design", classification: "3D Banner", date: "21 Jun 2026 18", priority: "Medium" as const },
      ],
    },
    {
      label: "Approved (1)",
      tone: "green",
      rows: [
        { title: "Final Delivery", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=80&q=80", type: "Document", company: "Coca-Cola", department: "Client Services", classification: "Delivery", date: "24 Jun 2026 15", priority: "Low" as const },
      ],
    },
  ];
  return (
    <div className="ds-component-frame">
      <ListTable groups={groups} />
    </div>
  );
}
