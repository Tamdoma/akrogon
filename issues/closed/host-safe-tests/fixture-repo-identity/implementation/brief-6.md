# Brief 6 — records/batches literals (unit U6)

## 1. Goal

Plan decisions D1–D4: replace literals naming a fixture's registered repo identity with `f.repo`
in batch, state and verify files.

## 2. Acceptance criteria

1. No fixture-identity literal remains in your files where it names a fixture's registered repo.
2. `batch.test.ts`'s `-e` script string `readRepo('repo', process.argv[2])` uses the fixture's key.
3. Touched files pass `bun test`; `bun run typecheck` clean.

## 3. Read-first list

- `tests/helpers.ts` — `Fixture.repo`, `fixture()`, `leaf()`, `seedRun`, `greenReceipt`, `verified`.
- `tests/batch.test.ts` — `repo: 'repo'` leaf-states, `readRepo` calls.
- `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files you own: `tests/batch.test.ts`, `tests/batch-merge.test.ts`, `tests/batch-dispatch.test.ts`,
`tests/state.test.ts`, `tests/state-home.test.ts`, `tests/worktree-store.test.ts`,
`tests/readiness.test.ts`, `tests/receipt-gates.test.ts`, `tests/verify.test.ts`.

Rule: replace only where the literal names the fixture's registered repo — `repos`/`prefixes` keys,
`readRepo(name, f.root)`/`readRepo(name, process.cwd())` where cwd is the fixture root, leaf-state
`repo` fields under that root, `leafSlice({name})`, `seedRun`/`verifyRun` `repo` fields, asserted
derived names, `configure(f, { repos: { repo: … } })`. Foreign/pure literals stay (`Repo` literals
with fake roots, deliberate `stored:` mismatches, `repo: 'other'` names a test asserts as foreign).

Per file: `grep -n "'repo'\|rp-\|'rp'"`, apply, run the file's test. Note `verify.test.ts` uses
`seedRun`/`greenReceipt`/`verified` from helpers (already fixed) but has its own `repo:` fields and
`readRepo` calls to sweep; `batch.test.ts:334`'s `-e` script `readRepo('repo', process.argv[2])` is
run in the fixture repo root and needs the fixture's key — pass `f.repo` into the script string.

## 5. Do-not, reasons and exceptions

- Do not edit other units' files or assertion semantics; red planned tests return as mismatch.
- Reasons and exceptions stay attached; return a mismatch instead of changing scope.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile`.
2. Per file: grep, apply, run test.
3. `bun run typecheck`.
4. One commit with `Test-Change:` trailers.

Advisory size: 9 files, ~40 turns.

## 7. Commands

- `akrogon run-check --name u6-<file> -- bun test tests/<file>.test.ts --timeout=30000` per file.
- `bun run typecheck`.

## 8. Done-when, evidence and report

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
