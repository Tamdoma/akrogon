# Landing and completion fork notes, slot C (blind)

Carries: container 1a (no leaf record, door runs phase guards itself, worktree and branch removed before `Closed`); eligibility 1a code only, 2a offer only.

## Q1. Who rebases, runs `checks` and `merge_checks`, and pushes: the door or the operator?

### Pick
The door, in the branch worktree, in this order:
1. B's verdict `ready` or `nits` is read from the return file against a named committed head.
2. Door fetches, rebases that head onto `<remote>/<default_branch>`, refreshes `AKROGON_BASE` from `akrogon config` run in the worktree, runs every `checks` then every `merge_checks` command, as merge-issue's solo form does (merge-issue/SKILL.md:51).
3. If the rebase changed content outside `issues/` and `learnings/` (the batch reuse rule, src/phase.ts:526-531), door records `git range-diff` (merge-issue/SKILL.md:53) and sends B one focused re-check of that range; otherwise B's verdict stands.
4. Door pushes with the command's own form, `git push <remote> <sha>:refs/heads/<default_branch>` (src/phase.ts:469-472), never `git push origin main` from root. A non-fast-forward refusal repeats steps 2 to 4 once per refusal.
5. Door fast-forwards local main at the registered root (`git pull --ff-only`), removes worktree and branch, then records the `Closed <date>` marker and syncs records.

Reason: under 1a there is no command pass to own the push, and "seats never push" (merge-issue/SKILL.md:10, docs/guide/merge.md) exists because the command owns it for leaves, not because pushing is unsafe. The door already holds the reviewed head, the worktree and the checks; handing the push to the operator adds a manual merge of a branch the operator did not write.

Cost: a skill pushes code for the first time. Bound it: the door pushes only the exact sha B approved or re-checked, only fast-forward, and never force.

### Rejected
- Operator pushes with `gacp`. `gacp` runs on main at root and stages `.` (docs/guide/gacp.md:28-40); the code lives on a branch worktree, so the operator would first merge the branch by hand, and any half-written chart record at root is swept into the code commit. Source closure and the `Closed` marker would wait on the operator.
- Door merges into local main at root, operator pushes. Two-step with the same staging risk; a lifecycle merge pushing `origin/main` meanwhile makes root main diverge and `akrogon sync` rebases records over it (src/sync.ts:14-16, :44-46).
- B pushes. B is the reviewer in the intake; B has no worktree and would need the door's branch state.

### Evidence
- better-than-training, src/phase.ts:469-472 and :479-494, read 2026-10-08: push form and non-fast-forward handling the door mirrors.
- better-than-training, merge-issue/SKILL.md:10, :41, :51-53, read 2026-10-08: solo rebase order, checks then merge_checks, range-diff record.
- better-than-training, src/phase.ts:526-531 (`equalOutsideRecordFolders`, `recordConfigEqual`), read 2026-10-08: when a green run stays valid after a restack.
- better-than-training, docs/guide/gacp.md:28-40 and src/sync.ts:14-33, read 2026-10-08: `gacp` stages everything at root; sync requires main and only issue records staged.

### Pitfalls and what removes each
- Pushed sha differs from the reviewed sha after a rebase. Removed by step 3: range-diff recorded and B re-checks when content differs.
- Root main left behind after the push, so `akrogon sync` rebases chart records onto a newer main. Removed by step 5's fast-forward pull before the marker and sync.
- Orphan worktree under `issues/worktrees/` invisible to sweeps (src/next.ts:691-700). Removed by the container binding: removal before `Closed`, verified with `git worktree list`.
- `merge_checks` skipped because no merge seat exists. Removed by step 2 naming both lists.

## Q2. On landing, are delivered GitHub sources closed, with what reference, and is a broadcast sent?

### Pick
Yes to both. Door runs `akrogon close <owner/repo#n> --by "<chart-slug> direct, <sha>"` for each identity the chart records as delivered, the rule SKILL.md:35 already gives ("passing what delivered it: the delivering leaf slug and commit"), with the chart slug in place of a leaf slug. Then the door runs broadcast-issue itself when the repo configures `broadcast`, supplying the chart-held brief as the completion owner's brief, after the push and before the `Closed` marker; a failed broadcast is visible and does not reopen anything (broadcast-issue/SKILL.md:41).

Reason: broadcast-issue works from supplied briefs, evidence and `akrogon config` alone and runs no phase command (broadcast-issue/SKILL.md:14, :43), so nothing ties it to a leaf except the `issue complete` trigger line. A consuming repo that configured Discord expects every shipped change announced; a direct route that goes silent makes the channel incomplete for non-developers, who do not care which route shipped it.

Cost: one more door step and a Discord post per direct job. Skip when `broadcast` is absent from config, as today.

### Rejected
- Broadcast off route. Rejected because the audience rule (broadcast-issue/SKILL.md:21) is about readers, not routes.
- Closing sources with the chart path as reference. A reader of the GitHub issue needs the commit; the chart path is repo-internal.

### Evidence
- better-than-training, chart-issues/SKILL.md:35, read 2026-10-08: door closes delivered identities with slug and commit.
- better-than-training, broadcast-issue/SKILL.md:10, :14, :21, :41, :43, read 2026-10-08: sender needs briefs, evidence, config; no phase call; failure does not reopen.

### Pitfalls and what removes each
- Source closed before the push lands. Removed by ordering: close only after step 4 of Q1 succeeds, with the pushed sha.
- Broadcast sent from a seat that then goes idle and loses the tab (the lifecycle reason the merge seat sends it itself, merge-issue/SKILL.md:67). Not present here: the door pane is operator-held.

## Q3. May direct work change files under `issues/` on its branch?

### Pick
No. The branch carries code only, the same rule as leaves (shapes.md:267; src/phase.ts:323-332). The door runs the same check by hand before push: `git diff --name-only <base>...HEAD -- issues` must be empty. Chart records, markers and `learnings/` lines go to main at the registered root through `akrogon sync`, as every seat does today (check-issue/SKILL.md:59 "left for the operator to commit").

Reason: one rule for every branch. `akrogon sync` assumes records move only on main (src/sync.ts:14-33), and the batch reuse decision treats `issues/` and `learnings/` as record folders and `issues/config.yaml` as a rerun trigger (src/phase.ts:526-531). A code branch carrying records would rebase against the operator's concurrent syncs and could flip a lifecycle batch's reuse decision for reasons unrelated to code.

Cost: a direct job whose outcome includes an `issues/config.yaml` change (such as this chart's own `direct:` key default) ships the schema on the branch and leaves the config edit as an operator step on main, exactly as shapes.md:267 already says for leaves.

### Rejected
- Allow `issues/` on the branch because no phase guard runs under 1a. Rejected: the guard's absence is an accident of the container, not a reason; the sync and reuse assumptions above still hold.
- Allow only `issues/config.yaml`. Rejected: it is the one records path the reuse logic treats specially (`recordConfigEqual`), so it is the worst candidate for an exception.

### Evidence
- better-than-training, shapes.md:267 and src/phase.ts:323-332, read 2026-10-08: leaf branches carry no `issues/`.
- better-than-training, src/sync.ts:14-33 and src/phase.ts:526-531, read 2026-10-08: records move on main through sync; reuse logic keys on record folders and config.

### Pitfalls and what removes each
- Door writes `implementation/brief.md` into the worktree as Standalone does (implement-issue/SKILL.md:88), dirtying the branch with a non-code file. Removed by putting direct artifacts under `<chart>/` as the container decision says, never in the worktree.
- Operator syncs chart records while the branch is open. No conflict, since the branch holds no records.

## Questions C would ask that the fork does not
- Does the door also run `akrogon preflight` before the push? It is the handoff preflight today (shapes.md:267, src/preflight.ts:73-78) and proves the remote branch exists; cheap to keep as step 0.
- When a non-fast-forward refusal repeats more than a set number of times, does the door stop and report rather than loop? Suggest two refusals, then stop with the branch kept, the same stop shape as growth.
