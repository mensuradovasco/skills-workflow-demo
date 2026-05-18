import { faFileImage, faListCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ReactNode } from "react";
import { campaign } from "../../data/cocaColaCampaign";
import { DocumentFrame } from "./DocumentFrame";

export type JobKey = "design-landing-page-hero";

type JobContent = {
  title: string;
  stageLabel: string;
  stageActionLabel: string;
  dateRange: { start: string; end: string };
  tags: string[];
  description: ReactNode;
};

const JOB_CONTENT: Record<JobKey, JobContent> = {
  "design-landing-page-hero": {
    title: "Design landing page hero",
    stageLabel: "In progress",
    stageActionLabel: "Submit for review",
    dateRange: { start: "08 Jun 2026", end: "12 Jun 2026" },
    tags: ["Website", "Design", "Hero"],
    description: (
      <>
        <p>Design the hero section of the Coca-Cola Summer Assets landing page. Composition leads into the 15s video and 3D banner placements, so the keyframe and color treatment need to align across all three assets.</p>
        <p>
          <strong>Deliverables:</strong><br />
          Desktop hero (1920×900)<br />
          Mobile hero (750×1100)<br />
          Light and dark variants exported as .png and Figma source
        </p>
        <p>
          <strong>References:</strong><br />
          Approved creative brief, Coca-Cola brand book v3, summer asset moodboard
        </p>
        <div className="feed-documents">
          <article>
            <img
              src="https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=360&q=80"
              alt="Coca-Cola summer hero reference"
            />
            <div>
              <strong>Summer hero reference</strong>
              <small>Image</small>
            </div>
          </article>
          <article>
            <span><FontAwesomeIcon icon={faFileImage} /></span>
            <div>
              <strong>Creative Brief</strong>
              <small>Creative brief</small>
            </div>
          </article>
        </div>
      </>
    ),
  },
};

type JobDocumentProps = {
  jobKey?: JobKey;
};

export function JobDocument({ jobKey = "design-landing-page-hero" }: JobDocumentProps) {
  const job = JOB_CONTENT[jobKey];
  return (
    <DocumentFrame
      accent="#e5c74d"
      activeTab="FEED"
      icon={faListCheck}
      initialTab="FEED"
      tabs={["FEED", "INFO", "TASKS", "FILES", "PROOFING", "APPROVALS", "HISTORY"]}
      title={job.title}
      subtitle={
        <>
          {campaign.client} <span>/</span> {campaign.campaign} <span>/</span> Jobs <span>/</span> {job.title}
        </>
      }
      feedHideChecklist
      feedStageLabel={job.stageLabel}
      feedStageActionLabel={job.stageActionLabel}
      feedDateRange={job.dateRange}
      feedTags={job.tags}
      feedDescriptionContent={job.description}
    >
      {null}
    </DocumentFrame>
  );
}
