# Sub-brief 1: watch-issues scripts gate

Leaf: watch-scripts-check. Worker worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/watch-scripts-check-u1 (detached at 9fe5e82). Commit your changes there and return the commit ID.

## 1. Goal

Put the watch-issues skill's own scripts under akrogon's blocking `test` check. Plan decisions D1-D5: one root test spawns `bun test scripts` then `bun run typecheck` with cwd `skills/watch-issues`, asserts exit 0 on each, and on failure reports command, cwd, exit code, stdout and stderr. `skills/watch-issues/package.json` `test` becomes `bun test scripts`. Add one doc line in `tests/AREA.md`.

## 2. Acceptance criteria

1. `tests/watch-issues-scripts.test.ts` exists and passes under `bun test --timeout=30000` at repo root.
2. On subpackage failure, the test failure message carries the failed command, cwd, exit code and its stdout/stderr (JSON object shape, like `CommandError`'s message). Proof of failure behavior is A's job via a throwaway edit; your test just needs to produce that message.
3. `skills/watch-issues/package.json` `"test"` is exactly `bun test scripts`.
4. Both subpackage commands run even when the first fails, so one run reports both results.
5. `tests/AREA.md` gains one line under `## Key files` naming the new file as the `skills/watch-issues` gate.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (this skill folder) — required reading before editing.
- `src/shell.ts` — reuse `run(argv, cwd)` which returns `{ code, stdout, stderr }`; copy the `CommandError` message shape (`JSON.stringify({ command: argv, cwd, ...result })`).
- `skills/watch-issues/scripts/observe.test.ts` — the spawn pattern to copy: `process.execPath` as the bun binary, never a literal `bun`.
- `skills/watch-issues/package.json` and `skills/watch-issues/tsconfig.json` — script names, `include: ["scripts/*.ts"]`.
- `bunfig.toml` and root `tsconfig.json` — root test scope `tests/`, root typecheck includes `tests/**/*.ts`.
- `tests/AREA.md` — where the doc line goes.

## 4. Change list and needed interfaces

- New `tests/watch-issues-scripts.test.ts`: two sequential `run()` calls with `cwd = join(import.meta.dir, '..', 'skills/watch-issues')` (resolve to absolute; `run` passes cwd to the child verbatim). Commands: `[process.execPath, 'test', 'scripts']` then `[process.execPath, 'run', 'typecheck']`. Collect both results, then `expect(codes).toEqual([0, 0])` or equivalent so both run even when the first fails, with the JSON failure detail attached as the expect message per criterion 2. File must typecheck under root `tsconfig.json` (strict; annotate every variable).
- `skills/watch-issues/package.json`: `"test": "bun test scripts"`. Keep `"typecheck": "tsc -p tsconfig.json"` unchanged.
- `tests/AREA.md`: one line under `## Key files`.
- Interfaces used, all existing: `run` from `../src/shell.ts` (import path from tests/), `process.execPath`, `expect(value, message)` from `bun:test`.
- Prerequisite: none. Shared test resource: none (real `skills/watch-issues` files are run read-only; do not modify `observe.ts` or `observe.test.ts`).

## 5. Do-not, reasons and exceptions

- Do not touch `skills/watch-issues/scripts/observe.ts`, `observe.test.ts`, `SKILL.md`, root `bunfig.toml`, root `tsconfig.json`, or any `issues/` file — all excluded by the locked design; editing them breaks other leaves or the artifact boundary.
- Do not add a deadline/timeout to `run()` — the 30 s blocking budget lives on the `checks.test` command, not per command; the subcommands measure ~0.5 s each.
- Do not run `bun test scripts` by hand inside the test as a shell string — argv arrays only.
- Do not write any file under `issues/` — `akrogon phase` refuses issue artifacts on the branch.
- Do not write the fail-first proof (throwaway type error in `observe.ts`) — that is done-criterion 2 and belongs to A in the leaf worktree.
- A scope or interface conflict returns a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief from A.

Reasons and exceptions restated: excluded files and the artifact boundary are locked design and lifecycle constraints; the timeout and argv rules keep the test honest and portable; the fail-first run is A's criterion proof, not worker work. Any conflict with the above returns as a mismatch, not a local judgment call, unless A revises this brief.

## 6. Ordered steps

1. Read `src/shell.ts`, `observe.test.ts`, `package.json`, `tests/AREA.md`. (All criteria.)
2. Write `tests/watch-issues-scripts.test.ts` per section 4. (Criteria 1, 2, 4.)
3. Edit `skills/watch-issues/package.json` `test` script. (Criterion 3.)
4. Add the `tests/AREA.md` line. (Criterion 5.)
5. Run `bun test tests/watch-issues-scripts.test.ts` at repo root — expect pass. (Criterion 1.)
6. Run the section 7 command — expect pass. If it fails on your diff, repair within this brief and rerun.
7. Commit all three files in one commit on the detached HEAD; return the commit ID.

Advisory size: 3 files, under ~15 turns.

## 7. Commands

Changed-tests command (AKROGON_BASE supplied):

```
AKROGON_BASE=9fe5e822df9bd2764d4248928f8a81ea03e3162f bun test --changed="$AKROGON_BASE" --timeout=30000
```

Run at the worktree root. If `--changed` selects nothing or misses your new file, also run `bun test tests/watch-issues-scripts.test.ts` and report both.

## 8. Done-when, evidence and report

Done when: the new test passes, package.json `test` is `bun test scripts`, the AREA.md line exists, the section 7 command is green, and the commit ID is returned. Evidence: pasted outputs of `bun test tests/watch-issues-scripts.test.ts` and the changed command. Tests here are real subpackage invocations, no fixtures.

Fill in before returning:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
