import type { ReactNode } from "react";
import { demoSteps, type DemoStep } from "../../data/cocaColaCampaign";

type AppShellProps = {
  activeStep: DemoStep;
  children: ReactNode;
  guidedActive: boolean;
  onStepChange: (step: DemoStep) => void;
};

export function AppShell({ activeStep, children, guidedActive, onStepChange }: AppShellProps) {
  const activeIndex = demoSteps.findIndex((step) => step.id === activeStep);

  return (
    <div className="app-shell">
      <header className="demo-header">
        <div className="brand-lockup">
          <img src="/assets/skills-logo-white.png" alt="Skills Workflow" />
        </div>
      </header>
      {guidedActive && (
        <div className="demo-flow-footer" aria-label="Demo flow progress">
          <div className="timeline">
            <div className="timeline-line" aria-hidden="true" />
            {demoSteps.map((step, index) => {
              const isActive = step.id === activeStep;
              const isComplete = activeIndex > index;

              return (
                <button
                  className={isActive ? "timeline-step active" : "timeline-step"}
                  key={step.id}
                  onClick={() => onStepChange(step.id)}
                  type="button"
                >
                  <span className={isComplete ? "timeline-dot complete" : "timeline-dot"} data-step={index + 1} />
                  <strong>{step.label}</strong>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <main>{children}</main>
    </div>
  );
}
