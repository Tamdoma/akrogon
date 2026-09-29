# What moves

## Question
Q1. What does the swap change: the letters or only the pane placement?
- Letter swap: A takes plan.synthesis, implement, check.fix. B takes re-review after a fix, merge and broadcast. A stays the left pane, so the worker is on the left.
- Placement swap: B is allocated to the left pane and A to the right. Letters, routes, skills and docs stay as they are.

Q2. With a letter swap, does each model stay with its job?
- Swap the `slots.a`/`slots.b` values in config.yaml so pi (muse-spark) keeps implementing and codex (gpt-6.1-sol) keeps reviewing and merging.
- Or keep the values, so codex becomes the implementer.

### Carries
- No locks yet. Operator: "Everything else is the same. I just want to swap the roles."

## Findings
- Tier better-than-training, inspected code 2026-09-29. src/routing.ts:26-43: B owns synthesis/implement/fix, requiredSlots gives A the re-review after a fix. src/next.ts:321-342: A is the tab's first pane, B is split right. src/next.ts:222 maps A to slots.a, B to slots.b. src/next.ts:748 closes a merged tab when pane.A goes idle.
- Letter swap surfaces (A,B): src/routing.ts:26-43 including requiredSlots, src/next.ts:748, skills plan/implement (+brief-template, worker-protocol)/check/merge/watch-issues + observe.ts, skills/AREA.md:22, docs/guide idea/phases/merge/cheat, tests next/phase. review-A.md as merge evidence becomes review-B.md.
- Placement swap surfaces (B): src/next.ts:321-342 and the tests that assert which pane gets the first prompt.
- (A) recommends letter swap: the operator named it twice. (B) recommends placement swap: smallest change, same visible result.
- (A,B) Q2: seat config follows the job. config.yaml has an uncommitted operator edit setting a=codex, so the value swap is an operator step on main, not leaf work.
- (B) rebuttal R1: pane recovery re-splits a lost pane to the right in both options (src/next.ts:324-341). This is today's behavior for A too.

## Taken
Operator 2026-09-29: "1a | 2a"
- Q1: letter swap. A takes plan.synthesis, implement and check.fix. B takes re-review after a fix, merge and broadcast. A stays the left pane. Reason: the operator asked for a role swap, and A ends up as both the worker and the left pane. Foreclosed: placement-only swap (B moved left).
- Q2: each model keeps its job. The operator swaps the `slots.a`/`slots.b` values in config.yaml on main, so pi keeps implementing and codex keeps reviewing and merging. Foreclosed: keeping values so codex implements.

Correction, operator 2026-09-29: "you can swap those lines yourself, or in the lifecycle process."
- Changes Q2's owner only: the a/b value swap is no longer an operator step. Who does it moves to forks/config-swap-owner.md. Q1 and the value result stand.
