import { useEffect, useRef, type ReactNode } from "react";
import { demoSteps, type DemoStep } from "../../data/cocaColaCampaign";

type AppShellProps = {
  activeStep: DemoStep;
  children: ReactNode;
  guidedActive: boolean;
  onStepChange: (step: DemoStep) => void;
  onOpenDesignSystem?: () => void;
  hideDemoChrome?: boolean;
  embedMode?: boolean;
};

const marketingNavItems = ["Product", "Solutions", "Resources", "Pricing", "Contact"];

const visibleStageIds: DemoStep[] = [
  "request",
  "brief",
  "budget",
  "project",
  "resources",
  "proofing",
  "profitability",
  "billing",
];

const stages = visibleStageIds
  .map((id) => demoSteps.find((step) => step.id === id))
  .filter((step): step is (typeof demoSteps)[number] => Boolean(step));

export function AppShell({ activeStep, children, guidedActive, onStepChange, onOpenDesignSystem, hideDemoChrome = false, embedMode = false }: AppShellProps) {
  const activeIndex = stages.findIndex((step) => step.id === activeStep);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      el.style.setProperty("--shell-mx", currentX.toFixed(3));
      el.style.setProperty("--shell-my", currentY.toFixed(3));
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        raf = window.requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (event: MouseEvent) => {
      targetX = (event.clientX / window.innerWidth) - 0.5;
      targetY = (event.clientY / window.innerHeight) - 0.5;
      if (!raf) raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="app-shell" ref={shellRef}>
      <div className="app-shell-frost" aria-hidden="true" />
      {!embedMode && <nav className="marketing-nav" aria-label="Skills Workflow website">
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
          {onOpenDesignSystem && (
            <button type="button" className="marketing-nav-system" onClick={onOpenDesignSystem}>
              Design System
            </button>
          )}
          <button type="button" className="marketing-nav-lang" aria-label="Language">
            <span aria-hidden="true">🇺🇸</span>
            <span>EN</span>
            <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a className="marketing-nav-cta" href="https://www.skillsworkflow.com/book-a-demo">Book a Demo</a>
        </div>
      </nav>}
      <main>
        {!hideDemoChrome && (
          <>
            <h1 className="marketing-hero-title">
              World's first <em>briefing to billing</em> solution for{" "}
              <span className="rotating-words" aria-label="Advertising, Marketing, Media, Creative">
                <span>Advertising</span>
                <span>Marketing</span>
                <span>Media</span>
                <span>Creative</span>
              </span>
            </h1>
            <div className="marketing-hero-ctas">
              <a className="hero-cta primary" href="https://www.skillsworkflow.com/book-a-demo">Book a Demo</a>
              <a className="hero-cta secondary" href="https://www.skillsworkflow.com/contact">Request a Quote</a>
            </div>
          </>
        )}
        {children}
        {!hideDemoChrome && (
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
        )}
        {!hideDemoChrome && (
          <section className="client-strip" aria-label="Trusted by">
            <p>Trusted by global leaders in creative &amp; production agencies, tech, finance, and consulting companies to cut costs and boost team performance.</p>
            <div className="client-strip-marquee" aria-hidden="true">
              <ul className="client-strip-track">
                {[...Array(2)].map((_, dup) => (
                  <li key={dup}>
                    <ul>
                      <li><span className="client-logo bcw">bcw</span></li>
                      <li><span className="client-logo gpac">GPaC</span></li>
                      <li><span className="client-logo gsp">GS&amp;P</span></li>
                      <li><span className="client-logo ipg">IPG</span></li>
                      <li><span className="client-logo colgate">Colgate<em>®</em></span></li>
                      <li><span className="client-logo ghfly">GhFly</span></li>
                      <li><span className="client-logo cpb">CP+B</span></li>
                      <li><span className="client-logo ogilvy">Ogilvy</span></li>
                      <li><span className="client-logo fuel">FUEL</span></li>
                      <li><span className="client-logo havas">Havas</span></li>
                      <li><span className="client-logo ddb">DDB</span></li>
                      <li><span className="client-logo dentsu">dentsu</span></li>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
