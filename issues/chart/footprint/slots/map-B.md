# Footprint map B

Code read in `/home/ivan/.akrogon/worktrees/akrogon/land-own-reds` (dc15047c). (H) marks what I measured or ran on this host on 2026-11-22. "Real" means btrfs exclusive bytes. "Apparent" is what `du` shows.

## Short answer

- node_modules is already shared on this PC. 34 trees show 20.2 GB apparent and 1.19 GB real. All of the real part is one postinstall download (`ffmpeg-static`, 76 MB per tree).
- The redundant bytes are elsewhere: kept red run roots (16 GB), the git checkout itself (378 MB per framework worktree), `issues/` copied into every release (97% of a release's source), two Bun caches, one watch consult folder (1.7 GB).
- Everything that overgrew here is named after an event (a run, a deploy, a consult). Nothing named after a live owner overgrew. That is the mechanism for point 3.
- Keep copyfile. Sharing needs the store and the Bun cache on one copy-on-write filesystem. Add one probe that says so. Do not build a shared node_modules.

## 1. Where bytes sit, and the rule that removes them (H)

| | Place | Measured | Rule today | Grows with |
|---|---|---|---|---|
| S1 | Leaf worktrees, framework | 13 dirs, 458 MB real each. 378 MB is the checkout (`.claude` 364 MB, of which `.claude/hooks/tests` 229 MB), 76 MB is `ffmpeg-static` | Removed at `merged` or `failed` (src/reconcile.ts:853-873) | open leaves |
| S2 | `-uN` worker copies | 3 (`one-gate-path-u1..u3`), 458 MB real each | The seat removes them by hand (skills/implement-issue/worker-protocol.md:11). Reconcile acts only when the leaf is finished (src/reconcile.ts:1023-1035) | leaves x 3 |
| S3 | `verify-*` | 2 framework, 1 akrogon, all with a live unit | Own `finally` (src/verify.ts:853-856), then reconcile (src/reconcile.ts:1036-1079) | live passes |
| S4 | `batch-*` | 0 | Own `finally` (src/batch.ts:114-118) | live batches |
| S5 | Hand-made worktrees (chart direct route) | akrogon `land-own-reds`, `one-test-cap`, `run-scratch`: 168 MB real each, not sparse, 165 MB is `issues/`. A sparse one (`watch-timer`) is 4.7 MB | None. "unmanaged worktree, never removed by the sweep" (src/reconcile.ts:1051-1057) | charts ever |
| S6 | node_modules | 34 dirs, 20.2 GB apparent, 1.19 GB real, about 1.0 GB shared once | Goes with its worktree | worktrees |
| S7 | `~/.akrogon/releases` | 13 releases, 2.9 GB apparent, 2.1 GB real. `git archive` is 186.0 MB, of which `issues/` is 180.7 MB | Current and previous stay. Others go 24 h after first stamp, and only during an akrogon deploy (src/release.ts:150-170, src/self-update.ts:217) | deploys |
| S8 | Bun cache | Two. `~/.cache/.bun/install/cache`: 8.75 GB apparent, 3.65 GB real, 23,158 entries, in use. `~/.bun/install/cache`: 1.74 GB real, 1,237 entries, 53 written this month | None. No code sets or cleans a cache. `XDG_CACHE_HOME` is forwarded only when set (src/run-check.ts:44) | package versions ever |
| S9 | Leaf temp `/var/tmp/akr-1000` | 24 GB. Framework 16 GB with 43 run roots, 37 kept. Akrogon 1.4 GB, 2 kept. 3 empty stray dirs | Kept roots are skipped until the leaf's temp is released (src/reconcile.ts:1170-1172). `refusal.json` roots are kept every pass (:1157-1169) | red runs |
| S10 | `/tmp/akrogon-io-*` | 95 dirs today, a few bytes each | Removed when the command ends (src/shell.ts:63). No rule for a killed command. Reboot clears tmpfs | killed commands |
| S11 | `~/.akrogon/runs/locks` | 12,179 empty files | None (src/admission.ts:52-55, :164) | leaf slices ever |
| S12 | Watch consult folders | 1 folder, 1.7 GB real, holds 2 registered worktrees | None (skills/watch-issues/scripts/consults.ts:92, :193-196) | consults |
| S13 | `~/.akrogon/verify-passes` | 24 dirs, 26 MB | 60 minutes (src/reconcile.ts:1430-1448) | passes per hour |
| S14 | Evidence archives in git, framework | 268 at HEAD, 138 MB. 428 versions in history, 222 MB, which is 33% of the 679 MB pack. First one 2026-10-16, so about 6 MB a day | None. No size cap (src/pack.ts:83). A re-pack adds a whole new blob (src/pack.ts:67-78) | closed leaves and re-packs |
| S15 | Ledgers, framework | 35.5 MB, 114,486 rows. `timings.jsonl` 29.4 MB. All 254 versions pack to 7.5 MB | None | events |
| S16 | Closed issue and chart folders | framework `issues/` 497 MB, 26,077 tracked files. akrogon 167 MB | None. Sparse checkout keeps them out of leaf worktrees (src/next.ts:239-271), not out of S5 and S7 | closed work |
| S17 | Plain logs in open leaves | framework 833 files, 123.5 MB, ignored by git | Packed at completion (src/phase.ts:391-393, src/pack.ts:104) | check runs per open leaf |
| S18 | `.claude/worktrees` | 0 in both repos | Only for a dead agent whose commits all landed (src/reconcile.ts:675-727). No rule for codex or pi | agent runs |
| S19 | Harness session logs | `~/.claude/projects` 10 GB, `~/.pi/agent/sessions` 6.0 GB, `~/.codex/sessions` 2.9 GB | None. Outside akrogon's repo (signposts) | every seat turn |

- F1. Ledgers are not a problem today. A full read and parse of framework's `timings.jsonl` takes 61 ms. Git stores them almost free.
- F2. In the archives, keeping only the last log per check name would cut 22,372 logs to 16,881. That is too little to be the fix for S14.
- F3. Six verify units and one land unit were running while I measured. A cleanup by name pattern would hit live work.

## 2. node_modules (H)

Framework's lockfile, 71,713 files, Bun 1.4.5, `--ignore-scripts`, in scratch folders (removed).

| Option | Same filesystem as the cache | Other filesystem (`/var/tmp`) |
|---|---|---|
| copyfile | 1.3 s, 0 real bytes | 9.9 s, 1.14 GiB real |
| hardlink | 0.6 s, 0 real bytes, 71,713 of 71,713 files are the cache's own inodes | 10.2 s, 1.14 GiB real, 0 files linked, no warning |
| symlink | not run | 5.3 s, 0 bytes, 71,764 links. `require.resolve('astro')` returns a path inside the cache |
| isolated linker + copyfile | not run | 8.3 s, 1.11 GiB real, 2,386 links |

- N1. Sharing needs one filesystem, not just btrfs. `/` and `/home/ivan` are two btrfs filesystems here. `cp --reflink=always` from the cache to `/var/tmp` fails with "Invalid cross-device link". So a `worktree_root`, a cache or a home on another mount gives full copies with no message. Anything installed under the leaf temp is a full copy today.
- N2. ext4 was not measured. The other-filesystem column is the same code path: a full copy, about 1.14 GiB and 10 s per tree.

What each option breaks:

- O1. copyfile (today). Nothing. Writes and native builds stay private. Each verify pass does a real install (src/verify.ts:686-693). Cost on ext4 or across mounts: one full tree per worktree and per pass.
- O2. hardlink. Rejected in #122 because the files are the cache's files: "an agent's patch inside node_modules then changes the cache and every other repo installed from it" (bun-copyfile/INTAKE.md:55). No incident is recorded. The intake is marked unverified (INTAKE.md:29) and nobody reproduced a mutation (bun-copyfile/slots/map-B.md:30). I confirmed only the precondition (table). It is the one zero-byte option on ext4. Across mounts it turns into a full copy silently.
- O3. symlink backend. Same exposure as O2, on every filesystem, because every path resolves into the cache. A bare `import('astro')` worked. Tools that compare real paths were not tested.
- O4. Shared read-only tree per lockfile hash, linked into each worktree.
  - Gives: one tree per hash on any filesystem. The postinstall download happens once.
  - Writers: a tool that writes `node_modules/.vite` or `.cache` fails if the tree is read-only, and leaks between leaves if it is writable. Framework's tree has only `.bin` today.
  - Paths: the link resolves to the shared folder. A package that finds the project by walking up from its own location finds the wrong place. Not tested.
  - `file:` and workspace deps point back into the worktree and cannot be shared. Framework has none.
  - Guard: `own-modules` uses `existsSync` (src/guard.ts:37-44), so a link to an existing folder passes. Read, not run.
  - Fresh verify: the pass no longer proves the lockfile installs. The key must cover `package.json`, `bun.lock`, patches, Bun version, platform and trusted dependencies. One missed input gives stale deps and a false green.
  - Parts: a key, a build lock, a store of trees, and a rule for trees no worktree points at. That last one is a new sweep.
  - Owner: `setup` is the repo's own command. The bun-copyfile chart refused to let akrogon rewrite it (bun-copyfile/slots/map-merged.md:8).
- O5. Isolated linker. Same bytes as today, because its store sits inside each tree. It only changes what code may import, so undeclared imports break. No footprint reason to take it.

Pick: O1. Private writes with shared bytes is what a copy-on-write filesystem does. Every other zero-byte option shares inodes or paths, which reopens the class #122 closed. For "any PC": `init` runs one clone probe from the Bun cache to the store and reports the cost per tree when it fails. An ext4 PC still works. Its bound is the tree count: open leaves, plus live verify passes, plus 3 per wave.

## 3. One mechanism

- Two kinds of store exist. Owner-named ones (S1, S3, S4) cannot outnumber live leaves and live passes. `max_active` and the serial lane already cap those. Their sweeps only clean up after a crash.
- Event-named ones get one more item per event, and a later sweep has to catch up: S9 `run-XXXXXX` kept per red run, S7 a release per deploy, S12 `<anchor>-<n>` per consult, S11 a lock per slice, S5 a worktree per chart, S14 a blob per pack.
- Every overgrowth in the table is event-named.

Mechanism: every root is named after its live owner and sits under that owner's root. The call that ends the owner removes the root. Nothing akrogon writes is named after an event. Then the count is at most owners times a fixed number, with no sweep to fall behind.

- It tightens `max_active` (src/config.ts:25, src/next.ts:378-409), the only by-construction bound today, from leaves to everything a leaf or the host owns.
- It replaces the delayed rules: `.akrogon-kept` (src/reconcile.ts:1170-1172), the consult counter, the lock folder with no rule, the "unmanaged worktree" branch (src/reconcile.ts:1051-1057).
- The one sweep that stays is the dead-owner drop (src/reconcile.ts:1184-1190).
- The check is a count, not `du`. Reconcile already rewrites a kept report each pass (src/reconcile.ts:1260). Worktrees above open leaves x 4 plus live passes, or run roots above live runs, is the alarm.

Concrete changes, by bytes per part:

- A1. S9: run-scratch D1 (always remove) is this rule. Already charted. 16 GB here.
- A2. S7: one line, `issues/ export-ignore` in `.gitattributes`. A release drops from about 250 MB to about 70 MB. History has one owner, the main checkout. The 24 h window stays (P3).
- A3. S5: the door creates direct-route worktrees sparse, like `createSparseWorktree`, and reconcile ends them with the chart. 168 MB to about 5 MB each.
- A4. S12: one consult folder per anchor, removed with the leaf.
- A5. S11: lock files live in the leaf temp, so one removal covers both.
- A6. The N1 probe in `init`.
- A7. Framework seeds: `ffmpeg-static` writes 76 MB into every tree, and `.claude/hooks/tests` puts 229 MB of tracked fixtures in every worktree (4.1 GB over 18).
- Leave alone: S15 (F1), S10, S13, S4.

Three stores cannot be owner-named:

- S14 and S16 are history on purpose. Only the inflow can be bounded. Q1: who has opened a log from a closed leaf's archive? If almost nobody, stop committing archives and keep the receipt rows. That removes about 6 MB a day from framework's pack.
- S8 is Bun's. Clearing it frees 3.65 GB, not 8.75. The second cache means some installs run without `XDG_CACHE_HOME`. I did not find the writer.
- S19 is outside the signposts.

## 4. Pitfalls over the lifetime

- P1. Owner names collide when two runs of one owner overlap, such as A and B running the same check in one leaf. Live run roots keep unique names. Only what stays after the run needs an owner name.
- P2. Replacing loses the earlier red. A verdict that cites a path from round 1 then reads round 2's bytes. Cite the receipt row, not the path.
- P3. Removing a release at deploy time breaks a land that started two deploys ago and imports a module late (src/land.ts:48). Keep the time window. A2 gets the bytes without touching it.
- P4. A2 breaks anything that reads a release's own `issues/`. I found no reader among the `toolRoot` uses (src/config.ts:228-237, src/install.ts:154, src/state-home.ts:67-72). A test that compares a release tree with its commit would fail.
- P5. Sharing ends silently when the cache, the home or `worktree_root` moves to another mount (N1).
- P6. On btrfs, apparent sizes overstate gains by 17 times here. The chart's figure must be real bytes or counts. Deleting one of 18 framework worktrees frees 458 MB, not 1.6 GB.
- P7. Clearing the Bun cache makes the next install of every lockfile need the network. A verify pass then depends on the registry.
- P8. Archives already in git stay. Only a history rewrite removes them, and that breaks every open branch and clone. Bound the inflow only.
- P9. The one-time cleanup: use reconcile's liveness tests, not `rm` by pattern (F3). Kept roots are removed inline, and run-scratch INTAKE measured 163 s for one tree under load.
- P10. A disk-free gate would turn growth into stopped work. Leftover temp files held admission closed overnight on 2026-10-14 (c6981701). On a 930 GB disk it would also never bind, so it does not give "minimal".
- P11. A per-repo sparse list for A7 is a new key in a strict schema, so it needs two releases. Verify must still check out everything the suite reads.
