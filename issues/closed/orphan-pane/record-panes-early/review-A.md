# Review A: record-panes-early

Base `bd996a7a`, reviewed head `1c13b2f0` (`test` 495d6179 + `fix` 1c13b2f, tree identical to verified `6a32fb11`; `verify` receipt `40ff0ec6` reused on that tree). Blind review; `review-B.md` not opened. Diff read in full; `tests/AREA.md` path listing run — all named paths exist. `docs/guide/next.md` and the broadcast behavior it describes were opened against the diff; no other documented behavior changed.

Verification evidence (from `implementation/report.md` and the cited run-check logs): all four criterion proofs red at planning and green on the head tree; `akrogon verify` green (format, test 1110 pass / 0 fail, typecheck).

## Findings

### F1 — Fix: the mid-allocation save drops a live recorded B on the steady-state path

- **Defect**: `allocate`'s new early save writes `pane: { A: first.pane_id, ...(repairB === undefined ? {} : { B: repairB.pane_id }) }`. On a pass where the recorded A survives and the recorded B survives (`recordedA` set, `recordedB` set, `!bootstrap`) — exactly the pass `broadcastPass` now runs for every pending broadcast — `repairB` is `undefined` (`repairB = !bootstrap && recordedA === undefined ? recordedB : undefined`), so the save writes `{A: first}` and drops the live B's id from state until the second save, which is separated from the first by real awaits (`box(first)`'s `pane process-info` reads plus any adoption).
- **Locked decision it departs from**: design locked item 2, "No save drops a live recorded seat", and the leaf architecture line naming `recordedB`: `{...tabState, pane: {A: first.pane_id, B: <recordedB id when live, else none>}}`. `repairB` covers only the repair path; the steady-state path must carry `recordedB` there.
- **Realistic source**: the `next` pass process killed (OOM, host reboot, `akrogon stop`, operator Ctrl-C on a manual `next`) in the window between the two saves — the same kill class this leaf exists to handle (locked item 5 names kill during the split call).
- **Consequence today**: a live, boxed B pane becomes unrecorded. On the next pass `recordedB` is undefined, `second` splits a new B, and the old B stays in the tab forever as an idle shell — the orphan the leaf is eliminating (issue #116). For the broadcast path it is worse: B1 stays live in the tab but unrecorded while a new B is created and prompted.
- **Criterion/gap it hits**: brief criterion 1's "leaves no unrecorded pane created by this allocation" intent and locked item 2; no test names the crash window (the window is not testable with the fake), so it blocks as a defect against the locked decision, not a testable scenario.
- **Fix**: the first save's B field carries `recordedB` (live member) rather than `repairB`: `pane: { A: first.pane_id, ...(recordedB === undefined ? {} : { B: recordedB.pane_id }) }`. Repair path unchanged (`repairB` is `recordedB` there); steady state now preserves B for the whole call.

### N1 — Nit: the repair-path swap is not asserted

The criterion-2 test proves B is kept recorded and prompts follow boxing, but does not assert the `pane swap` call happened (the criterion names no layout outcome). Deferred: no criterion names pane position and no user-visible defect is reported for it. Promotion evidence: a real report of seats landed in wrong positions after a repair pass.

## Verdict

`fix` — one Fix (F1). Everything else in the diff matches the plan: `broadcastPass` now routes through `allocate` (D3), the saves land before their `box` calls (D1), the comment carries the locked invariant (D2), and the guide sentence matches locked item 5 (D4). No failed `checks`: verify receipt is green on the reviewed tree. No `Test-Change` gaps: both test-touching commits carry trailers; the `tests/AREA.md` trailer was added by the amend and is present in the final trailer block.
