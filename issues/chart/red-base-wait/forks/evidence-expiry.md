# Evidence expiry

## Question
Q1. How is a base-red stop prevented from reusing leaf/base logs recorded before the current pass (the fail-fast case, review-B.md:24-30)? Mechanical refusal in `akrogon phase ... failed` for stale logs, a skill rule, or archiving old evidence on the move out of `failed`?

### Carries
- check-issue SKILL.md:25,61 allow reuse of completed evidence; commitMove resets state, not evidence (src/phase.ts:142-153). SHA cannot prove freshness (environment fix outside git).

## Findings
- (A) Option: the stop names both log paths and the command refuses unless both are non-empty and newer than the seat's `prompted_at`.
- (B) Option: a recovery marker that makes prior negative comparisons stale while keeping other evidence.

## Taken
Dissolved by base-evidence-reuse Taken (operator 2026-10-10: "cut"). No recorded base result, red record entry or earlier log is ever accepted as counterpart evidence, and every comparison runs the without-change side fresh in the same pass, so no expiry rule is needed. The fail-fast case (review-B.md:24-30) is removed with reuse itself.
Foreclosed: log freshness check against `prompted_at`, recovery marker.
