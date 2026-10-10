# skills area

## Commands

- `bun src/akrogon.ts install` links workflows into configured harnesses.
- `bun test tests/install.test.ts` checks installation and conflicting paths.
- `bun test tests/phase.test.ts` checks the phase command used for handoffs.

## Key files

- `skills/init-akrogon/SKILL.md` proposes checks, grounding and repository setup.
- `skills/implement-issue/SKILL.md` runs implementation and repair passes.
- `skills/implement-issue/worker-protocol.md` defines worker scope and returns.
- `skills/check-issue/SKILL.md` defines review evidence and Fix/Nit verdicts.
- `skills/learn-issues/SKILL.md` triages active lessons: removes guarded lines, prints seed lines for checkable ones.
- `skills/lesson-rule.md` holds the shared rule every lesson write site follows.
- `skills/watch-issues/SKILL.md` runs the operator-started cron watch; `scripts/observe.ts` is its read-only inventory and `scripts/log-tail.ts` summarizes a seat's session log.

## Non-obvious patterns

- Skills guide agents; the command owns phase changes, counters and dispatch.
- Leaf artifacts go to the registered checkout, code to the leaf worktree.
- Implementation mode selects inline work or bounded workers; delegated mode runs each plan wave whole, up to 3 independent units at once, each in its own worktree with results cherry-picked onto the lane.
- Worker returns include changed-test evidence; A runs criterion proof plus every `checks` command before review, with `merge_checks` only at merge, except a `check.fix` pass after a red merge ending replays the exact rejected command.
- Lifecycle seats send no questions and pause for nothing; a human-only blocker is recorded and the pass ends with `failed`; a review finding that needs operator access goes under `Operator actions` by the check-issue rule, never as a Fix.
- `.env`/`.env.*` are never opened, printed or written by a tool; presence is checked with the `Missing:` lines of `akrogon status <slug>` (absent or empty counts as missing); declared checks and live operations consume values through `bun --env-file=<holder file> <script>` printing results, never values.
- A red test or check with no cause in the leaf's diff stops with one base run at `AKROGON_BASE`; plans prove the brief's criteria with the leaf's own tests and `checks`, adding no `merge_checks` or whole-suite requirement the brief does not name.

## See also

- `skills/implement-issue/brief-template.md` gives the eight-section worker sub-brief.
- `src/routing.ts` defines legal phases, required slots and next destinations.
- `docs/reference-index.md` links the other repository areas.
