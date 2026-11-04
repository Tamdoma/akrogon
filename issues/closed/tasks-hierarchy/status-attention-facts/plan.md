# Plan: status-attention-facts

`akrogon status --json` gains per-leaf `attention` (recorded facts needing the operator) and `waits_on` (unfinished idle required seats). `red` becomes `attention.length > 0`; envelope `red` keeps its meaning and grows with the two new facts. All changes sit in `src/status.ts` plus its JSON test file; text view untouched.

## Decisions

- D1 — `JsonLeaf` gains `attention: string[]` and `waits_on: ("A" | "B")[]`; `red` is computed as `attention.length > 0` (design interface, verbatim).
- D2 — One `attention` computation replaces `leafRed`: entries emitted in fixed order — failed fact, missing gaps, prompt errors (seat A then B), waiting-on dependencies, merge job — reusing the `blockedBy` labels and `undelivered` condition already in the file. `leafJson` awaits `landAlive` once and shares the result between the `land` field and the merge-job fact.
- D3 — `waits_on` = `requiredSlots(state.phase, state.fix_rounds)` (imported from `src/routing.ts`, read-only) minus seats in `state.done` and seats with `busy_since` set, keeping returned order (A then B). `merged`/`failed` have empty `requiredSlots`, so they yield `[]` with no special case.
- D4 — Phrases exactly: `failed: <cause>: <reason>` or `failed`; `missing <kind> <name>`; `A prompt <code>` / `B prompt <code>` (seat capitalized as `note()` renders it); `waiting on <slug> (<label>)` emitted only for labels `parked`, `missing`, `unreadable` — `merged` and live-phase labels produce no entry; `merge job stopped`.
- D5 — Merge-job fact requires all three: `landAttempt(state)` defined (phase `merge` and `batch.owner === 'command'`), `landAlive` false, and `batch.recorded !== true`. Live unit, pushed-and-recorded land (reconcileBatch owns it), seat owner, or any other phase → no entry.
- D6 — Tests live in `tests/status-json.test.ts`: the strict `leafSchema` gains required `attention`/`waits_on` keys, so every envelope-parsing test in the file goes red at the test commit and green only once the product fields land — recorded here as the intended red-first state. The `landAlive` seam is `fakeSystemctl` (`tests/helpers.ts`), already used by `green-merge.test.ts`: `FAKE_SYSTEMCTL_DB` + `systemctl` shim on `PATH`.
- D7 — `docs/reference/commands.md` `--json` row names the two new leaf fields. No other agent or human doc states the JSON shape (`src/AREA.md` describes commands by file, not fields; `tests/AREA.md` covers fixtures only).

## Read-first

- `src/status.ts` — `leafJson`, `leafRed`, `undelivered`, `blockedBy`, `landAttempt`, `JsonLeaf`, envelope `red` sum.
- `src/routing.ts` — `requiredSlots(phase, rounds)` (check.review with rounds>0 → `['B']`; merged/failed → `[]`).
- `src/state.ts` — `batchSchema` (`recorded`, `owner`), `deliveryErrorSchema`, `failure`, `isParked`, `hasLeafFolder`.
- `src/land.ts` — `landAlive`, `landUnit`, `handOff` sets `owner: 'seat'` before exit.
- `src/phase.ts` `batchPush` — `recorded: true` saved only after a successful push.
- `src/next.ts` `reconcileBatch` — owns `recorded === true` merge leaves; the exclusion reason for D5.
- `tests/status-json.test.ts`, `tests/status-fixture.ts`, `tests/helpers.ts` — `envelope` schema, `leaf`/`fakeSystemctl` fixtures, `cli` env merge.
- `tests/fake-systemctl.ts` — `is-active` answers `active` only for units seeded in the db.

## Units (serial-solo: every wave holds one unit)

- Wave 1 / U1 — `src/status.ts` (`attention` computation, `JsonLeaf`, `red` redefinition, `requiredSlots` import), `tests/status-json.test.ts` (planned cases are committed by this pass before product code), `docs/reference/commands.md` (one line). Owns every touched path; the test additions are already landed by planning, so implementation is the product diff plus docs line.

## Criterion proofs

Proof commands run through `akrogon run-check`; each test name below is one `bun test` `-t` pattern against `tests/status-json.test.ts` at the real CLI boundary (`cli` spawns `akrogon status --json` over fixture repos). Sizes: seconds. Rerun trigger: any change to `src/status.ts`, `src/routing.ts`, `src/state.ts` labels, or these test files — all local in-process stages, no model or outside stage, so no recording/replay applies.

| Criterion | Observation (boundary, before → after, failure caught) | Command |
|---|---|---|
| 1 | Fixture leaf `waiter` blocked by live/merged/parked/unreadable/missing deps: `attention` goes `[]` → the three `waiting on` entries for the bad labels only, `red` true. A board that flags calm dependents or misses a dead dep is caught. | `bun test tests/status-json.test.ts -t 'waits on parked'` |
| 2 | Four merge leaves with command/seat batches and a seeded systemd unit: dead unrecorded → `['merge job stopped']`; alive unit, `recorded: true`, `owner: 'seat'` → `[]`. A dead land job looking calm, or a pushed land flashing red, is caught. | `bun test tests/status-json.test.ts -t 'stopped command-owned land job'` |
| 3 | Failed with/without record, readiness gap, idle vs busy delivery error, clean leaf: each fact one entry, clean leaf `[]` and `red: false`. A board that double-counts, misses a fact, or flags a busy seat's stale error is caught. | `bun test tests/status-json.test.ts -t 'carries failed, missing and prompt facts'` |
| 4 | check.review idle → `['A','B']`; fix_rounds>0 or `done:['A']` or A busy → `['B']`; implement → `['A']`; merged/failed → `[]`. A board naming the wrong next seat is caught. | `bun test tests/status-json.test.ts -t 'waits_on names'` |
| 5 | Same runs: criterion-1 fixture `env.red === 2` (1 red leaf + 1 unreadable dep leaf) and criterion-2 fixture `env.red === 1`. An envelope that drops or double-counts new-fact leaves is caught. | Asserted inside the criterion-1 and criterion-2 runs above |

### Condition checks (each decision traced against its criterion's conditions)

Temporary uncommitted stub in `src/status.ts` (violating implementation, `git checkout` before the test commit): flags every non-`merged` `blocked_by` label, flags every command-owned merge batch ignoring `landAlive` and `recorded`, flags every `delivery_error` ignoring `busy_since`, appends `flagged` to every leaf, and computes `waits_on` as `requiredSlots(phase, 0)` minus busy (ignoring `done` and `fix_rounds`).

- C1 conditions: only parked/missing/unreadable labels are attention → stub flags `dep-live`/`dep-done`, `waiter.attention` equality fails red. `merged` and live deps stay silent → same run covers; dep with a folder but broken `state.yaml` reads `unreadable` not `missing` → `dep-dead` entry in the equality. Run: S1 below.
- C2 conditions: live unit exempt (stub flags `land-live`), `recorded: true` exempt (stub flags `land-pushed`), seat owner exempt (stub keeps the `landAttempt` owner gate so `land-seat` stays clean — correct-by-construction in stub; red proof for owner gate would need flagging all merge phases, folded into the unconditional `flagged` marker which leaves `land-seat.attention` non-empty → red). Run: S1.
- C3 conditions: busy seat's error suppressed (stub flags `undeliv-busy`), clean leaf gets nothing (stub's `flagged` marker), each fact rendered once (strict `toEqual` on whole array). Run: S1.
- C4 conditions: done seats excluded and first-fix narrows to B (stub's `requiredSlots(phase, 0)` yields `['A','B']` for `a-done` and `after-fix`), busy seats excluded (assert `a-busy → ['B']`, covered by the missing-behavior red since the field does not exist yet), merged/failed empty (asserted, same coverage). Run: S2.
- C5 condition: envelope counts exactly red leaves + unreadable + deploy → stub flags extra leaves, `env.red` exceeds the pinned counts → red. Run: S1.

### Recorded red runs

- R-crit1: `check crit1: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-crit1-1793749044047-2624146.log` — envelope parse fails: `waits_on`/`attention` absent (missing fields, intended red).
- R-crit2: `check crit2: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-crit2-1793749044343-2624369.log` — same missing-field red.
- R-crit3: `check crit3: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-crit3-1793749046046-2624754.log` — same missing-field red.
- R-crit4: `check crit4: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-crit4-1793749046337-2624978.log` — same missing-field red.
- R-cond1 (S1): `check cond1: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-cond1-1793749034163-2623069.log` — observed diffs: `waiter` gains `waiting on dep-live (implement)` + `flagged`, `quiet` gains the same; `land-live` and `land-pushed` gain `merge job stopped` + `flagged`, `land-seat` gains `flagged`; `undeliv-busy` gains `B prompt gone` + `flagged`, `clean` gains `flagged`; every over-flagged leaf raises `env.red` past the pinned totals.
- R-cond2 (S2): `check cond2: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-cond2-1793749039038-2623676.log` — observed diff: `after-fix` and `a-done` yield `['A','B']` instead of `['B']`; `a-busy`, `single`, `over`, `dead` hold.
- The stub (flag every non-merged label, every command-owned attempt ignoring `landAlive`/`recorded`, every delivery error ignoring busy, `flagged` on all leaves, `requiredSlots(phase, 0)` minus busy for waits_on) was applied to `src/status.ts`, run, and reverted with `git checkout src/status.ts` before the test commit.

## Docs

- `docs/reference/commands.md` — `--json` row names `attention`/`waits_on` (one line).
- No other doc affected: text view unchanged (`status.test.ts` untouched), `src/AREA.md`/`tests/AREA.md` describe surfaces not fields.

## Notes for review

- No brief/design conflict found.
- Open limitation preserved: `unreadable` label depends on `hasLeafFolder`, which scans `open`/`closed` for a `state.yaml` named by slug; a dep whose folder exists but file vanished reads `missing`, matching `blockedBy` behavior today.
- Envelope `red` composition is unchanged code (`leafReds + unreadables + deploy`); criterion 5 is proven by the pinned sums, not by touching the sum.
