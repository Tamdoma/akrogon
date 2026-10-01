# Brief-3: failed-stop-guard U3 guard (owns src/phase.ts)

## 1. Goal

Add the failed-stop guard in `transition` (plan D1-D5): any `akrogon phase` call
carrying an explicit `--slot` on a failed leaf is refused before any state, log,
git, or herdr effect. Turns the brief-1 tests green.

## 2. Numbered acceptance criteria

- B3.1: In `transition` in `src/phase.ts`, immediately after the merged-terminal
  check (`if (state.phase === 'merged') ...`) and before the legal-move check,
  this guard throws for every explicit-slot call on a failed leaf, including a
  failed-to-failed call:
  `if (state.phase === 'failed' && explicitSlot !== undefined) throw new
  Error(...)`. The condition branches on `explicitSlot`, never on the inferred
  `slot`.
- B3.2: The error text is exactly `Leaf is failed. A seat cannot resume it.
  Operator recovery omits --slot after the blocker is resolved.` plus ` Reason:
  <reason>` appended only when `state.failure.reason` exists. A failed leaf with
  no `failure` record refuses with the sentence alone and never crashes on the
  missing record.
- B3.3: Entering `failed` with `--slot` from an active phase is unchanged, and
  slot-less recovery from `failed` is unchanged. The brief-1 tests
  (`failed leaf with explicit slot is refused without effect`,
  `in-flight seat move after stop stays failed`) and all pre-existing tests pass.

## 3. Read-first list

- `src/phase.ts` (`transition`, merged check through slot validation)
- `src/routing.ts` (`routing.failed.next`, `requiredSlots`)
- `src/state.ts` (`failure` optional even in `failed`)
- `tests/phase.test.ts` (the two brief-1 tests, already landed at this
  worktree's HEAD)
- This skill folder's `ponytail.md`
- Copy the existing one-line `throw new Error(...)` guard style directly above
  the insertion point. Open the index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `src/phase.ts` only (one guard block).
- Prerequisites: brief-1 (tests) landed; this worktree is created at the leaf
  HEAD containing them, so run the new tests to confirm green.
- Needed: `transition(repo, leaf, requested, explicitSlot, verdict, reason)`
  already receives the parsed `explicitSlot`; `readState` gives
  `state.failure?.reason`. No signature or interface changes.

## 5. Do-not, reasons and exceptions

- Do not touch tests, docs, or any other file: single-path unit, keeps the pick
  clean. Exception: none; anything else is a mismatch with evidence.
- Do not branch on the inferred `slot` or reorder existing checks: inference
  would misfire the guard and reordering would change refusal precedence.
  Exception: a revised brief from A.
- Do not change `commitMove`, routing, skills, or anything under `issues/`:
  locked exclusions (plan D6). Exception: a revised brief from A.
- Do not change scope or an interface; return a mismatch with evidence to the
  plan author instead. Exception: a revised brief from A authorizing that change.
- Restated: no other files (keeps the pick clean, no exception); no inferred
  slot or reordering (guards refusal precedence, only a revised brief changes
  it); no excluded areas (locked, only a revised brief changes them); no scope
  or interface change (mismatch with evidence, only a revised brief authorizes it).

## 6. Ordered steps

1. `src/phase.ts` (B3.1, B3.2): insert the guard block per section 2.
2. Run the section 7 command; confirm the two brief-1 tests now pass along with
   every other selected test. Paste that green output as evidence.
3. Commit only `src/phase.ts`.

Advisory size: about 1 file and under 6 turns; work clearly beyond it returns a
mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this, with edits in the working tree (before commit):

```sh
export AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

Run `bun install` in the worktree first if dependencies are missing. Do not run
the full suite; A runs it.

## 8. Done-when, evidence and report

Done when B3.1-B3.3 hold: guard placed and worded exactly, new plus existing
tests green, only `src/phase.ts` committed. Report the commit ID, paste the
changed-test output, and fill these lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
