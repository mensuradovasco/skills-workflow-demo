# Step 0 Plan — Interactive Demo Restructure + Animations

## Goal

Restructure the current 8-step Skills Workflow demo into a 6-step transformation story and replace click-to-advance behavior with a paced auto-play system that supports pause, replay, skip, and decision pauses.

This document is the planning pass only. No implementation beyond this plan is in scope yet.

## Success criteria

- Final narrative has exactly 6 steps.
- The dashboard opening is removed from the flow.
- The approval step is absorbed into the AI budget step.
- Project setup and project views are compressed into one stronger project scene.
- Resource planning and profitability become two distinct beats, with profitability as the climax.
- Asset approval is removed from the flow and replaced by an outcome-summary CTA scene.
- Auto-play infrastructure is shared across all scenes and built once.
- All changes stay within the existing visual system and component patterns.
- Missing UI needed for ideal animation choreography is logged to `docs/ui-gaps-phase2.md` during implementation instead of invented ad hoc.

## Current implementation inventory

### Current flow/state owner

- `src/DemoApp.tsx`
  - Owns `activeStep`, `activeWorkspace`, guided-demo state, top-level flow routing, and current step rendering.
  - Contains the current home / request scene inline inside `StepContent`.
  - Contains the current auto-play durations map for the existing 8-step flow.

### Current step-related component files in `src/`

1. `src/DemoApp.tsx`
   - Current Step 1 dashboard/home scene
   - Current Step 2 brief/request scene behavior is folded into the request/home path
   - Top-level step switching
2. `src/components/product/BudgetBuilder.tsx`
   - Current AI budget / estimate scene
   - Current approval-related hierarchy and budget action surfaces
3. `src/components/product/ProjectSetup.tsx`
   - Current project scene wrapper
4. `src/components/product/GanttView.tsx`
   - Current Gantt presentation used inside project scene
5. `src/components/product/ProjectCalendarView.tsx`
   - Current project calendar view
6. `src/components/product/ProjectPeopleJobsView.tsx`
   - Current jobs/by-person project view
7. `src/components/product/TaskBoard.tsx`
   - Current tasks scene
8. `src/components/product/ResourcePlanner.tsx`
   - Current resource planning scene
9. `src/components/product/Profitability.tsx`
   - Current profitability scene
10. `src/components/product/ExecutionProofing.tsx`
   - Current execution/proofing / asset approval scene(s)
11. `src/components/product/DocumentFrame.tsx`
   - Shared document-tab rendering used by budget/project-related scenes
12. `src/components/product/GuidedWalkthrough.tsx`
   - Current tooltip / guided step overlay with `Step X of Y` UI
13. `src/components/layout/AppShell.tsx`
   - Shared shell and top progress rail
14. `src/data/cocaColaCampaign.ts`
   - Core campaign data, `demoSteps`, team/tasks/budget/project data
15. `src/data/guidedDemo.ts`
   - Current guided flow sequencing and tooltip content
16. `src/motion/transitions.ts`
   - Existing lightweight timing helper

### Current step model in data

Defined in `src/data/cocaColaCampaign.ts`:

1. `request`
2. `budget`
3. `approval`
4. `project`
5. `tasks`
6. `resources`
7. `execution`
8. `proofing`
9. `profitability`

Important note: the current app already carries more than 8 named step states because the demo evolved in layers. Part A will normalize this into exactly 6 scene states and remove dead routing.

## Planned 6-step structure

### New step map

1. `brief`
   - Replaces current dashboard-first entry
   - Cold open with incoming request / brief tension
2. `budget`
   - Keeps AI estimate generation as the hero moment
   - Absorbs approval interaction via `Approve & convert to project`
3. `project`
   - Compresses project creation + multi-view signal into one scene
   - Ends settled on Gantt
4. `resources`
   - Dedicated capacity / allocation scene
5. `profitability`
   - Dedicated margin and finance climax scene
6. `outcome`
   - New summary + CTA scene replacing asset approval

### Old → new conversion

- Delete current dashboard entry beat from `request` scene structure.
- Remove standalone `approval` step entirely.
- Remove standalone `tasks` as a top-level step; its signal folds into project creation.
- Remove `execution` and `proofing` from the main funnel.
- Split current operational/finance material so:
  - resource planning remains Step 4
  - profitability becomes Step 5
- Add new Step 6 outcome summary scene.

## Planned file-level changes

### Files that will definitely change

- `src/DemoApp.tsx`
  - Replace current step map and routing with exact 6-step model.
  - Replace click-driven scene switching with shared scene wrapper usage.
  - Rework request/home scene into a true brief-arrival opening.
  - Remove old approval/execution/proofing branching from main funnel.
- `src/components/layout/AppShell.tsx`
  - Update top progress rail from current step model to 6-step model.
- `src/components/product/BudgetBuilder.tsx`
  - Add primary decision CTA: `Approve & convert to project`
  - Support autoplay-ready empty/skeleton → populated state choreography.
  - Potentially expose stable element IDs/layout hooks for budget-to-project transition.
- `src/components/product/ProjectSetup.tsx`
  - Normalize project scene around Gantt as the resting state.
  - Support brief multi-view teaser if tabs are present.
- `src/components/product/ResourcePlanner.tsx`
  - Convert from static view to scene-ready staged allocation choreography.
- `src/components/product/Profitability.tsx`
  - Promote into climax scene and support staged metric/chart animation.
- `src/components/product/GuidedWalkthrough.tsx`
  - Likely retire or substantially reduce, depending on how tooltip narration is preserved.
- `src/data/cocaColaCampaign.ts`
  - Replace `demoSteps` structure with 6-step version.
  - Add any lightweight derived data needed for outcome scene.
- `src/data/guidedDemo.ts`
  - Rewrite tooltip/copy order and remove dead references to deleted steps.
- `src/styles.css`
  - Shared layout adjustments for new step chrome and outcome scene.

### New files planned

- `src/components/demo/DemoStep.tsx`
- `src/components/demo/ProgressBar.tsx`
- `src/components/demo/DemoChrome.tsx`
- `src/components/demo/OutcomeSummary.tsx`
- `src/animations/variants.ts`
- `src/config/timings.ts`
- `src/hooks/useCountUp.ts` (or equivalent typed helper if needed)
- `docs/ui-gaps-phase2.md`

### Files likely unchanged or only lightly touched

- `src/components/product/ClientList.tsx`
- `src/components/product/ClientRequest.tsx`
- `src/components/product/AgencyWorkspaces.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Metric.tsx`

## Implementation strategy

### Phase 1 — normalize structure

1. Replace current step enum/data with exact 6 steps.
2. Remove deleted steps from routing and copy.
3. Create new outcome summary scene.
4. Move approval action into budget scene.
5. Compress project/tabs story into single project scene.

### Phase 2 — add shared scene infrastructure

1. Add `DemoStep` wrapper with:
   - duration handling
   - pause on hover
   - replay trigger support
   - `requiresClick` mode
2. Add per-step progress bar.
3. Add top demo chrome:
   - pips / step position
   - skip to end
   - replay
   - pause/play
4. Add shared timing config and motion variants.

### Phase 3 — animate each scene

1. Brief arrives
2. AI budget hero
3. Project conversion + view teaser + Gantt fill
4. Resource planning allocation choreography
5. Profitability dashboard population choreography
6. Outcome summary + CTA pause state

### Phase 4 — cleanup and validation

1. Remove dead code and imports from deleted steps.
2. Rewrite tooltip/narration copy around outcomes.
3. Run TypeScript build.
4. Verify localhost and deployed preview.
5. Produce and rank `docs/ui-gaps-phase2.md`.

## UI inventory by new step

### Step 1 — Brief arrives

Current assets likely reused:

- Home/request shell in `src/DemoApp.tsx`
- Top-right request notification card
- Existing client/logo data

Known gap:

- Current entry experience is still a dashboard-style composition, not a clean cold open around the incoming brief.

### Step 2 — AI generates budget

Current assets likely reused:

- `src/components/product/BudgetBuilder.tsx`
- Existing budget table, totals, tabs, hierarchy header

Known gaps to likely log later:

- Dedicated AI reasoning panel may not exist
- Strong enough budget-total typographic emphasis may not exist
- Budget → project `layoutId` morph may require structural alignment that current components do not have

### Step 3 — Project lives here

Current assets likely reused:

- `src/components/product/ProjectSetup.tsx`
- `src/components/product/GanttView.tsx`
- existing project tabs in document header
- optional `ProjectCalendarView` and `ProjectPeopleJobsView` for teaser-only flashes

Known gap:

- The current project flow may still think in separate steps instead of one compressed scene.

### Step 4 — Resource planning

Current assets likely reused:

- `src/components/product/ResourcePlanner.tsx`

Known gaps:

- Need to verify whether current UI has enough visible "allocation movement" affordances to mimic the reference rhythm cleanly
- If drag/drop does not actually exist, closest equivalent animation must be used and logged

### Step 5 — Profitability

Current assets likely reused:

- `src/components/product/Profitability.tsx`

Known gaps:

- Need to verify whether current view contains enough alert, KPI, and chart states to match the intended financial crescendo
- Margin alert/banner may not exist

### Step 6 — Outcome summary + CTA

Current assets likely reused:

- Existing button styles and shell/container patterns

Known gap:

- This scene does not exist today and must be built new, but must still look native to the existing system.

## Animation architecture plan

### Library

- Add `framer-motion`
- Do not add GSAP, Lottie, or any second animation runtime

### Shared variants/timings

Planned reusable exports:

- `EASING`
- `cascadeIn`
- `barFill`
- `countUp`
- `fadeSlideIn`
- `drawLine`
- `alertPulse`

### Scene control rules

- Auto-advance scenes:
  - Step 1
  - Step 3
  - Step 4
  - Step 5
- Requires click scenes:
  - Step 2
  - Step 6
- All scenes:
  - pause on hover
  - top progress bar
  - step pips
  - replay
  - skip to end

## Risks and decisions to resolve during implementation

### 1. Current guided walkthrough overlap

Risk:

- Existing `GuidedWalkthrough` may conflict conceptually and structurally with the new autoplay chrome.

Planned approach:

- Keep only what is still useful for narration storage or anchoring.
- Remove it from control of scene timing.

### 2. Budget-to-project shared-layout transition

Risk:

- Current budget rows and current Gantt task rows may be too structurally different for a clean `layoutId` morph.

Planned approach:

- Attempt a targeted shared-layout transition only for the strongest common elements.
- Fall back to disciplined cross-fade + floated budget total if the DOM structures fight the effect.

### 3. Missing finance-oriented UI

Risk:

- The current demo may not yet contain enough explicit finance-state surfaces to fully land the profitability climax.

Planned approach:

- Animate what exists.
- Log missing conversion-critical surfaces in `docs/ui-gaps-phase2.md`.

### 4. Deleted-step code residue

Risk:

- There are likely scattered references to deleted steps in:
  - `demoSteps`
  - guided demo copy
  - top progress rail
  - CTA handlers
  - local storage step state

Planned approach:

- Normalize the step enum first before animating anything.

## What will be logged in `docs/ui-gaps-phase2.md`

During implementation, each gap entry should include:

- Step number
- Spec'd missing element
- Why it matters for conversion/story clarity
- Suggested component/home for implementation
- Relative priority:
  - Critical
  - High
  - Medium

Initial likely candidates:

- AI reasoning side panel in budget scene
- Stronger budget total emphasis if current typography is too quiet
- Budget-to-project shared-layout morph constraints
- Missing delayed/over-budget finance alert surfaces
- Missing resource-allocation movement affordances
- Any weak CTA prominence on the final outcome scene

## Acceptance checklist for implementation pass

- [ ] Flow reduced to exactly 6 steps
- [ ] Dashboard opening removed
- [ ] Approval step removed and absorbed into budget
- [ ] Project scene compressed and ends on Gantt
- [ ] Resource planning and profitability split cleanly
- [ ] Outcome summary scene replaces asset approval
- [ ] Auto-play infrastructure added and reusable
- [ ] Hover pause works
- [ ] Pause/play works
- [ ] Replay works
- [ ] Skip to end works
- [ ] Step pips work
- [ ] Progress bar works per step
- [ ] Tooltip/copy sequence updated to outcome-led language
- [ ] `docs/ui-gaps-phase2.md` created and populated
- [ ] TypeScript build passes

## Stop point

After review of this plan, the next pass should:

1. implement the 6-step restructuring first,
2. add shared demo infrastructure,
3. then add scene choreography,
4. and finally produce `docs/ui-gaps-phase2.md`.
