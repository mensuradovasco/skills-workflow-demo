import { campaign } from "../../data/cocaColaCampaign";

const jobsByPerson = [
  {
    person: "Rachel",
    jobs: [
      { title: "Define idea", meta: "Concept" },
      { title: "Final approval", meta: "Delivery" },
    ],
  },
  {
    person: "Arthur",
    jobs: [
      { title: "Design landing page", meta: "Website" },
      { title: "Create 3D asset", meta: "3D Banner" },
    ],
  },
  {
    person: "Daniel",
    jobs: [{ title: "Edit 15s video", meta: "Video" }],
  },
];

export function ProjectPeopleJobsView() {
  return (
    <div className="project-people-board" data-tour-anchor="project-jobs-board">
      {jobsByPerson.map((column) => {
        const person = campaign.team.find((member) => member.name === column.person);
        return (
          <section className="project-people-column" key={column.person}>
            <header>
              {person && <img className="avatar photo" src={person.avatar} alt={person.name} />}
              <div>
                <strong>{column.person}</strong>
                <small>{person?.role ?? "Team member"}</small>
              </div>
            </header>
            <div className="project-people-jobs">
              {column.jobs.map((job) => (
                <article className="project-people-job" key={`${column.person}-${job.title}`}>
                  <strong>{job.title}</strong>
                  <small>{job.meta}</small>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
