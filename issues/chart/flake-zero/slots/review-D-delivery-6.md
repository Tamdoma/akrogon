# Slot D delivery-flakes round 6

Verdict **ready**, with three minor findings. Reviewed `ef9f0a9f` on `14774a0e`.

- **F13 · minor.** The timer race can accept a predicate result after the wall-clock deadline if the event loop stalls before running the timer. I used a 60 ms wait and a predicate that blocked the loop for 120 ms before returning true. This head accepted `t1` at 129 ms. Round 5 returned `null` at 132 ms in the same probe. Check elapsed time before accepting the result. The replay deliberately blocked the event loop and did not exercise a production harness. See `src/hc.ts:570–572,588–607`.
- **F14 · minor.** The late-error warning assumes an `Error`. A callback that rejected with `undefined` after the wait returned `null` made the warning handler throw an unhandled `TypeError`. Treat the rejection reason as `unknown` when formatting it. The agy trust failure replay rejected with an `Error` and logged normally. See `src/hc.ts:590–601`.
- **F15 · minor.** The fixture test reads `got` before arranging cleanup. I suppressed the snapshot lookup. The wait rejected, `reading()` ended, and reading the missing file threw `ENOENT` while the fixture socket was still present. Put core and fixture cleanup in `finally` so the failing test cleans up its own session. See `tests/hc-identity.test.ts:495–505`.

**F11 and F12 closed in the reported cases.** Both held trust replies let the seat return unconfirmed before the reply. The late rejection logged a warning and neither case sent a task. Both tests failed with `1ec3af9f`'s wait restored. I delayed stdout for 3 s after writing the correct fixture marker and removed the settled guard. The new reader barrier caught the extra predicate call.

Typecheck, diff check and 39 focused tests passed. The verify log records 1,426 suite passes and 65 repeat passes. I did not rerun the reported 192-copy stress run.
