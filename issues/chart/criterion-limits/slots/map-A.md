# Map A, criterion-limits, 2026-10-26

Formed after reading `skills/plan-issue/SKILL.md` and the leaf plan, before reading map-B or map-C.

## Class

The plan proves the gain half of a criterion (fewer calls) and drops its limit half (what must stay fresh, be retried, be refused, or not happen between). Red-first planning skips the limit half by construction: the base never reuses anything, so a limit case is green on the base and nothing asks for it. Tests lock after planning, so the gap survives to review.

## Change

`skills/plan-issue/SKILL.md` `## plan.synthesis`, next to the paragraph that maps each done-criterion to its observation: each criterion's limit clauses are mapped on their own, naming the planned code path that could break the limit and a case in the realistic shape that breaks it (two repos, a failure then a success), shown red against a deliberate break because the base already holds it.

Caught here: D3 needs a fail-then-retry case, which a cached `null` turns red. D2 needs a two-repo case with a `tab close` between, which the union read turns red.

## Not changed

- check-issue: review already blocks a criterion with no test that would catch its failure. It failed only because the plan gave it nothing.
- implement-issue: tests are locked after planning by design.

## Proof of the leaf

Judged by review against the file, as the drop-debate leaf judged its skill-text criterion. A text-contains test checks wording, not behavior (LESSONS.md 2026-10-01 prose assertions). A real replay of a planning pass is a paid, non-deterministic model launch.

## Pitfalls

- Edge-case sprawl: limited to conditions the brief states and that a decision can reachably break.
- A limit case mistaken for the red proof of the new behavior: it is shown red by a deliberate break, which the existing test rule already allows.

Evidence: better-than-training, `skills/plan-issue/SKILL.md` `## plan.synthesis`, leaf `plan.md` D2/D3/C2/C3, `skills/implement-issue/SKILL.md` `## implement`, `issues/closed/drop-debate/remove-plan-debate/design.md`, all read 2026-10-26.
