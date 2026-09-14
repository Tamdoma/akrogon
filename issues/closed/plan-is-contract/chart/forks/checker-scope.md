# What does the checker judge scope against?

## Question
Q10 · What does the checker judge scope against once the brief's do-not section is gone?

### Carries
- check-issue:14 reads `plan.md`, `implementation/brief.md`, ponytail; :22 judges against "plan, brief criteria/change list/exclusions/done/report and live contracts".
- plan-issue:14 is the only skill reading `design.md`.
- Astra F2 "Removes": checker and merger read the plan plus completion evidence.

## Findings
- Brief section 5 carried the exclusions. `plan.md` has no exclusions section today; `design.md` holds the locked ones and is not read at implement or check.
- Research, operator: Astra F2, read 2026-09-14. "A worker reading a scoped brief must receive the relevant locks; a reference into a moved chart is not automatically equivalent." Surfaced the fork.
- Research, better-than-training: GitHub spec-kit, github.com/github/spec-kit/blob/main/spec-driven.md, read 2026-09-14. Implement reads tasks derived from the plan and writes no further document. Supports one-contract reading.
- Research, practitioner: Böckeler, martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html, 2025-10-15, read 2026-09-14. Agents ignored notes that classes already existed and generated duplicates. The pitfall that a copied lock drifts.

## Taken
Operator answer (2026-09-14): chosen as the recommended set with "Least complexity, everything stays. The implementation has to be detailed and according to the rules. Just remove redundancies." `10a`. check-issue reads `plan.md`, `design.md` and `implementation/report.md` before the diff and judges scope against the design's exclusions and the plan's decisions; implement-issue reads `plan.md` and `design.md` too. Foreclosed: an Exclusions section copied into plan.md.
