# Eligibility notes, slot A

## Q1 Which jobs may go direct
- Pick: hard refusals, checked mechanically from the draft: more than one leaf, any `blocked-by`, any non-empty
  `inputs`, `produces`, `grants` or `retained` in draft readiness.yaml, no B named, any pending human prerequisite.
  Everything else eligible; door's recommendation is judgment with stated reasons. Reason: these are exactly the fields
  whose safety rests on lifecycle machinery (dispatch refusal on missing inputs, src/next.ts; grant reuse rules in
  implement-issue/merge-issue). Cost: a small job needing one env var must take the lifecycle.
- Rejected: conceptual-only eligibility. Note the door can check draft presence via `gaps()` (chart-issues SKILL.md:80),
  so presence alone is checkable, but grants/fixture cleanup have no reviewer comparison path without a leaf.
- Evidence: better-than-training, chart-issues/SKILL.md:57-65,80; src/readiness.ts gaps; read 2026-10-08.
- Pitfalls: mode creep into live mutations, removed by the refusal list. Context exhaustion of the door, removed by
  recommending lifecycle when the door is deep in the session (judgment, stated in advice).
- Extra question: none.

## Q2 What the setting authorizes
- Pick: offer only. Setting on = door may show the direct option at handoff review with its recommendation; operator
  picks per chart. Reason: intake says "advise", like debate (SKILL.md:69). Cost: one extra answer per chart.
- Rejected: default-direct for eligible jobs: turns a recommendation into permission (questions.md:31).
- Shape: one boolean in repoSchema, default false, e.g. `direct: true`.
