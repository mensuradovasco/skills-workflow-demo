import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faClock,
  faCommentDots,
  faFileImage,
  faPenRuler,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { campaign } from "../../data/cocaColaCampaign";
import { DocumentFrame } from "./DocumentFrame";

const proofQueue = [
  { title: "Landing Page", state: "Under approval", icon: faClock },
  { title: "15s Video", state: "In progress", icon: faCommentDots },
  { title: "3D Digital Banner", state: "Ready for delivery", icon: faCircleCheck },
];

export function ExecutionProofing() {
  return (
    <DocumentFrame
      activeTab="PROOFING"
      accent="#f6a94a"
      icon={faFileImage}
      tabs={["FEED", "INFO", "FILES", "PROOFING", "APPROVALS", "HISTORY"]}
      title="Proofing"
    >
      <div className="proofing-document">
        <section className="proof-sidebar" data-tour-anchor="deliverables">
          <h4>Approval queue</h4>
          {proofQueue.map(({ title, state, icon }) => (
            <article className="proof-list-item" key={title}>
              <FontAwesomeIcon icon={icon} />
              <div>
                <strong>{title}</strong>
                <small>{state}</small>
              </div>
            </article>
          ))}
        </section>
        <section className="proof-canvas">
          <div className="proof-toolbar">
            <button><FontAwesomeIcon icon={faPenRuler} /> Annotate</button>
            <button><FontAwesomeIcon icon={faPlay} /> Preview</button>
          </div>
          <div className="proof-artboard">
            <img src="https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=900&q=80" alt="" />
            <span className="proof-pin one">1</span>
            <span className="proof-pin two">2</span>
            <div className="proof-brand">
              <small>Summer Assets</small>
              <strong>Coca-Cola</strong>
            </div>
          </div>
        </section>
        <aside className="proof-comments">
          <h4>Comments</h4>
          <article>
            <img className="avatar photo" src={campaign.team[0].avatar} alt="" />
            <div>
              <strong>{campaign.proof.reviewer}</strong>
              <p>{campaign.proof.comment}</p>
            </div>
          </article>
          <article>
            <img className="avatar photo" src={campaign.team[1].avatar} alt="" />
            <div>
              <strong>Arthur</strong>
              <p>Updated the landing page hero and prepared the delivery proof for final approval.</p>
            </div>
          </article>
        </aside>
      </div>
    </DocumentFrame>
  );
}
