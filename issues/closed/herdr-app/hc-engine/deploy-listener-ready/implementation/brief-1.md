# Brief 1: deploy and install by release shape (U1)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/deploy-listener-ready-u1` (detached at 6d6af827). Install dependencies there first: `bun install --frozen-lockfile --backend=copyfile`.

## 1. Goal

Deploy (`deployStage` in `src/self-update.ts`) and `akrogon install` (`install` in `src/install.ts`) handle both release shapes. A release with `plugin/` runs today's calls. A release without `plugin/` makes no `herdr plugin link` or `herdr integration install` call and unlinks the old plugin last. A release that ships `systemd/akrogon-listener.service` gets the unit linked, enabled and restarted, with the deploy's restart after the deploy record. Plan decisions D1-D6 and D9.

## 2. Acceptance criteria

1. Plugin release, no unit: the deploy calls exactly `systemctl --user daemon-reload`, then `herdr plugin link <current>/plugin`, and records success. Install calls exactly daemon-reload, `herdr integration install <kind>` per harness in config order, then plugin link.
2. Release without `plugin/`, with the unit: the deploy links `~/.config/systemd/user/akrogon-listener.service` → `<current>/systemd/akrogon-listener.service`, then runs daemon-reload, `systemctl --user enable akrogon-listener.service`, writes the record, runs `systemctl --user restart --no-block akrogon-listener.service`, and last `herdr plugin unlink akrogon`. The unlink is skipped when no `herdr` is on `process.env.PATH`.
3. Install from that shape makes the same calls: daemon-reload, enable, restart `--no-block`, unlink (skipped without `herdr`). It exits 0 with no `herdr` on PATH.

The planned tests are committed already. Do not write or edit them:
- `tests/deploy-shapes.test.ts` (3 cases)
- `tests/install.test.ts` cases "install from a plugin release…", "install from a listener release links…" and "install from a listener release succeeds with no herdr binary on PATH"
- fakes `tests/fake-herdr.ts` (`plugin unlink akrogon` handler) and `tests/fake-systemctl.sh` (optional `record=` suffix)

They are red now except the two plugin-release cases.

## 3. Read first

- `src/install.ts` (whole file), `src/self-update.ts:215-312`, `src/release.ts:86-130`, `src/shell.ts:69-82` (`spawnCaptured`), `CommandError` in `src/shell.ts`.
- Pattern to copy: the conditional `mods` plan in `planSkillLinks` (`existsSync(resolve(listRoot, 'herdr-app'))`) for the conditional unit link. The deploy's `env: process.env` spawn at `src/self-update.ts:275-288` for the call helper.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

`src/install.ts`:
- `const listenerUnit: string = 'akrogon-listener.service';`
- In `planSkillLinks`, add to `planned`, only when `existsSync(resolve(listRoot, 'systemd', listenerUnit))`: `{ source: resolve(sourceRoot, 'systemd', listenerUnit), destination: resolve(home, '.config/systemd/user', listenerUnit) }`. Leave `staleIn` alone. It never scans `.config/systemd/user` (D6).
- Private `shipsPlugin()` returns `existsSync(resolve(currentLink(), 'plugin'))`. Private `shipsListener()` returns `existsSync(resolve(currentLink(), 'systemd', listenerUnit))` (D1: read from `current` at call time).
- Private `call(argv: string[]): Promise<void>` runs `spawnCaptured(argv, { env: process.env })` and throws `new CommandError(argv, process.cwd(), result)` on a non-zero exit. Move the deploy's existing `env: process.env` comment here.
- `export async function linkServices(kinds: string[]): Promise<void>`: runs daemon-reload. If `shipsPlugin()`, it runs `herdr integration install <kind>` for each kind, then `herdr plugin link <current>/plugin`. If `shipsListener()`, it runs `systemctl --user enable akrogon-listener.service`.
- `export async function restartListener(): Promise<void>`: if `shipsListener()`, runs `systemctl --user restart --no-block akrogon-listener.service`. Add one comment: `--no-block` returns once the job is queued, so a caller inside the unit is not stopped while systemctl waits (D5).
- `export async function unlinkPlugin(): Promise<void>`: if `!shipsPlugin() && Bun.which('herdr', { PATH: process.env.PATH }) !== null`, runs `herdr plugin unlink akrogon`. `Bun.which` needs the explicit PATH, because without it Bun reads the startup PATH.
- `install()`: after `applySkillLinks(links)`, replace the three `command(...)` lines with `await linkServices(Object.keys(global.harnesses)); await restartListener(); await unlinkPlugin();`. Drop the `command` import if it becomes unused.

`src/self-update.ts` `deployStage`:
- Replace the whole `step('reload', async () => {...})` body with `await step('reload', () => linkServices([]));`. The deploy passes no kinds because it never ran integration install.
- After the `record` step, add `await step('restart', () => restartListener());` and `await step('unlink', () => unlinkPlugin());`, before the `return`.
- Drop the now-unused `spawnCaptured` and `SpawnResult` imports.

Docs, one edit each:
- `docs/reference/releases-and-updates.md:42`: the deploy relinks the Herdr plugin only for a release with `plugin/`, enables the listener unit when the release ships it, writes `deploy.yaml`, then restarts the listener, and last unlinks the plugin when the release has no `plugin/` and `herdr` is installed.
- `docs/reference/releases-and-updates.md:50`: the step list gains `restart` and `unlink`. The sentence at `:52` about failures after `flip` names `reload`, `record`, `restart` and `unlink`.
- `docs/start/install.md:65-76`: the `~/.config/systemd/user/akrogon-listener.service` link when the release ships the unit, then enable and restart. The Herdr plugin link and `herdr integration install` happen only for a release with `plugin/`. Otherwise install unlinks akrogon's plugin from Herdr when `herdr` is installed.
- `src/AREA.md:12`: the plan also links the listener unit when the release ships one, and `install` and `deployStage` share the service calls (`linkServices`, `restartListener`, `unlinkPlugin`). Keep the file at most 40 lines.
- `tests/AREA.md` Key files: one line, "`tests/deploy-shapes.test.ts` runs `selfUpdate` in-process on the deploy fixture so PATH can drop herdr; systemctl and herdr log to one file to show call order."

Owned paths: `src/install.ts`, `src/self-update.ts`, `docs/reference/releases-and-updates.md`, `docs/start/install.md`, `src/AREA.md`, `tests/AREA.md`. Prerequisites: none. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not edit any test or fake. The tests are the locked proof. A red or wrong planned test is a mismatch you return with output.
- Do not touch `src/config.ts` or `docs/reference/config.md`. Another worker owns them in parallel.
- Do not add integration install to the deploy, retries, or a fallback when `herdr` fails for a plugin release. Today's failure behavior stays.
- Do not change `staleIn`, rollback or the record logic.
- Do not stop processes by pattern.

Reasons and exceptions: tests and the other unit's paths are outside this unit's scope, and today's plugin-release behavior is locked by brief criterion 1. The only exception is a revised brief from A.

## 6. Ordered steps

1. `src/install.ts` per section 4 (criteria 1-3).
2. `src/self-update.ts` per section 4 (criteria 1-2).
3. Run the section 7 commands until green.
4. Docs per section 4.
5. `bunx prettier --check src tests` and `bun run typecheck` must pass.
6. Commit with message `deploy, install: relink plugin and run listener unit by release shape`. No co-author line and no `Test-Change` trailer, because you change no test file.

Advisory size: 7 files, under 30 turns.

## 7. Commands

- `akrogon run-check --name u1-shapes -- bun test --timeout=30000 tests/deploy-shapes.test.ts tests/install.test.ts`
- `akrogon run-check --name u1-deploy -- bun test --timeout=30000 tests/release-deploy.test.ts tests/self-update.test.ts tests/rollback.test.ts`
- `akrogon run-check --name u1-typecheck -- bun run typecheck`

## 8. Done-when, evidence and report

All three commands exit 0, and the commit exists. Cite each `check <label>: <exit> <path>` line. Return the commit ID and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
