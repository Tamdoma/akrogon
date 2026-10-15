# Scratch copy removal

## Question
Q1. When may reconcile delete a dead `verify-*` or `batch-*` worktree whose HEAD is on no branch after the merge rewrote the leaf's commits?

Q2. When may reconcile delete a `<slug>-u<N>` worker worktree whose commit was cherry-picked (new ID) or left unpicked?

### Carries
- Operator split answer 2026-10-15: `1a` (three charts; this one first).

## Findings
- `worktreeRemovable` keeps any HEAD with commits outside `--branches --remotes` (src/reconcile.ts:53-60); the sweep sends verify, batch and finished-owner worker copies through it (:372-394) (A,B,C,D).
- verify and buildStack force-remove their own copy in `finally` (src/verify.ts:189, src/batch.ts:155); only crash recovery uses the guard (A,C,D).
- The six framework verify leftovers have records without `end` and with `commands: []`: the verify process was SIGKILLed by the leaf's own framework test "SIGKILL of the direct browser owner" (C, implementer transcript). Framework-side.
- Unreachability comes from the merge moving the leaf branch to rebased commits (src/batch.ts:161-174) (A,B).
- A worker commit is unreachable from the moment A cherry-picks it; patch equivalence fails after repair commits (A,B,C,D). worker-protocol.md:31 keeps a conflicting worker's copy on purpose.
- A, 2026-10-15: build copies are not tied to their owner. buildStack names the copy `batch-<fresh attemptId()>` (src/batch.ts:115) while reconcile keeps only `batch-<state.batch.attempt>` (src/reconcile.ts:192-194, :381-384), set from a different `attemptId()` call (src/next.ts:1054). buildStack runs outside the global lock (src/next.ts:1078, src/phase.ts:663) and reconcileRepos takes none (src/next.ts:1313-1327), so today only the guard protects a running build, and a fresh copy at `builtOn` (clean, reachable) is already removable mid-build.
- Dead verify records without `end` are harmless: `greenRun` requires `end` (src/verify.ts:63-77).
- git: `worktree remove` refuses only an unclean worktree without `--force` and never checks reachability (git 2.56.0 `git help worktree`, 2026-10-15). Unreachable objects are pruned by gc after `gc.pruneExpire` (default 2 weeks).
- Rebuttals: B wanted recorded ownership plus expected HEAD before force removal and batch treated as its own ownership case (map-rebuttal-B.md R2); C wanted HEAD == record sha for verify; D: an expected-HEAD rule leaves a build killed mid-rebase stuck forever (map-rebuttal-D.md).

## Taken
Operator, 2026-10-15: `1a | 2a | 3a`

Q1 → 2a. Reason: these copies are scratch space by design, and crash cleanup should do what the normal path already does. Binding:
- Reconcile force-removes (`git worktree remove --force`) a `verify-*` copy whose record has `end` or whose owner is dead, and a `batch-*` copy that no leaf's recorded build names, when no live pane sits inside; the reachability and dirty checks do not apply to these copies.
- The existing live checks (open verify record with a live owner, live pane inside, pane list unavailable) run before the new rule.
- buildStack names its copy after the leaf's recorded build attempt, so reconcile sees a running build and keeps it.
- Done-criteria: a killed verify copy at a rewritten commit is removed; a running verify copy is kept; a running build copy is kept.
- Required probe before handoff: `git worktree remove --force` on a throwaway repo with a detached copy at an unreachable commit (done 2026-10-15, see Proofs).
Foreclosed: 2b exact-commit check for verify (guards a case never seen; builds record no commit); patch equivalence (fails for workers and repaired leaves).

Q2 → 3a. Reason: a merged leaf passed review, so unpicked worker commits were dropped on purpose; a failed leaf may be resumed. Binding:
- Reconcile force-removes `<slug>-u<N>` copies once the owner leaf is `merged`, with no live pane inside. A `failed` owner keeps today's guard.
- A real leaf whose slug ends in `-u<N>` is matched as a leaf first (src/reconcile.ts:345-371); a done-criterion covers it.
- `--force` removes copies holding untracked build files (`__pycache__/`).
- Cost accepted: an unpicked worker commit of a merged leaf is unrecoverable after gc prunes it.
Foreclosed: 3b (failed leaves too), 3c (recorded acceptance per commit), 3d (hidden kept refs).

Peer final-shape check of the build-naming mechanism (slots/after-merge-{B,C,D}.md, "Final-shape check"): rejected by B, C and D. A record can be replaced while its build runs (src/next.ts:1039-1063, :1089-1093), restack builds outside the lock with the old attempt (src/phase.ts:663, :750), and a builder killed after the record is saved leaves a named copy kept for good when the holder fails (src/next.ts:985-987). Proposed: an owner record (pid, boot_id) checked with `ownerDead` (C,D), serialization (B), or keep rebase/dirty markers for builds (C). The owner record must exist before the copy appears (B R2, C R3). Correction question: Round 2, question 1.

Correction, operator 2026-10-15 (Round 2 question 1): `1a`. Binding, replacing "buildStack names its copy after the leaf's recorded build attempt": buildStack writes an owner record (pid, boot_id, started) before it creates its copy; reconcile force-removes a `batch-*` copy when that owner is dead (`ownerDead`, src/reconcile.ts:109-111) or when no owner record exists. Done-criteria: a paused build survives a second pass plus reconcile; a killed build's copy is removed. Foreclosed: record-name protection, build/cleanup serialization (1b), keeping rebase/dirty markers for builds (1c).


## Proofs
- P1 `git worktree remove --force`. Identity: local user ivan (uid 1000), the same user akrogon runs as. git 2.56.0. Date 2026-10-15. Target: throwaway repo under the door's job temp dir, main with one empty commit, detached worktree `copy` with one commit unreachable from any branch (`git rev-list --count <head> --not --branches` = 1), an untracked `__pycache__/a.pyc` and an untracked `dirty.txt`. Result: plain `git worktree remove ../copy` exits 128 ("contains modified or untracked files, use --force"); `git worktree remove --force ../copy` exits 0, the folder is gone and `git worktree list --porcelain` lists only the main worktree. Cleanup: throwaway repo deleted, temp dir empty (checked). Limits: does not prove behaviour for a locked worktree (`git worktree lock` needs `--force` twice) or for a copy with submodules.
