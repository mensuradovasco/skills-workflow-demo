import type { ReactNode } from "react";
import { demoSteps, type DemoStep } from "../../data/cocaColaCampaign";

type AppShellProps = {
  activeStep: DemoStep;
  children: ReactNode;
  guidedActive: boolean;
  onStepChange: (step: DemoStep) => void;
};

const marketingNavItems = ["Product", "Solutions", "Resources", "Pricing", "Contact"];

const visibleStageIds: DemoStep[] = [
  "request",
  "brief",
  "budget",
  "project",
  "resources",
  "execution",
  "proofing",
  "profitability",
];

const stages = visibleStageIds
  .map((id) => demoSteps.find((step) => step.id === id))
  .filter((step): step is (typeof demoSteps)[number] => Boolean(step));

export function AppShell({ activeStep, children, guidedActive, onStepChange }: AppShellProps) {
  const activeIndex = stages.findIndex((step) => step.id === activeStep);

  return (
    <div className="app-shell">
      <nav className="marketing-nav" aria-label="Skills Workflow website">
        <a className="marketing-nav-logo" href="https://www.skillsworkflow.com" aria-label="Skills Workflow">
          <img
            src="https://cdn.prod.website-files.com/689701f28dcfeea6454a8a48/689701f28dcfeea6454a8cb2_SKILLS%20LOGO.svg"
            alt="Skills Workflow"
          />
        </a>
        <ul className="marketing-nav-links">
          {marketingNavItems.map((item) => (
            <li key={item}>
              <button type="button">
                <span>{item}</span>
                {item !== "Pricing" && item !== "Contact" && (
                  <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="marketing-nav-tools">
          <button type="button" className="marketing-nav-lang" aria-label="Language">
            <span aria-hidden="true">🇺🇸</span>
            <span>EN</span>
            <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a className="marketing-nav-cta" href="https://www.skillsworkflow.com/book-a-demo">Book a Demo</a>
        </div>
      </nav>
      <main>
        <h1 className="marketing-hero-title">
          World's first <em>briefing to billing</em> solution
        </h1>
        {children}
        <div className="stage-chips" aria-label="Demo flow progress">
          {stages.map((step, index) => {
            const isActive = step.id === activeStep;
            const isComplete = guidedActive && activeIndex > index;
            return (
              <button
                className={`stage-chip${isActive ? " active" : ""}${isComplete ? " complete" : ""}`}
                key={step.id}
                onClick={() => onStepChange(step.id)}
                type="button"
              >
                <span className="stage-chip-dot" data-step={index + 1} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
