# Brief: base-red-exit

## What
Seats stop investigating failures that are already red on base, and plans stop adding whole-suite runs.

- `skills/implement-issue/SKILL.md` (implement end and check.fix) and `skills/check-issue/SKILL.md` (check.review) state one rule: when a red test or check has no cause in the leaf's diff, the seat runs that same command once, in the same mode (whole folder or single file), at `AKROGON_BASE` in a detached worktree at a unique path from `mktemp -d` (the leaf `$TMPDIR` when exported, the system temp directory otherwise), installing dependencies there as the leaf does; it keeps the result and evidence, then removes the worktree with `git worktree remove --force` before taking the red or green path. (A,B) Red there too: the seat ends the pass with `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>`, and the report (implement) or review file (check) records the base SHA, both log paths, and the failing test names and log tails from both runs. (B) Green there: the failure is the leaf's own and is repaired as today. The base run never runs automatically after every failure.
- `skills/plan-issue/SKILL.md` states the chart rule for plans: a plan proves the brief's done-criteria with the leaf's own tests and `checks` commands and adds no `merge_checks` or whole-suite requirement the brief does not name.
- `skills/AREA.md` and the guide pages that describe red criteria, review and planning (`docs/guide/phases.md` and any other hit) say the same.

## Why
Tamdoma/akrogon#50: on framework leaf `emdash-content-fixes` the implement seat spent about an hour on whole-folder failures it did not cause, built its own base copy at `/tmp/edd-base-check`, ran a 514 s base suite, and stopped only when the operator told it to (framework `issues/open/emdash-cms/emdash-build/emdash-content-fixes/implementation/report.md:58-69`). One whole-folder requirement (IN5, `plan.md:111`) was added by the plan, which has no rule against it. The red-criterion lock (a red criterion is never handed off as pre-existing, `implement-issue/SKILL.md:34`) stays; this gives seats a cheap way to reach that stop.

## Done-criteria
1. `skills/implement-issue/SKILL.md` states the base-run rule for both the implement end and check.fix, with all parts from the design: trigger (no cause in the leaf's diff), once, same mode, `AKROGON_BASE`, detached worktree from `mktemp -d` removed with `--force` afterwards, (A,B) the red-on-base `failed` exit and its reason, the report contents, and green-on-base repair. `SKILL.md:34`'s "never handed off as pre-existing, base red or modulo anything" still holds.
2. `skills/check-issue/SKILL.md` states the same rule for check.review with the `failed` exit for the reviewing slot and the record in `review-<slot>.md`; `check-issue/SKILL.md:49` (failed checks always block) and `:51` (rerun only on code change, missing evidence or a specific concern) still hold.
3. `skills/plan-issue/SKILL.md` refuses plan-added `merge_checks` or whole-suite requirements as in What, and keeps a whole run the brief itself names.
4. The implementation report pastes `grep -rn "base" skills/implement-issue skills/check-issue skills/plan-issue skills/AREA.md docs/guide` and `grep -rn "whole\|full suite\|merge_checks" skills/plan-issue docs/guide`, judging each hit by meaning: no hit contradicts the rule.
5. `bun run format`, `bun test` and `bun run typecheck` pass; `tests/docs-links.test.ts` and `tests/command-reference.test.ts` pass unchanged.

Credentials: none. Human prerequisites: none.
