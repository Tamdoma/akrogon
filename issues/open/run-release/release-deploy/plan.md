# Plan: release-deploy

## Decisions

- D1. Akrogon-repo identity is the registered name: `repo.name === 'akrogon'` marks the akrogon workspace (the design's "registered identity"). Replaces `realpathSync(repo.root) === toolRoot`. `selfUpdate(repo, home?)` drops its `ownRoot` parameter; own-detection is internal.
- D2. Release layout lives in the state home `globalHome()`: `releases/<full sha>` directories, `current` symlink, `deploy.yaml` record, `release-hold.yaml` hold record. `globalHome()` already resolves `AKROGON_HOME` else `~/.akrogon` (with the tracked `toolRoot/config.yaml` fallback while the workspace still carries state; it vanishes with the door step).
- D3. Every link points into `current`, never into a release folder: `current/src/akrogon.ts`, `current/skills/<name>`, `current/systemd/akrogon.slice`, `current/plugin` (herdr link). One pointer flip atomically moves all links; add/remove leaves nothing dangling. `install()` creates `current` targeting the running `toolRoot` when absent (workspace runs through `current` until the first deploy).
- D4. Deploy trigger is target-vs-current, not checkout state: deploy runs for the akrogon repo after the records stage whatever its outcome, whenever `git rev-parse refs/remotes/<remote>/<default_branch>` differs from the commit under `current`. First new-code pass deploys even when the workspace already sits at the merged commit (design open question: confirmed by construction).
- D5. Build: `git archive --format=tar -o <tmp>.tar <sha>` from the repo's object store, `tar -xf` into `releases/.build-<sha>` (dot-name so pruning skips it), `bun install --frozen-lockfile` (`process.execPath`) inside it, then `rename` to `releases/<sha>`. A pre-existing `releases/<sha>` is reused as complete (crash-recovery idempotent). `.build-*` leftovers are deleted at deploy start. Never read from the working tree.
- D6. Flip: `symlinkSync(releases/<sha>, releases/.next-<sha>)` then `renameSync` onto `current` (atomic replace on same filesystem). Then link sync (`planSkillLinks`/`applySkillLinks`), `herdr plugin link`, `systemctl --user daemon-reload`. Then write `deploy.yaml` and prune.
- D7. Deploy record `<stateHome>/deploy.yaml`: `{commit, previous, ok: true, at}` on success; `{attempted, step, error, at}` on failure. Written last on success so a crash mid-sync reads as a failed deploy. Step names: `fetch`, `resolve`, `archive`, `install`, `flip`, `links`, `reload`, `record`. Prune stamps `replaced` per release name in the same file.
- D8. `akrogon status` prints one deploy line before the repo scan block when `deploy.yaml` holds `ok: false` and its `attempted` differs from the current release commit: `deploy failed: attempted <sha12>, active <sha12|none>, step <step>: <error>`. Cleared by the next successful deploy overwriting the record.
- D9. Hold: `<stateHome>/release-hold.yaml` `{commit: <sha>}`. Deploy resolves the tracking sha first; when it equals the held commit the pass prints `deploy held: <sha12> (rollback hold)` and stops. The file is deleted when a different commit deploys. release-rollback owns writing it.
- D10. Link ownership: a symlink target is owned when it resolves under `current`, under `releases/*/`, under `toolRoot`, or under the registered `akrogon` workspace root. Owned links pointing anywhere but the planned `current` source are repointed silently (this is the no-hand-step switch); a non-symlink or a symlink to a foreign path stays a conflict. An owned link is unlinked when its target is missing or resolves under `releases/` (a specific release dir, always transient); unplanned links into the workspace or `current` are left alone.
- D11. `planSkillLinks(home, sourceRoot, ownedRoots: string[])`; `applySkillLinks` unchanged. `ownedRoots` = `[currentLink(), releasesDir(), toolRoot]` plus the registered `repos['akrogon']` workspace root when registered. Callers: `install()` and the deploy stage pass the same list; `current` already points at the new release at deploy time.
- D12. `install()` links `current/*` sources after ensuring `current` (workspace or existing release). On a consumer host without the akrogon repo, `install` works as today via D3.
- D13. seed-issue root lookup replaces `git rev-parse` with the registry: the `akrogon` entry of the `repos:` map in the state-home config (`~/.akrogon/config.yaml`, or `AKROGON_HOME` when set), falling back to `git rev-parse` on the resolved command path only when no `akrogon` entry exists (development checkout where `.git` exists).
- D14. Output line: `deployed <sha12>` alone, or appended `; switched from checkout to release` when `current` previously resolved to a workspace checkout. Failure: `deploy failed: <step>: <error>; retried at the next trigger`. Both join the existing per-repo line after the git-stage text.
- D15. Design/brief conflict noted for review: the design text says the merge-issue lesson helper and chart-issues check "import `src/*.ts` from the release". They import through `current`, which is the correct contract (a path into one release folder would rot on the next deploy); only the seed-issue root lookup actually breaks (no `.git` in a release).

## Read-first

- `docs/reference-index.md` -> `src/AREA.md`, `tests/AREA.md`
- `src/self-update.ts` — `selfUpdate`, `installStage`, install lock (`git rev-parse --git-path akrogon-install.lock`)
- `src/install.ts` — `planSkillLinks`, `applySkillLinks`, `install`
- `src/config.ts` — `toolRoot`, `globalHome`, `readGlobal`, `within`
- `src/status.ts` — `statusCommand` overview block (~line 416-446)
- `src/state-home.ts` — `migrateStateHome`, state-home resolution pattern
- `src/state.ts` — `withLock`
- `src/shell.ts` — `command`, `run`, `spawnCaptured`, `quote`, `writeYaml`
- `tests/helpers.ts` — `fixture`, `cli`, `fakeHerdr`, `yaml`
- `tests/self-update.test.ts` — `selfUpdateFixture`, seed/remote/clone layout
- `tests/install.test.ts` — install env, `calls`, link assertions to update
- `tests/fake-systemctl.sh`, `tests/fake-herdr.ts`
- `skills/seed-issue/SKILL.md` (line ~26 root lookup), `skills/chart-issues/SKILL.md` (~77 root resolution), `skills/merge-issue/SKILL.md` (~64 helper)
- `README.md` ~82, `docs/guide/install.md` ~37-41, `docs/guide/create.md` ~90

## Interfaces

- `src/release.ts` (new): `stateHome()`, `releasesDir()`, `currentLink()`, `deployRecordPath()`, `releaseHoldPath()`, `ensureCurrent()`, `deploy(repo, home) -> DeployOutcome`, `prune(now)`, `readDeployRecord()`.
- `src/install.ts`: `planSkillLinks(home, sourceRoot, ownedRoots)`, `applySkillLinks`, `install` (unchanged signature, new internals).
- `src/self-update.ts`: `selfUpdate(repo, home?)`; internal `deployStage` calling `release.deploy` under the existing `akrogon-install.lock` lock when own.
- `src/status.ts`: reads `deploy.yaml`, prints the D8 line.
- Tests: `tests/release-deploy.test.ts` (new), updates in `tests/install.test.ts` and `tests/self-update.test.ts` where they pin checkout-pointing links or the `ownRoot` parameter.

## Waves

Wave 1 (parallel, 2 units):
- U1 `src/release.ts`, `src/config.ts` (none needed; `globalHome` reused): release dir build/flip/prune/hold/record. Owns `src/release.ts`. Tests: none unit-level; proven by C1-C8 CLI tests.
- U4 docs + skills: `skills/seed-issue/SKILL.md` (D13), `skills/chart-issues/SKILL.md` (root = `dirname(dirname(readlink -f $(command -v akrogon)))`), `README.md`, `docs/guide/install.md`, `docs/guide/create.md` akrogon-checkout wording. Owns those files only. No dependencies.

Wave 2 (parallel, 2 units; needs U1's `current` layout):
- U2 `src/install.ts` + `tests/install.test.ts` link-target updates (D3, D10, D11).
- U3 `src/status.ts` deploy-failure line (D8). Needs `readDeployRecord` shape from U1 — implemented against this plan's D7 contract.

Wave 3 (1 unit):
- U5 `src/self-update.ts` deploy orchestration (D1, D4, D14) + `tests/self-update.test.ts` signature/link updates + `tests/release-deploy.test.ts` wiring refinements if the committed tests need fixture adjustments. Owns `src/self-update.ts`, `tests/self-update.test.ts`, `tests/release-deploy.test.ts`. Needs U1 (deploy) and U2 (link sync call) landed.

## Criterion proofs

Each runs `akrogon run-check --name <label> -- bun test tests/release-deploy.test.ts -t '<name>'` (existing runner, no new machinery). Fixture: `tests/helpers.ts` `fixture()` repo upgraded to akrogon shape (`src/akrogon.ts` printing `release`, `src/config.ts` and `src/lessons.ts` stub modules, `skills/skill-one`, `systemd/akrogon.slice`, `plugin/`, `package.json` + committed `bun.lock`), remote moved via a second seed clone, fakes via `fake-systemctl.sh`/`fake-herdr.ts`. All tests in `tests/release-deploy.test.ts`, `test.serial`, all shown red on the base commit (logs cited below under implementation/).

Red results (all exit 1):
- C1 `check deploy-build-flip: 1 implementation/check-deploy-build-flip-1792114098447-2627026.log`
- C2 `check deploy-dirty-workspace: 1 implementation/check-deploy-dirty-workspace-1792114102827-2629124.log`
- C3 `check deploy-links-current: 1 implementation/check-deploy-links-current-1792114102794-2629126.log`
- C4 `check deploy-failure-record: 1 implementation/check-deploy-failure-record-1792114108531-2632132.log`
- C5 `check deploy-prune: 1 implementation/check-deploy-prune-1792114108688-2632134.log`
- C6 `check deploy-first-switch: 1 implementation/check-deploy-first-switch-1792114108553-2632136.log`
- C7 `check deploy-skill-resolution: 1 implementation/check-deploy-skill-resolution-1792114113841-2635242.log`
- C8 `check deploy-hold: 1 implementation/check-deploy-hold-1792114113911-2635244.log`

- C1 "deploy builds and flips" — `cli(f, ['next','--all'])`; observe: `current` symlink -> `releases/<sha>`; `releases/<sha>/src/akrogon.ts` + `node_modules` exist; no `.build-*` remains; stdout contains `deployed <sha12>`. Size: minutes (bun install). Rerun: any deploy-logic or fixture change.
- C2 "dirty workspace edit stays pending, deploy proceeds" — incoming commit plus dirty `src/akrogon.ts` in the clone; observe: stdout contains `checkout pending` AND `deployed`; `bun $(readlink current)/src/akrogon.ts` prints `release` not `edited`; clone HEAD unmoved. Today: red — no deploy, printed link target is the checkout file. Size: minutes. Rerun: deploy or moveCheckout changes.
- C3 "all links resolve through current; add/remove leaves nothing dangling" — pre-seed stale `skill-removed` links under each root pointing into `releases/<old>`; deploy a commit adding `skill-two`, removing `skill-one`; observe: every destination's `readlink` starts with `<home>/current/` and realpaths into `releases/<sha>`; `skill-removed` and `skill-one` destinations are gone; CLI, slice and herdr `plugin link` argument all under `current`. Today: red — links point at the checkout. Size: minutes. Rerun: link planning changes.
- C4 "failed install keeps current and reports" — push commit with `bun.lock` removed; observe: `current` still at old sha; `deploy.yaml` records step `install`; stdout `deploy failed: install`; `cli(f, ['status'])` prints `deploy failed: attempted <sha12>, active <sha12>, step install`; next pass after restoring the lockfile deploys and clears the line; no `.build-*` and no half folder in `releases/`. Today: red — no deploy stage/record/status line. Size: minutes. Rerun: deploy failure or status changes.
- C5 "prune keeps current and previous, deletes replaced >24h" — deploy c0, c1, c2; rewrite `deploy.yaml` `replaced[c0]` to 25h ago; deploy c3; observe `releases/` = exactly `{c2, c3}` (c1 deleted despite a 26h stamp set at its own replace). Today: red — nothing is pruned/recorded. Size: minutes. Rerun: prune changes.
- C6 "first switch without a hand step" — pre-seed links as the old planner made them (direct into the clone, no `current`); run `next --all`; observe stdout `deployed` + `switched`; every destination repointed under `current`; no conflict error. Today: red — no `current`, no switch. Size: minutes. Rerun: repoint rule changes.
- C7 "skill steps resolve the akrogon root" — after a deploy, assert `readlink -f $(command -v akrogon)` lands inside `releases/<sha>/src/akrogon.ts`; run the chart-issues-style import `bun -e "import('<root>/src/config.ts')"` with root=`dirname(dirname(resolved))`; run the merge-issue-style `import(resolved dirname + '/lessons.ts')`; assert `git -C <resolved> rev-parse` fails (no `.git`) and the documented seed-issue registry lookup (config repos entry whose root holds `src/akrogon.ts`) finds the clone. Today: red — `current`/releases don't exist; seed-issue's `git rev-parse` would fail on a release. Size: seconds. Rerun: skill resolution changes.
- C8 "hold record blocks the named commit" — deploy c0; write `release-hold.yaml` `{commit: c1}`; push c1, run `next --all`: observe `deploy held: <sha12>`, `current` unchanged; push c2, run again: `deployed <c2>`, hold file gone. Today: red — no hold mechanism. Size: minutes. Rerun: hold changes.

Docs affected: `skills/seed-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `README.md`, `docs/guide/install.md`, `docs/guide/create.md` (agent docs); `skills/merge-issue/SKILL.md` reviewed, contract already correct. Human docs: README/install/create.

## Implementation notes

2026-10-16, constraints the plan left open:

- `selfUpdate(repo, home = homedir())`: `ownRoot` param deleted; own-detection is `repo.name === 'akrogon'` (D1). Deploy orchestration (fetch sha, build, flip, link sync, herdr link, daemon-reload, record write) lives in `src/self-update.ts` under the existing `akrogon-install.lock`; `src/release.ts` owns filesystem mechanics only (build dir, flip, record, hold, prune, `ensureCurrent`, `readDeployRecord`) so `release.ts` never imports `install.ts` (no circularity).
- `deploy.yaml` shape: success `{commit, previous: <sha|null>, ok: true, at}`; failure `{attempted, ok: false, step, error, at}`; `replaced: {<sha>: <iso>}` merged across writes.
- `install()` calls `ensureCurrent()` (creates `current` -> `toolRoot` when absent) before planning links, so its sources are `current/*`.
- `switched` appends to the deploy line only when the pre-flip `current` target was not under `releases/`.
- The D8 status line prints in the overview form of `akrogon status` only (before the table), not under `status <slug>`.
- Expected edits to `tests/install.test.ts` and `tests/self-update.test.ts` (checkout-pointing link expectations, `ownRoot` call sites) are A's own commits under the plan's "update with stated reason" design line, carrying `Test-Change:` trailers citing that design text. Workers write and edit no test; worker units run `bun run typecheck` as their targeted check and A runs the real test files on the lane after picks land.

## Open risks / notes

- R1. `bun install --frozen-lockfile` in a release hits the bun cache; a cold cache on the real repo may take tens of seconds — acceptable inside the pass.
- R2. Flip precedes link sync by design (D6): a crash between them leaves `current` moved and `deploy.yaml` unwritten, so status reports it failed and the next pass re-syncs links. Self-healing, no stuck state.
- R3. `git archive` excludes `.gitignore`d files only via export-ignore attributes — this repo has no export-ignore rules; `issues/` content is archived (harmless, releases hold no state the command reads: config.yaml comes from the state home after state-home's cutover).
- R4. Deploy depends on the tracking ref after the records stage's fetch; when the workspace is detached the deploy still uses `refs/remotes/<remote>/<branch>` (deploy never reads checkout HEAD).
- Limitation kept: a process running from a replaced release over 24h can break (accepted in the fork).
