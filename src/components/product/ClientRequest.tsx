import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { campaign } from "../../data/cocaColaCampaign";
import { stagger } from "../../motion/transitions";

export function ClientRequest() {
  return (
    <Card className="request-card pop-in">
      <div className="request-heading">
        <div className="brand-avatar client-logo-badge">
          <img src={campaign.clientLogo} alt={campaign.client} />
        </div>
        <div>
          <span className="eyebrow">New client request</span>
          <h2>{campaign.campaign}</h2>
          <p>{campaign.request.objective}</p>
        </div>
      </div>
      <div className="request-grid">
        <div>
          <small>From</small>
          <strong>{campaign.request.receivedFrom}</strong>
        </div>
        <div>
          <small>Budget range</small>
          <strong>{campaign.request.budgetRange}</strong>
        </div>
        <div>
          <small>Due</small>
          <strong>{campaign.request.dueDate}</strong>
        </div>
      </div>
      <div className="chip-row">
        {campaign.request.channels.map((channel, index) => (
          <Badge key={channel} tone="blue">
            {channel}
          </Badge>
        ))}
      </div>
      <div className="deliverables">
        {campaign.request.deliverables.map((item, index) => (
          <div className="deliverable fade-up" key={item} style={stagger(index)}>
            <span />
            {item}
          </div>
        ))}
      </div>
    </Card>
  );
}
