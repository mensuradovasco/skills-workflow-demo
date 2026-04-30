import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEllipsisVertical,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { CSSProperties, ReactNode } from "react";

type WorkspaceFrameProps = {
  accent: string;
  children: ReactNode;
  icon: IconDefinition;
  subtitle?: string;
  tabs?: string[];
  title: string;
};

export function WorkspaceFrame({
  accent,
  children,
  icon,
  subtitle,
  tabs = ["All"],
  title,
}: WorkspaceFrameProps) {
  const viewLabel = subtitle ?? tabs[0] ?? "All";

  return (
    <section className="workspace-frame" style={{ "--workspace-accent": accent } as CSSProperties}>
      <header className="workspace-header">
        <div className="workspace-title">
          <span><FontAwesomeIcon icon={icon} /></span>
          <div>
            <strong>{title}</strong>
            <small>{viewLabel}</small>
          </div>
        </div>
        <div className="workspace-actions">
          <button aria-label={`Create ${title}`}><FontAwesomeIcon icon={faPlus} /></button>
          <button aria-label={`Open ${title}`}><FontAwesomeIcon icon={faArrowRight} /></button>
          <button aria-label="More options"><FontAwesomeIcon icon={faEllipsisVertical} /></button>
        </div>
      </header>
      {tabs.length > 0 && (
        <nav className="workspace-tabs" aria-label={`${title} views`}>
          {tabs.map((tab, index) => (
            <button className={index === 0 ? "active" : ""} key={tab} type="button">
              {tab}
            </button>
          ))}
        </nav>
      )}
      {children}
    </section>
  );
}
