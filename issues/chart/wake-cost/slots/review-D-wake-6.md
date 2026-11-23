# Slot D review of wake-cost, round 6

**Verdict `ready`** for `e214179c` on `9f2cfc05`.

- **F14 closed (`src/timing.ts:160,182`).** I replayed the permission-denied symlink probe and also forced `EISDIR` during the read. Both kept the queued row and warned with the error code. Restoring the log let the next append through. `ENOENT` cleared the cache, and putting the same inode back at the same size reread its rows.
- **F15 closed (`src/timing.ts:164`).** I primed the queue with `queued`, replaced the log with an equal-size file containing `otherx`, and called `recordWait` for `queued`. The reader saw the replacement and persisted the new wait. The device and inode come from the same descriptor the reader uses.
- **F16 closed (`src/timing.ts:133–155`).** A parse-count probe confirmed one `JSON.parse` per complete row, including ignored kinds. A warm read parsed zero rows. An appended row split inside a UTF-8 character was parsed once its newline arrived. Schema validation stays on `wait`, `prompt`, and `visit_start`. The design accepts the measured 98–134 ms cold pass over 11 repos and 0.16–0.36 ms later passes.

The focused suite passed 354 tests across seven files. All three replay probes, typecheck, and `git diff --check` passed. The supplied Verify log `direct/check-test-1795449862452-4149090.log` reports 1,388 passes and zero failures.
