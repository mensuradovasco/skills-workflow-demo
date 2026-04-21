import { type MouseEvent, useEffect, useState } from "react";
import { campaign } from "../../data/cocaColaCampaign";

type GanttRow = {
  color: string;
  duration: string;
  end: string;
  left: number;
  name: string;
  progress: string;
  stage: string;
  start: string;
  type: string;
  wbs: string;
  width: number;
};

const initialRows: GanttRow[] = [
  { wbs: "1", name: "Concept", type: "Phase", stage: "Approved", start: "03 Jun", end: "07 Jun", duration: "4 days", left: 2, width: 12, color: "green", progress: "100%" },
  { wbs: "1.1", name: "Define idea", type: "Task", stage: "Approved", start: "03 Jun", end: "05 Jun", duration: "2 days", left: 2, width: 6, color: "green", progress: "100%" },
  { wbs: "1.2", name: "Quick client approval", type: "Approval", stage: "Approved", start: "06 Jun", end: "07 Jun", duration: "1 day", left: 8, width: 4, color: "green", progress: "100%" },
  { wbs: "2", name: "Website", type: "Phase", stage: "In progress", start: "08 Jun", end: "18 Jun", duration: "10 days", left: 15, width: 26, color: "blue", progress: "55%" },
  { wbs: "2.1", name: "Design landing page", type: "Design", stage: "In progress", start: "08 Jun", end: "12 Jun", duration: "4 days", left: 15, width: 12, color: "blue", progress: "70%" },
  { wbs: "2.2", name: "Build page", type: "Build", stage: "In progress", start: "13 Jun", end: "18 Jun", duration: "5 days", left: 28, width: 13, color: "blue", progress: "35%" },
  { wbs: "3", name: "Video", type: "Phase", stage: "In progress", start: "16 Jun", end: "20 Jun", duration: "4 days", left: 39, width: 13, color: "cyan", progress: "30%" },
  { wbs: "3.1", name: "Edit 15s video", type: "Edit", stage: "In progress", start: "16 Jun", end: "20 Jun", duration: "4 days", left: 39, width: 13, color: "cyan", progress: "30%" },
  { wbs: "4", name: "3D Banner", type: "Phase", stage: "Queued", start: "18 Jun", end: "21 Jun", duration: "3 days", left: 53, width: 10, color: "gold", progress: "0%" },
  { wbs: "4.1", name: "Create 3D asset", type: "Design", stage: "Queued", start: "18 Jun", end: "21 Jun", duration: "3 days", left: 53, width: 10, color: "gold", progress: "0%" },
  { wbs: "5", name: "Delivery", type: "Phase", stage: "Ready for delivery", start: "22 Jun", end: "25 Jun", duration: "3 days", left: 68, width: 14, color: "green", progress: "" },
  { wbs: "5.1", name: "Final approval", type: "Approval", stage: "Client review", start: "22 Jun", end: "24 Jun", duration: "2 days", left: 68, width: 8, color: "blue", progress: "" },
  { wbs: "5.2", name: "Deliver files", type: "Delivery", stage: "Ready", start: "25 Jun", end: "25 Jun", duration: "1 day", left: 78, width: 4, color: "green", progress: "" },
];

export function GanttView() {
  const [items, setItems] = useState(initialRows);
  const [interaction, setInteraction] = useState<{
    chartWidth: number;
    index: number;
    left: number;
    mode: "move" | "start" | "end";
    startX: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!interaction) return;

    const handleMove = (event: globalThis.MouseEvent) => {
      const delta = ((event.clientX - interaction.startX) / interaction.chartWidth) * 100;
      setItems((current) => current.map((item, index) => {
        if (index !== interaction.index) return item;

        if (interaction.mode === "move") {
          const left = clamp(interaction.left + delta, 0, 100 - interaction.width);
          return { ...item, left };
        }

        if (interaction.mode === "start") {
          const left = clamp(interaction.left + delta, 0, interaction.left + interaction.width - 3);
          const width = clamp(interaction.width + (interaction.left - left), 3, 100 - left);
          return { ...item, left, width };
        }

        const width = clamp(interaction.width + delta, 3, 100 - interaction.left);
        return { ...item, width };
      }));
    };

    const handleUp = () => setInteraction(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [interaction]);

  const startInteraction = (
    event: MouseEvent<HTMLElement>,
    index: number,
    mode: "move" | "start" | "end",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const chart = event.currentTarget.closest(".gantt-chart");
    const chartWidth = chart?.clientWidth ?? 560;
    const item = items[index];
    setInteraction({
      chartWidth,
      index,
      left: item.left,
      mode,
      startX: event.clientX,
      width: item.width,
    });
  };

  return (
    <div className="gantt-view">
      <div className="gantt-toolbar">
        <label>Select or search by typing...</label>
        <div>
          <button>Tree</button>
          <button>Project status</button>
          <button>Resources utilization</button>
          <button>Time sheets</button>
        </div>
      </div>
      <div className="gantt-board">
        <div className="gantt-table">
          <div className="gantt-row gantt-head">
            <span>#</span>
            <span>WBS</span>
            <span>Name</span>
            <span>Start date</span>
            <span>End date</span>
            <span>Duration</span>
            <span>Type</span>
            <span>Executors</span>
            <span>Stage</span>
          </div>
          {items.map((row, index) => (
            <div className="gantt-row" key={`${row.wbs}-${row.name}`}>
              <span>{index + 1}</span>
              <span>{row.wbs}</span>
              <strong>{row.name}</strong>
              <span>{row.start}</span>
              <span>{row.end}</span>
              <span>{row.duration}</span>
              <span><i className={`type-dot ${row.color}`} />{row.type}</span>
              <span className="gantt-avatars">
                {campaign.team.slice(0, index % 3 + 1).map((member) => (
                  <img src={member.avatar} alt="" key={`${row.name}-${member.name}`} />
                ))}
              </span>
              <span><i className={`stage-dot ${row.color}`} />{row.stage}</span>
            </div>
          ))}
        </div>
        <div className="gantt-chart">
          <div className="gantt-months">
            <span>2026 June</span>
            <span>2026 June</span>
            <span>2026 June</span>
            <span>2026 July</span>
          </div>
          {items.map((row, index) => (
            <div className="gantt-track" key={`${row.wbs}-${row.name}-bar`}>
              <span
                className={`gantt-bar ${row.color} ${interaction?.index === index ? "editing" : ""}`}
                data-tour-anchor={row.wbs === "2" ? "project-gantt-timeline" : undefined}
                onMouseDown={(event) => startInteraction(event, index, "move")}
                style={{ left: `${row.left}%`, width: `${row.width}%` }}
              >
                <span
                  className="gantt-resize-handle start"
                  onMouseDown={(event) => startInteraction(event, index, "start")}
                />
                <span className="gantt-bar-label">{row.progress || row.name}</span>
                <span
                  className="gantt-resize-handle end"
                  onMouseDown={(event) => startInteraction(event, index, "end")}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
