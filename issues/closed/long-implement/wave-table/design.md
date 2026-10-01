# Design: wave-table

## Binding decisions, verbatim

### wave-plan (issues/chart/long-implement/forks/wave-plan.md)
Operator 2026-10-01, verbatim: "1a | 2a".
- Q1 1a: the no-clock lock stays. Fix the cause, and accept that a leaf with a long real dependency chain can still run over 2h. Foreclosed: 1b, a phase ceiling that ends `failed`.
- Q2 2a: plan.md groups its checklist into waves. Each unit lists owned paths, shared test resources (a live fixture counts) and the units that must land first. Units with disjoint paths, no shared resource and no prerequisite share a wave of up to 3. implement-issue and worker-protocol drop "one at a time when unsure" and run each plan wave whole. check.fix repair briefs follow the same rule. Wording only, with no code, state field or clock. Foreclosed: 2b, one leaf per wave (a numeric size gate, already locked off route, C R4), and 2c, no change. Success is measured afterwards as worker wait width per phase (C R3, P4), not phase wall time.

### Excluded binding decisions
- proof-tail Q1 and Q2 belong to proof-order. stall-notice 1a writes no text.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

This leaf changes skill and guide prose only. No auth, backend, secret, browser flow, outside call or chain stage is involved. The cheapest sufficient proof is reading the changed sentences against criteria 1-4, plus the repo-wide absence of the deleted phrase (criterion 2). A wording test would be a vanity test and couple tests to prose (learnings/LESSONS.md, 2026-10-01). Blocking `checks` cover formatting and the docs link test.

## Leaf architecture
Owned: `skills/plan-issue/SKILL.md` (plan.synthesis checklist sentence, line 55), `skills/implement-issue/worker-protocol.md` (the wave sentence opening line 11), `skills/implement-issue/SKILL.md` (the delegation sentence at line 44 and the check.fix repair paragraph at line 66), `skills/implement-issue/brief-template.md:21` (closing sentence) (C), `skills/AREA.md:21`, `docs/guide/phases.md:77` (A,B,C) and `docs/guide/phases.md:87`.
Interpretation beside the binding text (B,C): "no prerequisite" in wave-plan Q2 means no unmet prerequisite and no dependency on another member of the same wave. A landed prerequisite does not keep a unit out of a wave.
Literal interfaces: wave cap 3 (unchanged). Sub-brief records "chunks that must land first", owned paths, shared test resource (`skills/implement-issue/brief-template.md:21`, record fields unchanged).
Shared-file note: proof-order edits other sentences of `worker-protocol.md:11` and `implement-issue/SKILL.md`. No ordering between the leaves; whichever merges second rebases onto the other's text. Held disagreement: C (D1) asked for proof-order blocked-by wave-table because both edit the single physical line worker-protocol.md:11. A kept them parallel: the skill orders only on an actual dependency, never file overlap, and the shared term "shared test resource" already exists at brief-template.md:21.
Excluded: `src/`, `skills/chart-issues`, `skills/check-issue`, `skills/watch-issues`, the slow-proof rules owned by proof-order, any clock or count, any file under `issues/`.
Dependencies: none.
