# Brief: expiring-time-rule

## What
skills/plan-issue/SKILL.md's test-proof rules gain one line: a test expectation that would stop holding as calendar time advances either injects the time or computes its expected value from the time observed in the same run; deliberate elapsed-time and deadline bounds stay valid. The same paragraph's clause "since main is green by the receipt gate" is removed, because known-red-pass lets work pass while main is red and both edits sit on one line. (A,C)

## Why
On 10-17 a timing-report test with fixed age bounds turned red on main by date alone (fixed in 0dfae20) and stopped two leaves. Seat red-first proof cannot catch this kind of decay because it shows a test is sensitive to the change, not stable over time.

## Done-criteria
1. skills/plan-issue/SKILL.md, in the paragraph where A writes criterion tests, states the rule above once, and no other skill restates it.
2. That paragraph no longer says main is green by the receipt gate. (A,C)
