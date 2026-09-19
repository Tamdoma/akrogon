# Brief 4: status note and docs

## 1. Goal

Surface recorded delivery errors in `akrogon status` and document the one-attempt rule. Plan decisions D10, D13.

## 2. Acceptance criteria

1. `akrogon status` appends `<slot> prompt <code>` to the NOTE column for each slot with a recorded `delivery_error` whose `busy_since[slot]` is undefined — including when the other seat is busy.
2. A slot with `delivery_error` and `busy_since[slot]` set shows no prompt token for that slot.
3. A legacy state without `delivery_error` shows nothing new; existing status tests pass unchanged.
4. `docs/reference-index.md` and `src/AREA.md` describe the one-attempt-per-pass rule and the timeout settlement; `src/AREA.md` stays within its four-section shape (Commands, Key files, Non-obvious patterns, See also) and at most 40 lines.
5. `bun test --changed` passes.

## 3. Read-first list

- `src/status.ts` — `note` :87-107 (token order: failed, done, attempts, fixes, verdict, busy).
- `src/state.ts` — `delivery_error` field shape.
- `tests/status.test.ts` — `cell`/`leafRow` helpers, existing NOTE assertions.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `saveState` via `src/state`.
- `docs/reference-index.md`, `src/AREA.md`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/status.ts` `note`: after the `done` tokens, add `(['A','B'] as const).flatMap((seat) => state.delivery_error[seat] !== undefined && state.busy_since[seat] === undefined ? [`${seat} prompt ${state.delivery_error[seat].code}`] : [])` (or equivalent) into the joined list.
- `tests/status.test.ts`: new test writing `delivery_error` via `saveState`, asserting the token per criteria 1-3 (mixed busy seats case included).
- `docs/reference-index.md`: one line/bullet naming the one-attempt-per-pass rule and timeout settlement where the command behavior is indexed.
- `src/AREA.md`: one bullet under Non-obvious patterns naming the rule and settlement.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, `src/session-file.ts`, `tests/next.test.ts`, `tests/fake-herdr.ts` — earlier briefs own them.
- Do not reorder existing NOTE tokens — snapshot/cell assertions depend on order; the new token goes after `done` per the design.
- Do not add a new doc file — the design names exactly these two files.
- A conflict returns a mismatch with evidence; the exception is a revised brief from B authorizing the change.

Restated: exclusions keep this a minimal surface addition; the only exception is a revised brief from B.

## 6. Ordered steps

1. `tests/status.test.ts`: failing test for criteria 1-3. Red.
2. `src/status.ts`: add the token. Green.
3. `docs/reference-index.md` and `src/AREA.md`: add the lines.
4. Run the changed-tests command.

Advisory size: about 4 files, under 20 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090` exported.

## 8. Done-when, evidence and report

All criteria green under the changed-tests command; pasted results. For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
