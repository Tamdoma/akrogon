# Implementation report: copyfile-installs

Base: `2cd0ec17e7179055ef1fcc3a255cb0734fb41f9d` (unchanged by refresh — branch was already on origin/main)
Committed head: `174394dd971a43416872bbc1c8e803180bbbdffd`

Delegated run, wave 1 (3 workers at once per plan.md): U1 `08a609d` → `9183c126`, U2 `a6b57a2` → `a2f48a80`, U3 `ea73880` → `174394dd`, all cherry-picked clean onto the lane. Worker worktrees `copyfile-installs-u1..u3` removed.

## Changed files and reasons

- `src/release.ts` (U1) — `buildRelease` install argv gains `'--backend=copyfile'` last; `argv[0]` stays `process.execPath`, so the `deployStage` `install` classification is unchanged.
- `tests/release-deploy.test.ts` (planning, `7fb2f43`) — criterion-1 test committed red-first: `statSync(...).ino` of `<release>/node_modules/tiny/package.json` vs `<release>/vendor/tiny/package.json` must differ.
- `skills/init-akrogon/SKILL.md` (U2) — commented `# setup:` example and `bun.lock` mapping carry `--backend=copyfile`; npm/pnpm/yarn mappings unchanged.
- `skills/broadcast-issue/SKILL.md` (U2) — skill-local install command gains the flag.
- `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md`, `docs/start/install.md` (U2) — each install example gains the flag, keeping its `--frozen-lockfile` choice (`install.md` keeps having none).
- `tests/deploy-fixture.ts`, `tests/install.test.ts`, `tests/self-update.test.ts` (U3) — each `command([process.execPath, 'install'], seed)` gains `'--backend=copyfile'`; no `--frozen-lockfile` added; `cli(f, ['install'])` and rollback's `akrogon.ts install` untouched.
- Docs checklist: `src/AREA.md` names `bun install` without flags and stays true; `tests/AREA.md`, `skills/AREA.md`, `README.md`, `docs/use/roll-back-a-release.md` needed no change.

## Proof results

All run on `174394dd` unless noted.

- Criterion 1: `bun test tests/release-deploy.test.ts --timeout=30000 -t "private copies"` — red before the product change (`check criterion-1-private-copy-red: 1 .../check-criterion-1-private-copy-red-1793129098342-4086037.log`, `Expected: not 2571407864`), green after: `check criterion-1-green: 0 .../check-criterion-1-green-1793129409832-4150278.log`.
- Criterion 2: `check criteria-2-3-grep: 0 .../check-criteria-2-3-grep-1793129420655-4152464.log` — `init-akrogon` lines 27 and 42 carry `--backend=copyfile`; npm ci / pnpm / yarn mappings unchanged.
- Criterion 3: same grep log — all five remaining prose files show `--backend=copyfile` with existing `--frozen-lockfile` choices kept.
- Criterion 4: `check criterion-4-grep: 0 .../check-criterion-4-grep-1793129420654-4152466.log` — three `execPath, 'install', '--backend=copyfile'` sites, no `--frozen-lockfile` in fixture installs; suites green under changed-tests below.
- Changed-tests after each pick (`bun test tests/release-deploy.test.ts tests/install.test.ts tests/self-update.test.ts --timeout=30000`): `check changed-tests-u1: 0` (57 pass), `check changed-tests-u2: 0` (57 pass), `check changed-tests-u3: 0` (57 pass).
- Worker targeted runs (in worker worktrees): U1 `tests/release-deploy.test.ts` 15 pass/0 fail; U3 `tests/install.test.ts tests/self-update.test.ts` 42 pass/0 fail.

## `akrogon verify` on `174394dd`

Green receipt `1dc2b511-3685-450f-9184-766362cfd208` (`verify leaf 174394dd…: green`):
- format: exit 0, `implementation/check-format-1793129427255-4152839.log`
- test: exit 0, `implementation/check-test-1793129491729-4152839.log` (1228 pass, 0 fail, 70 files)
- typecheck: exit 0, `implementation/check-typecheck-1793129494290-4152839.log`

Wall time: `akrogon verify` ≈ 1.5 min (first check log 19:30:27, receipt end 19:31:34); each changed-tests run ≈ 12 s.

## Refresh record

`git fetch origin` + `git rebase origin/main` before the wave: no-op, branch was current at base `2cd0ec17`, head `7fb2f43`. Second fetch after the last unit: origin/main still `2cd0ec17`; `AKROGON_BASE` unchanged.

## Known limitations

- The flag's effect is proven on Bun 1.4.4 on this host's filesystems only (readiness proof limits); other Bun versions or filesystems are untested.
- `issues/config.yaml`'s own `setup: bun install --frozen-lockfile` is deliberately untouched (operator-owned; chart Step 4 is a separate operator-approved offer).

## Unverified criteria

None.
