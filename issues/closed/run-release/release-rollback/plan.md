# Plan: release-rollback

`akrogon rollback` flips `~/.akrogon/current` to the recorded previous release, writes the hold that blocks redeploy of the rolled-away commit, and restores that release's links through the existing `install()` link step. All deploy machinery it consumes (release build, `flip`, deploy record, hold reader, link step, prune) already landed with release-deploy and state-home on this base.

## Read first

- `src/release.ts` — `releasesDir`, `currentLink`, `currentReleaseCommit`, `flip`, `readDeployRecord`, `releaseHoldPath`, `readReleaseHold`, `writeYaml` usage.
- `src/self-update.ts` — `deployStage`: hold read, `links` step shape, install-lock path (`git rev-parse --git-path akrogon-install.lock`), `deploy held:` line.
- `src/install.ts` — `install()` end-to-end link restore: stale sweep, conflict refusal before `applySkillLinks`, reload, `herdr plugin link`.
- `src/config.ts` — `readGlobal` (unwrapped parse today), `readRepo`'s message-prefix wrap to mirror, `globalHome`, `expandPath`.
- `src/akrogon.ts` — verb dispatch and usage string.
- `tests/release-deploy.test.ts` + `tests/helpers.ts` — `deployFixture`/`pushSeed`/`head`/`cli` machinery and `test.serial` convention.
- `tests/command-reference.test.ts` — verb contract rows.
- `README.md` Command table and release paragraph; `docs/guide/install.md` release paragraph.
- `src/state.ts` `withLock`; `src/shell.ts` `command`, `writeYaml`.

## Decisions

- **D1 — Verb and module.** `akrogon.ts` adds `case 'rollback'` (zero positionals, usage line gains `rollback`) dispatching to `rollback()` in new `src/rollback.ts`. New module because it composes release + install surfaces; no cycles (`rollback.ts` imports `./install`, `./release`, `./config`; nothing imports it).
- **D2 — Order and lock.** Body: `readGlobal()` first (criterion 5's early failure and the lock lookup), resolve the akrogon repo's `akrogon-install.lock` when `repos.akrogon` names an existing checkout (same lock `deployStage` serializes on; skipped otherwise), then inside the lock: read deploy record, refuse when `record.previous` is absent or `releases/<previous>` is missing (`no previous release to roll back to`, non-zero), refuse when `currentReleaseCommit()` is null (`current is not a release`), `flip(previous)`, write hold, `install()`, print `rolled back <old12> -> <prev12>`. Flip before hold matches the README's manual order; the lock covers the whole body so a concurrent deploy cannot interleave.
- **D3 — Hold names the release rolled away from.** `held = old !== previous ? old : (readReleaseHold() ?? record.commit ?? previous)`. A retry after a failed link step finds `current === previous` and must not re-hold the good release; it refreshes the existing hold or the deploy record's `commit`.
- **D4 — Link restore is `install()` itself.** It does exactly what the manual step (previous release's `install`) does: `ensureCurrent`, `planSkillLinks`/`applySkillLinks` through the new `current` (re-adds a skill the rolled release removed, unlinks one it added), conflict refusal before mutation, `systemctl --user daemon-reload`, `herdr plugin link`. A link-step failure propagates: non-zero exit, stderr names it, `current` already sits on the previous release (criterion 6). `install()`'s extra `herdr integration install` calls are idempotent.
- **D5 — Hold writer.** `writeReleaseHold(commit)` in `src/release.ts` beside `readReleaseHold`, using `writeYaml(releaseHoldPath(), { commit })`. No prune or record rewrite in rollback (pruning stamps the rolled release at the next deploy pass — the brief does not ask rollback to time that).
- **D6 — `readGlobal` wrap.** Mirror `readRepo`: catch parse/schema errors, rethrow with `<home>/config.yaml` prefixed to the message. Criterion 5 then gets file + key with zero per-verb code. No fallback, no loose parse.
- **D7 — Criterion 2 needs no product code.** `deployStage` already prints `deploy held: <sha12> (rollback hold)` when the hold names incoming main, and `clearReleaseHold` runs on the next successful deploy. Rollback only writes the record; tests prove the whole loop.
- **D8 — Manual path.** README gains a rollback section naming operator steps that need no code from the current release: find `previous` in `deploy.yaml`, `ln -s releases/<prev> .next-current && mv -T .next-current current` inside `~/.akrogon`, `printf 'commit: <held>\n' > release-hold.yaml`, `bun releases/<prev>/src/akrogon.ts install`. The test executes these verbatim (with fixture paths) against a stub release whose `install` delegates to the real entry point.
- **D9 — Fixture extraction.** `deployFixture`, `pushSeed`, `head`, `DeployFixture`, `releases`, `deployRecord`, `roots` move to `tests/deploy-fixture.ts`; `release-deploy.test.ts` imports them (its stub `src/akrogon.ts` grows an `install` branch that delegates to `AKROGON_FIXTURE_ENTRY`, and its exact-bytes assertion becomes `toContain`). New `tests/rollback.test.ts` holds criterion proofs.

## Needed interfaces

- `writeReleaseHold(commit: string): void` — `src/release.ts`.
- `rollback(): Promise<void>` — `src/rollback.ts`.
- Existing, reused unchanged: `readDeployRecord`, `currentReleaseCommit`, `flip`, `readReleaseHold`, `install`, `readGlobal`, `withLock`, `command`, `writeYaml`.

## Waves

**Planned tests (committed on this branch before product code):** `tests/deploy-fixture.ts` (extracted + stub `install` branch + `deployedPair`), `tests/release-deploy.test.ts` (imports + one `toContain` fix), `tests/rollback.test.ts` (new), `tests/command-reference.test.ts` (+ `rollback: ''` contract). The two changed old test files carry `Test-Change:` trailers on the test commit. The `command-reference` entry makes its fabricated-reference test red until the verb and README row land — intended red, part of the same contract.

**Wave 1 — U1:** `src/release.ts` (`writeReleaseHold`), `src/config.ts` (`readGlobal` wrap), `src/akrogon.ts` (verb case + usage), `README.md` (command row + rollback/manual-steps section), `docs/guide/install.md` (one rollback sentence). The README command row must land in the same unit as the verb case or `command-reference` goes red for the wrong reason.

**Wave 2 — U2:** `src/rollback.ts` (`rollback()`), plus one clause on `src/rollback.ts` inside the `src/release.ts` bullet of `src/AREA.md`. Depends on U1's `writeReleaseHold` and `readGlobal` wrap.

Every wave holds one unit — this is a serial-solo run; implement-issue's rule has A implement the plan itself with no workers. Doc checklist: `README.md`, `docs/guide/install.md`, `src/AREA.md`, `tests/AREA.md` (one line for `tests/rollback.test.ts` + `tests/deploy-fixture.ts`, lands in U2). `skills/AREA.md` and agent docs: unaffected.

## Criterion proofs

| # | Criterion | Proof (observation) | Command | Size | Rerun trigger |
|---|-----------|--------------------|---------|------|---------------|
| 1 | flip + print old/new | `akrogon rollback` exit 0, stdout holds both 12-char shas, `readlink current` → `releases/<prev>` via a renamed temp link | `bun test tests/rollback.test.ts -t 'rollback flips'` | seconds | rollback.ts/akrogon.ts change |
| 2 | hold blocks redeploy, ends when main moves | after rollback: `next --all` prints `deploy held:` + `release-hold.yaml` exists; after a new push: `deployed <sha>` and hold file gone | `bun test tests/rollback.test.ts -t 'hold blocks'` | seconds | release.ts/deploy change |
| 3 | manual path works on broken current | test runs the README steps verbatim on a release whose entry exits non-zero; same end-state predicate block as #1 | `bun test tests/rollback.test.ts -t 'manual rollback'` | seconds | README steps/stub change |
| 4 | no previous → non-zero, no change | exit ≠0 naming `no previous release`, `current` untouched, no `release-hold.yaml` | `bun test tests/rollback.test.ts -t 'no previous'` | seconds | rollback.ts change |
| 5 | bad global config → non-zero naming file+key | exit ≠0, stderr has `<home>/config.yaml` and the bogus key; `current`/hold/record untouched | `bun test tests/rollback.test.ts -t 'bad config'` | seconds | config.ts change |
| 6 | links restored / link failure leaves current on previous | (a) skill added by bad release gone, removed skill linked, links resolve through `current`→prev; (b) seeded conflict dir → non-zero, error printed, `current` still on prev | `bun test tests/rollback.test.ts -t 'links'` | seconds | install.ts/rollback.ts change |

`checks` already cover the whole suite (`bun test`, typecheck, prettier); the brief names no merge_checks, so none are added. This leaf adds no restart-boundary requirement: all proof commands run in seconds over a temp HOME.

## Open-for-plan answers

The design's "Open for the plan" items resolve as: hold ordering → D2/D3; link-step reuse → `install()` verbatim rather than re-implementing `deployStage`'s `links` step (D4); the rolled-away release's prune stamp → next deploy pass stamps it, no rollback-time record rewrite (D5); manual-path fidelity → stub `install` delegates to the real entry via `AKROGON_FIXTURE_ENTRY` (D8/D9). No limitations beyond the design's stated exclusions.

## Intended reds (plan.synthesis)

Recorded through `akrogon run-check --leaf <leaf>`:

- `check rollback-criteria: 1 implementation/check-rollback-criteria-1792127030670-3820516.log` — all 6 criterion tests red: `rollback` is an unknown verb (criteria 1, 2, 3, 6 fail at `code === 0`), criterion 4's stderr lacks `no previous release`, criterion 5's stderr lacks the config path. Red reason: the verb does not exist.
- `check release-deploy-regression: 1 implementation/check-release-deploy-regression-1792127037058-3823968.log` — the 19 extracted release-deploy tests stay green; the one red is `command-reference`'s fabricated-reference test missing the `rollback` row/verb, intended until U1 lands.

Red outputs: criterion 1 `expect(result.code).toBe(0)` got 1 with `Usage: akrogon <install|init|...|pack>`; criterion 5 stderr expected `<config.yaml>` path, received the unknown-verb Usage error.

## Implementation notes

- 2026-10-16 check.repair F1: after successful link restoration, record the rollback target as current and the rolled-away release as previous using the existing writeDeploySuccess helper, including its replacement timestamp; document the equivalent predecessor-code manual step, as design.md requires “After rollback, the release it left becomes previous for pruning purposes” and retention until 24 h after rollback.
- 2026-10-16 check.fix F2: criterion 3's proof builds the real predecessor release with `buildRelease` at `git merge-base origin/main HEAD` inside the fixture state home (a release-deploy-built tree carrying no `rollback` verb), runs its own `install`, `bun -e` record write and held `next --all` as the README steps name, and carries a `ROLLBACK_BREAK_PREV` gate that deletes the predecessor's `install.ts` for the deliberate-break red run; the fixture stub reverts to a plain release marker with no install delegation.
- 2026-10-16 check.fix, unrelated verify red: `withLock` creates the lock file's parent directory before flocking — flock cannot create a parent, and since state-home no state-home-less first lock must ENOENT; repair for the blocking base flake `self-update.test.ts` hit deterministically.
