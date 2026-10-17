# Intake: status-age

## Scope
`akrogon status` AGE column shows how long a leaf took from start to end instead of time since its last phase move. One leaf in akrogon, `src/status.ts`.

## Provenance
- Operator: chart-issues door, 2026-10-17

## Source: operator 2026-10-17
[Image #2] <- Instead of age showing in the status report, can we actually show the age how much time it took for everything to go from zero to the end? Because this just goes up every time I refresh the status, which doesnt make any sense. This should be a quick change, so I don't think there's any need for consultants and for I think you can do it yourself.

## Agent findings
- `src/status.ts` `cells`: AGE is `now - ts` of the last `log.jsonl` record whose `to` equals the current phase, in whole minutes. For a merged leaf that is time since merge, so it grows on every refresh (screenshot: block-ledger `merged 1048m`).
- `log.jsonl` has no record for the start of planning: the first move is `plan.synthesis -> implement`, so it misses plan time.
- `issues/timings.jsonl` (`src/timing.ts` `readTimings`) has `visit_start` visit 0 when `akrogon next` first sees a leaf, and `prompt` with `outcome: delivered` for each seat prompt.
- framework/new-rules-pilot: first `visit_start` 2026-10-16T13:50:32Z, first delivered prompt 2026-10-17T07:27:50Z. It waited ~17.5h on `blocked-by` between them.
- framework/block-ledger: first delivered prompt 2026-10-16T13:50:15Z, merged 2026-10-16T14:19:41Z, so start-to-merge is 29m.
- Busy seats already show their own running clock in NOTE (`busy A 0h04m`, `note` in `src/status.ts`).
- `tests/status.test.ts` asserts AGE values (`7m`, `12m`, `-`), so tests change with the column.
- Single slot: operator declined peers. Direct route needs a B reviewer pane, none named.
