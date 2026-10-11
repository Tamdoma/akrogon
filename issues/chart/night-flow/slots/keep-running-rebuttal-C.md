# Rebuttal, slot C: keep running

Read 2026-10-11. Only disagreements and one correction of my own position.

## D1 Timer versus watch

- RB1 The merged notes say the timer "reverses a standing operator lock" and that "the round must show that T reverses it" (merged :8-9). The round cannot. The lock is operator verbatim in two places and names the timer: `issues/chart/seat-stall-detection/CHART.md:15` ("Any systemd user timer, `akrogon watch` process or elapsed-time trigger. Operator rule: no hidden watchdogs, clocks or polling") and `issues/chart/seat-stall-detection/forks/stall-detection.md:35-36` ("we need a solution that doesn't include any clocks, poles or watchdogs ... Look at all the previous fixes we did we never went for watchdogs or polling", then "Foreclosed by this direction: the systemd user timer"). Nothing in this chart's operator words reverses it: "automated without ... stopped processes" and "I don't want more complexity" do not mention clocks. Taken must pick W now and carry T to the operator as the one question (my Q1a). A slot cannot lift an operator lock by argument.
- RB2 B's `Linger=yes observed` is true (`loginctl show-user ivan -p Linger` prints `Linger=yes`, read 2026-10-11) and changes nothing: it proves the timer would run, not that it is allowed.
- RB3 B rejects W "as the required clock" (merged :7). W is a clock. The difference the lock draws is "hidden": the watch is started by the operator in his own session, the job is listed by CronList, and every fire prints its judgment. The timer is the named, unattended thing. If the operator says the visible session cron is also inside the rule, W falls too and the honest Taken is that nights need an operator-run session. That is Q1a, not a finding either slot can settle.
- RB4 Conditional, so the Taken is clean: if the operator reverses the lock, T beats W. No session, no 7-day expiry, 5-minute latency, and `--resume` already filters to allocated work and skips paused repos (`src/next.ts:1586-1602`). My pick is W only because the lock stands.

## Correction of my own W cost (not in the merged notes)

- RB5 The tick's `akrogon next <slug>` is typed dispatch with `isAutomatic` false (`src/next.ts:1543-1563`), which ignores pause; `skills/watch-issues/SKILL.md` never mentions pause (grep, read 2026-10-11). So W as written can restart work in a repo the operator paused. Removal: the tick runs nothing for a repo `akrogon status` reports paused. One sentence in the skill. T does not have this fault, which belongs in the comparison.

## D2 Per-commit versus net diff

- RB6 Not a disagreement. B is right: pushing history pushes every commit, and a code commit reverted by a later record commit has a records-only net diff but still lands code. Classify each ahead commit's paths. Drop D2.

## Line references in the merged notes

- RB7 `seat-stall-detection/CHART.md:18` and `:19` (merged :8-9) are `:15` and `:16` in the file as of 2026-10-11. Matters because these lines go into the Taken as the lock citation.
