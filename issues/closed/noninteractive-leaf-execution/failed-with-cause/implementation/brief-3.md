# Brief 3: status note for failed leaves

## 1. Goal

`akrogon status` shows the failure cause and reason for a failed leaf, `failed` alone for a legacy record without `failure`, and no busy age for `failed` or `merged` leaves. Implements plan decision D8.

## 2. Numbered acceptance criteria

1. A `failed` leaf with `failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'needs api key' }` shows `failed blocked needs api key` in its NOTE cell.
2. A `failed` leaf without `failure` (legacy record) shows `failed` in NOTE.
3. A `failed` or `merged` leaf with `busy_since` values shows no `busy` text in NOTE; an active-phase leaf still shows `busy A 1h02m` style text (existing behavior preserved).

## 3. Read-first list

- `src/status.ts` — `note()` builds the NOTE cell from `done`, `attempts`, `fix_rounds`, `verdict`, `busy` parts joined by ` · `.
- `src/state.ts` — `failure` field shape (landed by brief 1).
- `tests/status.test.ts` — `leafRow`, `cell`, `log`, `event`, `register` helpers; the `busy durations appear in NOTE` test is the pattern for criterion 3; the overview test's `broken` failed leaf is the pattern for criteria 1–2.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/status.ts` `note(state, now)`:
  - Prepend a failure part: `state.phase === 'failed'` yields `state.failure === undefined ? 'failed' : \`failed ${state.failure.cause} ${state.failure.reason}\``, else nothing.
  - Suppress busy age for terminal phases: the `busy` list is built only when `state.phase !== 'failed' && state.phase !== 'merged'`.
  - Keep `done`, `attempts`, `fix_rounds`, `verdict` parts unchanged.
- `tests/status.test.ts`: add a test covering criteria 1–3. Follow the existing overview test: `leaf(f, slug, 'failed', { failure: {...}, busy_since: { A: <iso> } })`, run `cli(f, ['status'])`, assert NOTE contents via `cell(result.stdout, leafRow(result.stdout, slug), 'NOTE')`. For criterion 3's merged case, a `merged` leaf under `issues/open` with `busy_since` set is enough — `note()` is phase-driven.

## 5. Do-not, reasons and exceptions

- Do not touch any `src/` file other than `src/status.ts` — everything else is landed or owned elsewhere; exception: none.
- Do not change the `Failed: repo/slug` summary lines or `phaseColor` — out of scope.
- Do not reorder or remove the existing NOTE parts — only prepend the failure text and gate busy.
- Do not commit — B commits after the full suite.
- Return a mismatch with evidence instead of changing an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. Write the new status test covering criteria 1–3 (red).
2. Edit `note()` (green).

Advisory size: about 2 files, under 12 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=43ef0f7a7cb8908df33a734bbdee406b1563d408`. Run from the worktree root. B runs the full suite separately.

## 8. Done-when, evidence and report

All criteria verified by the new test passing under the changed-tests command; pasted command output required. Scenarios use `fixture` temporary repositories; no herdr calls.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
