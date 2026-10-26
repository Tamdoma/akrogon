# Design: new-chart-proposal

## Binding decisions, verbatim

From issues/chart/autopilot-new-chart/forks/hold-proposal.md:

### Findings

- Opening maps: slots/map-A.md, slots/map-B.md, slots/map-C.md; merge slots/map-merged.md; rebuttals slots/rebuttal-B.md, slots/rebuttal-C.md; final checks slots/final-check-*.md, slots/final-check2-*.md.
- Agreed without a question, with rebuttal fixes:
  - Trigger (A,B,C): park only when the found work is its own destination (own observable outcome), the handed chart cannot hand off without it, and no existing open leaf or chart already covers it, judged with the Take research already done and no mandated extra scan (B RB3). When an existing open chart already covers it, A writes no proposal: the waiting chart's `wait:` line names that chart and the chart resumes once that chart's leaves are written, then follows the yes-path ordering (`blocked-by` in the same destination repo, else the cross-repo wait); when that chart is on the handed list and runnable, A takes it next; otherwise the wait stands and A moves to another runnable handed chart (C LR1, slots/leaf-review-C.md; B, slots/lr1-check-B.md). Work the handed chart does not need stays `recorded only`; a dependency serving the same outcome stays a prerequisite leaf; splitting expressly handed intake at the map stays A's (issues/chart/config-walls/CHART.md Mode record 2026-10-22, A,B). The proposal names the criterion that cannot pass without it (A,C).
  - Wait kind (C F2; A,B compatible): the proposal is an operator approval wait, so the existing "approval, need or prerequisite" trio in Drain, Open spans, `## Autopilot` and `## Handover` already covers move-on, span closing, handover trigger and mode persistence. No new wait kind and no `Held` (B R1). It is not a grant.
  - Home (A,B,C): one `proposal:` line per proposed destination in the waiting chart's `## Autopilot`, beside its `wait:` line, holding goal, why needed, which chart waits and the fixed question (forks/no.md). No folder (phantom open chart caught by duplicate detection, other-door holds and attended Drain), no seed (public GitHub write, A), no new file type (B,C).
  - Park point (C F4, Take): as soon as the destination and dependency are sharp enough to state the proposal, with findings recorded; A takes no further fork in that chart.
  - The waiting chart's Destination never grows to claim the new work while it waits (C P8, B R7).
  - Consultant consensus is never approval (B R5, C P4).

### Taken

- Q1, operator 2026-10-26: "o1, do it in autopilot with slot b and c as consultants. They're already active in this herdr tab." O1 as presented by the door: A marks that handed chart as waiting and moves on to other handed charts; the operator decides one chart or two. Foreclosed: O2, A splits it itself (autopilot growing its own list).
- Q2, operator 2026-10-26: "ok, go", answering "the F4 chart could also have A write a ready-made proposal for the new chart before it parks: the goal, why it's needed, and which chart is waiting on it. Then in the morning you only say yes or no. Should I add that to F4?"

From issues/chart/autopilot-new-chart/forks/no.md:

### Taken

A's pick (autopilot, 2026-10-26): Nb.
- The proposal line asks, fixed in form: "chart <X> on its own (yes) or bring it into <waiting chart> (no)?"
- Yes: the operator's words add <X> to the handed list (`changed list` mode entry); A charts <X> in the same autopilot run, handover as usual; the waiting chart resumes after <X>'s leaves are written.
- No: A resumes the waiting chart with the found work in scope as forks or prerequisite leaves; A rewrites the Destination under that answer and records the operator's no verbatim as the override.
- Free text (drop it, narrow it, anything else) stays a valid operator answer as always.
- Reason: it follows the operator-picked O1 ("one chart or two") and leaves no dead end; absorbing the work is explicitly the operator's no, never A's.
- Rejected: Na (terminal marker for a wait, loses overlap protection); Nc (a plain no leaves A nothing to act on).
- Standing dissent: B, "Nb invents permission to absorb a separate goal" (slots/rebuttal-B.md RB2); B later found the fixed two-choice question supplies that scope meaning (slots/final-check-B.md).

From issues/chart/autopilot-new-chart/forks/cross-repo.md:

### Taken

A's pick (autopilot, 2026-10-26): X1, corrected.
- Compare against the waiting chart's dependent leaf's destination repo, not the chart folder's repo.
- Same destination repo: the waiting chart hands off with `blocked-by` on <X>'s leaves, no wait.
- Different destination repo: after <X> is handed off, the waiting chart stays unhanded with one ordinary `wait:` line naming every needed <repo>/<leaf> of <X> and its landed check: each named leaf folder is under that repo's `issues/closed/`. No `pending step:` line.
- Resume: the operator's next message in the same door, by the existing waiting-chart rule; the mode stays on meanwhile. No cross-repo `blocked-by`, no timer.
- Reason: no code, existing records only; the cost falls on a rare case.
- Rejected: X2 (leaf may run before its dependency); X3 (new machinery beyond the handed work).
- Standing dissent: C D4 point 1, the mode stays tied to another repo's progress, which autopilot does not watch.

Off route (issues/chart/autopilot-new-chart/CHART.md): code changes including cross-repo `blocked-by`; new markers, queues, file types or schema; attended-door behavior; autopilot bounds, timers, polling, watcher.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md (repo copy skills/chart-issues/assets/standing-design.md).

Interpretation: this leaf changes process text only. No test is added: no done-criterion is a code behavior, and an exact-wording test would couple tests to prose (learnings/LESSONS.md, 2026-10-01 explanatory prose assertions). Proof is the review reading each criterion against the changed sections plus the destination's existing `checks` (format, test, typecheck) passing; `tests/docs-links.test.ts` already guards links in `docs/`. No live run, outside call, grant or secret is involved.

## Leaf architecture

Owned surfaces:
- `skills/chart-issues/SKILL.md` `## Autopilot`: criteria 1-4. It already holds the wait list ("These make that chart wait while the door moves on within its handed list ..."), the handed-list bound ("The door never turns autopilot on, extends the handed list ..."), Drain-under-autopilot scope and mode persistence; the new rule sits with them. Drain keeps its "Write one chart folder per destination" sentence; the precedence clause lives in `## Autopilot`.
- `skills/chart-issues/assets/shapes.md` `## Autopilot` line list: criterion 5, placed beside the existing `- wait:` line.
- `docs/use/autopilot.md` "What still waits for you" and "Read the record": criterion 6, in the guide's plain operator voice.

Consumers relying on the changed text:
- The chart-issues door itself (any agent loading the skill) reads `## Autopilot`, the `## Autopilot` line shapes and the existing wait trio in Drain, Open spans, `## Handover` and shapes `seats.yaml` spans. Classifying the proposal as an approval wait means those unchanged sentences already apply (move-on, span closing, handover trigger, mode persistence); this was checked against each sentence at charting (forks/hold-proposal.md, C F2).
- `src/status.ts` `lastStage` reads only the `Handed off`/`Closed`/`Held` markers; a `- proposal:` list line cannot parse as a marker because every `## Autopilot` line is a `- ` item (shapes.md Chart records).
- `tests/chart-shapes.test.ts` parses only the shapes readiness.yaml example; unaffected.

Exclusions: `skills/chart-issues/assets/questions.md` (its approvals-stay-operator-only exception already covers the proposal answer, B,C); `src/` and `tests/`; other skills; historical charts.

Open for the plan: exact sentence placement inside `## Autopilot` and whether the wait-list sentence or a new paragraph carries criteria 2-4, keeping each fact stated once.
