# Design: plan-is-contract-skills

## Binding decisions, verbatim

### What is the one completion record, and where does it live?
Operator answer (2026-09-14): `7a`, chosen as the recommended set with "Least complexity, everything stays. The implementation has to be detailed and according to the rules. Just remove redundancies." `implementation/report.md`, written by B after the last check: changed files and reasons, commands with pasted results and artifact paths, base and committed head, known limitations, unverified criteria. Worker returns fold into it. check-issue and merge-issue read `plan.md` and `report.md`. Foreclosed: a `## Completed` section in plan.md; per-worker `report-N.md` files as the record.

### When B finds an implementation-only constraint before coding, does it go into plan.md?
Operator answer (2026-09-14): `8a`. B appends a dated `## Implementation notes` section to `plan.md` before coding, only when a constraint is missing, naming each constraint and the decision it refines. Locked decisions are refined there, never changed; a conflict with a lock is a mismatch recorded for review. Foreclosed: deviations recorded only in the report; a separate notes file.

### Does a delegated leaf with one unit still get a worker brief?
Operator answer (2026-09-14): `9a`. Delegated mode always writes one sub-brief per unit from the eight-section template, one unit included. Inline mode writes nothing. The template's opening paragraph drops the whole-leaf brief and keeps the sub-brief rule; standalone keeps its task brief from the template. Foreclosed: handing a worker plan.md with the command in the prompt.

### What does the checker judge scope against once the brief's do-not section is gone?
Operator answer (2026-09-14): `10a`. check-issue reads `plan.md`, `design.md` and `implementation/report.md` before the diff and judges scope against the design's exclusions and the plan's decisions; implement-issue reads `plan.md` and `design.md` too. Foreclosed: an Exclusions section copied into plan.md.

### Operator goals, verbatim from the intake
keeping simplicity, not increasing complexity unless it REALLY benefits the process, but even then only minimal. Then cost, then speed. On this leaf: "Least complexity, everything stays. The implementation has to be detailed and according to the rules. Just remove redundancies."

### Standing design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any leaf touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first leaf needing it. Non-browser flows use a real request or invocation. The blocking `checks` commands judge the exit code and the implementation report records the artifact path as evidence.
- Leaf work is agent-owned. A step physically requiring the operator is a human-only prerequisite completed before the leaf opens. Credential access alone never qualifies. An unforeseen physical blocker ends the attempt and informs the operator.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

Current interpretation: no auth, browser or secret surface exists here. The user-visible flow is an agent reading the changed skills at its next leaf phase; the test fixtures cannot run a skill, so verification is the blocking checks plus the grep artifact in done-criterion 9, and the checker reads the changed sections end to end as a fresh implementer would. No env values are needed. The skill folders are symlinked into `~/.claude/skills`, `~/.codex/skills` and `~/.pi/agent/skills` from this checkout, so the edits go live at merge, not in the leaf worktree.

## Leaf architecture

Owned surfaces: `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` line 14, `skills/AREA.md` line 25, `docs/guide/phases.html` line 61, `docs/guide/files.html` line 104.

Literal interfaces, the sentences that run as rules. Wording is by content; the file names, the section name `## Implementation notes` and the five report contents are literal.
- implement-issue:3: "using eight-section worker sub-briefs and sequential workers or configured inline execution".
- implement-issue:21: "use its `plan.md`, `design.md` and current review findings while editing only the leaf worktree."
- implement-issue:33: "Before coding, when an implementation-only constraint is missing from `plan.md`, append one dated `## Implementation notes` section naming each constraint and the decision it refines; a locked decision is never changed there, and a conflict with one is a mismatch recorded for review. Then implement the plan's checklist in order yourself when config says `inline`, otherwise write one sub-brief per unit from the template, one unit included, and delegate each to a subagent sequentially in this worktree using the worker protocol."
- implement-issue:39: "... then commit the code on the leaf branch and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; ..." with the rest of the sentence unchanged.
- implement-issue:47: "revise the plan notes and affected sub-briefs around those defects"; :51: "append the repair's before and after commits to `report.md`".
- brief-template:3: "Read when B writes or revises a worker sub-brief or a standalone task brief; ..."; :5: "A delegated leaf writes `implementation/brief-1.md`, `brief-2.md`, etc., one per unit and one unit included, each with these eight sections and only its own scope, with the binding facts for that scope copied in rather than pointed at; the leaf has no whole-leaf brief because `plan.md` is its contract. Standalone writes one task brief with these sections."
- check-issue:14: "then read its `plan.md` including any implementation notes, `design.md`, `implementation/report.md` and this skill's ponytail before inspecting the worktree diff."; :27: "judge the whole initial diff against the plan's decisions, criteria, change list and checklist, the design's exclusions, the report and live contracts, ..." with the rest unchanged.
- merge-issue:14: "read its plan, `implementation/report.md` and reviews".
- phases.html:61: "writes `implementation/report.md`"; files.html:104: `implementation/report.md` row with the same description; skills/AREA.md:25: "gives the eight-section worker sub-brief."

Tests: none added. The existing suite, typecheck and format run as the blocking checks.

Exclusions: everything under Off route in the chart; `worker-protocol.md`, both ponytails, plan-issue, the standalone sentence, `src/`, `tests/`, other guide pages, closed leaves and their files, and L1's guide lines (phases.html:74, problems.html, next.html, setup.html, cheat.html).

Dependencies: none. `command-deletions-batch` edits other lines of `docs/guide/phases.html`; file overlap does not order work. Credentials: none.
