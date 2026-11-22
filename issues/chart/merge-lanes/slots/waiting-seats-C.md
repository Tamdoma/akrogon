# Fork notes: waiting-seats (slot C)

Date: 2026-11-21. Blind notes on `forks/waiting-seats.md` Q1–Q3 against locks in `forks/signposts.md` `## Taken` (6a waiting merge leaves stop counting against `max_active`; 1a speed from first entry, no new red on main, PC inside limits, token cost does not grow) and `forks/red-exit.md` `## Taken` (no seat prompted in `merge`; all seat hand-offs leave to `check.repair`).

---

## Q1 — Which leaves stop counting against `max_active`

- **Pick**: **Exclude every leaf in `phase === 'merge'` in both branches of `activeCount` (`src/next.ts:369-396`)** — live-session branch (`:387`) and refused/unreadable-session fallback (`:392`, including `seated` at `:373-374`).
  - **Reason**: Under `red-exit ## Taken` item 1, no agent seat is ever prompted while a leaf is in `phase === 'merge'`. The active holder runs seatless `akrogon land` (bounded by the 1-per-repo merge turn and `akrogon.slice`, not the seat cap), while every red/conflict/gate leaf moves immediately to `phase === 'check.repair'` and therefore continues counting against `max_active` automatically. Applying the same predicate (`phase !== 'merged' && phase !== 'failed' && phase !== 'merge'`) to both branches prevents a repo with an unreadable/refused hc session and only waiting `merge` leaves from stalling other repos.
  - **Cost**: Removes the indirect WIP backpressure that `max_active: 12` previously exerted on a clogged repo (Little's Law: `framework` can keep up to 12 pre-merge leaves active even while leaves queue in `merge`, increasing concurrent `implement`/`check` load and potentially branch age if a queue backs up again).
  - **Consumers whose behavior changes**: `src/next.ts` (`activeCount` `:369-396`, replacing `unfinished` in live count `:387`, `seated` `:373-374`, and refused-session count `:392`; `allocate` `:402-420`, its sole caller, gating `dispatchLeaf` `:760`, `broadcastPass` `:1063`, and `seatCommand` `:1170`).
- **Rejected options**:
  - *Exclude only waiting `merge` leaves (keep counting the active `merge` holder)*: under `red-exit`, the holder has no active agent seat, so counting it burns 1 seat per busy repo for a seatless process and forces `activeCount` to run `mergeQueue` (reading `log.jsonl` + `eligibility`) for every registered repo on every `allocate` call.
  - *Exclude `merge` only in the live-session branch*: leaves a subtle failure mode where an hc refusal on a repo holding waiting `merge` leaves starves all other registered repos.
- **Evidence**:
  - `better-than-training` · `src/next.ts:369-420` (2026-11-21) · `activeCount` counts `unfinished` (`phase !== 'merged' && phase !== 'failed'`) in both live and refused-session branches; `allocate` is its only caller.
  - `better-than-training` · `forks/red-exit.md ## Taken` item 1 (2026-11-21) · no seat is prompted in `merge`; all seat hand-offs leave to `check.repair`.
  - `better-than-training` · live `akrogon status` & `~/.akrogon/config.yaml` (2026-11-21) · 6 `framework` `merge` leaves + 2 `akrogon` leaves took 8 of 12 seats (earlier 10 `framework` `merge` leaves left only 2 seats for 11 other repos).
- **Pitfalls & removals**:
  - *Unbounded same-repo queue growth (Little's Law)*: without WIP backpressure on a clogged repo, a slow-suite regression could build a deep `merge` queue, aging branches and raising rebase conflicts. **Removal**: honor Lock 6a (not 6b per-repo cap) now; track queue depth and capacity waits (Q3) with a measured reopen trigger (e.g., if post-`suite-regrowth` merge queue depth exceeds 15 or `akrogon.slice` approaches `MemoryHigh=64G`).
  - *Multi-repo concurrent pre-merge check load*: only `akrogon` sets `full: ['test']` across all 12 repos (`issues/config.yaml`, 2026-11-21), so 12 active pre-merge leaves can run more tests concurrently. **Removal**: `akrogon.slice` (`MemoryHigh=64G`, `MemoryMax=96G`, `MemorySwapMax=0`, `CPUWeight=20`) already bounds host impact; heavy repos can opt into `full:` independently.
- **Unasked question**: If a leaf in `check.repair` (evicted from `merge`) loses its B seat (`live === false`) while `activeCount >= max_active`, should `allocate` let it wait for a free slot (cleanest, respects `max_active`, recorded by Q3) or exempt already-started leaves (`worktree !== undefined`) from `max_active`? (Recommend letting it wait under Q3 — rare since B stays alive under Q2.)

---

## Q2 — Idle seats of a waiting `merge` leaf (keep alive vs close one or both)

- **Pick**: **Keep both idle seats alive** (do not close A or B at merge entry).
  - **Reason**:
    1. *Real RAM cost is small*: live `/sys/fs/cgroup/.../memory.stat` inspection of the 5 waiting `framework` `merge` leaves (2026-11-21) shows **65% of `MemoryCurrent` (`4.96 GiB`) is reclaimable kernel `file` page cache**; actual anonymous RAM (`anon`) is only **~539 MiB/leaf** (`2.63 GiB` total for 5 leaves: `~379 MiB` slot A `pi`, `~160 MiB` slot B `codex`) against `akrogon.slice` `MemoryHigh=64G` / `MemoryMax=96G` and 123 GiB host RAM. Even 20 waiting leaves hold only ~10.5 GiB `anon` (16% of `MemoryHigh`).
    2. *Closing either seat grows token cost (violating Lock 1a)*: in `framework` (`2026-11-14..21`, 201 merged leaves), **174 of 201 leaves (86.6%)** needed slot B again after entering `merge` (101 for merge/repair/review work, 97 for `broadcast-issue` on command-merged owner completion), and **39 of 201 (19.4%)** needed slot A again (`check.fix`). Cold-restarting B on 86.6% or A on 19.4% forces re-reading brief, design, plan, report, and diff, directly growing token cost.
    3. *Closing seats adds complexity and real failure modes*: ending a seat without clearing `state.seat[slot]` makes `dispatchSlot` (`src/next.ts:513-536`) charge false `seat_lost` strikes; closing both sets `live === false` in `allocate` (`src/next.ts:413-414`), allowing `max_active` to block `check.repair` and `broadcastPass`; and closing both while `state.tab` stays set makes `sliceKeepReason` (`src/reconcile.ts:200-218`) return `null`, so `reconcileRepos` (`src/next.ts:1452`) stops `leafSlice` and **kills `akrogon-land-<attempt>`** before `checkedRun` registers in `liveRuns()`.
  - **Cost**: Holds ~539 MiB `anon` RAM and ~200 idle threads per waiting `merge` leaf until `closeMergedTab` (`src/next.ts:1222`) / `reconcile` (`src/reconcile.ts:782-796`) tears them down after `merged`.
  - **Consumers whose behavior changes**: None (no teardown added; `closeMergedTab`, `reconcile.ts`, `allocate`, and `dispatchSlot` remain unchanged).
- **Rejected options**:
  - *Close both seats at merge entry*: saves ~539 MiB `anon`/leaf, but forces cold B starts on **86.6%** of leaves (violating Lock 1a's token-cost hard limit) and requires `state.seat` clearing, `allocate` exemption, and `sliceKeepReason` fixes to avoid killing `akrogon-land`.
  - *Close slot A only (keep B) at merge entry*: avoids the `sliceKeepReason` and `broadcastPass` bugs (slot B stays live with `outlive: true` from `src/seat.ts:269`), **but** still forces cold A starts on **19.4%** of leaves (`check.fix`, growing token cost under Lock 1a) and adds hc-teardown + `state.seat.A`-clearing code to save only ~1.85 GiB across 5 waiting leaves on a 123 GiB host.
- **Evidence**:
  - `better-than-training` · live `/sys/fs/cgroup/.../memory.stat` on 5 waiting `framework` `merge` slices (2026-11-21) · total `anon=2,694 MiB` (`2.63 GiB`: A `1,893 MiB`, B `801 MiB`, avg `539 MiB`/leaf) vs reclaimable `file=5,077 MiB` (`4.96 GiB`); `checker-command` after 11h waiting holds `576 MiB` `anon` (`362 MiB` A, `215 MiB` B, no memory leak).
  - `better-than-training` · `framework/issues/{log,timings}.jsonl` (`2026-11-14..21`, 201 merged leaves, read 2026-11-21) · post-merge prompts: `39/201` (19.4%) needed A, `101/201` (50.2%) needed B for work, `97/201` (48.3%) needed B for `broadcast-issue`, `174/201` (86.6%) needed B for any reason, only `27/201` (13.4%) needed neither.
  - `better-than-training` · `src/reconcile.ts:200-218`, `src/land.ts:24`, `src/next.ts:413-414,513-536,1452` (2026-11-21) · proves `sliceKeepReason` would kill `akrogon-land` if both seats were closed while `state.tab` stayed set, and `dispatchSlot` charges `seat_lost` if `state.seat[slot]` is not cleared.
  - `operator` · `issues/chart/merge-turn/forks/merge-order.md` Q2 (operator 2026-10-05) · "nothing new to build ... B keeps review context."
- **Pitfalls & removals**:
  - *Deep queue `anon` growth under 6a*: 40+ waiting `merge` leaves (~21 GiB `anon`) could pressure `MemoryHigh=64G` alongside 12 active leaves + verify. **Removal**: record an explicit measured reopen trigger (if `akrogon.slice` `anon` exceeds 40 GiB or waiting `merge` leaves exceed 30, revisit closing A on oldest waiters).
- **Unasked question**: `broadcast-issue` currently accounts for nearly half of post-merge B usage (`97/201`, 48.3% — often on otherwise clean seatless merges); is there any need to change `broadcastPass`, or does keeping B alive make `broadcastPass` completely free of cold-start tokens? (Keeping B alive keeps `broadcastPass` warm and zero-cold-start.)

---

## Q3 — Recording a capacity wait reason on `allocate === null`

- **Pick**: **Yes — add `'capacity'` to `waitReasonSchema` (`src/timing.ts:22`), add `'capacity'` to `waitOrder` (`src/timing-report.ts:26`), and emit `end('capacity')` when `allocate` returns `null` in `dispatchLeaf` (`src/next.ts:761`).**
  - **Reason**: Today `src/next.ts:761` calls `end('none')`, hiding capacity-capped waits inside `wait none` and omitting them from `akrogon timing <slug>` and `akrogon timing --cohort` (`src/timing-report.ts:26,304-309`). Adding `'capacity'` is ~3 lines, purely schema-additive for existing `timings.jsonl` rows, automatically deduplicated per wait episode by `recordWait` (`src/timing.ts:116-123`), automatically closed by `end('none')` (`src/next.ts:776`) once allocated, and gives direct observability of whether Lock 6a eliminated cap stalls or whether `max_active: 12` later becomes a bottleneck.
  - **Cost**: ~3 lines + unit test; an older akrogon binary cannot parse a `timings.jsonl` holding `'capacity'` (strict zod enum in `src/timing.ts:22`, resolved by standard release deploy). Also note: shipping Q3 alongside 6a only measures the *after* state directly (see pitfall below).
  - **Consumers whose behavior changes**: `src/timing.ts:22` (`waitReasonSchema`), `src/next.ts:761` (`dispatchLeaf`: `if (allocated === null) return end('capacity');`), `src/timing-report.ts:26` (`waitOrder`, automatically picked up by `visitLines` `:225`, `memberLine` `:304`, and `promptedTotal` `:131`). `broadcastPass` (`src/next.ts:1064`) and `seatCommand` (`src/next.ts:1171`) do not call `recordWait` and stay unchanged.
- **Rejected options**:
  - *Keep `end('none')` (no capacity wait reason)*: leaves cap stalls indistinguishable from idle/unprompted time in `timings.jsonl` and `akrogon timing`, giving no sensor for whether 6a worked or whether `max_active: 12` later throttles work.
- **Evidence**:
  - `better-than-training` · `src/timing.ts:22,116-123`, `src/next.ts:760-776`, `src/timing-report.ts:25-26,126-134,225,304-309` (2026-11-21) · `waitReasonSchema` holds `['prerequisite', 'parked', 'merge_turn', 'none']`; `allocate === null` writes `end('none')`; `recordWait` already deduplicates repeated identical reasons.
- **Pitfalls & removals**:
  - *"Before" count is not emitted retroactively*: if Q3 lands in the same leaf as 6a, `'capacity'` only records post-6a stalls (~0 expected), not a direct `'capacity'` before-count. **Removal**: measure any needed "before" baseline from existing `timings.jsonl` gaps (`visit_start` -> first `prompt` with `wait none` while 12 seats were occupied), rather than delaying 6a behind a separate observation window.
  - *`akrogon timing --cohort` `F` metric unaffected*: `memberOf` (`src/timing-report.ts:270-295`) computes `F = merged - joined - implPrompted` starting from `firstPlan` (first delivered plan prompt, `:340-350`), so pre-allocation `'capacity'` waits before the first prompt never distort `F`, and post-first-prompt `'capacity'` waits (if any) are properly excluded from `implPrompted` (`:131`).
- **Unasked question**: Should `akrogon status` (or `akrogon status --json`) also surface when a leaf is waiting on `max_active` (e.g., `waiting capacity`), or is `timings.jsonl` / `akrogon timing` sufficient? (Recommend `timings.jsonl` only for now; `status.ts` can read it later if cap waits ever recur.)
