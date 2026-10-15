# Brief U2: `akrogon log` command and README row

Worktree: /home/ivan/.akrogon/worktrees/akrogon/log-reader-u2

## 1. Goal

Add the `log` verb to the CLI (plan D4) so done-criteria C1-C3 (plain bytes, archive bytes, outside-repo resolution) pass, and document it in the README Command table.

## 2. Acceptance criteria

1. `akrogon log <path>` writes the resolved log's bytes to stdout unchanged (no text decoding, no trailing newline added).
2. Inside a registered repo it resolves through `currentRepo`; outside any repo it uses `readLogAcross` (0 matches → non-zero naming the path; >1 → non-zero naming matching repos; unreadable archive → non-zero naming the path).
3. README `## Command` table gains `| \`akrogon log <path>\` | <one line: prints the recorded log's bytes...> |` between the `flaky` and `run-check` rows.
4. `tests/log-reader.test.ts` C1, C2, C3 cases pass; `tests/command-reference.test.ts` passes (the `log: '<path>'` contract row is already committed).

## 3. Read-first list

- `src/akrogon.ts`: CLI switch; the `flaky` case at the bottom is the shape to copy (lazy `await import`, `z` arg parsing); the usage string in `default` lists every verb.
- `src/evidence.ts` (U1, already on HEAD): `readLog`, `readLogAcross`, `LogError`
- `src/config.ts`: `readGlobal`, `currentRepo`, `Repo`
- `README.md`: `## Command` table (a fenced `text` block of pipe rows)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

`src/akrogon.ts`:
- New `case 'log':` before `run-check` in the switch:
  - `const [recorded]: [string] = z.tuple([z.string()]).parse(positionals);`
  - `const global = readGlobal(); const repo = await currentRepo(global, process.cwd());`
  - `const bytes = repo === null ? await readLogAcross(global, recorded, process.cwd()) : await readLog(repo, recorded, process.cwd());`
  - `process.stdout.write(bytes);`
- Add `log` to the `default` usage string's verb list (keep alphabetical-ish order near `flaky`).
- `options`: `log` needs no flags → the `{}` default arm already covers it; verify `parseArgs` handles it.

`README.md`: one table row `| \`akrogon log <path>\` | Print a recorded check or verify log's bytes, resolving the path against the current or every registered repo, plain file first then the owner's \`evidence.tar.zst\`. |` placed between the `flaky` and `run-check` rows.

## 5. Do-not, reasons and exceptions

- Write or edit no test file: tests are locked. Exception: none — mismatch to A.
- Touch `src/flaky.ts` (U3's lane), `src/evidence.ts` (landed), skill files (U4): no. Exception: revised brief from A.
- No text decoding of log bytes (`console.log(bytes)` adds a newline and re-encodes): use `process.stdout.write`. Exception: none.
- Thrown `LogError` is the error path; do not catch it into `console.error` + `process.exit`: the top-level throw prints it and exits non-zero, matching every other case. Exception: none.
- Restated: exclusions stand; only a revised brief from A changes them.

## 6. Ordered steps

1. `README.md` row (criterion 3).
2. `src/akrogon.ts` case + usage string (criteria 1-2).
3. `bun install --frozen-lockfile`; `bunx tsc --noEmit` — `tests/flaky.test.ts` still has its two expected "Expected 1 arguments" errors (U3 not landed); everything else clean.
4. `bun test tests/log-reader.test.ts` — C1, C2, C3 green; the "docs and skills" case stays red until U4, that's expected and not yours to fix.
5. `bun test tests/command-reference.test.ts` green.

Advisory size: 2 files, ~10 turns.

## 7. Commands

- `bun install --frozen-lockfile`
- `bunx tsc --noEmit`
- `bun test tests/log-reader.test.ts`
- `bun test tests/command-reference.test.ts`

## 8. Done-when, evidence and report

Verb dispatches, README row present, tests/log-reader.test.ts C1-C3 green, command-reference green, commit on the detached worktree HEAD (e.g. `feat: akrogon log resolves recorded log paths`) and return its ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
