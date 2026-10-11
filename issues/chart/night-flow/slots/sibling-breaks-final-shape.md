# Sibling breaks: proposed final shape after the operator's answer

## Operator answer (verbatim, 2026-10-11)
"1a, 2a, 3a"

The round presented (simplified wording the operator read):
- 1a: "A updates at the start and end of its work. If merge still finds a problem, it goes back to A, as today. Only instructions change, no code." Pitfalls: "A never updates while its helper agents are still working. A writes down what changed, so B only reviews the new part. If A can't reach GitHub, it stops and tries again later. It never works on old code by mistake. A conflict that can't be solved goes to the plan fix, never to `failed`."
- 2a: "No new rule. Question 1 already catches both kinds, predicted or not."
- 3a (reshaped after the operator's chart-framework decision "that should be akrogon rule too", INTAKE.md): write the rule into init-akrogon, setup docs and check-issue; one small text-only leaf; agents follow it, akrogon code cannot force it. framework fixes its own config as its leaf L9.

## Context since the rebuttals
- `akrogon sync` was broken in every repo with an `issues/seeds` folder since `fec7bc6`; fixed at the operator's request in `b5a8d11` (`eligibleRecord`, `src/sync.ts:6-13`), pushed `ec08dec`. framework synced `c45d6693f` with `fix_rounds: 8`. The records-sync draft's line references were updated.
- A pass ending without a phase move is prompted again by the next dispatch: `src/next.ts:631-645` (same phase, slot not done, seat not busy, grace elapsed).

## Q1 Taken shape (A), new leaf pass-refresh
Draft: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/drafts/night-flow/pass-refresh/brief.md and design.md (blocked-by plan-not-cap).

## Q2 Taken shape (A)
No sibling-naming rule. Nothing is written into chart-issues or shapes. B F11's view is recorded under Findings as the declined alternative.

## Q3 Taken shape (A), new leaf cheap-check-placement
Draft: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/drafts/night-flow/cheap-check-placement/brief.md and design.md.

## Questions for your check
- Does either draft contradict the operator's answer, an existing lock, a Taken decision or code you can cite?
- pass-refresh: is the failed-fetch stop (abort the rebase, record the error, end the pass with no phase move, re-prompted by the next dispatch) correct against `src/next.ts:631-645`? Is blocked-by plan-not-cap the right dependency for the unsolvable-conflict sentence?
- pass-refresh: is the check-issue `:67` range-diff sentence sufficient for B's diff-only re-check after a refreshed `check.fix`?
- cheap-check-placement: is the check-issue sentence placed and scoped correctly, given a leaf never changes `issues/config.yaml`?
