# skills area

## Commands

- `bun src/akrogon.ts install` links workflows into configured harnesses.
- `bun test tests/install.test.ts` checks installation and conflicting paths.
- `bun test tests/phase.test.ts` checks the phase command used for handoffs.

## Key files

- `skills/chart-issues/SKILL.md` runs the chart door — signposts round, three modes, drain, take and handoff; `assets/` holds `shapes.md` (chart records), `questions.md` (round shape and consultant exchange), `standing-design.md` and the step files `direct-route.md`, `autopilot.md` and `handover.md`; `scripts/` holds `chart-usage.ts`, `door-reset.ts` (the handover reset, started with `hc run --bg`), `transcript.ts` (a terminal's transcript path) and `direct-guards.ts`.
- `skills/init-akrogon/SKILL.md` proposes checks, grounding and repository setup.
- `skills/implement-issue/SKILL.md` runs implementation and repair passes.
- `skills/implement-issue/worker-protocol.md` defines worker scope and returns.
- `skills/check-issue/SKILL.md` defines review evidence and Fix/Nit verdicts.
- `skills/learn-issues/SKILL.md` triages active lessons not yet retired by a leaf: removes stopped lines, prepares operator-approved transfers, prints seed lines for checkable ones.
- `skills/lesson-rule.md` holds the shared rule every lesson write site follows; a file shared by several skills is reached through a link file inside each skill folder, never through `../`.
- `skills/lifecycle-rules.md` holds once the rules plan-issue, implement-issue, check-issue and merge-issue share: grant reuse and count lines, `.env` handling and the producer key save, kept command output, and the red-check judgment; each skill reaches it through a `lifecycle-rules.md` link inside its own folder and names its own record file, command forms and seat-only clauses beside the link.
- `skills/watch-issues/SKILL.md` runs the operator-started cron watch; `scripts/observe.ts` is its read-only inventory of hc seats (status per recorded address and labels, log path from `src/transcript.ts`) and `scripts/log-tail.ts` summarizes a seat's session log.

## Non-obvious patterns

- Skills guide agents; the command owns phase changes, counters and dispatch.
- Leaf artifacts go to the registered checkout, code to the leaf worktree.
- Implementation mode selects inline work, bounded workers or a serial-solo run; delegated mode runs each plan wave whole, up to 3 independent units at once, each in its own worktree with results cherry-picked onto the lane, while a serial-solo run — every wave holding exactly one unit, whatever the reason — has A implement the leaf itself in wave order with no workers, sub-briefs or worker worktrees, and its repair passes keep delegating.
- Worker returns include targeted-test evidence; A refreshes the leaf branch onto current main, then runs criterion proof plus `akrogon verify` before review, with `merge_checks` only at merge, except a `check.fix` pass after a red merge ending reruns the reproducing command of the rejected run.
- Lifecycle seats send no questions and pause for nothing; a human-only blocker is recorded and the pass ends with `failed`; a review finding that needs operator access goes under `Operator actions` by the check-issue rule, never as a Fix.
- `.env`/`.env.*` are never opened, printed or written by a tool; presence is checked with the `Missing:` lines of `akrogon status <slug>` (absent or empty counts as missing); declared checks and live operations consume values through `bun --env-file=<holder file> <script>` printing results, never values. See `skills/lifecycle-rules.md`.
- A red test or check with no cause in the leaf's diff gets one same-command retry; a green retry is `inconsistent` and a red one keeps the repair path; plans prove the brief's criteria with the leaf's own tests and `checks`, adding no `merge_checks` or whole-suite requirement the brief does not name. See `skills/lifecycle-rules.md`.

## See also

- `skills/implement-issue/brief-template.md` gives the eight-section worker sub-brief.
- `src/routing.ts` defines legal phases, required slots and next destinations.
- `docs/reference-index.md` links the other repository areas.
