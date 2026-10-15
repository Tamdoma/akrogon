# Store hygiene: merged notes

Tags name the slots whose notes say the line. Sources: hygiene-A.md, hygiene-B.md, hygiene-C.md, hygiene-D.md (2026-10-15, main f3557d8). Nothing was deleted.

## Q1 locations

Agreed
- In scope: worktree stores, legacy `<repo>/issues/worktrees`, leaf temp `/var/tmp/akr-<uid>`, akrogon's own state under the global home (reconcile reports, runs/) (A,B,C,D).
- Retired root `/tmp/akr-<uid>` (93-108 dirs, 84 KB-1.7 MB) is in scope (B,C,D).
- Retired lock files `~/.akrogon/run.lock`, `framework-tests.lock` (B,C,D); also `.git/akrogon-base-runs.lock` in akrogon and framework and `framework/issues/.lock` (D; A verified present).
- Out of scope: `~/.config/akrogon/env`, config.yaml/paused/stopped/current `.lock`, installed links, repo issue records and check logs (check-evidence chart), other tools' files: pi command logs, Claude Code worktrees (A,B,C,D).
- Leftovers today: 8 dangling symlinks in akrogon (3) and framework (5) legacy roots, invisible to reconcile because it takes only directories (src/reconcile.ts:333) (B,C,D; A verified akrogon's 3); `.temp` 19 MB, `.dcf*.node-gyp`, `emdash-conversion-ufix-b` in framework legacy root (A,B,C,D); `run-RewR23` 450 MB without `.owner` plus four `.tmp*` dirs in merged leaf `shared-test-browser` temp (A,B,C,D); `f8-*.log` stray files (A,C,D); 35-45 empty repo dirs in leaf temp and `~/.akrogon/worktrees/repo`, leaked by akrogon's own tests (C,D); `runs/last-start` retired file (B,D); reconcile reports naming 9 gone paths (A,B,C,D).
- Fix the tests that leak into real locations, so cleanup is not hiding a refill (C,D).

Disagreements
- Classify by location vs by producer. A,C,D: everything akrogon-owned in those roots that passes the Q2 check is junk. B: classify by producer and lifetime; a location or odd name does not make content junk.
- Formspark screenshot in `.temp`. B: may be the only copy of proof evidence for closed leaf formspark-build-wiring; decide its retained home first. C,D: closed leaf, safe to delete.
- Processes and systemd units. C: 19 orphan processes in deleted worktree dirs (16 fake seats from tests/run-permit.test.ts, 3 framework seat shells) and 22 failed guard units are akrogon leftovers; asks if in scope. B: observed a live `awk` in an akrogon scope with a deleted cwd; cleanup should not become a process killer. A,D: files only.
- Unmanaged Claude Code worktrees listed in reports (13.2 GB under /tmp/claude-1000). D: asks whether to clean them when the owning Claude process is dead. A,B,C: not akrogon's.

## Q2 safe to delete

Agreed
- Age alone and name alone prove nothing (A,B,C,D).
- Registered worktrees follow the taken rules (A,B,C,D).
- No live pane inside and no live process with cwd or open file inside are needed vetoes (A,B,C,D).
- A /proc scan is incomplete: it cannot see other users' processes (B,C) and misses a process that will open the path later (B,C,D).
- `run-check` makes the run dir before writing `.owner` (src/run-check.ts:154-159), so "no owner record" is not proof of death during that gap (B,C).

Disagreements
- What closes the "will use it later" gap. A: a quiet period (about 1 hour by mtime) for items with no owner record. C: also scan process environment for TMPDIR/AKROGON_* inside the path; rename aside before delete; no age. D: an owner gate: an item tied to a leaf goes only when that leaf is merged or failed; an item with no owner goes only when no leaf in that repo is active (a seat writes a file, then reads it 10 seconds later with no process holding it); 60 s grace. B: positive ownership only; a producer must declare its output disposable; existing unknowns need a one-time per-item inventory.
- Deleting today's unknowns. A,C,D: all pass and go. B: Bun shim, Chrome profile safe after checks; Formspark screenshot waits on an evidence decision; old symlinks after confirming the alias scheme is retired.

## Q3 when, and what with unprovable items

Agreed
- No timer or daemon; no cleanup from `akrogon status` (A,B,C,D).
- Unprovable items stay with a named reason, shown per the taken plain-status answer (A,B,C,D).
- Report removal failures; verify absence after delete (B; A,C,D imply).

Disagreements
- Where it runs. A,C,D: inside every reconcile pass, all repos, including repos with no open leaves, plus host-wide parts (retired roots, unregistered repo dirs) (D). B: at producer finish, reconcile for crash recovery, plus one bounded migration for legacy roots.
- A kept item with no end. B: never a permanent "unknown"; each kept item names the fact that would clear it. C: never age out; operator decides once on recurring noise. A,D: kept until the next pass proves it safe.
- Pane list blind spot. D: when `reconcileNeedsPanes` is false the pass runs with an empty pane list (`[]`, src/next.ts:1327), meaning "no panes", so a new candidate it does not count would be judged with no pane veto; must count every new candidate type. A verified the code.
