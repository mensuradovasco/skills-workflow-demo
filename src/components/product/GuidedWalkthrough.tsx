import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GuidedDemoStep, GuidedDemoTarget } from "../../data/guidedDemo";

type GuidedWalkthroughProps = {
  active: boolean;
  onActiveChange: (active: boolean) => void;
  onNavigate: (target: GuidedDemoTarget) => void;
  onRestartReady?: (restart: () => void) => void;
  steps: GuidedDemoStep[];
};

type TargetRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const STORAGE_KEY = "skills-workflow-guided-demo-step";
const VERSION_KEY = "skills-workflow-guided-demo-version";
export const GUIDED_DEMO_VERSION = "budget-feed-workflow-v1";
export const GUIDED_DEMO_STEP_KEY = STORAGE_KEY;
export const GUIDED_DEMO_VERSION_KEY = VERSION_KEY;

export function GuidedWalkthrough({
  active,
  onActiveChange,
  onNavigate,
  onRestartReady,
  steps,
}: GuidedWalkthroughProps) {
  const [activeIndex, setActiveIndex] = useState(() => readStoredStep(steps.length));
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [tooltipSize, setTooltipSize] = useState({ height: 132, width: 248 });
  const tooltipRef = useRef<HTMLElement | null>(null);
  const hasScrolledToStep = useRef(false);
  const lastRectRef = useRef<string>("");
  const currentStep = steps[activeIndex] ?? steps[0];

  const restart = useCallback(() => {
    setActiveIndex(0);
    window.localStorage.setItem(STORAGE_KEY, "0");
    onActiveChange(true);
    if (steps[0]) onNavigate(steps[0].target);
  }, [onActiveChange, onNavigate, steps]);

  useEffect(() => {
    onRestartReady?.(restart);
  }, [onRestartReady, restart]);

  useEffect(() => {
    if (!active || !currentStep) return;
    onNavigate(currentStep.target);
  }, [active, activeIndex, currentStep, onNavigate]);

  useLayoutEffect(() => {
    if (!active) return;
    const element = tooltipRef.current;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height) {
        setTooltipSize({ height: rect.height, width: rect.width });
      }
    };

    measure();
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [active, activeIndex, currentStep]);

  useEffect(() => {
    if (!active || !currentStep) {
      setTargetRect(null);
      return;
    }

    let frame = 0;
    let raf = 0;
    let attempts = 0;
    let cancelled = false;
    setIsWaiting(true);
    setTargetRect(null);
    hasScrolledToStep.current = false;

    const syncRect = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const nextRect = {
        height: rect.height,
        left: rect.left,
        top: rect.top,
        width: rect.width,
      };
      const rectKey = `${nextRect.left}:${nextRect.top}:${nextRect.width}:${nextRect.height}`;
      if (lastRectRef.current !== rectKey) {
        lastRectRef.current = rectKey;
        setTargetRect(nextRect);
      }
      setIsWaiting(false);
    };

    const followTarget = () => {
      if (cancelled) return;
      const selector = currentStep.waitFor ?? currentStep.selector;
      const element = document.querySelector<HTMLElement>(selector);
      if (element) syncRect(element);
      raf = window.requestAnimationFrame(followTarget);
    };

    const locateTarget = () => {
      if (cancelled) return;
      const selector = currentStep.waitFor ?? currentStep.selector;
      const element = document.querySelector<HTMLElement>(selector);

      if (element) {
        if (!hasScrolledToStep.current) {
          hasScrolledToStep.current = true;
          element.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
          window.requestAnimationFrame(() => {
            if (cancelled) return;
            syncRect(element);
            followTarget();
          });
          return;
        }

        syncRect(element);
        if (!raf) followTarget();
        return;
      }

      attempts += 1;
      if (attempts > 60) {
        setIsWaiting(false);
        return;
      }
      frame = window.setTimeout(locateTarget, 100);
    };

    frame = window.setTimeout(locateTarget, 120);

    const handleViewportChange = () => {
      if (cancelled) return;
      window.requestAnimationFrame(locateTarget);
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      cancelled = true;
      window.clearTimeout(frame);
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [active, activeIndex, currentStep]);

  const goToStep = useCallback((nextIndex: number) => {
    const boundedIndex = Math.min(Math.max(nextIndex, 0), steps.length - 1);
    setActiveIndex(boundedIndex);
    window.localStorage.setItem(STORAGE_KEY, String(boundedIndex));
  }, [steps.length]);

  const goNext = useCallback(() => {
    window.dispatchEvent(new CustomEvent("guided-demo-step-complete", { detail: { id: currentStep.id } }));
    if (activeIndex >= steps.length - 1) {
      onActiveChange(false);
      window.localStorage.setItem(STORAGE_KEY, "0");
      return;
    }
    goToStep(activeIndex + 1);
  }, [activeIndex, currentStep.id, goToStep, onActiveChange, steps.length]);

  const goBack = useCallback(() => {
    goToStep(Math.max(activeIndex - 1, 0));
  }, [activeIndex, goToStep]);

  const activateTarget = useCallback(() => {
    const element = document.querySelector<HTMLElement>(currentStep.selector);

    if (element) {
      document.body.dataset.guidedClickProxy = "true";
      element.click();
      window.setTimeout(() => {
        delete document.body.dataset.guidedClickProxy;
        goNext();
      }, 40);
      return;
    }

    goNext();
  }, [currentStep.selector, goNext]);

  const tooltipStyle = useMemo(() => {
    if (!targetRect) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 320,
      };
    }
    return getTooltipStyle(targetRect, currentStep.placement, tooltipSize);
  }, [currentStep?.placement, targetRect, tooltipSize]);

  if (!active || !currentStep) return null;

  const spotlightStyle = targetRect
    ? {
        height: targetRect.height + 8,
        left: targetRect.left - 4,
        top: targetRect.top - 4,
        width: targetRect.width + 8,
      }
    : {};

  const overlay = (
    <div className="guided-demo-layer" aria-live="polite">
      <div className="guided-demo-dim" />
      {targetRect && (
        <button
          aria-label={`Continue guided demo: ${currentStep.title}`}
          className="guided-demo-spotlight"
          onClick={activateTarget}
          style={spotlightStyle}
          type="button"
        />
      )}
      <section className={`hotspot-zone guided-demo-hotspot ${currentStep.placement}`} ref={tooltipRef} style={tooltipStyle}>
        <span className="guided-demo-step-count">Step {activeIndex + 1} of {steps.length}</span>
        <span className="hotspot-action-label">{currentStep.title}</span>
        <span className="hotspot-tooltip">{isWaiting ? "Finding the right place..." : currentStep.body}</span>
        <span className="guided-demo-controls">
          <button disabled={activeIndex === 0} onClick={goBack} type="button">Previous</button>
          <button onClick={goNext} type="button">{activeIndex === steps.length - 1 ? "Finish" : "Next"}</button>
        </span>
      </section>
    </div>
  );

  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, document.body);
}

function readStoredStep(totalSteps: number) {
  if (typeof window === "undefined") return 0;
  if (window.localStorage.getItem(VERSION_KEY) !== GUIDED_DEMO_VERSION) {
    window.localStorage.setItem(VERSION_KEY, GUIDED_DEMO_VERSION);
    window.localStorage.setItem(STORAGE_KEY, "0");
    return 0;
  }
  const storedStep = Number(window.localStorage.getItem(STORAGE_KEY));
  if (!Number.isFinite(storedStep)) return 0;
  return Math.min(Math.max(storedStep, 0), Math.max(totalSteps - 1, 0));
}

function getTooltipStyle(
  rect: TargetRect,
  placement: GuidedDemoStep["placement"],
  tooltipSize: { height: number; width: number },
) {
  const gap = 18;
  const { height, width } = tooltipSize;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const centeredLeft = rect.left + rect.width / 2 - width / 2;
  const centeredTop = rect.top + rect.height / 2 - height / 2;
  const targetCenterX = rect.left + rect.width / 2;
  const targetCenterY = rect.top + rect.height / 2;
  const minLeft = 18;
  const maxLeft = viewportWidth - width - 18;
  const minTop = 18;
  const maxTop = viewportHeight - height - 18;

  if (placement === "top") {
    const left = clamp(centeredLeft, minLeft, maxLeft);
    return {
      "--guided-arrow-x": `${clamp(targetCenterX - left, 18, width - 18)}px`,
      left,
      top: clamp(rect.top - height - gap, minTop, maxTop),
      width,
    };
  }

  if (placement === "bottom") {
    const left = clamp(centeredLeft, minLeft, maxLeft);
    return {
      "--guided-arrow-x": `${clamp(targetCenterX - left, 18, width - 18)}px`,
      left,
      top: clamp(rect.top + rect.height + gap, minTop, maxTop),
      width,
    };
  }

  if (placement === "left") {
    const top = clamp(centeredTop, minTop, maxTop);
    return {
      "--guided-arrow-y": `${clamp(targetCenterY - top, 18, height - 18)}px`,
      left: clamp(rect.left - width - gap, minLeft, maxLeft),
      top,
      width,
    };
  }

  const top = clamp(centeredTop, minTop, maxTop);
  return {
    "--guided-arrow-y": `${clamp(targetCenterY - top, 18, height - 18)}px`,
    left: clamp(rect.left + rect.width + gap, minLeft, maxLeft),
    top,
    width,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
