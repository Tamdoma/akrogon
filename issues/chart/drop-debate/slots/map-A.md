# Map A: drop-debate

## Evidence

- better-than-training · state.yaml scan of all 11 registered repos, 2026-10-25 · debate yes 21/1,058 leaves; 12 of 13 framework yes on 2026-10-12 (one batch).
- better-than-training · fix_rounds by debate value in closed state.yaml, 2026-10-25 · akrogon yes 0.80 avg (5 leaves) vs no 0.38 (215); framework yes 0.46 (13) vs no 0.81 (622). No consistent benefit, small and self-selected sample.
- better-than-training · `src/state.ts` `stateSchema` is `z.strictObject` with `debate: z.enum(['yes','no'])` required · removing the field rejects every existing state.yaml; keeping it makes every record carry dead data.
- better-than-training · `src/config.ts` repo schema is strict with `rebuttal: z.boolean().default(true)`; all 11 repos' `issues/config.yaml` carry `rebuttal` · removing the key rejects every repo config until each is edited on main.
- better-than-training · `issues/chart/state-unknown-keys/CHART.md` fork 2a · precedent: delete legacy shims after the main edit that migrates records.
- better-than-training · `skills/chart-issues/SKILL.md` `## Handoff` · with peers named, every brief and design is already reviewed by each peer "as an implementer" before write. Multi-model challenge already happens at charting, which is what debate duplicated.
- better-than-training · `skills/plan-issue/SKILL.md` `## plan.synthesis` · synthesis already answers every `Open for the plan:` question from the design and maps criteria to proofs.

## Forks

1. Legacy records. a) one leaf removes the schema fields and the door migrates every registered repo's state.yaml and config.yaml on main right after merge (Pending step, waits on the leaf), b) schema keeps accepting and ignoring `debate`/`rebuttal` as legacy keys forever, c) migrate first then remove. Pick c-shaped as a): the leaf's release and the record edit must land together or every repo breaks on the first command after release update. Risk: release lands in the installed copy before records change. Removal: leaf accepts the legacy keys and ignores them (one release), a later main step deletes keys, a follow-up removes acceptance. That is three moves. Simpler: leaf makes `debate` optional-and-ignored and `rebuttal` accepted-and-ignored, step on main strips keys in all repos, and the acceptance stays as one line each. I lean to a two-step: accept-and-ignore in the leaf, strip on main after merge, then remove acceptance as a pending step (precedent 2a).
2. Phases. Remove `plan.positions` and `plan.rebuttal` from `phaseSchema` and routing. Any record at those phases would become unreadable: none open now in any repo (scan). Pitfall: a closed record at those phases does not exist since closed is `merged`.
3. Handoff format. Lean no change. Debate's only value was a second model's view of the plan. Charting already runs that review on the brief and design with 2-3 models. The plan's remaining risk is A guessing at an implementation choice; the design already forces `Open for the plan:` questions and consumer tracing. Evidence on plan-caused Fixes needs the closed review files; defer to consultants.
4. Route. Direct is possible (one outcome, no inputs, B named) but the diff spans command, three skills, docs and tests, and it changes a strict schema that every repo reads. Lean lifecycle.
5. check-issue: drop the `positions-B.md`/`rebuttal-B.md` read and the "missing debate artifacts" line.

## Pitfalls

- Installed release vs records: every repo reads state through the installed release; removal before migration breaks all repos. Removed by accept-and-ignore first.
- Stale docs and pictures (`docs/pictures/phases.svg`) keep the old phases; lesson 2026-09-11 stale rule in docs. Removed by a docs sweep criterion.
- Tests asserting debate routing (`tests/next.test.ts`) get deleted, not rewritten to fake a phase.

## Questions the brief did not ask

- Should `rebuttal` removal and `debate` removal share one leaf? Yes, both are the same phase family.
