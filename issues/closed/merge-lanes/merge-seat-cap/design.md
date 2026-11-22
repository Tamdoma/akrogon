# Design: merge-seat-cap

## Binding decisions, verbatim

### forks/signposts.md `## Taken` (issues/chart/merge-lanes)

Operator, 2026-11-21T17:48Z, door t2z2, verbatim: "1a | 2a - test it but it was slower before, I don't think it's worth it | 3a | 4b | 5a | 6a | What did Fable and Neon come up with?"

Account: the session ranks merge speed first, counted from a leaf's first entry into merge to landed with failed rounds included, under three hard limits: no leaf adds a new test failure to main, the PC stays inside its limits, token cost does not grow. Each leaf is still tested alone (no batching). A framework chart that brings the merge suite back toward its early-November ~5 min is taken first (4b, the operator's yes to that chart), then merge-lanes. In merge-lanes a failed merge leaves the line at once and is retested or repaired off the line (5a), and leaves waiting to merge stop counting against max_active (6a). Two suites at once is measured with the N2 probe after the suite fix lands, and is allowed only if neither run is more than 1.25x slower and no new test fails; the operator expects it not to pay off. Given up: batching, red-then-revert landing, any extra PC load without a passing measurement.

Order: 1. suite-regrowth (framework, /home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth), 2. merge-lanes (akrogon). Nothing dropped.

### forks/waiting-seats.md `## Taken` (issues/chart/merge-lanes)

A's pick under autopilot, 2026-11-21 (signpost 6a, hard limits PC inside its limits and token cost does not grow, and the operator's values simplicity and no new parts decided it). Peers agreed on every item; no standing dissent.

1. `activeCount` (`src/next.ts`) stops counting leaves in phase `merge` in both branches: the `unfinished` test that both branches and `seated` use excludes `merge`. `check.repair` counts. `unknown` and `unreadable` terms unchanged. A red exit keeps its live-seat exemption in `allocate`, so the count may pass 12 by about one leaf per line turn. The `max_active` prose (`docs/reference/config.md`, `skills/init-akrogon/`, the `seatCommand` error in `src/next.ts`) says it counts leaves outside merge. This reverses the 2026-10-05 merge-turn forks/merge-order.md Q2 foreclosure of uncounted waiting tabs; signpost 6a is the operator's own later answer. Rejected: counting the holder (it has no seat, and needs `mergeQueue` per repo in a host-wide count); live branch only (a refused session would still count merge leaves).

2. Both seats of a waiting merge leaf stay alive; no close path. Reasons: fast hand-off and no new code (not cheap tokens, since a long-idle B wake is often uncached). Rejected: close both (cold B on most leaves, false `seat_lost` strikes, the returning leaf meets the cap); close A only (needed by about 1 in 5 leaves, saves about 0.3 GB a waiter); idle-age close (a timer and a close path for at most 7 GB today, saving unproven).

3. `capacity` joins `waitReasonSchema` (`src/timing.ts`) and `waitOrder` (`src/timing-report.ts`); `dispatchLeaf` writes it where `allocate` returns null. `broadcastPass` writes no row (reports stop at `merged`; a refusal there needs both seats dead).

- Excluded here: forks/waiting-seats.md Taken 4, owned by the door, a pending step.
- Excluded here: forks/waiting-seats.md Taken 5, owned by leaf merge-red-exit.


/home/ivan/.akrogon/releases/4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444/skills/chart-issues/assets/standing-design.md

How it applies here: the predicate and the wait reason are mechanical, proven by own tests in `bun test` at the command boundary with the existing hc and temporary-repo test helpers; no new machinery. Each behavior shows one deliberate break turning its test red. The `max_active` prose is read by the reviewing seat. forks/red-exit.md Taken and forks/extras.md Taken are excluded here, owned by leaves merge-red-exit, main-red-cover, flaky-merge-flips and slow-alarm-baseline.

## Leaf architecture

- Owned surfaces: `src/next.ts` `activeCount` (the `unfinished` test both branches and `seated` use excludes `merge`) and `dispatchLeaf` (the `allocate` null branch writes `capacity`); `src/timing.ts` `waitReasonSchema`; `src/timing-report.ts` `waitOrder`; the `seatCommand` capacity error text; `docs/reference/config.md`, `docs/reference/limits.md` and `docs/use/run-work.md` `max_active` text; `docs/reference/files.md` wait reasons.
- Literal interfaces: the new wait reason literal is `capacity`.
- Consumers of changed state: `allocate` is `activeCount`'s only caller and gates `dispatchLeaf`, `broadcastPass` and `seatCommand`; `broadcastPass` writes no wait row (decided); `src/timing-report.ts` readers of wait kinds; a timing ledger holding `capacity` does not parse under an older akrogon.
- Until leaf merge-red-exit lands, a seat can still work for a holder in `merge`, uncounted: at most one per repo, the same size as the accepted red-exit overshoot. No ordering is needed.
- Exclusions: closing idle seats (not taken); the reopen readings (the door, a pending step); the slice rule (leaf merge-red-exit).
