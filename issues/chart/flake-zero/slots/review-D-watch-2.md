# Slot D watch-concurrent review, round 2

**Verdict: fix** for `51d35cf6` on `bab50987`.

- **F1 closed.** The receipt-error case passed with the failing HC reply delayed 3.5 seconds.
- **F2 closed for the original schedule.** Pausing before the first watcher read now passes the backlog assertion. The final readiness read at `skills/watch-issues/scripts/timer.ts:206` and the send can still stall. Holding that final read for 2.2 seconds left due 3 selected while the clock reached due 4. The watcher was already observed idle, and due 3 met the busy-backlog assertion. The later boundary can be handled on the next poll.
- **F3. The later clock can authorize a resend using an older receipt.** At `skills/watch-issues/scripts/timer.ts:198`, this poll can now cross the resend threshold during a read and act on observations taken before that threshold. I let due 1 complete its turn, held a poll just after it read an absent receipt, and wrote the real timer label while the poll was held. When released just after the three-second threshold, this head sent `[1, 1, 2]`. With the original clock position it sent `[1, 2]`. The final watcher read checks readiness and never refreshes the receipt. Keep the late clock for accrual and use the poll-start clock for resend and drop decisions. I tested that split and got `[1, 2]`, with both existing resend cases passing.

Four focused tests passed on the reviewed head. The timing probes ran in disposable worktrees. I did not rerun full verify or stress.
