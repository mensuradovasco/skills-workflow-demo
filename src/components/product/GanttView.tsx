import { type CSSProperties, type MouseEvent, useEffect, useState } from "react";
import { campaign, projectTimelineRows } from "../../data/cocaColaCampaign";

type GanttRow = {
  color: string;
  duration: string;
  end: string;
  left: number;
  name: string;
  owner: string;
  progress: string;
  stage: string;
  start: string;
  type: string;
  wbs: string;
  width: number;
};

const initialRows: GanttRow[] = [...projectTimelineRows];
const teamByName = new Map(campaign.team.map((member) => [member.name, member]));

export function GanttView() {
  const [items, setItems] = useState(initialRows);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [interaction, setInteraction] = useState<{
    chartWidth: number;
    index: number;
    left: number;
    mode: "move" | "start" | "end";
    startX: number;
    width: number;
  } | null>(null);

  const toggleCollapsed = (wbs: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(wbs)) next.delete(wbs);
      else next.add(wbs);
      return next;
    });
  };

  const visibleItems = items.filter((row) => {
    const parentWbs = row.wbs.includes(".") ? row.wbs.split(".")[0] : null;
    return !parentWbs || !collapsed.has(parentWbs);
  });

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
          {visibleItems.map((row, index) => {
            const isParent = row.type === "Phase";
            const depth = (row.wbs.match(/\./g) ?? []).length;
            const isCollapsed = collapsed.has(row.wbs);
            const rowClass = `gantt-row${isParent ? " is-parent" : ""}${depth > 0 ? " is-child" : ""}`;
            const assignees = assigneesForRow(row);
            const delay = `${index * 70 + 160}ms`;
            return (
            <div className={rowClass} key={`${row.wbs}-${row.name}`} style={{ "--gantt-delay": delay } as CSSProperties}>
              <span>{index + 1}</span>
              <span>{row.wbs}</span>
              <strong style={depth > 0 ? { paddingLeft: `${8 + depth * 14}px` } : undefined}>
                {isParent && (
                  <button
                    className={`gantt-row-caret${isCollapsed ? " is-collapsed" : ""}`}
                    onClick={() => toggleCollapsed(row.wbs)}
                    aria-label={isCollapsed ? `Expand ${row.name}` : `Collapse ${row.name}`}
                    type="button"
                  >
                    ▾
                  </button>
                )}
                {row.name}
              </strong>
              <span>{row.start}</span>
              <span>{row.end}</span>
              <span className="gantt-duration">{row.duration}</span>
              <span><i className={`type-dot ${row.color}`} />{row.type}</span>
              <span className="gantt-avatars">
                {assignees.map((member, avatarIndex) => (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    key={`${row.name}-${member.name}`}
                    style={{ "--gantt-avatar-delay": `${index * 70 + avatarIndex * 90 + 260}ms` } as CSSProperties}
                  />
                ))}
              </span>
              <span><i className={`stage-dot ${row.color}`} />{row.stage}</span>
            </div>
            );
          })}
        </div>
        <div className="gantt-chart">
          <div className="gantt-months">
            <span>2026 June</span>
            <span>2026 June</span>
            <span>2026 June</span>
            <span>2026 July</span>
          </div>
          {visibleItems.map((row, index) => {
            const progress = parseProgress(row.progress);
            return (
            <div className="gantt-track" key={`${row.wbs}-${row.name}-bar`} style={{ "--gantt-delay": `${index * 70 + 160}ms` } as CSSProperties}>
              <span
                className={`gantt-bar ${row.color} ${interaction?.index === index ? "editing" : ""}`}
                data-tour-anchor={row.wbs === "2" ? "project-gantt-timeline" : undefined}
                onMouseDown={(event) => startInteraction(event, index, "move")}
                style={{
                  "--gantt-left": `${row.left}%`,
                  "--gantt-progress": `${progress}%`,
                  "--gantt-width": `${row.width}%`,
                  left: `${row.left}%`,
                  width: `${row.width}%`,
                } as CSSProperties}
              >
                <span className="gantt-bar-progress" />
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

function assigneesForRow(row: GanttRow) {
  if (row.type !== "Phase") return [teamByName.get(row.owner)].filter(Boolean) as typeof campaign.team;

  const childPrefix = `${row.wbs}.`;
  const owners = new Set(
    initialRows
      .filter((item) => item.wbs.startsWith(childPrefix))
      .map((item) => item.owner),
  );
  if (!owners.size) owners.add(row.owner);
  return Array.from(owners).map((name) => teamByName.get(name)).filter(Boolean) as typeof campaign.team;
}

function parseProgress(progress: string) {
  const value = Number(progress.replace("%", ""));
  if (!Number.isFinite(value)) return 0;
  return clamp(value, 0, 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
