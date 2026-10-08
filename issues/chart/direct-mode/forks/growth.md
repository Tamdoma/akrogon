# Growth and repair bound

## Question
Q1. When a direct job turns out larger than charted, what happens to the branch, review evidence and chart, and how is double execution prevented?
Q2. What does one direct repair round count, what is the bound, and what happens when it is exhausted?

### Carries
- forks/container.md: 1a, no leaf record.
- forks/eligibility.md: 1a code only; 2a offer only.
- forks/landing.md (open).

## Findings

- Notes: slots/growth-A.md, growth-B.md, growth-C.md; merged slots/growth-merged.md; rebuttals slots/growth-rebuttal-B.md, growth-rebuttal-C.md.
- Q1: stop and preserve (A,B,C); WIP commit required for adoption because phase moves run requireClean (src/phase.ts:273-274,317-321) (C) vs no forced commit (B); `Direct attempt` section (C) plus Held only on abandon; adoption via slug-named branch (src/next.ts:263-290) (C) with planner deciding what to keep (B).
- Q2: round = B fix + one door repair pass + B re-check, landing-check repairs count (B); bound repo fix_rounds (A,B,C); push retries 2 (A,C) vs 0 (B); lifecycle restacks automatically (src/phase.ts:713-747) (C).
- Research: better-than-training, src/next.ts:262-295,655-666, src/phase.ts:151,256-321,713-747, src/config.ts:43,206-208, implement-issue/SKILL.md:33-36,59,76-84, check-issue/SKILL.md:39,51,63,83, read 2026-10-08.

## Taken
Operator 2026-10-08: `1a | 2a |`

Q1 1a: stop and save. Triggers: a locked decision must change, a need eligibility 1a excludes, a criterion cannot pass in scope after permitted repairs, a second outcome. Door stops coding and landing, commits existing work as one partial-labelled commit for a clean tree, keeps the worktree at `<worktree_root>/<slug>` (path bound at attempt start), and writes a `Direct attempt` section in CHART.md (branch, head, base, done, not done, trigger, review file paths, rounds used). The trigger becomes a new open fork. Operator then chooses lifecycle handoff (leaf slug equals the branch, so `ensureWorktree` adopts it; leaf starts at its normal planning phase, planner decides what to keep, lifecycle review covers the whole diff) or abandon (branch and worktree removed, `Held <date>`). No new direct attempt starts while a chart names a live direct branch.
Foreclosed: 1b delete and start fresh.

Q2 2a: one repair round = B `fix` (or a blocking landing-check failure) + one door repair pass of all Fixes + B re-check of the repair diff. Bound = repo `fix_rounds`; count recorded in the `Direct attempt`/chart record and survives session replacement. A passing last round lands; exhaustion stops with open Fixes listed and the operator chooses one more round, lifecycle handoff, or abandon. Push: up to 2 attempts, each with fresh rebase, checks and B conflict re-check; then stop with the branch kept. Push attempts are not repair rounds.
Foreclosed: 2b no automatic push retry.
