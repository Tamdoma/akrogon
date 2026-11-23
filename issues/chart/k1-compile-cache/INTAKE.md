# Intake: k1-compile-cache

## Scope

Land, check and verify runs never write a Node compile cache: NODE_DISABLE_COMPILE_CACHE=1 is set once in run-check's always-set child env and the land unit env, and the copy-if-set and verify forward are gone.

Covers: #148 K1 (released alone before P1, rebuttal B R9). #148 stays open until run-scratch lands. Opening map and picks: issues/chart/lean-akrogon/slots/map-merged.md (with map-B.md, map-C.md, rebuttal-B.md, rebuttal-C.md, history-reversals.md).

## Provenance

- GitHub: Tamdoma/akrogon#148
- Operator: /chart-issues 2026-11-22T17:54Z, verbatim in issues/chart/lean-akrogon/INTAKE.md

## Source: Tamdoma/akrogon#148

# Leaf run scratch lives on disk-backed /var/tmp and red runs keep their whole folder: 51 GB kept, 163 s tree removals time out framework lands, land runs leave ~340 MB compile cache each

Source: Tamdoma/akrogon#148
URL: https://github.com/Tamdoma/akrogon/issues/148

Origin repo: Tamdoma/akrogon

Unverified intake.

## Operator decision (Ivan Juras, 2026-11-22)

- Run scratch moves to RAM (tmpfs). Do not move it as things are today: first stop run folders from piling up, then move to RAM.
- Goal: the setup that makes merges on this PC fastest overall, with the fewest failures, without overloading the host.
- This was filed after both watch consultants (Claude Fable, agy) agreed on the shape. Their plan is in the background section below and is not locked.

## Observation

Measured on 2026-11-22 on the operator's host (123 GB RAM, 62 GB tmpfs `/tmp`, `/` is btrfs `compress=zstd:3` on dm-crypt) by the framework watch case `~/.akrogon/watch/framework/consults/repair-round-bound-1/` (turn-3-agy.md, turn-11-fable.md, turn-8-fable.md):

- `/var/tmp/akr-1000` held 51 GB (btrfs-allocated; 35.0 GB apparent). 29.4 GB (84%) was in 214 `run-*` folders marked `.akrogon-kept` (red runs). 3.6 GB was in the 2 live runs. Every framework folder mapped to an open leaf. This was not merged-leaf leftovers.
- Inside kept red runs: `verify-history-free-*` 7.65 GB, `node-compile-cache` 4.82 GB (325-474 MB per red verify), `fixture-*` 4.23 GB, `akrogon-suite-*` 4.41 GB, `astro-baseline-migration-*` 2.74 GB, `landing-chain-proof-*` 2.72 GB. The human-readable evidence is usually under 5-50 MB per run. One kept folder of 1.58 GB and about 127,000 files is 156 MB as one zstd archive once `node_modules`, the compile cache, `.git` and Chromium folders are left out.
- Removing one 55,241-file site install took 163 s under `/var/tmp` during a framework land run. The same removal took 0.3 s on tmpfs at host load 113.
- Teardown hooks removing trees on disk were 6 of 20 failing units in one framework verify and 16 of 29 in another. These were all timeouts, with no assertion failure.
- One `framework:verify` run folder peaks at 11.0 GB and 580,149 files (sampled every 40-60 s) and ends at 1.6 GB. The files are full copies (link count 1).
- Run folders hold Chromium `.org.chromium.Chromium.*` files (38 in one live run), so Chromium's shared memory sits on btrfs over dm-crypt.
- Seatless land runs leave `node-compile-cache` (about 340 MB per run) in TMPDIR.

## Location

- `src/config.ts:359-374` (`leafTempRoot` fixed at `/var/tmp/akr-<uid>`, override `AKROGON_LEAF_TEMP_ROOT`; `retiredLeafTempRoot` is `/tmp/akr-<uid>`, which the host sweep deletes)
- `src/run-check.ts:44,62-76` (env), `:440,455-456` (`.akrogon-kept` on nonzero exit, from 980e92b2 / #145)
- `src/seat.ts:299` (`NODE_DISABLE_COMPILE_CACHE=1` for seats only), `src/land.ts:38-42`, `src/verify.ts:879` (only forward it)
- `src/scope.ts:70` (`startRunGuard`), `src/reconcile.ts` (sweeps)
- systemd `akrogon.slice`: `MemoryHigh=64G`, `MemoryMax=96G`, `MemorySwapMax=0`
- Read in installed release `~/.akrogon/releases/fdc5acdd4ea4/src`. Its `src/` matches the akrogon checkout per agy, but this was not diffed by the watch.

## Reproduction

Run framework leaves and lands for a day with `max_active` 9-12. `du -sh /var/tmp/akr-1000` grows by about 1.6 GB per red run. Under load, framework teardown hooks that remove site installs or skills copies time out, and the land goes red.

## Expected behavior

Test scratch costs little to create and remove. Red-run evidence stays readable without keeping multi-GB trees. Temp never piles up into RAM or disk pressure.

## Urgency

High. Slow tree removal on disk is a main source of framework land reds (Tamdoma/akrogon#147, 12 of 13 lands red on 2026-11-22). Workaround in framework: smaller copies and explicit hook timeouts (framework 81731f5c46, 3082fabc72). Simply pointing `AKROGON_LEAF_TEMP_ROOT` at tmpfs today would add about 30 GB of unswappable shmem to `akrogon.slice` and repeat the 2026-10-14 fault (c6981701).

## Suspected cause

- Main: run TMPDIR sits on btrfs+zstd+dm-crypt, where per-file create and unlink is slow (c6981701 moved it there on 2026-10-14 because leftover tmpfs files counted as slice memory and held admission closed. That admission memory reading was dropped the same day, `src/admission.ts:224`).
- Contributing: 980e92b2 keeps the entire red run folder until the leaf closes, so neither placement is cheap. Land runs do not set `NODE_DISABLE_COMPILE_CACHE`.
- History: 5b2f4d0f (2026-10-02) had moved temp to RAM because disk temp made headless Chromium captures hang.
- Whose view: agent (watch and both consultants).
- Not inspected: how often kept red folders are actually read by fixers (access times are polluted by sweeps). The peak of leaf-scope checks other than a full verify.
- Related reports: Tamdoma/akrogon#147 (open, land reds and run admission; the load half), #145 (closed, introduced keeping red run temp), #49 (closed, leaf TMPDIR on disk). Searched Tamdoma/akrogon all states for "tmpfs temp" and "compile cache", plus the account's issues since 2026-11-20.

## Proposed, not decided (watch consultants Claude Fable and agy, 2026-11-22)

Both agree on the shape. Where they differed, Fable's sizing and archive are written here, and agy's alternative is noted.

1. K1, do first and alone: set `NODE_DISABLE_COMPILE_CACHE=1` in every run env (run-check, land, verify), not only in seats.
2. K2: the run-folder TMPDIR of checks, verifies and lands goes on tmpfs under a root other than `/tmp/akr-<uid>` (that name is the retired root the host sweep deletes, unless that is changed). Leaf and seat temp, logs and evidence stay on disk.
3. K3: always remove the tmpfs run folder at run end, green or red. On red, first write one `tar | zstd` archive of the folder (without node_modules, compile cache, .git and Chromium profiles) next to the check log. Keep the newest two per leaf. agy's alternative: an `AKROGON_EVIDENCE_DIR` on disk that tests write evidence into. Fable prefers the archive because it needs no framework change.
4. K4: size admission by scratch space. A verify-scope run starts only when tmpfs has about 12 GB free inside a run-scratch budget of about 36 GB (three full verifies). This is based on the measured 11 GB peak, not the end size.
5. K5: the run guard and reconcile remove orphan run folders when the owner is gone.
6. K2, K3 and K4 ship together. K2 alone repeats the October fault.
7. Framework side, separate: shrink the per-test full clones and site installs (peak 11 GB, predicted under 4 GB), and make tests remove what they create.
8. Predicted, not measured: tmpfs use stays inside the budget under `MemoryHigh=64G`, Chromium capture hangs stop, and teardown-hook timeouts stop.

