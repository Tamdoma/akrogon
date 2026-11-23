# Slot C map — `flake-zero` (`origin/main` `814a2387`)

## Summary

`slots/flaky-list.txt` contains **172 rows** (**133 unique test names**, all 5 intake tests are rows `#1–#5`). Cross-referencing `issues/verify-runs.jsonl`, the 89 surviving `issues/chart/*/direct/check-test-*.log` files, `git log` on `814a2387`, and parallel repro runs shows:

- **Only 7 rows in `flaky-list.txt`** (Groups A, B, C) **plus 2 additional active failures in today's verify logs** (`tests/run-units.test.ts:711` and `:960`, not yet flipped to green on the same tree when `flaky-list.txt` was exported) **still reproduce on `814a2387`**.
- **165 of the 172 rows** (Groups D–G) are historical: already fixed on `814a2387` (`8eef2d0b`, `dc426cd7`, `f2318498`, `16c85dae`, `fa3663e6`, `--max-concurrency=5`) or removed/renamed pre-`hc` tests that `akrogon flaky` never ages out.
- The user systemd manager on this host still holds **11,880 active `akrogon-*` slices** leaked by test fixtures (down from ~32,000 earlier today, and climbing on every test run without `71378d15`).

---

## 1. Root-cause groups (all 172 rows accounted for, disjoint)

### Group A — Leaked user-systemd leaf slices + short 3 s `shortStartProof` / 2 s `AKROGON_PANE_WAIT_MS` race
- **Count:** **3 rows** (`#1` `tests/hc-delivery.test.ts:415`, `#2` `tests/session-routing.test.ts:251`, `#3` `tests/session-reads.test.ts:211`; 6 flips — **3 of the intake's 5**). Latent exposure in `tests/hc-start.test.ts:171` (also uses `shortStartProof`) and any `window: 'open'` test via `AKROGON_PANE_WAIT_MS: '2000'`.
- **Root cause (`file:line`):**
  1. `tests/hc-fixture.ts:356-360` (`core.stop()`), `:348-355` (`core.discard()`), and `:56-67` (`sweepAbandoned()`) never stop the fixture's `akrogon-l*.slice` units. Empty slices accumulate in the user systemd manager (32,000 today; 11,880 right now), inflating `systemd-run --user --scope` from ~38 ms to 1.5–3.6 s.
  2. `tests/hc-fixture.ts:185` sets `shortStartProof = { AKROGON_START_PROOF_MS: '3000' }` (used at `tests/session-reads.test.ts:217,220`, `tests/session-routing.test.ts:257`, `tests/hc-delivery.test.ts:418`, `tests/hc-start.test.ts:171`). For `idle`/`trust` seats (which never prove start), `src/seat.ts:181-205` times out at 3 s while `systemd-run --scope` is still waiting on D-Bus; `src/seat.ts:333-339` then reads `/proc/<pid>/cgroup` still inside `hc`'s service and throws `seat outside its leaf scope` (exit 1; observed 28×/16×/6× in today's direct logs at ~3.2–3.9 s). `tests/hc-fixture.ts:248` similarly overrides `AKROGON_PANE_WAIT_MS: '2000'` against `src/seat.ts:222-232`.
- **Still reproduces on `814a2387`?** **Yes** under slice accumulation / full-suite load (passed 3/3 in a 6-file isolated run now that `systemd-run` is 38 ms at 11.8k slices, but each test run leaks more slices back toward the 3 s cliff).
- **Smallest root fix:**
  1. Land `session-flake` `71378d15` (`core.stop()` stops the core's leaf slices), extended so `core.discard()` (`tests/hc-fixture.ts:348-355`) and `sweepAbandoned()` (`:56-67`) also stop any fixture slices, and run a one-time cleanup of the host's 11,880 leaked test slices.
  2. Drop the 2 s override at `tests/hc-fixture.ts:248` (use product's 15 s or `WAIT_MS`). For `session-reads.test.ts:213` and `session-routing.test.ts:253` (neither tests start-proof timeout), use a confirmed mode or raise `shortStartProof` once `src/seat.ts:181-205` only checks start-proof after scope entry (or give `shortStartProof` headroom well above `systemd-run` latency so no test fails because of the budget).

### Group B — Fixed wall-clock sleeps & hardcoded short deadlines
- **Count:** **1 row** in `flaky-list.txt` (`#4` `tests/watch-timer.test.ts:876`, 1 flip — **1 of the intake's 5**; 8× in today's direct logs), **plus 1 active failure from today's logs** (`tests/run-units.test.ts:711`, 4× in today's logs), plus 2 latent siblings (`tests/watch-timer.test.ts:830`, `tests/run-units.test.ts:392`).
- **Root cause (`file:line`):**
  1. `tests/watch-timer.test.ts:999`: sleeps a fixed `await Bun.sleep(2600)` expecting `skills/watch-issues/scripts/timer.ts:136-138` to have booted and latched the initial transcript before `:1000-1004` overwrites the session record. Under full-suite load, `timer.ts` runs its first poll after 2.6 s, latches the **new** transcript as initial, and never exits (`waitFinished` times out at 90 s: `[95321ms]`). Same fixed-sleep pattern at `tests/watch-timer.test.ts:830` (`Bun.sleep(2500)`).
  2. `tests/run-units.test.ts:711` (`a killed run-check pair refuses the leaf's non-failed phase moves under the real run unit`, 4× in today's logs) and `:392`: hardcoded `Date.now() + 10000` missed by `f2318498`. Even on an idle host `:711` takes **6.25 s** (`TimeoutStopSec=5` + `systemctl` + `phase --check`), blowing past 10 s under load (`[10360ms]`).
- **Still reproduces on `814a2387`?** **Yes** under full-suite load (8× and 4× in today's logs; passed solo idle at 5.96 s and 6.25 s, confirming the thin margin).
- **Smallest root fix:**
  1. Log `[watch-timer] latched <path>` in `skills/watch-issues/scripts/timer.ts:137` on first latch; replace `tests/watch-timer.test.ts:999` (`Bun.sleep(2600)`) by polling `screenOf` for `latched`, and `:830` (`Bun.sleep(2500)`) by polling `screenOf` for `up:`.
  2. Replace `Date.now() + 10000` at `tests/run-units.test.ts:392` and `:711` with `Date.now() + WAIT_MS`.

### Group C — Missing readiness synchronization before acting on async systemd / verify-pass state (and one hardcoded systemd unit name)
- **Count:** **3 rows** in `flaky-list.txt` (`#5` `tests/run-units.test.ts:1373` [1 flip; 8× in today's logs — **1 of the intake's 5**], `#20` `tests/slow-merge.test.ts:272` [4 flips], `#60` `tests/run-units.test.ts:1184` [5 flips]), **plus 1 active failure from today's logs** (`tests/run-units.test.ts:960`, 4× in today's logs).
- **Root cause (`file:line`):**
  1. `tests/run-units.test.ts:1382-1386` (`#5`): `waitCheckRecord` returns as soon as the run record hits `runs/`, before `systemd-run --scope` loads the unit, so `stop-run` at `:1385` calls `systemctl --user stop` on an unloaded unit and exits 1. *(Already fixed on `lane-first` `d7190d49` with `await waitActive(record.unit as string)`.)* Same missing `waitActive` before `killTree` at `tests/run-units.test.ts:1198` (`#60`).
  2. `tests/run-units.test.ts:967-1015` (`a stale run record and unit are swept by the next run start`, 4× in today's logs): spawns `systemd-run --unit=akrogon-run-stale0 -- sleep 300` at `:967` **without `await waitActive(...)`** and uses a **hardcoded shared unit name** (`akrogon-run-stale0.scope` at `:974, 1004, 1007, 1015, 1022`). Under systemd load, `run-check` (`:1011`) calls `sweepStale()` before `stale0` finishes registering (no-op), then `stale0` activates and `:1015` `waitInactive` times out at 90 s (`[93207ms]`).
  3. `tests/slow-merge.test.ts:125-146, 279, 300-302` (`#20`): runs instant `echo unit`/`echo extra` checks while `backdate()` polls `verify-runs.jsonl` every 10 ms for `end === undefined` and rewrites it unlocked. When the pass finishes before `backdate()` polls, it throws `no open merge run to backdate` (seen in `land-own-reds` log).
- **Still reproduces on `814a2387`?** **Yes** (`#5` 8× and `stale0` 4× in today's logs; `#20` 4× on Nov 22 under load).
- **Smallest root fix:**
  1. Port `await waitActive(record.unit as string)` to `tests/run-units.test.ts:1384` (and `:1198`).
  2. In `tests/run-units.test.ts:967-1025`, use a unique unit name (`akrogon-run-stale-${randomUUID().slice(0, 8)}`) and `await waitActive(staleUnit)` before `spawnReal` (`:1011`).
  3. In `tests/slow-merge.test.ts:279, 300-302`, gate one check on a `ready`/`release` flag file (wait for `ready`, backdate, then touch `release`).

### Group D — Cross-fixture host `reconcileHost` interference on shared user systemd & `/var/tmp/akr-<uid>` (fixed on `814a2387`)
- **Count:** **11 rows** (`#19, #47` `tests/hc-identity.test.ts:67, 109` [10 flips], `#42` `tests/leaf-stop.test.ts:257`, `#48, #172` `tests/verify.test.ts:1261` [4 flips], `#49` `tests/release-any-phase.test.ts:528` [2 flips], `#51, #52, #54, #55` `tests/next.test.ts:3310, 504, 2616, 3236` [9 flips], `#53` `tests/hc-start.test.ts:119`).
- **Root cause (`file:line`):** Before `8eef2d0b` (2026-11-22 19:26) and `dc426cd7` (19:54), `src/reconcile.ts` (`reconcileHost`) stopped any empty `akrogon-l*.slice` on the shared user systemd manager and deleted unknown entries in `/var/tmp/akr-<uid>` across concurrent test homes; `tests/hc-start.test.ts:129` was further fixed by `fa3663e6`.
- **Still reproduces on `814a2387`?** **No** (0/3 on `hc-identity.test.ts`; fixed on `main` by `8eef2d0b`, `dc426cd7`, `fa3663e6`, `70f2ec12`). Note: `#54` (`tests/next.test.ts:2632`) did fail once on `lane-first` `f6c7ba4d` (Nov 23 01:14) during the 32k-slice slowdown; also `expect((await next(...)).code).toBe(0)` hides `stderr` on failure across `next.test.ts`/`session-*.test.ts`/`hc-delivery.test.ts`.
- **Smallest root fix:** Already landed; no further work beyond Group A's slice cleanup (optionally include `result.stderr` in `expect(res.code, res.stderr).toBe(0)` assertions when touching those tests).

### Group E — Door stand-in startup & wait-protocol races (fixed on `814a2387`)
- **Count:** **3 rows** (`#6, #7` `tests/door-reset.test.ts:271` `agy` [16 flips], `#58` `tests/door-exchange.test.ts:245` [1 flip]).
- **Root cause (`file:line`):** `tests/door-agent.ts` reported `working` before opening its sqlite transcript (slowest on `agy`), so `skills/chart-issues/scripts/door-reset.ts` saw `transcript unknown` and exited 1 immediately; `tests/door-exchange.test.ts:245` raced wait-end reads.
- **Still reproduces on `814a2387`?** **No** (fixed by `16c85dae`, `b8883869`, `816819ea`, `ced658fc`; 0/3 in parallel repro on `814a2387`, zero failures after `16c85dae`).
- **Smallest root fix:** Already landed.

### Group F — Unbounded concurrency & 30 s per-test timeout storms on Nov 9–22 (fixed on `814a2387`, with one residual env leak)
- **Count:** **40 rows** (`#8–#18, #21–#41, #43–#46, #50, #56, #57, #59`; 70 flips) — predominantly the single 2026-11-22T18:52:56 run (`31` of these rows, including 9 parameterized `named target equivalence` rows at `tests/next.test.ts:4061`) and 17:50:27 run (`5` rows).
- **Root cause (`file:line`):** All ran under the old check command `bun test --timeout=30000 --parallel=4 --no-isolate` (no `--max-concurrency=5`, 30 s cap) before `f2318498` (`--timeout=120000`, `WAIT_MS`), `8eef2d0b`/`dc426cd7`, and `48ede3e1`/`3a6ab3b5` (`#57` `hc-listener.test.ts:433` heartbeat skip + core restart).
  - **One residual env leak spotted in `#41` (`tests/next.test.ts:4498`):** `selfUpdateCli` at `tests/next.test.ts:4433-4443` spawns akrogon **without** unsetting `AKROGON_RUN` or prepending `unitBin(f)` to `PATH` (unlike `cli()` at `tests/helpers.ts:120-121`), so an enclosing `akrogon verify`/`run-check` leaks `AKROGON_RUN` into the child.
- **Still reproduces on `814a2387`?** **No** for the timeout storm; **latent** for `selfUpdateCli` env leak (`#41` failed once after `f2318498` at Nov 22 22:07).
- **Smallest root fix:** Add `AKROGON_RUN: ''` and `${unitBin(f)}:` on `PATH` in `tests/next.test.ts:4433-4443` (or delegate through `cli()`).

### Group G — Legacy pre-`hc` / pre-command-merge storms & removed/renamed tests (historical, Oct 17–Nov 8)
- **Count:** **111 rows** total:
  - **G1 (still on `814a2387`, 52 rows / 39 unique names, 65 flips):** `#63, #65, #68, #69, #73, #77–#79, #84, #91, #93, #100, #101, #104, #106, #115, #117, #123, #126–#128, #131, #133, #134, #137, #138, #141–#149, #151, #157, #158, #167, #171` (plus 12 older duplicate-name rows of `batch-dispatch`/`next`/`leaf-stop`/`leaf-slices`/`status`). All occurred in 4 batch storms on 2026-10-24, 2026-10-26, and 2026-11-08 under `--timeout=30000` before `hc` seats and `f2318498`; zero failures since.
  - **G2 (removed/renamed or unattributable, 59 rows / 37 unique names, 75 flips):** 36 test names that no longer exist on `814a2387` (deleted/rewritten during herdr→hc and seat-merge→command-merge: `tab_closed` hooks, `idle hook`, `pane` delivery errors, `solo merge prompt`) plus `#159` (`(log gone)` placeholder from `src/flaky.ts:60`).
- **Still reproduces on `814a2387`?** **No.**
- **Smallest root fix:** None in `tests/`; see Section 3 for `akrogon flaky` aging/filtering.

*(Row check: 3 + 1 + 3 + 11 + 3 + 40 + 52 + 59 = **172 rows**.)*

---

## 2. Prevention: keeping new and changed tests flake-free

### What akrogon already has
1. **Phase test freeze (`src/phase.ts:588-650`, `src/test-files.ts`):** Already tracks every test file added or modified on a branch (`state.frozen` + `Test-Change:` trailers). We already have exact changed-test-file detection.
2. **`akrogon flaky` (`src/flaky.ts:84-203`):** Already records every red→green flip (same tree, equal `patch_id` across merge heads, and `rerun` recoveries) from `issues/verify-runs.jsonl`. Currently passive and unfiltered back to Oct 17.
3. **`known-red` (`src/verify.ts:246-283`) and `rerun` (`src/verify.ts:653-695`):** Both are *bypass* mechanisms, not prevention. `issues/config.yaml` currently leaves `rerun` unset (good: `rerun` masks flakes at merge time).

### Options

| Option | Mechanism | What it catches | What it could break / cost later |
|---|---|---|---|
| **O1. Structural hygiene test in `tests/`** | One fast (<50 ms) test file in `tests/` scanning `tests/**/*.test.ts` & helpers for the exact root-cause patterns found here: hardcoded `--unit=akrogon-run-`, raw `Date.now() + <N>` (`< WAIT_MS`), `Bun.sleep(>=1000)` without an explicit `// allow-sleep:` comment, `hcCore`/`hcFixture` files missing `stopCoresAfterFile()`, and short `AKROGON_PANE_WAIT_MS` overrides; plus asserting in `tests/hc-fixture.ts` `core.stop()` that stopped slices actually went inactive. | Immediately blocks Groups A, B, and hardcoded-unit C at `bun test` time with ~0 ms cost and zero new tooling. | Low maintenance if limited to 4–5 sharp rules with an explicit comment escape hatch for legitimate negative-hold tests (e.g. `tests/budget.test.ts:388`). Over-broad lint rules cause noise; keep them tied strictly to proven flake classes. |
| **O2. Native stress-rerun of changed test files** | Run branch-changed test files (`git diff --name-only <base>...HEAD` filtered by `src/test-files.ts`) **5×** using Bun's native `--rerun-each=5` (with `--timeout=120000 --max-concurrency=5 --no-isolate`, never tightening timeout) in `check-issue` / `implement-issue` (or an `akrogon verify` check). | Catches timing races, missing `waitActive`, and state leaks in any new/edited test *before* merge (would have caught `watch-timer:999`, `door-reset` agy, `stale0`, `run-units:1386`, `slow-merge:272`). | Cost scales with changed test files; a repo-wide refactor touching 30+ test files (like `f2318498`) would take minutes unless capped (e.g., skip or cap at N files / let `check-issue` run it on new/edited tests). Doesn't catch cross-file collisions between an untouched test and a new one. |
| **O3. Active `akrogon flaky` feedback loop (no `rerun`, narrow `known-red`)** | Keep `rerun` disabled in `issues/config.yaml`, add `--since <sha|date>` / live-only filtering to `akrogon flaky`, and require `check-issue` / landing to seed/fix any newly observed flip rather than covering a flaky test with `known-red`. | Prevents silent flake accumulation on `main` and makes `akrogon flaky` immediately actionable (0 rows = clean). | Blocking *unrelated* merges on a single existing flake stalls the whole queue; treat flips as immediate-fix seeds rather than a global merge halt. |
| **O4. Full-suite N× soak on every merge** | Run the full 70-file suite 3–5× on every land. | Catches cross-file flakes on every PR. | 10–15 min per land, heavy host CPU/memory; violates fast/low-cost landing. Only worth running once manually to certify `flake-zero` at exit. |

### Recommendation
**O1 + O2 (lightweight) + O3:**
1. **O1 (always-on, native, ~50 ms):** Add one `tests/test-hygiene.test.ts` enforcing the 4–5 concrete structural invariants from Groups A–C, and enforce slice cleanup in `tests/hc-fixture.ts`.
2. **O2 (targeted, native):** Use Bun's native `bun test --timeout=120000 --max-concurrency=5 --no-isolate --rerun-each=5 <changed test files>` as a required step in `check-issue` / `implement-issue` whenever a branch adds or edits test files (keeps the full 120 s budget — zero budget failures — and costs seconds for normal 1–3 file leaves).
3. **O3 (zero-masking):** Keep `rerun` off in `issues/config.yaml` and never normalize flakes via `known-red`; use `flake-zero`'s exit soak (e.g., 5 consecutive full-suite runs green with 0 leaked slices) to prove zero flakes on `main`.

---

## 3. Items that should be separate charts (or coordinated with existing branches)

1. **`akrogon flaky` live/aging view (`src/flaky.ts`):** Separate product-CLI chart. Right now `akrogon flaky` mixes 59 deleted/renamed tests and 106 historical pre-fix flips with the 7 live flakes, making the readout noisy once `flake-zero` finishes. Adding `--since` / filtering to tests still present (or flips after the last commit touching the test) keeps `akrogon flaky` meaningful long-term without rewriting `issues/verify-runs.jsonl`.
2. **Production `startSeat` scope-entry ordering (`src/seat.ts:181-205, 333-339`):** Optional small product fix if slow user-systemd startup can happen outside tests — waiting for scope entry before starting `START_PROOF_MS` (or checking cgroup only after the process execs out of `systemd-run`) prevents a slow manager from killing a live seat as `seat outside its leaf scope`.
3. **Coordination with active branches (avoid duplicating work):**
   - `session-flake` (`71378d15`): already adds leaf-slice cleanup to `core.stop()` in `tests/hc-fixture.ts` — extend with `discard()`/`sweepAbandoned()` cleanup and clear the host's existing 11,880 leaked slices.
   - `lane-first` (`d7190d49`): already adds `await waitActive(record.unit as string)` to `tests/run-units.test.ts:1384` — keep `stale0`, `:392`/`:711`, and `:1198` in `flake-zero`.
