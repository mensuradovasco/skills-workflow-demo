import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { WorkspaceFrame } from "./WorkspaceFrame";

const clients = [
  { name: "Coca-Cola", logo: "/assets/client-logos/coca-cola.svg" },
  { name: "Samsung", logo: "/assets/client-logos/samsung.svg" },
  { name: "Nike", logo: "/assets/client-logos/nike.svg" },
  { name: "L'Oreal", logo: "/assets/client-logos/loreal.svg" },
  { name: "HP", logo: "/assets/client-logos/hp.svg" },
];

const projects = [
  {
    client: "Coca-Cola",
    status: "In progress",
    tone: "green",
    title: "Coca-Cola - Summer Assets",
    image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=780&q=80",
  },
  {
    client: "Coca-Cola",
    status: "Approved",
    tone: "green",
    title: "Estimate / Budget",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=780&q=80",
  },
  {
    client: "Nike",
    status: "Approved",
    tone: "orange",
    title: "Digital Creative Project",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=780&q=80",
  },
  {
    client: "L'Oreal",
    status: "New",
    tone: "green",
    title: "New Launch",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=780&q=80",
  },
];

export function ClientList() {
  return (
    <WorkspaceFrame
      accent="#f0a24d"
      icon={faUsers}
      subtitle="All"
      tabs={["FEED", "INFO", "PROJECTS", "CONTRACT"]}
      title="Clients"
    >
      <div className="client-list-page">
        <aside className="client-sidebar">
          <label>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input placeholder="Search" />
          </label>
          <div className="client-list">
            {clients.map((client, index) => (
              <button className={index === 0 ? "active" : ""} key={client.name}>
                <span className="client-logo-mark">
                  <img src={client.logo} alt="" />
                </span>
                <strong>{client.name}</strong>
              </button>
            ))}
          </div>
        </aside>
        <main className="client-projects">
          <div className="client-project-actions">
            <button aria-label="Add project"><FontAwesomeIcon icon={faPlus} /></button>
          </div>
          <div className="client-project-grid">
            {projects.map((project) => (
              <article className="client-project-card" key={project.title}>
                <div className="client-project-image">
                  <img src={project.image} alt="" />
                  <span className={project.tone}>{project.status}</span>
                </div>
                <div className="client-project-title">
                  <div>
                    <strong>{project.title}</strong>
                    <small>{project.client}</small>
                  </div>
                  <button aria-label={`Open ${project.title}`}><FontAwesomeIcon icon={faPlus} /></button>
                </div>
                <footer>
                  <span>03 Jun 2026</span>
                  <span>25 Jun 2026</span>
                </footer>
              </article>
            ))}
          </div>
        </main>
      </div>
    </WorkspaceFrame>
  );
}
