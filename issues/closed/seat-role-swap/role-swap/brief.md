# Brief: role-swap

## What
Swap the lifecycle jobs of seats A and B. A (the tab's first, left pane) takes plan.synthesis, implement and check.fix. B (the right pane) takes the review after a repair, merge and the post-merge broadcast. plan.positions, plan.rebuttal and the initial check.review stay paired A+B. The command routes, the merged-tab close rule, the phase skills, the operator guide, the tests and the live seat config in `config.yaml` all change together in this one branch, so one local-main update switches everything.

## Why
Most leaves run without debate, so the seat doing synthesis, implementation and repair does nearly all the work. Today that seat is B in the right pane. The operator wants the main worker to be A in the left pane, with each model keeping its current job.

## Done-criteria
1. `src/routing.ts`: plan.synthesis, implement and check.fix list `['A']`; merge lists `['B']`; `requiredSlots('check.review', n)` returns `['B']` for `n > 0`; plan.positions, plan.rebuttal and check.review with no fix rounds list `['A', 'B']`.
2. `src/next.ts`: a merged leaf's tab closes on the idle/exit hook of `pane.B` (the merge seat), not `pane.A`. Pane allocation is unchanged: A is the tab's first pane, B is split to its right.
3. Tests prove, with the fake herdr, that a new `debate: 'no'` leaf's first prompt is `plan-issue <slug> slot=A phase=plan.synthesis leaf=<folder>` delivered to the tab's first pane, and that merge and post-repair review prompts go to B.
4. Negative tests: `akrogon phase` refuses `--slot B` for plan.synthesis, implement and check.fix, refuses `--slot A` for merge and for check.review when `fix_rounds > 0`, and a merged tab does not close when only `pane.A` goes idle.
5. `config.yaml` has `slots.a` = harness `pi`, model `meta/muse-spark-1.3-contributor`, effort `max` and `slots.b` = harness `codex`, model `gpt-6.1-sol`, effort `high`. `git diff <base> -- config.yaml` shows only those six value lines changed.
6. Skills state the new jobs: plan-issue (synthesis as A, `--slot A`), implement-issue plus `brief-template.md` and `worker-protocol.md` (worker seat A, standalone session as A), check-issue (post-repair re-check as B in `review-B.md`, the non-implementing reviewer reads `positions-B.md`/`rebuttal-B.md`, doc authorship with A, footer routes), merge-issue (`slot=B`, evidence in `review-B.md`, repair routes to `implement-issue ... slot=A`), watch-issues (`SKILL.md` required-seat table), `skills/AREA.md`. broadcast-issue stays worded as "the merge slot".
7. Operator guide and README match: `docs/guide/idea.md`, `phases.md`, `merge.md`, `cheat.md`, `parts.md` if affected, and `install.md` no longer contradicts `config.yaml` seat values. Each changed page is listed in the report.
8. A sweep for role statements (`rg -n "slot=[AB]|--slot [AB]|review-[AB]\.md|[Ss]eat [AB]|[Ss]lot [AB]|\bAs [AB]\b|\b[AB] (merges|implements|reviews|re-?checks|synthesi)" src skills docs README.md`) leaves no hit assigning the old jobs, excluding `skills/chart-issues/` and the chart-door section of `docs/guide/chart.md`. The report pastes the sweep output with a one-line reason per remaining hit.
9. End to end: in a scratch `AKROGON_HOME` with a scratch registered repo, run the real `bun src/akrogon.ts phase` sequence plan.synthesis `--slot A` → implement `--slot A` → check.review (A and B, one `fix`) → check.fix `--slot A` → check.review `--slot B` → merge `--slot B` → merged, and one refused wrong-slot call. The transcript is saved as an artifact and its path recorded in the report.
10. `bun run format`, `bun run typecheck` and `bun test` pass.
