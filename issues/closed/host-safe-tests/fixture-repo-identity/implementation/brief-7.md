# Brief 7 — leftover literals sweep (unit U7)

## 1. Goal

Plan decision D4: audit-and-sweep every remaining `tests/` file holding `'repo'`/`rp`/`'rp'`
literals. Replace only literals that name a fixture's registered repo identity; keep foreign,
pure-input and fake-root literals. Many files need zero edits — record the audit result.

## 2. Acceptance criteria

1. `git grep -n "'repo'\|rp-\|'rp'"` over your files leaves only non-fixture-identity literals.
2. Files with fixture-identity literals are fixed (`f.repo`/`f.prefix`); files with only foreign or
   pure literals are unchanged and their audit is recorded in your report.
3. Any edited file passes `bun test`; `bun run typecheck` clean.

## 3. Read-first list

- `tests/helpers.ts` — `Fixture.repo`, `fixture()`, `leaf()`.
- `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files you own: `tests/flaky.test.ts`, `tests/keep-rule.test.ts`, `tests/hold-retired.test.ts`,
`tests/retired-debate.test.ts`, `tests/slow-merge.test.ts`, `tests/run-permit.test.ts`,
`tests/direct-guards.test.ts`, `tests/chart-shapes.test.ts`, `tests/lessons.test.ts`,
`tests/park.test.ts`, `tests/close.test.ts`, `tests/close-pack.test.ts`,
`tests/durable-capture.test.ts`, `tests/abandoned-capture.test.ts`, `tests/folder-pack.test.ts`,
`tests/guard.test.ts`, `tests/sync.test.ts`, `tests/notices.test.ts`, `tests/isolation.test.ts`,
`tests/test-files.test.ts`.

Rule: replace only where a literal names the fixture's registered repo — `repos`/`prefixes` keys,
`readRepo(name, <fixture root>)`, leaf-state `repo:` fields under that root, `leafSlice({name})`,
systemctl stops, asserted derived names, `seedRun`/`VerifyRun` `repo:` fields, `configure(f, {
repos: { repo: … } })`. Stays: `noticeId('repo', …)` inputs, `Repo` literals with `root: '/r'` or
fake roots, `stored:`/`repo: 'other'` foreign assertions, `flaky.test.ts`'s `Repo` literal if it
isn't a fixture registration (read the context — `readRepo('repo', f.root)` IS a fixture identity).

Per file: `grep -n "'repo'\|rp-\|'rp'"`, decide fixture-identity vs foreign/pure, apply, run the
file's test only when edited.

## 5. Do-not, reasons and exceptions

- Do not edit other units' files or assertion semantics; red planned tests return as mismatch.
- Do not replace a literal merely for consistency — only fixture-identity literals move.
- Reasons and exceptions stay attached; return a mismatch instead of changing scope.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile`.
2. Per file: grep, decide, apply, run edited files' tests.
3. `bun run typecheck`.
4. One commit with `Test-Change:` trailers (only when files changed).

Advisory size: 20 files, ~45 turns.

## 7. Commands

- `akrogon run-check --name u7-<file> -- bun test tests/<file>.test.ts --timeout=30000` per edited
  file.
- `bun run typecheck`.

## 8. Done-when, evidence and report

Changed files and reasons: <paths and why; for audited-only files a one-line "audit: all literals
non-fixture-identity" note>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
