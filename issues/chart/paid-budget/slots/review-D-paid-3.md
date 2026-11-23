# Slot D review of paid-budget, round 3

**Verdict `fix`**

Base `814a2387`  
Head `c9254f99af5f4d09a9e8093f9aa74553a527e822`

## Finding

- **F5 · `tests/e2e/watch-consults.e2e.ts:64–66, :276–291, :432–439`.** The deadline can kill a ready watcher and leave the test reporting a send failure as a red. The ready assertion awaits its screen message even when readiness succeeded. I delayed only this first `hc read --lines 80` with an idle fake watcher and a 7.5-second budget. The watchdog's kill returned zero at the deadline. The subsequent `hc send` returned 11, and the reported error was the generic send assertion. In a disposable copy that read the screen only on readiness failure, the same probe sent the task before the deadline and reported a minute stop at `watcher idle`. Fetch diagnostic screens only when the check fails, and enforce the budget before sending the watcher task.

## Re-check

- **F4 closed for an independent failure before the deadline.** The short consultant wait produced `no consultant started` with and without a delayed catch-block screen read. In the delayed run that read began about 1.3 seconds before the deadline and returned after the watchdog had fired. The verdict stayed the same.
- **Deadline path.** A nonresponsive fake watcher stopped at the cutoff and reported `watcher started` as its last completed stage. Both checked-in deadline tests passed, including the three-minute delayed consultant-screen case.

All 175 focused tests passed across `run-check`, `config`, `state-home`, `command-reference` and `verify`. Typecheck and `git diff --check` passed. Deadline runs used fake harnesses and private Herdr sessions.
