# Chained units

## Question
When a leaf's chunks must run one after another, should one agent build the whole leaf instead of handing each chunk to a separate worker, and how does planning tell chained from parallel?

### Carries
- [fix-order](fix-order.md) 1a: "One agent builds the whole leaf only where its chunks must run one after another."
- Plan waves already list "the units that must land first" (`docs/guide/phases.md:80`, `skills/plan-issue/SKILL.md:59`).
- (A) about 4 min seat time per extra unit. (B) serial inter-worker gaps median 0.9 min, p90 14.2 min. 66 of 203 multi-worker leaves ran workers serially.

## Findings
Research: better-than-training, `skills/plan-issue/SKILL.md:59`, `skills/implement-issue/worker-protocol.md:11`, framework transcripts (B map), read 2026-10-12. No peer blind notes: operator asked for all remaining questions at once; B and C ran a final check (framework chart `slots/final-check-*.md`).
- (C final check) Waves serialize units for prerequisites and also for shared owned paths or shared test resources, so the trigger must be stated as an observable plan shape.

## Taken
Operator 2026-10-12: `1a | 2a | 3a` (1a for this fork).

When every wave in the final plan holds exactly one unit, A builds the whole leaf itself with no workers, whatever the reason for the serial order (prerequisite, shared path or shared test resource) (A,C). Any wave with two or more units keeps workers. Reason: hand-offs between serial workers cost about 1 min median, up to 14 min, and buy no parallelism. Foreclosed: 1b keep workers for serial plans.
