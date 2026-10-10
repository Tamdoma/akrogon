# Brief 2: dependents-first exit-code and waiting-line assertions (plan unit U2)

Worktree for all reads/edits/tests: /home/ivan/Work/infra/akrogon/issues/worktrees/fix-red-base-tests-u2

## 1. Goal

Commit f3199df changed `src/next.ts`: a picked leaf whose dependencies are all open in-progress leaves now prints `waiting: <slug> on <dep> (<phase>)` on stdout and does NOT set exit 1 (documented in `docs/guide/next.md`, "When picked work cannot start"). `tests/dependents-first.test.ts` still expects exit 1. Update the stale assertion and assert the documented stdout lines. Plan decision D2.

## 2. Numbered acceptance criteria

1. `expect(result.code).toBe(1)` at `tests/dependents-first.test.ts:103` becomes `toBe(0)`.
2. The same test asserts stdout contains exactly the documented waiting lines `waiting: d1 on many (plan.synthesis)` and `waiting: d2 on d1 (plan.synthesis)` (leaves `d1`, `d2` wait on in-progress deps; `many` and `few` dispatch). Keep the existing prompt-order assertion unchanged.
3. `bun test tests/dependents-first.test.ts --timeout=30000` is green.

## 3. Read-first list

- `tests/dependents-first.test.ts` — the `next --all` test at ~line 93-119.
- `docs/guide/next.md` "When picked work cannot start" — the documented contract being asserted.
- `src/next.ts` ~line 684-690 — the `waiting:` print (`deps` joined `', '` as `<slug> (<label>)`, label is the dependency's phase for open leaves).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Owns: `tests/dependents-first.test.ts` only.
- Must land first: nothing. Shared test resource: none — the test's own tmp fixture invokes `agent wait/start/prompt` and never `agent list`, so it does not depend on the concurrent fake-herdr change. Consumed output: none.
- Assertion style: read `result.stdout`; either a `toContain` per line or a filtered equality. Match the file's existing expect style.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts` or `docs/` — the leaf's diff must stay under `tests/` (done-criterion 3) and the code already implements the documented behavior; the test is what is stale.
- Do not touch `tests/fake-herdr.ts` — U1 owns it concurrently.
- Do not weaken the prompt-order assertions; dependents-first ordering is the test's purpose.
- Do not drop the `waiting:` assertions as "unstable": the lines are deterministic for this fixture graph (d1 on many, d2 on d1). If actual output differs, that is evidence — return a mismatch, do not silence it.
- Any conflict between this brief and real behavior: return a mismatch with evidence, not a scope change; the exception is a revised brief from A.
- Restated: one file, exit 1→0, plus stdout assertions for the two documented waiting lines; deviations need evidence returned as a mismatch unless A revises the brief.

## 6. Ordered steps

1. Read the test and the doc paragraph (criteria 1-2).
2. Change `toBe(1)` to `toBe(0)` and add the stdout assertions for both waiting lines.
3. Run `bun test tests/dependents-first.test.ts --timeout=30000`; record fail-before (already known red) and pass-after.
4. Commit only `tests/dependents-first.test.ts` with a message ending in a `Test-Change: tests/dependents-first.test.ts <reason>` trailer — existing test file changed under the `src/test-files.ts` path rule; reason: stale exit-1 expectation replaced by the documented exit-0/waiting-line behavior from f3199df. Note whether existing expectations changed (the exit-code line did; prompt order did not).

Advisory size: 1 file, under ~8 turns.

## 7. Commands

Changed tests: `bun test tests/dependents-first.test.ts --timeout=30000`
(AKROGON_BASE = f3199df89b25b4f215df04f8703ef6d71880cd6a)

## 8. Done-when, evidence and report

Done when `dependents-first.test.ts` is fully green from your commit and the worktree is clean. Report the commit ID plus:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
