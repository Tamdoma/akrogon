# Implementation report: base-run

Base: `01ca1fbe8654b11b3cec04e56d6ec498dae87196` (AKROGON_BASE). Head: `26c5de8`.

## Changed files and reasons

- `tests/base-run.test.ts` (`aca5d26`, committed red at plan.synthesis): nine tests proving done-criteria 1-8. All failed on the missing verb (`Unknown option '--base'`), all pass now.
- `src/run-check.ts` (`92a466a`, worker Legolas): exported `constructedEnv(repo, runRoot)` and `spawnLogged(argv, cwd, env, log): Promise<Result>`; `AKROGON_BASE` moved to callers. runCheck behavior unchanged.
- `src/next.ts` (`92a466a`): exported `emitEnvFile(repo, worktree, names)` holding the .env emission tail; `writeLeafEnv` keeps its tracked/ignored/live guards and calls it with `config.env`.
- `src/base-run.ts` (`a23a067`, worker Aragorn): new module — `baseRunSchema`/`readBaseRuns`, caller/slot/cwd resolution, `checkLocation` before record append, record line under a `.git` lock file (`akrogon-base-runs.lock`), `createSparseWorktree` detached, `.env` from `leaf.state.env_names`, composed `guard ancestors && [flock setup &&] guard own-modules && exec "$@"` under the constructed env, log at `<leaf>/implementation/base-<id>.log`, `finally` removal + locked record rewrite with `end`/`exit`/`removed`.
- `src/akrogon.ts` (`a23a067`): `base-run` options and case, exit code = command's.
- `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md` (`a23a067`): the three hand-made base-checkout clauses replaced by one `akrogon base-run --base "$AKROGON_BASE" [--attempt <id>] -- <command>` line each; judgment text unchanged.
- `README.md`, `src/AREA.md`, `tests/AREA.md`, `tests/command-reference.test.ts` (`7d2cbd0`, worker Legolas): command table row, `contracts` entry (`Test-Change` trailer on the commit), area-file lines.
- `src/akrogon.ts`, `src/base-run.ts` (`26c5de8`): prettier formatting of the new code only.

Deviations from plan, all operator-approved or forced by contract: `spawnLogged` returns `Result` (not `Promise<number>`) so `runCheck` keeps split stdout/stderr passthrough; `emitEnvFile` is `async`. Worker 2 also landed the three SKILL.md rewrites (planned as brief 3) because its contract test required them — verified correct, brief 3 retired without a second worker.

## Tests run

- `bun test tests/base-run.test.ts --timeout=30000`: 9 pass 0 fail (~6 s; the SIGKILL-during-setup test takes the 6 s kill window).
- `bun test --timeout=30000` (full suite): 753 pass, 0 fail, ~76 s wall. An earlier concurrent run showed three 30 s timeouts under parallel worker load; the clean rerun is green and worker 2 observed the same flake on `--changed` — judged load flake, not code.
- `bun test --changed=01ca1fbe8654b11b3cec04e56d6ec498dae87196 --timeout=30000`: 131 pass after the verb landed.
- `bun run typecheck`: clean.
- `bun run format`: reformats only pre-existing drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts` (both reverted, known lesson) plus this leaf's new files (committed).
- `tests/command-reference.test.ts` + `tests/docs-links.test.ts`: 8 pass.

## Done-criteria evidence

All eight criteria proven by `tests/base-run.test.ts` (names in plan.md): status/log/removal/record on success and failure; record-before-checkout under SIGKILL; detached sha, no `issues/`, `AKROGON_BASE`; two fresh checkouts; ancestor refusal before allocation and missing-`node_modules` refusal in the log; `--attempt` merge run logging and record; no hand-made checkout instructions in skills; `.env` generation, caller fields and relative cwd.

## Known limitations

- A caller in a two-slot phase without `HERDR_PANE_ID` cannot resolve its slot and is refused (plan's recorded open limitation).
- A kill between `.env` write and spawn leaves the record without `end` — intended reconciler signal.

## Unverified criteria

None.

Changed files and reasons: listed above with commit ids.
Tests run: listed above.
Known limitations: listed above.
Unverified criteria: none.

## check.fix round 1 (H1: intermittent subprocess timeouts)

Review-B handed one item to A: red `checks.test` full-suite runs from intermittent 30s timeouts.

Root cause: Bun 1.4.2 pipe streams drop events under load. A spawned child exits but its stdout/stderr drain never receives EOF (hang) or loses buffered bytes (empty string, producing ZodError inside children). Observed directly: `git` children exited (`/proc` gone) while drains stayed pending 30s; other runs returned `''` for children that wrote output.

Repair commits:

- `b61fb31` fix: `src/shell.ts` gains `spawnFiles`/`finishCaptured`/`spawnCaptured`, capturing child stdout/stderr into per-spawn files read after exit; `run()` reuses them and keeps its manual deadline (Bun `timeout` sets `killed` even on clean exits). `spawnLogged` in `src/run-check.ts` moved to `spawnCaptured`. `withLock`'s live-pipe handshake unchanged by design.
- `239c730` test: every test-side drain site converted to `spawnCaptured`; `pause-next.test.ts` uses `spawnFiles` + `finishCaptured` to keep its barrier-then-release live child.

Verification (exact configured commands, leaf worktree):

- `bun run format`: exit 0; only known pre-existing drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`, inspected and reverted.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 756 pass, 0 fail, ~77s (log /tmp/final-full.log); two prior consecutive green full runs during diagnosis plus this post-commit run. `bun test tests/base-run.test.ts --timeout=30000` ran green 9 consecutive times.
- `bun test --changed="$AKROGON_BASE" --timeout=30000` (base `01ca1fb`): exit 0, 750 pass, 0 fail.

Done-criteria evidence unchanged from above; all 12 leaf tests included in the green runs. No new limitations.
