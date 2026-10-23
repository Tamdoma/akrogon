# Brief u2: constructedEnv sets LANG=C.UTF-8, repo-declared LANG wins

Leaf: check-env-fidelity (repo akrogon). Worktree: `/home/ivan/.akrogon/worktrees/akrogon/check-env-fidelity-u2` (detached at the leaf HEAD, which already holds the planned red-first tests).

## 1. Goal

Plan decision D2: `constructedEnv` in `src/run-check.ts` gives every checked command `LANG=C.UTF-8`, while a repo declaring `LANG` in `env` or `pass_env` still sees the caller's value.

## 2. Acceptance criteria

1. `constructedEnv(repo, runRoot)` sets `env.LANG = 'C.UTF-8'` after the `copied` loop, after `env.TMPDIR`, and before the `[...repo.config.env, ...repo.config.pass_env]` loop, so a declared `LANG` overwrites it. `env.DBUS_SESSION_BUS_ADDRESS` ordering unchanged.
2. `LANG` and `LC_ALL` are NOT added to the reserved names in `src/config.ts`.
3. Planned test green plus the existing env allowlist test green: `tests/run-check.test.ts` tests 'run-check gives the command LANG=C.UTF-8 unless the repo declares LANG in env or pass_env' and 'run-check builds an allowlisted env, copies declared names and omits undeclared ones'.

## 3. Read-first

- `src/run-check.ts` — `constructedEnv` (~line 56) and the `copied`/`forbidden` lists above it.
- `tests/run-check.test.ts` — the planned test (~line 100) and the allowlist test (~line 60) whose `allowed` set already contains `'LANG'`.
- `src/config.ts` — reserved names in `superRefine` (~line 63); confirm only, do not edit.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owns: `src/run-check.ts`. One line added inside `constructedEnv`. No prerequisite units; disjoint from u1 (`src/scope.ts`) and u3 (`docs/guide/`).

## 5. Do-not, reasons and exceptions

- Do not copy the caller's `LANG` unconditionally: the whole point is a fixed default with a declared override. Exception: none.
- Do not add `LANG` or `LC_ALL` to `forbidden`, `copied` or `src/config.ts` reserved names: declaring `LANG` must stay legal. Exception: none.
- Do not edit any test file or add tests: tests are locked; a red planned test after your correct edit returns a mismatch. Exception: none.
- Return a mismatch with evidence instead of widening scope or interfaces; the only exception is a revised brief from A authorizing the change.

Restated: every exclusion above holds because the locked design is one line in one function; the sole escape is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in your worktree.
2. Edit `src/run-check.ts` per section 4 (criterion 1).
3. Run the command in section 7; expect both tests green (criterion 3).
4. Commit `src/run-check.ts` alone with a `feat(run-check): …` or `fix(run-check): …`-style message, return the commit id and report.

Advisory size: 1 file, under 6 turns.

## 7. Commands

```
akrogon run-check --name lang-checks -- bun test --timeout=30000 tests/run-check.test.ts -t 'LANG|allowlisted'
```

Run it in your worktree. Keep output only through this `akrogon run-check` invocation and cite the `check <label>: <exit> <path>` line it prints to stderr; `akrogon log <path>` reads the cited log back.

## 8. Done-when, evidence and report

Done when the line is in place, both named tests are green, and `src/run-check.ts` is committed on the detached HEAD. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
