# Brief: watch-scripts-check

## What
Put the watch-issues skill's own scripts under akrogon's blocking checks. (A,B)
1. New root test `tests/watch-issues-scripts.test.ts` runs `bun test scripts` and then `bun run typecheck` with cwd `skills/watch-issues`, and fails with the command, exit code and output when either exits non-zero.
2. `skills/watch-issues/package.json` `test` becomes `bun test scripts`, so every test file under `scripts/` is found.
`bun test scripts` in `skills/watch-issues` is the spine command for this issue. seat-log-path, log-tail and busy-rule-log consume this leaf's root test so their own tests and type errors fail the blocking `test` check.

## Why
Tamdoma/tamdoma-framework#118 work changes `skills/watch-issues/scripts/`. Today no blocking check covers that folder: akrogon `bunfig.toml` sets `[test] root = "tests"` and root `tsconfig.json` includes only `src/**/*.ts` and `tests/**/*.ts`. Measured 2026-10-02 in the main checkout: both subpackage commands pass using root dependencies with no install, typecheck in about 0.5 s and tests in about 0.6 s.

## Done-criteria
1. `tests/watch-issues-scripts.test.ts` passes under the blocking `test` command (`bun test --timeout=30000`).
2. The implementation report records one run where a throwaway type error in `skills/watch-issues/scripts/observe.ts` makes that root test fail with the typecheck output, and the throwaway edit is reverted before commit.
3. `skills/watch-issues/package.json` `test` is `bun test scripts`.
