# Sub-brief 2: tests/merge-attempts.test.ts

## 1. Goal

New test file `tests/merge-attempts.test.ts` proving done-criteria 1–5 of the brief: one `issues/merge-attempts.jsonl` line per merge attempt end, correct outcome (`merged`/`red`/`split`/`reuse`), fields, and no line on refused calls; `issues/log.jsonl` unchanged (plan D6).

## 2. Acceptance criteria

The line schema (owned by this leaf): `{ attempt: string, repo: 'repo', holder: string, members: string[], built_on: sha, tested_top?: sha, outcome: 'merged'|'red'|'split'|'held'|'reuse'|'ejected', culprit?: string, start?: ISO datetime, end: ISO datetime }`. Tests read the file directly as JSON lines; there is no reader export. `start` is the batch creation time, `end` the append time. Write a small `attemptLines(f)` helper in the test file: file absent → `[]`.

Cases (each asserts exactly one line unless said otherwise):

1. Green batch: `batchFixture(f, ['hold','mem-a','mem-b'])`, `phase hold merged --slot B --attempt a1` succeeds → one line `outcome:'merged'`, `holder:'hold'`, `members:['mem-a','mem-b']`, `attempt` equals the record's attempt, `built_on`/`tested_top` are 40-hex shas, `start` parses and `new Date(start) < new Date(end)`. In the same test, snapshot `issues/log.jsonl` bytes before and after and assert identical (criterion 4).
2. Recovery merged: build a batch whose `candidate` is already on `origin/main` (copy the harness at `tests/batch-dispatch.test.ts:317` "a landed batch moves member and holder…": push, then `saveState` the batch with `candidate: top`), run `cli(f, ['next'])` → reconcile moves holder+members merged and writes exactly one `merged` line with both members.
3. Solo red: holder-only batch (or `batchFixture(f, ['hold'])`), save state `solo:true` on the leaf so `phase hold check.fix --slot B` takes the solo transition branch → one `red` line, `members:[]`. (Check `tests/batch-merge.test.ts` ~line 655 for the existing solo check.fix setup.)
4. Split: `batchFixture(f, ['hold','mem-a','mem-b'])`, `phase hold check.fix --slot B` → one `split` line with both members listed.
5. Reuse: refused push then reuse decision then successful push writes exactly one `reuse` line. Copy the harness at `tests/batch-merge.test.ts:858` ("a record-only advance reuses the green run…"): `--check`, `advanceRemote` touching only `issues/`+`learnings/history/` so the restack prints `reuse`, then `phase hold merged --slot B --attempt a1` lands. Assert the file has exactly one line, `outcome:'reuse'`, `members` lists `['mem-a','mem-b']` for a two-member fixture (adjust members for the fixture you use), and `built_on` equals the post-advance remote tip.
6. Unlanded discard: batch with `candidate` set and `applied:true` that never lands; run `next` → `reconcileBatch` discards → exactly one `red` line. Copy the discard setup from `tests/batch-dispatch.test.ts` (the candidate/reconcile cases) or `tests/batch-merge.test.ts` recovery cases; verify against the code in `src/next.ts` ~line 930–941 which branch discards.
7. Refused calls write nothing: after a batch exists, `phase hold merged --slot B --attempt bogus` and a `merged` call from a leaf that is not the holder both fail and leave `merge-attempts.jsonl` absent.

Tests use `fixture()`, `cli()`, `leaf()`, `readState`, `saveState`, `fakeHerdr`, `branchAt`/`batchFixture`/`advanceRemote` patterns from `tests/helpers.ts`, `tests/batch-merge.test.ts`, `tests/batch-dispatch.test.ts`. Import what exists; re-create `batchFixture`/`advanceRemote` copies if they are not exported. Use `test.serial` as sibling files do. The unit runs against a worktree where the implementation already landed; still include one deliberate-break proof: temporarily make `batchPush` append `'merged'` unconditionally, run the reuse test, paste the red output in your report, then revert.

## 3. Read-first list

- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `fakeHerdr`.
- `tests/batch-merge.test.ts` — `batchFixture`, `advanceRemote`, reuse harness (~858), solo check.fix (~655).
- `tests/batch-dispatch.test.ts` — reconcile/next harness (~231, ~317, ~539).
- `src/state.ts` — `Batch` shape, `readState`/`saveState`.
- `src/next.ts` — `reconcileBatch` ~875–941 to pick the right discard branch.
- `src/phase.ts` — `phaseCommand` batch branches.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `tests/merge-attempts.test.ts` (new file). Shared test resource: none (each test builds its own fixture). Depends on unit 1 (implementation) — it has already landed in your worktree's base commits. Interface: `issues/merge-attempts.jsonl` lines parsed with `JSON.parse` per line; `attempt` values are UUIDs from `attemptId`.

## 5. Do-not, reasons and exceptions

- Do not create or modify any other test file, and do not modify `src/` except the one temporary deliberate break you revert: owning other files collides with sibling units and the phase guard needs `Test-Change:` trailers on pre-existing test paths. Exception: none.
- Do not assert on `log.jsonl` contents beyond the byte-identical check: readers/log format are out of scope. Exception: none.
- Do not weaken a criterion to make a test pass: report the red evidence as a mismatch instead. Exception: a revised brief from A.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A.

Reasons and exceptions restated: own only the new file (collision/trailer rules, no exception); log.jsonl is compared byte-wise only (scope, no exception); red evidence is reported, not bent (integrity, exception is a revised brief).

## 6. Ordered steps

1. Skim the three test files for the harness pieces you will copy (criteria 1–7).
2. Write the file with `attemptLines` helper and the seven cases.
3. `bun test tests/merge-attempts.test.ts --timeout=30000` until green.
4. Deliberate-break proof per criterion in section 2, paste red output, revert.
5. `bun test tests/batch-merge.test.ts tests/batch-dispatch.test.ts --timeout=30000` (consumers you copied patterns from).

Advisory size: 1 file, under 40 turns (the recovery harnesses are the expensive part).

## 7. Commands

```sh
bun install
bun test tests/merge-attempts.test.ts --timeout=30000
AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36 && bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Seven cases green, deliberate-break red pasted and reverted, changed-tests run reported. Commit `tests/merge-attempts.test.ts` with a `merge-attempt-records:` prefix message; return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
