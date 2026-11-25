# Fork notes: leftover-worktree, slot A

Probe (free, 2026-11-25, git 2.56.1, temp bare remote + clone + worktrees in the scratchpad, removed after):
- `git worktree remove <path>` without `--force` removed a worktree holding only an ignored `node_modules/` (exit 0). It refused one holding an untracked file: `fatal: '<path>' contains modified or untracked files, use --force to delete it` (exit 128).
- `git merge --ff-only <trackingRef>` in a worktree with a modified tracked file and an untracked file succeeded (exit 0) and kept both: the dirty files ride into the moved tree silently.
- `git worktree add -B <branch> <path> <trackingRef>` reset an existing branch to the tracking ref.
- `git rev-list --count <trackingRef>..<branch>` printed 0 for a branch behind the ref with no own commits.

## Q1 (clean leftover)

1. Pick a, sharpened: delete the commit-free leftover, then run today's fresh path unchanged. Steps under the gate: `git worktree remove <path>` (no `--force`) when the path exists, then delete the branch bound to the proven sha (`git update-ref -d refs/heads/<slug> <sha>`), then the existing `branch missing` branch of `ensureWorktree` creates from `trackingRef(repo)` with `-b <slug>`. No new flag on `createSparseWorktree`. Cost: a reinstall of ignored dependencies in that worktree on the next setup (rare case).
2. Rejected b: ff-only needs its own dirty check (probe: it carries dirty files silently), keeps stale ignored build output, and keeps a second "move in place" path beside creation.
3. Evidence: better-than-training, probe above; `src/next.ts:ensureWorktree` and `createSparseWorktree` at 085f2f88, read 2026-11-25.
4. Pitfalls:
   - A live seat from the withdrawn attempt running in the leftover tree. Removed by: the gate also requires `allocate`'s `live` to be false; a live seat keeps today's adoption.
   - Deleting a branch that gained a commit between check and delete. Removed by: `update-ref -d` with the proven old sha refuses when the ref moved.
   - The path exists but its HEAD is not `refs/heads/<slug>` (detached or another branch). Removed by: measure own commits on the worktree's HEAD when the path exists, on the branch when it does not.
   - A locked leftover (`git worktree lock`): `remove` refuses loudly, same stop as Q2a.
5. Question: should the gate also apply when reconcile cleared `state.worktree` because the path vanished mid-life? (A's view: yes, harmless: a commit-free branch has nothing to lose.)

## Q2 (dirty leftover)

1. Pick a. git's own refusal in `git worktree remove` is the loud stop; the allocation error names the leaf, the path and the next step (inspect, then commit, or remove with `--force`). No seat starts. Cost: that one leaf waits for the operator; rare (seen once).
2. Rejected b: a new record kind for the diff (signpost 3a) plus a destructive reset nobody approved. Rejected c: the harm the report names.
3. Evidence: probe above; INTAKE.md "Urgency".
4. Pitfalls: the refusal repeating every pass is today's `report()` behavior for any allocation error; nothing new.
5. None.

## Q3 (fetch)

1. Pick a. Every fresh worktree today starts from the local tracking ref without a fetch; the report's ref was current (4055186 = origin/main). A fetch adds a network failure to every first allocation. Residual named in the design: a stale local ref on a machine that never fetches.
2. Rejected b: widens scope to a different failure class.
3. Evidence: `src/next.ts` fetches only in `reconcileBatch`; `src/preflight.ts:checkBase` runs `ls-remote` without updating the ref.
4. Pitfall: none new.
5. None.

## Lesson

The pick stops the lesson's mechanism on every reachable path (clean leftover removed, branch-only leftover deleted, dirty leftover refused before any seat). A branch with commits of its own is not the lesson's case (its line: "a reused leaf branch with no commits of its own"). The leaf retires the line, which needs N1.
