# Brief u1: runUnitArgv gains --expand-environment=no

Leaf: check-env-fidelity (repo akrogon). Worktree: `/home/ivan/.akrogon/worktrees/akrogon/check-env-fidelity-u1` (detached at the leaf HEAD, which already holds the planned red-first tests).

## 1. Goal

Plan decisions D1 and D3: `runUnitArgv` in `src/scope.ts` passes `--expand-environment=no` so `systemd-run --scope` no longer rewrites `${…}`, `$NAME` and `$$` in the checked command's arguments. The planned real-systemd test goes green.

## 2. Acceptance criteria

1. `runUnitArgv(slice, run, argv, cutBus)`'s returned array contains the literal element `'--expand-environment=no'` before the `--` separator. Signature and other elements unchanged.
2. Planned test green: `tests/run-units.test.ts` test 'a run-check passes $-arguments byte for byte through the real run unit and a nested run-check'.
3. The fake seam `tests/fake-systemd-run.sh` needs no change: it skips every flag before `--`.

## 3. Read-first

- `src/scope.ts` — `runUnitArgv` (the only function you touch).
- `tests/run-units.test.ts` — the planned test (~line 497) and `spawnReal`/`realFixture` it uses.
- `tests/fake-systemd-run.sh` — confirms flag tolerance.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owns: `src/scope.ts`. One edit: insert `'--expand-environment=no',` into `runUnitArgv`'s array before `'--'` (placement beside the other flags, e.g. after `'--quiet'`). No prerequisite units; disjoint from u2 (`src/run-check.ts`) and u3 (`docs/guide/`).

## 5. Do-not, reasons and exceptions

- Do not touch `startRunGuard`'s systemd-run call: it passes no caller argv, the defect cannot exist there. No exception.
- Do not edit any test file or add tests: tests are locked; a red planned test after your correct edit returns a mismatch. Exception: none.
- Do not change the function signature, consumers, or add options: scope is the one flag. Exception: a revised brief from A.
- Return a mismatch with evidence instead of widening scope or interfaces; the only exception is a revised brief from A authorizing the change.

Restated: every exclusion above holds because the locked design fixes the flag and nothing else; the sole escape is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in your worktree.
2. Edit `src/scope.ts` per section 4 (criterion 1).
3. Run the command in section 7; expect the planned test green (criterion 2).
4. Commit `src/scope.ts` alone with a `fix(scope): …`-style message, return the commit id and report.

Advisory size: 1 file, under 6 turns.

## 7. Commands

```
akrogon run-check --name argv-literal -- bun test --timeout=45000 tests/run-units.test.ts -t 'byte for byte'
```

Run it in your worktree. Keep output only through this `akrogon run-check` invocation and cite the `check <label>: <exit> <path>` line it prints to stderr; `akrogon log <path>` reads the cited log back.

## 8. Done-when, evidence and report

Done when the flag is in place, the planned test is green, and `src/scope.ts` is committed on the detached HEAD. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
