# Plan: record-panes-early

Debate off (`debate: "no"`); synthesized directly from brief.md and design.md. The design's one `Open for the plan:` item is resolved below (D5). Brief and design agree; no conflict note needed.

## Decisions

- **D1** (locked 1+2): in `src/next.ts` `allocate`, save state as soon as each seat id is known: `{...tabState, pane: {A: first.pane_id, ...(repairB === undefined ? {} : {B: repairB.pane_id})}}` right after `first` resolves and before `box(first)`; `{...tabState, pane: {A: first.pane_id, B: second.pane_id}}` right after `second` resolves and before `box(second)`. The `saveState` inside the `repairB` block and the trailing `saveState`/`allocated` save fold into these two writes (the pre-box saves carry the same pairs). Return value unchanged.
- **D2** (locked 4): the stale comment `Boxed before any save records it, so a later throw never leaves an unboxed recorded pane.` is replaced by the locked invariant wording: a recorded pane may be unboxed only until the entry sweep or the box step runs; dispatch follows successful boxing.
- **D3** (locked 3): `broadcastPass` drops the live-B shortcut. `(await panes()).some((pane) => pane.pane_id === fresh.state.pane.B) ? fresh.state : await allocate(...)` becomes `await allocate(global, repo, fresh, invocation)`; `dispatchSlot` is then reached only with both seats boxed. This deletes code and the one consumer of the old ordering.
- **D4** (locked 5, criterion 5): `docs/guide/next.md`'s boxing paragraph gains the sentence that a pane whose id was never durably saved (kill during the split call, lost reply, failed state write) is not recorded and is closed by hand with `herdr pane close <pane>`. No ownership marker is built.
- **D5** (design's open item, confirmed against today's dead-B path): routing a pending broadcast through `allocate` is safe. `allocate` returns `null` only on `max_active` with no matching tab; `broadcastPass` then returns without a prompt, exactly today's dead-B outcome. `ensureWorktree(repo, fresh, matches.length === 1)` behaves as for a dead B: with the tab live, `live` is true and `writeLeafEnv` returns false, so no `.env` write and `env_names`/`env_generation` stay unchanged; with the tab gone, a worktree recreation and the live=false `.env` write (empty file when `env:` declares nothing; missing declared values throw) match the dead-B path. The entry sweep closes a live recorded B that is `outside` and B is re-split; `unreadable` throws, `broadcastPass` catches and reports it, and the leaf retries next pass — the intended new stop the shortcut never had.
- **D6**: one unit, serial-solo. Both edited paths plus the planned tests serve one invariant; splitting `src/next.ts`'s two hunks across units buys nothing. Implement A applies the change itself, no workers.

## Read-first

- `src/next.ts` — `allocate` (line ~371: entry sweep, `first`/`repairB`/`second` resolution, `box`, saves), `broadcastPass` (line ~1082: the live-B shortcut), `dispatchSlot` (prompt follows `agent start`, which records `startCgroups`).
- `src/state.ts` — `broadcastPending` (merged + broadcast + no prompted.B), `stateSchema` `pane`/`prompted` fields.
- `src/scope.ts` — `adoptShell`, `inOwnScope` (`outside`/`unreadable`/`inside` via `pane process-info` + proc root).
- `src/phase.ts` — `completeOwner` (moves the merged owner under `issues/closed`, sets `state.broadcast`).
- `docs/guide/next.md` — the boxing paragraph (line ~159).
- `tests/seat-containment.test.ts` — `dispatchFixture`, `database`, `calls`, `busctlCalls`, `cgroupPath`, `next`, `skipped`; the outside-pane test is the template.
- `tests/fake-herdr.ts` — `Database` schema, `pane split`/`swap`/`close`, `failSplitOnce`, `busctl.fail` consumption via `tests/fake-busctl.ts`.
- `tests/fake-proc.ts` — `seedShell`, `shellPid`, `procDir`, `OUTSIDE_CGROUP`, `boxedCgroup`, `expectedSlice`, `expectedScope`.
- `tests/green-merge.test.ts` — `greenFixture`, `allocated`, `toMerge`, `claimed`, `land`, `prompts`, `moved`; the broadcast handoff tests are the template.
- `tests/helpers.ts` — `leaf` seeding and `cli` env (`FAKE_HERDR`, `AKROGON_PROC_ROOT`).
- `issues/chart/orphan-pane/forks/pane-record.md` — the (a) pick, rejected candidates, the residual never-saved gap D4 documents.

## Interfaces

None new. `allocate` and `broadcastPass` signatures are unchanged; the saved `state.pane` shape is unchanged; consumers (`dispatchSlot`, `observeBusy`, `ownsPane`, `reconcile.ts broadcastInProgress`, `src/log.ts`) read recorded ids as before and need no change.

## Wave 1 — serial-solo

- **U1 record-early allocation and broadcast**: `src/next.ts` (both hunks in `allocate`, the comment, the `broadcastPass` shortcut), `docs/guide/next.md` (one added sentence). Shared test resource: none beyond per-test temp homes in the fixture. Proof: criteria 1–4 tests green plus criterion 5 grep.

Docs: `docs/guide/next.md` is the affected human doc. `tests/AREA.md` gains one clause naming the new coverage; `src/AREA.md`'s existing line (`allocate` closes recorded outside panes and boxes before seat start) still holds. No skill doc is affected.

## Acceptance evidence

| Criterion | Boundary | Before → after | Product failure it catches | Command (via `akrogon run-check`) | Size / rerun |
|---|---|---|---|---|---|
| 1 B split succeeds, B box fails → id recorded, retry closes orphan, operator pane kept, prompt only after boxing | `akrogon next` against fake herdr + busctl (`busctl.fail` switch) | `state.pane.B` keeps the dead id, the live split pane is unrecorded → `state.pane.B` is the live orphan, next pass closes it, records a boxed replacement and prompts B | #116: a second B split per pass, the first idle forever | `akrogon run-check --name record-b-box-failure -- bun test --timeout=30000 tests/seat-containment.test.ts -t 'a B pane whose boxing fails'` | seconds / rerun when `allocate` save order, the entry sweep or the fakes change |
| 2 replacement A's box fails while recorded B lives → B kept recorded, retry keeps B, closes the orphan, no prompt before both boxed | same `akrogon next` boundary | `{A: dead-id, B: B}` recorded; retry re-splits A leaving the orphan and drops B's record → `{A: orphanA, B}` recorded; retry closes orphanA, keeps B, swaps, prompts | losing the surviving B record and growing a second unrecorded pane on the repair path | `akrogon run-check --name record-a-box-failure -- bun test --timeout=30000 tests/seat-containment.test.ts -t 'boxing a replacement A fails'` | seconds / same trigger |
| 3 pending broadcast with live recorded B outside its scope → B closed and recreated boxed before the broadcast prompt | `akrogon land`'s `landedWake` → `broadcastPass` | `dispatchSlot` prompts the outside B in place → `allocate` closes it and the prompt lands on the boxed replacement | a broadcast seat prompted in an unscoped pane (containment hole) | `akrogon run-check --name broadcast-unboxed-b -- bun test --timeout=60000 tests/green-merge.test.ts -t 'outside its scope'` | minutes / rerun when `broadcastPass`, `allocate` or the green-merge fixture changes |
| 4 hand-split unrecorded pane stays open and unboxed through 1 and 2 | same fixture as criteria 1–2 | contract already holds today; the guard asserts the manual pane survives both retry passes with `OUTSIDE_CGROUP` and no `pane close`/`busctl` call naming it | a future sweep or adoption eating operator panes | covered inside the criteria 1–2 tests (assertions in both cases); no separate command | — / reruns with criteria 1–2 |
| 5 `docs/guide/next.md` documents the never-saved-pane limit and the manual `herdr pane close` fix | the guide text itself | no such sentence → sentence present naming kill-during-split/lost reply/failed save and `herdr pane close <pane>` | operators unable to distinguish a herdr-created never-saved pane from a hand-split one (#116 diagnosis) | `akrogon run-check --name guide-unsaved-pane -- sh -c "grep -n 'herdr pane close' docs/guide/next.md"` | seconds / rerun when the guide paragraph changes |

No new proof machinery: every command is `bun test` on existing files plus `grep`, run through the configured `akrogon run-check`; the fakes (`fake-herdr.ts`, `fake-busctl.ts`, `fake-proc.ts`) are existing fixtures. No model or outside stage; no credentials needed (`Missing:` check: `akrogon status` shows none). Not a slow run; no restart boundaries needed.

## Planned tests (this pass, red-first)

1. `tests/seat-containment.test.ts`, new test `a B pane whose boxing fails is recorded and replaced before the next prompt` (criteria 1+4): leaf `build` in `check.review`, allocate via `next build`; hand-split pane `w1:p900` pushed into the db with `seedShell(OUTSIDE_CGROUP)`; close B's pane in the db (dead B); `busctl.fail` on; run `next build` → exit 1, slug error, zero new prompts; assert `state.pane.B` is the live orphan (present in `db.panes`, `!==` the dead id) and the manual pane is untouched; `busctl.fail` off; run `next build` → exit 0, `pane close` called exactly on the orphan, `state.pane.B` is a new boxed id, `db.startCgroups` shows recorded A and B boxed, last prompt targets the new B, manual pane still live with `OUTSIDE_CGROUP` and absent from `busctlCalls`. Red observed 2026-10-22 (`check record-b-box-failure: 1 implementation/check-record-b-box-failure-1792697023520-2687445.log`): `state.pane.B` still held the dead id `w1:p3` — the split pane was never saved.
2. `tests/seat-containment.test.ts`, new test `boxing a replacement A fails while B lives keeps B recorded` (criteria 2+4): same seeding plus a manual pane; close A's pane in the db; `busctl.fail` on; run `next build` → exit 1; assert `state.pane.A` is the live orphan and `state.pane.B` is still the live B; `busctl.fail` off; run `next build` → exit 0, `pane close` called exactly on the orphan, `state.pane.B` unchanged, the new A is boxed (`startCgroups`), exactly one new prompt lands on A, manual pane untouched. Red observed 2026-10-22 (`check record-a-box-failure: 1 implementation/check-record-a-box-failure-1792697028335-2691973.log`): `state.pane.A` still held the dead id `w1:p2` — the replacement split was never saved.
3. `tests/green-merge.test.ts`, new test `a pending broadcast recreates a live recorded B outside its scope before prompting it` (criterion 3): the `completing push` flow — `allocated('aa','issue-aa')`, commit, `toMerge`, `claimed`; write `OUTSIDE_CGROUP` to B's cgroup file before `land`; `land` → prompt lands on a new B: assert `state.pane.B` (read after) `!==` the old id, old B closed via `pane close` and absent from `db.panes`, the one `broadcast-issue` prompt targets the new boxed B (`startCgroups` ends with the scope), A kept. Red observed 2026-10-22 (`check broadcast-unboxed-b: 1 implementation/check-broadcast-unboxed-b-1792697032576-2696926.log`): `state.pane.B` stayed `w1:p3` — the live-B shortcut prompted the outside pane in place, no `pane close`.
4. Criterion 5 red run: `grep -n 'herdr pane close' docs/guide/next.md` exits 1 on the current text. Red observed 2026-10-22 (`check guide-unsaved-pane: 1 implementation/check-guide-unsaved-pane-1792697035669-2704373.log`): no match — the never-saved limit is undocumented.

Commit 1 (planning, before product code): the three tests, `Test-Change:` trailers naming the added cases in `tests/seat-containment.test.ts` and `tests/green-merge.test.ts` (no existing expectation changed).

## Limitations

- The never-saved window (kill during the split call, lost reply, failed `saveState`) is documented for manual close only; no ownership marker or unrecorded-member sweep is built (locked 5).
- `unreadable` on a merged leaf's B during a pending broadcast now reports and retries instead of prompting in place; that stop is intended (D5).

## Implementation notes

- 2026-10-22 check.repair: preserve live `recordedB` in the first save on every allocation path, including when A survives, as required by design decision 2 and the `allocate` leaf architecture. D1's `repairB` expression omitted this required case.
