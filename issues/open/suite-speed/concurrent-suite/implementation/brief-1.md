# Brief 1: concurrent bun test default

## 1. Goal
Make plain `bun test` run the suite concurrently, with no CLI flag (plan D1, D2, D3, D5).

## 2. Acceptance criteria
1. `bunfig.toml` `[test]` contains `root = "tests"`, `concurrentTestGlob = "**/*.test.ts"` and `preload = ["./tests/setup.ts"]`.
2. New `tests/setup.ts` contains exactly `import { setDefaultTimeout } from 'bun:test';` and `setDefaultTimeout(30_000);`.
3. In `tests/shell.test.ts`, the `test(` at line 10 (the `deadline kills sleeping attempt ...` test inside the `firstFailure` loop) and the `test(` at line 42 (`ordinary retry preserves warning and second result with optional deadlines`) become `test.serial(`. These two tests share `spyOn(console, 'warn')`. Nothing else changes.
4. `tests/AREA.md` gets one Key files line for `tests/setup.ts` (it sets the 30 s default timeout and is preloaded by bunfig) and one Non-obvious patterns line: bunfig runs every test file concurrently, and tests that share global state use `test.serial`. Keep the file at 40 lines or fewer, with its four existing sections.
5. The changed-test command in section 7 passes.

No new test. This is configuration, and A proves it with a full `bun test` run.

## 3. Read-first
- `bunfig.toml`
- `tests/shell.test.ts:1-60`
- `tests/AREA.md`
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces
- `bunfig.toml`: add the two keys.
- `tests/setup.ts`: new file.
- `tests/shell.test.ts`: two edits.
- `tests/AREA.md`: two lines.
- Interfaces: `setDefaultTimeout(ms: number): void` and `test.serial` from `bun:test` (bun 1.4.2). The bunfig preload path is relative to `bunfig.toml`.
- Owned paths: the four files above. Prerequisites: none. Shared test resource: none.

## 5. Do-not
- No `--max-concurrency`, no `package.json` change, no change under `issues/`, and no split of `tests/next.test.ts`. The locked design forecloses each of these.
- Change no other test. The exception: a test that fails only under concurrency gets `test.serial`, and you report the state it shares.
- Do not change the lockfile. `bun install` is for setup only.
- If a requirement here conflicts with the code, return a mismatch with evidence instead of changing scope. The exception is a revised brief from A.

The reasons and exceptions above stay attached: the scope is locked by the design, and the only allowed extra is a concurrency-forced `test.serial` that you report.

## 6. Steps
1. Run `bun install` in the worktree (there is no `node_modules`).
2. Edit `bunfig.toml` (criterion 1) and create `tests/setup.ts` (criterion 2).
3. Edit `tests/shell.test.ts` (criterion 3).
4. Edit `tests/AREA.md` (criterion 4).
5. Run the section 7 command (criterion 5).
6. Commit only these four files with the message `concurrent-suite u1: concurrent bun test default (D1,D2,D3,D5)`. Add no co-author line.

Advisory size: 4 files, under 16 turns.

## 7. Commands
`AKROGON_BASE=22c447039b192f4caae6cad4d5b56092941d1bed bun test --changed="$AKROGON_BASE"`

## 8. Done-when and report
All criteria are met, the commit ID is returned, and the command output is pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
