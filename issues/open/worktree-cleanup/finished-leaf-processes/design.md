# Design: finished-leaf-processes

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

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, here a reconcile, status or merge invocation over a temporary repo, temporary store and temporary leaf temp root set through the existing environment overrides (`HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_HOME`) and the existing test fixtures. A fix of a proven bug shows its test failing before and passing after; new behaviour shows one deliberate break turning its test red. No new test machinery: no runner, pool or fixture factory is built. No live model or outside call is part of any criterion. Secrets, auth and UI lines of the standing design do not apply.

## Leaf architecture

Owned surfaces: `src/reconcile.ts` (a slice step per finished leaf, `reconcileNeedsPanes` for slice candidates, plus the host step for `reset-failed` and unmatched empty slices), `src/scope.ts` (`startRunGuard` argv gains `-p CollectMode=inactive-or-failed`, as `runUnitArgv` has; `leafSlice`; `stopRunUnits` as the stop call pattern).

External calls, each proven at charting: `systemctl --user stop <leafSlice(repo, slug)>` (P2, the call `src/stop.ts` makes), `systemd-run --user -p CollectMode=inactive-or-failed` (P3), `systemctl --user reset-failed <unit>` (P4).

State changed and its consumers:
- The leaf slice holds the seat panes (adopted by `adoptShell` in `allocate`) and every `run-check` scope of the leaf. The merge runs inside the holder's slice and still runs `completeOwner`, its log writes, `mergeWake` and seat B's last turn after `merged` is saved, so the stop only happens from reconcile once the tab is gone, never from `akrogon phase` or `mergeWake`.
- Own-slice guard: compare `/proc/self/cgroup` with the slice, as `callerScope` in `src/admission.ts` reads it.
- Every `run-check` unit runs in the leaf slice (`runSlice(leafSlice(repo, slug))` in `checkedRun`), also when started from a plain shell with no tab, so the stop also needs no live admission record (`recordSchema` in `src/admission.ts`: `slice`, `state: live|ended`) naming the slice. (C)
- `reconcile` reads `live ?? []`, and `reconcileRepos` passes `[]` when `reconcileNeedsPanes` is false. `reconcileNeedsPanes` returns true for a `merged` or `failed` leaf with a recorded tab or a loaded slice; with `live === null` a recorded tab is not proven gone. (B,D)
- Pass order (C): the slice step runs before the leaf temp and unowned-item checks of the same pass, so store-sweep sees stopped slices in the same pass.
- 44 of the 50 loaded slices on this host match no leaf record (hash of `<repo>/<slug>` over all open and closed leaves), so mapping by known slugs alone misses them; the prefix `akrogon-l` is akrogon's own. (C)
- A resumed failed leaf gets a fresh slice when `allocate` adopts its shell again.

Exclusions: file cleanup (store-sweep, scratch-copy-removal); processes outside akrogon slices (Chrome app scopes) are not stopped.

Held disagreement (D): D proposed `blocked-by: [scratch-copy-removal]` here so both leaves' edits to `reconcile` do not collide. Not taken: this leaf consumes nothing scratch-copy-removal produces, and file overlap never orders work; a merge conflict is resolved at merge.

Delivered for store-sweep: one reader "does this leaf slice hold a running unit", used by this leaf and reused by store-sweep. (C,D)

Open for the plan: whether reconcile's `leaves` include closed merged leaves or the slice step lists loaded `akrogon-l*.slice` units and maps them back through `leafSlice`; a test seam for systemctl (a fake on PATH as existing tests do, or a real user manager when present).
