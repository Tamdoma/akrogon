# Brief 2: akrogon run-check verb

## 1. Goal

Plan unit U4 (decisions D1, D2, D3, D6, D7). Implement the `akrogon run-check` verb that `withSetup` (worker 1, landing first) wraps every printed check command in. Refuses forbidden caller env, builds a constructed env, gives each run a fresh TMPDIR run root, copies the command output log into the leaf folder, removes the run root always.

## 2. Acceptance criteria

Brief done-criteria 1, 2, 3, 6, 7 map here:

1. `akrogon run-check -- sh -c 'env'` sees only: `HOME`, `PATH`, `XDG_CACHE_HOME`, `NODE_DISABLE_COMPILE_CACHE` (copied when set in the caller), `TMPDIR` (the run root), `AKROGON_BASE` (computed), names in the repo config `env:` list (copied when set). An exported-but-undeclared variable is absent inside the command.
2. `TMPDIR` inside the command is a fresh `mkdtemp` dir under `leafTemp(repo, slug)` which does not exist after the command exits, on success and on non-zero exit.
3. Exit non-zero naming the cause before anything else runs when any of `NODE_PATH`, `BUN_OPTIONS`, `BUN_INSTALL_CACHE_DIR`, `FFMPEG_BIN`, `CHROME_PATH`, `CDP_BROWSER_BINARY` is set in the caller env, or when `$HOME/.bunfig.toml` exists, or `$XDG_CONFIG_HOME/.bunfig.toml` exists when `XDG_CONFIG_HOME` is set. The refusal names the variable or file. A child-side marker file proves the command never ran.
4. Two concurrent `run-check` invocations get different TMPDIR roots.
5. `<run root>/.owner` contains JSON `{pid, boot_id, started}` while the command runs.
6. Leaf folder derivation: cwd inside a leaf worktree (realpath of `git rev-parse --show-toplevel` matched against `allLeaves(repo)` `.state.worktree`) → output log copied to `<leaf>/implementation/check-<name>-<id>.log` (mkdir -p). `--leaf <path>` overrides. No leaf match → run root under `leafTemp(repo, 'checkout')` and `--holder <dir>` required (log written as `<holder>/check-<name>-<id>.log`), else startup refusal. `--leaf` and `--holder` together refused.
7. Child stdout+stderr are captured to `<run root>/out.log` and echoed to the parent's own stdout/stderr; exit code equals the child's; the log lands in the target on success AND failure (copy before run-root removal in `finally`).
8. `--name` optional, default `run`. Verb parses `akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...` (tokens after `--` are the argv; node parseArgs puts them in `positionals`).
9. A repo config without `setup` still gets refusals and constructed env (withSetup change from worker 1 does the wrapping; this verb itself is setup-agnostic — cover with a refusal test on the default fixture which has no `setup`).

## 3. Read-first

- `src/akrogon.ts` — verb dispatch pattern, parseArgs option table, Usage line.
- `src/config.ts` — `requireRepo`, `currentRepo`, `base`, `leafTemp`, `repoSchema` (worker 1 adds `env:`/`tools:` — check the landed diff first; if absent in your base, add the `env: z.array(text).default([])` line yourself is NOT allowed: report a mismatch instead).
- `src/state.ts` — `allLeaves`, Leaf shape.
- `src/shell.ts` — `command`, `run`, `quote`, Result.
- `src/attempts.ts` — `readPressure` for the boot_id read pattern (`/proc/sys/kernel/random/boot_id` via `join(dir,'..','sys','kernel','random','boot_id')`; for .owner read `/proc/sys/kernel/random/boot_id` directly, empty string when absent).
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `fakeHerdr`, `leafTempRoot`; `entry`.
- `tests/command-reference.test.ts` — contracts table (you add `run-check`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Plan decisions D1-D3, D6, D7: `/home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/check-env/plan.md`.

## 4. Change list and interfaces

Owned paths: `src/run-check.ts` (new), `src/akrogon.ts`, `tests/run-check.test.ts` (new), `tests/helpers.ts` (add `fakeAkrogon`), `README.md`, `tests/command-reference.test.ts`, `src/AREA.md`.
Lands after: worker 1 (config schema + withSetup + leafTemp root). Consumed by: worktree-store, base-run (`.owner` shape), leaf-env-file.
No shared test resource.

- `runCheck(cwd, name, leafOverride, holder, argv)` exported from `src/run-check.ts`; returns exit code or throws Error (top-level bun exits non-zero with the message on stderr).
- `akrogon.ts`: extend `options` for `run-check` (`name`, `leaf`, `holder` strings), add `case 'run-check':` calling `runCheck(process.cwd(), values.name, values.leaf, values.holder, positionals)` — argv = `positionals` (parseArgs puts everything after `--` there); add `run-check` to the Usage string.
- `fakeAkrogon(f)` in `tests/helpers.ts`: mirror `fakeHerdr` — mkdir `<home>/bin`, symlink `bin/akrogon` → `entry`; return `{ env: { PATH: bin + ':' + process.env.PATH } }`. `src/akrogon.ts` is mode 755 with a bun shebang.
- README row: `` `akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...` `` with a one-line effect (runs a command under the constructed check environment, logging output into the leaf). contracts entry in command-reference.test.ts: `'run-check': '[--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...'` — verify the parser accepts `...` in required-position args; if it must be an alternative, use `<argv>`.
- `src/AREA.md` Commands: one line for the verb.
- Constructed env build: `const env: Record<string,string> = {}` copy only `HOME`,`PATH`,`XDG_CACHE_HOME`,`NODE_DISABLE_COMPILE_CACHE` when `process.env[k] !== undefined`; `env.TMPDIR = runRoot`; `env.AKROGON_BASE = await base(repo, cwd)`; for each `name` in `repo.config.env`: `if (process.env[name] !== undefined) env[name] = process.env[name]`. Never log values.
- Spawn: `Bun.spawn(argv, { cwd, env, stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' })`; collect stdout/stderr text; append both (stdout then stderr is fine) to `runRoot/out.log` via `appendFileSync`; write them to `process.stdout`/`process.stderr`; await `child.exited`; `process.exitCode` propagation — the verb should `process.exit(code)` or return code to akrogon.ts which sets `process.exitCode` (match how the file handles verb results; simplest is akrogon.ts doing `process.exit(await runCheck(...))` — check existing verbs keep the process alive for imports? akrogon.ts is a script, `process.exit` is acceptable).
- `.owner`: `writeFileSync(join(runRoot,'.owner'), JSON.stringify({pid: process.pid, boot_id, started: new Date().toISOString()}))` after mkdtemp, before spawn.
- Refusal ordering: forbidden-var scan and bunfig checks BEFORE `mkdtemp` (nothing created on refusal). Error message e.g. `Refusing to run: NODE_PATH is set` / `Refusing to run: global bunfig at /home/x/.bunfig.toml`.
- `runRoot` = `mkdtempSync(resolve(leafTemp(repo, slug), 'run-'))` — mkdirSync the leafTemp parent `{recursive:true}` first (mode 0700 on leafTemp itself is handled by next.ts allocate in production; run-check creates it recursively only if absent — keep permissive simple: `mkdirSync(scratch, {recursive:true, mode:0o700})`).
- `finally: rmSync(runRoot, {recursive:true, force:true})` after copying out.log to target dir.

## 5. Do-not, reasons and exceptions

- Do not edit `src/config.ts` `withSetup`/`leafTemp`/`repoSchema`: worker 1 owns them; your base already contains its commit (verify with `git log -1 --oneline` and read `src/config.ts`). If it does not, return a mismatch immediately.
- Do not touch `src/attempts.ts`, `src/state.ts`, `src/next.ts`: worker 3/4 own them.
- Do not add env-var expansion, shell detection, or .env loading: the allowlist IS the design; Bun's own auto-.env-load of the verb process is accepted behavior (plan D3).
- Do not print env values anywhere: refusal names the variable only.
- Tests must not export real secrets or rely on the operator's home: fixture sets `AKROGON_HOME=f.home`; pass `HOME`/`XDG_CONFIG_HOME` explicitly per test env to steer the bunfig check.
- Real `sh` only via a `bin/akrogon` shim on PATH (`fakeAkrogon`), never the installed akrogon. Scenarios use temp fixture repos, real git worktrees, no real herdr/GitHub.
- Any plan decision conflicting with live code → return a mismatch with evidence; the exception is a revised brief from A. Restating: exclusions above each matter because another unit owns that surface or the design fixes the behavior; the only exception is a revised brief.

## 6. Ordered steps

1. `git log -1 --oneline`; read `src/config.ts` to confirm worker 1's fields exist. If missing, stop and return a mismatch.
2. Write `tests/run-check.test.ts` FIRST covering criteria 1-7 (use `fixture()`, `leaf()`, `fakeAkrogon(f)`, `cli()` with `cwd` inside a real `git worktree add` of the fixture repo and `state.worktree` set; env probes print `env` output; bunfig refusal writes `$HOME/.bunfig.toml` under a dir you pass as `HOME`).
3. Implement `src/run-check.ts`, wire `src/akrogon.ts` (options, case, Usage).
4. Add `fakeAkrogon` to `tests/helpers.ts`, README row, contracts entry, `src/AREA.md` line.
5. Run changed tests to green; `bun run format` touched files.

Advisory size: ~6 files, under 45 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/check-env-u2
bun install
AKROGON_BASE=354c80e14aca6483c430312c61ae5c1397bb548e sh -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'
```

## 8. Done-when, evidence and report

Criteria 1-7 proven by `tests/run-check.test.ts` runs (paste real outputs), command-reference test green, commit on detached worktree with `Test-Change:` trailer for each existing test file changed (`tests/helpers.ts`, `tests/command-reference.test.ts` — trailers apply to files matched by `src/test-files.ts`; check that rule). Report commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
