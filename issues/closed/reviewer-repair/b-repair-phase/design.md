# Design: b-repair-phase

## Binding decisions, verbatim
From `issues/chart/reviewer-repair/forks/repair-authority.md`:

Operator 2026-10-02, verbatim answers: "2a | 3a" (round 1) and "1a | let's also look into the slow part in akrogon you had mentioned." (round 2).

- Q1 1a: after both blind verdicts are recorded, B repairs every Fix from both reviews except plan or design changes, missing planned units, required live runs and operator-only items. Those go to A through check.fix, or stop through `failed` with the exact operator action. Behavior fixes start with a committed failing test that reproduces the recorded source, then the fix. Docs and command fixes carry before/after evidence. B may still send a repair to A when it judges the work too large for its pass. Reason: removes about 77-94% of recent framework trips and all recent akrogon trips. Foreclosed: bounded-only (23-49%), all Fixes (B becomes the worker, breaks the seat-role-swap lock).
- Q2 2a: B repairs first-review findings, never while A's blind review is still reading the head. Needs routing so check.fix can go to B. Foreclosed: re-check and merge only (misses 23 of 35 recent framework trips).
- Q3 3a: no second reader. Each B repair is its own commit, B runs every `checks` command and criterion proof, merge runs checks and merge_checks. Foreclosed: A checks B's patch (adds a loop and state). Accepted risk: GPT-6.1 Sol self-preference is unmeasured; system card reports 1.50% misrepresentation in an adversarial coding test.

From `issues/chart/reviewer-repair/forks/round-budget.md` (Q3 applies here; Q2 belongs to `recovery-keeps-rounds`):

Operator 2026-10-02, verbatim: "1a | 2a | 3a |"

- Q3 3a: B's in-pass repairs do not count against `fix_rounds`; only routed check.fix trips count. Reason: the cap bounds handoffs and an in-pass B repair makes none; no new state. Foreclosed: repair-start batch accounting (B). Accepted: B repair work inside one pass has no count limit; checks before merge still apply.

From `issues/chart/reviewer-repair/forks/operator-only-exit.md` (the rule text belongs to `operator-only-items`; this leaf applies it inside `check.repair`):

Operator 2026-10-02, verbatim: "1a | 2a | 3a |"

- Q1 1a: a confirmed operator-only item is never routed to A as a repair. B repairs the doable Fixes first under repair-authority 1a, then makes one `failed` stop naming every open operator action, the action first in `--reason`, with what the seat tried and which credential it used. If the item gates a criterion, merge waits. Recovery follows resolution. Reason: fewer turns and a second look at whether the item is truly operator-only (emdash-launch repo turned out deletable). Foreclosed: immediate stop in a mixed batch (B), command refusal, Fix-bar severity change.

Door interpretation (A, approved by the operator in the handoff review 2026-10-02): "Needs routing so check.fix can go to B" is built as a separate phase `check.repair` owned by B, so the owner of a repair phase is fixed by the phase and cannot be confused; `check.fix` stays A's.

Excluded here: recovery counter (`recovery-keeps-rounds`); merge red checks to `check.fix` stay A's and uncounted as today (not a review Fix); models and the cap value.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: state changes are real `akrogon phase` moves on real fixture repos (`tests/helpers.ts`), no mocked state. Each criterion is proven by the cheapest test that catches its failure: phase tests for routing and counting, one dispatch test for the prompt. No live or outside call. The standing line on changed prompts running one real call applies to chain stages replayed from recordings; akrogon has no such recorded seat stage, so no live seat run is required (A,C). Held (B): B reads that line as requiring one real seat call through the changed skill with the property recorded. B's fail-first rule in the skill is the binding repair-authority proof rule, restated once in `check-issue`.

## Leaf architecture
- Owned code: `src/routing.ts:2-12,30-38` (phase enum, routing entry, `failed` next list), `src/phase.ts:107-109,231-249` (review aggregation destination, increment and cap moved to `check.repair` to `check.fix`), `skills/watch-issues/scripts/observe.ts:11-12`, `tests/phase.test.ts`, `tests/next.test.ts`. (A,C)
- Owned prose: `skills/check-issue/SKILL.md` (new `## check.repair` section, description, prompt line, finish line requesting `check.repair` for fix, footer routing), `skills/implement-issue/SKILL.md` check.fix (repair only `Handed to A` items), `skills/merge-issue/SKILL.md:62` footer if affected, `skills/watch-issues/SKILL.md:34` seat list, `docs/guide/phases.md` table, diagram and repair text at `:101-105`, `docs/guide/idea.md:42-44`, `docs/guide/setup.md:58` (cap counts A handoffs), `docs/guide/cheat.md:122-123` (check.repair belongs to check-issue B). `docs/guide/state.md`, `src/AREA.md` and `skills/AREA.md` have no phase list and are not edited. (A,B,C)
- Literal interfaces: phase name `check.repair`; prompt `check-issue <slug> slot=B phase=check.repair leaf=<folder>`; B's finish `akrogon phase <slug> merge --slot B` or `akrogon phase <slug> check.fix --slot B`; `review-B.md` heading `Handed to A`.
- Existing state files stay valid: the phase enum only grows, and leaves now in `check.fix` keep today's path.
- Accepted (A,C): a recovery into `check.review` at `fix_rounds` 0 asks A and B again; the operator chooses the recovery target.
- `skills/implement-issue/SKILL.md` check.fix keeps the `operator-only-items` pointer; this leaf adds only the `Handed to A` input rule, after that leaf merges. (A,C)
- Exclusions: no second reader of B's repair, no new state field, no change to `merge` routing.
- Dependency: blocked by `operator-only-items` (its `Operator actions` rule is referenced, not restated).
