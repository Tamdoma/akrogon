# Slot C analysis — `wake-cost` simplification (`3ff3f5b5` / `7faab20b` on `814a2387`)

## 1. Diagnosis: 10 of 13 findings (100% of rounds 2–4) are seam bugs

Across D rounds 1–4:
- **3 findings** were real one-time bugs orthogonal to wait caching and are already closed: **F2** (unlocked `landedWake` dependent dispatch), **F3** (`config` in closed worktree), **F4** (closed merged owner tab cleanup).
- **10 findings** (**F1, F5, F6, F7, F8, F9, F10, F11, F12, F13**) exist solely because waits and `visited` are maintained in **two places** (`state.yaml` + `timings.jsonl`) across **two releases** in both directions (`7faab20b:src/next.ts:683-709, 923-929, 1342-1343`, `src/timing.ts:111-147`, `src/state.ts:157-164, 227-230`).

---

## 2. Is wait order across a rollback worth anything to the operator?

**No.** Rollbacks are rare recovery events with at most a handful of queued leaves (currently **0** open leaves in both `akrogon` and `framework`). Reordering two capacity waiters once during a rollback has negligible cost compared to merge speed, simplicity, and low maintenance.

However, **not stranding** waiters and **avoiding a two-release schema migration** still matter — and S3 (incremental byte-offset index) gets **both** zero seam and exact behavior in **one release**, simpler than S2.

---

## 3. Options weighed

### S1 — Keep two releases + `timings.jsonl` import; patch F9–F13
- **Required patches:** Import `visited` in `seatCommand` (`src/next.ts:1342-1343`, F9); drop `line.includes(slug)` substring filter in `src/timing.ts:134-146` and `JSON.parse` every line (F10, F11); make R2 `seatCommand` append a `prompt` row (F12); make R1 `forgetWait` (`src/state.ts:227-230`) conditional on `appendTiming` succeeding across every R1 writer (`src/timing.ts:85-94`, F13).
- **What it breaks / invites later:** Does not remove the seam. Any future command touching waits, prompts, parking, or `visit_start` must preserve dual-write parity across R1 and R2; `appendTiming` failure still silently drifts on other R1 sites (`park.ts`, `recordWait`). Still requires two sequential releases.
- **F1–F13 fate:** Patches F9–F13 on top of F1/F5–F8 patches; seam stays open for F14.
- **Size:** Largest (~570 lines across 2 commits plus F9–F13 patches).

### S2 — One source of truth: `state.wait` only, no `timings.jsonl` import ever
- **What it breaks / invites later:**
  1. **Still needs two releases if `wait` lives in `state.yaml`:** `814a2387:src/state.ts:125` uses `z.strictObject(...)`, so writing `state.wait` in one release breaks rollback to `814a2387` (violating the 2026-11-22 signpost). Only becomes one release if waits move to a separate file outside `state.yaml` or rollback compatibility is dropped.
  2. **Strands unstarted capacity waiters across upgrade/rollback (F1/F5):** An unstarted leaf queued on capacity under `814a2387` or R1 has `tab === undefined && worktree === undefined && wait === undefined` — identical in `state.yaml` to an unstarted leaf nobody ever ran `akrogon next` on. Because `tests/next.test.ts:1972` forbids `--wake`/`--resume` from allocating unqueued leaves, S2 cannot distinguish them without `timings.jsonl`; waiters queued before upgrade or during rollback require a manual `akrogon next --all`.
  3. **Rollback staleness:** If R2 writes `state.wait = capacity`, rolls back to R1 (which seats/finishes the leaf using `timings.jsonl`), and re-upgrades to R2 without R1 clearing `state.wait`, R2 sees stale `state.wait = capacity` (`resumeRepos` skips it at `7faab20b:src/next.ts:911`, `refill` re-queues it). Avoiding this still requires R1 `forgetWait` (keeping part of the two-release coupling).
  4. **One-time `visit_start` duplicate on upgrade:** Every already-visited open leaf lacks `visited`, so `dispatchLeaf` appends a second `visit_start`, creating a duplicate visit in `src/timing-report.ts:53-76` (accepted in `forks/design.md:25`, minor).
- **F1–F13 fate:** F2/F3/F4 stay fixed; F6–F11, F13 disappear; F1/F5 become accepted manual-requeue on transition; F12 still needs `seatCommand` to append `prompt` (or is accepted on rollback).
- **Size:** Medium (~250 lines across 2 releases if in `state.yaml`; ~150 lines in 1 release if in a separate `<globalHome>` file).

### S3 — One source of truth: `timings.jsonl` only, made cheap via an incremental byte-offset index (no `state.wait`, ONE release)
- **Why not a fixed-byte tail read:** A leaf can wait on `capacity` or `prerequisite` (or have its `visit_start`) 5,000+ lines / 24+ hours before EOF while other leaves log `check_start`/`check_end`. A tail read misses old waits and `visit_start`, stranding waiters and duplicating visits.
- **How an incremental offset index works (`<globalHome>/timing-index/<repoHash>.json`, outside git):**
  - Stores `{ ino, size, mtimeMs, tail, bad, waits: Record<slug, Wait>, visited: string[] }` (disposable derived cache).
  - Measured on this host against `framework/issues/timings.jsonl` (**30.4 MB, 102,732 lines, 1,119 distinct slugs**):
    - **Cold full build** (`readFileSync` + `JSON.parse` all 102,732 lines, checking `kind` ∈ `{wait, prompt, visit_start}`): **61.7 ms total** (`13.0 ms` read + `48.7 ms` parse), **once** per machine/truncation.
    - **Steady-state quiet wake** (`statSync` matches `ino`, `size`, `mtimeMs`, `!bad`): **~0.05 ms** (0 bytes read, 0 parses).
    - **Steady-state busy wake** (`stat.size > idx.size` and 64-byte tail at `idx.size` matches `idx.tail` and `!bad`): `openSync` + `readSync` only `[idx.size, stat.size)` up to the last `\n`, `JSON.parse` the 1–10 new lines, atomic write+rename index: **~0.1–0.5 ms**.
    - **File truncated, replaced, edited in place, or repaired after `bad: true`:** mismatches `ino`/`size`/`tail`/`mtimeMs` → automatic cold rebuild from byte 0 (62 ms).
    - **Malformed lines:** Parsed line-by-line with real `JSON.parse` (no raw substring filter); a malformed line logs a warning, sets `bad: true`, and is skipped without clearing other leaves' valid waits (strictly safer than `814a2387:src/timing.ts:96-106`, which empties the whole repo queue on one bad row).
  - Write path stays **100% `timings.jsonl` only** (zero `state.yaml` writes for waits; add one `prompt` row in `seatCommand` at `src/next.ts:1323-1345` so manual seats end capacity waits uniformly).
- **What it breaks / invites later:**
  - *Same-size, same-mtime, mid-file in-place edit:* won't happen via `appendFileSync`; tests that overwrite files change `size`, `mtimeMs`, or `tail` (and each test fixture has its own `f.home` index).
  - *Concurrent readers/rebuilders:* atomic `<index>.<pid>.tmp` → `renameSync` prevents corrupt files; worst case two wakes both read the same last few lines.
  - *Unwritable `timings.jsonl` (disk full):* `appendTiming` warns (`src/timing.ts:85-94`), same as `814a2387`, with zero two-store divergence.
  - *Index growth:* 1,119 visited slugs in `framework` = ~30 KB JSON (~0.2 ms parse); `timings.jsonl` long-term retention for `akrogon timing` is orthogonal to S1/S2/S3.
- **F1–F13 fate:**
  - **F1, F5, F6, F7, F8, F9, F10, F11, F12, F13: all 10 eliminated by construction** (single source of truth, real `JSON.parse`, no `state.wait`, no `visited` field, no `forgetWait`, no two-release seam; `814a2387` and the new release read and write the exact same `timings.jsonl`).
  - **F2:** wait writes no longer touch `state.yaml` (keep global lock around `landedWake` dependent dispatch anyway).
  - **F3, F4:** already fixed; ship together in the **single release** with open-only inventory and residue removal.
- **Size:** Smallest overall (~65 lines in `src/timing.ts`; **deletes** `state.wait`, `state.visited`, `forgetWait`, `importWaits`, `importWait`, `knownState`, `promptEndsWait`, `leafTimings`, `timingText`, and the entire second release).

---

## 4. Recommendation

**Recommend S3 (incremental byte-offset index on `timings.jsonl` in `<globalHome>/timing-index/`, single release).**

It is the only option that **eliminates the seam completely** (killing all 10 findings F1 and F5–F13 in one stroke), collapses **two releases into one** (zero `stateSchema` changes, seamless forward/backward compatibility with `814a2387`), matches S2's steady-state wake speed (**~0.05–0.5 ms** vs 2,400 ms today; **62 ms** cold on `framework`'s 30 MB log), and never strands waiters or duplicates `visit_start`.
