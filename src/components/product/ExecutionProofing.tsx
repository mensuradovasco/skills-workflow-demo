import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faClock,
  faCommentDots,
  faFileImage,
  faPaperPlane,
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
      <ProofingContent />
    </DocumentFrame>
  );
}

export function ProofingContent({ autoApprove = false }: { autoApprove?: boolean }) {
  const [stage, setStage] = useState<"review" | "billing">("review");
  const isBillingReady = stage === "billing";

  useEffect(() => {
    if (!autoApprove) return;
    setStage("review");
    const timer = window.setTimeout(() => setStage("billing"), 2450);
    return () => window.clearTimeout(timer);
  }, [autoApprove]);

  return (
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
        <div className={`proof-artboard${isBillingReady ? " is-approved" : ""}`}>
          <img src="https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=900&q=80" alt="Coca-Cola summer campaign proof" />
          <span className="proof-pin one">1</span>
          <span className="proof-pin two">2</span>
          {autoApprove && !isBillingReady && (
            <>
              <div className="proof-image-comment one">
                <strong>Sofia</strong>
                <span>Color and framing look good.</span>
              </div>
              <div className="proof-image-comment two">
                <strong>Client</strong>
                <span>Approved for final delivery.</span>
              </div>
            </>
          )}
          {isBillingReady && (
            <div className="proof-approved-stamp">
              <FontAwesomeIcon icon={faCircleCheck} />
              <span>Approved</span>
            </div>
          )}
          <div className="proof-brand">
            <small>Summer Assets</small>
            <strong>Coca-Cola</strong>
          </div>
        </div>
      </section>
      <aside className="proof-side">
        <section className={`proof-stage-card${isBillingReady ? " billing" : ""}`}>
          <header>
            <img className="avatar photo" src={campaign.team[0].avatar} alt="" />
            <small>04 Jun 2026, 13:31</small>
          </header>
          <strong>Stage</strong>
          <span className="proof-stage-status">
            <i className={isBillingReady ? "billing" : ""} />
            {isBillingReady ? "Ready to be billed" : "Client review"}
          </span>
          <button
            className="proof-stage-action"
            data-tour-anchor="proof-send-approval"
            onClick={() => setStage(isBillingReady ? "review" : "billing")}
            type="button"
          >
            {!isBillingReady && <FontAwesomeIcon icon={faPaperPlane} />}
            {isBillingReady ? "Ready to bill" : "Send to client approval"}
          </button>
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
      </aside>
    </div>
  );
}
