# Slot D review of lane-first, round 8

**Verdict `fix`**

Base `814a2387`  
Head `7437fb6903adf5693025d7b1bcab1029bf269935`

## Finding

- **F15 · `src/run-check.ts:450–452`, `src/admission.ts:108–111, :130–140, :252–258, :346–348`, `src/stop.ts:93–102`.** The new stop order skips a check scope if the check's main process has exited and its background work is still draining. The pass writes `ended` before stopping the scope. Both the stop snapshot and the land hold's check lookup exclude that record. I ran the real land and verify services with a check whose main shell exited while a background worker ignored TERM and wrote heartbeats. Once the record said `ended` and systemd showed the scope deactivating, I ran unmodified `akrogon stop`. It killed the pass, returned zero, and admitted the queued same-repo check while the old worker was still writing. Keep draining scopes visible to stop and retain the repo hold until those scopes actually end.

## Re-check

- **F14 passes for a check still marked live.** With real systemd and ordinary `akrogon stop`, land exited first. The verify pass and the check's RAM scratch survived while its scope drained, and the queued check stayed waiting. It started after teardown. I also refused the first scope and guard stop, then retried with unmodified systemctl. The pass and queue hold survived through the retry's scope drain.

All 147 focused tests passed across `install`, `green-merge`, `pause-next`, `run-units`, `run-permit`, `command-reference` and `rollback` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. I used private systemd units and disposable worktrees. The supplied full Verify log has one session-reads failure, reported on base as well. I did not rerun full Verify.
