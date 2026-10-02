# Design: recovery-keeps-rounds

## Binding decisions, verbatim
From `issues/chart/reviewer-repair/forks/round-budget.md` (Q2 applies here; Q3 belongs to `b-repair-phase`):

Operator 2026-10-02, verbatim: "1a | 2a | 3a |"

- Q2 2a: failed recovery keeps `fix_rounds`, with no exception for a cap failure. At the cap each recovery gives one more repair and a B-only re-check. Reason: simplest, stops recovery from refilling the budget and from making A review its own repair. Foreclosed: reset after cap failure (C).

Excluded here: where the counter increments and where the cap sits (`b-repair-phase`); operator-only stops (`operator-only-items`).

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: state change proven by real `akrogon phase` moves on fixture repos, no mocks. One changed test and one new test are the cheapest proof. No live or outside call.

## Leaf architecture
- Owned: `src/phase.ts` `fix_rounds` expression in `commitMove` (remove only the `recorded.phase === 'failed' ? 0` arm), `tests/phase.test.ts`, `docs/guide/phases.md:73`. `docs/guide/state.md` has no reset text and is not edited. (C)
- Interface: `fix_rounds` stays a number in `state.yaml`; no schema change. Leaves already reset keep their stored value.
- Exclusions: no change to the increment condition or the cap expression (the parallel leaf `b-repair-phase` edits them; the merge seat resolves the overlap), no new state.
- Dependencies: none.
