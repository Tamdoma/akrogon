# Slot D review of paid-budget, round 5

**Verdict `fix`**

Base `814a2387`  
Head `18372c506468cffdcc014e332e705558fb0d2804`

## Finding

- **F7 · `tests/e2e/watch-consults.e2e.ts:64–66, :275–279, :434–443`.** The watchdog marker can relabel an independent send failure as a budget stop. I ended the fake watcher outside the watchdog and ran the real `hc send`. It returned 11 more than six seconds before the deadline. The shim buffered that result until the watchdog ran. Its kill returned zero for the already-ended watcher, and the test reported a deadline stop at `watcher idle`. The marker records when the watchdog requested a kill. It cannot establish what caused the send to fail. That false budget stop can trigger a paid rerun of a real failure under the first-minute-stop rule. Preserve the independent failure and classify deadline stops using evidence that the watchdog interrupted the operation.

## Re-check

- **F6 passes for a send the watchdog interrupts.** I held the send until the watchdog killed the live fake watcher. The real send then returned 11, and the run reported the deadline at `watcher idle`. The immediate send-failure control kept its original assertion. Both checked-in send regressions passed.
- **F4 and F5 still pass.** The short consultant health failure kept `no consultant started` when catch diagnostics crossed the deadline. The passing ready check sent its task without hitting the delayed screen shim and the run reported the deadline at `watcher idle`.

All 175 focused tests passed across `run-check`, `config`, `state-home`, `command-reference` and `verify`. Typecheck and `git diff --check` passed. I used fake harnesses and private Herdr sessions. The supplied full Verify log records 1,358 passing tests, and the supplied deadline log records all five cases passing.
