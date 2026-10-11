# Brief 2: `akrogon base-run` verb

## 1. Goal

Plan D1-D4, D6, D7: the `base-run` verb end to end. Consumes `constructedEnv`, `spawnLogged` (run-check.ts) and `emitEnvFile` (next.ts) from brief 1's commit.

## 2. Acceptance criteria

`tests/base-run.test.ts` passes in full. Concretely:

1. `akrogon base-run --base <sha> [--attempt <id>] [--cwd <rel>] -- <argv>...` appends a record line to `<root>/issues/base-runs.jsonl` before `git worktree add`, fields `run` (id), `repo`, `leaf`, `slot`, `attempt?`, `base`, `command` (argv array), `cwd`, `path`, `env_generation`, `pid`, `boot_id`, `start`; creates a detached sparse checkout at `<worktreeStore>/base-<id>` via `createSparseWorktree`; writes its `.env` from `emitEnvFile(repo, target, leaf.state.env_names)`; runs `sh -c <script> akrogon-base-run <argv>...` under the constructed env with `AKROGON_BASE=<sha>` and a fresh run root under `leafTemp(repo, slug)` holding a `.owner` file (`{pid, boot_id, started}`), where script is `akrogon guard ancestors && flock "<git rev-parse --git-path akrogon-install.lock inside the base checkout>" sh -c '<quoted setup>' && akrogon guard own-modules && exec "$@"` (the flock+setup segment only when `repo.config.setup` is set); writes all child output to `<leaf.path>/implementation/base-<id>.log`; prints `log: <path>` then `status: <code>`; removes the checkout in `finally`; rewrites the record file under the lock below adding `end`, `exit`, `removed`; exit code equals the command's.
2. Caller identity without `--attempt`: `realpathSync(git rev-parse --show-toplevel)` must equal some leaf's `state.worktree` (see `leafTarget` in run-check.ts); otherwise refuse. `cwd` record field is `git rev-parse --show-prefix` with trailing slash trimmed (`''` at toplevel). With `--attempt`: the leaf is the `allLeaves(repo)` entry whose `state.batch?.attempt === <id>` and `phase === 'merge'`; absent -> refuse; `cwd` comes from `--cwd`, default `''`. Either mode, when cwd is inside the resolved leaf's worktree, `show-prefix` wins over `--cwd`.
3. Slot: `HERDR_PANE_ID` (when non-empty) matched against `leaf.state.pane` entries first; else the sole `requiredSlots(phase, fix_rounds)` entry not in `state.done`; else refuse.
4. `checkLocation(<store>/base-<id>)` runs before the record append — a refused run writes no record and no directory.
5. All record file writes (append and the end/exit/removed rewrite) hold `flock` on `resolve(repo.root, await command(['git','rev-parse','--git-path','akrogon-base-runs.lock'], repo.root))` via `withLock` — never flock the JSONL itself, the rewrite unlinks it.
6. Export `baseRunSchema` (strictObject, fields above; `end`/`exit`/`removed` optional) and `readBaseRuns(repo): z.infer<typeof baseRunSchema>[]` from `src/base-run.ts`.
7. `src/akrogon.ts`: add parse options for verb `base-run` (`base`, `attempt`, `cwd`, all string) and `case 'base-run'` setting `process.exitCode` to the returned code; `base` required, argv required after `--`; usage error otherwise.

## 3. Read-first

- `src/base-run.ts` — you create it.
- `src/run-check.ts`, `src/next.ts` — the helpers after brief 1 lands (check `git log` in your worktree; if the extraction commit is absent return a mismatch).
- `src/guard.ts`, `src/config.ts` (`worktreeStore`, `leafTemp`), `src/state.ts` (`allLeaves`, `withLock`), `src/routing.ts` (`requiredSlots`), `src/attempts.ts` (record convention), `tests/base-run.test.ts` (the contract), `tests/helpers.ts`.
- `skills/implement-issue/ponytail.md`.

## 4. Change list

Owns: `src/base-run.ts` (new), `src/akrogon.ts` (options + case). Consumes brief 1's exports; must land after it (wave 2). No shared test resource.

## 5. Do-not

- Do not write or edit any test file — including `tests/command-reference.test.ts`; the README row and its `contracts` entry belong to brief 4.
- Do not echo child output to stdout; the log file is the artifact.
- Do not flock the JSONL record file (rename breaks the inode).
- Do not create the checkout before the record append, and do not append the record before `checkLocation` passes.
- A planned test that is wrong or stays red once the code is correct is a mismatch returned to A, never edited.
- Return a mismatch with evidence instead of changing an interface; the exception is a revised brief from A.
Restated: no test edits, two stdout lines only, lock file beside git metadata not under `issues/`, ordering is checkLocation -> record -> worktree -> env -> run -> remove -> record-update; deviations come back as a mismatch.

## 6. Ordered steps

1. `git log --oneline -3` — confirm brief 1's commit is your HEAD; mismatch if not.
2. Read run-check/next exports, state.ts, routing.ts.
3. Write `src/base-run.ts` (criteria 1-6).
4. Edit `src/akrogon.ts` (criterion 7).
5. `bun run typecheck`, then section 7.

Advisory size: 2 files (~250 new lines), under 20 turns.

## 7. Commands

```sh
bun test tests/base-run.test.ts --timeout=30000
bun test --changed=01ca1fbe8654b11b3cec04e56d6ec498dae87196 --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

`tests/base-run.test.ts` fully green including the SIGKILL record test; typecheck clean; commit(s) on the detached HEAD. Report commit id(s).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
