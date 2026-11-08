# Round 21, slot C: review 3fdf8cd2 (O3)

Verdict: changes needed. Two defects, one in the unrun paid tier, one in the tick rule's wording. The deletion itself is clean.

## Deletion

No live reference to the wake or the label remains in code, skills or docs: grep for `wakeWatcher`, `akrogon.watch`, `watch-<repo>.lock` and `Watcher:` over k7 hits only `issues/` history and one dead assertion (F3). `skills/chart-issues` never used them. Nothing the wake provided is lost besides latency: the engine still gets `next --resume` at subscription (`src/listen.ts:34`) and `next --wake` on turn, blocked, finished and lost (`src/listen.ts:93`); the busy notice is still written (`src/next.ts:183-187`) and the failed move still announces (`src/phase.ts:218-219`). The seat-finished-before-subscription path only woke the watcher; `next --resume` covers the engine for it.

## F1. e2e clears with `send`, which the project's own rule says does not clear

`tests/e2e/watch-check.e2e.ts:176` runs `send(tier, watcher, '/clear')`. `skills/chart-issues/scripts/door-reset.ts:96-97`: "Keys, not a send: a sent `/clear` would arrive as chat text, not as the harness command", and the chart-door design fixed the reset as `hc keys` (`issues/closed/herdr-app/hc-doors/chart-door-on-hc/design.md:212`). If that rule holds, the watcher never clears, `transcriptFor` returns the same file and `:182` `expect(fresh).not.toBe(log)` fails after burning the tier's checks. Type it as keys (`/`, `c`, `l`, `e`, `a`, `r`, `enter`, as door-reset.ts:97), or prove a pasted `/clear` clears and fix the helper's comment. One of the two is wrong today.

## F2. The tick rule stops a compacted watcher

SKILL.md:17: "a tick that is the first prompt of its conversation ... means the operator cleared the watch". After an auto-compaction the model's context starts with the continuation summary, then the tick; nothing says the summary counts as a prompt, so a literal reading stops the watch at the first tick after every compaction. Watchers compact often: the herdr-era framework watchers hold 6 (`f9309d6f`), 14 (`3e5cd221`) and 12 (`480f6019`) "This session is being continued" records each. Add one clause: a compaction summary before the tick means the conversation was not cleared.

Smaller wording point, same line: with several matching jobs the stop steps delete nothing (SKILL.md:18), yet the tick replies "Watch stopped". Let the reply follow the stop steps' own report.

Other edges hold. A tick queued before the clear lands in the new conversation (round 12) and stops the watch, matching the operator's clear. A manual tick in a fresh process finds no job (the store is per process) and checks. `/watch-issues` typed after a clear is itself the first prompt, so the next tick checks: a restart works.

## F3. Dead assertion

`tests/e2e/watch-check.e2e.ts:140` still asserts `labels['akrogon.watch']` is undefined. Nothing sets it any more; delete the line.

## hc-listener sync

`tests/hc-listener.test.ts` now opens the second session's gate when `"finished"` appears in the tee of the first session's raw stream, so it proves the event arrived, not that the listener dispatched it (the old `hc connect` marker ran inside the dispatch). The assertions (pull, resume first; one `next --wake`; no overlap) do not depend on dispatch-before-gate, and the comment says "has arrived". Still proves the claim.

## Test gaps

The clear-stop rule is proved only by the paid tier, and only its happy path. F2's compaction case has no test and cannot have a cheap one; the wording has to carry it.

## Re-check of 57c044d3

Ready.

- F1 fixed: `tests/e2e/watch-check.e2e.ts:176-178` types the clear as keys (`/`, `c`, `l`, `e`, `a`, `r`, `enter`, the door-reset.ts:97 sequence) through `tier.hc`, which returns the exit code (`tests/e2e/watch-tier.ts:146`), and waits for the turn past the recorded `beforeClear`, which claude's `/clear` turn raises (round 12). Still a paid tier, not run.
- F2 fixed: SKILL.md:17 now says a compaction summary before the tick means the conversation was not cleared, the reply follows the stop steps' own result, and a prompt typed between the clear and the first tick spends the chance. docs/use/watch-while-away.md carries the same condition.
- F3 fixed: the `akrogon.watch` assertion is gone; no `akrogon.watch` left in tests.
- hc-listener test: the awk stage prints 8000 heartbeat lines after the finished event and touches the marker only when that print returns, so the marker needs the listener to have drained more than the pipe holds past the finished line. The heartbeats go only to the listener's stdin side (after the tee), are dropped at `src/hc.ts:394`, and `follow` handles lines in order, so the marker now means handled, as the comment says. Door A reports 5/5 alone and 2/2 with hc-status; nothing else in the diff.
