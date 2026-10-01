# Implementation report: failed-stop-guard

Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`. Head:
`4e9c31f5d65bfd38155829dba8470e119de5ac87` via `87545eb` (tests), `ba05691`
(docs), `4e9c31f` (guard). Three delegated workers in two waves; all worker
worktrees removed before the full suite.

## Changed files and reasons

- `src/phase.ts`: the failed-stop guard in `transition`, after the
  merged-terminal check and before the legal-move check (D1-D4). Branches on
  `explicitSlot`, throws the locked sentence plus ` Reason: <reason>` when a
  failure record exists.
- `tests/phase.test.ts`: two appended tests (D7) plus a shared `seatRefusal`
  const and a `HerdrFixture` type import. C1 five-leaf refusal test, C2
  incident-sequence test.
- `docs/guide/problems.md`: one D8 sentence in `The leaf is failed.` (C5).
- `docs/guide/phases.md`: one D8 sentence in the failed recovery paragraph (C5).
- No `AREA.md` needed changes: `src/AREA.md` already describes phase.ts as
  enforcing handoff guards. No file under `issues/` is on the branch.

## Criterion to evidence

- C1: `failed leaf with explicit slot is refused without effect` (five leaves,
  exit codes, stderr, unchanged `state.yaml`/`log.jsonl` bytes, empty herdr calls).
- C2: `in-flight seat move after stop stays failed` (`moved failed`, then
  non-zero, phase `failed`, `fix_rounds` unchanged).
- C3: existing `blocked restart skips clean check...`, `failed restart refuses
  issue files...`, `failed announce renames tabs...` pass unchanged.
- C4: existing `stop from implement on dirty worktree...`, `stops land in failed
  immediately...` pass unchanged.
- C5: both guide insertions reread; exact locked sentences, no other lines, no
  new links.
- C6: blocking checks below, all exit zero.

## Commands run with results

Wave-1 worker U1 (tests, red as required):
`bun test --changed="$AKROGON_BASE"` → 37 pass, 2 fail (the two new tests;
refused calls returned 0 without the guard). Full log was `evidence-u1.txt` in
the removed worker worktree; the red shape was re-confirmed on the lane.

Wave-1 worker U2 (docs):
`bun test --changed="$AKROGON_BASE"` → 0 pass, 0 fail, exit 0 (docs-only change
selects no tests).

Lane after picking U1 (`87545eb`):
`bun test --changed="$AKROGON_BASE"` → 37 pass, 2 fail (expected red).

Lane after picking U2 (`ba05691`):
`bun test --changed="$AKROGON_BASE"` → 37 pass, 2 fail (expected red).

Wave-2 worker U3 (guard):
`bun test --changed="$AKROGON_BASE"` → 39 pass, 0 fail across
`tests/phase.test.ts`, including both new tests.

Lane after picking U3 (`4e9c31f`):
`bun test --changed="$AKROGON_BASE"` → 39 pass, 0 fail, 352 expect calls, 6.21s.

A final checks on the lane:
`bun run format` → all files unchanged, exit 0, 0.7s.
`bun run typecheck` (`tsc --noEmit`) → exit 0, 1.2s.
`bun test` → 341 pass, 0 fail, 3968 expect calls across 15 files, 74.37s
(wall 1m14s).

## Known limitations

Per the locked design: `--slot` states intent, not identity, so a seat omitting
it passes; a stop then deliberate recovery inside one seat pass is not covered;
the `fix_rounds` reset on recovery is out of scope.

## Unverified criteria

None.
