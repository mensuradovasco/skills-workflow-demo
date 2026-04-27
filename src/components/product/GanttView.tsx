import { type MouseEvent, useEffect, useState } from "react";
import { campaign, projectTimelineRows } from "../../data/cocaColaCampaign";

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

const initialRows: GanttRow[] = [...projectTimelineRows];

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
