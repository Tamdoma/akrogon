# Chart: whole-system flow after the 10-14/10-15 fixes

## Destination
Operator 2026-10-15: "look at the whole system from the system's perspective mentioned in the PDF. See if we can do further optimizations where we can cut down the production time even more ... without sacrificing the quality and without ruining the stability of the system. Focus mostly on the biggest bottlenecks that we have today that are still lingering. Use the logs and data from the past week compared to past twenty-four hours ... Also use the research process based on the charting process."

Lens: sources/systems-thinking-field-manual.pdf. Data: slots/data-pack.md. Maps: slots/map-A/B/D/E.md, merged slots/map-merged.md, rebuttals slots/rebuttal-B/D/E.md. Rework classification (Haiku, 31 W1 leaves, 102 findings): 45% real defects, 24% missing test or proof, 15% evidence format, rest small.

Route: lifecycle (debate no) for Q3; Q1 and Q2 landed direct.

## Forks taken
- [Delivery order](forks/delivery-order.md): one chart at a time, settled chart hands off at once, door takes the next chart itself. Landed akrogon 23abf2f, d063067, 9a99be0, ed0a05d; reviews slots/q1-final-check-B/D/E.md, q1-recheck-B/D/E.md, q1-recheck2-B.md (ready); verify green on ed0a05d (direct/).
- [Repair loop](forks/repair-loop.md): 2a. Landed akrogon 23abf2f, framework 176e96f2d; B review slots/review-2a-B.md; verify green (direct/).
- [Flow view](forks/flow-view.md): 3a, one akrogon leaf; factory rule changes paused until about 20 leaves run under today's rules, compared with `akrogon timing --cohort --since 2026-10-15T07:25:26Z`. Leaf issues/open/issue-flow/issue-flow-report; draft reviews slots/draft-review-B/D/E.md applied.

## Open forks
None.

## Fog

## Off route
- Bundle single-consumer chains into one leaf (A): withdrawn. Rework and merge reds concentrate in the biggest leaves (D); the chain wait is one snapshot (C2). Cross-leaf consumer criteria on the producer leaf break an existing audit line (shapes.md:287), not a missing rule (B, D).
- Collapse plan.solo (E): no such phase. Delete `scope: base` and red-records (D): historical rows still parse through the schema (B F5); no time gain.
- B mechanical golden and debt-list syncs (E, M4): foreclosed by Q2 2a.
- Paused by Q3 until the 20-leaf comparison, then new intake:
  - 10-14 08:52Z-14:58Z four leaves with check_start and no check_end; instrumentation gap, cause unknown (E, B F7). D: record host pressure on check_end. `akrogon timing <slug>` already prints these as `incomplete`.
  - Frozen-test citation gate asks for an empty citation commit when main, not the leaf, changed a frozen test file (src/phase.ts:470-478; prior-disavow-lookup, 2 empty commits) (E). Seen once.

## Pending steps
None.

Handed off 2026-10-15
