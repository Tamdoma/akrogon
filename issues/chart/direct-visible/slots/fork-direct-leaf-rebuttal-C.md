# Rebuttal: slot C — direct-visible / direct-leaf

Disagreement-only rebuttal to `fork-direct-leaf-merged.md`.

## Disagreements under "Where slots differ"

### 1. Review at `fix_rounds` 0 (disagree with B and D; hold A,C)
- **B ("door writes a genuine blind A review of its own work")** breaks review honesty and wastes tokens: slot A is the exact same terminal and conversation that just implemented the change, so a "blind" self-review is structurally impossible. It also contradicts `skills/chart-issues/assets/direct-route.md` (`# Direct route` step 3) and `docs/use/quick-fix.md` (`## What it skips and what it keeps`: "it keeps seat B review") `[Tier 2, 2026-11-25]`.
- **D ("door records A's verdict from its own proof runs")** corrupts audit and timing records: `src/phase.ts` `transition` writes `verdict.A` and a `seat_done` row for slot A into `issues/timings.jsonl` and `issues/log.jsonl`, recording a review that never happened just to work around a 1-line check in `src/routing.ts` `requiredSlots` `[Tier 1, src/routing.ts requiredSlots & src/phase.ts transition, 2026-11-25]`.
- **Position**: `requiredSlots` (and `historicalSlots` in `src/routing.ts` / `src/timing-report.ts`) returns `['B']` for a direct leaf at `check.review` regardless of `fix_rounds`.

### 2. Repair after a `fix` verdict (disagree with D; hold C)
- **D ("door hops `check.repair -> check.fix` on B's review file and repairs as A")** breaks slot attribution and timing data:
  1. `src/routing.ts` `routing` assigns `check.repair` to `slots: ['B']`. When the door runs `akrogon phase <slug> check.fix` without `--slot`, `src/phase.ts` `transition` defaults `slot` to `required[0]` (`'B'`), so `src/log.ts` `logMove` logs slot B (and B's transcript session) as having moved `check.repair -> check.fix` when A performed a zero-work hop `[Tier 1, src/routing.ts routing, src/phase.ts transition, src/log.ts logMove, 2026-11-25]`.
  2. Every review-fix round injects a bogus zero-duration `check.repair` visit into `issues/log.jsonl` and `issues/timings.jsonl`, skewing `akrogon timing`.
  3. It still leaves `akrogon land` repair exits (`src/land.ts` `repairExit`, `src/next.ts` `mergeTurnExit` -> `check.repair` with `merge_exit`) assigned to slot B, even though direct B "commits nothing" (`skills/check-issue/SKILL.md` `## Standalone review`) `[Tier 1, src/land.ts repairExit, 2026-11-25; Tier 2, skills/check-issue/SKILL.md ## Standalone review, 2026-11-25]`.
- **Position**: Route a direct leaf's `check.review` `fix` verdict straight to `check.fix` (incrementing `fix_rounds` in `src/phase.ts` `commitMove`), and let `check.repair` on a direct leaf (entered only from `merge` exits) accept slot A so the door legitimately triages `merge_exit` (escalating `check.repair -> check.fix` when code/conflict edits need B's re-check, or returning unedited to `merge`).

### 3. `TIME` staying `-` (mis-tagged / under-stated as an open question)
- Attributed only to B's OQ1; C raised the same gap. More importantly, leaving it unresolved violates the operator lock ("`akrogon status` shows it exactly like a lifecycle leaf"): `src/status.ts` `starts` computes `TIME` and `status --json` `merges[].total_ms` strictly from `kind === 'prompt' && outcome === 'delivered'` rows in `timings.jsonl`, which only `dispatchSlot` and `seatCommand` write `[Tier 1, src/status.ts starts / cells / statusCommand, src/next.ts dispatchSlot / seatCommand, 2026-11-25]`. Without either an initial `prompt` row from the creation verb or a `visit_start` fallback in `starts` for direct leaves, every direct leaf displays `TIME: -` for its entire life and `total_ms: null` after merge.

### 4. Door's wait on asynchronous `akrogon land` (disagree with D; hold C)
- **D ("stay in the turn watching the leaf leave `merge`")** blocks the entire charting door during queued merges and long `merge_checks` (minutes per run), risks shell/turn timeouts, and forces polling inside the turn. In multi-chart autopilot sessions (`INTAKE.md`: 5 charts in one session), it prevents moving on to the next chart while `land` runs `[Tier 1, src/land.ts launchLand / landAttempt, 2026-11-25; Tier 2, issues/chart/direct-visible/INTAKE.md ## Observation, 2026-11-25]`.
- **Position**: Do not poll in-turn. Wake the door (or notify `state.seat.A` when idle / on a non-polling completion hook) when a direct leaf leaves `merge` into `merged`, `check.repair`, or `failed` so the door updates `CHART.md` or enters `check.repair` without burning a turn waiting on the queue.

### 5. Broadcast recipient (disagree with A; hold B,C,D)
- **A ("send broadcast to the door A")** breaks four existing mechanisms and hurts operator/autopilot UX:
  1. `src/state.ts` `broadcastPending` checks `prompted.B === undefined`, `src/reconcile.ts` `broadcastInProgress` watches `state.seat.B`, `src/next.ts` `broadcastPass` dispatches slot `B`, and `skills/broadcast-issue/SKILL.md` (`# Broadcast issue`) specifies `slot=B` `[Tier 1, src/state.ts broadcastPending, src/reconcile.ts broadcastInProgress, src/next.ts broadcastPass, 2026-11-25; Tier 2, skills/broadcast-issue/SKILL.md # Broadcast issue, 2026-11-25]`. Sending to A forces a slot-A fork in all four places.
  2. In autopilot, A is immediately charting the next issue; sending `broadcast-issue` to A either blocks behind A's multi-chart work or injects Discord formatting/webhook work and `Next: none <issue already merged>` into the operator's interactive charting conversation.
  3. A's premise that A's address is permanent while B restarts is asymmetric: A also hands over across sessions (noted in `Open questions raised` by B and in `direct-route.md` `Repair bound`), while the door controls when consultants restart and already has the verb to rewrite `seat.B`.
- **Position**: Keep B as the broadcast recipient via `hc send --if idle` with `prompted.B` as ack, and require the door to check `broadcastPending` (or rewrite `seat.B`) across consultant restarts.

### 6. Plan and report location (disagree with A leaving plan "Open"; hold B,C,D)
- Leaving `plan.md` outside the leaf folder breaks `src/status.ts` `statusCommand` and `leafJson`, both of which hardcode `resolve(leaf.path, 'plan.md')` `[Tier 1, src/status.ts statusCommand / leafJson, 2026-11-25]`. It also splits check/verify logs (`resolve(leaf.path, 'implementation')` in `src/run-check.ts` `leafTarget` and `src/verify.ts` `verifyCaller`) from `plan.md`/`report.md`, and leaves `issues/closed/<owner>` missing the plan and report after `completeOwner` archives the owner `[Tier 1, src/run-check.ts leafTarget, src/verify.ts verifyCaller, src/phase.ts completeOwner, 2026-11-25]`.
- **Position**: Write `<leaf>/plan.md` and `<leaf>/implementation/report.md`.

## Other points in the merged notes that are wrong, missing, or would break something

### 1. Abandon/Held moving the leaf to `failed` (Pitfalls — wrong, breaks `status` and panel `red`)
- The merged pitfall says: "Abandon or Held leaving a live-looking row (A,B,C,D): the leaf moves to `failed` with a reason".
- Moving an intentionally abandoned direct attempt to `phase: 'failed'` breaks `status` and the bar panel:
  - `src/phase.ts` `announceFailed` writes an `attention: true` desktop failure notice `[Tier 1, src/phase.ts announceFailed, 2026-11-25]`.
  - `src/status.ts` `statusCommand` prints a permanent `Failed: <repo>/<slug>` banner on every `akrogon status` run, and `leafAttention` sets `leaf.red = true`, keeping the envelope `red` count non-zero indefinitely `[Tier 1, src/status.ts statusCommand / leafAttention, 2026-11-25]`.
  - Parking it (`issues/parked/<owner>`) still prints a permanent `parked` row in `akrogon status` (`src/status.ts` `statusCommand`).
- **Fix**: Abandoning an unmerged direct attempt must remove the unlocked worktree, delete the local branch, and remove `issues/open/<owner>` (leaving `CHART.md` `Held <date>` as the record) — never leave it as `failed` or `parked`.

### 2. `door: <chart path>` field (Q1 record — risk of stale coupling)
- A proposes `door: <chart path>` in `state.yaml`. Nothing in `src/` mutates `CHART.md`, and chart layouts vary (single-chart `issues/chart/CHART.md` vs `issues/chart/<name>/CHART.md` in `src/status.ts` `chartFolders`) `[Tier 1, src/status.ts chartFolders, 2026-11-25]`. Carrying a path that engine code does not validate risks stale-path drift without benefit; a plain boolean `direct: true` is the smallest field (signpost `3a`).

### 3. Overstating what `land` replaces on first-time base reds (Q2 landing — missing `check.repair` requirement)
- The merged note states: "Lost: the door's two-log known-red judgment and its seed filing; land's own cover (`uncoveredMainRedUnits`, taken-8) replaces it (B,D)."
- That is incomplete and would break direct landing on any brand-new or unnamed base red: `src/land.ts` `taken8Trigger` ONLY fires when a leaf returns unedited after a prior red merge run on the exact same `holder.head` AND every failing unit has a real test name `[Tier 1, src/land.ts landAttempt / taken8Trigger, 2026-11-25]`. On the first red merge run (or any unnamed red), `landAttempt` ALWAYS calls `repairExit` -> `check.repair` with `merge_exit: { reason: 'red', run, top }`. Direct mode therefore cannot drop known-red handling completely — the door's `check.repair` handler must still inspect `merge_exit.reason === 'red'`, run `akrogon verify --known-red` (and file a seed on confirmed base red), and return the leaf to `merge` (where `src/phase.ts` `transition` already exempts unedited `merge_exit.reason === 'red'` returns from re-checking `leaf` receipts) `[Tier 1, src/phase.ts transition, 2026-11-25]`.

### 4. Reverse `hc send` race on broadcast (Pitfalls — missing door-side mitigation)
- The merged pitfall says only: "Reviewer mid-exchange receiving the broadcast (C,D): idle or done gate at send."
- `hc send --if idle` in `broadcastPass` protects B from being interrupted mid-turn, but does NOT prevent the reverse collision: `broadcastPass` delivers `broadcast-issue` to idle B right before the door sends B its next charting brief. Under `/home/ivan/.claude/skills/chart-issues/assets/questions.md` `## Blind peer exchange` (`Asking`), the door sends to a door-created consultant based on its last wake (without running `hc get`) and treats `started: false` as a hard error reported to the operator `[Tier 2, questions.md ## Blind peer exchange, 2026-11-25]`.
- **Fix**: Pair `hc send --if idle` in `broadcastPass` with requiring the door to check `hc get <B>` (or wait for `broadcastPending` / B idle) before its next ask to B after a direct leaf enters `merge`.

### 5. Repo with no `broadcast` config sending a failing prompt to live consultant B (Pitfalls — breaks live consultant)
- The merged pitfall dismisses this as "same for direct leaves, no change in this leaf."
- On a lifecycle leaf, a failing `broadcast-issue` runs in a throwaway B seat that `reconcile` immediately kills. On a direct leaf, `B` is the live, reused charting consultant: sending `broadcast-issue` when `repo.config.broadcast` is unset triggers a guaranteed error (`skills/broadcast-issue/SKILL.md` `## Send`: "an empty list is an error"), wastes a paid model turn on the live consultant, pollutes its context, and creates an unnecessary `hc send` busy window `[Tier 1, src/phase.ts commandMerged & src/config.ts repoSchema, 2026-11-25; Tier 2, skills/broadcast-issue/SKILL.md ## Send, 2026-11-25]`.
- **Fix**: Gate `state.broadcast` creation in `src/phase.ts` `commandMerged` on `repo.config.broadcast !== undefined` (or non-empty `webhook_env`), which is a 1-line improvement for both direct and lifecycle leaves.
