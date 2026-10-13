# Brief U2: src/phase.ts seat_done + visit_start

## 1. Goal

Wire two timing events into `src/phase.ts` for leaf `timing-events` (plan decisions D7, D2): `seat_done` in `transition`, `visit_start` in `commitMove`.

## 2. Acceptance criteria

1. In `transition`, in the `recorded` branch (the `saveState(leaf.path, recorded); console.log('recorded')` path), append `seat_done` `{ slug: state.slug, slot, phase: state.phase, visit: currentVisit(readLog(repo.root), state.slug, state.phase) }` immediately after `saveState`, guarded by `required.length > 1` (paired phases only; single-slot phases never reach the branch but the guard keeps intent literal).
2. In `commitMove`'s `finally` block, after `await logMove(...)`, append `visit_start` `{ slug: recorded.slug, phase: to, visit: currentVisit(readLog(repo.root), recorded.slug, to) }` — the just-appended `to` log row is already in `readLog`, and `currentVisit` subtracts it.
3. Both appends go through `appendTiming(repo, ...)`; a timing failure warns and never changes the move outcome.
4. No behavioral change otherwise; existing tests keep passing.

## 3. Read-first

- `src/phase.ts` — `commitMove` finally block and `transition` `recorded` branch (search `console.log('recorded')`).
- `src/timing.ts` — `appendTiming`, `currentVisit` (landed in wave 1; if absent in your worktree it comes with the rebase — it is on the leaf branch HEAD).
- `src/log.ts` — `readLog` signature (`LogRecord[]` with `.record`).
- ponytail.md.

## 4. Change list and needed interfaces

Owns: `src/phase.ts` only. Prerequisite: U1 (`src/timing.ts`) must be on HEAD — verify `src/timing.ts` exists; if it does not, return a mismatch naming the missing prerequisite. Imports: `appendTiming`, `currentVisit` from `./timing`; `readLog` is already imported.

`commitMove(repo, leaf, recorded, to, slot, failure?, onCommitted?)` — `recorded` is the pre-move state, `to` the destination phase.

## 5. Do-not, reasons and exceptions

- Do NOT touch `transition`'s verdict/done bookkeeping or any other line. Reason: minimal diff. Exception: revised brief.
- Do NOT write or edit tests; `tests/timing.test.ts` red is expected until all units land. Exception: none.
- Do NOT emit `seat_done` for `checkOnly` moves or failed moves — the `recorded` branch placement already excludes them; do not add separate sites. Reason: the criterion is exactly first-seat completion without a move.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing it.

## 6. Ordered steps

1. Edit `src/phase.ts`: add the `seat_done` append in the `recorded` branch after `saveState`, then the `visit_start` append in `commitMove`'s `finally` after `logMove`.
2. `bun install --frozen-lockfile`, run section 7; `tests/timing.test.ts` still red is expected — report it, fix only failures caused by this diff.

Advisory: 1 file, under 8 turns.

## 7. Commands

`AKROGON_BASE=df8868911100bf863224f71a51e70bb489d3b5d9 && bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Both appends in place, typecheck clean, changed tests show only the expected `timing.test.ts` red. Commit message: `timing-events: seat_done and visit_start in phase moves`. `Test-Change:` trailer only if an existing test file changed (none should).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
