# Plan: durable-check-capture

Source: brief.md 7 done-criteria; design.md binding items 1-3, 6, 7 (item 4 replaced by the correction).

## Read-first

- `src/run-check.ts` — `checkedRun`, `spawnLogged`, `runCheck`, `ownerRefusal`, `constructedEnv`, `copied`.
- `src/shell.ts` — `spawnFiles`/`spawnCaptured`/`finishCaptured` (unchanged for other callers).
- `src/pack.ts` — `packFolder` snapshot order; `src/pack-command.ts` `packOne`; `src/phase.ts` `completeOwner` (`.closing` then `packFolder` then rename).
- `src/evidence.ts` — `locate`/`readLog`/`readMember` (capture readability, owner resolution).
- `src/admission.ts` — held vs nested (`AKROGON_RUN` token), `run <id>` line print point.
- `src/reconcile.ts` — run-root sweep keeps `refusal.json` roots, deletes dead `.owner` roots; never touches holder files.
- `src/sync.ts` `eligibleRecord` — `basename === '.lock'` is never committed.
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `fakeAkrogon`, `fakeHerdr`, `mergingLeaf` pattern in tests/close-pack.test.ts), `tests/run-units.test.ts` (`spawnFiles`/`finishCaptured` background spawn + SIGKILL pattern), `tests/isolation.ts` `descendantsOf`.
- `docs/reference/checks.md`, `docs/reference/files.md`, `docs/reference/commands.md`, `src/AREA.md`.

## Decisions

- **D1 Capture files.** `checkedRun` creates `capture-<encodeURIComponent(name)>-<run-uuid>-out.log` and `...-err.log` inside `target` (the holder: `<leaf>/implementation` or `--holder` dir) immediately after lock admission, before spawn; `Bun.spawn` writes stdout/stderr directly into them via `Bun.file` sinks. `spawnLogged` is reworked in `src/run-check.ts` to take `{out, err}` paths; `src/shell.ts` is untouched.
- **D2 Early capture line.** Once both capture files exist, the wrapper prints `capture <name>: <outPath> <errPath>` on stderr, then waits on the child. The existing `check <name>: <exit> <log>` line keeps printing only after exit. `withAdmission` prints `run <id>` first, so line order is `run`, `capture`, `check`.
- **D3 Shared lock, two carriers.** Lock target is `<ownerDir>/.lock` (basename `.lock`: sync-ineligible per `eligibleRecord`, never packed by the `*.log` glob, moved with the owner). Owner dir is derived with the same `locate` math as `ownerRefusal` (`recorded = target/out.log`; owner = `found.ownerDirs[0]` resolved against member depth; for a `--holder` outside `issues/` `locate` returns null and the holder itself is the owner dir). Two shared (`flock -s`) carriers:
  - a holder subprocess `flock -s <.lock> sh -c 'printf ready\n; exec tail --pid=$PPID -f /dev/null'` spawned before capture creation (first stdout line gates creation); it covers publication and partial removal and dies with the wrapper (`tail --pid` exits when the wrapper dies, even SIGKILL),
  - the command itself wrapped as `flock -s <.lock> env <argv>` (held admission wraps `runUnitArgv(...)`), so the lock rides the `systemd-run` exec chain into the scope and orphaned writers still hold it.
  Under the held shared lock the owner fence (`ownerRefusal`, late=true) is rechecked before captures are created; a firing fence writes `refusal.json`, keeps the run root and throws `PublishRefusedError` exactly like today's late refusal.
- **D4 Pack takes the same lock exclusively.** `packFolder` acquires `<folder>/.lock` exclusive (`flock -x`) via the same `tail --pid` holder shape *before* the `**/*.log` scan and before the existing-Archive early return, and holds it through member verification and unlinks. This covers both `packOne` callers and `completeOwner`'s pack-then-move, including the no-logs early return, so the owner never moves while a capture writer or publication is live.
- **D5 Self-close env.** `constructedEnv`'s `copied` list is unchanged; `checkedRun` sets `env.AKROGON_CAPTURE_OWNER=<ownerDir>` and `env.AKROGON_CAPTURE_RUN=<run-uuid>` for the command, so a nested run-check overwrites them with its own values and any descendant `akrogon` call sees the innermost enclosing capture. `src/pack.ts` exports `enclosingCapture(folder: string): string | undefined` returning the enclosing run id when `AKROGON_CAPTURE_OWNER` names `folder`, its parent (chart `direct` vs chart folder), or its open/closed/parked sibling with the same basename under the same `issues/` root (realpath comparison for existing paths). `packFolder` refuses with it first; `completeOwner` and `packOne` check before writing `.closing`. Refusal text: `Refusing to pack <folder>: inside run-check run <run>` (packOne renders `refused <arg>: inside run-check run <run>` through its `RefusalError` path, no `failed` line).
- **D6 Publication and late refusal.** After `child.exited` the wrapper reads both capture files, runs the existing late `ownerRefusal`, and on publishable owner writes the combined `check-<name>-<ms>-<pid>.log` (stdout then stderr, same pattern/content/replay as today), appends `check_end`, then unlinks the two capture files — removal only after successful publication. On late refusal it writes `runRoot/out.log` from the captured bytes plus `refusal.json`, removes `.owner`, deletes the stale capture pair under every `found.ownerDirs` location it can reach, and throws `PublishRefusedError` (run root kept, owner never recreated).
- **D7 `.owner` and timings unchanged.** `check_start`/`check_end` stay where they are: a killed wrapper writes neither `check_end` nor a receipt (verify builds receipts only from a completed `checkedRun` result). `spawnFiles`' `captureRoot`/`akrogon-io-` temp dirs are no longer used by `run-check`; `TMPDIR` stays the run root.
- **D8 Helper module.** New `src/flock.ts` exports `flockHold(path, mode): Promise<{release(): Promise<void>}>` used by both `run-check.ts` and `pack.ts` (util-linux `flock` + `tail --pid`, stdout-ready gate, error surfaces child stderr).

Open-for-the-plan resolutions: capture name pattern → D1; reconcile never touches holder files → confirmed (`src/reconcile.ts` sweeps only `leafTemp` `run-*` dirs); refusal keeps captured bytes in the run root `out.log` and removes holder captures → D6; lock carrier → D3/D4; env variable names → D5.

## Interfaces

- `src/flock.ts`: `flockHold(path: string, mode: '-s' | '-x'): Promise<{ release: () => Promise<void> }>`.
- `src/run-check.ts`: reworked `spawnLogged(argv, cwd, env, capture: {out: string; err: string})`; new `captureOwner(target, repo): Promise<string>` (shared with env setup and lock path); `checkedRun` gains lock+holder lifecycle inside `withAdmission`.
- `src/pack.ts`: `enclosingCapture(folder)`, lock inside `packFolder`.
- `src/pack-command.ts` `packOne`, `src/phase.ts` `completeOwner`: pre-`.closing` self-close refusal.

## Units and waves

| Wave | Unit | Owns | Shared test resource | Must land first |
| --- | --- | --- | --- | --- |
| 1 | U1 mechanism | `src/flock.ts` (new), `src/run-check.ts`, `src/pack.ts`, `src/pack-command.ts`, `src/phase.ts` | none beyond committed tests | — |
| 1 | U2 docs | `docs/reference/checks.md`, `docs/reference/files.md`, `docs/reference/commands.md`, `src/AREA.md`, `tests/AREA.md` (one line for the new test file) | none | — |

U1 and U2 have disjoint owned paths and no ordering: wave 1 runs both. Tests for all criteria are written and committed at plan.synthesis; workers make them green.

Docs affected (one line each): `docs/reference/checks.md` (capture line, `.lock`, self-close refusal row), `docs/reference/files.md` (capture files, `<owner>/.lock`), `docs/reference/commands.md` (run-check/pack lines), `src/AREA.md` (run-check + pack sentences), `tests/AREA.md` (new test file line). Skills: none — the `check <label>: <exit> <path>` contract they cite is unchanged.

## Criterion proofs

Each proof runs through `akrogon run-check --name <label> -- <cmd>`; all are new or changed cases in `tests/durable-capture.test.ts` (new file), `tests/close-pack.test.ts` (binding item 6 rewrites), `tests/run-check.test.ts` and `tests/check-names.test.ts`. Sizes: minutes. Rerun trigger: any change under Owned surfaces, run `bun test tests/durable-capture.test.ts tests/close-pack.test.ts tests/run-check.test.ts tests/check-names.test.ts`.

### C1 — SIGKILLed wrapper leaves both streams in holder captures after reconcile (held and nested)

- Test `durable-capture.test.ts`: spawn `run-check --leaf <leaf> --name durable` whose command prints `MARKER-OUT`/`MARKER-ERR`, touches a ready file, waits on a release file. When the `capture-durable-*-out.log` exists and contains the marker (positive signal), `kill('SIGKILL')` the wrapper, run `akrogon next` (reconcile sweeps the dead run root), read both markers from `capture-*-out.log`/`capture-*-err.log` in `<leaf>/implementation`.
- Nested leg: outer `run-check --leaf A` runs `akrogon run-check --leaf B --name inner`; kill the inner wrapper by pid read from `B`'s leaf-temp `run-*/.owner`; reconcile; read inner captures.
- Conditions traced: markers must land from launch (files exist before spawn, not copied at exit — D1); must survive reconcile (captures are outside `run-*` roots the sweep deletes — confirmed in reconcile.ts); held and nested both reach the same path (spawnLogged is the single writer for both admissions).
- Red output: files never appear → wait/assert fails on current code.
- Observation: real `akrogon run-check` process killed by real SIGKILL; real reconcile; files read from the real holder. Command: `akrogon run-check --name c1 -- bun test tests/durable-capture.test.ts -t 'capture'`.

### C2 — early capture-path line, no exit claim; result line after exit

- Same test (T1/T3): read the wrapper's stderr while the command still runs — contains `capture <name>: <out> <err>` and no `check <name>:` line; after exit the `check <name>: <exit> <log>` line appears once.
- Conditions traced: the print must precede waiting (D2 prints before `child.exited`); it must not carry an exit code (literal format `capture <name>: <paths>`).
- Red output: no `capture` line exists on current code.

### C3 — normal exit leaves exactly the completed combined log

- Test asserts: impl dir holds exactly `check-<name>-*.log`, zero `capture-*` files, combined content = stdout then stderr, run-check exit code and replayed stdout/stderr unchanged, `check <name>: <exit> <log>` line matches.
- Conditions traced: partial removal only after successful publication (D6); name pattern unchanged.
- Mostly preserved behavior; the new `capture-*`-absence assertion is the only expectation unreachable today (green at planning is impossible to fake since captures cannot exist yet — the assertion guards the new mechanism's cleanup).
- Command: `akrogon run-check --name c3 -- bun test tests/durable-capture.test.ts -t 'normal exit'`.

### C4 — early closed/closing refusal unchanged; gone-at-publication keeps `out.log` + `refusal.json`, no recreation

- Existing early-refusal legs of `close-pack.test.ts` stay (closed target, `.closing` target).
- New leg in `durable-capture.test.ts`: `run-check --leaf` on a no-worktree leaf; while the command waits on the release file, `renameSync(open/issue → aside)`; release; assert non-zero, refusal text names gone owner, `run-*/out.log` holds the marker, `refusal.json` present, `open/issue` absent, aside dir has no `capture-*` left.
- Conditions traced: `mkdirSync(target, {recursive:true})` may not run before the under-lock fence and may not recreate a gone owner (D3 order: fence recheck before target creation); stale captures removed from wherever the owner went (D6).
- Red output: current code still writes `out.log` inside the run root only at exit — the gone-owner leg's publication path differs; the test fails today on the missing capture-path line and lock behavior.

### C5 — pack waits for writers + publication; `akrogon log` reads both streams from the archive

- Test: `mergingLeaf`-style leaf with worktree + green receipt; run-check command waits on release file while captures live; spawn `akrogon phase <slug> merged` concurrently; assert the phase process is still running and `issues/open/<owner>` still exists while the release file is absent (positive gate: the command cannot exit early); write release; assert run-check publishes, then phase exits 0 and owner lands in `issues/closed`; `akrogon log <open-path>/implementation/check-<name>-*.log` prints both markers from `evidence.tar.zst`.
- Conditions traced: pack must wait for *every* writer (command carries its own shared flock through the systemd-run exec chain — D3b, an orphaned writer still blocks pack) and for publication (holder process keeps the shared lock until wrapper exit — D3a); lock precedes snapshot (D4) and the no-logs early return (D4); owner move is covered (D4 inside packFolder before return).
- Red output: on current code the phase completes while the command sleeps — the `owner still open` assertion fails immediately.
- Command: `akrogon run-check --name c5 -- bun test tests/durable-capture.test.ts -t 'pack waits'`.

### C6 — distinct names, `akrogon log`-readable, no completed artifacts on kill

- Covered in T1/T3 assertions: killed run leaves `capture-*` files, no `check-*.log`, no `check <name>:` line, no `check_end` in `timings.jsonl` (assert absent for that run), and `akrogon log <capture-out>` prints the marker.
- Conditions traced: a partial capture never becomes a completed check or receipt — `check_end` is appended only after `copyFileSync` succeeds in the publish path (D6); verify receipts consume only the returned result.
- Red output: `akrogon log` never sees a capture path on current code; no capture files exist.

### C7 — same-owner completion/pack inside a capture refuses fast naming the run; outside waits

- Rewritten `close-pack.test.ts` cases (binding item 6): `run-check --holder <owner>` command `akrogon phase <slug> merged` now expects non-zero fast refusal containing `inside run-check run <uuid>` and the owner still open with the run's published log kept; the `akrogon phase` early-closed/`.closing` holder legs are unchanged. A different-owner `akrogon phase <other> merged` inside a capture still completes (waits the other owner's lock).
- Outside-waits leg is proven by C5's phase completing after the run ends.
- Conditions traced: refusal precedes any lock wait (D5 check before `.closing` and before flock acquisition — a self-pack waiting on its own shared lock would deadlock); detection is env state, never timing or a lock probe.
- Red output: on current code the phase succeeds and closes the owner — the `still open` assertion fails.

## Proof commands recorded

Run red at planning through `akrogon run-check --name <label> --` (logs in `implementation/`):

| Criterion | Command | Red at planning |
| --- | --- | --- |
| C1, C2, C6 (SIGKILL, nested, capture line, distinct names, no completed artifacts) | `bun test tests/durable-capture.test.ts` (label `c1-capture`) | 5 fail: `expect(live).toHaveLength(1)` with no `capture-*` files; `expect(result.stderr).toMatch(/^run ...\ncapture clean:/)` no capture line; `Timed out waiting for capture files` (gone-owner and pack cases); `Timed out waiting for inner capture files` (nested) |
| C7 (self-close refusal) | `bun test tests/close-pack.test.ts` (label `c7-closepack`) | 1 fail: `akrogon phase a-racer merged` completed the capture's owner (today's self-close), so the publish hit `owner gone` and the run exited 1: `Expected: 0 Received: 1`, stderr shows `owner gone: .../issues/open/racing; captured output stays in .../out.log` |
| C3 + env/line-shape support | `bun test tests/run-check.test.ts tests/check-names.test.ts` (label `c34-runcheck`) | 4 fail: missing `AKROGON_CAPTURE_*` env names, `ls $TMPDIR` no longer lists `akrogon-io-` (expects `.owner`), and both stderr-shape regexes lack the `capture <name>:` line |

No credentials needed (`akrogon status` shows no `Missing:` lines). No new proof machinery: `bun test`, `fixture`, `spawnFiles`/`finishCaptured`, `fakeAkrogon`, `cli` all exist at AKROGON_BASE.

## Implementation notes

2026-10-27, check.repair: preserve the complete enclosing capture ancestry through nested run-check commands and verify services, as design binding item 6 and the Lock/self-close inheritance paragraph require every same-owner pack and move entry point to refuse before waiting.

2026-10-27, constraints found while implementing:

- `flock` and `tail` are existing platform prerequisites, not new dependencies: the repo's own `checks` commands already invoke `flock`, and `startRunGuard` in `src/scope.ts` already relies on `tail --pid`.
- The flock holder is spawned by the *wrapper* (never inside the run unit), so `tail --pid=$PPID` always tracks the wrapper pid that owns publication; the command-side shared lock instead wraps the spawn argv (`flock -s <lock> <argv>`) so it rides `systemd-run --scope`'s exec chain into the unit.
- `spawnLogged` drops the `spawnCaptured`/`captureRoot` path entirely inside `src/run-check.ts` and spawns directly onto the two capture paths; `src/shell.ts` keeps `spawnFiles`/`finishCaptured` byte-identical for every other caller.
- A `mkdirSync(target)` at publish time is removed rather than duplicated: the holder must already exist once captures are created there, and the under-lock owner fence already ran, so the later `mkdir` only risked recreating a vanished owner (brief criterion 4).
- `enclosingCapture` compares the folder `packFolder` receives (the `packDir`): for a chart pack that is `direct/`, matching a `--holder <chart>/direct` capture through `dirname(env) === packDir`.
