# Plan: deploy-listener-ready

Base: `AKROGON_BASE` 67f0b262. Worktree: `/home/ivan/.akrogon/worktrees/akrogon/deploy-listener-ready`.

## Read first

- `docs/reference-index.md`, `src/AREA.md:12-14` (install, deploy, rollback ownership), `tests/AREA.md:10` (deploy fixture).
- `src/self-update.ts:215-312` (`deployStage`: build, links, flip, reload, record), `src/install.ts:19-148` (`planSkillLinks`, `applySkillLinks`, `install`), `src/config.ts:23-36` (`globalSchema`), `src/release.ts:86-130` (deploy record), `src/rollback.ts` (calls `install()`).
- `tests/deploy-fixture.ts`, `tests/fake-systemctl.sh`, `tests/fake-herdr.ts:247-258`, `tests/install.test.ts:29-66` (`installEnv`, `expectedCalls`).
- `docs/reference/releases-and-updates.md:42-54`, `docs/start/install.md:60-76`, `docs/reference/config.md:21-45`.
- `learnings/LESSONS.md:21` (plugin hooks run with the plugin folder as cwd): context for why the deploy runs inside the plugin's `pull --all`. No lesson changes this plan.
- Gaps: none. The `lesson-rule.md` file the skill links (`/home/ivan/.claude/skills/lesson-rule.md`) is missing, and no lesson is written here.

## Decisions

- D1. Release shape is read from `current` at call time. `plugin` means `<current>/plugin` exists, and `listener` means `<current>/systemd/akrogon-listener.service` exists. In the deploy these reads happen after `flip`, so they see the new release. In `install` they see whatever `ensureCurrent` left.
- D2. `src/install.ts` holds the service calls, shared by deploy and install. There are three exported functions, each doing nothing when the shape does not apply:
  - `linkServices(kinds: string[])` runs `systemctl --user daemon-reload`. With `plugin` it then runs `herdr integration install <kind>` for each kind and `herdr plugin link <current>/plugin`. With `listener` it then runs `systemctl --user enable akrogon-listener.service`.
  - `restartListener()` runs `systemctl --user restart --no-block akrogon-listener.service` with `listener`.
  - `unlinkPlugin()` runs `herdr plugin unlink akrogon` when there is no `plugin` and `Bun.which('herdr', { PATH: process.env.PATH })` finds a binary.
  - Every call goes through one private helper: `spawnCaptured(argv, { env: process.env })`, throwing `CommandError(argv, process.cwd(), result)` on a non-zero exit. `env: process.env` is the deploy's existing rule (`src/self-update.ts:275-277`), now shared by install.
- D3. Deploy order: build, links, flip, `reload` = `linkServices([])`, `record`, `restart` = `restartListener()`, `unlink` = `unlinkPlugin()`. Each is its own `step(...)`, so a failure records `step: restart` or `step: unlink`. The deploy passes no harness kinds because today's deploy never runs `herdr integration install` (brief B). A plugin release with no unit therefore runs exactly today's calls: daemon-reload, then plugin link.
- D4. Install order: prune, conflicts, `applySkillLinks`, `linkServices(Object.keys(global.harnesses))`, `restartListener()`, `unlinkPlugin()`. A plugin release with no unit makes exactly today's calls. Install writes no record, so the restart follows the enable directly.
- D5. Answers design Open 1. The restart is `systemctl --user restart --no-block akrogon-listener.service`. `--no-block` returns once systemd has queued the job, so a deploy running inside the listener's own cgroup is not stopped while systemctl waits for the stop. The record is already written by then, so a deploy stopped right after the restart is complete (resume path `src/self-update.ts:246`). The engine leaf's self-update-through-the-listener proof exercises the live case.
- D6. Answers design Open 2. `planSkillLinks` adds one link, `<sourceRoot>/systemd/akrogon-listener.service` to `~/.config/systemd/user/akrogon-listener.service`. It is planned only when the file exists under `listRoot`, which is the new release dir during the deploy, the same way `herdr-app` mods are planned. Conflict handling is the slice's. Traced `staleIn` (`src/install.ts:60-77`): it scans only the four skill roots and `~/.config/herdr-app/mods`, never `~/.config/systemd/user`. So neither the slice nor the unit link is ever pruned, with or without the unit. A unit link left behind after a rollback to a unit-less release falls to engine-on-hc's rollback guard (design exclusion).
- D7. `globalSchema` gains `prefixes: z.record(text, z.string().regex(/^[a-z]{2}$/, 'prefix must be two lowercase letters')).optional()`. It is optional, not `.default({})`. `akrogon init` spreads the parsed config back into the file (`src/init.ts:86`), so a present map is kept, and an absent one stays absent: `Bun.YAML.stringify` drops `undefined` keys, checked in a scratch run. A bad value is refused by `readGlobal` with `Invalid <file>:` and the zod issue path `["prefixes","<key>"]`. Keys are not checked against `repos`, and uniqueness is not checked: both are engine-on-hc's (design exclusion).
- D8. "Every command behaves as without it" is read as: every command parses the file through `readGlobal` and ignores the key, and `akrogon config` prints it because it prints the parsed global config (`src/config.ts:447`). The proof compares `config` output with and without the map, and the only difference allowed is the `prefixes` key.
- D9. This leaf's own release keeps `plugin/` and ships no unit, so its own deploy runs today's calls (cutover Q1).

Brief and design agree. No conflict note.

## Interfaces

- Unit source `<release>/systemd/akrogon-listener.service`, linked to `~/.config/systemd/user/akrogon-listener.service` through `current`.
- systemctl calls: `--user daemon-reload`, `--user enable akrogon-listener.service`, and `--user restart --no-block akrogon-listener.service`.
- herdr calls: `integration install <kind>` and `plugin link <current>/plugin` only with `plugin/`. Without `plugin/`, `plugin unlink akrogon` runs when the binary is on PATH.
- Config: `prefixes: {<repo>: <two lowercase letters>}`, optional.
- Deploy failure steps gain `restart` and `unlink`.

## Waves

Two units with disjoint paths, no shared test resource and no ordering, so this is one wave of two. It is not serial-solo.

### Wave 1

- U1 deploy and install shapes. Owns `src/install.ts`, `src/self-update.ts`, `docs/reference/releases-and-updates.md`, `docs/start/install.md`, `src/AREA.md`, `tests/AREA.md`. Tests (already committed): `tests/deploy-shapes.test.ts`, `tests/install.test.ts`, `tests/fake-herdr.ts`, `tests/fake-systemctl.sh`. Shared test resource: none (each case builds its own temp fixture). Prerequisite: none.
  - [ ] D1-D6 in `src/install.ts` (`listenerUnit` constant, shape reads, `call`, `linkServices`, `restartListener`, `unlinkPlugin`, conditional unit link in `planSkillLinks`, `install` body).
  - [ ] D3 in `src/self-update.ts`: the reload step becomes `linkServices([])`, `restart` and `unlink` steps go after `record`, and the now-unused `spawnCaptured`/`SpawnResult` imports go. Install's `command` import goes if unused.
  - [ ] Criteria 1, 2, 3 green.
- U2 config prefixes. Owns `src/config.ts`, `docs/reference/config.md`. Test (already committed): `tests/config.test.ts`. Shared test resource: none. Prerequisite: none.
  - [ ] D7 in `globalSchema`.
  - [ ] Criterion 4 green.

### Docs (one line each)

- `docs/reference/releases-and-updates.md:42`: the deploy relinks the Herdr plugin only for a release with `plugin/`, enables the listener unit when shipped, restarts it after `deploy.yaml` is written, and last unlinks the plugin when the release has no `plugin/` and `herdr` exists. `:50`: the step list gains `restart` and `unlink`. (U1)
- `docs/start/install.md:65-76`: the unit link when the release ships it, the enable and restart, plugin and integration calls only for a release with `plugin/`, and the unlink otherwise. (U1)
- `src/AREA.md:12`: the plan also links the listener unit when shipped, and install and deploy share the service calls. (U1)
- `tests/AREA.md`: one line for `tests/deploy-shapes.test.ts`. (U1)
- `docs/reference/config.md` machine table: a `prefixes` row (optional, two lowercase letters per repo name, unused by this release) and the example block. (U2)
- `docs/use/roll-back-a-release.md:17,53` ("plugin links") stays correct: a rollback target before the cutover has `plugin/`. No change.

## Criteria, observations and proofs

Runner for every proof: `bun test` (configured `test` check). Each command below runs through `akrogon run-check --name <label> -- <cmd>`.

### C1. Plugin release: today's steps in today's order, deploy recorded

- Boundary: `selfUpdate` → `deployStage` in-process on `tests/deploy-fixture.ts`, plus the `akrogon install` CLI, with systemctl and herdr faked at the process boundary. Both fakes append to one file (`FAKE_SYSTEMCTL_LOG` = herdr's `.calls`), so the order is observed directly.
- Before: none (regression guard). After: deploy calls exactly `[daemon-reload, plugin link <current>/plugin]` and records `{commit, ok: true}`. Install calls exactly `[daemon-reload, integration install claude, codex, pi, plugin link]`.
- Catches: listener or unlink calls leaking into a plugin release, or reordered calls.
- Tests: `tests/deploy-shapes.test.ts` "a plugin release deploys with only the reload and plugin link calls, in that order", and `tests/install.test.ts` "install from a plugin release makes only the reload, integration and plugin link calls, in that order". Existing guards still apply: `tests/release-deploy.test.ts:193`, and `tests/install.test.ts` "install creates all four absent harness roots…" (exact herdr calls).
- Command: `bun test --timeout=30000 tests/deploy-shapes.test.ts tests/install.test.ts -t 'plugin release'`. Size: seconds. Rerun when `src/install.ts`, `src/self-update.ts` or either fake changes.
- Condition "a plugin release makes no unlink" (D2 `unlinkPlugin` guard). Break V6 (unlink without the `!plugin` guard) turned both cases red, each showing an extra `+ "["plugin","unlink","akrogon"]"` (`check break-V6: 1 …/implementation/check-break-V6-1794061632956-3080704.log`).
- At base both cases pass, which is expected for a regression guard: `check red-deploy-shapes: 1 …/check-red-deploy-shapes-1794061557339-3053730.log` (case 1 pass) and `check red-install: 1 …/check-red-install-1794061562364-3056580.log` (plugin case pass).

### C2. Release without `plugin/`, with the unit: deploy order and calls

- Boundary: as C1, in-process `selfUpdate`. `FAKE_DEPLOY_RECORD` makes fake systemctl log `record=yes|no`, which says whether `deploy.yaml` existed at each call. The case removes `deploy.yaml` after the first (plugin) deploy, so `record=yes` can only come from this deploy's success write.
- Before: a plugin release is active. After: the unit link is `<home>/.config/systemd/user/akrogon-listener.service` → `<home>/current/systemd/akrogon-listener.service`, resolving into `releases/<sha>`. Calls are exactly `[daemon-reload record=no, enable record=no, restart --no-block record=yes, plugin unlink akrogon]`, and the record is `{commit: sha, ok: true}`. With `herdr` off PATH (PATH = fake bin plus a dir holding only `git` and `tar`), calls are exactly `[daemon-reload, enable, restart]` and the deploy succeeds.
- Catches: brief B (the deploy failing on `herdr plugin link`), the restart before the record, the unlink before the restart, a missing `herdr` failing the deploy, the unit not linked.
- Tests: `tests/deploy-shapes.test.ts` "a listener release links and enables the unit, records, restarts it, then unlinks the plugin", and "a listener release deploys with no herdr binary on PATH and skips the unlink".
- Command: `bun test --timeout=30000 tests/deploy-shapes.test.ts -t 'listener release'`. Size: seconds. Rerun as C1.
- Red at base, from the missing behavior: the link is absent (`ENOENT … akrogon-listener.service`), and the no-herdr case reads `deploy failed: reload: Executable not found in $PATH: "herdr"` (`check red-deploy-shapes: 1 …/check-red-deploy-shapes-1794061557339-3053730.log`).
- Conditions, each broken in a scratch build of D1-D7 that was discarded before the test commit (scratch green: `check scratch-green: 0 …/check-scratch-green-1794061612843-3061646.log`, 97 pass, including `release-deploy`, `self-update` and `rollback`):
  - No plugin link without `plugin/` (D2, the brief's deliberate break). V1 (link left unconditional) turned both cases red: `+ "["plugin","link",…/current/plugin]"`, and the no-herdr case failed. `check break-V1: 1 …/check-break-V1-1794061630522-3077412.log`.
  - The record is written before the restart (D3). V2 (restart moved before record) turned it red: `- …restart --no-block … record=yes`, `+ … record=no`. `check break-V2: 1 …/check-break-V2-1794061631060-3078093.log`.
  - The unlink runs only after the restart (D3). V3 (unlink before restart) turned it red: the unlink line sits above the restart line. `check break-V3: 1 …/check-break-V3-1794061631606-3078836.log`.
  - The unlink is skipped without `herdr` (D2). V4 (no `Bun.which` guard) turned it red: `deploy failed: unlink: Executable not found in $PATH: "herdr"`. `check break-V4: 1 …/check-break-V4-1794061632147-3079476.log`.
  - The shape is read from the new `current` (D1). V8 (plugin probed at `toolRoot`, which has `plugin/`) turned it red: an extra plugin link and the unlink missing. `check break-V8: 1 …/check-break-V8-1794061633850-3081531.log`.
  - The unit link is planned from the new release before flip (D6). V9 (probe at `sourceRoot` = old `current`) turned it red: `ENOENT … akrogon-listener.service`. `check break-V9: 1 …/check-break-V9-1794061634391-3082228.log`.
  - The unit is linked before enable: traced, no case. The `links` step runs before `flip`, which runs before `reload` (`src/self-update.ts:256-274`), and nothing between them removes links.
  - A failure after the record is retried: traced, no case. `writeDeployFailure` keeps `commit` and `previous` (`src/release.ts:121-130`). The next trigger sees `resuming` with `ok: false`, reruns links through unlink with the same `previous` (`src/self-update.ts:293`), and both systemctl calls and the herdr unlink are idempotent (P13). A deploy stopped inside the unlink has already recorded success, and the resume path returns at `:246`.

### C3. `akrogon install` from either shape makes the deploy's plugin, integration and unit calls, and succeeds without `herdr`

- Boundary: the `akrogon install` CLI with the faked process boundary, and `current` pointed at a release dir with or without `plugin/` and the unit.
- After: plugin shape as C1. Listener shape: unit link through `current`, calls exactly `[daemon-reload, enable, restart --no-block, plugin unlink akrogon]`. With PATH = the fake bin with herdr removed: exit 0 and calls exactly `[daemon-reload, enable, restart --no-block]`.
- Catches: the integration loop or plugin link running for a release without `plugin/`, and install failing once old herdr is removed (brief B).
- Tests: `tests/install.test.ts` "install from a listener release links, enables and restarts the unit, then unlinks the plugin", and "install from a listener release succeeds with no herdr binary on PATH", plus the C1 plugin case.
- Command: `bun test --timeout=30000 tests/install.test.ts -t 'install from a'`. Size: seconds. Rerun as C1.
- Red at base: the unit link is absent, and the no-herdr case exits 1 with `Executable not found in $PATH: "herdr"` at `src/install.ts:146` (`check red-install: 1 …/check-red-install-1794061562364-3056580.log`).
- Condition "no integration install without `plugin/`" (D2). V5 (loop unconditional) turned both listener cases red: `+ "["integration","install","claude"]"`, and the no-herdr case exited 1. `check break-V5: 1 …/check-break-V5-1794061632502-3080114.log`. V1 also turned both red (above).

### C4. `prefixes:` parses, commands are unchanged, and a bad prefix is refused naming the key

- Boundary: the `akrogon config` and `akrogon init` CLI over a real machine `config.yaml`.
- Before: no `prefixes`. After: `config` output equals the no-map output plus `prefixes: {repo: rp}` (D8). `init` rewrites the file and keeps the map. Each of `RP`, `r`, `rpx`, `r1` under key `framework` makes `config` exit non-zero, with stderr naming `prefixes` and `framework`.
- Catches: the strict schema refusing the key before the switch, init dropping it, and bad prefixes accepted.
- Test: `tests/config.test.ts` "machine config accepts a prefixes map without changing commands and refuses a bad prefix naming its key".
- Command: `bun test --timeout=30000 tests/config.test.ts -t prefixes`. Size: seconds. Rerun when `src/config.ts` or `src/init.ts` changes.
- Red at base: `expect(after.code).toBe(0)` received 1, because the strict schema refuses `prefixes` (`check red-config: 1 …/check-red-config-1794061562657-3057085.log`).
- Condition "a non-two-lowercase value is refused" (D7). V7 (regex removed) turned it red: `expect(refused.code).not.toBe(0)` failed for `RP`. `check break-V7: 1 …/check-break-V7-1794061633313-3081180.log`.
- "Every command" traced: every command reads the file only through `readGlobal` → `globalSchema`. `init` is the only writer, and its spread keeps the key.

### C5. Test duration recorded

- The implementation report records the leaf's verify `test` duration and today's baseline (median 75 s, `issues/verify-runs.jsonl`), and explains a rise of more than about 10 s. Observed by `akrogon verify` at implement. The new cases ran in under 1 s per file at planning (`deploy-shapes` 435 ms for 3 cases), so no rise is expected.

## Limitation kept open

- When a deploy runs inside the listener's own cgroup (the engine's listener running `pull --all`), the `--no-block` restart can stop that deploy right after the record, before `unlinkPlugin`. The engine release's first deploy runs from the old plugin's process, not the listener, so its unlink runs. A later deploy from inside the listener has nothing left to unlink. The engine leaf's self-update proof exercises this.
- `systemctl --user enable` on a unit file that is a symlink into `current` is not exercised live here, because no real systemctl runs (standing design). The engine leaf's live run proves it.

## Grants and live actions

No `grants`, `inputs` or `produces`. No paid or live launch, so there are no count lines. `akrogon status` lists no `Missing:` names, and the design names no credential.
