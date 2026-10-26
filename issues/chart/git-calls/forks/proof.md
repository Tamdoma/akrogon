# What proves the fix

## Question

Q1. Load bar for the failing test: how many two-at-once pairs, under what host condition, and with what duration margin?
- 1a: 20 pairs under comparable busy-host conditions, every suite green, target duration median and slowest reported (B P4).
- 1b: at least 5 pairs, zero fails, starting load recorded, slowest re-entering test at or under 10 s (two-thirds of its 15 s cap) (C V3).
- 1c: 8 pairs on a quiet host, zero fails (A map).

Q2. Three suites at once: required green, or measured and reported only?

Q3. CPU target: full-suite user plus sys before and after, three alternating runs; a named floor (C suggests 25%) or "lower than baseline with spread reported" (B P6)?

### Carries

- Same carries as forks/reuse.md.
- Chart suite-time fork load-sensitive-tests recorded "three at once is the target with a return to the operator on cap-only stretch"; operator then chose O1 (no waiting line) with two-at-once and three-at-once red (issues/chart/suite-time/forks/suite-shape.md, S1 landing 2026-10-26).
- shapes.md audit: a cost criterion names the structural work removed or "less than a baseline measured on the same host with before and after recorded"; a guessed wall-second or CPU-second cap is refused.

## Findings

- Current state on main 02dc5f91 (A, 2026-10-26): two at once 6 of 8 copies green at start load 30-90 from other host work, 2 of 2 green on a quiet host; three at once 13-16 fails per copy (fh2-x3, issues/chart/suite-time/slots/s1-runs.txt).
- At a 1-in-4 failure rate, 10 clean suites by luck is about 6% (C V3).
- B P5: E6 records a three-suite operator bar; a two-suite reproducer alone does not establish three-suite acceptance. C does not raise three-suite.
- B P6, C V2: same host, same command, alternating order, median of three; report spread.
- Points where slots differ: pair count and host condition (B 20 busy, C 5 with 10 s margin, A 8 quiet); three-suite required (B) or not raised (C); CPU floor named (C) or relative (B).
- Rebuttals: B7 quiet or five busy pairs cannot establish the busy-host fix; keep every suite result and target duration; three-suite bar stands unless superseded. C R5 eight quiet pairs miss the named condition; twenty pairs are about an hour of binary results; start load plus slowest duration carry more signal; three at once as extra data.
- Start load across fh3 pairs ranged 18 to 90 (issues/chart/suite-time/slots/s1-runs.txt), so a fix-only series cannot show the host was busy enough (A).

## Taken

A's pick under autopilot, 2026-10-26: `1a 2a 3a` (operator values: function over form, speed).

- 1a: in one session, alternate 10 two-at-once pairs on the fix head with 10 on the base, recording start load per pair. All 20 head copies green, and the re-entering test's slowest duration on the head below the base's in the same session. Every suite result kept. Rejected 1b: no same-session evidence that the host was loaded enough. Rejected 1c: about 24% luck at 5 pairs. Standing dissent B7: wants 20 busy pairs; answered by 20 head copies plus base pairs.
- 2a: three at once recorded only, fail counts for head and base. Rejected 2b: the operator accepted three at once red under O1 (issues/chart/suite-time/forks/suite-shape.md) and named the two-at-once fail. Standing dissent B7: three-suite bar.
- 3a: three alternating solo full-suite runs each; head median user plus sys below the base median, spread reported. Call counts are proven per removed read under Reuse 4a, not as a suite total (corrected after leaf review B10, C F2, 2026-10-26). Rejected 3b: guessed cap refused by shapes.md and withdrawn by C.
