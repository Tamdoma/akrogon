# Intake: merge-conflicts-a

## Scope
Rebase conflicts found at merge are resolved by A in the merge phase. Only red checks after a clean rebase route to check.fix. `fix_rounds` counts only check.review verdicts. One leaf in akrogon: phase.ts, its test, merge-issue, implement-issue check.fix line, check-issue re-check line, and the guide lines that describe the conflict route.

## Provenance
Operator 2026-09-14, leaf order "L1, L3, L2, L4+L5". L2 line verbatim: "Merge conflicts stay with A. Rebase conflicts are resolved by A, only red checks route to check.fix, and `fix_rounds` counts only check.review. Removes a rule and 5 to 12% of sessions." Astra audit section 4.6: "Of 54 repair entries, 25 originate in merge rather than initial/repeat review ... it does not prove that all 25 were conflicts: the merge skill uses the same repair route for red checks and integration drift."

## Agent findings
1. Route today: `routing.ts:33` merge → merged | check.fix. `phase.ts:36` adds one to `fix_rounds` on every move to check.fix, merge included; `phase.ts:138` fails the leaf when the count already equals the repo cap (default 3). `tests/phase.test.ts:91-93` asserts a merge → check.fix move sets `fix_rounds` to 1.
2. Skill text: merge-issue:33 "On a rebase conflict or red checks, append conflicting files or failing output and the rebase target commit to review-A.md, preserve the unfinished rebase context for B, call `akrogon phase <slug> check.fix --slot A`"; :35 same-line index rule; :37 failed diagnosis paragraph; :56 repair move footer. implement-issue:49 "Merge-conflict findings use the same worktree and repair path ... any pending rebase completed before recording the repair head." check-issue:43 re-check baseline "(or recorded rebase/conflict baseline)".
3. Guide: phases.html:63 "Each loop adds one to fix_rounds", :64 "A conflict or red check → check.fix instead"; problems.html:64 merge conflict row; in-practice.html:129 "Two leaves touched the same lines"; merge.html:63 last sentence; setup.html:67 and state.html:85 describe fix_rounds as review→fix loops (already the target wording).
4. akrogon log: 185 rows, 10 merge → check.fix against 4 check.review → check.fix. Six leaves; every one of the ten was a rebase conflict (tree-preflight 3, fetch-deadline 2, resumable-source-closure 2, failure-signals, pull-close, discord-chunk-report 1 each). `fix_rounds` reached 3 once (tree-preflight) purely from conflicts; a fourth would have failed the leaf.
5. framework log: 488 rows, 15 merge → check.fix against 24 check.review → check.fix, 96 merged. Reviews record 7 conflict merges and 8 red-check merges.
6. Cost of one merge → check.fix cycle: B repair, A re-check, A merge again, three contributions and up to three prompts. Across both repos 25 such cycles against 118 merged-or-failed leaves.
7. Resolutions recorded so far are unions of both-true hunks (import blocks, appended tests, add/add of a new test file). pull-close review-A: "Both sides are true; the union is the resolution." No recorded conflict needed a design decision.
8. Nothing in src/ reads who resolved a conflict; `logMove` records from/to/head/diff only.

## Practitioners
- practitioner: Linux kernel maintainer handbook (Documentation/maintainer/rebasing-and-merging, Corbet): Linus "would much rather see merge conflicts than unnecessary back merges", "has gotten quite good at conflict resolution, often better than the developers involved"; submitters warn about the conflict, the integrator resolves it.
- better-than-training: GitHub merge queue docs: a PR with conflicts or failed required checks "will be removed from the queue" and the author re-queues. GitLab merge trains: "Rebase the source branch on the target branch, resolve the conflicts, then add the merge request to the merge train again." Both hand conflicts back to the author because the author is a human with context; neither caps re-queues.
- Astra section 3 "Merge checks and the existing event-driven architecture": keep verification after a changed rebase target; the browser-core-launch archive shows a semantic resolution preserving both sets of rows followed by a second rebase.
