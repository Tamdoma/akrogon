# Repair brief R2 — seat refusal, broadcast settlement/cleanup, status visibility (F2, F4, F5)

## 1. Goal

Repair three review findings in the seat/broadcast/status scope, per plan corrections C-new-D19,
C-D14, C-D13, C-new-D20 in `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md`
(read the corrections section first — it is the contract) and review-B.md findings F2, F4, F5.

## 2. Numbered acceptance criteria

1. `akrogon seat <slug> A --task <text>` on a direct leaf refuses BEFORE any allocation, creating no
   terminal, no tab, no labels: error names that the leaf is direct and its seats are the recorded
   terminals. CLI-proven.
2. Broadcast settlement follows dispatchSlot's rule exactly (design 13): when B's turn advances
   past the refused turn, the delivery is resettled as delivered AT THE ORIGINAL TURN —
   `prompted.B` = `{ turn: <original refused turn>, address }`, `delivery_error.B` cleared, and NO
   second send ever goes out. The current behavior (re-send on turn advance) is the bug. The
   definite-refusal case the current test pins is corrected to the design's semantics: `started:
   false`/unavailable both settle the same way (the test's retry expectation contradicts design 13
   and is corrected with a `Test-Change:` trailer citing design 13).
3. `broadcastInProgress` (src/reconcile.ts): releases cleanup once B's turn passes the prompted
   turn OR B IS GONE (absent socket/terminal). An hc error against a live socket stays in-progress
   (transient). The current "probe null → in-progress forever" reading is inverted for a gone
   reviewer and is the bug. Turn comparison: when `prompted.B` exists, compare `seat.turn >
   prompted.B.turn`; without a prompt yet, idle/done B means the pass may still send (in-progress
   logic as today for the unprompted case — check what the pre-prompt logic should be: B idle/done
   unprompted = still in progress because the send is owed; B working unprompted = in progress).
   Cross-session fixture proof (reviewer in a SECOND core), replacing the same-core cleanup test.
4. `akrogon status` text table keeps a closed broadcast-pending leaf visible while the handoff
   pends (row present with its pending note); once the broadcast settles it disappears from the
   open-area rows as today. The JSON `group` of a closed leaf is computed against its own area
   (`issues/closed`), never producing `..` segments.
5. tests cover 1-4 at the real CLI boundary per the corrections.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` — corrections C-D13/C-D14/C-new-D19/C-new-D20 (the contract)
- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/review-B.md` — F2/F4/F5
- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/design.md` binding decision 13 and 4 — read the exact settle sentence
- `src/next.ts` — `broadcastDirect` (~1510-1560), `seatCommand` (~1651), `dispatchSlot`'s settle logic (~930-970) which is the reference implementation to replicate
- `src/reconcile.ts` — `broadcastInProgress` (~197-230)
- `src/status.ts` — scanRepo scanned filter (~87-105), text-table openScan projection (~935-950), leafJson group computation (~624)
- `tests/direct-land.test.ts` whole; `tests/direct-seats.test.ts` whole; `tests/hc-fixture.ts` for the two-core pattern (hcFixture + second hcCore + link)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owned paths: `src/next.ts` (broadcastDirect, seatCommand), `src/reconcile.ts` (broadcastInProgress), `src/status.ts`, and `src/hc.ts` if needed to distinguish absent from transient without changing the existing general terminal() contract. A owns tests. Do not edit AREA files or docs.
Do NOT touch: src/direct.ts, src/state.ts, src/timing-report.ts, src/routing.ts, tests/direct-create.test.ts, tests/direct-drop.test.ts, tests/direct-timing.test.ts (other units own them).

Key facts:
- dispatchSlot's settle (src/next.ts ~941-953): when `error.turn < seat.turn` the error is converted to `prompted` at the ORIGINAL error turn and cleared — copy this shape exactly into broadcastDirect, then return (no redelivery path at all for broadcast: after resettle the handoff is complete).
- IMPORTANT design reading: after resettle there is NO further resend logic for direct broadcast — the lifecycle redelivery-after-turn-end path does not apply because direct broadcast resets `prompted.B` and the settle is terminal. The scan/test for "no duplicate sends" is the proof.
- seatCommand: add the direct refusal right after `findLeaf`, before allocate.
- scanRepo currently scans open + closed-broadcast-pending; the text table re-filters to open-only. Change: text rows INCLUDE the closed broadcast-pending leaf while pending (they are already in scan.leaves — the filter is what must change; once settled the leaf no longer scans in at all). Watch: `group` indentation in rows() — verify how group/indent render for a closed leaf; keep presentation coherent.
- leafJson group: `relative(resolve(scan.repo.root, 'issues/open'), leaf.path)` produces `..` for closed leaves; compute against the leaf's own area root instead.
- The direct-land cleanup tests currently use the repo's own core for B. Criterion requires a cross-session reviewer (second core) at least for the turn-advance and gone cases — use `hcCore(f, { doc: false })` + `f.core.link(core2)` exactly as tests/direct-seats.test.ts does.

Creation commit (A fills at wave start): a7127a22559407dda29958e65b6266df9d5936e1

## 5. Do-not, reasons and exceptions

A committed the red-first test corrections before this wave. Do not edit tests, even if green requires a fixture correction: report a mismatch with the exact output and reason. No stash, no process-pattern kills, no full verify. Commit WIP if needed and squash the returned work to one commit based on the creation SHA. Stay in your owned paths.

## 6. Ordered steps

Read section 3, implement the behavior in sections 2 and 4, run the targeted commands, and return one commit plus worker-report.md.

## 7. Commands

- `akrogon run-check --name r2-land -- bun test tests/direct-land.test.ts --timeout=120000`
- `akrogon run-check --name r2-seats -- bun test tests/direct-seats.test.ts --timeout=120000`
- `akrogon run-check --name r2-status -- bun test tests/status.test.ts --timeout=120000`
- `akrogon run-check --name r2-reconcile -- bun test tests/reconcile.test.ts --timeout=120000`
- `bun run typecheck`; `bunx prettier --check` on your edited files.
Cite the printed `check <label>: <exit> <path>` lines in the report.

## 8. Done-when, evidence and report

All criteria green at the CLI, green targeted evidence (A captured red-before evidence separately), one squashed commit with correct trailers, report at `/home/ivan/.akrogon/worktrees/akrogon/direct-leaf-u2/worker-report.md`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
