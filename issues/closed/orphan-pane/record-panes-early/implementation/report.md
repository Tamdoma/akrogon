# Report: record-panes-early

Serial-solo run (plan D6: one unit, no workers). No refresh needed: the leaf branch already sat on `origin/main` `bd996a7a` at pass start; `AKROGON_BASE=bd996a7ad22225d35328088e7a7d1a1bc0c95d89`.

## Changes

- `src/next.ts` `allocate` (D1, D2): the seat id is saved to state as soon as it is known — `{A: first, B: repairB?}` right after `first` resolves, before `box(first)`; `{A: first, B: second}` right after `second` resolves, before `box(second)`. The inner `repairB` save and the old trailing save folded into these writes; the comment now states the locked invariant (a recorded pane may be unboxed only until the entry sweep or the box step runs; dispatch follows successful boxing).
- `src/next.ts` `broadcastPass` (D3): the live-B shortcut deleted; every pending broadcast goes through `allocate`, so `dispatchSlot` runs only after both seats are boxed.
- `docs/guide/next.md` (D4): the boxing paragraph documents the never-saved pane (kill during split, lost reply, failed save) and its manual close `herdr pane close <pane>`.
- `tests/AREA.md`: coverage lines updated for the new seat-containment and broadcast cases.
- `tests/seat-containment.test.ts`, `tests/green-merge.test.ts`: planned criterion tests committed at planning (495d6179); `6a32fb11` carries a prettier reflow of two assertion lines in seat-containment (trailer, no expectation change).

## Proofs

Base `bd996a7a`, head `1c13b2f` (same tree as `6a32fb11`; the amend added the `tests/AREA.md` trailer the move required, and `verify` reused the receipt `40ff0ec6` on the identical tree). All commands via `akrogon run-check` on the worktree.

| Criterion | Command | Result |
|---|---|---|
| 1 B box failure recorded, orphan swept, manual pane kept, prompt after boxing | `akrogon run-check --name record-b-box-failure -- bun test --timeout=30000 tests/seat-containment.test.ts -t 'a B pane whose boxing fails'` | green on 6a32fb11/1c13b2f (same tree) — `check record-b-box-failure: 0 implementation/check-record-b-box-failure-1792697154776-2846372.log` (red at planning: `check-record-b-box-failure-1792697023520-2687445.log`) |
| 2 replacement-A box failure keeps recorded B, retry keeps B, prompt after boxing | `akrogon run-check --name record-a-box-failure -- bun test --timeout=30000 tests/seat-containment.test.ts -t 'boxing a replacement A fails'` | green on 6a32fb11/1c13b2f (same tree) — `check record-a-box-failure: 0 implementation/check-record-a-box-failure-1792697159256-2849201.log` (red at planning: `check-record-a-box-failure-1792697028335-2691973.log`) |
| 3 pending broadcast with live recorded B outside scope re-boxes before prompt | `akrogon run-check --name broadcast-unboxed-b -- bun test --timeout=60000 tests/green-merge.test.ts -t 'outside its scope'` | green on 6a32fb11/1c13b2f (same tree) — `check broadcast-unboxed-b: 0 implementation/check-broadcast-unboxed-b-1792697162995-2852723.log` (red at planning: `check-broadcast-unboxed-b-1792697032576-2696926.log`) |
| 4 hand-split pane stays open and unboxed | asserted inside the criteria 1–2 tests (`manualUntouched`) | green with them, same logs |
| 5 guide documents the never-saved limit | `akrogon run-check --name guide-unsaved-pane -- sh -c "grep -n 'herdr pane close' docs/guide/next.md"` | green on 6a32fb11/1c13b2f (same tree) — `check guide-unsaved-pane: 0 implementation/check-guide-unsaved-pane-1792697164765-2856240.log` (red at planning: `check-guide-unsaved-pane-1792697035669-2704373.log`) |

`akrogon verify` on `6a32fb11` (tree reused for `1c13b2f`): `verify leaf 6a32fb117eef7738d9d3b17736ccffe487f92c13: green` — format, test (1110 pass / 0 fail, ~177 s, `implementation/check-test-1792697353447-2861605.log`) and typecheck (`implementation/check-typecheck-1792697355690-2861605.log`) all exit 0 on a fresh detached checkout. No `merge_checks` configured or named by the brief.

## Notes

- No `Implementation notes` needed: no missing constraint surfaced; D1–D6 implemented as planned.
- New behavior worth review's eye (design D5, intended): a pending broadcast whose recorded B is unreadable now reports and retries the leaf next pass instead of prompting in place — a stop the shortcut never had.

## Limitations

- The never-saved window (kill during the split call, lost reply, failed `saveState`) is documented for manual `herdr pane close`, not mechanized (locked design item 5).
- No live-run or outside stage; every criterion is proven at the `akrogon next`/`land` boundary through the existing fakes.
