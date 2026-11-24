# Slot D delivery-flakes round 7

Verdict **fix** for `f7690e9c` on `29e6a65c`. Reviewed only `git diff ef9f0a9f f7690e9c -- src tests`.

- **F16 · fails in normal use.** The new warning regression can hang under load. Its 100 ms deadline includes launching the fake hc and receiving its snapshot. If that takes longer, the predicate never runs and the subprocess waits indefinitely for a warning. I delayed the snapshot by 250 ms and stopped the hung test with a 4 s external cap. Open the stream before starting the short predicate deadline and bound the warning wait so a missing warning fails promptly. See `tests/hc-identity.test.ts:454–465`.
- **F17 · minor.** The undefined rejection is fixed. A late rejection with `Object.create(null)` still makes `String(error)` throw an unhandled `TypeError`. I reproduced it after the wait had already returned `null`. See `src/hc.ts:590–600`.

The committed undefined-rejection case passed. For F15, I suppressed the snapshot lookup and forced the missing-`got` error. The test still reported `ENOENT`, and its `finally` removed both the socket and fixture home. F13 was accepted and stayed outside this pass.

Typecheck, diff check and all 14 identity tests passed. The supplied verify log records 1,427 suite passes and 70 repeat passes.
