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
                {campaign.client} <span>/</span> 2026 <span>/</span> Contract <span>/</span> Summer Refresh
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
    "Global Account Director",
    "Department Lead Creative",
    "Department Lead Digital",
    "Department Lead Broadcast",
    "Finance Manager",
  ];
  const history = [
    { name: "Arthur", time: "15:01", action: "moved stage to", stage: "Approved" },
    { name: "Arthur", time: "14:45", action: "moved stage to", stage: "Client Approval" },
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
              <p>Excited to present the estimate for the Coca-Cola 3D OOH Summer Refresh campaign.</p>
              <p>
                <strong>Scope:</strong><br />
                Conceptualization and design<br />
                Artwork development<br />
                Location planning<br />
                Social media strategy<br />
                Analytics
              </p>
              <p>
                <strong>Assets:</strong><br />
                Logo variations<br />
                Beverage visuals<br />
                Bottle imagery<br />
                Lifestyle shots
              </p>
              <p>
                <strong>Timeline:</strong><br />
                Within this week starting from 22nd November
              </p>
              <p>
                <strong>Cost:</strong><br />
                TBD, in progress
              </p>
              <div className="feed-documents">
                <article>
                  <img
                    src="https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=180&q=80"
                    alt="Coca-Cola creative preview"
                  />
                  <div>
                    <strong>3D billboard reference</strong>
                    <small>Image</small>
                  </div>
                </article>
                <article>
                  <span><FontAwesomeIcon icon={faFileImage} /></span>
                  <div>
                    <strong>Summer campaign moodboard</strong>
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
                  <span>23 November 2026</span>
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
            <small>11 October 2026, 13:31</small>
          </header>
          <div>
            <strong>Stage</strong>
            <span><i /> Approved</span>
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
            { title: "Client kickoff meeting", type: "Meeting", department: "Client Services", classification: "Summer Campaign", date: "03 Jun 2026 10", priority: "High" },
            { title: "Budget confirmation", type: "Job", department: "Account", classification: "Coca-Cola", date: "04 Jun 2026 12", priority: "High" },
          ],
        },
        {
          label: "Approved (4)",
          tone: "green",
          rows: [
            { title: "Creative concept", type: "Task", department: "Creative Services", classification: "Summer Campaign", date: "07 Jun 2026 18", priority: "Medium" },
            { title: "Key visual design", type: "Task", department: "Design", classification: "Summer Campaign", date: "10 Jun 2026 18", priority: "Medium" },
            { title: "Retail poster system", type: "Task", department: "Production", classification: "Summer Campaign", date: "14 Jun 2026 18", priority: "Low" },
            { title: "15s motion cutdowns", type: "Task", department: "Audiovisual", classification: "Summer Campaign", date: "18 Jun 2026 18", priority: "Medium" },
          ],
        },
        {
          label: "Under approval (1)",
          tone: "blue",
          rows: [
            { title: "Final client proof", type: "Approval", department: "Client Services", classification: "Coca-Cola", date: "22 Jun 2026 15", priority: "None" },
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
          ["Campaign", campaign.campaign],
          ["Owner", campaign.request.receivedFrom],
          ["Budget range", campaign.request.budgetRange],
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
        { title: "Shelf Banner", brand: "Coca Cola", campaign: "Summer Campaign", channel: "Direct Mail", status: "To Do", dueDate: "06/18", comments: 0, reference: "COCA0040Print(" },
        { title: "Retail Kit", brand: "Coca Cola", campaign: "Summer Campaign", channel: "Retail", status: "To Do", dueDate: "06/20", comments: 2, reference: "COCA0041Retail" },
      ],
    },
    {
      title: "In progress",
      tone: "gold",
      cards: [
        { title: "Creative Concept", brand: "Coca Cola", campaign: "Summer Campaign", channel: "Social", status: "Doing", dueDate: "06/19", comments: 3, reference: "COCA0058Social" },
        { title: "OOH Adaptation", brand: "Coca Cola", campaign: "Summer Campaign", channel: "OOH", status: "Doing", dueDate: "06/22", comments: 1, reference: "COCA0064OOH" },
      ],
    },
    {
      title: "Internal review",
      tone: "green",
      cards: [
        { title: "Motion Cutz", brand: "Coca Cola", campaign: "Summer Campaign", channel: "Video", status: "Review", dueDate: "06/23", comments: 4, reference: "COCA0071Video" },
      ],
    },
    {
      title: "Client approval",
      tone: "red",
      cards: [
        { title: "Final Proof", brand: "Coca Cola", campaign: "Summer Campaign", channel: "Approval", status: "Awaiting", dueDate: "06/25", comments: 1, reference: "COCA0080Proof" },
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
            { title: "Summer Refresh KV v3", type: "File", department: "Design", classification: "Proofing", date: "18 Jun 2026 18", priority: "High" },
            { title: "Retail poster master", type: "File", department: "Production", classification: "Proofing", date: "19 Jun 2026 16", priority: "Medium" },
            { title: "15s motion cutdown", type: "File", department: "Audiovisual", classification: "Proofing", date: "20 Jun 2026 15", priority: "Medium" },
          ],
        },
      ]}
    />
  );
}

function ProfitabilityTabView() {
  const rows = [
    ["Revenue forecast", "GBP 94.7k", "Approved", "41%"],
    ["Planned cost", "GBP 55.9k", "In progress", "32%"],
    ["Billing remaining", "GBP 31.2k", "To invoice", "18%"],
    ["Actual hours", "126h", "Tracked", "86%"],
  ];

  return (
    <div className="document-profit-tab">
      <div className="profit-mini-cards">
        <article><small>Gross margin</small><strong>41%</strong></article>
        <article><small>Forecast</small><strong>GBP 94.7k</strong></article>
        <article><small>Remaining</small><strong>GBP 31.2k</strong></article>
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
              <span>{row.classification ?? row.owner ?? "Summer Campaign"}</span>
              <span><mark>{row.date ?? "05 May 2026 00"}</mark></span>
              <span><b className={`priority ${row.priority ?? "Medium"}`}>{row.priority ?? "Medium"}</b></span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
