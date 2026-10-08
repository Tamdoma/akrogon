# Design: direct-route

## Binding decisions, verbatim

### Container (issues/chart/direct-mode/forks/container.md)
Operator 2026-10-08: `1a |`
1a: no leaf record. Direct work lives in the chart folder, closed with a `Closed <date>` marker naming the delivering commit.
Reason: keeps the same A and B sessions from start to finish, as the intake asks.
Binding: the door runs the phase guards itself (clean tree, no `issues/` diff on the branch, Test-Change citations,
non-empty branch); worktree and branch removal is part of done, before the `Closed` marker.
Foreclosed: hand_built leaf (cannot merge); ordinary leaf with dispatched merge (third session lands the code).

### Eligibility and setting (issues/chart/direct-mode/forks/eligibility.md)
Operator 2026-10-08: `1a | 2a |`
Q1 1a: code only. Direct is not offered when the draft needs any `inputs`, `grants`, `produces` or `retained`, or a done-criterion needs a live run or outside call during implementation. Also required: one bounded outcome with no unfinished dependency (door judgment), no pending human prerequisite, B named. Door may still recommend lifecycle for a risky small job.
Reason: every leaf-only safety mechanism becomes unnecessary; widening to inputs later is non-breaking.
Foreclosed: 1b code plus inputs; 1c everything with carried gates.
Q2 2a: offer only. Boolean repo setting, default off. When on and eligible, the handoff review asks direct or lifecycle with the door's recommendation; explicit session authorization counts as the answer; debate stays as today for lifecycle work. The chosen route is recorded in the chart; a later setting change does not alter an approved job.
Foreclosed: 2b automatic direct.

### Landing and completion (issues/chart/direct-mode/forks/landing.md)
Operator 2026-10-08: `1a | 2a`
Q1 1a: door lands. After B's ready/nits on a committed head, door fetches, rebases onto `<remote>/<default_branch>`, refreshes AKROGON_BASE from `akrogon config` in the worktree, runs phase guards, `checks` then `merge_checks`, and pushes the exact tested SHA with `git push <remote> <sha>:refs/heads/<default_branch>`, never force. Conflict resolution during rebase sends B a focused re-check of the resolved range (range-diff recorded) before push; a clean rebase reruns checks only. Rejected push keeps the branch; retry bound set in the growth fork. Root checkout is never reset; a failed local update is reported. Branch and worktree removed after verified delivery. Selecting direct includes the door's push authority; push, source close and broadcast are coordination, not live calls under eligibility 1a.
Foreclosed: operator pushes.
Q2 2a: after the push, door closes delivered sources with `akrogon close <id> --by "<chart> direct <sha>"` (checking other owners' outstanding work first), then runs broadcast-issue as sender when the repo configures broadcast, with the chart brief as context; broadcast-issue gains a direct-route trigger. Broadcast failure does not reopen.
Foreclosed: no broadcast.
Q3: not asked; branch carries code only, records via `akrogon sync` on main (container 1a).

### Growth and repair bound (issues/chart/direct-mode/forks/growth.md)
Operator 2026-10-08: `1a | 2a |`
Q1 1a: stop and save. Triggers: a locked decision must change, a need eligibility 1a excludes, a criterion cannot pass in scope after permitted repairs, a second outcome. Door stops coding and landing, commits existing work as one partial-labelled commit for a clean tree, keeps the worktree at `<worktree_root>/<slug>` (path bound at attempt start), and writes a `Direct attempt` section in CHART.md (branch, head, base, done, not done, trigger, review file paths, rounds used). The trigger becomes a new open fork. Operator then chooses lifecycle handoff (leaf slug equals the branch, so `ensureWorktree` adopts it; leaf starts at its normal planning phase, planner decides what to keep, lifecycle review covers the whole diff) or abandon (branch and worktree removed, `Held <date>`). No new direct attempt starts while a chart names a live direct branch.
Foreclosed: 1b delete and start fresh.
Q2 2a: one repair round = B `fix` (or a blocking landing-check failure) + one door repair pass of all Fixes + B re-check of the repair diff. Bound = repo `fix_rounds`; count recorded in the `Direct attempt`/chart record and survives session replacement. A passing last round lands; exhaustion stops with open Fixes listed and the operator chooses one more round, lifecycle handoff, or abandon. Push: up to 2 attempts, each with fresh rebase, checks and B conflict re-check; then stop with the branch kept. Push attempts are not repair rounds.
Foreclosed: 2b no automatic push retry.

Exclusions: hand-built removal is leaf hand-built-removal; the `direct` schema key is leaf direct-setting (this leaf
reads the name `direct` from `akrogon config` output only).

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md: no auth, secrets or live calls in this
leaf. Skill text is proven by review against the binding decisions above. The guard script is code: prove criterion 5
with one CLI-boundary test per refusal and one passing case in an isolated registered repo (tests/helpers.ts), each new
refusal shown red by one deliberate break. No test asserts skill prose wording.

## Leaf architecture
- Owned: skills/chart-issues/SKILL.md, skills/chart-issues/assets/shapes.md, skills/chart-issues/scripts/<guard script>.ts
  and its test under tests/, skills/implement-issue/SKILL.md (Standalone section only), skills/check-issue/SKILL.md (new
  standalone-review section only), skills/broadcast-issue/SKILL.md (context, trigger and completion-owner clauses for the
  direct case), docs/guide/chart.md. (A,B)
- Interfaces: reads `direct` from `akrogon config`; guard script takes the worktree path, the repo key and the chart
  folder (passed as `leafPath` to `requireNoIssueFiles`), imports the exported guards from src/phase.ts unchanged, prints
  the guard error and exits non-zero on refusal. (A,C)
- Shared files: leaf hand-built-removal edits chart-issues SKILL.md:59 and shapes.md:259, lines this leaf also changes.
  This leaf is blocked by hand-built-removal and writes over its landed text. (A,C)
- Excluded: src/ command behavior (no new phase, state or dispatch path); issues/ records; the merge-issue skill;
  `akrogon status` display of direct attempts.
- Dependencies: blocked-by hand-built-removal (shared lines). The `direct` key name is fixed by leaf direct-setting's
  design; this leaf only reads it from command output. (A,C)
