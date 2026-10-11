# Design: pass-refresh

## Binding decisions, verbatim

From `issues/chart/night-flow/forks/sibling-breaks.md`, Taken. Operator, 2026-10-11, verbatim: "1a, 2a, 3a".

Q1, answer 1a as presented: "A updates at the start and end of its work. If merge still finds a problem, it goes back to A, as today. Only instructions change, no code." Pitfalls presented with it: "A never updates while its helper agents are still working. A writes down what changed, so B only reviews the new part. If A can't reach GitHub, it stops and tries again later. It never works on old code by mistake. A conflict that can't be solved goes to the plan fix, never to `failed`."

Reason: the start refresh makes a repair against current code and the end refresh proves the handed-off head on the main it meets (A,C; C RB1). The return cost is A's repair work, not the hop (C RB3).

Foreclosed: routing merge reds to B's `check.repair` (1b, B D1); a refresh only before handoff (B F8); proceeding on the last fetched tip after a failed fetch (B F9); a green no-commit replay going straight to merge; rebasing worktrees under running seats when a sibling lands; ordering leaves by file overlap; weakening guards; a separate bounce counter.

Q2 (2a, no sibling-naming rule) and Q3 (3a, cheap-check placement) are not this leaf's. Q3 belongs to `cheap-check-placement`.

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: skill text only, so there is no code test. Proof is the report's quoted edited lines and the by-meaning sweep. No live run and no outside call.

## Leaf architecture

- One shared refresh rule in implement-issue's Shared context or proof order, named once and used at the start of `implement`, the start of every `check.fix`, and before final proof. The merge-origin sentence keeps its replay and refers to it instead of restating fetch and rebase.
- The refresh before final proof sits after the point `:63` already requires every worker worktree removed. No refresh runs while a worker wave is in flight.
- The conflict sentence names plan-not-cap's plan-correction rule and does not restate it. That rule must exist on main first (blocked-by).
- The existing locked-decision stop (`implement-issue/SKILL.md:34`) is unchanged and not restated here (C F4).
- Declined: aborting the rebase to correct the plan (B F14). `plan.md` is in the registered checkout, so A corrects it with the rebase in progress.
- The resume sentence covers only a pass re-prompted after a refresh error. It is not a general resume rule (C F1).
- Not in scope: `src/` (routing at `src/phase.ts:1081,1108`, `src/routing.ts`, the merge stack); merge-issue; B's `check.repair`, which does not rebase; sibling naming in contracts.
- Parallel leaves editing the same skill: plan-not-cap (`implement-issue` `:42` and the check.fix section, blocked-by), guard-at-creation (`:25`). Overlap does not order work beyond the actual prerequisite.
- The merged known-red-leaf binds comparison records to HEAD, `base()` and the pass's `prompted_at` (`src/compare.ts:116-145`). The refresh order makes the final proof's records match the handed-off head (C F4).
