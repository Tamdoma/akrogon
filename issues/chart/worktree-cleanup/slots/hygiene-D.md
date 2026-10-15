# Notes: Store hygiene (Slot D)

## Q1: Which locations count as "the akrogon folder and what it produces" that must always be clean of junk and leftovers?

### 1. Complete inventory of every location `akrogon` code writes (and legacy/test leftovers on this host)

| # | Path | Writer (`file:line`) | What it holds | Current size & leftover count on this host (`2026-10-15`) |
|---|---|---|---|---|
| 1 | `~/.akrogon/worktrees/<repo>/` (`worktreeStore(repo)` default) | `src/config.ts:257-261`; leaf worktrees `<slug>`: `src/next.ts:279-308, 311, 332-334`; per-leaf `.env` (via `<gitDir>/akrogon-env-<pid>`): `src/next.ts:348-366, 408-410`; verify copies `verify-<uuid>` + `.env`: `src/verify.ts:126, 152-153`; merge-build copies `batch-<uuid>`: `src/batch.ts:115-116` + `src/lessons.ts:94`; seat-delegated workers `<slug>-u<N>`: `skills/implement-issue/references/worker-protocol.md`, swept at `src/reconcile.ts:386-393` | Managed sparse git worktrees for active leaves, delegated workers, `akrogon verify`, and `buildStack` | `akrogon/`: `0 B` (`0` leftovers); `framework/`: `0 B` (`0` leftovers; 9 leftovers / 13 GB manually removed earlier on `2026-10-15`); `repo/`: `0 B` (**`1` leftover empty dir** from `2026-10-15 10:15`, created by a test fixture repo named `repo`) |
| 2 | `~/.akrogon/{framework-tests.lock,run.lock}` | Retired. `run.lock` was written by `src/admission.ts` in commit `6968997` (`2026-10-13`) and replaced by `<globalHome()>/runs/` in `76397e3` (`2026-10-14`); `framework-tests.lock` (`2026-10-13 01:19`) was a pre-`run-check` lock | Retired 0-byte flock files in `~/.akrogon` | `0 B` (**`2` leftover files**: `framework-tests.lock`, `run.lock`) |
| 3 | `<repo.root>/issues/worktrees/` (`oldRoot` / explicit `worktree_root: issues/worktrees`) | `src/config.ts:260`, swept as `oldRoot` at `src/reconcile.ts:126, 163, 315-328, 331-335` | Pre-`1191e8c` in-repo worktree store (still configured in 8 of 11 repos in `config.yaml`) | `akrogon/issues/worktrees`: `12 KB` (**`3` leftover broken symlinks**); `framework/issues/worktrees`: `19 MB` (**`8` leftovers**: **`5` broken symlinks** + `.temp` `19 MB` + `.dcf16a3f00401334-1.node-gyp` `4 KB` + `emdash-conversion-ufix-b` `64 KB`); 6 other repos: `0 B` (`0` entries) |
| 4 | `/var/tmp/akr-<uid>/<repo-hash-4>/<leaf-hash-8>` (`leafTemp` / `ensureLeafTemp`) | `src/config.ts:266-301` (`mkdirSync` 0700); seat `TMPDIR`: `src/next.ts:462, 474`; check run roots `run-<rand>` + `.owner` + `out.log`: `src/run-check.ts:58, 75-76, 154-166, 221`; `selfUpdate` detached worktree `leafTemp(repo, 'self-update')`: `src/self-update.ts:63, 107-108, 122-123`; swept at `src/reconcile.ts:396-444` | Per-leaf `TMPDIR`, `akrogon run-check` `run-*` folders, and `self-update` rebase worktree | `/var/tmp/akr-1000`: **`454 MB` across `39` `<repo-hash-4>` dirs**, ALL leftovers: **`35` empty `<repo-hash-4>` dirs** from `akrogon` tests not setting `AKROGON_LEAF_TEMP_ROOT`; **`4` empty `checkout` (`leafTemp(repo, 'checkout')`) dirs** (`5d20/07a5c53f`, `6855/77861a00`, `5d10/6c8b272b`, `e527/4d672a41`); **`2` stray log files** in `6855/` (`f8-base2.log` `1.8 MB`, `f8-rerun.log` `1.8 MB`); **`1` merged leaf dir `6855/58898f27`** (`shared-test-browser`, **`450 MB`**) holding `run-RewR23` (`450 MB`, kept as `'no .owner record'`) and **`4` empty `.tmp*` dirs** |
| 5 | `/tmp/akr-<uid>/` (retired `leafTemp` root) | Former `leafTemp` in `src/config.ts` prior to `2026-10-14 11:09` (moved to `/var/tmp/akr-<uid>`) | Pre-migration `leafTemp` directories | `/tmp/akr-1000`: **`84 KB` across `93` leftover directories** |
| 6 | `<captureRoot ?? tmpdir()>/akrogon-io-<rand>` | `spawnFiles` / `finishCaptured` (`src/shell.ts:35-36, 51, 64`); uses `runRoot` in `run-check.ts:74`, seat `leafTemp` when inside a seat pane, or `/tmp` when run from operator shell/hooks | Subprocess `out` and `err` capture files during child execution | `0 B` (`0` leftovers currently in `/tmp` or `/var/tmp/akr-1000`) |
| 7 | `<globalHome()>/reconcile/<repo>.json` | `writeKeptReport` (`src/reconcile.ts:22-24, 35-41`, via `${file}.${pid}.tmp` + `renameSync`) | Last `reconcile` kept-worktree report per repo | `/home/ivan/Work/infra/akrogon/reconcile/`: `44 KB` (`11` active repo JSON files; `framework.json` lists **9 dead paths** that no longer exist on disk + **6 unmanaged `/tmp/claude-1000/...` worktrees**) |
| 8 | `<globalHome()>/runs/` | `withAdmission` / `writeRecord` / `sweepStale` (`src/admission.ts:39, 57-64, 98-112, 133, 167`, via `${path}.${pid}.tmp`); guard cleanup at `src/scope.ts:77` | Live check-run admission records `<token_hash>.yaml` | `/home/ivan/Work/infra/akrogon/runs/`: `4 KB` (`0` live `.yaml` files; **`1` leftover retired file `last-start` (`13 B`, `Oct 14 11:11`)** from `6968997`, ignored by `sweepStale` at `src/admission.ts:104`) |
| 9 | `<globalHome()>/{config.yaml,paused.yaml,stopped.yaml,.lock}` | `src/init.ts:85`, `src/pause.ts:20, 54`, `src/stop.ts:18, 48` (all via `writeYaml` `.tmp` + `renameSync` at `src/shell.ts:143-148`); `.lock` via `withLock` (`src/state.ts:203-206`) | Global configuration, repo pause set, stopped leaf set, and global flock file | `config.yaml` (`1.1 KB`), `paused.yaml` (`2 B`), `stopped.yaml` (`2 B`), `.lock` (`0 B`); `0` leftovers |
| 10 | `<repo.root>/.git/akrogon-*.lock` and `<repo.root>/issues/.lock` | `.git/akrogon-install.lock`: `src/config.ts:314`, `src/self-update.ts:254`; `.git/akrogon-verify-runs.lock`: `src/verify.ts:86, 145, 174`; `.git/akrogon-base-runs.lock` (retired in `dc2e2b0`) | Per-repo flock coordination files | Active: `akrogon-install.lock` (`0 B`), `akrogon-verify-runs.lock` (`0 B`). Leftovers: **`2` retired `.git/akrogon-base-runs.lock` files** (`0 B` in `akrogon/.git` and `framework/.git`) + **`1` retired `framework/issues/.lock` (`0 B`)** |
| 11 | `<repo.root>/issues/` & `<repo.root>/learnings/` | `src/init.ts:17, 63-66, 76, 81`; `src/state.ts:132` (`state.yaml`); `src/phase.ts:223-224` (`issues/closed`); `src/park.ts:61, 68` (`issues/parked`); `src/pull.ts:75-79` (`issues/seeds/*.md`); `src/log.ts:47` (`log.jsonl`); `src/timing.ts:73` (`timings.jsonl`); `src/attempts.ts:113` (`merge-attempts.jsonl`); `src/verify.ts:146, 186-187` (`verify-runs.jsonl`); `src/run-check.ts:207-209` (`<target>/check-*.log`, scoped to chart `check-evidence`); `skills/chart-issues/scripts/chart-usage.ts:469` (`USAGE.md`) | Durable repo issue state, seeds, jsonl ledgers, and check logs | Tracked repo records + gitignored `issues/seeds/` (`12 KB` in `akrogon`, `356 KB` in `framework`, already pruned by `pullRepo` at `src/pull.ts:77-79`) |
| 12 | `~/.config/akrogon/env` | Named at `src/init.ts:90-91` (operator-written, read-only to `akrogon`) | Operator secret/env declarations | `439 B` (`1` active file, `0` leftovers) |
| 13 | `~/.local/bin/akrogon`, `~/.config/systemd/user/akrogon.slice`, `~/.{claude,agents,codex,pi/agent}/skills/<skill>` | `planSkillLinks` / `applySkillLinks` (`src/install.ts:9-54`, `src/self-update.ts:192-194`) | Installed binary, systemd slice, and skill symlinks (dangling skill symlinks already unlinked at `src/install.ts:28-37`) | `0` broken symlinks / `0` leftovers |
| 14 | `~/.local/state` | None (`akrogon` never writes to `~/.local/state`) | N/A | `0` files from `akrogon` |

---

### 2. Unknown items in the worktree stores today: who creates each, and whether deleting it can break a running or later process

1. **`/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/.dcf16a3f00401334-1.node-gyp` (`4 KB`, `Oct 11 07:34`)**:
   - **Who creates it**: **Bun (`bun install`)**. When `bun install` runs lifecycle scripts in a worktree `<store>/<slug>`, Bun creates a temporary directory `.<16-hex>-<tid>.node-gyp` in the parent directory (`<store>`) containing a 118-byte `node-gyp` shell wrapper (`#!/bin/sh ... bun x --silent node-gyp $@`) and prepends it to `PATH`. When `bun install` is killed (`SIGKILL` / scope stop) mid-install, `.dcf*.node-gyp` is left behind.
   - **Can deleting it break a running or later process?**:
     - *Running process*: **Yes, if and only if the `bun install` process that created it is still running** (deleting it mid-install causes `node-gyp` invocations in that `bun install` to fail with `ENOENT`).
     - *Later process*: **No** — every `bun install` creates a fresh random `.<hex>-<tid>.node-gyp` directory and never reuses an existing one.
2. **`/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/.temp` (`19 MB`, `Oct 10 12:44–22:00`)**:
   - **Who creates it**: Created during the closed leaf `formspark-build-wiring` (`2026-10-10`, when worktrees still lived under `issues/worktrees/`). A proof script in `issues/worktrees/formspark-build-wiring` wrote `../.temp/formspark-build-wiring-proof/submit-stage`, ran `bun install` (`playwright@1.63.0`, `19 MB`), and saved `submission-screenshot.png` (`framework/issues/closed/formspark-api/formspark-build-wiring/review-B.md:36`).
   - **Can deleting it break a running or later process?**:
     - *Running process*: **No** (no process has it open or as `cwd`; `formspark-build-wiring` closed on `2026-10-10`).
     - *Later process*: **No**. Worse, keeping `.temp` leaves a `package.json` and `node_modules` inside `issues/worktrees/.temp/formspark-build-wiring-proof/submit-stage`.
3. **`/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/emdash-conversion-ufix-b` (`64 KB`, `Oct 1 06:28–06:57`)**:
   - **Who creates it**: Created on `2026-10-01` during `emdash-conversion` (`framework/issues/closed/emdash-cms/emdash-build/emdash-conversion/implementation/fix-B.md:39`), where Seat A created a delegated repair worker worktree with suffix `-ufix-b` (instead of `-u<N>`). The worker launched headless Chrome with `--user-data-dir=.fix-b-evidence/chrome-profile`. When the worktree was removed at `06:28`, an orphaned Chrome process flushed `Preferences`, `Local State`, `Variations`, and `Network Persistent State` at `06:57`, recreating `.fix-b-evidence/chrome-profile` as an unregistered directory.
   - **Can deleting it break a running or later process?**:
     - *Running process*: **No** (no Chrome process from Oct 1 is running).
     - *Later process*: **No** (`emdash-conversion` is `merged` and closed).
4. **`prose-asserts-u1-cmdlogs` (`44 KB`, formerly in `/home/ivan/.akrogon/worktrees/framework/prose-asserts-u1-cmdlogs`)**:
   - **Who creates it**: Created on `2026-10-14` during `prose-asserts` (`framework/issues/closed/test-cpu/prose-tests/prose-asserts/review-B.md:108`) when Seat A copied `prose-asserts-u1/.pi-command-logs` (written by `tamdoma-subagents/command-output.ts:210-216`) into the worktree store before removing `prose-asserts-u1` so the logs could be read during `prose-asserts`'s implementation/review turns.
   - **Can deleting it break a running or later process?**:
     - *Running process / active leaf*: **Yes, if deleted while `prose-asserts` is still an active (unmerged) leaf**, because Seat A or Seat B in `prose-asserts` may read it in a subsequent turn (`review-B.md:108` explicitly inspected `prose-asserts-u1-cmdlogs`).
     - *Once `<slug>` is `merged`*: **No**.
5. **8 Broken Symlinks in `akrogon/issues/worktrees/` (`check-env`, `leaf-env-file`, `worktree-store`) and `framework/issues/worktrees/` (`check-scratch`, `copyfile-install`, `formspark-build-wiring`, `recording-consumers`, `root-influence`) (`Oct 11 07:55`)**:
   - **Who creates them**: Created during the `2026-10-11` `worktree-store` migration (`1191e8c`) pointing from `<repo>/issues/worktrees/<slug>` to `/home/ivan/.akrogon/worktrees/<repo>/<slug>`. Once those leaves merged and their store worktrees were deleted, the symlinks became dangling. `reconcile.ts:334` ignores them because `entry.isDirectory()` is `false` for symlinks.
   - **Can deleting them break a running or later process?**: **No** (their targets do not exist).

---

### 3. Five parts for Q1

1. **The pick with its reason and cost**:
   - **Pick**:
     - Scope "the akrogon folder and what it produces" to the **four ephemeral/runtime storage areas owned by `akrogon`**:
       1. **Worktree stores**: `worktreeStore(repo)` (`~/.akrogon/worktrees/<repo>`) and legacy `oldRoot` (`<repo.root>/issues/worktrees`), plus top-level `~/.akrogon/worktrees/` (removing subdirectories for unregistered test repos like `repo`) and top-level `~/.akrogon/` (removing retired lockfiles `run.lock`, `framework-tests.lock`).
       2. **Leaf temp & run scratch**: `/var/tmp/akr-<uid>/` (all `<repo-hash-4>` directories, `<leaf-hash-8>` directories, `run-*` directories, non-`run-*` `.tmp*` directories, stray files like `f8-*.log`, and empty `checkout` scratch directories) plus the retired `/tmp/akr-<uid>/` tree and stale `/tmp/akrogon-io-*` directories.
       3. **Run admission & reconcile state under `globalHome()`**: `<globalHome()>/runs/` (removing non-`.yaml` leftovers like `last-start` in `sweepStale`) and `<globalHome()>/reconcile/<repo>.json` (kept reports, updated on every `reconcile` pass and filtered on read in `status`).
       4. **Retired per-repo lockfiles**: `<repo.root>/.git/akrogon-base-runs.lock` and `<repo.root>/issues/.lock` (when `repo.root !== globalHome()`).
     - **Exclude** operator config (`~/.config/akrogon/env`, `<globalHome()>/config.yaml`, `paused.yaml`, `stopped.yaml`, active `.lock` files) and tracked/git-managed issue records under `<repo.root>/issues/{open,closed,parked,chart,*.jsonl}` (where log retention is already chart `check-evidence`).
     - **Also fix the test-suite producers**: Ensure `tests/self-update.test.ts`, `tests/install.test.ts`, and `tests/config.test.ts` set `AKROGON_LEAF_TEMP_ROOT` (and `HOME`) so `bun test` never leaks `<repo-hash-4>` folders into `/var/tmp/akr-<uid>` or `repo/` into `~/.akrogon/worktrees/`.
   - **Reason**:
     - Covers 100% of the `473 MB` of actual leftovers on this host today (`454 MB` in `/var/tmp/akr-1000`, `19 MB` in `framework/issues/worktrees`, `84 KB` in `/tmp/akr-1000`, `12 KB` in `akrogon/issues/worktrees`, plus `~/.akrogon/{run.lock,framework-tests.lock,worktrees/repo}`, `runs/last-start`, and `.git/akrogon-base-runs.lock`) without touching operator configuration or `check-evidence`'s `issues/` logs.
   - **Cost**:
     - Extending `reconcile` (`src/reconcile.ts`) and `sweepStale` (`src/admission.ts`) across these four areas (~60–80 lines of code + test coverage).

2. **Each rejected option with its reason**:
   - **Rejected Option 1 — Clean only `worktreeStore(repo)` (`~/.akrogon/worktrees/<repo>`)**:
     - *Reason*: Leaves `454 MB` in `/var/tmp/akr-1000` (including `450 MB` in `6855/58898f27/run-RewR23`, `3.6 MB` in `6855/f8-*.log`, and 35 test repo folders), `19 MB` in `framework/issues/worktrees` (`.temp`, `.dcf*.node-gyp`, `emdash-conversion-ufix-b`, 5 broken symlinks), `84 KB` in `/tmp/akr-1000`, `runs/last-start`, and `~/.akrogon/{run.lock,framework-tests.lock,worktrees/repo}` untouched, violating the operator's directive (*"the akrogon folder and what it produces always needs to be clean... I want all folders to be clean of junk and leftover files"*).
   - **Rejected Option 2 — Sweep arbitrary unmanaged paths outside `akrogon`'s directories (such as `/tmp/claude-1000/.../scratchpad/fw-*` or `<repo>/.claude/worktrees/*`)**:
     - *Reason*: Those paths were created by external Claude Code sessions outside `akrogon`'s directories (`akrogon/.claude/worktrees/agent-adfa0843775529512` is actively locked by live `claude` PID `9939`). Keeping them out of auto-deletion while reporting them as `unmanaged worktree` prevents `akrogon` from destroying operator/Claude scratchpads.

3. **The evidence with tier, source, and date**:
   - **[Tier 1 — Operator directive, 2026-10-15]**: Round 2 answer 5 in `issues/chart/worktree-cleanup/forks/store-hygiene.md:11`.
   - **[Tier 3 — Inspected code & live host filesystem, 2026-10-15]**:
     - `src/config.ts:195-301`, `src/reconcile.ts:22-41, 124-449`, `src/run-check.ts:154-222`, `src/verify.ts:126-190`, `src/batch.ts:115-156`, `src/self-update.ts:63, 104-125, 254`, `src/admission.ts:39-168`, `src/shell.ts:35-65, 143-148`.
     - Host inspection of `/home/ivan/.akrogon`, `/home/ivan/Work/infra/akrogon/{reconcile,runs,issues/worktrees,.git}`, `/home/ivan/Work/infra/tamdoma/framework/{issues/worktrees,.git}`, `/var/tmp/akr-1000`, and `/tmp/akr-1000`.

4. **The pitfalls with what removes each**:
   - **Pitfall 1**: `reconcile` (`src/reconcile.ts:333-334` and `402-403`) filters directory listings with `if (entry.isDirectory())`, which is `false` for broken symlinks (`check-env`, `check-scratch`, etc.) and stray files (`f8-base2.log`, `f8-rerun.log`), making them invisible to cleanup!
     - *What removes it*: Inspect all `readdirSync(..., { withFileTypes: true })` entries (files, directories, and symlinks), not only `entry.isDirectory()`.
   - **Pitfall 2**: `reconcile` (`src/reconcile.ts:406-442`) only inspects `run-*` subdirectories inside `<leaf-hash-8>`, ignoring `.tmp*` directories (`6855/58898f27/.tmp*`), keeps `run-*` without `.owner` (`run-RewR23`) forever even after the leaf is `merged` and has no live processes, and never removes empty `<leaf-hash-8>` (`checkoutScratch`) or `<repo-hash-4>` directories.
     - *What removes it*: Once a leaf is `merged` (or `failed` with no live pane/process), remove the entire `<leaf-hash-8>` directory (`rmSync(dir, { recursive: true, force: true })`) once no live process/run is inside, regardless of whether an old `run-*` child lacked `.owner`; remove empty `checkoutScratch` and unregistered `<repo-hash-4>` directories.
   - **Pitfall 3**: `akrogon`'s own test suite (`tests/self-update.test.ts`, `tests/install.test.ts`, `tests/config.test.ts`) calls `selfUpdate` / `ensureLeafTemp` without `AKROGON_LEAF_TEMP_ROOT`, recreating empty `<repo-hash-4>` directories in `/var/tmp/akr-<uid>` on every `bun test` run.
     - *What removes it*: A done-criterion asserting that running `akrogon`'s test suite adds zero entries to `/var/tmp/akr-<uid>` and `~/.akrogon/worktrees/`.

5. **Any question the peer would ask that the fork does not ask**:
   - Should `<repo.root>/issues/worktrees` (`oldRoot`) be removed completely once empty when `repo.config.worktree_root` is unset (so the repo uses `~/.akrogon/worktrees/<repo>`), rather than leaving an empty `issues/worktrees/` directory behind in `akrogon` and `framework`? (Yes — `rmdirSync` `oldRoot` when `oldRoot !== store` and `oldRoot` is empty.)

---

## Q2: What proves an unregistered folder in those locations is safe to delete, so deletion never breaks something running or something a person needs?

### How each individual candidate check works and how it fails on its own

| Candidate check | What it proves | How it fails if used alone |
|---|---|---|
| **1. Not a registered git worktree** (`!registered.has(path)` from `git worktree list --porcelain`) | Git does not track `path` as a linked worktree (`<slug>`, `<slug>-u<N>`, `verify-*`, `batch-*`). | **Fails on active non-worktrees & mid-creation races**: (a) Nothing under `/var/tmp/akr-<uid>` is a git worktree (except `self-update` briefly), yet active seats' `TMPDIR` and running `run-check` `run-*` folders live there; (b) `bun install`'s `.dcf*.node-gyp` in `<store>` is not a worktree; (c) Seat A/B in an active leaf may write `<store>/<slug>-cmdlogs` or `<store>/.temp` across turns; (d) `git worktree add` has a brief window between `mkdir` and registration. |
| **2. No live Herdr pane inside** (`!livePaneInside(panes, path)`) | No Herdr terminal pane currently has its shell `cwd` at or inside `path`. | **Fails on child processes & sibling directories**: (a) A seat pane's `cwd` stays at `<store>/<slug>` while its child `bun install` uses `<store>/.dcf*.node-gyp`, or its test runner / browser uses `/var/tmp/akr-<uid>/...` or `<store>/<slug>-u1` (`src/reconcile.ts:385`); (b) While a leaf is active, Seat A/B's pane sits at `<store>/<slug>`, not inside `<store>/<slug>-cmdlogs` or `<store>/.temp`, even while reading/writing those sibling folders between tool calls. |
| **3. No live OS process with `cwd` or open files inside** (`/proc/<pid>/{cwd,fd}` for current UID) | No running process on the host currently has `cwd` or an open file descriptor inside `path` (catches live `bun install` in `.dcf*.node-gyp`, live Chrome in `chrome-profile`, or live test binaries in `run-RewR23`). | **Fails in the between-command gap of an active leaf**: During an active leaf's turn, Bash tool call 1 writes `.temp/formspark-build-wiring-proof/report.json` or `prose-asserts-u1-cmdlogs/command-1.log` and exits; while the LLM thinks for 10 seconds before Bash tool call 2 reads that file, **zero processes hold any `cwd` or fd inside the folder**. Deleting during that 10-second gap breaks tool call 2! |
| **4. Known producer / owner lifecycle** (`.owner` `ownerDead`, owning `<slug>` is `merged`, or repo is not in `config.yaml`) | The logical task (leaf, check run, or test fixture) that owns the path has finished and will never issue another command. | **Fails on anonymous/unprefixed folders and crash windows**: (a) `.dcf16a3f00401334-1.node-gyp` and `.temp` in `<store>`, or `f8-base2.log` in `/var/tmp/akr-1000/6855`, carry no leaf slug or `.owner` file; (b) `run-RewR23` has no `.owner` file; (c) an orphaned child process (like Chrome in `emdash-conversion-ufix-b` writing 29 minutes after worktree removal) can outlive its logical owner unless process liveness is also checked. |
| **5. Age (`mtime` / `ctime`)** | The directory entry has not been modified within window $T$. | **Fails both ways if used alone**: A long-running check or paused/blocked active leaf can leave top-level directory `mtime` unchanged for hours while still needing its files; conversely, a long age threshold delays cleanup after a leaf merges. |

---

### Five parts for Q2

1. **The pick with its reason and cost**:
   - **Pick**: **A composite 4-gate check (`safeToDelete`) combining (1) not a registered git worktree, (2) owner/repo lifecycle inactive, (3) no live Herdr pane inside, and (4) no live OS process with `cwd` or open files inside (plus a 60s creation-age grace on ownerless entries)**:
     - **Gate 1 (Not a registered worktree)**: `!registered.has(path)` (registered worktrees use the worktree rules from `scratch-copy-removal` and `after-merge-remainder`). Broken symlinks (`lstatSync(path).isSymbolicLink() && !existsSync(path)`) bypass further checks and are unlinked immediately.
     - **Gate 2 (Owner / repo lifecycle inactive — prevents the between-command gap)**:
       - If the path belongs to a known leaf (e.g. `/var/tmp/akr-<uid>/<repo-hash>/<leaf-hash>` or `<store>/<slug>-*` matched by longest known `<slug>`): the leaf must be **`merged`** (or `failed` with no live tab), or for a `run-*` child, its `.owner` must be dead (`ownerDead`).
       - If the path is an **anonymous/unprefixed entry** inside `<store>`, `oldRoot`, or `/var/tmp/akr-<uid>/<repo-hash>` (such as `.dcf*.node-gyp`, `.temp`, `f8-*.log`, or an unrecognized folder name):
         - For known tool-ephemeral patterns (`.<hex>-<tid>.node-gyp`, `akrogon-io-*`, `.tmp*`): eligible as soon as Gate 3 + Gate 4 pass and `mtime` is >60s old (or no leaf in `repo` has a live run).
         - For any other unprefixed folder/file in `<store>`, `oldRoot`, or `/var/tmp/akr-<uid>/<repo-hash>` (like `.temp`, `emdash-conversion-ufix-b`, `f8-*.log`): eligible when **no active (non-`merged`, non-`failed`) leaf in `repo` has a live tab or live `run-check`**, **OR** when the entry's prefix matches a `merged` leaf (`emdash-conversion-*`, `prose-asserts-*`).
       - If the path is an unowned repo directory (`/var/tmp/akr-<uid>/<4-hex>` or `~/.akrogon/worktrees/<name>` not matching any repo in `readGlobal().repos`): eligible when `mtime` > 60s.
     - **Gate 3 (No live Herdr pane inside)**: `live !== null && !livePaneInside(live, path)` (for locations where a pane can sit).
     - **Gate 4 (No live OS process with `cwd` or open fd inside `path`)**: Scan `/proc/<pid>/cwd` and `/proc/<pid>/fd/*` (`readlinkSync`) for processes owned by `process.getuid!()` and verify none resolves inside `path` (`within(target, realpathSync(path))`).
   - **Reason**:
     - Every single failure mode in the table above is closed:
       - Gate 2 prevents deleting `.temp` or `<slug>-cmdlogs` during the 10-second LLM thinking gap between two Bash commands of an active leaf;
       - Gate 4 prevents deleting `.dcf*.node-gyp` while `bun install` is running, or `chrome-profile` while an orphaned Chrome is still writing to it, or `run-RewR23` if a process is still inside it despite missing `.owner`;
       - Gate 1 + Gate 3 protect registered git worktrees and live terminal panes;
       - And once a leaf merges (or all open leaves in the repo finish), `.temp`, `.dcf*.node-gyp`, `emdash-conversion-ufix-b`, `prose-asserts-u1-cmdlogs`, `6855/58898f27/run-RewR23`, `f8-*.log`, broken symlinks, and the 35 test `<4-hex>` dirs are **all proven safe and deleted automatically**.
   - **Cost**:
     - One `/proc` scan per `reconcile` pass when unregistered/ownerless candidates exist (scanning `/proc/<pid>/{cwd,fd}` for current UID in Bun takes ~3–8 ms and zero external subprocesses).

2. **Each rejected option with its reason**:
   - **Rejected Option 1 — Check only `/proc` (`lsof` / `cwd` / open fds) + `!registered` + `!livePaneInside`, ignoring active-leaf lifecycle (Gate 2)**:
     - *Reason*: Fails in the between-command gap! When an agent in an active leaf writes a file in `<store>/.temp` or `<store>/<slug>-cmdlogs` in Bash command 1 and reads it in Bash command 2 ten seconds later, no process holds an open fd or `cwd` during those 10 seconds, so a `reconcile` pass triggered by another leaf's hook will delete the active leaf's files mid-turn.
   - **Rejected Option 2 — Delete only a hardcoded allowlist of known producer names (`verify-*`, `batch-*`, `<slug>-u<N>`, `run-*` with `.owner`)**:
     - *Reason*: Fails to delete `.temp` (`19 MB`), `.dcf16a3f00401334-1.node-gyp`, `emdash-conversion-ufix-b` (`-ufix-b` is not `-u\d+`), `prose-asserts-u1-cmdlogs`, `run-RewR23` (no `.owner`), `.tmp*` dirs, `f8-base2.log`, broken symlinks, or the 35 `<4-hex>` test dirs in `/var/tmp/akr-1000`.
   - **Rejected Option 3 — Pure age check (e.g. delete anything older than $N$ minutes/hours)**:
     - *Reason*: Either $N$ is short and deletes files belonging to a long-running or paused active leaf, or $N$ is long and leaves gigabytes of junk sitting around after a leaf merges.

3. **The evidence with tier, source, and date**:
   - **[Tier 3 — Inspected code & host artifacts, 2026-10-15]**:
     - `src/reconcile.ts:64-111, 330-444` (existing `livePaneInside`, `ownerDead`, `reconcile` candidate and `scratchRoot` loops).
     - `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/.dcf16a3f00401334-1.node-gyp/node-gyp` (`bun x --silent node-gyp $@`).
     - `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/emdash-conversion-ufix-b/.fix-b-evidence/chrome-profile` (`06:28` worktree vs `06:57` Chrome profile write).
     - `/home/ivan/Work/infra/tamdoma/framework/issues/closed/test-cpu/prose-tests/prose-asserts/review-B.md:108` (`prose-asserts-u1-cmdlogs` read during review).
     - `/var/tmp/akr-1000/6855/58898f27/run-RewR23` (`450 MB` held by `'no .owner record'` for merged leaf `shared-test-browser`).

4. **The pitfalls with what removes each**:
   - **Pitfall 1**: Symlinks inside a directory being checked or deleted: `realpathSync` on a broken symlink throws `ENOENT`, and checking `within(fdTarget, path)` without `realpathSync` on the directory can miss open files if `path` contains a symlink.
     - *What removes it*: Handle broken symlinks first via `lstatSync` (`isSymbolicLink() && !existsSync(path)` -> `unlinkSync`), and resolve `realpathSync(path)` once for existing directories before comparing `/proc/<pid>/{cwd,fd/*}` targets.
   - **Pitfall 2**: Scanning `/proc` on every `reconcile` pass even when there are no unregistered/ownerless candidates to delete.
     - *What removes it*: Lazily collect the set of current-UID `/proc/<pid>/{cwd,fd/*}` paths at most once per `reconcile` pass, and only when at least one candidate reaches Gate 4.
   - **Pitfall 3**: Prefix collision when matching `<slug>-*` in the worktree store (e.g. merged leaf `foo` matching active leaf `foo-bar`'s worktree `foo-bar` or `foo-bar-u1`).
     - *What removes it*: Match against `allLeaves(repo)` ( plus `knownSlugs` from `open`/`closed`/`parked`) sorted by **longest slug first**, requiring exact `<slug>` or `<slug>-` prefix.

5. **Any question the peer would ask that the fork does not ask**:
   - Why can `bun install` write `.dcf*.node-gyp` into `<store>` (`issues/worktrees/` or `~/.akrogon/worktrees/<repo>/`) in the first place? When `setupCommand` (`src/config.ts:311-315`) runs under `akrogon run-check` (`src/run-check.ts:58`), `TMPDIR` is `/var/tmp/akr-<uid>/.../run-XXXXXX` (which is on `/` btrfs, same filesystem as `/home/ivan`), whereas a seat running `bun install` directly when `TMPDIR` was `/tmp` (tmpfs, different mount from `/home`) forced Bun to fall back to the target's parent directory (`<store>`) for same-filesystem atomic operations!

---

## Q3: When does that cleanup run, and what does it do with something it cannot prove safe?

1. **The pick with its reason and cost**:
   - **Pick**:
     - **When it runs**: Run store-hygiene cleanup **inside `reconcile()` on every existing `reconcile` pass** (`akrogon next`, `--all`, `--resume`, Herdr `tab_closed` hook at `src/next.ts:1441`, and the post-merge pass in `mergeWake` from `after-merge-remainder` Q1), plus a **one-time host-wide hygiene sweep once per `reconcileRepos` pass** (`src/next.ts:1313-1333`) for repo-independent paths (`/var/tmp/akr-<uid>/<unregistered-4-hex>`, `/tmp/akr-<uid>`, `~/.akrogon/worktrees/<unregistered-repo>`, `~/.akrogon/{run.lock,framework-tests.lock}`, and `<globalHome()>/runs/` non-`.yaml` files).
     - **Fix `reconcileNeedsPanes` (`src/reconcile.ts:124-145`)**: Update `reconcileNeedsPanes` so it returns `true` whenever `[store, oldRoot]` has **any** unrecorded entry (including broken symlinks or non-directory files, not only `entry.isDirectory()`) or `scratchRoot` (`/var/tmp/akr-<uid>/<repo-hash-4>`) has any entry, so `reconcile` is never handed a fake empty `[]` pane list (`src/next.ts:1327`) when hygiene candidates exist.
     - **What it does with something it cannot prove safe**: **Keep it on disk**, record `{ path, reason }` in `reconcile/<repo>.json` (naming the exact gate that held it: e.g. `'active leaf'`, `'live pane inside'`, `'live process inside'`, `'run in progress'`, `'pane list unavailable'`, `'uncommitted changes'`), and **surface it in plain `akrogon status`** (per `after-merge-remainder` Q2). As soon as the blocking condition ends (the leaf merges, the pane closes, or the process exits), the next `reconcile` pass proves it safe and deletes it automatically.
   - **Reason**:
     - Piggybacking on `reconcile` means cleanup happens automatically right when leaves merge and tabs close — with no new background daemon or manual command required — while anything still in use is safely kept, visible in `akrogon status`, and automatically reaped on the next pass once idle.
   - **Cost**:
     - ~25 lines in `src/reconcile.ts` (`reconcileNeedsPanes` + host-level sweep) and `src/next.ts:1313-1333`.

2. **Each rejected option with its reason**:
   - **Rejected Option 1 — Run hygiene only via a manual CLI subcommand (e.g. `akrogon clean` or `akrogon gc`)**:
     - *Reason*: Violates the operator's requirement that *"the akrogon folder and what it produces always needs to be clean"* without manual intervention.
   - **Rejected Option 2 — Force-delete items that cannot yet be proven safe (e.g. while an active leaf is running or a process has files open)**:
     - *Reason*: Directly violates the operator's constraint (*"You have to check that it's not gonna mess something up"*) and breaks running `bun install` or active leaf turns.
   - **Rejected Option 3 — Run hygiene inside `akrogon status`**:
     - *Reason*: Already foreclosed by `after-merge-remainder` Q2 (`status never runs reconcile`; `status` is a fast read-only observer).

3. **The evidence with tier, source, and date**:
   - **[Tier 1 — Operator directive & taken forks, 2026-10-15]**:
     - `issues/chart/worktree-cleanup/forks/store-hygiene.md:11-12` and `issues/chart/worktree-cleanup/forks/after-merge-remainder.md:27-30`.
   - **[Tier 3 — Inspected code, 2026-10-15]**:
     - `src/reconcile.ts:124-145` (`reconcileNeedsPanes` only checks `entry.isDirectory()` in `[store, oldRoot]` and only checks `leafTemp` for current `leaves`).
     - `src/next.ts:1313-1333` (`reconcileRepos` passes `[]` instead of `await panesOnce()` when `reconcileNeedsPanes` returns `false`) and `src/next.ts:1441` (`tab_closed` hook calls `reconcile` for `owners[0].repo`).

4. **The pitfalls with what removes each**:
   - **Pitfall 1**: When `reconcileNeedsPanes(repo, leaves)` returns `false`, `reconcileRepos` (`src/next.ts:1327`) passes `[]` (empty array, **not** `null`) as `live: Pane[] | null` to `reconcile(repo, leaves, ...)`, making `reconcile` believe there are zero live panes on the host without ever calling `herdr pane list`! If `reconcileNeedsPanes` misses a hygiene candidate (such as an unknown `<leaf-hash-8>` dir in `scratchRoot` whose leaf is no longer in `leaves`, or a non-directory entry), `reconcile` will run with `live = []` and skip the live-pane check!
     - *What removes it*: In `reconcileNeedsPanes` (`src/reconcile.ts:124-145`), return `true` if `existsSync(scratchRoot) && readdirSync(scratchRoot).length > 0` or if `[store, oldRoot]` has any entry not in `recorded`.
   - **Pitfall 2**: `tab_closed` (`src/next.ts:1441`) calls `reconcile` directly for a single repo without calling `reconcileRepos`.
     - *What removes it*: Call the host-wide hygiene helper inside `reconcile()` (or at the end of `reconcile()`) so both `reconcileRepos` and `tab_closed` run it.

5. **Any question the peer would ask that the fork does not ask**:
   - When `reconcile` runs on `framework` today, `reconcile/framework.json` records 6 unmanaged worktrees at `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/fw-*` (`13.2 GB` in `/tmp` tmpfs) and `reconcile/akrogon.json` records `/home/ivan/Work/infra/akrogon/.claude/worktrees/agent-adfa0843775529512` (`102 MB`). Because Q2 of `after-merge-remainder` prints all existing kept paths from `reconcile/<repo>.json` in plain `akrogon status`, those 6 `/tmp/claude-1000/...` worktrees will immediately appear under `framework` in `akrogon status` as `unmanaged worktree` — should `akrogon` continue to keep and report `unmanaged worktree` entries (registered git worktrees outside `store` and `oldRoot`), or should operator/Claude worktrees under `/tmp/claude-*` and `.claude/worktrees` also be cleaned when their owning Claude PID is dead?
