# Repair authority

## Question
Q1 Which Fixes does B repair itself instead of sending them to A? Operator asked for a bigger cut than the bounded class and for evidence that GPT-6.1 Sol is not biased toward its own fixes.
Q2 May B repair findings from the first review? (answered 2a)
Q3 Who checks B's repair before B merges it? (answered 3a)

### Carries
- Locks: `issues/chart/realistic-fix-bar/` Fix bar (handed off 2026-09-30); `issues/chart/seat-role-swap/` A is the worker, B reviews and merges (handed off 2026-09-29).
- Related forks: `forks/operator-only-exit.md`, `forks/round-budget.md`.
- Operator correction 2026-10-02 verbatim: "1 - Not sure | 2a | 3a | Can we make the cuts even bigger percentage? What does the research say about this? GPT 6.1 SOL is a really strong self fixing model, it's not biased towards itself, but I do need a confirmation on that. I just want to avoid constant back and forthing for failed tests, it just doesn't make sense. In fact, this testing and fixes take up so much time, look at the recent fixes for akrogon."

## Findings
Round 1 (2026-10-02), merged in `slots/map-merged.md`, rebuttals in `slots/map-rebuttal-B.md`, `slots/map-rebuttal-C.md`.
- Q1 recommendation was 1a bounded (A,B,C). Operator: not sure, wants a bigger cut.
- Q2 operator 2a: yes, after both blind verdicts are recorded, B takes the Fixes from both reviews. Needs a routing change so check.fix can go to B. Recommended (A,B).
- Q3 operator 3a: no second reader. Each B repair is its own commit with before/after evidence, B runs `checks`, merge runs checks and merge_checks. Recommended (A,C); B held 3b (A checks B's patch).
- Round 2 (2026-10-02): blind returns `slots/repair-authority-B.md`, `slots/repair-authority-C.md`, merged `slots/repair-authority-merged.md`, rebuttals `slots/repair-authority-rebuttal-B.md`, `slots/repair-authority-rebuttal-C.md`.
- Recent akrogon: 5 trips since 09-25, all one local finding (3 docs, 1 wrong command, 1 test style), none a red test, 5 to 10 min each, about 35 min total. Every rule removes all 5. (A,B,C) The log cannot show where test time goes inside implement and merge. (B)
- Framework since 09-29 (35 trips): bounded 8 confirmed (B) to 17 (C); wide 27 ceiling (B) to 33 (C). B: mixed batches with operator or live work do not leave the trip even if B fixes the local part.
- Wide rule recommended (A,B,C): every Fix except plan/design changes, missing planned units, required live runs and operator-only items. B would allow already authorized live runs; C keeps all live runs with A because slow-run rules live only in `skills/implement-issue/SKILL.md:40-43,60-61`.
- Bias: not confirmable (A,B,C). GPT-6.1 Sol system card 2026-09-29: 1.50% misrepresentation in adversarial coding-deception test vs Astra 0.51% (A,C); 0.056% severe flags on 49,650 internal tasks (B); more reward-hacking flags than Astra (A); persistence after warnings 23.5% vs Astra 17.4% (C). Tests prove behavior, not unbiased choice of tests (B; Chen et al. ACL 2025).
- Proof: behavior fixes start with a failing test reproducing the recorded source (C); docs and command fixes use before/after evidence (B).
- Command-run checks gate: C says `src/phase.ts:283` global lock would block every leaf during checks and it reopens 3a; kept off route unless operator asks.

## Taken
Operator 2026-10-02, verbatim answers: "2a | 3a" (round 1) and "1a | let's also look into the slow part in akrogon you had mentioned." (round 2).

- Q1 1a: after both blind verdicts are recorded, B repairs every Fix from both reviews except plan or design changes, missing planned units, required live runs and operator-only items. Those go to A through check.fix, or stop through `failed` with the exact operator action. Behavior fixes start with a committed failing test that reproduces the recorded source, then the fix. Docs and command fixes carry before/after evidence. B may still send a repair to A when it judges the work too large for its pass. Reason: removes about 77-94% of recent framework trips and all recent akrogon trips. Foreclosed: bounded-only (23-49%), all Fixes (B becomes the worker, breaks the seat-role-swap lock).
- Q2 2a: B repairs first-review findings, never while A's blind review is still reading the head. Needs routing so check.fix can go to B. Foreclosed: re-check and merge only (misses 23 of 35 recent framework trips).
- Q3 3a: no second reader. Each B repair is its own commit, B runs every `checks` command and criterion proof, merge runs checks and merge_checks. Foreclosed: A checks B's patch (adds a loop and state). Accepted risk: GPT-6.1 Sol self-preference is unmeasured; system card reports 1.50% misrepresentation in an adversarial coding test.
