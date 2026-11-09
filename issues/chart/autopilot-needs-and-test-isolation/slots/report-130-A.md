# report-130, slot A notes

## Q1
Pick: delivered by 97034315; close #130 naming it; no leaf. Reason: the report's base e3202dff predates 97034315; the report's own instrumentation put the 30 s in CLI passes (first `next` 30 s in a full-suite run), and lesson 2026-11-08-hc-shutdown-unit-leak records leaked hc-shutdown units (32,575) slowing every `systemctl list-units` pass and turning dispatch tests red on 15 s / 30 s timeouts on leaves and base. Today the suite adds no unit (1109 before and after a full run), the test holds 15.4 s under full CPU saturation, the same as idle, and passes in the full check. Cost: no proof against I/O or systemd-bound load from outside the suite (the operator's own cores still leak units on hc 0.1.18).

Rejected: a leaf now. Its only remaining target would be ~15 s of fixed waiting, which A's runs show does not scale with CPU load; a leaf would chase a margin with no observed failure (signpost 2a removes a cause, and none is observed).

## Q2 (only if Q1 were leaf)
Split scenarios keeping every assertion; `hd-silent` recorded only (3a). Criterion: passes on the same host at a recorded load with before/after timings, never a wall-second cap.

## Evidence
- better-than-training · git log 97034315, 2026-11-08 · test cores in own runtime, no units · changed the question from "how to shorten" to "is it already delivered".
- better-than-training · lesson history 2026-11-08-hc-shutdown-unit-leak.md · unit leak caused 15/30 s timeouts on base and leaves.
- measured · A 2026-11-09, slots/evidence/m130-*.log, full-test-2026-11-09.log.

## Pitfalls
- Closing while the host keeps an outside unit leak (operator cores on old hc): recorded in the close note and the chart; the operator's core restart is theirs, not a test repair (B R1).
- C's line-145 fail: if it was not an overlap, a second defect exists. Removed by C's timestamp check before the pick.

## Question the fork does not ask
None.
