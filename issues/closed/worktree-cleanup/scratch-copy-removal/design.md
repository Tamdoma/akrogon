# Design: scratch-copy-removal

## Binding decisions, verbatim

### Scratch copy removal
From [scratch-copy-removal.md](../../../chart/worktree-cleanup/forks/scratch-copy-removal.md).

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

### Store hygiene (the keep vetoes in Q2 apply to every deletion)
From [store-hygiene.md](../../../chart/worktree-cleanup/forks/store-hygiene.md).

Operator, 2026-10-15, Round 3, verbatim: "1a | 2a | 3a" (after the round was restated simply on "elid"). Reason given in the round: always clean without risking anything in use; ownership is the proof, the process check only blocks.

Final-shape check by B, C, D ([B](../slots/hygiene-final-shape-B.md), [C](../slots/hygiene-final-shape-C.md), [D](../slots/hygiene-final-shape-D.md)) against [the draft](../slots/hygiene-final-shape-draft.md) found defects; the lines below carry the corrections, tagged.

### Q1 → 1a: what is cleaned
- Places: each repo's worktree store and legacy `<repo>/issues/worktrees`; leaf temp root `/var/tmp/akr-<uid>` (repo dirs, leaf dirs, run dirs, stray entries); retired `/tmp/akr-<uid>`; `~/.akrogon/worktrees/<name>` for a name that is no registered repo; in the global home, reconcile reports pruned to paths that exist and `runs/last-start`.
- Atomic-write intermediates `<file>.<pid>.tmp` (src/admission.ts:59-63, src/reconcile.ts:38-40, src/shell.ts:143-147) are deleted only when that pid is dead; an open-file check is not enough (B).
- Retired lock files by exact name only: `~/.akrogon/run.lock`, `~/.akrogon/framework-tests.lock`, `<repo>/.git/akrogon-base-runs.lock`, `<repo>/issues/.lock` when the repo root is not the global home; each deleted only when no process holds it open. Live locks are never touched: the global `.lock`, `.git/akrogon-install.lock`, `.git/akrogon-verify-runs.lock` (C).
- Leftover processes: reconcile stops the leaf slice (`systemctl --user stop <leafSlice(repo, slug)>`, the call src/stop.ts:52 makes) of a leaf that is `merged` or `failed` and whose tab is gone. It is never stopped from `akrogon phase` or `mergeWake`: the merge runs inside that slice and still has `completeOwner`, logs, `mergeWake` and seat B's last turn to finish (src/phase.ts:154-179, src/akrogon.ts:86, skills/merge-issue/SKILL.md:79-83). A pass skips any slice that contains its own process (`/proc/self/cgroup`, as src/admission.ts:115-124 reads it) (B,C,D). This also stops the empty slices of finished leaves that stay loaded today (51 on this host) (C).
- Guard units get `CollectMode=inactive-or-failed` like `runUnitArgv` (src/scope.ts:53-54, :66-78); failed `akrogon-run-*` units already loaded are cleared with `systemctl --user reset-failed`.
- Akrogon tests stop writing into the real HOME and leaf temp root and end their fake seats in teardown. Done-criterion: `bun test` adds no entry to `/var/tmp/akr-<uid>` or `~/.akrogon/worktrees` and leaves no process behind.
- Never touched: `~/.config/akrogon/env`, config.yaml, paused.yaml, stopped.yaml, installed links, repo issue records and logs (chart check-evidence), other tools' files (Claude Code worktrees, pi command logs, `.evidence`).

### Q2 → 2a: what proves it safe
- Owner records stay authoritative: a `run-*` dir or a `batch-*` copy or its owner record with a live owner (`ownerDead` false, src/reconcile.ts:109-111) is kept in every case; a dead-owner `run-*` dir is removed on every pass, also while its leaf is active, as today (src/reconcile.ts:424-427) (D). A `run-*` dir without `.owner` younger than 60 s is kept, covering the gap between `mkdtempSync` and the `.owner` write (src/run-check.ts:154-159) (D); this keeps young items and never deletes for age.
- Leaf temp `leafTemp(repo, slug)` goes when the leaf is `merged` or `failed`, its tab is gone and its slice has no running unit, as today's finished rule (src/reconcile.ts:432-441) (C,D). Store and legacy-root entries `<slug>` or `<slug>-<anything>`, matched against all known slugs longest first, follow the taken rules: merged owner removes them, a failed owner keeps today's guard (scratch-copy-removal 3a), a dirty leaf worktree is kept as `uncommitted changes` (after-merge-remainder 3a) (C,D).
- `leafTemp(repo, 'checkout')` and `leafTemp(repo, 'self-update')` are akrogon's own, not unowned: kept while they hold a live-owner run, a registered worktree or a live process (D).
- Unowned items (no slug match: `.dcf*.node-gyp`, `.temp`, stray files, dangling symlinks, empty dirs, unregistered repo dirs) go when no leaf of that repo is running, meaning no leaf of the repo has a live tab or a slice with a running unit. An unregistered repo has no leaves.
- Every deletion also needs: no live herdr pane with cwd inside, and no process of this user with cwd or an open file inside (`/proc/<pid>/cwd`, `/proc/<pid>/fd/*`). Pane list unavailable → keep. A process outside the slice, such as Chrome in its own `app-*.scope` (learnings/history/2026-10-13-chrome-escapes-cgroup.md), keeps the item with its pid as the reason, cleared when that process ends (C).

### Q3 → 3a: when it runs
- Inside every reconcile pass as invoked today: targeted `next`, `--all`, `--resume`, unpause and `tab_closed`, over the repos each already covers (all registered repos from outside a repo, the current one from inside, the tab's repo on `tab_closed`), including repos with no open leaves; plus one host-wide step per pass for items tied to no registered repo (retired `/tmp/akr-<uid>`, unregistered repo dirs, retired locks, `runs/` leftovers), reached from both `reconcileRepos` and `tab_closed` (C,D). There is no separate post-merge pass: a merged holder is cleaned after its tab closes on idle (src/next.ts:1481-1489) and fires `tab_closed`; stacked members after the merge path closes their tabs (after-merge-remainder 2a) (C,D).
- `reconcileNeedsPanes` counts every new candidate kind (F3), so no candidate is judged with the empty pane list.
- Unprovable items stay, recorded with the reason and what clears it, and shown in plain `akrogon status` (after-merge-remainder 4a). Repo items go in `reconcile/<repo>.json`; host-wide items go in `<globalHome>/reconcile-host.json`, which plain status always reads, also with zero registered repos (B). The next pass deletes them once the reason clears. Nothing is deleted for age.
- A failed delete is reported with path and error; absence is checked after each delete. Today's junk (F1) goes through the same rules on the first pass; no separate migration.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, here a reconcile, status or merge invocation over a temporary repo, temporary store and temporary leaf temp root set through the existing environment overrides (`HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_HOME`) and the existing test fixtures. A fix of a proven bug shows its test failing before and passing after; new behaviour shows one deliberate break turning its test red. No new test machinery: no runner, pool or fixture factory is built. No live model or outside call is part of any criterion. Secrets, auth and UI lines of the standing design do not apply.

## Leaf architecture

Owned surfaces: `src/reconcile.ts` (the candidate sweep over registered worktrees in the store and legacy root, `worktreeRemovable`, `removeWorktree`), `src/batch.ts` (`buildStack`), and the owner helpers in `src/reconcile.ts` (`ownerSchema`, `ownerDead`; today the `.owner` file is parsed inline in the run-dir loop, and a shared reader is factored only as the build record needs). (B,C)

Shared helper this leaf delivers for store-sweep (B): one process check, `processesInside(paths)`-style, that reads `/proc/<pid>/cwd` and `/proc/<pid>/fd/*` once per pass for this user's pids and returns, per path, the pids with cwd or an open file inside. This leaf uses it as a keep veto for every copy it would remove; store-sweep reuses it.

Door interface, fixed at charting so store-sweep can rely on it: the build owner record lives at `<worktreeStore(repo)>/batch-<id>.owner`, beside the copy `batch-<id>`, as JSON in the existing `ownerSchema` form (`pid`, `boot_id`, `started`), written atomically before `git worktree add` creates the copy and removed by `buildStack`'s `finally` together with the copy. Reconcile removes the record with its copy.

State changed and its consumers:
- Registered `verify-*` copies: consumer `verify` (`src/verify.ts`) creates and removes them in its own `finally`; reconcile only takes copies whose record has `end` or a dead owner (`readVerifyRuns`). The existing open-record keep runs first.
- Registered `batch-*` copies: consumer `mergeTurn` / `buildStack` (`src/next.ts`, `src/batch.ts`); `buildStack` runs outside the global lock, so the owner record is the only guard.
- Worker copies: produced by seat skills (`skills/implement-issue/worker-protocol.md`, detached copies), not src; matched after real leaf slugs, longest first. A worker copy is removed through `removeWorktree` only: no branch is deleted and the owner leaf's recorded `worktree` is untouched; the merged-leaf path (`mergedWorktree`, `removeMergedWorktree` with its `git branch -d`) is for the leaf's own worktree. (B,C)
- A failed owner's worker keeps today's guard: `worktreeRemovable` (uncommitted changes, rebase or merge markers, unreachable commits) applied by `removeWorktree`. (C)
- A `verify-*` copy with no record is a stray: `verify` appends its record before it creates the copy. (C)
- The leaf's own worktree is out of scope: a merged leaf's dirty worktree stays as `uncommitted changes` (`worktreeRemovable`), owned by kept-status for display.

Exclusions: unregistered store entries, leaf temp, retired roots and locks belong to store-sweep; slice stops to finished-leaf-processes; status output to kept-status.

Open for the plan: how the test kills a verify or build owner (a child process whose pid is recorded, then killed).
