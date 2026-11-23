# Load-timeout & host-wide line check (slot C)

## Live measurements on this host (32 cores, 123 GiB RAM, 2026-11-22 20:49–20:53)

- Baseline host state: load `48.5–64.0`, CPU PSI `some avg10=16.86%`, **IO PSI `some avg10=17.74%, full avg10=8.20%`** (8.2% full-system I/O stalls). `user@1000.service/cgroup.subtree_control` = `cpu memory pids` (no `io`); `akrogon.slice/cgroup.subtree_control` = `memory pids` (no `cpu` until a child sets `CPUWeight=`/`CPUAccounting=yes`).
- **`bunfig.toml:4` + `issues/config.yaml:9` multiplication:** `concurrentTestGlob = "**/*.test.ts"` enables Bun's default `--max-concurrency=20` *per worker* across `--parallel=4 --no-isolate` = **up to 80 concurrent subprocess-heavy tests inside one `akrogon` verify** (each spawning `git` + `bun` + `hc` + `systemd-run`). Example: `tests/next.test.ts:4057-4082` runs 9 `named target equivalence` tests concurrently (each creating **2** `HcFixture`s = 18 `hc` daemons + 36 `next` calls at once) under a hardcoded `15000` ms timeout (`:4082`).
- **Live benchmark — `tests/next.test.ts` (200 tests, 1,670 expects, 1 worker, `/home/ivan/.akrogon/worktrees/akrogon/land-own-reds`):**
  - `--max-concurrency=20` (load `48.5→50.9`): wall `14.97 s`, max test **`7,180 ms`** (top 5: `7.2, 5.9, 3.7, 3.4, 3.3 s`).
  - `--max-concurrency=4` (load `50.9→64.0`): wall `43.42 s`, max test **`4,595 ms`** (top 5: `4.6, 4.0, 2.8, 2.8, 2.6 s`) — **36% lower peak per-test latency even as host load rose from 51 to 64**.
  - `--max-concurrency=2` (load `64.0→52.1`): wall `72.36 s`, max test `4,625 ms` — no further per-test gain over `mc=4`, 1.7x worse wall time.
- **Live benchmark — `tests/hc-delivery.test.ts` (10 tests, load `52–58`):** `mc=20` `15.23 s` (max `15.17 s`), `mc=4` `17.67 s` (max `15.30 s`), `mc=1` `35.32 s` (max `15.45 s`) — confirms one test inherently sits at ~15 s (start-proof / wait bound), leaving minimal headroom under `--timeout=30000` once contention doubles wall time.

---

## Q-a. What removes the load-timeout failure class entirely?

A test times out iff `work × contention_multiplier (CPU + IO) > clock_cap`. No single knob fixes all three terms, but each plays a distinct role:

1. **Host-wide cap on concurrent heavy runs (highest-leverage single akrogon change):** Today `src/admission.ts:179` queues `full` runs *per repo only*. Four active repos (`framework`, `akrogon`, `game`, `blepsis`) can run 4 suites simultaneously (4 × 80 = 320+ concurrent tests), pushing load from ~20 to 80+ and inflating 4.6 s tests past 15–30 s. Capping host-wide heavy runs to `N` sized from host cores bounds the cross-repo contention multiplier on **any PC**. *Breaks:* if `N=1` on a 32-core PC, creates head-of-line blocking (C3); solved by `N = max(1, floor(cores / 12))` (see Q-b).
2. **Bound suite parallelism × in-file concurrency (`issues/config.yaml:9`):** Replacing implicit `--max-concurrency=20` with `--parallel=4 --max-concurrency=4` (16 concurrent tests instead of 80; or `parallel = clamp(floor(cores/8), 1, 4)` × `mc=4`) eliminates the self-inflicted 80-way fork storm inside a single `akrogon` verify without tripling wall time (16 concurrent tests across 88 files still use available cores cleanly). *Breaks:* going below ~4 concurrency per worker (`mc=1–2`) inflates wall time 3–5x with zero latency benefit.
3. **Event-driven waits + removing tight sub-timeouts (`tests/hc-fixture.ts:270`, `tests/next.test.ts:4082`):** `hc-fixture.ts:270` (`waitFor`) is *already* event-driven (`hc events --json`), using `15_000 ms` only as a cap. Removing tight per-test overrides (`tests/next.test.ts:4082` `15000` ms) and aligning inner wait caps with the suite timeout stops false trips during brief spikes. *Breaks:* alone, this only raises a number (a stalled host still trips 60 s) and slows real-deadlock detection.
4. **Host CPU weights (`lane-first` current destination):** Helps land beats leaf CPU inside `akrogon.slice`, **cannot remove timeouts alone**: (a) live IO PSI is `8.2% full` and `io` is not delegated in cgroups (CPU weights cannot fix disk/btrfs stalls — `run-scratch` tmpfs does); (b) `akrogon.slice` `CPUWeight=20` still caps the whole subtree at 16.7% against `app.slice` `100`; (c) leaf verifies (which also produce F-load timeouts and block `implement → check.review`) get *lower* CPU share, not higher.

**Bottom line for Q-a:** Removing the class requires **(1) host-wide heavy-run cap `N` + (2) bounded per-suite concurrency (`--max-concurrency=4`) + (3) tmpfs `run_root` (`run-scratch` kills IO PSI)**. Removing tight `15000` ms overrides is cheap cleanup on top.

---

## Q-b. One host-wide line vs per-repo only vs per-repo + host-wide cap `N`

| Scenario | (i) Per-repo only (today, `admission.ts:179`) | (ii) One host-wide line (`N=1`, reverted in C3 `20455420`) | (iii) Per-repo lines + host cap `N = max(1, floor(cores / 12))` with land priority |
|---|---|---|---|
| **11-min `framework` suite ahead of 4-min `akrogon` land** | Both run; repos 3–4 also pile on → load 60–80 → `akrogon` land times out & bounces (15+ min lost). | **Head-of-line block:** `akrogon` land waits up to 11 min while 20+ cores sit idle (exact C3 same-day revert cause). | On 32 cores (`N=2`): `akrogon` land starts **immediately** in slot 2 beside `framework` (~4 min) while repos 3–4 wait instead of melting the host. |
| **Two seats' leaf verifies** | Same repo serialized (`admission.ts:186`); 2 repos run concurrently, plus repos 3–4 unbounded. | Serialized even across 2 repos on 32 cores; seat 2 idles 11 min. | Same repo serialized (1/repo); 2 different repos run together up to `N=2`; a 3rd waits briefly. |
| **Land waiting behind leaf work** | Same repo: finishes 1 running leaf check, then `holding` (`admission.ts:182-184`) jumps ahead of waiters. Other repos' leaf checks keep starting beside the land. | Waits behind whichever leaf verify started first on *any* repo; then freezes all other repos. | Same repo: unchanged. Cross-repo: **land-owned waiters jump ahead of leaf waiters** in the host queue, so a land waits at most for 1 active slot to open, never behind a leaf-verify backlog. |
| **8-core PC (16–32 GB RAM)** | **Overloads PC:** 2–3 repos × 80 tests = 160–240 procs on 8 cores → mass timeouts, frozen desktop. | Safe (`N=1`), no overload. | `max(1, floor(8 / 12))` = **`N=1` automatically** (Signpost 2: any PC without manual config!). |

**Implementation catch on `main` (`src/land.ts:188-190`, `src/run-check.ts:351`, `src/admission.ts:149`):**
- `land` records have `land: true, full: false`, and `framework`'s `merge_checks` (`verify`) is **not** in `repo.config.full` (`history-reversals.md:58`).
- A host cap counting only `record.full` would **miss `framework` land runs completely**! The host cap must count **`record.full || record.land === true`** (1 slot per repo: a `land` holds 1 host slot and its own attempt's child checks nest inside that slot without taking a 2nd slot).
- Replaces per-repo `line-<repo>` lock (`src/admission.ts:164`) with one `line-host` lock (~15 lines in `awaitTurn`, `:171-205`): **net zero new moving parts** and strictly fewer lock files.

---

## Q-c. Does `lane-first`'s current destination still fit, or should it change?

**Keep all three existing pieces, and expand `lane-first` to include the host-wide cap `N` (and akrogon's test concurrency fix):**
1. **Keep** `akrogon-land.slice` higher `CPUWeight` inside `akrogon.slice` — still needed so a land beats concurrent seats, non-`full` checks, and the other `N-1` running slot (and setting `CPUWeight=` on a child activates systemd's missing `cpu` controller under `akrogon.slice`).
2. **Keep** host-relative slice memory (`MemoryHigh=55%`, `MemoryMax=75%` replacing hardcoded `64G`/`96G` at `systemd/akrogon.slice:7-8`) — mandatory for any PC.
3. **Keep** per-repo merge-waiter backpressure — controls WIP, rebase staleness, and worktree count (which admission control alone does not cap).
4. **Add** the **(iii) host-wide heavy-run cap `N = max(1, floor(cores / 12))`** (counting `full || land`, land priority over leaf waiters, 1/repo per-repo rule preserved) in `src/admission.ts:164-205`. On 32 cores `N=2` avoids C3's `N=1` head-of-line pain; on <=11 cores `N=1` protects small PCs automatically.
5. **Add** `--max-concurrency=4` to `issues/config.yaml:9` and drop the hardcoded `15000` ms sub-timeout in `tests/next.test.ts:4082` (and seed `framework` to bound its own internal test concurrency too).
