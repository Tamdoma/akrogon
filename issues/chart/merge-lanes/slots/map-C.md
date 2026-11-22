# Territory map: merge-lanes (slot C)

Date: 2026-11-21. Grounded in akrogon `HEAD` `1502fbdf`, framework ledgers (`2026-11-14T00:00:00Z`–`2026-11-21`, 248 merge attempts, 364 completed merge verify runs, 201 merged leaves), live `akrogon status` / `akrogon.slice` state, and practitioner sources read 2026-11-21.

---

## 1. Lock 5a (failed merge leaves the line at once; retest/repair off-line)

### Code changes & every consumer of altered state

Today a holder is pinned at the head of `mergeQueue` by `state.batch !== undefined` (`src/turn.ts:120`), and `land.ts:67-80` (`handOff`) keeps `batch` while flipping `owner: 'seat'` and waking B on the line. Evicting on failure changes who holds `state.batch`, how a leaf enters/exits off-line work, and when `mergeTurn` advances to the next holder:

- **Primary code surfaces**:
  - `src/land.ts`: `handOff` (`:67-80`) and `land` (`:82-109`) — instead of keeping `batch` with `owner: 'seat'` on `wake=red|gate|push|rebase`, record the attempt (`red` in `merge-attempts.jsonl`), release the line hold (`batch` cleared or line-holder separated from off-line handoff state), trigger off-line seat B dispatch, and call `mergeWake` so the next queued leaf starts immediately.
  - `src/next.ts`: `mergeTurn` (`:922-1043`) — mechanical rebase failure (`!staged.ok || !applyTop`, `:1024-1027`) currently leaves `batch` applied with `owner: undefined` (`solo`), blocking the line while B rebases by hand; under 5a this should also release the line or follow the conflict-eviction fork. `reconcileBatch` (`:862-920`) & `mergePass` (`:1104-1125`) — `mergePass` loops only while the old holder left `phase === 'merge'` (`:1119-1121`), so if an off-line leaf stays in `phase: 'merge'` (substate instead of a new phase), `mergePass` must loop on holder-slug change, not only phase exit! `dispatchLeaf` (`:751-754`) — currently blocks every non-holder in `phase === 'merge'` with `recordWait(..., 'merge_turn')`; off-line triage/repair leaves must be dispatchable without being `mergeQueue[0]`.
  - `src/turn.ts`: `mergeQueue` (`:105-131`) — excludes leaves currently in off-line triage/repair from queue eligibility so `mergeQueue[0]` immediately promotes the next waiting leaf.
  - `src/phase.ts`: `phaseCommand` (`:921-949`) — currently refuses `check.fix` (and `merged`) for any `phase === 'merge'` leaf that is not `mergeQueue[0]` (`:921-929`) and checks `attempt !== record.attempt` (`:934`). An off-line leaf moving `merge -> check.fix` (or re-entering `merge`) must NOT be refused for no longer being `mergeQueue[0]`, and must not double-append `merge-attempts.jsonl` (`:945`). `commitMove` (`:216,230`) — controls `batch` retention on `failed -> merge` and `merge_stamp` reset on re-entry.
  - `src/verify.ts`: `verifyCaller` (`:448-455`) — `--attempt <id>` finds the leaf by `state.batch?.attempt === attempt && state.phase === 'merge'`; once `batch` clears on eviction, off-line `verify` (if any) or `akrogon log` reads must not depend on an active `batch.attempt` on the line.
  - `skills/merge-issue/SKILL.md` (`:31-76`) & `skills/merge-issue/lifecycle-rules.md` (`:21-25`) — currently instruct B to hold `--attempt <id>`, rerun full `akrogon verify --attempt <id>` and `--known-red`, and call `akrogon phase <slug> merged --slot B --attempt <id>`.
- **All state consumers that rely on `state.batch`, `mergeQueue`, `phase`, or `merge_stamp`**:
  - `src/status.ts`: `scanRepo` (`:115`, calls `mergeQueue`), `note` (`:191`, `'land'` badge from `batch.owner === 'command'`), `landAttempt` (`:214`), `leafAttention` (`:602`, `'merge job stopped'` when `!alive && !recorded`), `leafJson` (`:616-633`), `statusCommand` (`:764-766`). Must render off-line triage/repair leaves distinctly from queued waiters so operators see why a leaf is not holding a `TURN`.
  - `src/reconcile.ts`: `reconcileNeedsPanes` (`:462`), `mergedWorktree` (`:769`), main loop (`:805,812,838`) — uses `state.batch !== undefined` to keep worktrees (`'state.batch'`), and `src/leftovers.ts:16` treats `'state.batch'` as in-use. Clearing `batch` on eviction is safe for an unfinished leaf because `reconcile.ts:867-869` keeps any non-`merged`/non-`failed` worktree under `store` as `'active leaf'`.
  - `src/stop.ts:83` — `akrogon stop --all` selects `(tab !== undefined || batch?.owner === 'command') && phase !== 'merged'`. Safe if off-line leaves have a tab or active phase.
  - `src/run-check.ts:156` — `leafFields` attaches `state.batch?.attempt` to timing rows (`check_start`/`check_end`).
  - `src/timing-report.ts:73,176,360-362` — `visitsOf` infers `seatless` from `to === 'merged' && slot === null`; `cohortReport` counts `merge-attempts.jsonl` `outcome === 'red' | 'ejected'` as ejections (so evicting on red records one `'red'` attempt, keeping cohort accounting accurate — watch against double-logging!).
  - `src/routing.ts:2-11,40` — if a new phase (e.g. `merge.triage`) is added, `phaseSchema`, `historicalPhaseSchema`, `routing`, `status.ts:292` `phaseColor`, `timing-report.ts`, and `skills/` all parse it.

### Relation to open leaf `failed-merge-resume`

`/home/ivan/Work/infra/akrogon/issues/open/watch-consultants/failed-merge-resume/brief.md` (currently in `implement`, `akrogon status` 2026-11-21) fixes a leaf that entered `failed` from `merge` while holding `batch: {applied: true, owner: 'seat'}` without a candidate, then moved `failed -> merge` after `main` advanced (`src/phase.ts:216` keeps `batch`; `src/next.ts:873` returns early without candidate).
- **Interaction**: Under 5a, a red merge clears `batch` (releasing the line) rather than leaving `applied: true, owner: 'seat'` on the line. However, a leaf can still move `merge -> failed` while `land` owns `batch` (operator `failed` on a hung `land`, or `refuseEnclosingCompletion` in `phase.ts:159-186`), and both efforts touch `phase.ts:216`, `next.ts:862-920` (`reconcileBatch`), and `next.ts:922-1043` (`mergeTurn`).
- **Verdict**: `merge-lanes` does not change `failed-merge-resume`'s scope, **must wait for or rebase cleanly over `failed-merge-resume`**, and must preserve both of its done-criteria (1: stale `applied: true` without candidate rebases onto new base; 2: failed holder with landed candidate still reconciles without run/push) as well as ensuring any new off-line handoff state is cleared on `failed -> merge`.

### Forks inside Lock 5a

1. **Fork 5A-1 — What "off the line" is (routing & token cost)**:
   - **Option (a) — Dedicated off-line triage/repair state for seat B** (either a `merge_off` / `handoff` record on `state.yaml` excluded from `mergeQueue`, or an explicit phase e.g. `merge.fix` / `merge.triage` routed to slot B with `next: ['merge', 'check.fix', 'failed']`):
     - B reads the failed `land` log off-line while the next leaf runs `land`, diagnoses flake vs base-red vs mechanical fix vs leaf defect, and either re-enters `merge` (after mechanical fix or flake confirmation) or moves to `check.fix` (slot A).
     - Preserves Lock 1a's hard limit ("token cost does not grow"): the **60 of 103** `wake=red` attempts (58%) that were flakes (40), known-reds (12), or mechanical B fixes (8) never wake slot A or incur an extra `check.review` roundtrip.
     - Explicit phase vs substate on `merge`: an explicit phase reuses `routing.ts`, `phase.ts`, `log.jsonl`, `timing-report.ts` visit accounting, `status.ts`, and `dispatchLeaf` cleanly with zero special-casing in `mergePass`/`dispatchLeaf` — at the small cost of one new enum value in `routing.ts`. A substate inside `merge` avoids a new phase enum but forces every `merge` consumer (`mergeQueue`, `mergePass`, `dispatchLeaf`, `phaseCommand`, `status.ts`, `timing-report.ts`) to branch on it.
   - **Option (b) — Evict straight to `check.fix` (slot A) on every red**:
     - Zero new phase/state. **Pitfall**: bounces all 40 flakes + 12 main-red + 8 mechanical B fixes through slot A (`implement-issue`) + slot B (`check.review`), directly violating Lock 1a ("token cost does not grow") and adding ~5.4m median off-line A+B turnaround (measured from 47 `merge -> check.fix -> merge` cycles since 2026-11-14) to every flake.

2. **Fork 5A-2 — Where off-line retest runs (CRITICAL COLLISION WITH LOCK 2a)**:
   - Today `framework/issues/config.yaml` has `full: []` (verified 2026-11-21; host-wide `full` `861d0e4e` was reverted in `20455420`; per-repo `full` `6a29a6db` is configured only in `akrogon`).
   - If Leaf X leaves the line under 5a, Leaf Y starts `land` (`bun run framework:verify`) immediately, **and** X's off-line B runs `akrogon verify` (full suite) or `--known-red` (base full suite): **two full suites run concurrently, violating Lock 2a** before N2 passes!
   - **Worse (practitioner pitfall — stale-base invalidation)**: Even if serialized by `full: [verify]` in `admission.ts:147`, an off-line full-suite retest on X's old `built_on` is **almost always wasted** whenever the queue is non-empty: by the time X finishes a 5–12m off-line full verify, Y has landed and moved `origin/main`, so X's off-line receipt is non-fast-forward and cannot be pushed without rebasing and re-running the full suite AGAIN (same reason GitHub Merge Queue and GitLab Merge Trains discard/re-test evicted PRs on fresh HEAD on re-entry; GitHub Docs & GitLab Docs read 2026-11-21).
   - **Option (a) — Off-line narrow repro only (`run-check` on the failing test/script + `cheap`), full verify runs ONLY on the merge line on re-entry**:
     - Never triggers a 2nd concurrent full suite (100% Lock 2a compliant regardless of N2).
     - Matches Chromium CQ's isolated single-test retry pattern (Chromium infra docs read 2026-11-21): B runs the failing file/script in seconds; if green -> flake -> re-enter `merge`; if mechanical fix -> commit + narrow repro + `cheap` -> re-enter `merge`; if leaf bug -> `check.fix` (eliminating the **23 wasted full verifies / 3.87h** B ran before `check.fix` bounces since 2026-11-14!).
     - **Pitfall**: A load-only flake or cross-test regression from a mechanical fix is only caught after re-entry on `land` (paying a second line pass).
   - **Option (b) — Allow off-line full `verify`, gated by `full: [verify]` in `admission.ts` when 2a=1**:
     - Prevents PC overload, **but** an off-line full verify queues inside `lineLock` (`src/admission.ts:141`) *in front of* the next `land` (blocking the line indirectly!) AND still produces a stale-base receipt if any leaf landed ahead of it.

3. **Fork 5A-3 — Re-entry queue order (`merge_stamp`) & thrashing prevention**:
   - Today `src/phase.ts:230` overwrites `merge_stamp` on every entry into `merge` (settled in `merge-turn/forks/turn-release.md` Q3 3a, 2026-10-05).
   - Under Lock 1a (first entry into `merge` to landed, failed rounds included): >1-entry leaves had median **90.7m, p90 294.2m, max 493.0m** vs 1-entry median **63.0m, p90 197.7m**; today `checker-command` sits at **11h05m** (`fix rounds 3`, TURN 5).
   - **Option (a) — Preserve original `merge_stamp` on re-entry from off-line triage (flake/conflict/mechanical fix), bounded by a cap (e.g. 2 priority re-entries), then back of queue**: cuts Lock 1a tail latency and stops stale-base conflict compounding for leaves evicted through no fault of their own, while the cap prevents a broken/chronically flaky leaf from thrashing at the head of the queue and starving healthy leaves (classic priority-inversion pitfall in Bors/Homu & GitHub MQ).
   - **Option (b) — Keep `merge_stamp` reset (always back of queue)**: maximizes first-try-green throughput, punishes flake victims with full queue-depth latency (worst for Lock 1a p90).
   - Note: `dependentCounts` (`src/turn.ts:121`) already outranks `merge_stamp`; a leaf blocking dependents stays ahead either way.

4. **Fork 5A-4 — Mechanical rebase conflicts (`solo_conflict`) & `gate`/`push` handoffs**:
   - Since 2026-11-14: **17 `solo_conflict` attempts** (13 merged, 4 red) held the line for **5.87 lane-h** (0.88h of B resolving conflicts + 4.99h of verifies).
   - **Option (a) — Evict `solo_conflict`, `wake=gate`, and `wake=push` to off-line B immediately too** (matches GitHub MQ evicting on conflict, GitHub Docs read 2026-11-21): B resolves conflicts / adds missing `Test-Change:` trailers off-line and re-enters `merge`, where `land` rebases/verifies/pushes seatless!
   - **Option (b) — Evict only `wake=red`**, keep `solo_conflict` on the line: keeps 0.88h+ of manual conflict-resolution stalls on the line and retains two different B merge protocols (on-line `merged` vs off-line re-entry).
   - **Pitfall of (a)**: If the queue is moving fast and a leaf touches a hot file (e.g. `package.json`), evicting on conflict can conflict again on re-entry unless its `merge_stamp` is preserved (Fork 5A-3).

5. **Fork 5A-5 — Telling flaky reds apart & main-red (base fault) amortization**:
   - **Measured impact**:
     - **Same-tree flakes**: **40 of 103** `wake=red` attempts (39%), **19.39 lane-h** (8.15h v1 + 7.97h / 40 extra verifies + 3.20h B non-verify). Top repeat offenders (`satellite record keeps the prior fixture...` ×5, `scroll-0 evidence...` ×4, `chain recorded audit` ×3, `image evidence` ×2, `Botpoison` ×2) already appear in `akrogon flaky` (`src/flaky.ts`).
     - **Main-red streak**: One broken-main test (`skills-typecheck-switch > the fixed-list lesson is retired...`, 2026-11-15T01:35Z–11-17T14:18Z) triggered **60 merge verify runs (41 head + 19 base = 10.03 verify hours!)** across **13 leaves** (12 `known_red_merged` paying 3 full suites = ~33m each, plus 9 `check.fix` bounces!). Why: `land.ts:86` always runs `knownRed=false` and `knownRedReceipt` (`src/verify.ts:212-214`) requires `run.compares === head.run && run.sha === mergeBase`, refusing to reuse base-red evidence across leaves even while an unresolved `main-red` incident is open in `verify-runs.jsonl`!
   - **Fork — Main-red handling**:
     - **(a) Shared unresolved `main-red` cover**: When every failing entry on a red `land` has real test titles (never `(script)`/`(unnamed)`/`(no test name)`) that are ALL covered by an open unresolved `main-red` incident (`newRedUnits` at `src/verify.ts:296-345` already tracks exact incident resolution by any green main run at/after the red base SHA!) AND are not known flaky in `flaky.ts`, accept as known-red inside `land` (or skip redundant base runs once base is proven red for the streak). Saves ~18 of 19 base runs + 12 retry runs in a streak like Nov 15–17 while preserving Lock 1a ("no leaf adds a **new** test failure to main"). **Pitfall** (carried from `base-red` B's dissent): a leaf introducing a second bug *inside the same already-red test* could land unseen until main is repaired, and a flaky test failing once on base must never poison the cover (mitigate by excluding `flakyLines` tests and requiring exact test title).
     - **(b) Per-streak base probe (auto-trigger on 2nd consecutive same-test red) + per-base cache**: narrower change; avoids 100% of repeat base runs on the same base SHA and triggers base verification automatically instead of waiting for B's retry + `--known-red`, but still re-runs base once whenever `main` moves.
   - **Fork — Flake triage**:
     - **(a) Off-line B narrow repro (Fork 5A-2a)** — B judges diff + runs failing test narrowly + re-enters queue.
     - **(b) Bounded 1× seatless auto-requeue for known flakes**: If a red `land` fails ONLY on test title(s) already recorded in `akrogon flaky` and untouched by the leaf's diff, auto-evict and re-queue ONCE (preserving `merge_stamp`) without waking B at all; a 2nd red wakes B off-line. Cuts B token cost on repeat flakes while keeping 100% full-suite merge verification (unlike Uber Testopedia / Chromium CQ test quarantine, Uber Engineering & Chromium docs read 2026-11-21, which skips/ignores quarantined failures and would weaken Lock 1a's hard limit). **Pitfall**: must check diff-touch and cap at 1 auto-requeue per tree so a real regression in a flaky test never loops.

---

## 2. Lock 6a (waiting merge leaves stop counting against `max_active: 12`)

### Code changes & every consumer of altered state

- **Primary code surface**:
  - `src/next.ts:369-396` (`activeCount`): currently counts `inventory.leaves.filter((leaf) => unfinished(leaf) && live.has(leaf.state.slug)).length` (where `unfinished` is `phase !== 'merged' && phase !== 'failed'`), and in the refused-session fallback (`:392`) counts `inventory.leaves.filter(unfinished).length`.
  - Under 6a, exclude leaves that are **waiting in `merge`** (i.e. `phase === 'merge'` and NOT actively holding the merge line / NOT in off-line 5a triage/repair) from both the live-session branch (`:387`) and the refused-session fallback (`:392`).
- **All consumers**:
  - `src/next.ts:414` (`allocate`) — only caller of `activeCount`. Used by `dispatchLeaf` (`:760`), `broadcastPass` (`:1063`), and `seatCommand` (`:1170`).
  - Note an existing nuance in `allocate` (`:413-414`): `if (!live && (await activeCount(...)) >= global.max_active) return null;` — leaves that *already* have a live A or B seat bypass `max_active` (so a waiting merge leaf becoming holder or waking B on red is never blocked by `max_active` if its seat is still alive; **but** if seats were closed while waiting — Fork 6A-2 — `allocate` would have to exempt `merge` holder / `broadcastPass` from `max_active` or they could deadlock behind 12 pre-merge leaves!).
  - `src/status.ts`, `src/reconcile.ts`, `src/admission.ts`, `src/listen.ts` do not read `activeCount`.

### Forks & host-load / cross-repo pitfalls inside Lock 6a

1. **Fork 6A-1 — Exact exclusion predicate (holder vs waiter vs 5a off-line)**:
   - Waiting `merge` leaves (queued, idle) -> excluded (0 seats).
   - **5a off-line triage/repair leaves** -> **MUST still count** (actively running seat B + narrow repros + burning tokens/CPU).
   - **Active merge holder (`land` running `batch.owner === 'command'`)**: counting as 0 vs 1 is minor (at most 1 per repo), though counting active `land` holders as 0 while no seat runs keeps the predicate pure ("leaves with active agent seats").

2. **Fork 6A-2 — Idle-seat RAM explosion when waiting in `merge`**:
   - **Measured live on this host (2026-11-21)**: `akrogon.slice` has `MemoryHigh=64G`, `MemoryMax=96G`, `MemorySwapMax=0`, `CPUWeight=20` (currently **19.6G**, peak **44.4G**). The 5 waiting `framework` `merge` leaves right now keep BOTH live A (`pi`) and B (`codex` + `node_repl` + `codex-code-mode-host`) seats open, holding **6.30 GiB RAM and ~1,012 tasks** (`checker-command`: 2.87 GiB / 211 tasks; `reject-literal-removal`: 1.06 GiB; `open-event-items`: 0.82 GiB; `pagespeed-lab-samples`: 0.81 GiB; `deferred-gtm-start`: 0.74 GiB; holder `sitemap-child-member`: 4.32 GiB / 980 tasks).
   - Meanwhile, **50.4%** of merge attempts land seatless via `akrogon land` (A is never prompted again unless `check.fix`, ~19% of attempts!).
   - Under pure 6a, if `framework` runs 12 pre-merge leaves continuously and piles up 20–30 leaves in `merge`, idle seats alone consume **16–40 GiB** under `MemoryHigh=64G` alongside 12 active leaves + verify suite!
   - **Options**:
     - **(a) Count-only change in `activeCount` (keep seats warm)**: ~5 lines in `src/next.ts`, zero extra cold-start token cost when B wakes for red/broadcast or A wakes for `check.fix`; relies on `suite-regrowth` keeping queues shallow. **Pitfall**: silent RAM creep toward `MemoryHigh=64G` if queue ever backs up again.
     - **(b) Close slot A (keep B) on entering `merge`** (or close both if queue wait > threshold): frees `pi` RAM immediately for ~80% of leaves that never return to `check.fix`, keeping B warm for red handoff / broadcast. **Pitfall**: the ~19% that bounce to `check.fix` pay a cold-start token reload for A (check Lock 1a "token cost does not grow").

3. **Fork 6A-3 — Cross-repo relief vs single-repo Little's Law instability**:
   - **Cross-repo effect (good)**: Today 10 waiting `framework` merge leaves consumed 10 of 12 seats (`~/.akrogon/config.yaml`), starving `akrogon` and the other 10 registered repos (and right now 6 `framework` merge leaves + 2 `akrogon` leaves leave only 4 seats for 5 unblocked `suite-regrowth` leaves). 6a immediately eliminates cross-repo starvation.
   - **Cross-repo load pitfall**: None of the 11 other repos besides `akrogon` (`full: ['test']`) set `full:` (`lingua-relay` runs `test` + `journeys`, `clinique-la-roya` runs 5 checks, etc.). With 12 truly active pre-merge leaves across multiple repos + 1+ active `land` suites, peak concurrent test load can rise — still bounded by `akrogon.slice` (`MemoryHigh=64G`, `CPUWeight=20`), but worth checking whether heavy repos should opt into `full:`.
   - **Same-repo pitfall (Little's Law)**: Today `max_active: 12` was the *only* backpressure slowing new `framework` leaves from entering an already-clogged `merge` queue. Without it, if `framework`'s arrival rate exceeds its merge drain rate, the `merge` queue grows unboundedly -> longer `merge` wait (hurting Lock 1a!) -> older branch bases -> higher `solo_conflict` rate -> slower drain (positive-feedback spiral).
   - **Question for the fork**: Ship pure 6a (Lock 6a chose 6a over 6b per-repo cap), and define a measured trigger (e.g., if `merge` queue depth > N or `akrogon.slice` hits `MemoryHigh`) to add either idle-A reaping or per-repo merge-backlog backpressure?

---

## 3. Full merge-line time budget (2026-11-14–21) & cuts without 2 suites or batching

Measured from `/home/ivan/Work/infra/tamdoma/framework/issues/{merge-attempts,verify-runs,log,timings}.jsonl` (`>= 2026-11-14T00:00:00Z`, 248 attempts, 201 merged, 47 red, **74.51 lane hours**):

### End-to-end Lock 1a metric (first entry to `merge` -> `merged`, n=201)
- Overall: **med 72.3m**, p75 132.7m, **p90 211.8m**, max 493.0m.
- 1-entry leaves (n=161): **med 63.0m**, p90 197.7m.
- >1-entry leaves (n=40): **med 90.7m**, **p90 294.2m**, max 493.0m.
- Command-landed (`slot=null`, n=128): **med 61.2m** vs Seat-B-landed (`slot=B`, n=73): **med 91.3m**.

### Per-attempt step timings (clean command-landed, n=125)
| Step | Median | p90 | Max | Share of clean 12m attempt |
|---|---:|---:|---:|---:|
| Inter-holder wake gap (queued, unpaused, n=193) | **7.5s** (7.9s after merged, 2.0s after red) | 14.0s | *(see race bug below)* | 1.0% |
| Rebase + `applyTop` + `launchLand` + verify worktree (`attempt_start -> setup_start`) | **4.1s** | 4.9s | 10.6s | 0.6% |
| Setup (`bun install --frozen-lockfile --backend=copyfile`, n=357) | **0.8s** | 0.9s | 4.6s | 0.1% |
| Green merge `verify` (`bun run framework:verify`, n=194) | **700.6s (11.68m)** | 812.6s | — | 97.6% |
| Gates + push + move (`verify_end -> attempt_end`) | **5.1s** | 5.9s | 10.2s | 0.7% |

**Takeaway**: Mechanical overhead (fetch/rebase/worktree/setup/gates/push/normal wake gap) totals **~17.5s median**. Optimizing git/setup/push buys almost nothing.

### Where the 74.51 lane hours went (and what akrogon CAN cut alone)

| Bucket (2026-11-14..21) | Attempts | Lane hours | Share | Akrogon lever (no 2 suites, no batching) |
|---|---:|---:|---:|---|
| Clean 1st-try green `land` | 125 | **26.25h** | 35.2% | Irreducible floor for 1 suite (already cut ~2.5× by `suite-regrowth`) |
| `wake=red` -> same-tree flake merged | 40 | **19.39h** (8.15h v1, 7.97h 40 extra runs, 3.20h B non-verify) | 26.0% | **5a** moves 3.20h B thinking + 2h seat-loss stall off-line; narrow off-line check / bounded 1× seatless flake requeue cuts B tokens |
| `wake=red` -> `check.fix` | 43 | **12.88h** (7.70h v1, 3.87h 23 extra runs, 1.55h B non-verify) | 17.3% | **5a** moves 1.55h B thinking off-line AND cuts **3.87h** (23 wasted extra full verifies before bounce!) |
| `wake=red` -> `known-red` merged | 12 | **6.84h** (1.97h v1, 4.31h 26 extra runs, 0.54h B non-verify) | 9.2% | **Shared unresolved `main-red` cover** cuts redundant retry + base runs (**10.03h / 60 runs** lost to 1 broken test Nov 15–17!) |
| `solo_conflict` (rebase failed) | 17 | **5.87h** (4.99h 25 verifies, 0.88h B conflict fix) | 7.9% | **5a** evicting conflicts moves 0.88h conflict resolution off-line (and shallower queues reduce conflict rate) |
| `wake=red` -> B in-place fix merged | 8 | **3.28h** (1.20h v1, 1.72h 9 extra runs, 0.35h B fix) | 4.4% | **5a** moves 0.35h B fix off-line; 4 of 8 were `verify-aliases` (already moved to `cheap` by `suite-regrowth`) |

### Three concrete akrogon defects surfaced by the ledgers (cuttable independently)

1. **`batchPush` `applied: false` vs concurrent `mergeTurn` race (~61 min wasted in 2 verified incidents + dropped attempt rows)**:
   - On a non-fast-forward push refusal, `src/phase.ts:775-785` writes `applied: false` and releases `.lock` before `finishPush` -> `restack` (`:836-866`).
   - If `akrogon next --wake` runs during `finishPush`'s `git fetch` or `buildStack`, `mergeTurn` (`src/next.ts:950,982`) treats `applied === false` as an unapplied attempt and **overwrites `state.batch` with a brand-new attempt**, dropping the old attempt from `merge-attempts.jsonl` and launching an extra full `land` verify!
   - Ledger proof (2026-11-18): `built-link-orphans` (batch `096e9a25` at `09:55:57Z` ran 3 verifies, green at `10:32:08Z`, overwritten by `f48bc15b` at `10:32:49Z` -> **5 total verifies / 62 min**, appearing as a 2,219.8s gap) and `consent-ad-signals` (batch `d3aa67a9` at `18:39:31Z` green at `19:03:03Z`, overwritten by `2458f216` at `19:03:43Z` -> **3 total verifies / 35 min**, appearing as a 1,460.5s gap).
   - Fix: hold a `restacking` / `in_flight` marker (or keep `applied: true` until `restack` finishes under lock, and never overwrite an attempt whose `candidate` is set).
2. **2-hour dead-lane stall on seat loss (`status-page-schema-graph`, 2026-11-21)**:
   - `land` exited red at `07:33:47Z`; `seat_lost merge B` was not logged until `09:34:36Z` (**7,270s / 2h01m** dead merge lane!). Under 5a, a dead B cannot stall the merge line, **but** we should still trace why `handOff` -> `mergeWake` -> `dispatchSlot` failed to detect/replace the dead seat for 2 hours so individual leaves don't stall off-line.
3. **Carried from `suite-regrowth` Q5 — Slow-merge alarm (`src/verify.ts:353-426`, `decideSlow`) absorbs step regrowth**:
   - Ledger proof (`verify-runs.jsonl`, 740 `slow` rows):
     - `2026-11-05`: med 4.60m, `normal_ms` 4.85m.
     - `2026-11-08`: opened on `replan-fit-selection` (7.0m vs 4.6m, 1.53×), closed `recovered` 1 run later at 6.1m (**1.33×**).
     - `2026-11-12`: opened on `project-wrangler` (9.9m vs 5.8m, 1.72×), closed `recovered` 2 runs later at `status-facts` 8.4m (**1.46×**); opened twice more that day (`mini-blueprint-entry` 10.7m, `photo-verdict-carry` 13.7m) and closed `recovered` on single runs at 1.43× and 1.39×.
     - `2026-11-13..21`: median crept from 9.17m to **13.39m** (~2.9× early-Nov), while `normal_ms` silently climbed to **12.91m** (`max_ratio` 1.10×–1.36×; zero alarms for 9 days!).
   - Root causes in `src/verify.ts:364-384`: (i) **no exit hysteresis** (a single run at `<= 1.5×` closes `recovered` and unpins `normal_ms`), (ii) **no long-horizon/pinned baseline** (gradual +20% steps or +12s/day linear growth vanish into the 20-run rolling median), and (iii) **no per-command `duration_ms`** stored on `verify-runs.jsonl` entries (only whole-run `start`/`end`, though `timings.jsonl` has per-`run-check` `duration_ms`, not per-internal-script `Done in` seconds).

---

## 4. Lock 2a & the N2 probe (two full suites at once)

- **What N2 needs from akrogon to run**: Nothing — N2 is a standalone probe on a detached checkout after `suite-regrowth` lands.
- **What changes in akrogon depending on N2's result**:
  - **If N2 FAILS** (either run >1.25× slower or new failure; expected by operator): akrogon must **guarantee** that 5a off-line work cannot start a 2nd concurrent full suite alongside `land` — either by enforcing narrow-only off-line checks (Fork 5A-2a) or by configuring `full: [verify]` in `framework/issues/config.yaml` so `admission.ts:147` (`awaitLineTurn`) serializes full runs.
  - **If N2 PASSES**: under Lock 3a (no batching — each leaf tested alone), the only architecture that turns a 2nd concurrent suite into real landing speed is **depth-2 speculative `land`** (GitLab Merge Trains / Uber SubmitQueue style, docs read 2026-11-21):
    - While holder `#1` runs `land` on `main + #1`, slot `#2` speculatively rebases onto `#1.top` and runs `land` verify in parallel. If `#1` lands green, `#2`'s tree already sits on the new `main` and lands in ~5s; if `#1` evicts (5a), `#2`'s speculative verify is stopped (`stop-run` / `verify-pass`) and restarted on `main`.
    - *(Testing `#2` against current `main` in parallel does NOT land `#2` without a rerun because `#1`'s push makes `#2` non-fast-forward.)*
    - **Code changes required if pursued**: generalize `mergeTurn` (`src/next.ts`), `mergeQueue` (`src/turn.ts`), `reconcileBatch`, `land.ts`, `phase.ts` (`landPush` ordering barrier: `#2` cannot push before `#1` lands, and cancels if `#1` evicts), `status.ts`, and `reconcile.ts` from 1 active `batch` per repo to up to 2 chained slots (`holder` + `speculative`).
    - **Throughput math warning**: At today's 50% first-try green rate ($p=0.50$), half of speculative runs on `#1` get invalidated and discarded (doubling CPU for modest wall-time gain); depth-2 speculation only pays off cleanly once `suite-regrowth` + flake/main-red cuts push $p$ well above ~0.75.
- **Does any merge-lanes work need to wait for N2?**: **No.** Locks 5a, 6a, the `batchPush`/`mergeTurn` race fix, shared `main-red` cover, and the slow-alarm fix are all independent of N2 and deliver their full benefit under 1 suite at a time (provided 5a chooses narrow off-line repros rather than concurrent off-line full suites). Only a conditional follow-on `speculative-depth-2` leaf (and the optional `full: [verify]` guard if off-line full runs were ever allowed) waits on N2.

---

## 5. Proposed leaf split (by independently checkable outcome)

Only real code/contract dependencies order these leaves:

1. **`waiting-merge-capacity` (Lock 6a)** — *No dependencies.*
   - Outcome: Waiting `merge` leaves stop counting against `global.max_active` in `src/next.ts` (`activeCount`), while active off-line / pre-merge leaves still count (plus whatever idle-seat policy Fork 6A-2 picks). Independently testable in `bun test` (`tests/next.test.ts`). Lands first to relieve cross-repo starvation immediately.
2. **`push-restack-race` (Bug fix)** — *No dependencies (sequence before or fold into `evict-failed-merge` since both edit `src/next.ts` `mergeTurn` and `src/phase.ts`).*
   - Outcome: A concurrent `akrogon next --wake` during `batchPush` -> `finishPush` -> `restack` never overwrites an in-flight batch (`applied: false`) or drops an attempt from `merge-attempts.jsonl`. Red-first unit test reproducing the `built-link-orphans` / `consent-ad-signals` race.
3. **`evict-failed-merge` (Lock 5a)** — *Depends on `failed-merge-resume` (already in `implement`) and `push-restack-race` (if kept separate).*
   - Outcome: On `land` red verify, gate refusal, push failure, or mechanical rebase conflict (per Fork 5A-4), the holder releases the merge line immediately, the next queued leaf starts in the same pass, the evicted leaf moves to off-line triage/repair (Fork 5A-1, 5A-2), re-enters with the chosen `merge_stamp` / retry-cap policy (Fork 5A-3), preserves `failed-merge-resume`'s two criteria, and updates `status.ts`, `reconcile.ts`, and `skills/merge-issue/`.
4. **`shared-main-red` (Main-red amortization)** — *Depends on `evict-failed-merge` only if `land.ts` red handling is refactored there; otherwise independent.*
   - Outcome: A broken test already proven red on main by an unresolved `main-red` incident (exact test title, not flaky, no green main run since) no longer forces every subsequent leaf in the streak to run 3 full suites (head + retry + base); invalidates automatically on the first green main run.
5. **`slow-alarm-baseline` (Carried from `suite-regrowth` Q5)** — *No dependencies.*
   - Outcome: `decideSlow` (`src/verify.ts`) adds exit hysteresis + long-horizon/pinned baseline comparison so step jumps (like 11-12's 1.46× `recovered`) and steady drift cannot silently absorb into the rolling 20-run median; optionally records per-command `duration_ms` on `verify-runs.jsonl` (and decides whether a repo hook reports per-script durations).
6. *(Conditional, NOT handed off now)* **`speculative-depth-2`** — Chartered only if post-`suite-regrowth` N2 passes AND first-try green rate justifies speculative discard cost.

---

## 6. Questions a practitioner would ask that the brief does not

1. **5a vs 2a concurrency**: When a red leaf moves off-line under 5a and the next leaf starts `land` immediately, do we forbid full-suite `akrogon verify` off-line (narrow `run-check` repros only, full verify on queue re-entry) to honor Lock 2a and avoid stale-base receipt waste?
2. **6a RAM & Little's Law backpressure**: With 5 waiting `merge` leaves holding **6.30 GiB RAM / ~1,012 tasks** today, should 6a also end idle slot A on entering `merge` (trading rare `check.fix` cold-start tokens for GiB of RAM), and what measured trigger (queue depth or `MemoryHigh` pressure) would justify adding per-repo merge-backlog backpressure later?
3. **Re-entry `merge_stamp` & priority inversion**: Should 5a preserve the leaf's *first* `merge_stamp` for flake/conflict/mechanical-fix re-entries (with a cap, e.g. 2, to prevent head-of-line thrashing) to directly optimize Lock 1a's first-entry-to-landed metric?
4. **Conflict eviction scope**: Should mechanical rebase conflicts (`solo_conflict`, 17 attempts / 5.87h) and `gate`/`push` handoffs evict off-line under the same 5a mechanism as `wake=red`?
5. **Bounded seatless flake auto-requeue**: Since 39% of reds (40/103) were same-tree flakes mostly already in `akrogon flaky`, should a known-flaky untouched-test red auto-evict and re-queue once without waking B (saving tokens and ~3.2h), or must B judge every red?
6. **The 2-hour `seat_lost` gap (`status-page-schema-graph`, 2026-11-21)**: Why did `land` handing off to a dead/lost B seat at `07:33Z` take until `09:34Z` to detect `seat_lost`? Even off-line under 5a, a 2-hour silent stall on a dead seat directly hits Lock 1a's clock.
7. **Slow-alarm baseline reset & per-script visibility**: When `suite-regrowth` deliberately drops verify from 13m back to ~5m, should `decideSlow` automatically re-anchor downward (floor/best-window anchor) so a subsequent climb from 5m -> 8m fires immediately, and how should akrogon read per-script durations without hardcoding framework's `package.json`?
8. **Post-`suite-regrowth` re-baseline**: After `suite-regrowth` cuts verify ~2.5×, queue depth, conflict rate, and flake cost all shift nonlinearly — which items (e.g. `speculative-depth-2`, idle-seat reaping, auto-requeue) should be gated on a 3-day post-`suite-regrowth` ledger read?
