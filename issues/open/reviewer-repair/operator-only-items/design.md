# Design: operator-only-items

## Binding decisions, verbatim
From `issues/chart/reviewer-repair/forks/operator-only-exit.md`:

Operator 2026-10-02, verbatim: "1a | 2a | 3a |"

- Q1 1a: a confirmed operator-only item is never routed to A as a repair. B repairs the doable Fixes first under repair-authority 1a, then makes one `failed` stop naming every open operator action, the action first in `--reason`, with what the seat tried and which credential it used. If the item gates a criterion, merge waits. Recovery follows resolution. Reason: fewer turns and a second look at whether the item is truly operator-only (emdash-launch repo turned out deletable). Foreclosed: immediate stop in a mixed batch (B), command refusal, Fix-bar severity change.

From `issues/chart/reviewer-repair/forks/repair-authority.md` (applies only for the operator-only exception; B's repair routing belongs to `b-repair-phase`):

Operator 2026-10-02, verbatim answers: "2a | 3a" (round 1) and "1a | let's also look into the slow part in akrogon you had mentioned." (round 2).

- Q1 1a: after both blind verdicts are recorded, B repairs every Fix from both reviews except plan or design changes, missing planned units, required live runs and operator-only items. Those go to A through check.fix, or stop through `failed` with the exact operator action. Behavior fixes start with a committed failing test that reproduces the recorded source, then the fix. Docs and command fixes carry before/after evidence. B may still send a repair to A when it judges the work too large for its pass. Reason: removes about 77-94% of recent framework trips and all recent akrogon trips. Foreclosed: bounded-only (23-49%), all Fixes (B becomes the worker, breaks the seat-role-swap lock).
- Q2 2a: B repairs first-review findings, never while A's blind review is still reading the head. Needs routing so check.fix can go to B. Foreclosed: re-check and merge only (misses 23 of 35 recent framework trips).
- Q3 3a: no second reader. Each B repair is its own commit, B runs every `checks` command and criterion proof, merge runs checks and merge_checks. Foreclosed: A checks B's patch (adds a loop and state). Accepted risk: GPT-6.1 Sol self-preference is unmeasured; system card reports 1.50% misrepresentation in an adversarial coding test.

Excluded here: `fix_rounds` counting and recovery (`recovery-keeps-rounds`, `b-repair-phase`); command refusal on recovery (foreclosed).

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: prose-only skill change; "Leaf work is agent-owned ... an unforeseen physical blocker ends the attempt and informs the operator" is the rule being sharpened. No vanity test of prose wording (akrogon rejects wording tests); proof is the criteria's skill statements and the recorded `rg` listing, and the lifecycle's `checks` still run. The standing line on changed prompts running one real call applies to chain stages replayed from recordings; akrogon has no such recorded seat stage, so no live seat run is required (A,C). Held (B): B reads that line as requiring one real seat call through the changed skill with the property recorded.

## Leaf architecture
- Owned: `skills/check-issue/SKILL.md` (Shared context rule, Fix-bar pointer), `skills/implement-issue/SKILL.md` (check.fix end: after doable Fixes, one stop for open operator actions), `skills/merge-issue/SKILL.md` (stop rule reference), `skills/AREA.md` if it describes stop rules.
- Interface: heading `Operator actions` in `review-<slot>.md`; `akrogon phase <slug> failed --reason` unchanged.
- Exclusions: `skills/plan-issue/SKILL.md:29` stays as is, since planning has no review findings (C); no Fix-bar severity change (a criterion it gates still blocks), no change to `skills/watch-issues/SKILL.md:38` (already forbids recovering human prerequisites), no code.
- Consumer: `b-repair-phase` references this rule from its `check.repair` section.
- Dependencies: none.
