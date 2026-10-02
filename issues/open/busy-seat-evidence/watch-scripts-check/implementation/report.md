# Implementation report: watch-scripts-check

Base: 9fe5e822df9bd2764d4248928f8a81ea03e3162f (merge-base with main, = AKROGON_BASE)
Head: f0f4c2f Format watch-issues scripts gate test
Commits on branch:
- d1a37f1 Add watch-issues scripts gate test (worker commit 9de659d cherry-picked)
- f0f4c2f Format watch-issues scripts gate test (prettier line-wrap, applied by `bun run format`)

## Changed files and reasons

- `tests/watch-issues-scripts.test.ts` (new) — spawns `bun test scripts` then `bun run typecheck` with cwd `skills/watch-issues` via `run()` from `src/shell.ts`, asserts both exit 0, and on failure attaches a JSON detail of command, cwd, code, stdout and stderr per command (CommandError shape). Both commands run even when the first fails (D1-D4).
- `skills/watch-issues/package.json` — `"test": "bun test scripts"` so every `*.test.ts` under `scripts/` is found (D5).
- `tests/AREA.md` — one line under `## Key files` naming the new file as the `skills/watch-issues` gate.

## Commands run (results)

- `bun test tests/watch-issues-scripts.test.ts` — 1 pass, ~1.0-1.1 s (runs the subpackage's 22 tests + `tsc -p tsconfig.json`).
- `AKROGON_BASE=9fe5e82… bun test --changed="$AKROGON_BASE" --timeout=30000` — selected the new file, 1 pass.
- Fail-first proof (done-criterion 2): appended `const throwawayProof: number = "not a number";` to `skills/watch-issues/scripts/observe.ts`, reran the root test — it failed with both results in one JSON detail: `bun test scripts` code 0 (22 pass), `bun run typecheck` code 2 with `scripts/observe.ts(269,7): error TS2322: Type 'string' is not assignable to type 'number'.` in its output. Edit reverted with `git checkout` before commit; `git status` clean at handoff.
- `bun run format` — reformatted the new test file (the f0f4c2f commit), nothing else.
- `bun run typecheck` — clean.
- `bun test --timeout=30000` (blocking `test` check) — 356 pass, 0 fail across 16 files, 11.36 s.
- `grep '"test": "bun test scripts"' skills/watch-issues/package.json` — match (done-criterion 3).

All commands sized seconds; none minutes/hours, no wall-time table required.

## Done-criteria coverage

1. New test passes under `bun test --timeout=30000` — proven by the 356-pass run above.
2. Throwaway type error in `observe.ts` fails the root test with the typecheck output, reverted before commit — proof pasted above.
3. `skills/watch-issues/package.json` `test` is `bun test scripts` — grep match, diff in d1a37f1.

## Delegation

One unit per plan; delegated to worker `Gimli` in worktree `watch-scripts-check-u1`. Worker commit 9de659d cherry-picked cleanly as d1a37f1; worker worktree removed. Worker return accepted: changed files/reasons, test results, limitations and unverified criteria all present.

## Known limitations

- None. The subpackage commands measure ~0.5-0.6 s each, well inside the 30 s suite timeout.

## Unverified criteria

- None.
