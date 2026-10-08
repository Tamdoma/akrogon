# Growth and repair bound fork notes, slot C (blind)

Carries: container 1a; eligibility 1a code only, 2a offer only; landing 1a door lands (rejected push keeps branch, retry bound set here), 2a close and broadcast.

## Q1. When a direct job turns out larger than charted, what happens to the branch, review evidence and chart, and how is double execution prevented?

### Pick
Growth is a stop with the same triggers the lifecycle already uses for an implementer, then a return to charting, then an ordinary handoff that adopts the branch.

Triggers (any one ends the direct attempt, no judgment call beyond them): a locked decision would have to change (implement-issue/SKILL.md:34); a need appears that eligibility 1a excluded, an env value, a grant, a produced key (implement-issue/SKILL.md:33, :59); a done-criterion cannot pass within the owned surfaces after the permitted repairs (implement-issue/SKILL.md:36); or a second independently checkable outcome appears, which is the leaf-split rule (SKILL.md:45).

Stop procedure:
1. Door commits what exists on the branch (green units as normal commits; partial work in one commit whose message names it partial), leaving a clean tree. Branch and worktree are kept at `<worktree_root>/<slug>`.
2. Door writes a `Direct attempt` section in CHART.md: branch, head sha, base sha, what is done, what is not, the trigger, and the paths of B's review files under `slots/`. No marker is appended; the chart is open again.
3. The discovered question becomes a new fork file, listed first under Open forks (SKILL.md:55 reshape rule). Charting continues as usual; the operator answers.
4. Handoff is the ordinary handoff: the leaf slug equals the branch name, so `ensureWorktree` adopts the existing worktree at `<worktree_root>/<slug>` and the existing `refs/heads/<slug>` instead of creating fresh ones (src/next.ts:263-290: existing path is validated as a worktree root sharing the common dir; existing branch is checked out rather than created). The leaf design states "branch `<slug>` at `<sha>` carries partial work; plan from `git log $AKROGON_BASE..HEAD`", and the planner sits in that worktree because `next` allocates the worktree before prompting any phase (src/next.ts:659-666). The chart then takes `Handed off <date>`.
5. If the operator instead abandons the item, door removes branch and worktree and appends `Held <date>`.

Double execution is prevented by three existing facts plus one rule: slug uniqueness is checked at handoff against open and closed leaves (shapes.md:122); a branch with the slug name is adopted, never recreated (src/next.ts:278-288); the last marker in CHART.md is authoritative (SKILL.md:85), so a chart with a `Direct attempt` section and no marker is visibly mid-flight; and the rule: the door never starts a direct attempt on a chart whose `Direct attempt` section names a live branch.

Reason: this reuses the implementer's stop triggers, the chart's reshape rule and the command's branch adoption, adding only the CHART.md section. Nothing new has to track state.

Cost: the planner inherits commits it did not write and must read them; a partial commit on the branch has no reviewed status until B's lifecycle review covers the whole range (check-issue/SKILL.md:39 judges the whole initial diff, so it will).

### Rejected
- Discard the branch and hand off fresh. Throws away committed, partly reviewed work and B's evidence; the planner would redo the same reading. The adoption path exists, so there is no reason not to use it.
- Continue direct past the trigger with a note. The triggers are exactly the cases where eligibility 1a was wrong in hindsight; continuing turns a code-only route into one carrying needs with no gate.
- Hand off at `check.fix` or `check.review` to skip planning. Those phases need `plan.md`, `implementation/report.md` and review files under the leaf (check-issue/SKILL.md:14), none of which exist under 1a. `plan.synthesis` is the earliest phase that can read the branch and produce them.

### Evidence
- better-than-training, implement-issue/SKILL.md:33-36, :59, read 2026-10-08: the three implementer stops.
- better-than-training, src/next.ts:262-295 and :655-666, read 2026-10-08: existing worktree path and branch are adopted; allocation precedes the first prompt.
- better-than-training, shapes.md:122 and chart-issues/SKILL.md:45, :55, :85, read 2026-10-08: slug uniqueness, leaf-split rule, reshape rule, marker authority.
- better-than-training, check-issue/SKILL.md:14, :39, read 2026-10-08: review inputs and whole-diff review.

### Pitfalls and what removes each
- Door's worktree at a different path than `<worktree_root>/<slug>`, so the leaf creates a second worktree and branch. Removed by binding the direct worktree path to `resolve(worktreeStore(repo), slug)` (src/config.ts:206-208) at the start of every direct attempt.
- Dirty worktree at adoption makes the first phase move refuse (`requireClean`, src/phase.ts:317-321). Removed by step 1's clean-tree commit.
- `.env` link state: `linkEnv` accepts a missing link or a correct one and refuses anything else (src/next.ts:310-319). Removed by the door creating the link the same way or not at all.
- Two charts naming the same slug. Removed by the existing handoff slug check plus the branch-exists check in the preflight (shapes.md:267 slug uniqueness; add `git show-ref refs/heads/<slug>` to the door's preflight).

## Q2. What does one direct repair round count, what is the bound, and what happens when it is exhausted?

### Pick
One round is one B `fix` verdict followed by the door's repair of every recorded Fix and B's re-check of the repair diff only (check-issue/SKILL.md:63). The initial review's `fix` counts as round one, because in direct mode every repair is a handoff to A, which is the thing the lifecycle counts (src/phase.ts:151, counted only on check.repair → check.fix). Bound: the repo's `fix_rounds` (src/config.ts:43, default 3), the same key, no new setting. `nits` or `ready` ends review and goes to landing; Nits get no round (check-issue/SKILL.md:83 "Nits get no separate work").

Each repair follows the repair rules the door would apply as A in `check.fix`: one commit per behavior Fix with a fail-first test, `Test-Change:` trailers, every `checks` command rerun (implement-issue/SKILL.md:76-84).

Exhaustion: when B's re-check after round `fix_rounds` is still `fix`, the door stops, the way the command stops a leaf with cause `attempts` (src/phase.ts:300-311): branch kept and clean, open Fixes listed in CHART.md under `Direct attempt`, and the operator chooses in the next reply: one more round, stated explicitly (mirrors recovery giving one more A repair, docs/guide/phases.md:76); hand off as a leaf from the branch per Q1; or abandon with `Held`. Silence chooses nothing.

Rejected-push retry bound carried from landing: two refusals, each with the full rebase, checks and B content re-check, then stop under the same `Direct attempt` section with the branch kept; a third attempt needs the operator's word. Two matches the command's own once-with-warning retry for external calls (src/next.ts:45-61) plus one more for a moving main.

Reason: the lifecycle already decided what a round is, what the cap is and that exhaustion is a stop for the operator, not a verdict override. Reusing `fix_rounds` means a consuming repo tunes one number for both routes.

Cost: with `fix_rounds: 3` a direct job gets at most three repairs, which is one fewer repair than a leaf that also used B's own `check.repair`. Acceptable for a job chosen because it is small.

### Rejected
- Separate `direct_fix_rounds` setting. A second knob for the same meaning; YAGNI until a repo shows the two routes need different caps.
- Unbounded rounds because the operator is present. The operator is present in the lifecycle too; the cap exists to make the loop visible, not because nobody is watching.
- Counting only rounds after the first `fix`, as the lifecycle's counter literally does. The lifecycle's uncounted first repair is B's own `check.repair`, which direct mode does not have; in direct mode the first `fix` already lands on A.
- Exhaustion lands with open Fixes recorded as Nits. A Fix is a defect with a consequence today (check-issue/SKILL.md:51); relabeling it is the lifecycle's forbidden "pre-existing, modulo anything" handoff (implement-issue/SKILL.md:36).

### Evidence
- better-than-training, src/config.ts:43 and src/phase.ts:151, :300-311, read 2026-10-08: the cap, what is counted, the `attempts` stop.
- better-than-training, check-issue/SKILL.md:49, :51, :63, :83, read 2026-10-08: verdicts, Fix bar, repair-diff re-check, Nits.
- better-than-training, implement-issue/SKILL.md:36, :76-84, read 2026-10-08: repair rules and the no-handoff-with-red rule.
- better-than-training, docs/guide/phases.md:76, read 2026-10-08: recovery grants one more repair.

### Pitfalls and what removes each
- A round that is a disagreement about the bar rather than a defect loops to exhaustion. Removed by the Nit rule: an argument grounded only in B's position is a Nit and cannot open repair (check-issue/SKILL.md:51).
- B re-reviews the whole branch each round and finds new Fixes unrelated to the repair. Removed by the re-check scope rule: only the repair diff, new blocking finding only for a defect the repair introduced (check-issue/SKILL.md:63).
- Count lost across door compaction. Removed by recording each round's verdict file path and number in the `Direct attempt` section as it happens, so the count is read from the chart, not memory (SKILL.md:6 resume rule).

## Questions C would ask that the fork does not
- Does a growth handoff carry B's direct review files into the leaf folder or only link them? Linking from the design is enough; the lifecycle review re-judges the whole diff anyway.
- Should the `Direct attempt` section shape be in shapes.md next to the markers? It is the one new record this chart adds, and shapes.md is where chart records are defined (shapes.md:5-35).
