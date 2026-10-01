# Brief-1: failed-stop-guard U1 tests (owns tests/phase.test.ts)

## 1. Goal

Add the two fail-first tests proving the failed-stop guard (plan D7). This unit
writes tests only; the guard does not exist yet, so both new tests MUST fail on
this worktree's code in exactly the way the criteria name. That red run is the
expected evidence, not a defect.

## 2. Numbered acceptance criteria

- B1.1: One new test named `failed leaf with explicit slot is refused without
  effect` covers five failed leaves, each with one refused call:
  1. failed with `failure: { cause: 'blocked', phase: 'implement', slot: 'B',
     reason: 'needs decision' }`, call `phase <slug> check.review --slot A`
  2. failed with a `failure.reason`, call `phase <slug> implement --slot B`
  3. failed with a `failure.reason`, call `phase <slug> merge --slot B --verdict
     ready`
  4. failed with `failure: { cause: 'attempts', phase: 'check.review', slot:
     'A', reason: 'fix rounds exhausted' }`, call `phase <slug> check.review
     --slot B`
  5. failed with no `failure` record, call `phase <slug> implement --slot A`
  Every call exits non-zero. stderr always contains `Leaf is failed. A seat
  cannot resume it. Operator recovery omits --slot after the blocker is
  resolved.` and, for leaves 1-4, the recorded reason. `state.yaml` bytes and
  `issues/log.jsonl` bytes are unchanged per leaf, and the fake herdr records
  zero calls after all five.
- B1.2: One new test named `in-flight seat move after stop stays failed`
  reproduces the incident through the real CLI: fixture leaf at `check.fix` with
  `fix_rounds: 1`; `phase <slug> failed --slot A --reason "x"` (with herdr env)
  prints `moved failed`; then `phase <slug> check.review --slot A` exits
  non-zero with the guard sentence on stderr, and the leaf stays `failed` with
  `fix_rounds` still 1.
- B1.3: On current code both new tests fail (red): the refused calls print
  `moved ...` instead. Every pre-existing test in the file still passes.

## 3. Read-first list

- `tests/phase.test.ts` (helpers `bytes`, `herdrCalls`; recovery tests near
  `blocked restart skips clean check`; stop tests near `stops land in failed`)
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `fakeHerdr`)
- `tests/fake-herdr.ts` (calls append to `<db>.calls`)
- This skill folder's `ponytail.md`
- Copy this existing pattern: `test('failed exits by command reset attempts...')`
  builds failed leaves with `leaf(f, slug, 'failed', {...})`, runs `cli(f, [...])`,
  and asserts with `readState` plus `bytes()` snapshots. For log stability copy
  the `writeFileSync(history, '')` then assert-still-empty shape from the
  mismatched-repo-key test. Open the index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `tests/phase.test.ts` only. Appends two tests; touches no other file.
- No prerequisites; lands in wave 1 alongside docs.
- Needed shapes: `leaf(f, slug, phase, extra)` merges `extra` into state.yaml, so
  `failure: { cause, phase, slot, reason }` sets the record and omitting it
  leaves none. `cli(f, args, f.root, herdr.env)` runs the real CLI with the fake
  herdr on PATH. `herdrCalls(db)` returns logged calls (empty array when the
  `.calls` file is absent).
- Consumed by: the guard unit (brief-3), which turns these tests green.

## 5. Do-not, reasons and exceptions

- Do not edit `src/phase.ts` or any non-test file: this unit proves the missing
  guard, and touching source would fake the red evidence. Exception: none; if
  the tests cannot fail purely through the missing guard, return a mismatch.
- Do not weaken assertions to get green: the red run is the deliverable.
  Exception: none.
- Do not add a new test file: the plan requires extending `tests/phase.test.ts`.
  Exception: a revised brief from A authorizing it.
- Do not change scope or an interface; return a mismatch with evidence to the
  plan author instead. Exception: a revised brief from A authorizing that change.
- Restated: no source edits (keeps red honest, no exception); no weakened
  assertions (red is the deliverable, no exception); no new test file (plan
  fixes the location, only a revised brief changes it); no scope or interface
  change (mismatch with evidence, only a revised brief authorizes it).

## 6. Ordered steps

1. `tests/phase.test.ts` (B1.1): append the five-leaf refusal test. Pre-create
   `issues/log.jsonl` as empty, snapshot each leaf's `state.yaml` bytes, run the
   five calls with herdr env, assert exit codes, stderr contents, unchanged
   bytes, and empty `herdrCalls`.
2. `tests/phase.test.ts` (B1.2): append the incident-sequence test per section 2.
3. Run the section 7 command; confirm the two new tests fail as B1.3 names and
   all other tests in the file pass. Paste that red output as evidence.
4. Commit only `tests/phase.test.ts`.

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

Done when B1.1-B1.3 hold: two new tests appended, red on current code exactly as
named, pre-existing tests passing, only `tests/phase.test.ts` committed.
Scenarios use temporary repositories and the fake herdr at the one boundary; no
real panes, install roots, GitHub, or herdr socket. Report the commit ID, paste
the changed-test output, and fill these lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
