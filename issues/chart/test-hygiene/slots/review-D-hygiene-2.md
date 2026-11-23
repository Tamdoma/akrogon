# Slot D review of test-hygiene, round 2

**Verdict `fix`**

Base `814a2387`  
Head `de212716a40394227688d79770531a14438b7e36`

## Finding

- **F3 · `tests/e2e/watch-live.e2e.ts:859` and `:919`.** The new pause proof ignores a `next` call when the logging shim cannot read its turn. The shim explicitly records that case as `t=?`, and the assertions count only calls ending with the paused turn's number. In a free root cell I made the paused hook invoke `akrogon next --all` and simulated a failed turn read for that call only. The log recorded `call next --all t=?` and the full cell passed. Correlate the shim's calls with the hook's own recorded turn, or require complete attribution for calls observed during the paused check.

## Re-check

- **F1 closed for the original probe.** Removing only the hold sleep produced a zero-length span on due 2's turn. The root cell failed the boundary assertion. The late-pause root and normal shell cells both held due 2 across a boundary and sent due 4. All four hold blocks use the same assertion. A separate GNU `timeout` probe confirmed that the TERM trap records the interrupted hold span. The paid cells were reviewed by reading.
- **F2 closed for the original probes.** Skipping pause failed because no paused completion marker arrived. When I delayed pause until due 5 had called `next` in turn 5, the root cell accepted turn 6 as the paused check and passed. The positive root path checks the resumed turn's own `next` call. F3 covers the new missing-attribution case.
- All 44 tests passed across `watch-timer` and `run-units` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. The stand-in probes ran in disposable worktrees and private Herdr sessions, and teardown reported no leftovers.
