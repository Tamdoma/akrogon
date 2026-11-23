# Rebuttal (slot C, disagreement-only)

1. **Q1.2 — Deleting `taken8Trigger` in Chart 1 breaks `mainRedCover` (factual error in merge lines 17–18).**
   - `taken8Trigger` (`src/land.ts:143-168,218-237`) is **not** a head rerun; it triggers `verify(..., knownRed=true)` on **`main` (base)**.
   - It is the **only** path in `land.ts` that writes a `compares` base receipt, which `uncoveredMainRedUnits` (`src/verify.ts:355`) requires to cover later leaves against a new main red. P1 reruns on HEAD, which still fails on a deterministic main red. Deleting `taken8Trigger` while holding X6 leaves zero automatic base-pass creation in the merge lane. Keep `taken8Trigger` until X6 replaces it.

2. **Q1.2 — `B 1a` ("no key = today", no nameless rerun) makes Chart 1's own metric unmeasurable on framework.**
   - Neither `akrogon` nor `framework` has a `rerun` key yet, and 10 of 12 framework reds on 11-22 were nameless timeouts. Shipping `B 1a` alone leaves framework's red share and same-head bounces unchanged until both a framework config edit AND Chart 2/3 land. Either seed framework's `rerun` key before measuring Chart 1's figure, or measure Chart 1 on `akrogon` + synthetic/unit tests and measure framework after the seed.

3. **Q3.1 — Keeping `akrogon.slice` at `CPUWeight=20` caps `akrogon-land.slice` at 16.7% CPU against `app.slice` (cgroup v2 hierarchy fact).**
   - A dashed unit `akrogon-land.slice` is a **child** of `akrogon.slice`. Raising its weight only beats sibling leaf slices inside `akrogon.slice`; against `app.slice` (`CPUWeight=100`: Chrome, editors, door/consultant agents), the whole `akrogon.slice` subtree (land included) still gets only `20 / (20 + 100) = 16.7%` CPU.
   - Live check confirms `user@1000.service/cgroup.subtree_control` has `cpu memory pids`, while `akrogon.slice/cgroup.subtree_control` has only `memory pids` until a child sets `CPUWeight=`/`CPUAccounting=yes`. To prioritize land over `app.slice` without letting leaf work starve the desktop, make the land slice a **sibling** (`akrogon_land.slice`, `CPUWeight=100`+) or raise `akrogon.slice` and lower leaf slices.

4. **Q3.3 — `B 5a` gives zero backpressure to any repo without `repo.config.max_active`.**
   - `repo.config.max_active` is optional (`src/config.ts:64`, absent in `akrogon/issues/config.yaml`) and `capRefusal` skips the per-repo check when `cap === undefined` (`src/next.ts:415`).
   - Fix: count a repo's merge waiters (excluding the 1 landing) against `repo.config.max_active ?? global.max_active` per repo. Same existing knob, zero new config, works on every repo without cross-repo starvation.

5. **Q2.1 — Misread of C on `refused-root` + Chart 2 stall risk.**
   - Merge line 25 attributes deleting `refused-root` keep (`src/run-check.ts:358-364`) to B,C. C proposed deleting only `.akrogon-kept` (`:466`). `refused-root` holds only `refusal.json` + `out.log` (tiny) when a leaf closed mid-run; deleting it loses publish-refused logs silently. Keep `refused-root`.
   - Gating Chart 2 (the 163 s → 0.3 s timeout fix) on an external `framework` repo seed (lines 26, 64) stalls both Chart 2 and Chart 3 behind another repo's PR. Ship Chart 2 immediately exporting `AKROGON_EVIDENCE_DIR` (stdout/stderr already live in `check-*.log`); only keep red `TMPDIR` for `--sessions` (paid) runs if a bridge is truly needed.

6. **Material items silently dropped from `map-merged.md` (missed in Charts 1–6 and Held/Dropped):**
   - **Chart 1 (`#151` gap):** `reconcileHost` (`src/reconcile.ts:1304,1378`) still runs `systemctl reset-failed` globally on *all* `akrogon-run-*` units across homes; scope `akrogon-run-*` for non-default homes too so test suites and live install never cross-reset.
   - **Chart 1 or 4 (`buildStack` worktree waste):** `src/batch.ts:83-120` creates and removes a sparse worktree on *every* land even on fast-forward (`isAncestor(builtOn, holderHead)`) with no retired lessons — tiny fast-path skip, zero new parts.
   - **Chart 4 (bookkeeping & bug):** `waitPass` (`src/verify.ts:923-927`) re-reads full `out`/`err` from byte 0 every 200 ms (`O(N²)`); `requireFrozenCitations` (`src/phase.ts:640-646`) demands `Test-Change:` on frozen paths no longer changed against `from`.
