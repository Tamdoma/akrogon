# Review A: failed-stop-guard

Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`. Reviewed head: `4e9c31f`.
Branch files: `src/phase.ts`, `tests/phase.test.ts`, `docs/guide/problems.md`,
`docs/guide/phases.md`; zero files under `issues/`. No `AREA.md` in the diff.
Blind review; peer review not read.

## What was checked

- Guard placement, condition, and text against D1-D4: after the merged check,
  before the legal-move check, branching on `explicitSlot`, exact sentence plus
  ` Reason: <reason>` only when the record exists. Recordless failed leaf
  refuses without a crash (`state.failure?.reason` ternary).
- `transition` has exactly one caller (`phaseCommand`), which passes the parsed
  explicit slot, so the root cause is fixed at the shared function with no
  sibling caller left behind.
- D5/D6: entering `failed` with `--slot` and slot-less recovery untouched;
  `commitMove`, routing, skills, and `issues/` untouched.
- Tests against C1/C2: five-leaf refusal test asserts exit codes, guard
  sentence, recorded reasons, unchanged `state.yaml`/`log.jsonl` bytes, and
  zero herdr calls; incident-sequence test asserts `moved failed`, then refusal
  with phase `failed` and `fix_rounds` intact. No test mocks the unit under test.
- Docs against C5: one exact locked sentence in each of the two named sections.
- Stale-doc sweep: `cheat.md` shows entering failed with `--slot` (unchanged
  D5 behavior, not stale); `next.md` and `state.md` make no `--slot` recovery
  claim. No other page contradicts the guard.
- Report evidence accepted for the full suite; independently reran the touched
  file (below) as a specific-concern check.

## Verification evidence

- `bun test tests/phase.test.ts` at reviewed head: 39 pass, 0 fail, 352 expect
  calls, 5.67s.
- `git diff --name-only <base>...HEAD -- issues | wc -l`: 0.
- Report's `bun test` (341 pass), `bun run typecheck` (exit 0), `bun run
  format` (unchanged) accepted without rerun; no code changed since.

## Findings

Fixes: none.

Nits:

- N1: Guard-precedence edge untested. A failed leaf called with `--slot` and an
  illegal phase (e.g. `failed --slot A`, `merged --slot B`) gets the guard text
  because the guard sits above the legal-move check (D3); no test pins this, so
  moving the guard below the legal-move check would silently change that refusal
  text to `Illegal move`. Deferred because both orderings refuse before any
  state, log, git, or herdr effect and no caller branches on stderr text, so
  there is no behavioral consequence today. Would promote to Fix on evidence of
  a caller parsing the guard sentence or a criterion requiring the sentence on
  illegal-phase calls.

## Verdict

`nits`
