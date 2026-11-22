# Slot E re-check, round 6

Verdict `fix`.

Rebased chart base `61b2d50bdcd87b74dc7e1de6d11e7269dc44f368`. Reviewed commit `436b5179bc15987f78e8ef64aab99eecc4774867` on `d691f0e1ab5f5d21e5061cb3e3248298e7137592`. The range-diff shows the four previously reviewed patches carried forward unchanged and this commit added last.

**F7. A wake pass still reads the repo's timing log once per dispatch step.** Start a normal leaf with `akrogon next running`, then run `akrogon next --wake` with its seat live. A scratch CLI run on the reviewed head counted three calls to the real `readTimings` for that repo in the wake. `resumeRepos` reads it at `src/next.ts:836` to build the shared capacity map. The seated sweep then reads it again for the visit check at `src/next.ts:699` and through `recordWait` at `src/next.ts:670` and `src/timing.ts:141-143`. Each call reads and parses the full file. The commit removes the duplicate read between the two capacity scans, but the remaining per-leaf reads miss Q4 O1 in `INTAKE.md:24`, which calls for one read per repo per pass. An acceptance check needs a wake with a live seated leaf because a pass with an empty repo can already meet the limit.

## Verification

- `check slot-e-round6: 0 direct/check-slot-e-round6-1795367049364-745992.log`. All 34 tests in `tests/pause-next.test.ts` and `tests/timing.test.ts` passed.
- `check slot-e-round6-read-once: 1 direct/check-slot-e-round6-read-once-1795367059513-878809.log`. The real wake completed successfully. The read-count assertion got three calls and expected one. Instrumentation only recorded entry to the reader in a scratch tree, which was removed after the run.
- `git diff --check 436b5179^..436b5179` passed. The last commit changes no tests, docs or `AREA.md` files. The Q3 dispatch behavior remains covered. Slot A owns direct landing verification.
