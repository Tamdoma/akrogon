# Plan: copyfile-installs

## Decisions

- D1: literal `--backend=copyfile` in `src/release.ts` `buildRelease`: install argv becomes `[process.execPath, 'install', '--frozen-lockfile', '--backend=copyfile']`. `argv[0]` stays `process.execPath`, so `self-update.ts` `deployStage` still classifies a failed build step as `install`.
- D2 (open-for-the-plan answer): the criterion-1 test gets the release path from `head(d)` before one `cli(d.f, ['next', '--all'])` pass, then `resolve(releases(d), sha)` — the same pattern the existing "deploy builds a complete release" test uses, the least setup that yields the built release path.
- D3: init-akrogon prose changes exactly two spots: the commented `# setup:` line 27 and the `bun.lock` mapping in the line-42 paragraph, both to `bun install --frozen-lockfile --backend=copyfile`. npm/pnpm/yarn mappings untouched.
- D4: prose example changes append `--backend=copyfile` to each existing command, keeping its `--frozen-lockfile` (or absence) choice: `skills/broadcast-issue/SKILL.md` line 27, `docs/reference/config.md` line 58, `docs/reference/checks.md` line 22, `docs/reference/releases-and-updates.md` line 11, `docs/start/install.md` line 64 (`bun install` → `bun install --backend=copyfile`).
- D5: fixture installs gain the flag only, never `--frozen-lockfile`: `tests/deploy-fixture.ts` line 42, `tests/install.test.ts` line 320, `tests/self-update.test.ts` line 54 — each the `command([process.execPath, 'install'], seed)` call. The `cli(f, ['install'])` calls and `tests/rollback.test.ts`'s `akrogon.ts install` run the akrogon CLI verb, not Bun, and stay untouched.
- D6: exclusions stand: `issues/config.yaml` (operator-owned), `tests/config.test.ts` wrap strings (opaque fixtures), `docs/use/roll-back-a-release.md` (the akrogon CLI verb), `src/AREA.md` (`bun install` named without flags — still true), existing releases (`buildRelease` returns an existing `releases/<sha>` unchanged).
- D7: no new proof machinery. Criterion 1 is proven by the new `tests/release-deploy.test.ts` test on the existing deploy fixture; criteria 2–4 are proven by diff observation and the existing suite under the design's no-string-test rule.

## Read-first

- `src/release.ts` `buildRelease` (line 69 argv) and `src/self-update.ts` build-step classification (~line 300).
- `tests/release-deploy.test.ts` (deploy test patterns), `tests/deploy-fixture.ts` (`deployFixture`, `releases`, `head`), `tests/helpers.ts` `cli` (HOME=fixture home, so Bun's cache and `releases/` share one filesystem).
- `issues/chart/bun-copyfile/forks/flag-sites.md` (binding decision 1a/2a, measured proof), `readiness.yaml` proofs (bun 1.4.4 scratch measurement).
- `skills/init-akrogon/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `docs/reference/{config,checks,releases-and-updates}.md`, `docs/start/install.md`.

## Interfaces

- `command(argv, cwd)` in `src/shell.ts` — the existing spawn used at every site; the flag is a literal argv element, no signature change.
- `DeployFixture`/`releases(d)`/`head(d)`/`cli` — existing test helpers used by the new test.
- `statSync(path).ino` — added to the test's `node:fs` import.

## Waves

### Wave 1

- U1 (criterion 1): `src/release.ts`. Lands the flag in the release install argv. The criterion test is already committed (7fb2f43) and red on base.
- U2 (criteria 2, 3): `skills/init-akrogon/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md`, `docs/start/install.md`.
- U3 (criterion 4): `tests/deploy-fixture.ts`, `tests/install.test.ts`, `tests/self-update.test.ts`. Commits touching `tests/install.test.ts`, `tests/self-update.test.ts`, `tests/deploy-fixture.ts` carry a `Test-Change:` trailer citing brief criterion 4.

Disjoint owned paths, no shared live test resource, no ordering dependency — all three units share wave 1 (delegated run, 3 workers).

## Done-criteria proof map

- Criterion 1 (private `node_modules` in a built release): real boundary is the `cli next --all` deploy building `releases/<sha>`. Before: `node_modules/tiny/package.json` shares the vendor file's inode (hardlink). After: different inode. Catches a release whose deps alias shared files, so a patch inside one checkout's `node_modules` reaches the cache and other repos.
  - Test: `tests/release-deploy.test.ts` 'a built release holds private copies of its file: dependency, not shared files' — committed at 7fb2f43 before product code.
  - Proof command: `bun test tests/release-deploy.test.ts --timeout=30000 -t "private copies"` under the repo `test` check.
  - Red recorded: `check criterion-1-private-copy-red: 1 .../check-criterion-1-private-copy-red-1793129098342-4086037.log` — `Expected: not 2571407864` at line 137 on the current flagless `buildRelease`.
  - Checked condition — "different file (inode)": the same test is the failing case; a flagless or symlinked install yields equal inodes. Shown red above against the unmodified product. Size: seconds (measured 0.25s). Rerun trigger: any change to `buildRelease` install argv or the deploy fixture's dependency shape.
- Criterion 2 (init-akrogon bun mapping): boundary is the SKILL.md prose a seat reads during init. Before: `bun install --frozen-lockfile` in both spots. After: `--backend=copyfile` appended. Catches new repos initialized with a shared-cache install.
  - Proof command: `git --no-pager diff` on `skills/init-akrogon/SKILL.md` + `grep -n "backend=copyfile" skills/init-akrogon/SKILL.md` (expects lines 27 and 42; `grep -n "npm ci\|pnpm install\|yarn install"` unchanged). Diff observation per design. Size: seconds. Rerun: doc edits.
- Criterion 3 (prose examples carry the flag): same boundary — the prose operators and seats copy.
  - Proof command: `grep -n "bun install" skills/broadcast-issue/SKILL.md docs/reference/config.md docs/reference/checks.md docs/reference/releases-and-updates.md docs/start/install.md` — every hit carries `--backend=copyfile` and keeps its `--frozen-lockfile` choice (install.md has none, per brief). Size: seconds. Rerun: doc edits.
- Criterion 4 (fixture installs carry the flag): boundary is the `command()` spawn argv in the three files.
  - Proof command: `grep -n "execPath, 'install'" tests/deploy-fixture.ts tests/install.test.ts tests/self-update.test.ts` shows `'--backend=copyfile'` at each site and no `'--frozen-lockfile'`; plus `bun test tests/release-deploy.test.ts tests/self-update.test.ts tests/install.test.ts --timeout=30000` under the `test` check stays green, proving the argv edits did not break the fixtures. Size: minutes (deploy/self-update fixtures). Rerun: fixture or argv edits.
- Repo `checks` (format/test/typecheck) run at `akrogon verify` per the implement flow; no `merge_checks` or whole-suite requirement added — the brief names none.

## Doc checklist

- `skills/init-akrogon/SKILL.md` — both bun install mentions gain the flag (U2).
- `skills/broadcast-issue/SKILL.md` — skill-local install line gains the flag (U2).
- `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md`, `docs/start/install.md` — install examples gain the flag (U2).
- `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `README.md` — name `bun install` generically or not at all; no line changes.
- `learnings/` — none.

## Implementation notes

2026-10-27: implement mode is `subagents`; wave 1 holds U1–U3 (3 workers at once). Worker worktrees: `/home/ivan/.akrogon/worktrees/akrogon/copyfile-installs-u1`, `-u2`, `-u3`, created `git worktree add --detach` at the lane's committed HEAD. Each worker installs deps in its worktree first: `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile --backend=copyfile`. Resolved changed-tests command after each cherry-pick: `bun test tests/release-deploy.test.ts tests/install.test.ts tests/self-update.test.ts --timeout=30000`. Worker targeted commands: U1 `bun test tests/release-deploy.test.ts --timeout=30000`; U3 `bun test tests/install.test.ts tests/self-update.test.ts --timeout=30000`; U2 has no test runner (prose only) and runs the criterion-2/3 greps instead.

## Notes for review

- None; brief and design agree. `readiness.yaml` already measured the flag's effect on bun 1.4.4 on this host (btrfs, shared cache fs), which is also the fixture environment (HOME=fixture home, same filesystem for cache and releases).
