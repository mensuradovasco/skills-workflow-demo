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
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { campaign } from "../../data/cocaColaCampaign";

type DocumentFrameProps = {
  activeTab?: string;
  accent?: string;
  children: ReactNode;
  hideToolbar?: boolean;
  icon?: IconDefinition;
  initialTab?: string;
  tabs?: string[];
  title?: string;
};

const defaultTabs = ["FEED", "INFO", "JOBS", "FILES", "GANTT", "PROFITABILITY"];

export function DocumentFrame({
  accent = "#bdb2f4",
  activeTab = "ACTIVITIES",
  children,
  hideToolbar = false,
  icon = faFileLines,
  initialTab,
  tabs = defaultTabs,
  title = campaign.campaign,
}: DocumentFrameProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab ?? activeTab);
  const style = { "--doc-accent": accent } as CSSProperties;

  useEffect(() => {
    setSelectedTab(initialTab ?? activeTab);
  }, [activeTab, initialTab]);

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
                {campaign.organization} <span>/</span> Projects <span>/</span> {campaign.campaign}
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
              key={tab}
              onClick={() => setSelectedTab(tab)}
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
      {renderTabContent(selectedTab, activeTab, children)}
    </section>
  );
}

function renderTabContent(selectedTab: string, activeTab: string, children: ReactNode) {
  if (selectedTab === "FEED") return <FeedDocumentView />;

  if (selectedTab === activeTab) return children;

  if (["JOBS", "TASKS", "WORKFLOW", "ESTIMATES"].includes(selectedTab)) {
    return <JobsListView />;
  }

  if (selectedTab === "KANBAN") {
    return <ProjectKanbanView />;
  }

  if (selectedTab === "PROFITABILITY" || selectedTab === "BILLS" || selectedTab === "PLANNED COSTS") {
    return <ProfitabilityTabView />;
  }

  if (selectedTab === "FILES" || selectedTab === "PROOFING" || selectedTab === "APPROVALS") {
    return <FilesListView />;
  }

  return <InfoListView tab={selectedTab} />;
}

export function FeedDocumentView() {
  const requester = campaign.team[0];
  const responsible = campaign.team.slice(0, 3);
  const executors = campaign.team.slice(1);
  const associated = campaign.team.slice(0, 2);
  const checklist = [
    "Client Request / Brief",
    "Estimate / Budget",
    "Project Plan",
    "Creative Brief",
    "Delivery List",
  ];
  const history = [
    { name: "Rachel", time: "15:01", action: "moved estimate to", stage: "Approved" },
    { name: "Arthur", time: "14:45", action: "started", stage: "Landing Page" },
  ];

  return (
    <div className="document-feed">
      <main className="feed-main">
        <section className="feed-description">
          <header>
            <span><FontAwesomeIcon icon={faFileLines} /></span>
            <strong>Description</strong>
          </header>
          <div className="feed-description-box">
            <div className="feed-description-content">
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
              <div className="feed-documents">
                <article>
                  <img
                    src="https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=180&q=80"
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
            </div>
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
          </div>
        </section>

        <section className="feed-composer">
          <div>
            <img className="avatar photo" src={requester.avatar} alt="" />
            <span>Click to start typing. Say something, assign people or drag a file.</span>
            <nav>
              <button aria-label="More actions"><FontAwesomeIcon icon={faEllipsisVertical} /></button>
              <button aria-label="Attach file"><FontAwesomeIcon icon={faPaperclip} /></button>
              <button aria-label="Assign people"><FontAwesomeIcon icon={faUserGroup} /></button>
              <button aria-label="Add tag"><FontAwesomeIcon icon={faTag} /></button>
            </nav>
          </div>
        </section>

        <section className="feed-history">
          <header>
            <span>24 March</span>
            <label><FontAwesomeIcon icon={faMagnifyingGlass} /><input placeholder="Search..." /></label>
          </header>
          {history.map((item) => (
            <article key={`${item.name}-${item.time}`}>
              <img className="avatar photo" src={campaign.team[1].avatar} alt="" />
              <p><strong>{item.name}</strong> <small>{item.time}</small><br />{item.action} <mark>{item.stage}</mark></p>
            </article>
          ))}
        </section>
      </main>

      <aside className="feed-side-panel">
        <section className="feed-stage-card">
          <header>
            <img className="avatar photo" src={requester.avatar} alt="" />
            <small>04 Jun 2026, 13:31</small>
          </header>
          <div>
            <strong>Stage</strong>
            <span><i /> In progress</span>
          </div>
        </section>

        <section className="feed-meta-card compact">
          <header>
            <FontAwesomeIcon icon={faTag} />
            <strong>Tags</strong>
            <button><FontAwesomeIcon icon={faPlus} /></button>
          </header>
        </section>

        <section className="feed-meta-card">
          <header>
            <FontAwesomeIcon icon={faUserGroup} />
            <strong>Team</strong>
          </header>
          <FeedTeamRow label="Requester" people={[requester]} />
          <FeedTeamRow label="Responsible" people={responsible} />
          <FeedTeamRow label="Executor" people={executors} prefix="EC" />
          <FeedTeamRow label="Associated" people={associated} client />
        </section>
      </aside>
    </div>
  );
}

function FeedTeamRow({ client, label, people, prefix }: { client?: boolean; label: string; people: typeof campaign.team; prefix?: string }) {
  return (
    <div className="feed-team-row">
      <small>{label}</small>
      <div>
        {prefix && <em>{prefix}</em>}
        {people.map((person) => (
          <img className="avatar photo" src={person.avatar} alt={person.name} key={`${label}-${person.name}`} />
        ))}
        {client && <span className="brand-avatar mini client-logo-badge"><img src={campaign.clientLogo} alt={campaign.client} /></span>}
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
      cards: [
        { title: "Define idea", brand: "Coca-Cola", campaign: campaign.campaign, channel: "Concept", status: "Approved", dueDate: "06/07", comments: 1, reference: "COCA-CONCEPT" },
        { title: "Quick client approval", brand: "Coca-Cola", campaign: campaign.campaign, channel: "Concept", status: "Approved", dueDate: "06/08", comments: 1, reference: "COCA-APPROVAL" },
      ],
    },
    {
      title: "In progress",
      tone: "gold",
      cards: [
        { title: "Design landing page", brand: "Coca-Cola", campaign: campaign.campaign, channel: "Website", status: "Doing", dueDate: "06/18", comments: 3, reference: "COCA-WEB-DESIGN" },
        { title: "Build page", brand: "Coca-Cola", campaign: campaign.campaign, channel: "Website", status: "Doing", dueDate: "06/19", comments: 1, reference: "COCA-WEB-BUILD" },
      ],
    },
    {
      title: "Internal review",
      tone: "green",
      cards: [
        { title: "Edit 15s video", brand: "Coca-Cola", campaign: campaign.campaign, channel: "Video", status: "Review", dueDate: "06/20", comments: 4, reference: "COCA-VIDEO-15" },
        { title: "Create 3D asset", brand: "Coca-Cola", campaign: campaign.campaign, channel: "3D Banner", status: "Review", dueDate: "06/21", comments: 2, reference: "COCA-3D-BANNER" },
      ],
    },
    {
      title: "Client approval",
      tone: "red",
      cards: [
        { title: "Final approval", brand: "Coca-Cola", campaign: campaign.campaign, channel: "Delivery", status: "Awaiting", dueDate: "06/24", comments: 1, reference: "COCA-FINAL" },
      ],
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
            <article className="kanban-card" key={card.reference}>
              <div className="kanban-card-strip">
                <span><FontAwesomeIcon icon={faListCheck} /></span>
                <strong>{card.title}</strong>
              </div>
              <div className="kanban-card-body">
                <div className="kanban-card-line">
                  <span className="kanban-card-icon brand"><img src={campaign.clientLogo} alt="" /></span>
                  <p>{card.brand}</p>
                </div>
                <div className="kanban-card-line">
                  <span className="kanban-card-icon campaign"><FontAwesomeIcon icon={faClipboardCheck} /></span>
                  <p>{card.campaign}</p>
                </div>
                <span className="kanban-card-chip">{card.channel}</span>
                <div className="kanban-card-status">
                  <FontAwesomeIcon icon={faCircle} />
                  <span>{card.status}</span>
                </div>
                <div className="kanban-card-meta">
                  <span className="date"><FontAwesomeIcon icon={faCalendarDays} />{card.dueDate}</span>
                  <span className="comments"><FontAwesomeIcon icon={faCommentDots} />{card.comments}</span>
                  <div className="kanban-card-avatars">
                    {campaign.team.slice(0, index % 2 === 0 ? 3 : 2).map((member) => (
                      <img className="avatar photo" src={member.avatar} alt="" key={member.name} />
                    ))}
                  </div>
                  <small>{card.reference}</small>
                </div>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
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

type ListTableProps = {
  groups: Array<{ label: string; rows: ListRow[]; tone?: string }>;
};

export function ListTable({ groups }: ListTableProps) {
  return (
    <div className="document-table">
      <div className="doc-row doc-head">
        <span>Title</span>
        <span>Type</span>
        <span>Company</span>
        <span>Division</span>
        <span>Department</span>
        <span>Classification</span>
        <span>Due date</span>
        <span>Priority</span>
      </div>
      {groups.map((group) => (
        <div className="doc-group" key={group.label}>
          <div className={`doc-group-label ${group.tone ?? ""}`}>
            <span />
            {group.label}
          </div>
          {group.rows.map((row) => (
            <div className="doc-row" key={`${group.label}-${row.title}`}>
              <span className="doc-title-cell">
                {row.image && <img src={row.image} alt="" />}
                <strong>{row.title}</strong>
              </span>
              <span>{row.type ?? "Task"}</span>
              <span>{row.company ?? "Company 1"}</span>
              <span>{row.division ?? "Brazil"}</span>
              <span>{row.department ?? "Client Services"}</span>
              <span>{row.classification ?? row.owner ?? campaign.campaign}</span>
              <span><mark>{row.date ?? "05 May 2026 00"}</mark></span>
              <span><b className={`priority ${row.priority ?? "Medium"}`}>{row.priority ?? "Medium"}</b></span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
