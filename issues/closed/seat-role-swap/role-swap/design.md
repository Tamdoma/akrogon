# Design: role-swap

## Binding decisions, verbatim

### What moves (forks/what-moves.md), operator 2026-09-29: "1a | 2a"
- Q1: letter swap. A takes plan.synthesis, implement and check.fix. B takes re-review after a fix, merge and broadcast. A stays the left pane. Reason: the operator asked for a role swap, and A ends up as both the worker and the left pane. Foreclosed: placement-only swap (B moved left).
- Q2: each model keeps its job. The `slots.a`/`slots.b` values swap so pi keeps implementing and codex keeps reviewing and merging. Foreclosed: keeping values so codex implements.
- Correction, operator 2026-09-29: "you can swap those lines yourself, or in the lifecycle process."

### Cutover (forks/cutover.md), operator 2026-09-29: "1b - let's swap it immediately. I'll make sure nothing's running except for this until we're done with the update"
- No drain wait. The operator keeps every other leaf idle until the swap is live. No conversion code for existing state.yaml files is written. Foreclosed: waiting for a natural drain.

### Config swap owner (forks/config-swap-owner.md), operator 2026-09-29: "1a"
- The door committed the operator's config edit (3704d86). This leaf sets a = pi/meta/muse-spark-1.3-contributor/max and b = codex/gpt-6.1-sol/high in config.yaml, touching only those two seat entries, in the same branch as the code. Local main is updated only after this leaf's merger has finished its merged call and broadcast. Foreclosed: door swapping working-copy lines now; door swapping config at activation.

### Off route (CHART.md)
- chart-issues door A/B/C peers are untouched. The door's A is already the left pane.
- Both panes stay allocated up front.
- Historical letters in `learnings/`, `issues/closed`, `issues/log.jsonl` are not rewritten.
- Pane recovery placement is unchanged (a lost pane is re-split to the right for either seat).

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md, interpreted for this leaf:
- Auth, secrets, backend mutation lines: no auth or secret surface is touched. State changes stay real `akrogon phase` mutations.
- No vanity tests; mandatory negative tests: done-criterion 4 carries the wrong-slot refusals and the pane.A-idle non-close case.
- End-to-end flow: the operator-visible flow is the CLI lifecycle, verified by a real `bun src/akrogon.ts phase` invocation sequence in a scratch `AKROGON_HOME` (criterion 9), transcript saved as the artifact. No browser flow, so no Playwright.
- Leaf work is agent-owned. No human-only prerequisite remains (the config baseline commit 3704d86 is done). Activation (local main update after merge) is an operator step after this leaf, not leaf work.
- `.env`: no credential is needed.

## Leaf architecture
- Owned: `src/routing.ts`, `src/next.ts` (merged-tab close gate only), `config.yaml` (two seat entries only), `skills/plan-issue/`, `skills/implement-issue/` (SKILL.md, brief-template.md, worker-protocol.md), `skills/check-issue/`, `skills/merge-issue/`, `skills/watch-issues/SKILL.md`, `skills/AREA.md`, `src/AREA.md` if it states jobs, `docs/guide/` role statements, `README.md` role statements, `tests/next.test.ts`, `tests/phase.test.ts` and any other test asserting jobs.
- Unchanged: the `Slot` enum and state schema keep keys `A`/`B`; pane allocation order; `plan.positions`, `plan.rebuttal` and initial `check.review` pairing; `skills/broadcast-issue/` (worded by role); `skills/chart-issues/`; `docs/guide/chart.md` door section; `skills/watch-issues/scripts/observe.ts` (displays seats, decides no jobs); tests asserting slot identity rather than job (config, init, state, status fixtures).
- Excluded: anything under `issues/`; `learnings/`; conversion of existing state files; lazy pane creation.
- External operations: none new. The leaf changes no herdr, git or GitHub call shape, so no operation proof is required.
- Dependencies: none. blocked-by is empty.
