# Plan: base-run

New verb `akrogon base-run --base <sha> [--attempt <id>] [--cwd <rel>] -- <argv>...` owns the base checkout end to end. Brief and design agree; `debate: no`, so this synthesis reads the locked design plus live code.

## Decisions

- **D1** New module `src/base-run.ts`; `src/akrogon.ts` gains `case 'base-run'` and parse options `{ base, attempt, cwd }`. Verb added to the README row and `tests/command-reference.test.ts` `contracts` entry: `'base-run': '--base <sha> [--attempt <id>] [--cwd <rel>] -- <argv>...'`.
- **D2** Order per run: resolve caller -> `checkLocation(<store>/base-<id>)` -> append record line -> `createSparseWorktree(repo, target, base, {detach:true})` -> write `.env` -> spawn composed command -> `finally` remove + update record. `checkLocation` runs before the record append so a refused run creates nothing (done-criterion 5's "nothing created"), and the record precedes `git worktree add` (criterion 2). `createSparseWorktree` re-checks the location internally; that is harmless and already covers the worktree-add step.
- **D3** Record file `<root>/issues/base-runs.jsonl` (sibling of `merge-attempts.jsonl`), schema `baseRunSchema` in `src/base-run.ts`: `run` (id), `repo`, `leaf`, `slot`, `attempt?`, `base`, `command` (argv array), `cwd` (relative, may be `''`), `path`, `env_generation`, `pid`, `boot_id`, `start`, `end?`, `exit?`, `removed?`. The append writes `run..start` only; the finally step rewrites the file under a stable lock with `end`, `exit`, `removed` added. Lock file is `git rev-parse --git-path akrogon-base-runs.lock` in the registered root — never under `issues/` (the lock inode must not be unlinked, so the JSONL itself cannot be the lock). Export `readBaseRuns(repo)` for worktree-reconciler. Nothing else is atomic with the run; do not claim more.
- **D4** Caller identity. Leaf mode (no `--attempt`): `realpathSync(git rev-parse --show-toplevel)` matched against `allLeaves(repo)` `state.worktree`, same as `leafTarget`; outside a leaf worktree -> refuse. Slot: `HERDR_PANE_ID` matched against `leaf.state.pane` first, else the sole `requiredSlots(phase, fix_rounds)` entry not in `done`, else refuse. Relative cwd: `git rev-parse --show-prefix` (trailing slash trimmed; `''` allowed). Attempt mode (`--attempt`): the holder leaf is the `allLeaves` entry whose `state.batch?.attempt === attempt` and `phase === 'merge'`; absent -> refuse. `slot` resolves from the holder's state the same way; `cwd` comes from `--cwd` (default `''`).
- **D5** `.env` transfer: split `writeLeafEnv` in `src/next.ts` — keep its tracked/ignored/live checks, extract the emission tail (parse root `.env`, per-name emit candidates, round-trip verify, temp-in-git-dir + rename, mode 0600) into an exported helper used by base-run with `leaf.state.env_names` (the leaf's declared names at its current generation), never `config.env` directly. `env_generation` in the record is `leaf.state.env_generation`. The base checkout's root `.gitignore` already covers `.env` on any repo that uses this.
- **D6** Execution: extract from `src/run-check.ts` the constructed env (`HOME`, `PATH`, `XDG_CACHE_HOME`, `NODE_DISABLE_COMPILE_CACHE`, `TMPDIR=<fresh run root>`, `repo.config.env` passthrough) and the spawn-and-collect step into exported helpers shared with `runCheck` (`constructedEnv(repo, runRoot)`, `spawnLogged(argv, cwd, env, log)` returning the exit code). base-run composes `sh -c <script> akrogon-base-run <argv>...` where the script is `akrogon guard ancestors && { flock "<git-path akrogon-install.lock>" sh -c <setup> && } akrogon guard own-modules && exec "$@"` — the `flock setup` segment only when `repo.config.setup` is set, mirroring `withSetup`'s order. The base checkout gets its own fresh run root under `leafTemp(repo, slug)` with a `.owner` file, same as run-check; `AKROGON_BASE` is the supplied sha verbatim.
- **D7** Log at `<leaf.path>/implementation/base-<id>.log`; in attempt mode `<holderLeaf.path>/implementation/base-<id>.log`. The log gets all child stdout+stderr. Stdout of the verb is exactly `log: <path>` then `status: <code>`; `process.exitCode` equals the command's code. The seat reads the log itself — it is not echoed to stdout (the design's stdout contract is the two lines).
- **D8** Skill text: replace the hand-made base checkout mechanics inside the three named paragraphs — `skills/check-issue/SKILL.md` check.review paragraph (the `mktemp`/`git worktree add --detach`/`worktree remove` clause, ~:65), `skills/implement-issue/SKILL.md` Shared-context paragraph (~:38), `skills/merge-issue/SKILL.md` Shared endings sentence (~:69) — with one `akrogon base-run --base "$AKROGON_BASE" -- <command> <args>` instruction (merge's form carries `--attempt <id>`); judgment text unchanged. `skills/implement-issue/worker-protocol.md` worker worktrees are not base checkouts and are untouched.
- **D9** Docs: README command table row, `src/AREA.md` Commands line + Non-obvious note, `tests/AREA.md` Key files line. `docs/guide/*` state behavior, not mechanics, so no edit there.

## Open limitation

A caller in a two-slot phase (`plan.positions`, `plan.rebuttal`, first-round `check.review`) without `HERDR_PANE_ID` cannot resolve its slot and is refused; seats run under herdr panes, so this only limits manual invocations. A kill between `.env` write and spawn leaves the record without `end`; worktree-reconciler sweeps by that signal — intended, not hidden.

## Read-first

- `src/run-check.ts` — constructed env, run root, `leafTarget` leaf-by-worktree match.
- `src/next.ts` — `createSparseWorktree`, `writeLeafEnv` emission, `ensureWorktree` generation accounting.
- `src/guard.ts` — `checkLocation`, `guard` verbs.
- `src/config.ts` — `worktreeStore`, `leafTemp`, `withSetup` order, `requireRepo`.
- `src/state.ts` — `allLeaves`, `batchSchema`, `withLock`.
- `src/attempts.ts` — record-file convention.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `storeDir`, `fakeAkrogon`.
- `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md` — the three rewritten paragraphs.

## Interfaces

- `akrogon base-run --base <sha> [--attempt <id>] [--cwd <rel>] -- <argv>...`; stdout `log: <abs path>` + `status: <n>`; exit = command's code.
- `baseRunSchema`, `readBaseRuns(repo): BaseRunRecord[]` from `src/base-run.ts` (consumed by worktree-reconciler).
- `constructedEnv`, `spawnLogged` exported from `src/run-check.ts`; emission helper exported from `src/next.ts`.

## Waves

- **W1 — U1** `src/run-check.ts`, `src/next.ts`: extract `constructedEnv`/`spawnLogged` and the `.env` emission helper; `runCheck`/`writeLeafEnv` behavior unchanged (pure refactor).
- **W2 — U2** `src/base-run.ts`, `src/akrogon.ts`: verb, record schema/reader, D4 resolution, D5/D6 wiring, D7 output. Prerequisite: U1.
- **W3 — U3** `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md`: the three one-line rewrites (D8). Prerequisite: U2 (the verb it names).
- **W3 — U4** `README.md`, `src/AREA.md`, `tests/AREA.md`: docs (D9). Disjoint paths from U3, same wave.

Docs affected: `README.md` (command table), `src/AREA.md`, `tests/AREA.md`, the three `skills/*/SKILL.md` files. No `docs/guide` page names the hand-made mechanics.

## Done-criteria -> proof

All in `tests/base-run.test.ts` (new file) run by `bun test tests/base-run.test.ts` except C7. The fixture repo carries `setup: 'mkdir -p node_modules'` where the command must reach `own-modules` green; other tests leave setup unset where a refusal is the point. Commands run via `cli()` so `AKROGON_HOME`/`AKROGON_LEAF_TEMP_ROOT` are the fixture's.

1. Log, status, removal, full record on success and failure — `bun test tests/base-run.test.ts` tests "happy path" (command writes marker + exits 0) and "nonzero exit" (exits 7): asserts `status:` line, log contains output, store path gone, record has `end`/`exit`/`removed`. Catches missing cleanup and missing record fields. Size: seconds. Rerun: any change to base-run.ts.
2. Record before checkout — test "killed during setup": `cli` with `timeout` (SIGKILL) while setup sleeps; record exists with `start` and no `end`/`removed`. Catches append-after-add ordering. Size: seconds.
3. Detached at sha, no `issues/`, `AKROGON_BASE` — happy-path command asserts `git rev-parse HEAD` == base sha, `! test -e issues`, `printf $AKROGON_BASE` == sha, all into the log. Catches wrong ref/env. Size: seconds.
4. No reuse — two runs of the same command+base; records' `path`/`run` differ, both dirs gone. Size: seconds.
5. Location refusal — command invoked after `mkdir <f.home>/.akrogon/worktrees/package.json` so the store dir's ancestor check fires... precise trigger: write `<store>/../package.json` is the repo-store parent's parent; actual setup: `writeFileSync(resolve(f.home, '.akrogon/package.json'))` puts `package.json` at a canonical ancestor of `<store>/base-<id>`; assert refusal names `.akrogon`, exit != 0, no `base-*` dir, no record line. Second half (missing `node_modules` post-setup): run with setup unset in a base checkout lacking `node_modules`; assert log names `missing own node_modules`. Size: seconds.
6. `--attempt` — leaf in `merge` phase with `state.batch.attempt`; run from `f.root` with `--attempt`; asserts log under `<leaf>/implementation/base-<id>.log`, record `attempt` == id, `slot` == 'B'. Catches wrong holder/folder resolution. Size: seconds.
7. No hand-made base instructions in skills — test reads the three SKILL.md files, asserts each names `akrogon base-run` and none contains `mktemp -d` + `git worktree add --detach` as the base-checkout allocation pattern. Catches missed call sites. Size: seconds.
8. `.env` generation + caller fields + relative cwd — fixture leaf with `env_names: ['MY_KEY']`, `env_generation: 2`, root `.env` holding `MY_KEY` plus an undeclared name; command cats `.env` and `$PWD` into the log; record asserts `env_generation: 2`, `leaf`/`slot`, `cwd` == subdir used for the call. Catches generation drift and cwd bugs. Size: seconds.

Each new test is shown red before `src/base-run.ts` exists (verb unknown -> usage error); failing output recorded beside the criterion below at commit time.

Checks: `bun run format`, `bun test --timeout=30000`, `bun run typecheck`, `bun test --changed=$AKROGON_BASE` via the configured `checks` commands.

## Red evidence

`bun test tests/base-run.test.ts` on commit `aca5d26` (tests only, no `src/base-run.ts`): all 9 tests fail, root cause `TypeError: Unknown option '--base'` in `src/akrogon.ts` parseArgs, and the skill-text test fails on `expect(text).toContain('akrogon base-run --base')` for all three SKILL.md files. `bun test --timeout=30000`: 744 pass, the only fails are these 9; `bun run typecheck` clean; `bun run format` reformats only pre-existing drift (`src/status.ts`, `skills/chart-issues/scripts/peer-wait.ts`, reverted) and this file's own layout.

- C1 happy path + nonzero exit: both fail at `Unknown option '--base'`.
- C2 killed during setup: fails — `rejects.toThrow` resolved instantly (verb refused before spawning), record file absent.
- C3 detached sha / no issues/ / AKROGON_BASE: same `--base` refusal inside the happy-path test.
- C4 two fresh checkouts: same refusal.
- C5 location refusal: fails on the stderr assertion (parse error text, not the named ancestor); own-modules refusal fails likewise.
- C6 `--attempt` merge log: `Unknown option '--attempt'`.
- C7 skill text: `toContain('akrogon base-run --base')` fails on all three files.
- C8 `.env` generation/cwd record: same `--base` refusal.
