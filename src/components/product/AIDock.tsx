import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faMagnifyingGlass,
  faPaperclip,
  faPaperPlane,
  faPlus,
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { GuidedDemoStep, GuidedDemoTarget } from "../../data/guidedDemo";

type AIDockProps = {
  active: boolean;
  onActiveChange: (active: boolean) => void;
  onNavigate: (target: GuidedDemoTarget) => void;
  onRestartReady?: (restart: () => void) => void;
  requestedStepIndex?: number | null;
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
const COLLAPSED_KEY = "skills-workflow-guided-demo-collapsed";
export const GUIDED_DEMO_VERSION = "budget-feed-workflow-v1";
export const GUIDED_DEMO_STEP_KEY = STORAGE_KEY;
export const GUIDED_DEMO_VERSION_KEY = VERSION_KEY;
const DEFAULT_FRAME_OVERLAP = 0.35;
const LAUNCHER_HEIGHT = 30;
const LAUNCHER_GAP = 2;
const LAUNCHER_FRAME_OFFSET = 12;
const LAUNCHER_FALLBACK_WIDTH = 108;

export function AIDock({
  active,
  onActiveChange,
  onNavigate,
  onRestartReady,
  requestedStepIndex,
  steps,
}: AIDockProps) {
  const [activeIndex, setActiveIndex] = useState(() => readStoredStep(steps.length));
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const lastTargetEl = useRef<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(() => readCollapsed());
  const [typedTitle, setTypedTitle] = useState("");
  const [typedBody, setTypedBody] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [dockSize, setDockSize] = useState({ width: 320, height: 380 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [dockPos, setDockPos] = useState<{ right: number; bottom: number } | null>(null);
  const [launcherBottom, setLauncherBottom] = useState(LAUNCHER_FRAME_OFFSET);
  const [isDockDetached, setIsDockDetached] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, right: 0, bottom: 0 });
  const dockElRef = useRef<HTMLDivElement | null>(null);
  const launcherElRef = useRef<HTMLButtonElement | null>(null);
  const [launcherWidth, setLauncherWidth] = useState(LAUNCHER_FALLBACK_WIDTH);

  useEffect(() => {
    const measureLauncher = () => {
      const width = launcherElRef.current?.offsetWidth;
      if (!width) return;
      setLauncherWidth((prev) => (prev === width ? prev : width));
    };
    measureLauncher();
    window.addEventListener("resize", measureLauncher);
    return () => window.removeEventListener("resize", measureLauncher);
  }, []);

  const getDockPositionFromFrame = useCallback(() => {
    const frame = document.querySelector<HTMLElement>(".product-window");
    if (!frame) return null;
    const frameRect = frame.getBoundingClientRect();
    const dockLeft = frameRect.right - (dockSize.width * DEFAULT_FRAME_OVERLAP);
    const nextLauncherBottom = Math.max(LAUNCHER_FRAME_OFFSET, window.innerHeight - frameRect.bottom + LAUNCHER_FRAME_OFFSET);
    return {
      right: window.innerWidth - (dockLeft + dockSize.width),
      bottom: nextLauncherBottom + LAUNCHER_HEIGHT + LAUNCHER_GAP,
      launcherBottom: nextLauncherBottom,
    };
  }, [dockSize.width]);

  // Default position: let the chat hang out of the product frame, leaving about
  // a third inside the app. The launcher is then attached to the chat's lower
  // left edge so it reads as the tab for this drawer.
  useEffect(() => {
    if (isDockDetached) return;
    let raf = 0;

    const snapToFrame = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        const next = getDockPositionFromFrame();
        if (!next) return;
        setLauncherBottom((prev) => (prev === next.launcherBottom ? prev : next.launcherBottom));
        setDockPos((prev) => {
          if (prev?.right === next.right && prev.bottom === next.bottom) return prev;
          return next;
        });
      });
    };

    snapToFrame();
    window.addEventListener("resize", snapToFrame);
    window.addEventListener("scroll", snapToFrame, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", snapToFrame);
      window.removeEventListener("scroll", snapToFrame, true);
    };
  }, [getDockPositionFromFrame, isDockDetached]);

  const handleDragStart = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    event.preventDefault();
    const rect = dockElRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDockDetached(true);
    dragStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      right: window.innerWidth - rect.right,
      bottom: window.innerHeight - rect.bottom,
    };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (event: MouseEvent) => {
      // Horizontal-only drag. Vertical position is always pinned to the launcher.
      const dx = event.clientX - dragStartRef.current.mouseX;
      const dock = dockElRef.current;
      const dockW = dock?.offsetWidth ?? 320;
      const minVisible = 80;

      let newRight = dragStartRef.current.right - dx;
      newRight = Math.max(-(dockW - minVisible), Math.min(window.innerWidth - minVisible, newRight));

      // Always anchor bottom to launcher (no vertical movement)
      const snappedPos = getDockPositionFromFrame();
      const newBottom = snappedPos
        ? snappedPos.bottom
        : dragStartRef.current.bottom;
      if (snappedPos) {
        setLauncherBottom((prev) => (prev === snappedPos.launcherBottom ? prev : snappedPos.launcherBottom));
      }

      // Horizontal snap-back to launcher when close
      if (snappedPos && Math.abs(newRight - snappedPos.right) < 60) {
        newRight = snappedPos.right;
        setIsDockDetached(false);
      }

      setDockPos({ right: newRight, bottom: newBottom });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [getDockPositionFromFrame, isDragging]);

  // Keep the dock vertically pinned to the frame even when the layout shifts,
  // while preserving the user's horizontal drag offset.
  useEffect(() => {
    if (!dockPos) return;
    const repinToFrame = () => {
      const snappedPos = getDockPositionFromFrame();
      if (!snappedPos) return;
      const snappedBottom = snappedPos.bottom;
      setLauncherBottom((prev) => (prev === snappedPos.launcherBottom ? prev : snappedPos.launcherBottom));
      setDockPos((prev) => (prev && prev.bottom !== snappedBottom ? { right: prev.right, bottom: snappedBottom } : prev));
    };
    repinToFrame();
    window.addEventListener("resize", repinToFrame);
    window.addEventListener("scroll", repinToFrame, true);
    return () => {
      window.removeEventListener("resize", repinToFrame);
      window.removeEventListener("scroll", repinToFrame, true);
    };
  }, [dockPos, getDockPositionFromFrame]);

  const handleResizeStart = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    resizeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      w: dockSize.width,
      h: dockSize.height,
    };
    setIsResizing(true);
  }, [dockSize.height, dockSize.width]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (event: MouseEvent) => {
      const dx = event.clientX - resizeStartRef.current.x;
      const dy = event.clientY - resizeStartRef.current.y;
      const maxH = Math.round(window.innerHeight * 0.8);
      setDockSize({
        width: Math.max(280, Math.min(560, resizeStartRef.current.w - dx)),
        height: Math.max(260, Math.min(maxH, resizeStartRef.current.h - dy)),
      });
    };
    const onUp = () => setIsResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizing]);
  const hasScrolledToStep = useRef(false);
  const lastRectRef = useRef<string>("");
  const lastTargetRef = useRef<string>("");
  const currentStep = steps[activeIndex] ?? steps[0];

  const restart = useCallback(() => {
    setActiveIndex(0);
    window.localStorage.setItem(STORAGE_KEY, "0");
    onActiveChange(true);
    setCollapsed(false);
    if (steps[0]) onNavigate(steps[0].target);
  }, [onActiveChange, onNavigate, steps]);

  useEffect(() => {
    onRestartReady?.(restart);
  }, [onRestartReady, restart]);

  useEffect(() => {
    if (!active || !currentStep) return;
    const targetKey = `${currentStep.target.step}:${currentStep.target.view ?? ""}`;
    if (lastTargetRef.current !== targetKey) {
      lastTargetRef.current = targetKey;
      onNavigate(currentStep.target);
    }
    const eventDetail = { detail: { id: currentStep.id } };
    const mountedFrame = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("guided-demo-step-active", eventDetail));
    }, 120);
    return () => window.clearTimeout(mountedFrame);
  }, [active, activeIndex, currentStep, onNavigate]);

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
    hasScrolledToStep.current = false;

    const syncRect = (element: HTMLElement) => {
      if (lastTargetEl.current && lastTargetEl.current !== element) {
        lastTargetEl.current.classList.remove("is-ai-spotlight");
      }
      if (currentStep.spotlight === false) {
        if (lastTargetEl.current) {
          lastTargetEl.current.classList.remove("is-ai-spotlight");
          lastTargetEl.current = null;
        }
        if (lastRectRef.current !== "hidden") {
          lastRectRef.current = "hidden";
          setTargetRect(null);
        }
        setIsWaiting(false);
        return;
      }
      if (lastTargetEl.current !== element) {
        element.classList.add("is-ai-spotlight");
        lastTargetEl.current = element;
      }
      const rect = element.getBoundingClientRect();
      let left = rect.left;
      let top = rect.top;
      let right = rect.right;
      let bottom = rect.bottom;

      let parent = element.parentElement;
      while (parent && parent !== document.body) {
        const cs = window.getComputedStyle(parent);
        const clipped =
          cs.overflow !== "visible" ||
          cs.overflowX !== "visible" ||
          cs.overflowY !== "visible";
        if (clipped) {
          const pr = parent.getBoundingClientRect();
          left = Math.max(left, pr.left);
          top = Math.max(top, pr.top);
          right = Math.min(right, pr.right);
          bottom = Math.min(bottom, pr.bottom);
        }
        parent = parent.parentElement;
      }

      const width = right - left;
      const height = bottom - top;

      if (width <= 1 || height <= 1) {
        if (lastRectRef.current !== "hidden") {
          lastRectRef.current = "hidden";
          setTargetRect(null);
        }
        setIsWaiting(false);
        return;
      }

      const nextRect = { height, left, top, width };
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
          if (currentStep.spotlight !== false) {
            const isDocumentHeaderTarget = !!element.closest(".document-header");
            element.scrollIntoView({
              block: isDocumentHeaderTarget ? "nearest" : "center",
              inline: "center",
              behavior: "auto",
            });
          }
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
      if (lastTargetEl.current) {
        lastTargetEl.current.classList.remove("is-ai-spotlight");
        lastTargetEl.current = null;
      }
    };
  }, [active, activeIndex, currentStep]);

  const goToStep = useCallback((nextIndex: number) => {
    const boundedIndex = Math.min(Math.max(nextIndex, 0), steps.length - 1);
    setActiveIndex(boundedIndex);
    window.localStorage.setItem(STORAGE_KEY, String(boundedIndex));
  }, [steps.length]);

  useEffect(() => {
    if (!active || requestedStepIndex == null) return;
    goToStep(requestedStepIndex);
  }, [active, goToStep, requestedStepIndex]);

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

  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  useEffect(() => {
    if (!active || collapsed || !currentStep?.autoAdvanceMs) {
      setIsAutoAdvancing(false);
      return;
    }
    setIsAutoAdvancing(true);
    const timer = window.setTimeout(() => {
      setIsAutoAdvancing(false);
      goNext();
    }, currentStep.autoAdvanceMs);
    return () => {
      window.clearTimeout(timer);
      setIsAutoAdvancing(false);
    };
  }, [active, activeIndex, collapsed, currentStep, goNext]);

  const useWaiting = isWaiting && (currentStep?.waitingTitle || currentStep?.waitingBody);
  const displayTitle = useWaiting ? currentStep!.waitingTitle ?? currentStep!.title : currentStep?.title ?? "";
  const displayBody = useWaiting ? currentStep!.waitingBody ?? currentStep!.body : currentStep?.body ?? "";

  useEffect(() => {
    if (!active || !currentStep) return;
    const title = displayTitle;
    const body = displayBody;

    setTypedTitle("");
    setTypedBody("");
    setIsThinking(true);

    const timers: number[] = [];

    const isFirstStep = activeIndex === 0;
    const startDelay = isFirstStep ? 720 : 380;

    const thinkingDelay = window.setTimeout(() => {
      setIsThinking(false);

      let titleIndex = 0;
      let bodyIndex = 0;

      const typeTitle = () => {
        titleIndex += 1;
        setTypedTitle(title.slice(0, titleIndex));
        if (titleIndex < title.length) {
          timers.push(window.setTimeout(typeTitle, 22));
        } else {
          timers.push(window.setTimeout(typeBody, 160));
        }
      };

      const typeBody = () => {
        bodyIndex += 2;
        setTypedBody(body.slice(0, Math.min(bodyIndex, body.length)));
        if (bodyIndex < body.length) {
          timers.push(window.setTimeout(typeBody, 18));
        }
      };

      typeTitle();
    }, startDelay);

    timers.push(thinkingDelay);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [active, currentStep, displayTitle, displayBody]);

  const activateTarget = useCallback(() => {
    const element = document.querySelector<HTMLElement>(currentStep.selector);

    if (element) {
      document.body.dataset.guidedClickProxy = "true";
      element.click();
      window.setTimeout(() => {
        delete document.body.dataset.guidedClickProxy;
        goNext();
      }, currentStep.advanceDelayMs ?? 40);
      return;
    }

    goNext();
  }, [currentStep.advanceDelayMs, currentStep.selector, goNext]);

  const handlePrimaryAction = useCallback(() => {
    if (activeIndex >= steps.length - 1 || currentStep.nextAdvancesOnly) {
      goNext();
      return;
    }
    activateTarget();
  }, [activateTarget, activeIndex, currentStep.nextAdvancesOnly, goNext, steps.length]);

  const handleToggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSED_KEY, next ? "true" : "false");
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    onActiveChange(false);
  }, [onActiveChange]);

  const spotlightStyle = targetRect
    ? {
        height: targetRect.height + 8,
        left: targetRect.left - 4,
        top: targetRect.top - 4,
        width: targetRect.width + 8,
      }
    : {};

  const isLast = activeIndex === steps.length - 1;
  const primaryLabel = isLast
    ? "Finish"
    : currentStep.actionLabel
      ?? (currentStep.nextAdvancesOnly ? "Continue" : currentStep.title);

  const isTyping = !!currentStep && (
    typedTitle.length < displayTitle.length ||
    typedBody.length < displayBody.length
  );
  const showStatusDot = !!active && (isThinking || isWaiting || isAutoAdvancing || isTyping);

  const HISTORY_LIMIT = 10;
  const historyMessages = active && currentStep
    ? steps
        .slice(0, activeIndex + 1)
        .map((step, idx) => ({
          stepIndex: idx,
          stepId: step.id,
          title: idx === activeIndex ? displayTitle : step.title,
          body: idx === activeIndex ? displayBody : step.body,
          actionLabel: idx === activeIndex
            ? primaryLabel
            : (step.actionLabel ?? step.title),
        }))
        .slice(-HISTORY_LIMIT)
    : [];

  const conversationRef = useRef<HTMLDivElement | null>(null);

  // Always scroll to bottom when a new step is loaded — user just navigated and
  // needs to see the new message even if they had scrolled up.
  useEffect(() => {
    const el = conversationRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeIndex, active]);

  // During typing within the same step, only follow if user is already at the
  // bottom (so they can read older messages without being yanked).
  useEffect(() => {
    const el = conversationRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, [typedTitle, typedBody, isThinking]);

  const dockOverlay = (
    <div className="ai-dock-layer" aria-live="polite">
      <div
        className={`ai-dock${collapsed ? " is-collapsed" : ""}${isResizing ? " is-resizing" : ""}${isDragging ? " is-dragging" : ""}`}
        ref={dockElRef}
        style={{
          width: dockSize.width,
          ...(dockPos ? { right: dockPos.right, bottom: dockPos.bottom, top: "auto", left: "auto" } : {}),
        }}
      >
        {!collapsed && (
          <section className="ai-dock-toast" style={{ height: dockSize.height }}>
            <div
              className="ai-dock-resize-handle"
              onMouseDown={handleResizeStart}
              role="separator"
              aria-label="Resize chat"
            />
            <header className="ai-dock-toast-head" onMouseDown={handleDragStart}>
              <span className="ai-dock-avatar" aria-hidden="true">
                <FontAwesomeIcon icon={faWandMagicSparkles} />
              </span>
              <div className="ai-dock-label">
                <strong>Skills AI assistant</strong>
                <small>
                  {showStatusDot && <span className="ai-dock-status-dot" aria-hidden="true" />}
                  <span>
                    Briefing to Billing
                    {active && currentStep ? ` · Step ${activeIndex + 1} of ${steps.length}` : ""}
                  </span>
                </small>
              </div>
              <div className="ai-dock-actions">
                <button className="ai-dock-icon" onClick={handleToggleCollapsed} title="Minimise" type="button">
                  <FontAwesomeIcon icon={faChevronDown} />
                </button>
                {active && (
                  <button className="ai-dock-icon" onClick={handleClose} title="Close guided demo" type="button">
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}
              </div>
            </header>
            <div className="ai-dock-conversation" ref={conversationRef}>
              <div className="ai-dock-quick-actions" aria-label="Quick actions">
                <button className="ai-dock-quick" type="button">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <span>Search for a job</span>
                </button>
                <button className="ai-dock-quick" type="button">
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create a task</span>
                </button>
              </div>
              <article className="ai-dock-msg ai-dock-msg-welcome">
                <div className="ai-dock-msg-eyebrow">Welcome</div>
                <p className="ai-dock-msg-body">
                  I can walk you through the full Briefing-to-Billing workflow. Want me to start the guided demo?
                </p>
              </article>
              {active && currentStep && historyMessages.map((msg, idx) => {
                const isLatest = idx === historyMessages.length - 1;
                const renderTitle = isLatest ? typedTitle : msg.title;
                const renderBody = isLatest ? typedBody : msg.body;
                const showCaretTitle = isLatest && !isThinking && typedTitle.length < displayTitle.length;
                const showCaretBody = isLatest && !isThinking && typedTitle.length === displayTitle.length && typedBody.length < displayBody.length;
                const bodyVisible = !isLatest || (!isThinking && typedTitle.length === displayTitle.length);
                return (
                  <article className="ai-dock-msg" key={`${msg.stepId}-${msg.stepIndex}`}>
                    <div className="ai-dock-msg-eyebrow">
                      {isLatest && isThinking ? (
                        <span className="ai-dock-typing-dots" aria-label="thinking"><i /><i /><i /></span>
                      ) : (
                        renderTitle
                      )}
                      {showCaretTitle && <span className="ai-dock-caret" aria-hidden="true" />}
                    </div>
                    {bodyVisible && (
                      <p className="ai-dock-msg-body">
                        {renderBody}
                        {showCaretBody && <span className="ai-dock-caret" aria-hidden="true" />}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
            {active && currentStep ? (
              <div className="ai-dock-cta">
                {activeIndex === 0 ? (
                  <button
                    className="ai-dock-ghost"
                    onClick={handleClose}
                    type="button"
                  >
                    Exit guided demo
                  </button>
                ) : (
                  <button
                    className="ai-dock-ghost"
                    onClick={goBack}
                    type="button"
                  >
                    Back
                  </button>
                )}
                <button
                  className="ai-dock-primary"
                  disabled={isWaiting || isThinking || typedBody.length < displayBody.length}
                  onClick={handlePrimaryAction}
                  type="button"
                >
                  {primaryLabel}
                </button>
              </div>
            ) : (
              <div className="ai-dock-cta">
                <button className="ai-dock-primary" onClick={restart} type="button">
                  Start guided demo
                </button>
              </div>
            )}
            <div className="ai-dock-input">
              <input placeholder="Ask Skills Workflow…" />
              <button className="ai-dock-send" title="Attach file" type="button">
                <FontAwesomeIcon icon={faPaperclip} />
              </button>
              <button className="ai-dock-send" title="Send" type="button">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const dockLeft = dockPos ? window.innerWidth - dockPos.right - dockSize.width : null;
  const frameRect = typeof document === "undefined"
    ? null
    : document.querySelector<HTMLElement>(".product-window")?.getBoundingClientRect() ?? null;
  const launcherLeft = dockLeft == null
    ? null
    : frameRect
      ? Math.min(Math.max(dockLeft, frameRect.left), frameRect.right - launcherWidth)
      : dockLeft;
  const launcherStyle: CSSProperties | undefined = launcherLeft == null
    ? undefined
    : {
        left: launcherLeft,
        bottom: launcherBottom,
      };

  const launcher = (
    <button
      className="ai-dock-launcher"
      onClick={handleToggleCollapsed}
      ref={launcherElRef}
      style={launcherStyle}
      title={collapsed ? "Open Skills AI" : "Minimise Skills AI"}
      type="button"
    >
      <span className="ai-dock-pulse" aria-hidden="true" />
      <span>Skills AI</span>
      <kbd>⌘K</kbd>
    </button>
  );

  const spotlight = targetRect ? (
    <button
      aria-label={`Continue: ${currentStep.title}`}
      className="ai-dock-spotlight"
      onClick={activateTarget}
      style={spotlightStyle}
      type="button"
    />
  ) : null;

  if (typeof document === "undefined") return dockOverlay;
  return (
    <>
      {createPortal(dockOverlay, document.body)}
      {createPortal(launcher, document.body)}
      {spotlight && createPortal(spotlight, document.body)}
    </>
  );
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

function readCollapsed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(COLLAPSED_KEY) === "true";
}
