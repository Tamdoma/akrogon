# Slot D watch-concurrent review, round 3

**Verdict: ready** for `89da5ed4` on `bab50987`.

- **F1 closed.** The receipt-error test passed with the HC reply delayed 3.5 seconds.
- **F2 closed.** Pausing before the first watcher read still passed the backlog check. The accrual loop reads the clock after HC returns. The accepted delay in the final readiness read or send can leave later boundaries for the next poll.
- **F3 closed.** Resend and drop decisions use the poll-start time again. In the late-receipt replay the timer sent `[1, 2]`, and both existing resend tests passed.

The range-diff shows only the intended timer clock change and its explanation. Root typecheck and all five focused cases passed. I ran the timing probes in a disposable worktree and did not rerun full verify or stress.
