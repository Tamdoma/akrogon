# Test temp lifecycle and garbage collection, slot D

Slot D, Claude Fable 5.1, 2026-10-14. Read: the brief, `forks/leaf-temp.md`, `slots/overnight-B.md`, `slots/overnight-C.md`, `fix-temp-diff-2.patch`, git history, `src/config.ts`, `src/run-check.ts`, `src/reconcile.ts`, `src/shell.ts`, the run-units worktree, `~/.local/bin/tmp-sweep`, the framework producers. Did not read the other slots' temp-gc files. Changed nothing.

## 1. Evidence

**F1. The Chromium claim is contradicted by its own intake.** `5b2f4d0` (2026-10-02 16:56 local) says "On-disk /var/tmp made headless Chromium captures hang at random in framework verify." Fourteen minutes earlier, `17176d7` (16:42) added the intake for Tamdoma/akrogon#53 (`issues/chart/test-runs/INTAKE.md`, now at `git show 17176d7`). It records the same hangs: Playwright `setViewportSize ... browser has been closed` after 300 s timeouts, a different failing test on every run, during four overlapping heavy runs. Then: "Follow-up by the operator's session (about 14:10 UTC, machine otherwise idle)... Full `bun run test:cf-workers-deploy` on main: 320 pass, 0 fail, 183 s... No stuck browser processes." At 14:10 UTC leaf temp was still `/var/tmp/akrogon-1000` (`1db7734` 10-01 set it, `5b2f4d0` 10-02 14:56 UTC moved it). So the hangs happened on `/var/tmp` under overload and did not happen on `/var/tmp` idle. The intake's own sentence: "The machine-wide overload cause was not proven by catching a hang live." No framework issue, learning or log names `/var/tmp` as a cause (`grep -rniE "var/tmp" framework/issues/` hits only log paths; `learnings/` has no entry). Mechanism also argues against it: Chromium puts only its SingletonSocket under TMPDIR (`process_singleton_posix.cc`, unix(7) 108-byte `sun_path`) and shared memory in `/dev/shm` or memfd, neither of which cares whether TMPDIR is disk or RAM [medium confidence on the memfd detail]. Verdict: the `/var/tmp` blame was a guess made under the overload of that afternoon.

**F2. The "disk filled" memory does not match the record.** Temp was on disk for one day (10-01 to 10-02) and in `~/.akrogon/scratch` for one day (10-10 to 10-11, `3ae682f` to `2c3a0af`, moved for the 107-byte socket path, not for space). No `ENOSPC` or "No space left" appears in either repo's issues. Root is 930 GB with 693 GB free (`df -h /`). The nearest real event is the 657k-file node compile cache in `5b2f4d0`, which is file count, not disk full. Low confidence that any disk-full event happened; the operator may be remembering the compile cache or the September pre-akrogon `/tmp` state.

**F3. What is in leaf temp right now (daytime, 4.8 GB, `du -sh /tmp/akr-1000`).** Top-level entry classes under leaf scratch, by count: `tamdoma-hooks-spec-*` 113, `akrogon-io-*` 95, `va-*` 86, `akrogon-*` 36, `playwright-artifacts-*` 33, `access-gate-test-*` 17, `dist-link-*` 14, `run-*` 7, `bunx-1000-wrangler@4.143.1` 228 MB. All six `run-*` dirs with `.owner` have live pids. Overnight the same classes reached 20.8 GB in `/tmp/akr-1000` plus 7.4 GB in `/tmp/swi` (overnight-B F2). `/tmp/akr-<uid>` is explicitly skipped by `~/.local/bin/tmp-sweep:15`, and the `/var/tmp/akrogon-<uid>` loop at `:23` names the pre-10-11 root, so nothing ages leaf scratch today.

**F4. Three lifetimes exist, only two have owners.** Managed runs: `run-check` makes `run-*` under leaf temp and removes it in `finally` (`src/run-check.ts:151,199-201`); a killed wrapper leaves it for reconcile's dead-owner sweep (`src/reconcile.ts:418-432`), and run-units adds a guard unit that stops the scope within `TimeoutStopSec=5` (worktree `src/scope.ts:52,62-77`). Leaf scratch: removed by reconcile when the tab is gone and no pane sits inside (`src/reconcile.ts:433-447`), on the next `next` pass. Bare runs from seats and anything tests write at the top of `TMPDIR`: no owner. The seat's `TMPDIR` is the leaf dir itself, so every test the seat runs directly, every `bunx` install and every killed browser profile lands there and lives until the tab closes. This third class is the pile.

**F5. The fixed-path producers are all workarounds for a long TMPDIR that no longer exists.** `scratch-writer-isolation.test.ts:71-75` anchors at `/tmp/swi` because "the inherited TMPDIR can be a deep per-run root whose length overflows chromium's SingletonSocket". `page-measure.mjs:365-368` falls back to `/tmp/page-measure-*` when `tmpdir()` plus 57 bytes exceeds 107. Leaf temp is now 27 bytes, a run root 38 bytes (`src/config.ts:267-275`), so both guards never fire and both anchors are dead code. `/tmp/ftf-logs` is a seat's hand-chosen path (framework `flaky-test-fixes/implementation/report.md:44`), already covered by the skill rule "under `$TMPDIR`, never a fixed `/tmp/<name>`" (leaf-temp Q4).

**F6. `bunx` reinstalls per run because the install dir is keyed on TMPDIR.** Bun installs `bunx` targets into `$TMPDIR/bunx-<uid>-<pkg>@<ver>` and checks `node_modules/.bin` first (bun.sh/docs/cli/bunx, read 2026-10-14). The framework has no `wrangler` in `package.json` and no `node_modules/.bin/wrangler`, so every per-run TMPDIR downloads wrangler plus the 134 MB workerd binary again (`fixtures/csp-spine/scripts/live-worker-proof.ts:235`).

## 2. Where temp lives (D1)

Disk, short path: `/var/tmp/akr-<uid>/<4 hex>/<8 hex>` as in A's patch. Reasons: the only argument for RAM (F1) is refuted; tmpfs charges every leftover and every live working set to `akrogon.slice` shmem and host RAM (overnight-B F2: 34 GB shmem, 35 GB `/tmp`), while disk has 693 GB; systemd's own guidance puts large or long-lived temp in `/var/tmp` (systemd.io/TEMPORARY_DIRECTORIES, read 2026-10-14). The socket budget is unchanged: `/var/tmp` adds 4 bytes, 31 for a leaf, 42 for a run root, under the 62-byte bound measured on 10-01. Per-run `PrivateTmp` services were considered and foreclosed: scopes cannot namespace, user-manager `PrivateTmp` needs unprivileged user namespaces [unverified here], and it would only re-cover the run root that `finally` plus the guard already cover, while the pile (F4 class three) is seat-level, not run-level.

## 3. Who deletes what (D2)

A polling collector is the backstop, not the design. Ownership removes the problem class; the collector catches what ownership cannot see.

| Owner | What | When | Live test |
|---|---|---|---|
| `run-check` wrapper | its `run-*` root | `finally`, seconds after exit | n/a |
| run-units guard | scope of a killed wrapper | 5 s after the wrapper dies | `tail --pid` |
| reconcile | `run-*` with dead `.owner` | every `next` pass | pid alive on same `boot_id` |
| reconcile | whole leaf dir | first `next` after tab close | tab live or pane cwd inside |
| `tmp-sweep` (operator, hourly) | everything else: `/tmp/*` entries, and leaf-dir entries not named `run-*` | newest file older than the age | mtime of newest file in the tree |

Live and never deleted: a `run-*` whose `.owner` pid is alive on this boot, and a leaf dir whose tab is live or has a pane cwd inside. Both facts are already in reconcile (`src/reconcile.ts:65-67,429-443`). The collector does not need to learn them: it skips `run-*` entirely and uses age for the rest. Age for the rest is short, two hours, matching the existing `/tmp/*` rule at `tmp-sweep:16`: a bare test run or a browser profile untouched for two hours is dead, and a seat cache (`jiti`, `claude-<uid>`) is recreated on demand. That is the "very active" part the operator asked for, and it stays outside akrogon, as the 10-01 Q3 decision took ("no akrogon code").

The pile shrinks at the source as well: seats run checks through `akrogon run-check`, which gives them a per-run `TMPDIR` that dies with the run. The skills already say bare runs are not evidence; the implement and check skills should say bare runs also leave temp, one line each.

## 4. Framework producers (A1 to A4)

- **A1** Add `wrangler` as a framework devDependency so `bunx wrangler` resolves `node_modules/.bin` and never installs into TMPDIR (F6). Removes 228 MB per run and the download.
- **A2** Delete the `/tmp/swi` anchor and use `mkdtempSync(join(tmpdir(), 'swi-'))` (`scratch-writer-isolation.test.ts:71-78`). Delete the `/tmp` fallback in `page-measure.mjs:365-368` and let `makeRuntimeDir` throw when the budget is exceeded, so a long TMPDIR fails loudly instead of escaping cleanup. Both guards are dead under the 27-byte root (F5).
- **A3** Scratch repos and build trees (`csp-spine-*`, `site-*`, `cfm-*`, `tamdoma-hooks-spec-*`): each test that `mkdtemp`s must `rmSync` in `afterAll`, and browser launchers must remove their profile in a `finally`, not only in `closeBrowser` (`page-measure.mjs:392-396`). The framework test-cost leaves own this; it is their done-criterion, not akrogon's.
- **A4** `/tmp/ftf-logs` and similar: no code change, the skill rule exists; it belongs in the check-issue review bar ("evidence outside `$TMPDIR` or the leaf folder is a Fix").

## 5. A's unlanded change (D3)

Land it, with two additions. The patch (`fix-temp-diff-2.patch`) moves the root to `/var/tmp/akr-<uid>` and removes the new-tab wipe. The wipe removal is right: it was the 10-02 band-aid for the pile and it deleted a running check's root when a tab was recreated. Additions: (1) `tmp-sweep` gains a loop over `/var/tmp/akr-<uid>/*/*/*` excluding `run-*` at 120 minutes and drops the dead `/var/tmp/akrogon-<uid>` loop; (2) a one-time `rm -rf /tmp/akr-<uid>` after the last seat on the old root ends, which the reconcile pass will not do because the root moved. No disk-vs-RAM proof is needed before landing (F1), but P1 below records it.

## 6. Risks and proof

- **R1** Disk I/O slower than RAM for 0.9 GB build trees on btrfs. Mitigation: A1 and A3 shrink what is written; P1 measures.
- **R2** `tmp-sweep` at 2 h deletes a live bare run idle for 2 h. Accepted: nothing legitimate is silent for 2 h inside a 600 s tool budget, and the `/tmp/*` rule has run this way since 10-11 without a report.
- **R3** systemd-tmpfiles ages `/var/tmp` at 30 days per file (`/usr/lib/tmpfiles.d/tmp.conf`, `q /var/tmp 1777 root root 30d`). Harmless: everything is gone long before. A live leaf dir cannot be touched by it.
- **R4** `AKROGON_LEAF_TEMP_ROOT` tests and the socket-budget test change paths; A's diff already updates `tests/config.test.ts:872-878` and `tests/next.test.ts:4026`.

Proof of done:
- **P1** `bun run framework:verify` once on `/var/tmp` on a quiet host, wall time and pass count beside the 10-02 baseline (320 pass, 183 s for `test:cf-workers-deploy`). Green within 20% closes F1 for good.
- **P2** After one overnight: `du -sh /var/tmp/akr-1000` and `find /var/tmp/akr-1000 -mindepth 3 -maxdepth 3 ! -name 'run-*' -mmin +120 | wc -l` at 08:00 print under 1 GB and 0; `grep Shmem /proc/meminfo` stays near today's 6.5 GB.
- **P3** `ls /tmp/swi /tmp/page-measure-* /tmp/ftf-logs` prints nothing after the framework fixes merge.
- **P4** `ls /tmp/akr-1000/*/*/bunx-*` prints nothing after A1.

## Recommendation

Land A's `/var/tmp/akr-<uid>` change now, with the `tmp-sweep` loop for leaf-dir entries at two hours and the one-time old-root removal. The Chromium hang that justified RAM was overload, proven green on `/var/tmp` the same afternoon (F1). Ownership already deletes managed runs and leaf dirs; the hourly sweep is the only collector needed, and it stays the operator's script. Fix the four framework producers at the source (A1 to A4) in the test-cost leaves. No new akrogon collector, no caps, no kills.
