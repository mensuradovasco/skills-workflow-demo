import type { ReactNode } from "react";
import { demoSteps, type DemoStep } from "../../data/cocaColaCampaign";

type AppShellProps = {
  activeStep: DemoStep;
  children: ReactNode;
  onStepChange: (step: DemoStep) => void;
};

export function AppShell({ activeStep, children, onStepChange }: AppShellProps) {
  const activeIndex = demoSteps.findIndex((step) => step.id === activeStep);

  return (
    <div className="app-shell">
      <header className="demo-header">
        <div className="brand-lockup">
          <img src="/assets/skills-logo-white.png" alt="Skills Workflow" />
        </div>
        <div className="demo-step-status" aria-live="polite">
          <small>Step {activeIndex + 1} of {demoSteps.length}</small>
          <strong>{demoSteps[activeIndex].label}</strong>
        </div>
        <div className="timeline" aria-label="Demo flow">
          <div className="timeline-line" />
          {demoSteps.map((step, index) => (
            <button
              className={step.id === activeStep ? "timeline-step active" : "timeline-step"}
              key={step.id}
              onClick={() => onStepChange(step.id)}
            >
              <span className={index <= activeIndex ? "timeline-dot complete" : "timeline-dot"} />
              <strong>{step.label}</strong>
            </button>
          ))}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
