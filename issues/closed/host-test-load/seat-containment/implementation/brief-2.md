# Brief 2: bus cut in runs (U2)

## 1. Goal
Every run-check and base-run command gets `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, and repo config cannot name that variable in `env` or `pass_env`. Plan decision D5, criterion C3 (run part).

## 2. Acceptance criteria
1. `constructedEnv` in src/run-check.ts sets `env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/nonexistent'` after the env/pass_env loop, so a caller value never reaches the child. base-run reuses `constructedEnv`, so it is covered too.
2. `'DBUS_SESSION_BUS_ADDRESS'` joins the `constructed` reserved set in src/config.ts (~line 70), so `env` or `pass_env` naming it fails `akrogon config` with the field and the name in the error.
Planned tests (committed, run them, never edit them):
- tests/run-check.test.ts "run-check cuts the session bus even when the caller has one"
- tests/base-run.test.ts "a base-run command runs with the session bus cut"
- tests/config.test.ts "config accepts env and tools lists and refuses bad and reserved env names" and "config refuses DBUS_SESSION_BUS_ADDRESS in pass_env"
All other tests in those files must stay green.

## 3. Read first
- src/run-check.ts `constructedEnv` (~line 44), src/config.ts `superRefine` reserved set (~line 69).
- /home/ivan/.claude/skills/implement-issue/ponytail.md

## 4. Change list
Two one-line edits. Owned paths: src/run-check.ts, src/config.ts. Nothing must land first. No shared test resource.

## 5. Do-not, reasons, exceptions
- Do not edit tests/. If a planned test is wrong, return a mismatch.
- Do not change DISPLAY, WAYLAND_DISPLAY or XDG_RUNTIME_DIR handling. The design keeps them unchanged.
- Do not touch src/next.ts, src/install.ts, src/self-update.ts, src/scope.ts. Other workers own them.
Reasons and exceptions: the tests and design are locked. The only exception is a revised brief from A.

## 6. Steps
1. src/run-check.ts (AC1). 2. src/config.ts (AC2). 3. Run section 7.
Advisory size: 2 files, under 8 turns.

## 7. Commands
From the worktree, after `bun install --frozen-lockfile`:
`AKROGON_BASE=99a5ada582267e92d227c005eb1705ce7dc80576 bun test --changed=99a5ada582267e92d227c005eb1705ce7dc80576 --timeout=30000`

## 8. Done-when
AC hold and section 7 passes. Commit only your files with message `feat: cut the session bus in run-check and base-run`. Add no co-author line. Return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
