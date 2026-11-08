# Brief 2: fake herdr, old shell exports, src and tests wording (U2)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/herdr-sweep-u2` (detached at the leaf head after wave 1: U1 removed every herdr call from install and deploy and deleted the Tasks mod; U3 rewrote docs, skills, AREA files and lessons). Leaf plan: `/home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/plan.md` (D4-D8 and `## Implementation notes`).

## 1. Goal

No old-herdr machinery is left in `src/` or `tests/`: the fake herdr and its fixtures are gone, the dead herdr code in `src/shell.ts` is gone, and no `src/` or `tests/` text describes old herdr as current. Decisions D4, D5, D6, D8.

## 2. Acceptance criteria

1. `tests/fake-herdr.ts` is deleted. `tests/isolation.ts` no longer builds the fake herdr bundle or exports `fakeHerdrBin` (lines 70-84).
2. `tests/helpers.ts`: `fakeHerdr` / `HerdrFixture` become `procFixture(f: Fixture): ProcFixture` with `export type ProcFixture = { env: NodeJS.ProcessEnv }`. It still creates `<home>/bin` (empty, on PATH first, because tests drop their own stubs there, e.g. `next.test.ts` writes `bin/flock`), `procRoot(f)` and `<home>/run`, and returns `PATH: <home>/bin:<PATH>`, `AKROGON_PROC_ROOT`, `XDG_RUNTIME_DIR`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`. No `herdr` link, no `herdr.json`, no `FAKE_HERDR`, no `db`. Keep `herdrStub` / `herdrCalls` (planned C1 test helpers).
3. Every caller is updated: `fakeHerdr(f)` → `procFixture(f)`, `HerdrFixture` → `ProcFixture`, local variables named `herdr` holding it → `proc` (and `herdr.env` → `proc.env`). `tests/merge-attempts.test.ts` `batchFixture`'s `herdr` parameter and `hcHerdr` follow the same rename (`hcHerdr` → `hcProc`, returning `{ env: f.env }`). `tests/deploy-fixture.ts` uses `procFixture`. `tests/park.test.ts`'s own `fakeHerdr` is removed and its `cli` calls pass no herdr env.
4. `tests/hc-fixture.ts:204-221`: the notices-only fake herdr is removed (notices run on hc since notices-on-hc). PATH becomes `${hcBin}:${resolve(f.home, 'bin')}:${process.env.PATH}` with `<home>/bin` created if absent (same reason as criterion 2); `FAKE_HERDR` is removed. If anything still needed what `fakeHerdr(f)` created there (proc root, run dir), create it directly.
5. Assertions that read the fake herdr's call log or database are deleted (they are vacuous: `src/` has no herdr call after U1 and this unit): `phase.test.ts` `herdrCalls` helper and its three uses; `status.test.ts` three `herdr.json.calls` absence checks; `status-json.test.ts:614`; `next.test.ts` `herdrDb` helper and its reads near 1913/1930; `session-routing.test.ts` `herdrCalls`, `herdrOther`, the `HERDR_SOCKET_PATH: herdrOther(f)` / `stale` env entries and their `herdrCalls(f, 'other')` assertions in the two hc cases at ~387 and ~439 (the hc decoy-core parts of those cases stay); any other such read the grep finds. Old fake-herdr-only helpers and types left unused (e.g. `session-routing.test.ts` `PaneSeed`, `TabSeed`, `SessionSeed`, `saveDatabase`, the `./fake-herdr` type import) are deleted. A whole case is deleted only if nothing but the removed behavior is left in it; list each deleted case.
6. `src/shell.ts`: delete `paneSchema`, `tabSchema`, `workspaceSchema`, `Workspace`, `sessionSchema`, `Session`, `SessionResolution`, `herdrError`, `retryable`, `herdrArgv`, `herdr`, `repoSession` and every private helper below them (`herdrErrorSchema`, `retryableCodes`, session-list caches, `describeError`, `fetchSessionList`, `sessionList`, `refusalReason`, `refuse`, `resolveSession`, ...). Keep `DISCOVERY_DEADLINE_MS` (used by `src/hc.ts:112`) with its comment reworded for hc discovery reads. Remove imports left unused (`z`, `Repo`, fs names). `bun run typecheck` stays green.
7. `tests/shell.test.ts`: delete the cases that test the removed functions: `Herdr response retains native cause for ...` (~93-128, uses `fake-herdr.ts`), `herdrError decodes structured stderr`, `herdrError maps unstructured stderr to exit code`, `herdrError truncates long stderr to 500 chars`, `retryable is false on non-JSON stderr without throwing`, `paneSchema requires kind when agent_session present`, and their imports. Keep every other case.
8. `src/verify.ts:643` drops `'FAKE_HERDR'` from its env list. `src/reconcile.ts`: every `'restore the Herdr pane inventory and retry cleanup'` becomes `'restore hc terminal reads and retry cleanup'`, and each test asserting the old text (`leaf-slices`, `status`, `release-any-phase`, `store-sweep-safety`) asserts the new text.
9. `tests/e2e/watch-tier.ts:106-107`: remove the `/usr/bin/false` `herdr` link and its comment (no akrogon code calls herdr).
10. Wording: this grep, run in the worktree, leaves no hit in `src/` or `tests/` that describes old herdr as current:
    `git grep -n -i -I herdr -- src tests ':!*AREA.md' | grep -viE 'herdr-app|herdr-core|herdr-setup|HERDR_APP_HOME|herdr\.d\.ts|from .herdr.|herdr skill|/herdr\b'`
    Rewrite comments and test names that do. Allowed after reading, leave as is: `herdr.tab` / `herdr.space` label keys; `herdrapp` (herdr-setup's CLI) in `tests/e2e`; `herdrStub` / `herdrCalls` and the planned C1 tests in `tests/install.test.ts`, `tests/deploy-shapes.test.ts`; `src/rollback.ts:29` guard text; text describing pre-hc state as history (`src/state.ts` `predatesHc` and its comments, `src/verify.ts:230`, `src/reconcile.ts:211`); test fixtures that seed pre-hc state on purpose (`tests/state.test.ts`, `tests/state-inventory.test.ts`, `tests/fixtures/status-envelope.json`) unless the hit claims old herdr is current. Give the report one line per remaining hit class.
11. `bun run typecheck`, `bunx prettier --check src tests skills/chart-issues/scripts`, and every test file you touched pass.

## 3. Read first

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- `tests/helpers.ts:120-180`, `tests/isolation.ts:55-90`, `tests/hc-fixture.ts:170-240`, `tests/merge-attempts.test.ts:76-140`, `tests/session-routing.test.ts:1-160` and `:385-485`.
- `src/shell.ts` (whole), `src/hc.ts:100-115`.
- `tests/AREA.md` (already updated by U3 for this end state).

## 4. Change list and interfaces

Owned paths: `src/shell.ts`, `src/verify.ts`, `src/reconcile.ts`, any other `src/*.ts` comment hit (not `src/install.ts`, `src/self-update.ts`, `src/rollback.ts`), `tests/fake-herdr.ts` (delete), `tests/isolation.ts`, `tests/helpers.ts`, `tests/hc-fixture.ts`, `tests/deploy-fixture.ts`, `tests/shell.test.ts`, `tests/e2e/*`, and every `tests/*.ts` the criteria and grep reach, except `tests/install.test.ts` and `tests/deploy-shapes.test.ts` (planned tests; read only). Prerequisites: U1 and U3 landed (your worktree has them). Shared test resource: none (the suite runs its own throwaway hc cores).

To find every caller: `git grep -n -E "fakeHerdr|HerdrFixture|herdr\.json|FAKE_HERDR|fake-herdr\b|fake-herdr'|fakeHerdrBin|pane inventory" -- src tests`.

## 5. Do-not, reasons and exceptions

- Do not add test cases, and do not change an expectation except as criteria 5, 7 and 8 state. The leaf brief requires deleting the fake herdr, herdr fixtures and tests of removed behavior; that, the rename it forces, and the remedy text change are the only test edits.
- Do not edit `tests/install.test.ts` or `tests/deploy-shapes.test.ts`; if one goes red, return a mismatch with the output.
- Do not touch `src/install.ts`, `src/self-update.ts`, `src/rollback.ts`, docs, skills, AREA files or `learnings/`: other units own them and the rollback guard is locked.
- Do not change `herdr.tab` / `herdr.space` labels or `herdrapp` calls: they are current herdr-app and herdr-setup names.
- Do not run `bun run format`; run `bunx prettier --write` only on files you changed.
- Do not run the whole suite or `akrogon verify`; A does.
- Any scope or interface change: return a mismatch with evidence; the exception is a revised brief from A.

Reasons restated: no new tests at implement; planned tests are A's contract; other units' files and the locked guard; current names stay; format drift; A owns the full proof. Exception: a revised brief from A.

## 6. Ordered steps

1. Install deps: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
2. `src/shell.ts` and `tests/shell.test.ts` (criteria 6, 7); typecheck.
3. `tests/helpers.ts`, `tests/isolation.ts`, delete `tests/fake-herdr.ts`, `tests/hc-fixture.ts`, `tests/deploy-fixture.ts` (criteria 1, 2, 4).
4. Callers (criterion 3), call-log assertions (criterion 5); typecheck after each batch.
5. `src/verify.ts`, `src/reconcile.ts` and their tests (criterion 8); `tests/e2e/watch-tier.ts` (criterion 9).
6. Wording grep (criterion 10).
7. Run section 7; repair within scope; commit once.

Advisory size: about 35 files, mostly mechanical, under 150 turns.

## 7. Commands

- `akrogon run-check --name u2-typecheck -- bun run typecheck`
- `akrogon run-check --name u2-format -- bunx prettier --check src tests skills/chart-issues/scripts`
- `akrogon run-check --name u2-tests -- bun test --timeout=30000 --parallel=4 --no-isolate <every test file you changed, space separated>`
- `akrogon run-check --name u2-grep -- sh -c "git grep -n -i -I herdr -- src tests ':!*AREA.md' | grep -viE 'herdr-app|herdr-core|herdr-setup|HERDR_APP_HOME|herdr\.d\.ts|from .herdr.|herdr skill|/herdr\b'; true"`

If a touched test fails and the same test also fails on the leaf head without your change (check in a scratch copy only if needed), report it as such instead of chasing it.

## 8. Done-when, evidence and report

Done when criteria 1-11 hold, each command cited by its `check <label>: <exit> <path>` line, and the report lists: every deleted test case (file, name, reason), every deleted assertion group (file, reason), and one reading per remaining grep hit class.

Commit message: `test: remove the fake herdr and the dead herdr shell code` with a body naming D4-D8, and a final trailer block with one `Test-Change:` line per changed or deleted old test file (every changed path under `tests/`), each citing the leaf brief's item `tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason` and the file's own reason, e.g.:

```
Test-Change: tests/fake-herdr.ts deleted: brief "tests: tests/fake-herdr.ts ..."; src makes no herdr call
Test-Change: tests/phase.test.ts brief "tests: ... tests of removed behavior": fake herdr call-log assertions deleted (vacuous, src makes no herdr call); fakeHerdr renamed procFixture
Test-Change: tests/status.test.ts plan D8: remedy text 'restore hc terminal reads and retry cleanup' replaces the Herdr pane inventory text; herdr.json.calls absence checks deleted (vacuous)
```

Do not add a co-author line.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
