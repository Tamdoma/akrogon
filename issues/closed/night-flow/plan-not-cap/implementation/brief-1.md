# Sub-brief 1: remove the fix-round cap in src/phase.ts

## 1. Goal

Plan decision D1. In `transition()` in `src/phase.ts`, delete the round-cap redirect so a `check.fix` destination is committed as computed. The recorded count still increments; no path through the cap reaches `failed`.

## 2. Acceptance criteria

1. `akrogon phase <slug> check.fix --slot B` from `check.repair`, and a `check.fix` move from `merge`, move to `check.fix` at any recorded `fix_rounds` value, with `fix_rounds` rising by one. Planned tests already on this branch prove it: `bun test tests/phase.test.ts tests/culprit.test.ts` goes from 3 red to all green.
2. `grep -rn "fix rounds exhausted" src/` returns nothing.
3. `bun run typecheck` stays clean.

## 3. Read-first

- `src/phase.ts` `transition()` — the `destination`/`capped` block and the `commitMove` call.
- `src/phase.ts` `commitMove` — the `fix_rounds` increment (keep it).
- `src/state.ts` `failureSchema` — `cause: 'attempts'` stays in the enum (produced by `src/next.ts` seat-fault exits).
- `tests/phase.test.ts`, `tests/culprit.test.ts` — the planned tests now asserting the movement (do not edit).
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns `src/phase.ts` only. In `transition()`:

- Delete the `capped: Phase` declaration (the `destination === 'check.fix' && ... >= repo.config.fix_rounds ? 'failed' : destination` ternary).
- Pass `destination` (not `capped`) to `commitMove`, and `undefined` for the `failure` argument — the `capped === 'failed' ? {...}` ternary goes with it. `onCommitted` stays.

No signature changes; `commitMove`, `requiredSlots`, `repo.config.fix_rounds` usage in config schema untouched. No units must land first. No shared test resource.

## 5. Do-not, reasons and exceptions

- Do not touch `commitMove`'s `fix_rounds` increment — the count must still rise, per the brief's criterion 1.
- Do not edit `src/config.ts`, `src/state.ts`, `src/next.ts`, `src/routing.ts` — schema, state schema and seat-fault exits are out of scope.
- Do not write or edit any test — the planned tests are already committed and locked; a red test that stays red once the code is right is a mismatch, return it with evidence.
- Do not remove `cause: 'attempts'` from `failureSchema` — `src/next.ts` still produces it.
- Scope changes return a mismatch with evidence; the exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the worktree.
2. Run `bun test tests/phase.test.ts tests/culprit.test.ts` — expect 3 red tests (the cap still exists).
3. Apply the section-4 edit to `src/phase.ts`.
4. `bun run typecheck` clean; rerun the two test files all green; `grep` check for `fix rounds exhausted` in `src/`.
5. Commit `src/phase.ts` with a clear message.

Advisory size: 1 file, under 8 turns.

## 7. Commands

`bun install --frozen-lockfile`, then `AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c bun test --changed="$AKROGON_BASE" --timeout=30000` (runs the two changed test files), plus `bun run typecheck`.

## 8. Done-when, evidence and report

Both test files green, typecheck clean, no `fix rounds exhausted` in `src/`, one commit for `src/phase.ts` only. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
