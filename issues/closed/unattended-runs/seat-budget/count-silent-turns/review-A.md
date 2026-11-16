# Review A: count-silent-turns

Base: `fdb5fdc2` (post-refresh). Reviewed head: `c3ecd335` (tip = two trailer-only cite commits; product head `fd8a14d9`). Diff `fdb5fdc2...c3ecd335`: 13 files, +444/−41. Sources: brief.md, design.md (signposts `1a`–`7a`, turn-count Q1–Q5 + final-shape correction), plan.md incl. implementation notes, implementation/report.md, plan-run record in plan.md.

## Evidence read

- `src/next.ts` `dispatchSlot` full diff: counting point (`prompted` object + same address + `prompted.turn < seat.turn`), `liveRuns` gate ahead of the count write, single `saveState` (attempts+1, prompted cleared, lost reset) before the send, fail at 3 with the locked reason; finished-or-missing branch: `not_found`-only catch, silent-end-first split, `seat_lost` row → `end()` → `lost+1` → fail-or-replace order; `deliver` and `startSeat` `+1`s removed; `commitMove`/`stateSchema`/`timingEventSchema`/`terminalSchema` field additions match the design's literal shapes.
- Traced consequences: a throwing redelivery leaves the count charged once with `prompted` cleared → `deliver` path (no recount, send retried); a `not_started` resettle writes `prompted` without counting, its end is counted at the same point later; `startSeat` failure between its own `record()` and proof charges `lost` next pass (seat ref already recorded); `commitMove` resets `lost` on every move; failure at 3rd loss starts nothing.
- Timing seam: `seat_lost` joins the discriminated union; `readTimings` all-or-nothing stated in report; `timing-report.ts` reads only `prompt`/`seat_done`/`check_*`/`wait`/`visit_start`/`repo_pause`/`batch` kinds — unaffected.
- AREA.md (39 lines, sections intact): its named paths verified live — all `src/*`/`tests/*`/`docs/*` pointers exist; the only misses are runtime artifacts (`issues/*.jsonl`, `deploy.yaml`, `config.yaml`), pre-existing naming style, not introduced by this leaf. Doc rows for `attempts`/`lost`/timing kinds match the implementation.
- Report obligations: open-leaf `attempts ≥ 2` scan run and recorded (none in any registered repo); timing seam stated; proof corrections recorded (`-t 'lost seat|start proof'` union under the equivalence guard; test corrections carry `Test-Change` trailers citing hc turn-advancement output and admission `full` requirements).
- Proofs on head: all criterion run-checks green (`impl-c1`…`impl-c4r`), `akrogon verify` green on `fd8a14d9` (1208 tests, log `implementation/check-test-1794846429573-3219342.log`). Plan-run reds on base recorded in plan.md.
- hc semantics check (implementation note): verified against `hc get --json` output the tests print — `turn` advances on `hc kill`, SIGTERM and SIGKILL alike, so a mid-turn death is indistinguishable from a silent end and lands there by the design's own `prompted.turn < seat.turn` rule; `lost` covers missing terminals and pre-prompt deaths. This is the design's intent, not a gap: the brief says "finished or gone" but the design's own counting-point rule keys on the turn record, and the start-proof-death case keeps the finished-loss path exercised.

## Findings

No Fixes.

N1 — `tests/next.test.ts` keeps the test title "failed seat starts keep the leaf in phase, uncharged, until a start succeeds" while the charge is now `lost`. Name-only staleness; deferred: renaming churns the test for zero signal, and the body's assertions document the new meaning.

N2 — In the silent-end replacement path `startSeat` receives the pass-start `recorded` state rather than the post-count read. `startSeat` rereads state inside its own `record()` so the value used is fresh; the plan text suggested a fresh read. Cosmetic divergence, no reachable wrong state.

## Verdict

`nits`
