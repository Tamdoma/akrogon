# Eligibility merged notes

## Q1 which jobs may go direct
- Hard refusals checked mechanically on the drafts: more than one leaf, non-empty `blocked-by` on unfinished work, pending human prerequisite, no B named. (A,B,C)
- Non-empty `inputs`, `produces`, `grants`, `retained` in draft readiness: refuse outright (A,C) vs allow with the door-run `gaps()` presence check and existing grant rules carried into the chart-held contract (B).
  - For refusal (A,C): grant reuse, created-ID records and stop line read `grants[]` from the leaf (implement-issue/SKILL.md:49; check-issue/SKILL.md:33); seats' presence check is `akrogon status <slug>` Missing lines (implement-issue/SKILL.md:45,59). Cost: a small job needing one env value goes lifecycle.
  - For allowing (B): `gaps()` needs no state.yaml (src/readiness.ts:87-120; chart-issues/SKILL.md:77-83), so presence is checkable. B frames full refusal as a valid deliberate code-only first version, not an impossibility. Cost: direct protocol must carry grant/proof/cleanup entry points by hand.
- Door-run charting `proofs` do not disqualify. (C) A,B silent.
- No done-criterion needing a live run or outside call during implementation. (C)
- No size thresholds; size is the door's stated recommendation. (A,B,C)

## Q2 what the setting authorizes
- Boolean in repoSchema, default false; true lets the door offer direct at the handoff review with a recommendation; operator picks per chart. (A,B,C)
- One combined question replaces the debate question: lifecycle (with debate yes/no) or direct. (C)
- Explicit "do it direct" already given in the session counts as the answer; a request for advice does not. (B,C)
- Route recorded in the chart; a later setting change does not alter an approved job. (B)
- Door may hit permission prompts, unlike dispatched seats. (C)

## Differences
- Q1 inputs/grants/produces: refuse (A,C) vs allow with carried gates (B).
