# Notes, slot C: store hygiene

Tiers: T1 = live listing on this host, 2026-10-15 19:00 local; T2 = code trace on akrogon main f3557d8. No T3 experiments. Nothing was deleted or changed.

## Q1. Which locations count as "the akrogon folder and what it produces"

### Inventory: every location akrogon code writes

Config facts first (T2): `globalHome()` is `AKROGON_HOME` or the tool root (`src/config.ts:197-199`); `AKROGON_HOME` is unset here, so the global home is `/home/ivan/Work/infra/akrogon`. `worktreeStore(repo)` is `~/.akrogon/worktrees/<repo>` unless the repo config sets `worktree_root` (`src/config.ts:257-261`); framework's `issues/config.yaml` sets none, so its store is `~/.akrogon/worktrees/framework`. `<repo>/issues/worktrees` is only the legacy root that reconcile still scans (`src/reconcile.ts:162-164`).

1. Worktree store `~/.akrogon/worktrees/<repo>`. Writers: leaf worktree `src/next.ts:311,326-334`; verify copy `src/verify.ts:126`; batch copy `src/batch.ts:115`; worker copies `<slug>-u<N>` come from seat skills, not src. Holds full checkouts (about 1.6 GB each in framework per the intake). Today (T1): `akrogon`, `framework`, `repo` all empty, 0 bytes. `repo` is a test fixture name that leaked into the real home (tests pass `HOME: f.home` to the child in `tests/next.test.ts:383` but not on every path). Leftovers: 1 empty dir.
2. Legacy root `<repo>/issues/worktrees` (framework only, gitignored by `src/init.ts:70-72`). Today: 5 dangling symlinks dated 2026-10-11 07:55 (`check-scratch`, `copyfile-install`, `formspark-build-wiring`, `recording-consumers`, `root-influence`, all pointing into the now-empty `~/.akrogon/worktrees/framework`), plus `.temp` 19 MB, `.dcf16a3f00401334-1.node-gyp` 4 KB, `emdash-conversion-ufix-b` 64 KB. The symlinks are invisible to reconcile: the candidate sweep takes only `entry.isDirectory()` (`src/reconcile.ts:333`), which is false for a symlink. Leftovers: 8 entries.
3. Leaf temp `/var/tmp/akr-<uid>/<repo hash 4>/<leaf hash 8>` (`src/config.ts:264-281`). Writers: `ensureLeafTemp` on every check; run roots `run-*` with `.owner` (`src/run-check.ts:154-162`); capture dirs `akrogon-io-*` (`src/shell.ts:35`, under `tmpdir()`, which for a seat is this folder); seats themselves, since it is their `TMPDIR`. Today: 49 repo dirs, 45 of them empty (test repos; 13 test files set `AKROGON_LEAF_TEMP_ROOT`, the rest write here), 454 MB total, all under `6855` (framework): `58898f27/run-RewR23` with e2e scratch and no `.owner` (kept as `no .owner record`), four `.tmp*` dirs beside it, two stray files `f8-base2.log`, `f8-rerun.log` at the repo level. `.owner` files on the host: 0. Reconcile already removes run roots with a dead owner and a finished leaf's temp (`src/reconcile.ts:396-444`), but keeps anything without an owner file and never looks at non-`run-*` entries.
4. Legacy temp root `/tmp/akr-1000`, written by code before c698170 (2026-10-14, "Keep leaf temp on disk"). Today: 108 dirs, 84 KB, 6 `akrogon-io-*` capture dirs, newest 2026-10-14 11:09. No code reads or sweeps it now.
5. Global home (tool root): `config.yaml` (`src/init.ts:85`), `.lock`, `admission.lock`, `paused.yaml` (`src/pause.ts:20`), `stopped.yaml` (`src/stop.ts:18`), `held.yaml`, `runs/<hash>.yaml` (`src/admission.ts:39,62`, swept by `sweepStale`; today only `last-start`), `reconcile/<repo>.json` (`src/reconcile.ts:23,35-40`; 11 files, 44 KB; `framework.json` names 9 paths that no longer exist). Also in that folder but not akrogon's: `.pi-command-logs` (pi extension `tamdoma-subagents/command-output.ts:24`, 15 files, 1.2 MB), `.evidence/install-prune-links` (untracked leaf evidence), `.claude/worktrees/agent-adfa0843775529512` (Claude Code worktree, registered, reported `unmanaged worktree`).
6. `~/.akrogon/framework-tests.lock`, `~/.akrogon/run.lock`: 0 bytes, 2026-10-13, introduced by a7c9115 and 6968997 that day, no writer in src today. Leftovers: 2.
7. `~/.config/akrogon/env` (`src/init.ts:90`): webhook secrets. Not junk.
8. Per-repo records under `issues/`: `log.jsonl` (`src/log.ts:47`), `timings.jsonl` (`src/timing.ts:73`), `merge-attempts.jsonl` (`src/attempts.ts:113`), `verify-runs.jsonl` (`src/verify.ts:146,186`), `seeds/` (`src/pull.ts:75-79`), `implementation/check-*.log` copies (`src/run-check.ts:207-209`), owner moves to `closed/` (`src/phase.ts:223-224`) and `parked/` (`src/park.ts:61-68`), `learnings/LESSONS.md`. Sizes: framework jsonl files 2.2 MB together, check-log copies 1,606 files, 478 MiB; akrogon 399 check-log copies. Carries put log evidence in the check-evidence chart, so listed here only for completeness.
9. Worktree `.env` (`src/next.ts:365,409-410`, temp `<gitdir>/akrogon-env-<pid>` then rename). Leftovers: 0.
10. systemd user units: `akrogon.slice` (tracked), per run `akrogon-run-<id>.scope` and `-guard.service` (`src/scope.ts:77`). Today: 22 guard services in `failed` state still loaded, 1 scope running. Not files, but produced by akrogon and visible until `systemctl --user reset-failed`.
11. Processes: 19 processes whose cwd is a deleted worktree, all reparented to `systemd --user`: 16 fake seats from `tests/run-permit.test.ts:88` (`touch <mark>.held; while [ ! -e release ]; do sleep 0.05; done`), alive since 2026-10-13 and 2026-10-14, cwd `/tmp/akrogon-*/.akrogon/worktrees/repo/...`; 3 framework seat shells in deleted `browser-socket-runtime` and `-u2` worktrees since 2026-10-15 10:57 and 12:31, with `TMPDIR=/var/tmp/akr-1000/6855/6d613a31` and one fd open on a deleted file.
12. Skill symlinks (`src/install.ts:50`) into the home skill folders. Not junk.

### Each unknown item in the stores today

- `issues/worktrees/.temp/formspark-build-wiring-proof/{submit-stage,submission-screenshot.png}`, 19 MB, 2026-10-10 12:44. Producer: framework's own scratch convention; `package.json:176` has `clean:scratch` that removes `.temp` relative to cwd, so the formspark-build-wiring seat ran a framework script with cwd at the legacy store root. No process has cwd or an fd there (T1 `/proc` scan). Deleting breaks nothing; a later run recreates it.
- `issues/worktrees/.dcf16a3f00401334-1.node-gyp/node-gyp`, 4 KB, 2026-10-11 07:34. Producer: bun's lifecycle-script shim (file body is `bun x --silent node-gyp $@` behind `npm_config_node_gyp`), created by `bun install` (framework `setup: bun install --frozen-lockfile --backend=copyfile`) with its temp at the store root. Only a `bun install` in flight with that dir on PATH would miss it; none runs. Deleting is safe.
- `issues/worktrees/emdash-conversion-ufix-b/.fix-b-evidence/chrome-profile`, 64 KB, 2026-10-01. Producer: a worker-style folder (`-ufix-b` does not match `-u<N>`) that a seat used as a Chrome profile for evidence. No process cmdline references it (T1). Deleting is safe.
- The 5 dangling symlinks: made by hand on 2026-10-11 07:55 when the store moved to `~/.akrogon`; targets gone. Unlinking is safe.
- `~/.akrogon/worktrees/repo`: test leak, empty. Safe.
- `/var/tmp/akr-1000/6855/58898f27/run-RewR23`: a run root older than the `.owner` write (0 owner files on the host); its leaf temp has no live pane and no process cwd (T1). Safe, but only by the process scan, not by the record.

### Pick

"The akrogon folder and what it produces" = items 1, 2, 3, 4, 5 (its own files: runs, reconcile reports, lock and yaml files), 6, 9, 10 and 11. Reason: these are the paths akrogon or a seat writes under akrogon's name and nothing else owns. Excluded: 7 (secrets), 8 (repo content, another chart), 12 (installed links), and third-party files inside the tool root (pi logs, Claude Code worktree, `.evidence`), which belong to their producers. Cost: one list in the fork; the cleanup code then has nine roots to visit instead of two.

### Rejected

- Store only (items 1 and 2). Misses 454 MB of temp, the legacy temp root, the stale reports, and the orphan processes, which is most of what is dirty today.
- Everything under the home or tool root with "akrogon" in the name. Would delete the pi command logs, the Claude Code worktree and the skill links.

### Pitfalls

- Test leaks keep refilling the real locations (`repo` store dir, 45 empty temp dirs, 16 orphan seats). Removed by: tests isolating `HOME`, `AKROGON_LEAF_TEMP_ROOT` and killing their fake seats in teardown; cleanup alone only hides it.
- The legacy root is inside the framework checkout. Removed by: it is gitignored, and reconcile already treats it as a root, so deleting there is the same risk as the store.
- Item 11 is processes, not files; a file sweep leaves them. Removed by: a kill of processes whose cwd is a deleted path under a root, or accepting them as out of scope (question below).

### Questions a peer would ask

- Are the 19 orphan processes and 22 failed guard units in scope for "what it produces"? They are the only leftovers that hold resources rather than disk.
- Should reconcile stop scanning the legacy root once it is empty, so framework's checkout stops being a cleanup target?
- Who writes the two stray `f8-*.log` files at the repo level of the leaf temp, one level above any leaf dir? Nothing in src writes there.

## Q2. What proves an unregistered folder is safe to delete

### Pick

Safe means all four hold, checked in this order, cheapest first:
1. Not a registered worktree of the repo (`git worktree list --porcelain`), or registered and already decided by the leaf rules (`src/reconcile.ts:235-328`).
2. Not named by a live akrogon record: `.owner` with a live pid and boot id (`ownerDead`, `src/reconcile.ts:109-111`), an open verify record with a live owner (`:373-378`), a `state.batch` attempt, a leaf `state.worktree`.
3. No live herdr pane with cwd inside (`livePaneInside`, `:64-66`).
4. No process of this user with cwd inside, an open fd inside, or `TMPDIR`/`AKROGON_*` in its environment pointing inside (`/proc/<pid>/cwd`, `/proc/<pid>/fd/*`, `/proc/<pid>/environ`).
Age and known producer are not proofs. T1 shows both failing: `run-RewR23` is days old and dead, while the three framework seat shells from 12:31 today hold `TMPDIR` under `6855/6d613a31` with no file in the store at all. Cost: one function of about 30 lines for check 4, run once per pass over this user's pids, results cached for the pass.

### Rejected

- Age threshold. A 3-day-old Chrome profile could be in use and a 5-minute-old dir can be dead; the pitfall list in the fork would just move to "how many days".
- `fuser`/`lsof` only (cwd and fds). Misses the a77c260 case: a seat with `TMPDIR` inside and no fd open writes later and gets ENOENT. Check 4 adds the environment scan for that.
- Known producer only. Tells you whom to ask, not whether it is free now.

### How the check fails

- Check 4 reads `/proc/*/environ`, which is denied for other users' processes (seen in my scan). Fine on a single-user host; on a shared host a root-owned runner is invisible. It also sees only processes already started: a path remembered in a file (a skill's note, `state.yaml`, a verify record target) and used later is invisible unless check 2 names it. Nothing covers a third-party tool's remembered path, for example Claude Code's `.claude/worktrees/agent-*`.
- Check 1 fails for dangling symlinks and for registered paths that no longer exist, which `git worktree list` still reports until `git worktree prune` (`src/reconcile.ts:446` runs it only after a removal).
- Check then delete is two steps. `run-check` creates its run root with `mkdtemp` under the leaf temp without the global lock (`src/run-check.ts:154`), so a run can start between the check and the `rm`. Removed by: rename the folder aside first, then remove it; a late writer then fails at creation instead of writing into a half-deleted tree, and a process with cwd inside keeps working in the renamed folder.
- Check 3 depends on herdr. When the pane list is unavailable, today's rule keeps everything (`pane list unavailable`), and the same rule should hold for junk.

### Pitfalls

- The `/proc` scan costs a few hundred milliseconds with thousands of pids. Removed by: restrict to this uid, read each pid once per pass.
- Processes parked in a deleted cwd (item 11) make the scan report "in use" for paths that no longer exist. Removed by: compare `readlink` results without the ` (deleted)` suffix only for paths that exist.

### Questions a peer would ask

- Should check 4 be shared with `worktreeRemovable`, so the leaf-worktree path stops relying on pane cwd alone? Today's `foreignPaneInside` is a subset of it.
- Does the operator want the orphan processes reported next to kept paths, since they are what the check trips over?

## Q3. When cleanup runs and what it does with what it cannot prove

### Pick

Run it inside reconcile, on every pass that already fetches panes (targeted, `tab_closed`, `--all`, `--resume`, unpause), over all nine roots from Q1, not as a separate timer. Scope extends today's sweeps with: non-directory entries in the store and legacy root (symlinks, stray files), `unknown directory` entries that pass the Q2 check, non-`run-*` entries in a dead leaf temp, the legacy `/tmp/akr-<uid>` root (one-time, same rule), reconcile reports pruned to existing paths, and `~/.akrogon/*.lock` files no code names. What it cannot prove safe it keeps and reports with the blocking check named (`live pane inside`, `process 3243522 cwd`, `registered`), exactly as after-merge 4a shows them in plain status. Never ages a kept entry out. Reason: the operator's bar is "check that it's not gonna mess something up"; a kept entry with a named blocker is that check's output, and the next pass retries for free. Cost: the Q2 function, lstat instead of `isDirectory` in two sweeps, one more root list, tests for a symlink, a stray file and an in-use folder.

### Rejected

- A systemd timer or cron. Another unit to install and reason about, and reconcile already runs on every herdr event; a host with no events has nothing new to clean.
- Delete unprovable entries after N days. The Chrome profile and the dead run root show age proves nothing in either direction.
- Clean only on `--resume` (startup). Leaves junk for the whole session; the intake case piled up 13 GB between restarts.

### Evidence

- T1: reconcile already removes dead run roots and finished leaf temps on these passes (`src/reconcile.ts:396-444`) and prunes registrations after a removal (`:446`), so the timing exists; only the scope is short.
- T1: `framework.json` written 12:42 today still lists nine dead paths at 19:00, so reports need pruning on each write, not only when something was removed.
- T2: the hook-driven passes fetch panes only when `reconcileNeedsPanes` says so (`src/reconcile.ts:124-145`); unknown entries under a root already make it true.

### Pitfalls

- A kept entry that never clears (a tool's cache a seat recreates on every run) becomes permanent noise. Removed by: the report shows the producer guess next to the reason, and the operator decides once; nothing in the code ages it.
- Deleting in the legacy root of a repo checkout while a seat has cwd there. Removed by: Q2 check 4.
- The `/proc` scan needs `reconcileNeedsPanes` to be true for the pass; a pass without panes keeps everything. Removed by: nothing; same as today.

### Questions a peer would ask

- Should `reset-failed` of `akrogon-run-*-guard.service` units be part of the pass? They are produced by akrogon, but they are systemd state, not files.
- Should the pass kill a process whose cwd is a deleted path under a root? That is the only way the 19 orphans go away without the operator.
