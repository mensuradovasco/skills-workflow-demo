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
import { campaign } from "../../data/cocaColaCampaign";
import { DocumentFrame } from "./DocumentFrame";

type BacklogItem = {
  color: string;
  days: string;
  id: string;
  title: string;
};

const calendarDays = ["25", "26", "27", "28", "29", "30", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];

const initialBacklog: BacklogItem[] = [
  { id: "kv", title: "Key visual design", days: "4d", color: "#56b9e5" },
  { id: "copy", title: "Social copy routes", days: "3d", color: "#bdb2f4" },
  { id: "retail", title: "Retail POS toolkit", days: "6d", color: "#68c39f" },
  { id: "motion", title: "15s motion cutdowns", days: "5d", color: "#f4a94a" },
  { id: "ooh", title: "OOH artwork adapts", days: "4d", color: "#4c7bd9" },
  { id: "report", title: "Launch report setup", days: "2d", color: "#70c44f" },
];

const baseBookings = [
  { person: "Arthur", title: "KV design", start: 0, span: 7, color: "#56b9e5" },
  { person: "Arthur", title: "OOH adapts", start: 8, span: 9, color: "#4c7bd9" },
  { person: "Maya", title: "Copy routes", start: 1, span: 6, color: "#bdb2f4" },
  { person: "Maya", title: "Proof copy", start: 9, span: 4, color: "#7aa66a" },
  { person: "Daniel", title: "Motion prep", start: 13, span: 8, color: "#f4a94a" },
  { person: "Ellen", title: "Client review", start: 16, span: 7, color: "#58b8e4" },
];

export function ResourcePlanner() {
  const [backlog, setBacklog] = useState(initialBacklog);
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
      <div className="allocation-document">
        <div className="allocation-toolbar">
          <button><FontAwesomeIcon icon={faFilter} /> Auto</button>
          <label><FontAwesomeIcon icon={faMagnifyingGlass} /><input placeholder="Search" /></label>
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
              {campaign.team.concat([{ ...campaign.team[0], name: "Ellen", role: "Account Director", skill: "Planning", load: 58 }]).map((person) => (
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
                    {baseBookings.filter((booking) => booking.person === person.name).map((booking) => (
                      <span
                        className="allocation-bar"
                        key={`${booking.person}-${booking.title}`}
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
            <p>Drag a campaign task onto a resource row to adjust the plan.</p>
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
                  <small>{item.days}</small>
                </div>
              </article>
            ))}
          </aside>
        </div>
      </div>
    </DocumentFrame>
  );
}
