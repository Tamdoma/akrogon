# Plan: state-home

Move akrogon's machine state out of the running code tree into `~/.akrogon` (or `AKROGON_HOME`), with a one-shot self-cutover on the first command after deploy.

## Decisions

- D1 `globalHome()` (src/config.ts) resolves `AKROGON_HOME` when set; otherwise `~/.akrogon/config.yaml` exists → `~/.akrogon`; otherwise `toolRoot/config.yaml` exists → `toolRoot` (pre-cutover old-code parity); otherwise `~/.akrogon`. `toolRoot` keeps meaning the code tree only. Checked per call, no memoization: a mid-command flip cannot strand a command across two homes.
- D2 Cutover is a new `src/state-home.ts` module exporting `async migrateStateHome(): Promise<void>`, called as the first statement of `src/akrogon.ts` before argument parsing and before any state read. Nothing at module top level resolves `globalHome()`.
- D3 Cutover triggers only when `globalHome() !== toolRoot` and `!existsSync(<stateHome>/config.yaml)` and `existsSync(<toolRoot>/config.yaml)`. Skip is silent (no output): live-run or foreign-process aborts retry on the next command.
- D4 While cutting over, hold `flock` on `<toolRoot>/.lock` plus every file in `<toolRoot>/runs/locks/` (the admission locks old-code writers take via `withAdmissionLock`). Under those locks verify (a) `liveRuns()`-equivalent scan of `<toolRoot>/runs/*.yaml` is empty, and (b) no foreign `/proc/*/cmdline` references `toolRoot` (covers a plain `akrogon status`, `.lock` waiters, and the un-`flock`ed `init` writer — answers the design's open question: `status` is read-only but is still excluded this way). Then copy the state set, re-run both checks, and on clean re-check atomically commit `<stateHome>/config.yaml` last via temp+rename. Any post-copy foreign-process appearance or live record aborts: release locks, return; next command retries.
- D5 The copied set is a fixed list covering tracked and untracked state: `config.yaml`, `held.yaml`, `admission.lock`, `paused.yaml`, `stopped.yaml`, `.lock`, `reconcile-host.json`, `reconcile/`, `runs/` (records, `locks/`, `last-start`). Missing entries are skipped. Everything is copied, never deleted (untracked removal is allowed, not required — pure copy is simpler). Retired files `held.yaml`, `admission.lock`, `run.lock`, `run-holder.yaml`, `runs/last-start` are moved with the rest (tests/hold-retired.test.ts, tests/run-permit.test.ts already assert src never reads or writes them); `run.lock`/`run-holder.yaml` copies are skipped only because hosts may lack them.
- D6 In the written `config.yaml`, each non-absolute `repos:` value is rewritten to `expandPath(value, toolRoot)` — the absolute path it resolved to before the move (criterion 3). Absolute values pass through.
- D7 After the commit rename, `globalHome()` flips for every subsequent call; nothing ever reads the tool-root copies again. Old-code processes still running can only be ones without open `toolRoot` references (D4b) — under the held `.lock` and slice locks they cannot write `.lock`-governed or admission state during the copy, and any post-copy straggler aborts the flip.
- D8 `akrogon init` needs no code change: it writes `resolve(globalHome(), 'config.yaml')` (src/init.ts:88) which lands in the state home once deployed, and it writes nothing tracked in the akrogon checkout (repo scaffolding lands in the initialized repo).
- D9 No file in the tool root escapes the move: `held.yaml`, `admission.lock`, `run.lock`, `run-holder.yaml`, `runs/last-start` have no living writer (asserted by existing tests); `reconcile-host.json`, `reconcile/`, `paused.yaml`, `stopped.yaml`, `.lock`, `runs/` all resolve through `globalHome()`. Repo-side state (`issues/`, `.evidence/`, timings) is unchanged.
- D10 Docs: README.md "Install" and "machine configuration" prose plus docs/guide/install.md "Global config" name `~/.akrogon/config.yaml` with `AKROGON_HOME` as override.

## Read-first paths

- src/config.ts — `globalHome`, `readGlobal`, `expandPath`, `currentRepo` (relative `repos:` resolution at src/config.ts:196,243)
- src/akrogon.ts — CLI entry; cutover call site before `parseArgs`
- src/admission.ts — `runsDir`, `withAdmissionLock`, `liveRuns`, record liveness (pid + boot_id)
- src/state.ts:203 — `withLock` (flock wrapper) reused for `.lock` and slice locks
- src/pause.ts, src/stop.ts — `paused.yaml`/`stopped.yaml` under `.lock`
- src/reconcile.ts — `reconcile/<repo>.json`, `reconcile-host.json`, slice-lock usage at :169
- src/init.ts:88 — config write already through `globalHome()`
- src/install.ts — `~/.local/bin/akrogon` symlinks into the checkout; `bun src/akrogon.ts` and `akrogon` share `toolRoot`
- tests/helpers.ts — `fixture`, `cli`, `spawnCaptured` patterns; `AKROGON_HOME`/`HOME` plumbing
- tests/isolation.ts — suite `HOME` is `akrogon-suite-*/home`, so in-process `globalHome()` never touches the real home and this worktree's `config.yaml` never triggers a stray copy

## Interfaces

- `migrateStateHome(): Promise<void>` — src/state-home.ts; detects, gates, copies, commits, prints `moved state home: <toolRoot> -> <stateHome>` once on success.
- `globalHome(): string` — signature unchanged; resolution per D1.
- Tests copy the tool root (`src/`, `package.json`, `bunfig.toml`, `node_modules/`, seeded state files) into a fixture dir and spawn `bun <copy>/src/akrogon.ts` with `HOME=<tmp>` and `AKROGON_HOME` unset — the existing test boundary.

## Waves

### Wave 1

- U1 `src/config.ts` + `src/state-home.ts` + `src/akrogon.ts` + `tests/state-home.test.ts`: D1 resolution, D2-D7 cutover, criterion tests. Owns src/config.ts, src/state-home.ts (new), src/akrogon.ts, tests/state-home.test.ts. No prerequisite.

### Wave 2

- U2 docs: README.md + docs/guide/install.md (D10). Disjoint paths from U1; same wave is allowed but docs are trivially independent — keep as U2 in Wave 1.

Revised: U1 and U2 share no paths and no test resource → **Wave 1 = {U1, U2}**. Not serial-solo.

## Done-criteria → proof

Each proof command runs through `akrogon run-check --name <label> -- <cmd>` from this worktree.

1. **C1 (state under `~/.akrogon` / `AKROGON_HOME`; source-run == installed)**
   Test `state-home.test.ts`: copied tool root + temp `HOME`; run `bun <copy>/src/akrogon.ts status` twice — once pre-cutover (state in copy), once after — assert every file created/read lands under `<HOME>/.akrogon`, and `AKROGON_HOME=<dir>` overrides. Boundary: CLI process. Catches: a reader still resolving `toolRoot`. Command: `bun test tests/state-home.test.ts` (seconds). Rerun: any change to config.ts/state-home.ts.
2. **C2 (`init` registers into state home, checkout untouched)**
   Same test: pre-create state home `config.yaml`, run `init --from <proposal>` inside a fixture repo cwd; assert `repos:` lands in `<HOME>/.akrogon/config.yaml` and `git status --porcelain` of the copied tool root is empty. (seconds)
3. **C3 (cutover copies, prints one line, relative `repos:` rewritten absolute)**
   Fixture tool-root copy holding a `config.yaml` with a relative `repos:` entry and seeded `paused.yaml`/`runs/`; run one command; assert stdout line names source and destination, command exits 0, state exists under `<HOME>/.akrogon`, relative entry is the pre-move absolute path. (seconds)
4. **C4 (no tracked file touched; cutover defers while live runs exist; no post-cutover tool-root writes)**
   Fixture: tracked-file list from `git -C <copy> ls-files`; seed a fake live run record (current boot id + live pid) → command must skip cutover (no `config.yaml` in state home, no output line); remove record → next command cuts over; assert `git status --porcelain` empty on the copy and a `run-check`-admitted record started before the flip ends visible in state home `runs/`. Simulated old-code straggler: a spawned `bun <copy>` process with cmdline open during the gate → cutover defers. (seconds; the defer case exercises the proc/record gates)
5. **C5 (tool-root config dead after cutover)**
   After C3, mutate `<copy>/config.yaml` (e.g. `max_active: 1`); `akrogon config` output must reflect only the state-home config. (seconds)
6. **C6 (docs name `~/.akrogon/config.yaml`)**
   `grep -n 'AKROGON_HOME\|\.akrogon/config.yaml' README.md docs/guide/install.md` plus existing `command-reference.test.ts` docs tests via `bun test tests/command-reference.test.ts`. (seconds)

Existing checks (`bun test --timeout=30000`, `bun run typecheck`, `bunx prettier --check src tests skills/chart-issues/scripts`) stay as the leaf's `checks`; no `merge_checks` additions.

Red evidence before product code: `akrogon run-check --name state-home-tests -- bun test tests/state-home.test.ts` → `check state-home-tests: 1 /home/ivan/Work/infra/akrogon/issues/open/run-release/state-home/implementation/check-state-home-tests-1792105989193-1050413.log`. 5 of 6 fail on the missing cutover (no `moved state home` line, no `~/.akrogon` writes); the tracked-files test passes pre-change and gains teeth only with the implementation present.

## Known limitation

Between the final post-copy re-check and the `config.yaml` commit rename, a brand-new old-code spawn that creates a previously unseen `runs/locks/<slice>` file could in principle race; D4's re-check plus the retryable skip bounds this to an unobserved-and-retried state on the next command. The residual window is the few milliseconds of the commit rename itself.

## Affected docs

- README.md — install/config prose (U2)
- docs/guide/install.md — "Global config" section (U2)
- src/AREA.md — one line naming `src/state-home.ts` and the moved home (U1)
- No skill files affected (skills read config only through `globalHome()`).
