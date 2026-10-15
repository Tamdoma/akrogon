# Design: store-sweep

## Binding decisions, verbatim

### Store hygiene
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

### Corrections, 2026-10-15
- Kept display. Operator: "This is just too much to have now. If these are getting deleted automatically, I don't want to see them in akrogon status. Maybe a new command where they're displayed, like "akrogon leftovers" or something." and `s2a` for this brief. Binding over Q3 → 3a's "shown in plain `akrogon status`": unprovable items are listed by `akrogon leftovers` (src/leftovers.ts), never by plain status. Host items join its host block, which today holds systemd units under `systemd units`; this leaf adds the existing-path filter for host paths and may retitle the block to fit. Recorded in [after-merge-remainder](../../../chart/worktree-cleanup/forks/after-merge-remainder.md) Taken.
- Registered worktrees. From [removal-rule](../../../chart/live-worktree-guard/forks/removal-rule.md) Taken (Tamdoma/akrogon#94, operator `1a | 2a | 3a`, and `s2a`): reconcile removes a registered store worktree only when it is a leaf worktree under its leaf rules or one of akrogon's scratch kinds under scratch-copy-removal's rules; every other registered worktree is kept and listed; a locked worktree is never removed and no removal forces past a lock; every store deletion of a registered worktree goes through `git worktree remove` and never passes a lock; akrogon's scratch kinds follow scratch-copy-removal's rules. The `<slug>-<anything>` match of Q2 → 2a applies to unregistered entries only. Whichever of this leaf and live-worktree-guard lands second keeps the other's rule.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, here a reconcile, status or merge invocation over a temporary repo, temporary store and temporary leaf temp root set through the existing environment overrides (`HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_HOME`) and the existing test fixtures. A fix of a proven bug shows its test failing before and passing after; new behaviour shows one deliberate break turning its test red. No new test machinery: no runner, pool or fixture factory is built. No live model or outside call is part of any criterion. Secrets, auth and UI lines of the standing design do not apply.

## Leaf architecture

Owned surfaces: `src/reconcile.ts` (candidate sweep over the store, legacy root and leaf temp root, which today takes directories only; `reconcileNeedsPanes` for file candidates; `writeKeptReport` / `readKept`; a host step), `src/next.ts` (`reconcileRepos` and the `tab_closed` path both run the host step once per pass), `src/leftovers.ts` (`leftoversCommand` lists `reconcile-host.json` entries that still exist in its host block), `src/config.ts` (the retired root path).

Consumes (blocked-by): from scratch-copy-removal the process check helper and the `batch-<id>.owner` record; from finished-leaf-processes the "slice holds a running unit" reader and its slice step, which runs earlier in the same pass; `akrogon leftovers` as the surface for kept lines (src/leftovers.ts). (B,C,D)

Coverage: zero-leaf repos are reached through `reconcileRepos` (`--all`, `--resume`, unpause), which needs no leaves; targeted `next` keeps its current selection. The host step owns `~/.akrogon` and the leaf temp root; each repo pass owns its own store, legacy root, leaf temp repo dir, `.git` and `issues/` locks. (D)

The Taken qualifier on `<repo>/issues/.lock` ("when the repo root is not the global home") guards nothing: the live global lock is `<globalHome>/.lock`, and no `issues/.lock` has a writer in src. (C)

Retired root override (D): the retired root is `/tmp/akr-<uid>` unless `AKROGON_RETIRED_TEMP_ROOT` is set, read in `src/config.ts` like `AKROGON_LEAF_TEMP_ROOT`, so tests never touch the real one.

Rules (binding, store-hygiene Taken): ownership first; leaf-owned items go when the leaf is finished as stated; unowned items go when no leaf of the repo is running (a live tab or a slice with a running unit); every deletion also needs no live pane inside and no process of this user with cwd or open fd inside (`/proc/<pid>/cwd`, `/proc/<pid>/fd/*`, read once per pass, only for this uid); owner records stay authoritative.

Door interfaces: the host report is `<globalHome>/reconcile-host.json` in the same entry shape as `reconcile/<repo>.json`. The build owner record is `<worktreeStore(repo)>/batch-<id>.owner` (`ownerSchema`), written and removed by scratch-copy-removal; this leaf only keeps a live one and deletes an orphan whose owner is dead and whose copy is gone.

State changed and its consumers:
- `run-check` (`checkedRun` in `src/run-check.ts`) creates `run-*` with `mkdtempSync` before writing `.owner`; the 60-second keep covers that gap; dead-owner runs are removed while the leaf is active and without a pane list, as today (the run-dir loop in `reconcile`, which does not read `live`). Today's finished-leaf temp rule checks tab and panes only; this leaf adds the slice check. (C)
- `leafTemp(repo, 'checkout')` and `leafTemp(repo, 'self-update')` (`selfUpdate`) are akrogon's own: kept while they hold a live-owner run, a registered worktree or a live process.
- Atomic writers (`src/admission.ts` `writeRecord`, `writeKeptReport`, `writeYaml` in `src/shell.ts`) leave `<file>.<pid>.tmp`; only a dead pid's file is deleted.
- `reconcileRepos` passes `[]` when `reconcileNeedsPanes` is false; every new file candidate kind must make it true (finished-leaf-processes covers slice candidates).
- Seat panes and run scopes live in leaf slices (finished-leaf-processes stops them); a process outside (Chrome) keeps its folder with its pid as reason.

Exclusions: registered verify, batch and worker copies (scratch-copy-removal); slice stops and systemd units (finished-leaf-processes); repo kept lines in status (kept-status); log retention under `issues/` (chart check-evidence); other tools' files (Claude Code worktrees, pi command logs, `.evidence`).

Open for the plan: how "a slice with a running unit" is read (`systemctl --user list-units` on `leafSlice` names or `/sys/fs/cgroup`); delete order (rename aside first, then remove) and its tests; the exact `what clears it` wording per reason.
