# Brief 3 — U3: engine pass and capacity (observeBusy direct branch, dispatchLeaf skips, activeCount, reconcile keeps)

## 1. Goal

Implement plan decisions D10, D13 of `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` (read it first — D10/D13 plus Criterion 3/4 constructions and Implementation constraints). Outcome: `akrogon next` passes never seat, prompt, end or rename direct-leaf terminals; busy observation works for direct seats across sessions by recorded refs; non-required slots are cleared; no blocked/stall notices for direct seats; direct leaves never count toward max_active; reconcile keeps unfinished direct leaf temps and probes B cross-session for broadcastInProgress. `tests/direct-seats.test.ts` and `tests/direct-active.test.ts` pass unmodified.

## 2. Numbered acceptance criteria

1. `bun test tests/direct-seats.test.ts --timeout=120000` — all 3 tests pass unmodified.
2. `bun test tests/direct-active.test.ts --timeout=120000` — both tests pass unmodified.
3. `bun test tests/next.test.ts tests/reconcile*.test.ts tests/capacity*.test.ts --timeout=120000` (glob-expand whatever exists) — pass unmodified: lifecycle behavior unchanged.
4. `bun run typecheck` exits 0.
5. `tests/direct-seats.test.ts` busy test proves cross-session observation: it CANNOT pass with a repo-session-only probe (the reviewer lives in a second core).

A worker writes and edits no test: a planned test that is wrong or red once your code is correct is a mismatch returned to A, never a test fix.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` — D10, D13, criteria 3/4, implementation constraints (cross-session addressing caution!).
- `src/next.ts` — `dispatchLeaf` structure (~L1000-1150), `observeBusy`, `activeCount` (label branch + fallback branch), `capRefusal`/`allocate` (what to skip).
- `src/reconcile.ts` — `broadcastInProgress` (L190-200), `sliceKeepReason` (L203-223), the temp sweep chain (~L1194-1228), `leafSeats`/`endSeats` label dependence (why direct needs nothing there).
- `src/hc.ts` — `terminal(session, address)` probe semantics, HcError kinds.
- `src/routing.ts` — `requiredSlots` (wave sibling U2 adds the direct param in parallel; assume it exists: call `requiredSlots(phase, rounds, direct)` — if it doesn't exist yet in your worktree, add the third parameter yourself exactly as plan D6 specifies, it is a shared one-function surface; whichever lands second keeps the other version — they must be identical. Check `git log` for whether U2's commit landed before writing anything.)
- `tests/direct-seats.test.ts` and `tests/direct-active.test.ts` — the executable contracts; read fully before designing.
- `ponytail.md` in the implement-issue skill folder.

## 4. Change list and needed interfaces

Paths this unit owns: `src/next.ts` (observeBusy, dispatchLeaf skips, activeCount), `src/reconcile.ts` (broadcastInProgress direct probe, temp-chain unfinished-direct keep). Possibly `src/routing.ts` IF U2 hasn't landed — see above; keep it byte-identical to D6 so either version wins cleanly.

Must land first: wave 1 (schema/verbs). Runs parallel with U2 (phase.ts/routing) and U4 (status.ts) in wave 2 — disjoint files except the possible routing.ts overlap handled above. Creation commit: filled by A below.

Binding facts copied from the plan:

- observeBusy direct branch: probe `terminal(ref.session, ref.address)` per recorded seat ref — NEVER through the repo session or labels. Probe errors/not-found = unobservable for that seat: no busy write, no throw (a dead door terminal must not wedge the engine). Only required slots of the current phase get busy_since writes; non-required slots are CLEARED even when working. No blocked/stall notice files for direct seats.
- dispatchLeaf for direct leaves skips: checkBase, repoSpace/place, leafSeats discovery, allocate, dispatchSlot, endSeats. The pass reduces to busy observation. Cross-check with the tests: `cli next` on a direct leaf must exit 0 and touch nothing.
- activeCount fallback branch: a direct leaf's worktree neither counts as `seated` nor joins the unfinished count. The label branch needs nothing (no labeled terminals can exist).
- reconcile: (a) broadcastInProgress direct branch probes `terminal(state.seat.B.session, state.seat.B.address)` directly instead of the passed live list; probe failure = in-progress (keep); B idle/done = not in progress. (b) temp sweep chain: explicit keep for unfinished direct leaves before dropChecked, mirroring the worktree chain; failed direct leaves excluded exactly as failed lifecycle leaves today. (c) nothing else changes — leafSeats-based teardown already no-ops for direct, sliceKeepReason's tab-undefined branch already covers unfinished direct slices.
- ADDRESSES COLLIDE ACROSS SESSIONS: the reviewer in the tests lives in a second core whose addresses overlap core 1's. Every probe/send must go through the ref's own session. A repo-session lookup either finds nothing or — worse — finds the WRONG terminal.
- `state.direct` is `boolean | undefined`; `=== true` is the only true form.

## 5. Do-not, reasons and exceptions

- Do not edit any test file. Exception: none.
- Do not touch `src/phase.ts`, `src/status.ts`, `src/stop.ts`, `src/usage.ts`, `src/direct.ts`: owned by other units. Exception: none.
- Do not write seat-discovery fallbacks 'for safety' (e.g. searching all sessions when the ref probe fails): a probe failure means unobservable, period — guessing sessions can target the wrong terminal, which is worse than a wedge. No exception.
- Never run any `git stash` subcommand: every worktree shares one stash. Replacement: commit WIP and squash per the reset rule before returning.
- Do not kill processes by pattern.

## 6. Ordered steps

1. Read the plan sections and both test files fully; check `git log` for U2's routing.ts state.
2. `src/next.ts`: observeBusy direct branch; dispatchLeaf skips; activeCount exclusion.
3. `src/reconcile.ts`: broadcastInProgress probe; temp keep.
4. Run direct-seats tests; iterate. Then direct-active.
5. Run lifecycle regression files.
6. Squash; single commit `feat: direct leaf engine pass and capacity` (or similar).

Advisory size: 2-3 files, under 50 turns. The hc fixture tests are slow (tens of seconds each) — budget iterations.

## 7. Commands

- `bun test tests/direct-seats.test.ts --timeout=120000`
- `bun test tests/direct-active.test.ts --timeout=120000`
- `bun test tests/next.test.ts --timeout=120000` plus whatever reconcile/capacity test files exist (`ls tests/ | grep -iE 'reconcile|capacity'`)
- `bun run typecheck`

Install first if node_modules absent: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.

Never `akrogon verify`. Long evidence commands through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Done when criteria 1-5 hold and the single squashed commit exists. Report the four lines plus commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Creation commit (A fills at wave start): e01743a6 — VERIFY with `git log --oneline -1` at start and use what is there.
