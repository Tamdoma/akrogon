# Leaf review, slot C: tool-cgroup-kill

Date: 2026-11-25  
Reviewed: `brief.md`, `design.md`, `readiness.yaml` against `forks/tool-cgroup.md` (`## Taken`, `## Charting proofs`), `forks/seed-decision.md`, and `src/`.

## Disagreements

### 1. `src/seat.ts:startSeat` / `scopeEntry` bootstrap breaks already-exited seats
- **Where**: `design.md` `## Leaf architecture` (`src/seat.ts:startSeat`: *"Bootstrap of `tools/`, `akrogon/` and `helpers/` after `scopeEntry` sees the harness in the scope. A failure ends the terminal and throws, like the existing out-of-scope refusal."*).
- **Evidence**: `src/seat.ts:scopeEntry` returns `null` for both "harness entered its scope" (`cgroup.endsWith(scope)`) and "harness already exited" (`cgroup === null`, `ENOENT` on `/proc/<pid>/cgroup`), intentionally letting `firstTask` return `{ outcome: 'failed', seat, screen }` while keeping the finished terminal inspectable. `tests/hc-start.test.ts` (`"a seat that exits fails the start with its address"`) asserts that an immediately-exiting seat remains listed (`seats` length 1) and prints its address. Running `mkdir` unconditionally when `scopeEntry` returns `null` hits `ENOENT` on an already-collected scope, calls `end()` (`hc kill` + `hc rm`), and fails that test.
- **Change**: Have `scopeEntry` distinguish `'entered'`, `'exited'`, and `{ outside: string }`. Run the `tools/`/`akrogon/`/`helpers/` bootstrap only on `'entered'`, and on `ENOENT` during bootstrap check `cgroupOf(pid) === null` before ending the terminal and throwing so an immediate exit still falls through to `firstTask`.

### 2. Entry asset directory uses `src/config.ts:globalHome` instead of `homePath`
- **Where**: `design.md` `## Leaf architecture` (*"The entry files at a stable path under the akrogon home (`src/config.ts:globalHome`), outside release dirs"*).
- **Evidence**: `src/config.ts:globalHome` falls back to `toolRoot` (a release directory or git checkout) when `homePath()/config.yaml` is absent and `toolRoot/config.yaml` exists, contradicting *"outside release dirs"*. `src/config.ts:homePath` always resolves `AKROGON_HOME` or `~/.akrogon`, and is what `src/seat.ts:startSeat` already passes to `leafSlice`.
- **Change**: Place the entry files under `src/config.ts:homePath`, not `globalHome`.

### 3. Brief Criterion 2's `run-check` writer proof will not kill `t-rc` if tested as a foreground `run-check`
- **Where**: `brief.md` `## Done-criteria` criterion 2 (*"A run-check writer whose tool shell is killed while it runs: it still publishes its result and removes its capture pair. Proof: own test in criterion 1's scenario, so it fails on the base through criterion 1's kills."*).
- **Evidence**: Under `design.md` `## Binding decisions` Q1 `[R]` and Q2 `[R]`, an `akrogon run-check` launched from `t-rc` relocates into `<seat scope>/akrogon/t-rc/`, making `akrogon/t-rc/` populated. During `commitMove`, `t-rc` is therefore **deferred** rather than killed while a foreground `run-check` runs — so a foreground `run-check` in Criterion 1's scenario never closes `t-rc`'s pipe while the writer is running and never exercises `checkedRun`'s publish-before-echo / `EPIPE` fix.
- **Change**: Clarify Criterion 2's proof so the test actually closes/kills `t-rc` while the writer is still running (e.g. a backgrounded `run-check` whose `t-rc` exits and is killed by the deferred helper mid-run, or a dedicated broken-pipe/killed-shell assertion on `checkedRun` beside Criterion 1's scenario).

### 4. Missing implementation details for the helper verb and `src/akrogon.ts` startup order
- **Where**: `design.md` `## Leaf architecture` (`CLI startup in src/akrogon.ts` and `The helper verb in src/akrogon.ts`).
- **Evidence**:
  - `src/usage.ts:VERB_OPTIONS` is iterated by `tests/cli-help.test.ts` (which runs `--help` on every listed verb), and `src/akrogon.ts` runs `parseArgs` with `strict: true` and exits on `--help` / unknown flags before `migrateStateHome()` (tested for zero side effects in `tests/cli-help.test.ts`). Internal verbs (`verify-pass` in `src/akrogon.ts`) are omitted from `VERB_OPTIONS` and take positional arguments only.
  - `src/verify.ts` and `src/land.ts` spawn internal `akrogon` subcommands via `process.execPath` and the script path rather than bare `'akrogon'` on `PATH` (which would invoke the installed release instead of the worktree under test).
  - `src/timing.ts:appendTiming(repo, event)` requires both `repo.name` and `repo.root` (to write `<repo.root>/issues/timings.jsonl`), and the helper timing row needs `unit`.
- **Change**: State in `## Leaf architecture` that:
  1. The helper verb is an internal verb omitted from `src/usage.ts:VERB_OPTIONS` (like `verify-pass`), taking positional args that include both `repo.name` and `repo.root` (plus `slug` and `t-` path, with `unit` passed or derived from the `t-` path) so it does not call `readGlobal()`/`readRepo()`.
  2. `commitMove` spawns the helper with `process.execPath` and the current `akrogon.ts` entry path (matching `src/verify.ts` and `src/land.ts`), not `'akrogon'` on `PATH`.
  3. Q2 relocation in `src/akrogon.ts` runs *after* `parseArgs` / `--help` exits and immediately before `migrateStateHome()`.

### 5. Inaccurate consumer description for `src/transcript.ts` and `src/seat.ts:cgroupOf`
- **Where**: `design.md` `## Leaf architecture` (`Consumers of changed state`: *"`src/seat.ts:scopeEntry` and `src/transcript.ts` read the harness pid's cgroup as the scope root. ... Open for the plan: confirm `cgroupOf` compares the full scope path and not a prefix match that `tools/` would change."*).
- **Evidence**: `src/transcript.ts` (`proc`, `fromProcess`) reads `/proc/<pid>/{cmdline,environ,fd,stat}` and never reads `cgroup`. `src/seat.ts:scopeEntry` already compares via exact suffix `cgroup.endsWith(scope)` on `/${slice}/${unit}`, while `src/seat.ts:cgroupOf` currently reads `/proc/${pid}/cgroup` directly rather than through `procRoot()`.
- **Change**: Remove the `src/transcript.ts` cgroup claim and the already-answered prefix-match question; instead note whether `src/seat.ts:cgroupOf` should route through `procRoot()` for `AKROGON_PROC_ROOT` tests.

*(No disagreement on `readiness.yaml`: all listed charting proofs reach the key external behaviors they are cited for.)*
