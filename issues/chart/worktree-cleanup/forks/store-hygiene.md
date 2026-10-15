# Store hygiene

## Question
Q1. Which locations count as "the akrogon folder and what it produces" that must always be clean of junk and leftovers? Candidates: the worktree store (`~/.akrogon/worktrees/<repo>`), the rest of `~/.akrogon`, leaf temp folders, run-check run folders, verify/build scratch, reconcile reports, akrogon state under `~/.config/akrogon`, and folders tools create inside the store (`.temp`, `.dcf*.node-gyp`).

Q2. What proves an unregistered folder in those locations is safe to delete, so deletion never breaks something running or something a person needs: no live process with it as cwd or holding files open, no live pane inside, not a registered worktree, age, or a known producer?

Q3. When does that cleanup run, and what does it do with something it cannot prove safe?

### Carries
- Operator, 2026-10-15, Round 2 answer 5, verbatim: "these need to be deleted and the akrogon folder and what it produces always needs to be clean. You have to check that it's not gonna mess something up, but I want all folders to be clean of junk and leftover files"
- Taken: [scratch-copy-removal](scratch-copy-removal.md) (2a with owner-record correction 1a, 3a); [after-merge-remainder](after-merge-remainder.md) (2a, 3a, 4a; 5 moved here).
- Log evidence under `issues/` is chart [check-evidence](../../check-evidence/CHART.md), not this fork.

## Findings
Sources: [A](../slots/hygiene-A.md), [B](../slots/hygiene-B.md), [C](../slots/hygiene-C.md), [D](../slots/hygiene-D.md), [merged](../slots/hygiene-merged.md), rebuttals [B](../slots/hygiene-rebuttal-B.md), [C](../slots/hygiene-rebuttal-C.md), [D](../slots/hygiene-rebuttal-D.md). Host 2026-10-15, main f3557d8. Nothing deleted.

- F1 Junk today, about 475 MB: `/var/tmp/akr-1000/6855/58898f27/run-RewR23` 450 MB without `.owner` plus four `.tmp*` dirs (merged leaf `shared-test-browser`); `6855/f8-base2.log`, `f8-rerun.log`; 35-45 empty repo dirs in `/var/tmp/akr-1000` and `~/.akrogon/worktrees/repo`, leaked by akrogon tests; retired root `/tmp/akr-1000`; framework legacy root `.temp` 19 MB, `.dcf16a3f00401334-1.node-gyp` (Bun node-gyp shim), `emdash-conversion-ufix-b` (Chrome profile); 8 dangling symlinks from the 2026-10-11 07:55 hand move (akrogon 3, framework 5); `runs/last-start`; `~/.akrogon/run.lock`, `framework-tests.lock`; `.git/akrogon-base-runs.lock` in akrogon and framework; `framework/issues/.lock`; reconcile reports naming 9 gone paths (A,B,C,D).
- F2 Reconcile cannot see symlinks or stray files: it takes only directories (src/reconcile.ts:333, :402) (C,D).
- F3 When `reconcileNeedsPanes` is false the pass runs with `[]` as the pane list (src/next.ts:1327), which reads as "no panes"; any new candidate type must be counted there or it is judged without the pane veto (D; A verified).
- F4 Leftover processes: scope `akrogon-l59cce9a60bec-pwApYX-...scope` of merged leaf `browser-socket-runtime` still runs (4 h 43 min CPU, cwd and TMPDIR deleted, waits on a file nothing writes); seat panes are adopted into the leaf slice (src/next.ts:429, src/scope.ts:13-19), and closing a tab (src/next.ts:369-374) does not stop the slice. 16 fake seats from tests/run-permit.test.ts:88 still sleep; 22 `akrogon-run-*-guard.service` units are failed and loaded, because `startRunGuard` lacks `CollectMode=inactive-or-failed` that `runUnitArgv` has (src/scope.ts:53-54, :66-78) (C,D; A verified units and slices).
- F5 A /proc scan alone fails: a seat writes a file, then reads it seconds later with no process holding it (D); a background loop writes into its TMPDIR hours later (C); permission-denied reads make it partial (B).
- F6 Age alone fails both ways; name alone proves nothing (A,B,C,D).
- F7 `run-check` makes its run dir before writing `.owner` (src/run-check.ts:154-159) (B,C).
- F8 Formspark `.temp` screenshot: B asked whether it is retained proof. C: the closed leaf's review-A.md:14-15 cites other paths, none in this folder. D: the Playwright stage was rejected in review-B.md:286 and landed there by a root-path bug (implementation/report.md:149). Not proof.
- F9 `framework-tests.lock` was taken by hand in seat commands (`flock /home/ivan/.akrogon/framework-tests.lock bun run framework:verify`, framework 28d1f011c review-B.md:212); no current code names it. B: zero size does not prove nobody still uses it.
- F10 Unmanaged Claude Code worktrees (6 under /tmp/claude-1000, 13.2 GB; `.claude/worktrees/agent-*`) are other tools' and stay out (A,B,C,D).

## Taken
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

## Proofs
Identity for all: local user ivan (uid 1000) on the user systemd manager, the same manager akrogon's units use. systemd 262. Date 2026-10-15. Targets: throwaway units named `akrproof<n>*` in slice `akrproof<n>.slice`.
- P2 `systemctl --user stop <slice>`: a scope `systemd-run --user --scope --slice=<slice> -p TimeoutStopSec=5 -p CollectMode=inactive-or-failed sh -c 'sleep 300'` was running (slice active, process present). Stop exits 0; one second later the slice is inactive, no unit matching the prefix is listed and no `sleep 300` process remains. Limits: does not prove a process that left the slice's cgroup (Chrome's own app scope) is stopped; it is not.
- P3 `systemd-run --user -p CollectMode=inactive-or-failed` on a service (guard form) running `false`: after it fails, no unit matching its name is listed.
- P4 `systemctl --user reset-failed <unit>`: the same service without CollectMode stays listed `loaded failed failed`; reset-failed exits 0 and the unit is no longer listed.
Cleanup: final stop of the throwaway slice; `systemctl --user list-units --all '<prefix>*'` lists 0 units (checked).
