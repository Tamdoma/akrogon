# Sub-brief 1: store and read `failures` (unit U1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/stored-failure-names-u1 (detached HEAD 6d0541e1)

## 1. Goal

Plan decisions D1, D2, D3, D4: a red command entry in `verify-runs.jsonl` records its log's failure names at write time; `flips` and `newRedUnits` read stored names first; the known-red receipt never reads the field. Criteria C1–C5.

## 2. Numbered acceptance criteria

1. `verifyRunSchema`'s command entry accepts optional `failures`: a non-empty deduplicated string array. Rows without it parse as today.
2. `runOnce` stores `await failedTests(repo, log)` on an entry only at the two sites where that entry's own `checkedRun` produced the log and `code !== 0`: the sequential-check `ran.push` and the `merge_checks` member push in the `settled` loop. If the returned list is exactly `['(log gone)']`, store nothing. Setup-failed pushes (copy `setup.code`/`setup.log`) and `blocked` pushes store nothing, even when non-zero. A `verify --known-red` base pass shares `runOnce`, so base rows store identically.
3. `flips` (src/flaky.ts): the red entry's names are `entry.failures ?? (await failedTests(repo, entry.log))` — the stored `Red` record carries `failures` through.
4. `newRedUnits` (src/verify.ts): both name reads — the `me` entry's units and each earlier run's matched entry — are `item.failures ?? (await failedTests(repo, item.log))`.
5. `knownRedReceipt` and `requireGreenReceipt` never read `failures`; both logs are always read through `failedTests`. The locked final rewrite in `runOnce` writes parsed rows whole, so `failures` rides through with no extra code.
6. The planned tests pass (see §7); do not touch any test file.

## 3. Read-first list

- src/verify.ts — `verifyRunSchema` (commands entry), `runOnce` (every `ran.push`), `newRedUnits`, `knownRedReceipt`.
- src/flaky.ts — `failedTests`, `flips`, `flakyLines`, the `Red` type.
- tests/verify.test.ts — the five new tests at the bottom (lines ~1915–2200) and `failuresOf`.
- tests/flaky.test.ts — the `Step`/`run` builder and the stored-name test.
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md.

Pattern to copy: existing optional fields (`reused`, `blocked`) on the command entry schema and their conditional spreads `...(x === undefined ? {} : { x }))`.

## 4. Change list and needed interfaces

- src/verify.ts: add `failures: z.array(z.string()).min(1).refine((list) => new Set(list).size === list.length).optional()` to the commands entry `z.strictObject`; at the two writer sites, after `checkedRun` returns non-zero, compute `const names: string[] = await failedTests(repo, log)` once and push `{ ...item, exit: code, log, ...(names.includes('(log gone)') ? {} : { failures: names }) }`; `newRedUnits`: replace both `await failedTests(repo, item.log)` calls with the stored-first form (head and earlier-run reads keep working because `failedTests` stays).
- src/flaky.ts: `Red` widens to carry `failures` (store the whole entry `item` — it already holds name, command, log); the green side reads `prior.failures ?? (await failedTests(repo, prior.log))`.
- Owned paths: src/verify.ts, src/flaky.ts only. Depends on nothing else; the test commit is already on HEAD.
- Interface: `VerifyRun['commands'][number]['failures']` is `string[] | undefined`.

## 5. Do-not, reasons and exceptions

- Do not edit, add or delete any test file or fixture: tests are locked; a red or wrong planned test is a mismatch returned with evidence, not a fix. Exception: none.
- Do not change `failedTests`, the name grammar, `readLog` or the `(log gone)` fallback: owned by the merged `failure-names` leaf. Exception: none.
- Do not store `failures` on `blocked`, setup-copied or green entries, and never store `['(log gone)']`: the schema/reader contract. Exception: none.
- Do not read `failures` inside `knownRedReceipt`: a gone log must still refuse. Exception: none.
- Do not touch `issues/`, docs, `run-check`, or files outside the two owned paths. Exception: none.
- Do not stop processes by name pattern; use `akrogon stop-run <run-id>`. Exception: none.
- Restated: every exclusion above has its reason in-line; the only exception path is a mismatch returned to A.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` in the worktree (about 1 file, under 10 turns).
2. Add the `failures` schema field (src/verify.ts); run the schema test — expect green for the parse-shape asserts.
3. Wire `flips` stored-first in src/flaky.ts; run the flaky targeted command — expect the stored-name test green.
4. Add the two writer sites and the two `newRedUnits` stored-first reads in src/verify.ts; run the verify targeted command — expect all five new tests green.
5. `bun run typecheck` and `bunx prettier --check src/verify.ts src/flaky.ts` — both clean; prettier-write if needed.
6. Commit one commit on the detached HEAD (`feat: stored failure names ...`); return the commit ID.

Advisory size: about 2 files, under 10 turns.

## 7. Commands

- `bun test tests/verify.test.ts --test-name-pattern 'stores its failure names|stores its script name|receipt schema rejects|keeps an unresolved main-red covered|stored names never satisfy|gone head log whose row'`
- `bun test tests/flaky.test.ts --test-name-pattern 'stored failures name'`
- `bun run typecheck`
- `bunx prettier --check src/verify.ts src/flaky.ts`

No `akrogon verify`, no full suite, no `akrogon run-check` needed for these plain commands; if you do use run-check, cite its `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

All six criteria green: every named test passes, typecheck and prettier clean, one commit exists, `git status` clean. Paste the command results.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
