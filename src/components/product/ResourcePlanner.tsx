import { type CSSProperties, type DragEvent, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faCalendarDays,
  faChevronLeft,
  faChevronRight,
  faFilter,
  faGripVertical,
  faMagnifyingGlass,
  faPeopleArrows,
  faTableCells,
} from "@fortawesome/free-solid-svg-icons";
import { campaign, projectWorkItems, resourceBookings } from "../../data/cocaColaCampaign";
import { DocumentFrame } from "./DocumentFrame";

type BacklogItem = {
  color: string;
  days: string;
  id: string;
  kind: string;
  title: string;
};

const calendarDays = ["25", "26", "27", "28", "29", "30", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];

const initialBacklog: BacklogItem[] = [
  { id: "landing-page", title: "Landing Page", kind: "Deliverable", days: "9d", color: "#56b9e5" },
  { id: "landing-design", title: "Design landing page", kind: "Website task", days: "4d", color: "#68c39f" },
  { id: "landing-build", title: "Build page", kind: "Website task", days: "5d", color: "#4c7bd9" },
  { id: "video", title: "15s Video", kind: "Deliverable", days: "4d", color: "#f4a94a" },
  { id: "banner", title: "3D Digital Banner", kind: "Deliverable", days: "3d", color: "#7aa66a" },
  { id: "delivery", title: "Delivery List", kind: "Document", days: "1d", color: "#70c44f" },
];

const resourcePeople = [
  ...campaign.team,
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
  {
    name: "Sofia",
    role: "Producer",
    load: 64,
    skill: "Planning",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=96&q=80",
  },
];

export function ResourcePlanner() {
  const [backlog, setBacklog] = useState(
    initialBacklog.map((item) => {
      const match = projectWorkItems.find((task) => task.name === item.title);
      return match ? { ...item, days: match.duration } : item;
    }),
  );
  const [dropped, setDropped] = useState<Array<BacklogItem & { person: string; start: number }>>([]);

  const handleDrop = (event: DragEvent<HTMLDivElement>, person: string, start: number) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain");
    const item = backlog.find((entry) => entry.id === itemId);
    if (!item) return;
    setBacklog((items) => items.filter((entry) => entry.id !== itemId));
    setDropped((items) => [...items, { ...item, person, start }]);
  };

  return (
    <DocumentFrame
      activeTab="RESOURCES"
      accent="#63c7c0"
      icon={faPeopleArrows}
      tabs={["FEED", "INFO", "GANTT", "RESOURCES", "HOURS", "CALENDAR"]}
      title="Resource Allocation"
    >
      <div className="allocation-document" data-tour-anchor="resource-planning">
        <div className="allocation-toolbar">
          <button><FontAwesomeIcon icon={faFilter} /> Auto</button>
          <label data-tour-anchor="resource-search"><FontAwesomeIcon icon={faMagnifyingGlass} /><input placeholder="Search" /></label>
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
            <div className="allocation-rows">
              {resourcePeople.map((person) => (
                <div
                  className="allocation-row"
                  key={person.name}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, person.name, 11)}
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
                    {resourceBookings.filter((booking) => booking.person === person.name).map((booking) => (
                      <span
                        className="allocation-bar"
                        key={`${booking.person}-${booking.project}-${booking.title}`}
                        style={{ "--bar-color": booking.color, "--bar-start": booking.start, "--bar-span": booking.span } as CSSProperties}
                      >
                        {booking.title}
                      </span>
                    ))}
                    {dropped.filter((item) => item.person === person.name).map((item) => (
                      <span
                        className="allocation-bar dropped"
                        key={item.id}
                        style={{ "--bar-color": item.color, "--bar-start": item.start, "--bar-span": 4 } as CSSProperties}
                      >
                        {item.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="allocation-backlog">
            <h4>Unassigned work</h4>
            <p>Drag a Coca-Cola task onto a resource row to compare this project with other bookings.</p>
            {backlog.map((item) => (
              <article
                draggable
                className="allocation-backlog-card"
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
    </DocumentFrame>
  );
}
