# Brief 3 — U3: `--backend=copyfile` in test fixture installs

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/copyfile-installs-u3`

## 1. Goal

The three Bun seed-install calls in tests pass `--backend=copyfile`, matching what every real install now uses. Plan decision D5, brief done-criterion 4.

## 2. Acceptance criteria

1. `tests/deploy-fixture.ts` (~line 42): `command([process.execPath, 'install'], seed)` gains `'--backend=copyfile'` as the last argv element.
2. `tests/install.test.ts` (~line 320): the `command([process.execPath, 'install'], seed)` call inside `selfUpdateFixture` gains `'--backend=copyfile'` last.
3. `tests/self-update.test.ts` (~line 54): the `command([process.execPath, 'install'], seed)` call gains `'--backend=copyfile'` last.
4. No `'--frozen-lockfile'` added anywhere — the brief forbids it in fixture installs.
5. Only these three `command()` calls change. `cli(f, ['install'])` calls and `spawnCaptured([process.execPath, ..., 'src/akrogon.ts', 'install'])` (e.g. `tests/rollback.test.ts`) run the akrogon CLI verb and stay untouched.
6. `bun test tests/install.test.ts tests/self-update.test.ts --timeout=30000` passes in the worktree.

## 3. Read-first

- The three files at the named lines.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Owns: `tests/deploy-fixture.ts`, `tests/install.test.ts`, `tests/self-update.test.ts`.
- One argv element per call site. No signature or helper changes. `command(argv, cwd)` in `src/shell.ts` is unchanged.
- No prerequisite units; consumes no worker output. Shares no live test resource (each test builds its own fixture).

## 5. Do-not, reasons and exceptions

- Do not touch `tests/release-deploy.test.ts` or `src/release.ts`: sibling unit U1 owns them.
- Do not add `--frozen-lockfile` to any fixture install: brief criterion 4 forbids it.
- Do not change any assertion, expectation or test name: these are argv-input edits to fixture setup, not test-contract changes.
- Do not run `akrogon verify` or the full suite: those are A's commands.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile --backend=copyfile` in the worktree.
2. Apply the three edits.
3. `grep -n "execPath, 'install'" tests/deploy-fixture.ts tests/install.test.ts tests/self-update.test.ts` — each hit ends with `'--backend=copyfile'` and no `'--frozen-lockfile'` appears.
4. Run the section-7 command; expect green.
5. Commit the three files in one commit ending with one `Test-Change:` trailer per changed file in the final trailer block, e.g. `Test-Change: tests/deploy-fixture.ts brief criterion 4: the seed install passes --backend=copyfile; no assertion changed` (same shape for the other two files).
6. Fill in section 8's report lines below and return with the commit ID.

Advisory size: 3 files, under 15 turns.

## 7. Commands

- `bun test tests/install.test.ts tests/self-update.test.ts --timeout=30000`

## 8. Done-when, evidence and report

The two test files pass on the committed work; `git status --porcelain` in the worktree is clean.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
