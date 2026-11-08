# Review A: deploy-listener-ready

- Base: `67f0b262`. Reviewed head: `99a256a8` (clean worktree).
- Verdict: **nits**

## Verification evidence

- `akrogon verify` on `99a256a8` is green, run `bdb11347-c995-4410-a7f0-0668c3a812bd`: format 0, typecheck 0, test 0 (1316 pass, 70.15 s). Receipt in `issues/verify-runs.jsonl`.
- Criterion proofs on `99a256a8`, using the commands `plan.md` names: `check c1: 0`, `check c2: 0`, `check c3: 0`, `check c4: 0` (logs under `implementation/`). The code is unchanged since then, so I did not rerun them.
- Red-before evidence and the nine deliberate breaks V1-V9 are in `plan.md`. V1 is the brief's "plugin link left unconditional" break.

## Diff against plan and brief

- C1: `linkServices([])` in the deploy runs daemon-reload, then plugin link, with no enable, restart or unlink for a plugin release without the unit. Install runs daemon-reload, the integration installs in config order, then plugin link. Both match today's calls.
- C2: `deployStage` order is links → flip → `reload` → `record` → `restart` → `unlink` (`src/self-update.ts`). The unit link is planned from `listRoot`, the new release, before flip, and sourced through `current`. The unlink is guarded by `!shipsPlugin()` and `Bun.which('herdr', { PATH: process.env.PATH })`. The restart uses `--no-block` (D5).
- C3: `install()` calls the same three functions, so install and deploy cannot drift apart.
- C4: `prefixes` is optional with the two-lowercase regex. I checked every other reader of the machine `config.yaml`. `src/state-home.ts:76-82` rewrites it through a `looseObject`, which keeps the key. `src/init.ts:86` spreads the parsed config, which also keeps it. No skill script parses it. So "every command behaves as without it" holds beyond `config` and `init`.
- C5: 70.15 s against the 75 s baseline is recorded in the report.
- Design exclusions hold. No rollback guard, no listener program, no prefix uniqueness and no live run.
- No Grants and no paid activity. Nothing to audit for counts.

## Docs

- The changed behavior is documented in `docs/reference/releases-and-updates.md:42,50-52`, `docs/start/install.md:74-77` and `docs/reference/config.md` (`prefixes` row and example). Each matches the code.
- `docs/use/roll-back-a-release.md:17,53` ("plugin links") is unchanged and still correct, because rollback targets before the cutover have `plugin/`.
- AREA path listing (one command over `src/AREA.md` and `tests/AREA.md`). Every named path exists except `issues/`, `issues/closed`, `issues/timings.jsonl`, `issues/verify-runs.jsonl`, `issues/config.yaml` and `issues/merge-attempts.jsonl`. Those live in the registered checkout (checked to exist there), worktrees carry no `issues/`, and they predate this diff. Not a defect. Both files are 40 lines with the four required sections.

## Tests

- The deploy and install tests run at the real boundary: `selfUpdate` and `deployStage` in-process on the deploy fixture, and the `akrogon install` and `config`/`init` CLI. Only systemctl and herdr are faked, at the process boundary, as the standing design says. Nothing mocks the unit under test.
- `tests/deploy-shapes.test.ts` changes `process.env` only inside `test.serial` cases, the same way `tests/install.test.ts:441-470` already does.
- The fake changes only add behavior. `fake-systemctl.sh` appends `record=` only when `FAKE_DEPLOY_RECORD` is set, and `fake-herdr.ts` gains a strict `plugin unlink akrogon` handler. No existing expectation changed.

## Fixes

None.

## Nits

- N1. Whether `herdr plugin unlink akrogon` succeeds while the old herdr binary is installed but its server is stopped has not been observed. P13 ran on the operator's live install, and the server state there is not recorded. If unlink then exits non-zero, every deploy of a release without `plugin/` records `deploy failed: unlink` and retries at each trigger, until the binary is removed (cutover removal step 5). The failure is loud, the record and the listener restart already ran, and the realistic window is short. Deferred because no source shows the failure. It becomes a Fix with real output of `herdr plugin unlink <id>` exiting non-zero with no herdr server running.
- N2. `linkServices` takes the harness kinds as data, and the deploy passes `[]` to keep today's deploy, which never ran integration installs. That is readable, but a future caller could pass `[]` by mistake and skip the integration installs. Deferred because no caller does so today. It becomes a Fix if a caller other than the deploy passes `[]`.

## Operator actions

None.
