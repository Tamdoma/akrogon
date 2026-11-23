# Slot D review of paid-budget, round 2

**Verdict `fix`**

Base `814a2387`  
Head `8b1f5fb5265d145d3356e91713471a4f201dc840`

## Finding

- **F4 · `tests/e2e/watch-consults.e2e.ts:431`.** A failure that occurs before the budget expires can be relabeled as a budget stop. A fake watcher reached idle and started no consultant. With a short independent consultant wait and a 7.5-second budget, the control printed `no consultant started`. I repeated it with only the catch block's diagnostic `hc read` delayed. Diagnostics started 5.1 seconds before the budget expired, but the catch checked the time after collecting them and reported a session deadline. Under the first-minute-stop rule this can trigger a paid rerun of a real failure. Preserve the verdict before collecting diagnostics, and classify a budget stop where the deadline actually ends the wait or run.

## Re-check

- **F1 closed.** Migration drops the retired key before writing. The regression exercised first and second CLI invocations and failed with the round 1 migration code restored in a disposable worktree.
- **F2 original case closed.** The nonresponsive watcher replay with a 0.08-minute budget reported a session deadline and `watcher started` as the last completed stage. The rule now treats the first minute stop as a budget stop and requires progress on repeats. F4 covers the new misclassification in the other direction.
- **F3 closed by inspection.** The watcher kill uses the whole remaining minute budget. The test timeout is computed from that budget plus 120 seconds for teardown, with separate shorter health waits. The former fixed 13-minute ceiling is gone.

All 175 targeted tests passed across `run-check`, `config`, `state-home`, `command-reference` and `verify` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. The committed one-minute deadline test passed in 70 seconds. Deadline runs used fake harnesses and private Herdr sessions.
