import { campaign, projectWorkItems } from "../../data/cocaColaCampaign";

type CalendarCell = {
  date: string;
  inMonth?: boolean;
  items?: Array<{
    title: string;
    owner: string;
    tone: "purple" | "blue" | "teal" | "gold" | "green";
  }>;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toneByColor = {
  blue: "blue",
  cyan: "gold",
  gold: "green",
  green: "teal",
} as const;

const dayByTaskTitle: Record<string, string> = {
  "Define idea": "03",
  "Quick client approval": "06",
  "Design landing page": "08",
  "Build page": "13",
  "Edit 15s video": "16",
  "Create 3D asset": "18",
  "Final approval": "22",
  "Deliver files": "25",
};

const calendarCells: CalendarCell[] = [
  { date: "31", inMonth: false },
  { date: "01" },
  { date: "02" },
  { date: "03" },
  { date: "04" },
  { date: "05" },
  { date: "06" },
  { date: "07" },
  { date: "08", items: [{ title: "Design landing page", owner: "Arthur", tone: "blue" }] },
  { date: "09" },
  { date: "10" },
  { date: "11" },
  { date: "12", items: [{ title: "Build page", owner: "Arthur", tone: "teal" }] },
  { date: "13" },
  { date: "14" },
  { date: "15" },
  { date: "16", items: [{ title: "Edit 15s video", owner: "Daniel", tone: "gold" }] },
  { date: "17" },
  { date: "18", items: [{ title: "Create 3D asset", owner: "Arthur", tone: "green" }] },
  { date: "19" },
  { date: "20" },
  { date: "21" },
  { date: "22", items: [{ title: "Final approval", owner: "Rachel", tone: "teal" }] },
  { date: "23" },
  { date: "24" },
  { date: "25", items: [{ title: "Deliver files", owner: "Rachel", tone: "blue" }] },
  { date: "26" },
  { date: "27" },
  { date: "28" },
  { date: "29" },
  { date: "30" },
  { date: "01", inMonth: false },
  { date: "02", inMonth: false },
  { date: "03", inMonth: false },
  { date: "04", inMonth: false },
  { date: "05", inMonth: false },
].map((cell) => ({
  ...cell,
  items: projectWorkItems
    .filter((item) => dayByTaskTitle[item.name] === cell.date)
    .map((item) => ({
      title: item.name,
      owner: item.owner,
      tone: toneByColor[item.color as keyof typeof toneByColor] ?? "purple",
    })),
}));

export function ProjectCalendarView() {
  return (
    <div className="project-calendar-view">
      <div className="project-calendar-controls">
        <div className="project-calendar-filter">
          <small>Date</small>
          <button type="button">End Date</button>
        </div>
        <div className="project-calendar-monthbar">
          <button type="button" aria-label="Previous month">‹</button>
          <strong>June 2026</strong>
          <button type="button" aria-label="Next month">›</button>
        </div>
      </div>

      <div className="project-calendar-board">
        {weekdayLabels.map((label) => (
          <div className="project-calendar-weekday" key={label}>
            {label}
          </div>
        ))}

        {calendarCells.map((cell, index) => (
          <div className={cell.inMonth === false ? "project-calendar-daycell muted" : "project-calendar-daycell"} key={`${cell.date}-${index}`}>
            <span className="project-calendar-date">{cell.date}</span>
            <div className="project-calendar-events">
              {cell.items?.map((item) => {
                const person = campaign.team.find((member) => member.name === item.owner);

                return (
                  <article className={`project-calendar-event ${item.tone}`} key={`${cell.date}-${item.title}`}>
                    {person && <img className="avatar photo" src={person.avatar} alt={person.name} />}
                    <span>{item.title}</span>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
