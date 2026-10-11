# Rebuttal, slot C

No disagreement with D1-D5 or the loops. Five items.

1. D2 "independent judgment, not trailer presence (B,C)" reads as a new gate. My point was that the judgment already exists: B lists every `Test-Change:` trailer and judges it against its cited source (check-issue/SKILL.md:47). The mechanical part is the refusal without a trailer (src/phase.ts:342-371). No new step. Restore the mechanics the merge dropped: `tests_head` recorded in state.yaml at the `implement` move, the guard runs `tests_head...HEAD` and keeps `A` lines beside `M`, `D`, `T` (src/phase.ts:351), and the plan's proof directory is added to src/test-files.ts.

2. Line 41 "not recommended: hidden suites" lost its evidence. ImpossibleBench (arXiv 2510.20270): hiding tests cut cheating to near zero but degraded legitimate performance, while read-only tests kept performance. SpecStory 2026-09-29 lists the upkeep: second suite, delayed feedback, leaks through failure output. Without that line the operator cannot see why 1a plus freeze beats held-out tests.

3. Q1 1b has a cost the merge omits. Seat B is `codex gpt-6.1-sol` at effort `medium`; seat A is `pi devin/swe-2-max` at effort `high` (`akrogon config` for framework). 1b hands test authorship to the lower-effort seat, and then B reviews the tests it wrote, which is the self-grading 1b claims to remove. 1a keeps both the operator's stated preference and the stronger seat.

4. Q2 2c exists only under 1b (the author is B). Under 1a it collapses into 2a. 2b would stop a leaf on every wrong interface guess; with tests written before the code exists that is the common case (formspark briefs already diverged from plan D2/D4 on the form-keys contract, brief-1.md:12 vs plan.md:13-15). Recommend 2a, with 2b reserved for a wrong criterion (locked decision, implement-issue/SKILL.md:34).

5. Q3 3b is already the rule for an observed failure: B adds the fail-first reproduction, then the fix (check-issue/SKILL.md:79). 3a and 3b differ only on a gap with no observed failure. State the question that way: does a gap with no failure get a mid-leaf test (3b) or a seed (3a). I hold 3a, because a test with no failing case is the "no vanity tests" line (standing-design.md:7) and the missing-test Fix (check-issue/SKILL.md:55) is loop L3.

Minor: R5's Kun Chen item is a search snippet only and should not carry weight in the decision.
