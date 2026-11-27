# Opening map, slot A

## Forks

1. How observe.ts carries the paused state.
   - a: always print a second line `paused=<yes|no>`; when yes, print no leaf or unreadable lines. A watcher that skips the paused line sees nothing to act on, so the unsafe act (next/phase on a paused repo) has no input. Breaks the exact-output tests in tests/hc-observe.test.ts ('observe prints only the session line...'). Pick a.
   - b: print `paused` only when paused, leaves still printed. Absence means unpaused, and a filtered paused line leaves leaf lines that invite `next`. Rejected.
   - c: append ` paused=...` to the `session=` line. Breaks `lines[0] === session=<name>` in tests/e2e/watch-tier.ts observeReady and the old skill text's session parsing (S4a). Rejected.
   - d: exit non-zero when paused. Paused is a normal state, and a non-zero exit reads as a refusal. Rejected.
2. Where the paused bit is read: `isPaused(repoKey)` from src/pause.ts inside observe.ts after resolveRepoKey. A malformed paused.yaml throws PauseStateError, which main() already turns into stderr + exit 1 (S2a, no default).
3. Skill text: `## Observe` drops the `akrogon status` step and reads paused from observe's second line; `## Invocations` start check becomes the same observe check (still runs on a paused repo, reports paused). Never section unchanged.
4. Proof weight (S6a). Free: hc-observe on a real core for the paused and unpaused output; watch-timer stand-in hook (tests/fixtures/watch-hook.sh, watch-agent.sh) switched from `akrogon status` to observe.ts, with the paused check still acting on nothing. Paid: the live cells in tests/e2e/watch-live.e2e.ts wait on `call status` per check, so they turn false. Whether one real-harness cell must run is the lifecycle fresh-run rule's call, since the change reaches the model-facing check step.

## Consumers to change

- tests/hc-observe.test.ts: exact stdout for empty inventory and missing issues/open.
- tests/e2e/watch-tier.ts observeReady: checks line 0 only, unaffected by a new second line.
- tests/watch-timer.test.ts: `call status` is the check marker (statusCalls, waitChecks, 'hold-status' flag); the doc-text test asserts the skill contains `akrogon status` (Criterion 15) and must flip.
- tests/fixtures/watch-hook.sh, watch-agent.sh: run `akrogon status` as the model's check.
- tests/e2e/watch-live.e2e.ts: `call status` markers in stand-in and paid cells, the paused steps.
- docs/pictures/watch-loop.svg mentions status once; docs/reference/skills.md to check.

## Pitfalls

- A watcher holding the old skill text after a release link runs status then observe; the extra `paused=no` line must not break it. Removed by option 1a's separate line.
- The test marker swap could hide a lost check: the hold-status flag delays the status call to force busy dues; the replacement must hold the observe call the same way. Open for the plan.
- `next --all` and explicit `next <slug>` ignore pause (src/next.ts, `isAutomatic && isPaused`), so dropping the paused bit entirely would let the watch act on paused repos.

## Surprising

- The intake's fix direction matches; nothing contradicts it. The paid cells never test paused, so pause safety rests on free stand-in tests plus the no-leaf-lines design.
