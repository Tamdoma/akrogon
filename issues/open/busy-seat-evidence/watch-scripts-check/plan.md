# Plan: watch-scripts-check

Synthesis mode: `debate: no`, built directly from brief and locked design. No positions or rebuttals exist.

## Decisions

- D1. One root test `tests/watch-issues-scripts.test.ts` spawns the two spine commands sequentially in `skills/watch-issues`: `bun test scripts`, then `bun run typecheck`. Any non-zero exit fails the test. Run order is fixed: tests first, typecheck second, matching brief order.
- D2. Spawn with `process.execPath` (the running `bun` binary) instead of a literal `bun`, matching `skills/watch-issues/scripts/observe.test.ts`; the test never depends on PATH.
- D3. Reuse `run` from `src/shell.ts` for spawning; it returns `{ code, stdout, stderr }`. No new spawn helper.
- D4. On non-zero exit, the assertion message carries command, cwd, exit code, stdout and stderr as a JSON object (the `CommandError` serialization shape). The second command still runs after a first failure, so both results appear in one run.
- D5. `skills/watch-issues/package.json` `test` becomes `bun test scripts`; `typecheck` stays `tsc -p tsconfig.json`.
- D6. Out of scope per design: `observe.ts`, `log-tail.ts`, `SKILL.md`, root `bunfig.toml`, root `tsconfig.json`, `checks` config. The new test file lands under root coverage automatically (`bunfig` `root = "tests"`, `tsconfig` `include` covers `tests/**/*.ts`).

## Read-first

- `brief.md`, `design.md` (this leaf folder)
- `src/shell.ts` — `run` signature and `CommandError` message shape
- `skills/watch-issues/scripts/observe.test.ts` — `Bun.spawn` + `process.execPath` pattern
- `skills/watch-issues/package.json`, `skills/watch-issues/tsconfig.json` — script names and include scope
- `bunfig.toml`, `tsconfig.json` (root) — why the subpackage is uncovered today
- `tests/AREA.md` — doc checklist entry

## Needed interfaces

- `run(argv: string[], cwd: string, deadlineMs?: number): Promise<{ code, stdout, stderr }>` from `src/shell.ts` (existing).
- `process.execPath` for the bun binary (existing runtime value).
- `expect(value, message)` second-arg message from `bun:test` to attach failure detail (existing, used in `observe.test.ts`).

## Checklist

### Wave 1

- U1. `tests/watch-issues-scripts.test.ts` (new) + `skills/watch-issues/package.json` (`test` script) + `tests/AREA.md` (one line under Key files). One unit: the two code changes are one criterion pair and the doc line rides the same commit. Owns exactly those three paths. Shared test resource: none; it runs the real `skills/watch-issues` scripts read-only, no fixture, no mutation. Depends on nothing.

## Verification

| Done-criterion | Proof command | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1. root test passes under blocking `test` | `bun test --timeout=30000` | failing subpackage tests or type errors now fail the suite | seconds | any change to the test file or `skills/watch-issues` |
| 1 (isolated) | `bun test tests/watch-issues-scripts.test.ts` | the new file itself, ~1 s of subpackage work | seconds | while iterating on the test |
| 2. fail-first proof | throwaway type error appended to `skills/watch-issues/scripts/observe.ts` (e.g. `const x: number = "s";`), run `bun test tests/watch-issues-scripts.test.ts`, confirm failure output contains `bun run typecheck` detail and the tsc error, then revert the edit before commit | a vanity test that cannot see typecheck failures | seconds | criterion 2 evidence in the implementation report |
| 3. package.json `test` is `bun test scripts` | `grep '"test": "bun test scripts"' skills/watch-issues/package.json` | a stale or renamed script | seconds | on the file |
| blocking checks | `bun run format`, `bun run typecheck` (repo `checks`; `test_changed` needs `AKROGON_BASE`, run `bun test --timeout=30000` instead as the brief's named whole run) | formatting drift, root type errors | seconds | before report |

Restart boundaries: not a slow-run leaf; single pass.

## Doc impact

- `tests/AREA.md`: one line under Key files naming `tests/watch-issues-scripts.test.ts` as the `skills/watch-issues` gate.
- No other agent or human doc references the subpackage test command; grep confirmed.
