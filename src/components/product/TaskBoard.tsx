import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { DocumentFrame } from "./DocumentFrame";
import { GanttView } from "./GanttView";

type TaskBoardProps = {
  initialTab?: string;
};

export function TaskBoard({ initialTab }: TaskBoardProps) {
  return (
    <DocumentFrame
      activeTab="GANTT"
      accent="#bdb2f4"
      icon={faListCheck}
      initialTab={initialTab}
      tabs={["FEED", "INFO", "TASKS", "KANBAN", "GANTT", "FILES"]}
      title="Task Plan"
    >
      <GanttView />
    </DocumentFrame>
  );
}
