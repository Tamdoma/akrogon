# Slot D review of flake-zero, round 3

**Verdict `fix`** for `f7fa21be`, rebased as `b591fc70` on `1001cf8b`.

- **F8 · `tests/run-units.test.ts:432,725–734`.** The lock probe can recreate the capture file that the test is meant to prove survived. I removed `outLog` immediately after the cgroup drained and confirmed it was absent before calling `waitUnlocked`. The pathname form of `flock` created an empty file, and the entire test passed, including the refusal and file-presence assertions. Open the existing capture read-only and pass that descriptor to `flock`, as `abandonedCaptures` does. In a disposable worktree, that probe passed with the original capture and failed with `ENOENT` after deletion.

## Re-check

- **F4 closed.** I parked the actual out-of-scope holder for 15 seconds and confirmed the lock was busy after the scope drained. The updated test waited and then passed the refusal and clear-marker assertions. The supplied old-head replay fails at the refusal assertion.
- **F6/F7 removed from this change.** `src/stop-run.ts` matches main and the seeded guard-only test is gone. The per-unit stop work moved to lane-first.

The local merge tree matched the rebased head. All 268 tests in the four changed test files, typecheck, and `git diff --check` passed on that tree. The supplied full Verify log reports 1,381 passes and zero failures.
