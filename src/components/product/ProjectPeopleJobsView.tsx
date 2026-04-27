import { campaign, projectWorkItems } from "../../data/cocaColaCampaign";

export function ProjectPeopleJobsView() {
  return (
    <div className="project-people-board" data-tour-anchor="project-jobs-board">
      {campaign.team.map((person) => {
        const jobs = projectWorkItems.filter((item) => item.owner === person.name);

        return (
          <section className="project-people-column" key={person.name}>
            <header>
              <img className="avatar photo" src={person.avatar} alt={person.name} />
              <div>
                <strong>{person.name}</strong>
                <small>{person.role}</small>
              </div>
            </header>
            <div className="project-people-jobs">
              {jobs.map((job) => (
                <article className="project-people-job" key={`${person.name}-${job.name}`}>
                  <strong>{job.name}</strong>
                  <small>{job.channel}</small>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
