# Brief 1: rewrite `.env` dispatch tests for real-file writes

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/leaf-env-file-u1`
Lane base: `309d742605a0516067840863ffdf3be29b03fc0c` (`AKROGON_BASE`)

## 1. Goal

Update `tests/next.test.ts` so the `.env` dispatch block expects the NEW behavior (plan D1–D8): dispatch writes a real `.env` file, mode 0600, containing only names declared in repo config `env:` with values copied from the registered checkout's `.env`; rewritten on each dispatch without a live tab; skipped while a tab is live. A later unit implements the behavior — your tests land RED and that is intended.

## 2. Acceptance criteria

- T1 Regular file with declared subset: with `env: ['SYNTHETIC_ONE', 'SYNTHETIC_TWO']` and root `.env` containing those plus `SYNTHETIC_THREE`, dispatched worktree `.env` `lstatSync().isFile()` (not symlink), mode `0o600` (`statSync(path).mode & 0o777`), content is exactly `SYNTHETIC_ONE="1"\nSYNTHETIC_TWO="two words"\n` style lines for declared names only (values emitted `KEY=` + `JSON.stringify(value)` in `env:` order); `SYNTHETIC_THREE` absent.
- T2 Live tab freezes file: after dispatch with `env: ['SYNTHETIC_ONE']`, append to root `.env` (`appendFileSync`) and dispatch `next` again while the tab is still in the fake herdr db; leaf `.env` content and `env_generation` unchanged. Then remove the leaf's tab and its panes from `saveDatabase` (simulate dead tab), dispatch again: `.env` contains the appended value, `env_generation` incremented (0→1).
- T3 Missing declared name refuses: `env: ['SYNTHETIC_ONE','MISSING_NAME']`, dispatch fails (nonzero code, no prompt), error contains `missing declared names` and `MISSING_NAME`; assert the sentinel root `.env` VALUE string does NOT appear in `result.stdout`, `result.stderr`, or `readFileSync` of the leaf `state.yaml`; leaf `.env` was not written.
- T4 Refusals unchanged: the existing loop `next refuses an .env link over ${kind}` keeps `tracked file` and `unignored` cases unchanged (same assertions). Replace `real file` and `stale link` cases with a test asserting dispatch SUCCEEDS and the path is replaced by a regular file (isFile, mode 0600, declared-subset content), since `rename` overwrites them.
- T5 Empty declared list: `env:` unset (default `[]`), with or without a root `.env`: leaf `.env` is a regular file, mode 0600, empty (`readFileSync` === `''`). Update the old `without a registered .env … dangling link` test to assert a real empty file instead.
- T6 Update the two neighboring tests that assert symlinks: `dispatch recreates a deleted .env link in a reused worktree` becomes recreation of the real file; `a pre-linked worktree keeps its .env link unchanged across dispatch` becomes replacement of a pre-existing symlink by a real file. Also update `merged leaf cleanup removes the worktree and leaves the registered .env untouched` (:4410 area) `isSymbolicLink` assertion to `isFile`.
- T7 State record: after a successful dispatch assert `readState(path).env_names` equals the declared list and `env_generation` is `0`; after the dead-tab redispatch in T2 assert `env_generation` is `1` and `env_names` still the declared list.

## 3. Read-first list

- `tests/next.test.ts` `.env` block (:4279–4420), helpers at top (:39–80): `dispatchFixture`, `database`, `saveDatabase`, `next`, `skips`, `undispatched`.
- `tests/helpers.ts` — `fixture()` commits `.gitignore` with `.env` (:22) and writes `issues/config.yaml` (:30); `yaml()`, `leaf()`.
- `tests/fake-herdr.ts` — `Database` type: remove a tab by filtering `db.tabs`; panes carry `tab_id`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Plan: `/home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/leaf-env-file/plan.md` (D1–D8, Notes on file format `KEY=` + JSON.stringify value, `env:` order, trailing newline only after last line).

## 4. Change list and needed interfaces

- `tests/next.test.ts`: rewrite the `.env` block and update the symlink assertions in `merged leaf cleanup`. To set `env:` per test: `yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none', env: ['SYNTHETIC_ONE', 'SYNTHETIC_TWO'] })` — overwrite the whole config file each time (it is read per command run).
- `tests/helpers.ts`: do NOT change `fixture()`'s default config (empty `env` covers T5 and all other tests); add a helper only if you truly need one — prefer writing `issues/config.yaml` inline per test.
- New `State` fields (U3 implements): `env_names: string[]` default `[]`, `env_generation: number` default `0`, both visible via `readState`.
- Owned paths: `tests/next.test.ts`, `tests/helpers.ts` (only if needed). Shared test resource: none. Must land first: none. Wave-mate edits `tests/batch-dispatch.test.ts` only.

## 5. Do-not, reasons and exceptions

- Do not edit `src/` — the implementation is another unit; your tests are expected red until it lands. Exception: none.
- Do not weaken or delete refusal assertions for tracked/not-ignored `.env` — criterion 4 keeps them. Exception: message wording may update from `.env link` to `.env` per the implementation's new messages (assert `Refusing .env` and the reason substring only, not the word `link`).
- Do not remove tests for real regressions; the old `real file`/`stale link` refusal expectations contradict locked design behavior (rewrite replaces whatever is at `.env`) — cited source: plan D5/brief criterion 1. Reason: design changed refusal to replacement.
- Return a mismatch with evidence instead of changing plan scope or interfaces; the exception is a revised brief authorizing it.
- Restated: keep refusals, keep tests red-until-U3, don't touch src, escalate conflicts via mismatch rather than scope drift.

## 6. Ordered steps

1. Read the `.env` block and helpers; run `bun test tests/next.test.ts --timeout=30000` once to confirm green baseline (~1 file).
2. Rewrite the block per T1–T7, updating `merged leaf cleanup` too. Keep test shape/style of neighbors (same `try/finally f.clean()`, 15000 timeouts, `skips(result)` for errors).
3. Run `bun test tests/next.test.ts --timeout=30000`; expect only the new `.env` assertions to fail (old code still symlinks). Every other test in the file must stay green — a non-`.env` failure is your bug to fix.
4. Commit on the worktree HEAD with message `test: cover dispatch-written leaf .env file` and trailer `Test-Change: tests/next.test.ts rewrote .env dispatch block for real-file writes per plan D1-D8` (plus a helpers line if helpers changed, same trailer format naming what was added and that no existing expectation changed).

Advisory size: about 1–2 files, under 40 turns.

## 7. Commands

```
AKROGON_BASE=309d742605a0516067840863ffdf3be29b03fc0c bun test --changed="$AKROGON_BASE" --timeout=30000
```

Run in your worktree. Expect it red on the new `.env` tests only; paste the full summary and the list of failing test names.

## 8. Done-when, evidence and report

Commit exists on your worktree HEAD; changed-test output pasted showing only `.env`-block failures; report filled below.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
