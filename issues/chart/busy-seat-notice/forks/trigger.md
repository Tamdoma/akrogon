# Trigger

## Question
Q1. The 2026-09-18 decision (../seat-stall-detection/CHART.md Off route) bans akrogon clocks, polls and watchdogs and accepts silent stalls. Does that stand, or is it narrowed so the operator-started watch (skills/watch-issues, 20-minute cron) sends a once-per-episode elapsed-time notice for every busy seat, including leaves it skips `next` for?

### Carries
- observeBusy only runs inside `next` (src/next.ts:227-260); watch Busy rule acts only on loops (skills/watch-issues/SKILL.md:40); observe.ts already prints busy= and notified=.

## Findings
- (A,B) Both prefer the watch over a new clock; B: notice latency equals the watch cadence and nothing fires without a watch.

- (A,B) No new trigger code: observeBusy already runs before the blocked check in dispatchLeaf (src/next.ts:660-668), so the gap is only that the watch runs no `next` when seats are busy (watch-issues SKILL.md:36,40). Change: the watch runs one `akrogon next --all` per fire when any seat is busy, then re-observes; Busy rule becomes "no steering for duration alone". Rejected (A,B): akrogon or plugin timer, watch-side notifier, per-leaf `next <slug>` (throws on failed/parked deps).
- (B) That pass is a normal mutation pass: it can advance other eligible leaves and, as a manual pass, bypasses repo pause (src/next.ts:659,1442-1501). Proof before handoff: fixture with a dependency-blocked busy seat and old busy_since notifies once and does not prompt it (B R4). Notes: slots/busy-A.md, slots/busy-B.md.

## Taken

Operator, 2026-10-10: "But what will I get with this warning? The point is that this is systemic. It shouldn't even be possible to have four hour leaves. It's something with how the implement issue assigns wor. So that's probably a bigger question, not whether we should patch it or not. So consult with slot B and slot C and get to the bottom root cause of the problem that even makes it possible in the first place to create such long leaves. Look at it as a from a perspective of a systems thinker. What are the bottlenecks in the system? How does the stock and flow analysis help here? What is the stock? What is the inflow and the outflow of this particular system primarily implement issue? What are the reinforcing loops that are reinforcing bad behavior? And what are the balancing feedback loops that don't have calibrated targets or the targets are wrong, or the sensor is wrong? Look at it from that perspective."
Notice-only trigger and bar paused; the chart's destination is under review (root cause of long leaves).
Systems analysis: slots/system-{A,B,C}.md, system-merged.md, system-rebuttal-{B,C}.md (2026-10-10). Root cause (A,B,C): a leaf can bundle a product change with new proof machinery and live proof; check.fix then spends hours on machinery defects, and repair is bounded only by handoff count, never inside a pass. Busy notice does not touch the cause (A,B,C).

