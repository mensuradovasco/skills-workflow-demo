import { faChartGantt } from "@fortawesome/free-solid-svg-icons";
import { DocumentFrame } from "./DocumentFrame";
import { GanttView } from "./GanttView";

type ProjectSetupProps = {
  initialTab?: string;
};

export function ProjectSetup({ initialTab }: ProjectSetupProps) {
  return (
    <DocumentFrame
      activeTab="GANTT"
      accent="#bdb2f4"
      icon={faChartGantt}
      initialTab={initialTab}
      tabs={["FEED", "INFO", "JOBS", "KANBAN", "GANTT", "PROFITABILITY"]}
      title="Coca-Cola - Summer Assets"
    >
      <GanttView />
    </DocumentFrame>
  );
}
