import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines } from "@fortawesome/free-solid-svg-icons";
import { campaign } from "../../data/cocaColaCampaign";
import { DocumentFrame } from "./DocumentFrame";

type ClientBriefProps = {
  onGenerateBudget: () => void;
};

export function ClientBrief({ onGenerateBudget }: ClientBriefProps) {
  return (
    <DocumentFrame
      activeTab="FEED"
      accent="#57c69a"
      feedChecklist={[
        "Client request structured",
        "Scope confirmed",
        "Deliverables detected",
      ]}
      feedDescriptionContent={<BriefDescription />}
      feedStageActionAnchor="generate-budget-from-brief"
      feedStageActionLabel="Generate Budget"
      feedStageLabel="Brief structured"
      feedStageTimestamp="04 Jun 2026, 09:48"
      feedTeamAnimated
      hideToolbar
      icon={faFileLines}
      onFeedStageAction={onGenerateBudget}
      tabs={["FEED", "INFO", "TASKS", "ESTIMATES", "FILES"]}
      title="Coca-Cola Summer Campaign Brief"
    >
      <BriefDescription />
    </DocumentFrame>
  );
}

function BriefDescription() {
  return (
    <div className="brief-description-text">
      <p>Client request: create key assets for a Coca-Cola summer campaign.</p>
      <p>
        <strong>Scope:</strong><br />
        Website Landing Page<br />
        15s Video<br />
        3D Digital Banner
      </p>
      <p>
        <strong>Timeline:</strong><br />
        Concept, Website, Video, 3D Banner, Delivery
      </p>
      <p>
        <strong>Notes:</strong><br />
        Structure the incoming request into a brief before generating the estimate.
      </p>
      <div className="feed-documents brief-attachments">
        <article>
          <img
            src="https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=180&q=80"
            alt="Coca-Cola summer reference"
          />
          <div>
            <strong>Summer visual reference</strong>
            <small>Image</small>
          </div>
        </article>
        <article>
          <span><FontAwesomeIcon icon={faFileLines} /></span>
          <div>
            <strong>Client email request</strong>
            <small>Word document</small>
          </div>
        </article>
      </div>
    </div>
  );
}
