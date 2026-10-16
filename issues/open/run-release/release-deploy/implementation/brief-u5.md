# Brief u5: deploy stage in self-update

## 1. Goal

`src/self-update.ts`: split deploy from records (plan D1, D4, D14). The records stage is unchanged; the deploy stage runs for the akrogon repo after the records stage whatever its outcome.

## 2. Numbered acceptance criteria

1. `selfUpdate(repo: Repo, home: string = homedir())` — the `ownRoot` parameter is deleted. Own-repo detection is `repo.name === 'akrogon'`.
2. Deploy stage (new, replaces `installStage`) runs only for own repos, after `gitStage` returns — including when it returns `skipped` — but NOT when `gitStage` throws a fetch/push `CommandError` (that early-returns as today). A `record conflict:` message is captured, the deploy still runs, and the conflict text prefixes the printed line.
3. Deploy steps, each recorded by name on failure: `resolve` = `git fetch <remote> <branch>` + `git rev-parse refs/remotes/<remote>/<branch>^{commit}` in `repo.root`; `hold` = `readReleaseHold()` → when the held commit equals the resolved sha, print `deploy held: <sha12> (rollback hold)` inside the line and stop the deploy; `build` = `buildRelease(repo, sha)` — a thrown `CommandError` maps to step `archive` when its argv[0] is `git` or `tar`, else `install`; `flip` = `flip(sha)`; `links` = `planSkillLinks(home, currentLink(), ownedRoots)` + `applySkillLinks` (conflicts produce `links` failure naming each destination + `; remove the conflicting paths`, like the old `installStage`); `reload` = `spawnCaptured(['systemctl','--user','daemon-reload'])` and `command(['herdr','plugin','link', resolve(currentLink(),'plugin')])`; `record` = `writeDeploySuccess(sha, previous)` + `clearReleaseHold()` + `pruneReleases()`.
4. On any step failure: `writeDeployFailure(sha, step, describeError(error))` (use the step name when the failure is a conflicts list), return `deploy failed: <step>: <error>; retried at the next trigger`. Dispatch continues (the catch at `selfUpdate`'s top level stays for unexpected throws, but deploy failures are the recorded path, not the catch).
5. On success the deploy fragment is `deployed <sha12>` plus `; switched from checkout to release` when the pre-flip `currentReleaseCommit()` was `null` (missing, dangling, or workspace target). `previous` recorded = the pre-flip `currentReleaseCommit()`.
6. Deploy is skipped without output when `currentReleaseCommit() === sha` (already at target).
7. Line composition: the deploy fragment is appended to the git-stage fragment with `; `, preserving all existing texts (`pushed`, `deployed <old>..<new>` checkout move, `checkout pending`, `self-update skipped`, `current <sha>`). A `skipped` git stage still deploys. A non-own repo prints and does nothing new.
8. `ownedRoots` for the deploy-stage link sync = `[currentLink(), releasesDir(), toolRoot]` plus `realpathSync(expandPath(repo.root))` (the workspace).
9. Keep the install lock (`git rev-parse --git-path akrogon-install.lock`) wrapping the whole own-repo body exactly as today.
10. `src/AREA.md`: update the `self-update`/`install` mentions and add `src/release.ts` one line each — check `src/AREA.md` for the line describing install/self-update and make it say deploy builds releases behind `current`.

## 3. Read-first

- `src/self-update.ts` (whole file)
- `src/release.ts` — `buildRelease`, `flip`, `currentLink`, `currentReleaseCommit`, `releasesDir`, `readReleaseHold`, `clearReleaseHold`, `writeDeploySuccess`, `writeDeployFailure`, `pruneReleases`, `ensureCurrent` signatures
- `src/install.ts` — `planSkillLinks(home, sourceRoot, ownedRoots)`, `applySkillLinks`, `Link.repoint`
- `src/config.ts` — `toolRoot`, `expandPath`, `Repo`
- `tests/install.test.ts` self-update describe + `tests/self-update.test.ts` + `tests/release-deploy.test.ts` — the committed contract: expected stdout fragments (`deployed <sha12>`, `switched from checkout to release`, `deploy held: <sha12>`, `deploy failed: <step>`), `releases/` + `current` layout under the fixture home (`AKROGON_HOME`), fakes already in place
- skill folder `ponytail.md`

## 4. Change list and needed interfaces

Owns `src/self-update.ts` and `src/AREA.md`. The old `installStage` is deleted. `describeError`, `errorLine`, `paths`, `Move`, `gitStage`, `moveCheckout` stay. The deploy fragment is produced by a `deployStage(repo, home): Promise<string | null>` helper returning null when not-own or already-current, the held/deployed fragment on success, or `deploy failed: ...` on failure — appended to whatever the git stage produced.

`readGlobal()` inside deployStage for nothing — `ownedRoots` uses `repo.root` (criterion 8), not a registry lookup (repo IS the akrogon workspace).

## 5. Do-not, reasons and exceptions

- Do not touch `src/release.ts`, `src/install.ts`, `src/status.ts` — landed units; interface mismatch returns a mismatch.
- Do not touch any test file — tests are committed contracts; a red test is evidence, not something to edit.
- Do not weaken the records stage: `gitStage`, `moveCheckout`, the lock, and every existing line format stay.
- Do not swallow errors: step failures record `deploy.yaml` and surface as the `deploy failed` fragment; unexpected throws propagate to the existing outer catch.
- Do not run `bun install` in `repo.root` — installs happen inside the release staging dir only.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

## 6. Ordered steps

1. Read self-update.ts, release.ts, install.ts and the three test files' expectations (criteria 1-10).
2. Replace `installStage` with `deployStage`; rewire `selfUpdate` (criteria 1-9).
3. Update `src/AREA.md` (criterion 10).
4. Run `bunx prettier --write src/self-update.ts src/AREA.md` (AREA.md may be unchanged — check first).
5. Run `bun test tests/self-update.test.ts tests/install.test.ts tests/release-deploy.test.ts --timeout=30000` via `akrogon run-check` — everything must pass; a red is your code.
6. `bun run typecheck` — zero errors (the u2 arity gap is yours to close).

Advisory size: 2 files, ~120 lines changed, under 25 turns.

## 7. Commands

- `bun install --frozen-lockfile` first (worktree has no node_modules).
- `akrogon run-check --name deploy-tests -- bun test tests/self-update.test.ts tests/install.test.ts tests/release-deploy.test.ts --timeout=30000`
- `akrogon run-check --name typecheck -- bun run typecheck`
- `akrogon run-check --name prettier -- bunx prettier --check src tests`

## 8. Done-when, evidence and report

All three test files pass, typecheck and prettier clean. Keep command output through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line; `akrogon log <path>` reads a cited log. Commit only `src/self-update.ts` and `src/AREA.md`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
