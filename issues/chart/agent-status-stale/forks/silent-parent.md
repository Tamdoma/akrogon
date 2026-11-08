# Fork: silent-parent

## Question

1. Where does the fix live?
2. What does a silent parent show in the Agents list?
3. Does akrogon add a rule against backgrounding the door?

### Carries

- Session signposts (forks/signposts.md, Taken): 1c written rules over command checks; 4a whole family when no extra parts; 5a; 6a parts the herdr-app move keeps. This chart: full autopilot, A answers (operator 2026-11-04: "autopilot, autopilot signposts").

## Findings

Blind maps slots/map-A.md, map-B.md, map-C.md; merged in slots/map-merged.md; one combined rebuttal and leaf review per consultant (slots/review-B.md, review-C.md). Research: better-than-training: `hc get`/`hc ls`, `~/.claude/jobs/acb047ee/state.json`, the installed claude 2.1.318 binary strings (C), `hc --skill` "Status, recovery, and cleanup", ~/.config/herdr-app/AGENTS.md "The model", herdr-setup `mods/agents-by-tab/{tree.js,main.js}` and its test, inspected 2026-11-04. External practice: model-knowledge only, no search. Low weight.

## Taken

A's picks under full autopilot, 2026-11-04 (not operator words).

1. Three parts. (a) herdr-setup `agents-by-tab`: honest silence (pick 2), one leaf. (b) Operator step: report to Claude Code that a background job (`/bg`, `CLAUDE_CODE_SESSION_KIND=bg`) sends no OSC 7501 program status to its terminal and the viewer does not relay it, with the evidence in slots/map-C.md section 1. (c) akrogon step on main: one line in issues/chart/herdr-app/INTAKE.md that a backgrounded door reports no status to hc and appears as `agent: bash`, with the recovery "/stop, then claude --resume". Reason: the root fix belongs to the program that runs the job; the mod change is the only part under our lifecycle that makes the screen honest; signposts 1c, 6a. Rejected: a core status setter, a job-file reader, an OSC-writing hook (each adds a second status source).
2. A row the mod synthesizes for a silent ancestor (own status null, live sub-agents) shows a "no status" marker in the theme's `unknown` colour and no duration; in the priority view its family goes to a "No status" section between Working and Idle when no member is more urgent, so it never reads as Idle by its own silence; the folded group header's most-urgent state includes sub-agents. Plain shell panes without agent sub-agents stay as today; the viewer-closed case has no signal and stays out. Reason: function over form; honest over guessed. Rejected: show the children's state as today (the reported bug); guess working.
3. No rule against backgrounding: whether `/bg` was wanted is the operator's workflow choice, and the intake line in 1c records the effect and the recovery. Reason: removing over adding; a rule would forbid a feature the operator may use. Standing dissent: C (rule text plus recovery line).
- Correction (B review F1): urgency uses the existing normalization (a sub-agent's done counts as idle), so a silent parent with done sub-agents goes to No status.
- Corrections (C review D1-D4): tree.js holds the pure helpers the tests import; the `unknown` colour observed at charting (readiness `proofs`); the duration comes from `since(a)` in the row builder, `track` unchanged; a no-status row's name keeps the foreground colour.
