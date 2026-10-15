# Intake: worktree-cleanup

## Scope
Reconcile removes the worktrees a merged leaf leaves behind (verify, merge-build, worker and the leaf's own), with keep reasons visible. Independent of check-evidence and peer-wait-harness.

## Provenance
- GitHub: Tamdoma/akrogon#93
- Operator: 2026-10-15, "3 new issues came in. Let's consult with slot b and slot c and slot d, and let's chart them out."; split answer `1a` (three charts, order worktree-cleanup, check-evidence, peer-wait-harness)

## Source: Tamdoma/akrogon#93
# Worktrees of merged leaves and finished verify runs are never removed: reconcile keeps them as "unreachable commits" after the leaf is rebased onto main

Source: Tamdoma/akrogon#93
URL: https://github.com/Tamdoma/akrogon/issues/93

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation
On 2026-10-15, with no open leaves left in tamdoma/framework, `~/.akrogon/worktrees/framework` held 13 GB in 9 entries, each about 1.6 GB:
- six `verify-<run>` worktrees from `browser-socket-runtime` verify runs at sha 8700f6df7 (verify-0214a286…, verify-14648778…, verify-4636dd20…, verify-66154a56…, verify-cec535a2…, verify-f741e1b4…). Their leaf had already merged.
- `pass-two-review-notes-u2` and `pass-two-review-notes-u3`, delegated worker worktrees left from 2026-10-13. Their leaf `pass-two-review-notes` merged at 2026-10-14T06:09Z.
- `prose-asserts-u1-cmdlogs`, an unregistered folder holding four `command-*.log` files.

Here is what kept each one:
- The verify worktrees were clean, but `git rev-list --count HEAD --not --branches --remotes` returned 10. `git cherry main 8700f6df7` marks all 10 commits as `-`, meaning their patches are already in main.
- The worker worktrees returned 2 unreachable commits. u3 also had an untracked `__pycache__/`. Their commits are not patch-identical to main because later repair commits on the leaf changed the same files before merge.

The operator removed them by hand (`git worktree remove`, `--force` for u3) on 2026-10-15.

## Location
akrogon reconcile removes worktrees in `src/reconcile.ts`: `worktreeRemovable` at lines 43-62, the merged-leaf path at 213-260, and the leftover-candidate sweep (`verify-*`, `<slug>-u<N>`) at 330-394. It runs from `akrogon next` (`src/next.ts:1327`, `1441`).

## Reproduction
1. Merge a leaf whose merge rebases its commits onto main. Its verify-run worktrees and worker worktrees are left at the pre-rebase commits.
2. Run `akrogon next` after the merge.
3. Reconcile keeps every such worktree with the reason `<n> unreachable commits`.

This was seen for every verify run and worker worktree above.

## Expected behavior
Reporter: a leaf's worktrees, including its verify-run and worker worktrees, are deleted right after the leaf merges.

## Urgency
Each leftover is a full checkout of about 1.6 GB, and they pile up with every verify run and worker wave (13 GB here with only 9 left). The workaround is manual `git worktree remove`.

## Suspected cause
The main cause is that `worktreeRemovable` (`src/reconcile.ts:53-60`) refuses any worktree whose HEAD has commits not reachable from a branch or remote. After a merge rebases the leaf onto main and `removeMergedWorktree` deletes the leaf branch (`src/reconcile.ts:216-221`), the pre-rebase commits checked out in verify and worker worktrees are unreachable by definition, even when they are patch-equivalent to main. So the guard keeps them forever.

A contributing cause is that the guard checks reachability rather than patch equivalence or the owner leaf's `merged` state. Worker commits superseded by later repair commits never match main either.

A second contributing cause, for `prose-asserts-u1-cmdlogs`: unregistered directories are always kept as `unknown directory` (`src/reconcile.ts:350-352`).

Whose view: both. The reporter observed the leftovers and set the expectation. The agent ran the git checks above and read the reconcile code.
Files read: `src/reconcile.ts` lines 43-62 and 190-404 in /home/ivan/Work/infra/akrogon.
Not inspected: the merge code that rebases leaf commits and creates verify worktrees, and whether a `keep` reason is shown to the operator anywhere.
Related reports: none found. Searched Tamdoma/akrogon in all states for "worktree removed merged" (limit 8) and "unreachable commits" (limit 5). The filer's reports since 2026-10-13 are #89, #90, #91 and #92, and none of them covers this.


## Agent findings
Opening maps by A, B, C, D and the merged map with rebuttals: [slots](../worktree-cleanup/slots/) (`map-A.md` … `map-D.md`, `map-merged.md`, `map-rebuttal-*.md`). Per-fork findings live in the fork files.
