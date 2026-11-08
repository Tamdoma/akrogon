# Implementation report: deploy-listener-ready

- Mode: `subagents`. Plan wave 1 held two units, so there were two workers in detached worktrees (`deploy-listener-ready-u1`, `-u2`). Both were cherry-picked and both worktrees removed.
- Base: `67f0b262` (refresh at start and before proof: `origin/main` unchanged, so the branch did not move).
- Committed head: `99a256a8`.

## Commits

- `6d6af827` test: criterion tests and fakes (plan.synthesis)
- `732a33b1` deploy, install: relink plugin and run listener unit by release shape (U1, worker commit `d70cc507`)
- `bb971b00` config: accept optional prefixes map (U2, worker commit `b5acadd4`)
- `351aa0ff` src/AREA.md: keep the area file at 40 lines (A)
- `99a256a8` tests/AREA.md: keep the area file at 40 lines (A, `Test-Change` trailer for `tests/AREA.md`, which the test-file path rule matches)

## Changed files and reasons

- `src/install.ts`: implements D1, D2, D4 and D6.
  - The `listenerUnit` constant.
  - A conditional unit link in `planSkillLinks`, probed under `listRoot` and sourced through `current`.
  - `shipsPlugin` and `shipsListener`, read from `current`.
  - `call`, which spawns with `env: process.env`, carrying the moved comment.
  - The exported `linkServices(kinds)`, `restartListener()` (`--no-block`, D5) and `unlinkPlugin()` (guarded by `Bun.which('herdr', { PATH: process.env.PATH })`).
  - `install()` runs those three after `applySkillLinks`.
- `src/self-update.ts`: implements D3. The reload step is `linkServices([])`, and new `restart` and `unlink` steps follow `record`. Unused imports removed.
- `src/config.ts`: implements D7. `globalSchema.prefixes` is an optional record of two lowercase letters.
- `docs/reference/releases-and-updates.md`: the deploy sequence by release shape, and the `restart` and `unlink` steps.
- `docs/start/install.md`: the listener unit link with enable and restart. The plugin link and integration install happen only with `plugin/`, and the unlink otherwise.
- `docs/reference/config.md`: the `prefixes` row and example.
- `src/AREA.md`: the listener unit link and the shared service calls. One line was joined to stay at 40 lines.
- `tests/AREA.md`: the `deploy-shapes.test.ts` line. Four existing key-file lines were joined, with their text unchanged, to stay at 40 lines (it was 43 at base).
- `docs/use/roll-back-a-release.md` is unchanged. Its "plugin links" wording is still right for pre-cutover rollback targets (plan).

## Proofs on head 99a256a8

| Criterion | Command | Result |
| --- | --- | --- |
| C1 | `bun test --timeout=30000 tests/deploy-shapes.test.ts tests/install.test.ts -t 'plugin release'` | 2 pass. `check c1: 0 …/implementation/check-c1-1794061955812-3159180.log` |
| C2 | `bun test --timeout=30000 tests/deploy-shapes.test.ts -t 'listener release'` | 2 pass. `check c2: 0 …/implementation/check-c2-1794061956235-3159844.log` |
| C3 | `bun test --timeout=30000 tests/install.test.ts -t 'install from a'` | 3 pass. `check c3: 0 …/implementation/check-c3-1794061956561-3160516.log` |
| C4 | `bun test --timeout=30000 tests/config.test.ts -t prefixes` | 1 pass. `check c4: 0 …/implementation/check-c4-1794061956955-3161063.log` |
| C5 | `akrogon verify` test duration | See below |

Red-before evidence and the nine deliberate breaks (V1-V9) are recorded beside each criterion in `plan.md`.

Targeted runs after each cherry-pick:
- `check pick-u1: 0 …/check-pick-u1-1794061915888-3132722.log` (deploy-shapes, install, release-deploy, self-update and rollback: 69 pass)
- `check pick-u2: 0 …/check-pick-u2-1794061916928-3150222.log` (config and init: 50 pass)

## Verify

`akrogon verify` on `99a256a8`: green, run `bdb11347-c995-4410-a7f0-0668c3a812bd`, 14:32:39.9Z to 14:33:55.3Z (wall time 1 min 15.6 s).
- format: 0, `…/implementation/check-format-1794061962474-3161866.log`
- typecheck: 0, `…/implementation/check-typecheck-1794061964843-3161866.log`
- test: 0, 1316 pass, 0 fail, runner time 70.15 s, `…/implementation/check-test-1794062035057-3161866.log`

## C5: test duration

The leaf's verify `test` check took 70.15 s (bun runner time, 1316 tests across 76 files). Today's baseline is a 75 s median (`issues/verify-runs.jsonl`, per the design). There was no rise. The new cases add about 1 s of CPU in total (the `deploy-shapes` file runs in 435 ms).

## Worker returns

- U1: all checks green (`check u1-shapes: 0`, `check u1-deploy: 0`, `check u1-typecheck: 0`). The worker reported two things:
  - `src/AREA.md` was 41 lines at base. A fixed it in `351aa0ff`.
  - The deploy's service calls now run in `process.cwd()` instead of `cwd: repo.root`. The commands take absolute paths, and the error text comes from the result, so behavior is unchanged.
- U2: all checks green (`check u2-config: 0`, `check u2-typecheck: 0`). No limitations.

## Known limitations

- When a deploy runs inside the listener's own cgroup, the `--no-block` restart can stop that deploy before `unlinkPlugin` runs. The engine release's first deploy runs from the old plugin's process, so its unlink runs. The engine leaf's self-update proof exercises this (plan "Limitation kept open").
- `systemctl --user enable` of a unit whose file is a symlink into `current` is not run against real systemd here, because the standing design fakes the process boundary. The engine leaf's live run covers it.

## Unverified criteria

None.

## Grants

None. No paid or live launch.
