import { faChartGantt } from "@fortawesome/free-solid-svg-icons";
import { DocumentFrame } from "./DocumentFrame";
import { GanttView } from "./GanttView";
import { ProjectCalendarView } from "./ProjectCalendarView";
import { ProjectPeopleJobsView } from "./ProjectPeopleJobsView";

type ProjectSetupProps = {
  initialTab?: string;
};

export function ProjectSetup({ initialTab }: ProjectSetupProps) {
  return (
    <DocumentFrame
      activeTab="GANTT"
      accent="#bdb2f4"
      calendarContent={<ProjectCalendarView />}
      hideToolbar
      icon={faChartGantt}
      initialTab={initialTab}
      jobsContent={<ProjectPeopleJobsView />}
      tabAnchors={{
        GANTT: "project-gantt-tab",
        "KANBAN BY PERSON": "project-jobs-tab",
        CALENDAR: "project-calendar-tab",
        KANBAN: "project-kanban-tab",
      }}
      tabs={["FEED", "INFO", "GANTT", "KANBAN", "KANBAN BY PERSON", "CALENDAR", "PROFITABILITY"]}
      title="Coca-Cola - Summer Assets"
    >
      <GanttView />
    </DocumentFrame>
  );
}
