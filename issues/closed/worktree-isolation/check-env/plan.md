# Plan: check-env

Debate off (`debate: no`); synthesized directly from brief and design.

## Decisions

- D1. New verb `akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...` in `src/run-check.ts`, registered in `src/akrogon.ts`. It refuses, creates a fresh run root, spawns `<argv>` under a constructed env, tees output to a log, copies the log to the leaf folder, removes the run root in `finally`. Exit code is the child's.
- D2. Constructed env is an explicit allowlist, never `process.env` spread: `HOME`, `PATH`, `XDG_CACHE_HOME`, `NODE_DISABLE_COMPILE_CACHE` copied when set; `TMPDIR` = run root; `AKROGON_BASE` = `base(repo, cwd)` computed inside run-check; every name in the repo config `env:` list copied when set in the caller (absent name is simply not set — S1 later declares only what consumers need). Values never logged.
- D3. Refusals at run-check startup, before mkdtemp and before anything in the wrapped string runs: non-zero exit naming each set var of `NODE_PATH`, `BUN_OPTIONS`, `BUN_INSTALL_CACHE_DIR`, `FFMPEG_BIN`, `CHROME_PATH`, `CDP_BROWSER_BINARY`, and naming the file when a global bunfig exists (`~/.bunfig.toml` checked against the caller's `HOME`; also `$XDG_CONFIG_HOME/.bunfig.toml` if set — match bun's own lookup). Note: Bun auto-loads `.env` in cwd into `process.env` before the verb sees it, so a forbidden name in a leaf `.env` also trips the refusal; that is acceptable and names the var.
- D4. `withSetup(config)` in `src/config.ts` changes shape. Every `checks` name, `merge_checks` name and `advisory` entry becomes `akrogon run-check --name <key|advisory-N> -- sh -c <inner>` where `<inner>` is today's `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <setup> && sh -c <cmd>` with setup, or plain `sh -c <cmd>` with no setup. No-setup repos therefore get refusals and the constructed env too (DC6). `worktree-store` later splices its guards inside `<inner>` — leave the inner string identical to today so that leaf only edits the middle.
- D5. `leafTemp(repo, slug)` default root moves from `/tmp/akrogon-<uid>` to `~/.akrogon/scratch/<repo name>` (via `homedir()`); `AKROGON_LEAF_TEMP_ROOT` override and its absolute non-blank validation unchanged. `next.ts allocate`'s `ensurePrivateDir` gains `recursive: true` since `~/.akrogon/scratch` may not exist; the not-a-directory, symlink and foreign-uid validations stay. Run root inside it is `mkdtempSync(<scratch>/run-)` per run — concurrent runs get distinct roots (DC3).
- D6. Leaf resolution in run-check: `requireRepo(global, cwd)` always; `git rev-parse --show-toplevel` in cwd, realpath-match against `allLeaves(repo)` worktrees (same shape as `effectiveConfig`). Leaf path → log target `<leaf>/implementation/check-<name>-<id>.log` (`<id>` = `Date.now()` + pid, mkdir -p). `--leaf <path>` overrides the derivation. No leaf match (registered checkout run) → scratch `leafTemp(repo, 'checkout')` and `--holder <dir>` required, else startup refusal.
- D7. `.owner` file written at `<run root>/.owner` after mkdtemp, before spawn: `{pid, boot_id, started}` JSON (`boot_id` via `readPressure`'s source: `/proc/sys/kernel/random/boot_id`; absent → empty string). Consumers: worktree-reconciler, base-run (interface contract).
- D8. Tool records: `repoSchema` gains `tools: z.array(text).default([])` (PATH tool names; no field exists today so nothing to reuse). `batchSchema` (state.ts) gains `tools: {name, path, version}[]` optional; `attemptRecordSchema` (attempts.ts) gains the same, copied from `batch.tools` in `appendAttempt` — optional because old JSONL lines lack it. Resolution helper `resolveTools(repo)` in `attempts.ts`: `command(['which', name])` for path, `run([name, '--version'])` stdout first line for version; called once at batch creation in `next.ts mergeWake` (the dispatch point) and stored on the `Batch`. A tool absent from PATH fails the merge dispatch with the CommandError context.
- D9. Schema: `env: z.array(text).default([])` on `repoSchema`, superRefine rejecting `env:` entries that collide with the refusal list of D3 or `TMPDIR`/`AKROGON_BASE` (constructed names are not declarable).
- D10. Tests spawn real `sh` through a `bin/akrogon` shim: new `fakeAkrogon(f)` in `tests/helpers.ts` symlinked to `entry` beside `fakeHerdr`'s bin. CLI `cli()` env passes extra vars like `NODE_PATH` explicitly per test; `cli` already lets callers override `AKROGON_LEAF_TEMP_ROOT`.

## Read-first

- `src/config.ts` — repoSchema, `leafTemp` (:236), `withSetup` (:256), `effectiveConfig` leaf derivation (:268-292).
- `src/akrogon.ts` — verb dispatch, parseArgs option table, Usage line.
- `src/attempts.ts` — `attemptRecordSchema`, `appendAttempt`, `readPressure` boot_id source.
- `src/state.ts` — `batchSchema` (:42), `allLeaves`.
- `src/next.ts` — `allocate` scratch block (:368-416), `mergeWake` batch creation (:1050-1105), `removeLeafTemp` (:730).
- `src/shell.ts` — `run`, `command`, `quote` conventions.
- `tests/helpers.ts` — `fixture`, `cli`, `fakeHerdr`, `leaf` (add `fakeAkrogon` here).
- `tests/merge-attempts.test.ts` — attempt-record fixture to extend for tools.
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md` — doc surfaces.
- `/home/ivan/Work/infra/tamdoma/framework/issues/chart/worktree-isolation/forks/outside-inputs.md` (1a, 3a taken), `forks/outputs.md` (run root, kept set), `forks/proofs.md` (P6 constructed env, P9 sensor) — the binding chart evidence.

## Interfaces

- `akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...` (D1).
- Run root `.owner`: `{pid, boot_id, started}` (D7) — worktree-reconciler and base-run read it.
- `withSetup` output shape `akrogon run-check --name <n> -- sh -c <inner>` (D4) — worktree-store splices guards into `<inner>`; leaf-env-file/base-run consume the same wrapper.
- `repoSchema.env`, `repoSchema.tools`; `Batch.tools`, attempt record `tools` (D8/D9).

## Units

Shared test resources: none (each test file is exclusive to its unit; fixture repos are per-test temp dirs).

### Wave 1

- U1 — schema + wrapper: `src/config.ts` (D4, D5 leafTemp root, D8 schema field, D9), `tests/config.test.ts`, `docs/guide/setup.md`. Deps: none.
- U3 — test shim + README/docs: `tests/helpers.ts` (`fakeAkrogon`), `README.md` (run-check row), `tests/command-reference.test.ts` (contract), `src/AREA.md` (verb line). Deps: none.

### Wave 2

- U4 — run-check verb: `src/run-check.ts`, `src/akrogon.ts` (options table, switch case, Usage), `tests/run-check.test.ts`. Deps: U1 (`env:` schema, `withSetup` target shape), U3 (`fakeAkrogon`, README contract which U4 must satisfy exactly).
- U2 — attempt tools: `src/state.ts`, `src/attempts.ts`, `src/next.ts` (mergeWake only), `tests/merge-attempts.test.ts`, `docs/guide/files.md`. Deps: U1 (`tools` schema field).

### Wave 3

- U5 — seat scratch placement: `src/next.ts` (allocate block ~:368-416, `ensurePrivateDir` recursive; shares `src/next.ts` with U2, disjoint regions), `tests/next.test.ts`. Deps: U1 (new `leafTemp` root), U2 (same file).

## Docs

- `README.md` — new `akrogon run-check` command row (U3).
- `docs/guide/setup.md` — `env:` and `tools:` keys, run-check wrapping and refusals (U1).
- `docs/guide/files.md` — `tools` on merge-attempt records (U2).
- `src/AREA.md` — run-check verb line and the constructed-env note (U3).
- No other guide page describes checks execution internals; skills are unaffected (they consume `akrogon config` output verbatim).

## Acceptance → proof map

| Criterion | Proof | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| DC1 env allowlist + TMPDIR lifecycle | `bun test tests/run-check.test.ts` — spawn `sh -c 'env'` style probe: undeclared extra var absent, declared `env:` var present, TMPDIR under leafTemp scratch, root gone after exit 0 and after failing run | leaky env, tmpfs TMPDIR, run-root leak | seconds | any change to run-check.ts/config.ts |
| DC2 refusals | same file — per-var refusal (NODE_PATH, BUN_OPTIONS, BUN_INSTALL_CACHE_DIR, FFMPEG_BIN, CHROME_PATH, CDP_BROWSER_BINARY) naming the var; global bunfig under fixture HOME naming the file; probe marker proves setup never ran | missing/partial guard | seconds | same |
| DC3 concurrent run roots | same file — two concurrent `run-check -- sh -c 'echo $TMPDIR; sleep'` runs, distinct parents, both removed | shared/fixed run dir | seconds | same |
| DC4 seat TMPDIR home disk | `bun test tests/next.test.ts` — fake herdr tab create asserts `TMPDIR=` arg under `AKROGON_LEAF_TEMP_ROOT`; unit check `leafTemp` default root starts with homedir | tmpfs scratch, wrong placement | seconds | next.ts/config.ts |
| DC5 tools per attempt record | `bun test tests/merge-attempts.test.ts` — batch with `tools:` in repo config, fake `which`-resolvable tool on PATH, attempt line carries {name,path,version}; missing tool fails dispatch | unresolved/unrecorded tools | minutes (suite) | attempts.ts/state.ts/next.ts |
| DC6 no-setup constructed env | `bun test tests/config.test.ts` — config without `setup` prints `akrogon run-check` wrapped checks; run-check test on a no-setup repo still refuses forbidden vars | setup-only wrapping regression | seconds | config.ts/run-check.ts |
| DC7 log to leaf folder, also on failure; holder naming | `bun test tests/run-check.test.ts` — real git worktree of fixture repo + leaf record, `<leaf>/implementation/check-<name>-*.log` exists after pass and fail, run root gone; `--holder <dir>` from registered checkout writes there | lost logs, leaked run root, wrong holder | seconds | run-check.ts |
| Repo checks | `bun run format`, `bun run typecheck`, `bun test --timeout=30000`, `test_changed` via `akrogon config` | drift, type errors, regressions | minutes | any diff |

## Known limitations

- The refusal list covers the six named vars plus global bunfig only; other ambient config (`.npmrc`, git global config) remains inherited and is out of scope per outside-inputs 1a.
- Bun's cwd `.env` auto-load can trip refusals from file content, not just shell env (D3 note).
- Old `merge-attempts.jsonl` lines lack `tools`; schema keeps it optional.
- Installed `~/.local/bin/akrogon` runs the main checkout's code; wrapped commands resolve `run-check` through PATH, so the verb exists for other repos' leaves only once this leaf merges and installs. Self-referential on this repo — expected.

## Verification commands

```sh
bun test tests/run-check.test.ts
bun test tests/config.test.ts tests/next.test.ts tests/merge-attempts.test.ts tests/command-reference.test.ts
bun run typecheck && bun run format
bun test --timeout=30000
```

## Implementation notes 2026-10-10

- Plan U3 was folded away: `tests/command-reference.test.ts` requires README rows to match dispatched verbs exactly, so the README row, contract entry and `src/AREA.md` line land in U4 with the verb; `fakeAkrogon` moves into U4 (its only consumer). Waves: W1 U1; W2 U4+U2; W3 U5.
- `--name` defaults to `run` when omitted so hand invocation is possible; `withSetup` always passes `--name`.
- Bun global bunfig locations: `$HOME/.bunfig.toml` and `$XDG_CONFIG_HOME/.bunfig.toml` when `XDG_CONFIG_HOME` is set; both checked, refusal names the file.
- Tool resolution runs inside `mergeWake`'s `withLock`, immediately before the `Batch` record is written, so path/version resolve once per merge dispatch.
