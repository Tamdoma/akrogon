# Brief 5 — records/status literals (unit U5)

## 1. Goal

Plan decisions D1–D4: replace literals naming a fixture's registered repo identity with `f.repo`
in status/timing/record files. `status-fixture.ts`'s `event()`/`register()` writes must use
`f.repo` as the repo field/key where it names the fixture's registered repo.

## 2. Acceptance criteria

1. `tests/status-fixture.ts`'s `repo: 'repo'` fields that name the fixture's registered repo become
   `f.repo`; `event()` takes the repo name or the fixture (pick the smallest correct change —
   `event(f, slug, …)` if every caller has `f`, else add a param).
2. No fixture-identity literal remains in your files where it names a fixture's registered repo.
3. Foreign/pure-literal names stay (notice-id inputs, `Repo` literals with fake roots).
4. Touched files pass `bun test`; `bun run typecheck` clean.

## 3. Read-first list

- `tests/helpers.ts` — `Fixture.repo`, `fixture()`, `leaf()`, `seedRun`, `greenReceipt`.
- `tests/status-fixture.ts` — `register`, `event`, leaf-state writes.
- `tests/timing.test.ts`, `tests/timing-report.test.ts`, `tests/merge-attempts.test.ts` —
  `readRepo('repo', …)`, `repo: 'repo'` leaf states, `line.repo` assertions.
- `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files you own: `tests/status.test.ts`, `tests/status-json.test.ts`, `tests/status-fixture.ts`,
`tests/timing.test.ts`, `tests/timing-report.test.ts`, `tests/merge-attempts.test.ts`,
`tests/log-reader.test.ts`, `tests/preflight.test.ts`.

Per-file (`grep -n "'repo'\|rp-\|'rp'"` first; the rule: replace only where the literal names the
fixture's registered repo — `repos`/`prefixes` keys, `readRepo(name, f.root)`, leaf-state `repo`
fields under that root, `leafSlice({name})`, asserted derived names):

- `status-fixture.ts`: `register(f, repos)` callers pass `{ repo: f.root }` → `{ [f.repo]: f.root }`
  (callers are in `status.test.ts`/`status-json.test.ts` — also yours); `event()`'s `repo: 'repo'` →
  the fixture's `f.repo`; `holder: 'repo'` in merge-attempt records → the fixture's repo where it
  names the registered repo.
- `merge-attempts.test.ts`: `readRepo('repo', …)` → `readRepo(f.repo, …)` (also inside `-e` script
  strings where `process.cwd()` is the fixture root — the name must match `f`'s `repos` key);
  `repo: 'repo'` leaf-states → `f.repo`; `expect(line.repo).toBe('repo')` → `f.repo`.
- `timing.test.ts`, `timing-report.test.ts`, `log-reader.test.ts`, `preflight.test.ts`,
  `status.test.ts`, `status-json.test.ts`: `repo: 'repo'` leaf-states/event repos → `f.repo`;
  `readRepo('repo', f.root)` → `f.repo`; `repos:`/`prefixes:` keys → `f.repo`/`f.prefix`.

## 5. Do-not, reasons and exceptions

- Do not edit files of other units; do not change assertion semantics.
- `status-fixture.ts` signature changes are allowed only inside tests/ and must stay minimal;
  a red planned test is a mismatch, not a fix.
- Reasons and exceptions stay attached; return a mismatch with evidence instead of changing scope.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile`.
2. Per file: grep, apply, run the file's test.
3. `bun run typecheck`.
4. One commit with `Test-Change:` trailers.

Advisory size: 8 files, ~35 turns.

## 7. Commands

- `akrogon run-check --name u5-<file> -- bun test tests/<file>.test.ts --timeout=30000` per touched
  file.
- `bun run typecheck`.

## 8. Done-when, evidence and report

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
