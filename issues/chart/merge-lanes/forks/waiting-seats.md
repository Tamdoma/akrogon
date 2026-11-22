# Waiting seats: leaves waiting in merge and the host-wide seat cap

## Question

Q1. Which leaves stop counting against `max_active` under lock 6a: every leaf in phase `merge` (the holder's land run has no seat; off-line red work is in `check.repair` after red-exit and still counts), in both branches of `activeCount` (live session and unreadable session)?

Q2. Under red-exit no seat is prompted while a leaf is in `merge`. Do the two idle seats of a waiting leaf stay alive (fast hand-off on a red exit, about 0.65 GB per leaf held), or does akrogon close one or both at merge entry (memory freed, a cold seat start and re-read on a red exit or `check.fix`)?

Q3. Should a capacity refusal (`allocate` returns null) record a wait reason, so how often the cap blocks a leaf can be counted before and after?

### Carries

- Locks: forks/signposts.md `## Taken` (6a waiting merge leaves stop counting; 1a speed from first entry; hard limits PC inside its limits, token cost does not grow).
- Taken here: forks/red-exit.md (red and seat hand-offs leave to `check.repair`; no seat prompted in `merge`).
- History: merge-turn forks/merge-order.md Q2 (operator 2026-10-05: waiting leaves keep tab and slot; foreclosed uncounted waiting tabs and closing tabs; reason "wait is at most one run, B keeps review context").
- Map: slots/map-merged.md (activeCount, allocate, idle seat RSS, akrogon.slice limits).

## Findings

Blind notes slots/waiting-seats-A.md, -B.md, -C.md; merged slots/waiting-seats-merged.md; rebuttals slots/waiting-seats-rebuttal-B.md, -C.md; final-shape check slots/waiting-seats-final-shape.md with slots/waiting-seats-final-check-B.md, -C.md.

- The cap binds on waiters: seated leaves reached 12 or more for 11.8 h of the week, 9 to 13 of them in `merge`; working leaves never passed 10 (B, framework and akrogon ledgers 2026-11-14..21). Live, 6 framework merge leaves and 2 akrogon leaves held 8 of 12 (C).
- A waiting merge leaf holds about 0.5 GB of process memory; slice peak 47.7 GB against MemoryHigh 64 GB, no swap, memory.events high 0 (A,B,C, `akrogon.slice` 2026-11-21).
- Merge wait median 48.9 min, p90 185 min; the 2026-10-05 reason "wait is at most one run" no longer holds (B).
- A B wake after 3 h idle misses the cache 95% of the time, 153k uncached tokens median, against 23k for a new seat; 73 of 201 landed leaves needed B only for the broadcast (B, codex session records).
- A cap refusal writes `wait none`, one of seven `none` writers, so cap waits cannot be counted today (B,C, `src/next.ts` `dispatchLeaf`).
- `sliceKeepReason` (`src/reconcile.ts`) keeps no slice for a command-owned land run, so a holder whose seats die is exposed during setup, gates and push (B, C).
- Practitioner, read 2026-11-21: GitLab merge trains cap running pipelines, not the queue (https://docs.gitlab.com/ci/pipelines/merge_trains/); Zuul bounds the active window, not the queue (https://zuul-ci.org/docs/zuul/latest/gating.html) (B).

## Taken

A's pick under autopilot, 2026-11-21 (signpost 6a, hard limits PC inside its limits and token cost does not grow, and the operator's values simplicity and no new parts decided it). Peers agreed on every item; no standing dissent.

1. `activeCount` (`src/next.ts`) stops counting leaves in phase `merge` in both branches: the `unfinished` test that both branches and `seated` use excludes `merge`. `check.repair` counts. `unknown` and `unreadable` terms unchanged. A red exit keeps its live-seat exemption in `allocate`, so the count may pass 12 by about one leaf per line turn. The `max_active` prose (`docs/reference/config.md`, `skills/init-akrogon/`, the `seatCommand` error in `src/next.ts`) says it counts leaves outside merge. This reverses the 2026-10-05 merge-turn forks/merge-order.md Q2 foreclosure of uncounted waiting tabs; signpost 6a is the operator's own later answer. Rejected: counting the holder (it has no seat, and needs `mergeQueue` per repo in a host-wide count); live branch only (a refused session would still count merge leaves).
2. Both seats of a waiting merge leaf stay alive; no close path. Reasons: fast hand-off and no new code (not cheap tokens, since a long-idle B wake is often uncached). Rejected: close both (cold B on most leaves, false `seat_lost` strikes, the returning leaf meets the cap); close A only (needed by about 1 in 5 leaves, saves about 0.3 GB a waiter); idle-age close (a timer and a close path for at most 7 GB today, saving unproven).
3. `capacity` joins `waitReasonSchema` (`src/timing.ts`) and `waitOrder` (`src/timing-report.ts`); `dispatchLeaf` writes it where `allocate` returns null. `broadcastPass` writes no row (reports stop at `merged`; a refusal there needs both seats dead).
4. Pending step, no code: after this lands, read `akrogon.slice` `MemoryPeak` and `memory.events` high, and per-repo merge depth. Reopen (idle-age close, broadcast-only wakes first; `max_active`; a queue bound) when MemoryPeak nears MemoryHigh, memory.events high moves off 0, or more than 20 leaves wait in one repo's merge. Before figure: B's M1 (hours with 12 or more seated), an upper bound that also overcounts; the after figure is hours with an open `capacity` wait, so a drop reads larger than it is.
5. Carried to the red-exit leaf: `sliceKeepReason` gains a reason that keeps a leaf slice while the leaf is in `merge` and `state.batch` is set (only the holder has a batch, and red-exit clears it on every exit). A plain state read, since `sliceKeepReason` is synchronous and `landAlive` is not (B Z1).
