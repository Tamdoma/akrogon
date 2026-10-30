# Review A: copyfile-installs

Base: `2cd0ec17e7179055ef1fcc3a255cb0734fb41f9d`
Reviewed head: `174394dd971a43416872bbc1c8e803180bbbdffd` (4 commits: test `7fb2f43`, release `9183c126`, docs `a2f48a80`, fixtures `174394dd`)

## Diff inspection

- `src/release.ts`: install argv is `[process.execPath, 'install', '--frozen-lockfile', '--backend=copyfile']`; `argv[0]` unchanged, so `deployStage`'s `install` step classification in `src/self-update.ts` holds.
- `tests/release-deploy.test.ts`: criterion-1 test committed red-first (`7fb2f43`, before product code). `statSync(...).ino` follows symlinks, so both hardlink and symlink aliasing of `node_modules/tiny` are caught. Shown red on base (`Expected: not 2571407864`), green on head.
- Prose: all six files carry `--backend=copyfile` appended last, each keeping its `--frozen-lockfile` choice; `docs/start/install.md` correctly keeps none; init-akrogon npm/pnpm/yarn mappings untouched.
- Fixtures: three `command([process.execPath, 'install', '--backend=copyfile'], seed)` sites, no `--frozen-lockfile`; `cli(f,['install'])` and `tests/rollback.test.ts`'s `akrogon.ts install` correctly untouched (akrogon CLI verb).
- Coverage sweep: repo-wide grep for `bun install|bun i|bun add|bun link|bun ci` found no other Bun command writing `node_modules`; `issues/config.yaml` and `tests/config.test.ts` wrap strings are design-excluded; `bunfig.toml` has no backend key (Bun ignores it anyway); `src/AREA.md` names `bun install` generically and stays true.
- Trailers: all four commits carry the required `Test-Change:` trailers for test-file changes; docs/src commits need none.

## Evidence

- Criterion 1: `check criterion-1-green: 0` `implementation/check-criterion-1-green-1793129409832-4150278.log`; red-first `check criterion-1-private-copy-red: 1` `implementation/check-criterion-1-private-copy-red-1793129098342-4086037.log`.
- Criteria 2–3: `check criteria-2-3-grep: 0` `implementation/check-criteria-2-3-grep-1793129420655-4152464.log`.
- Criterion 4: `check criterion-4-grep: 0` `implementation/check-criterion-4-grep-1793129420654-4152466.log`; fixture suites green under `check changed-tests-u1/u2/u3` (57 pass each).
- `akrogon verify` green receipt `1dc2b511-3685-450f-9184-766362cfd208` on `174394dd`: format 0, test 0 (1228 pass), typecheck 0.

Documented behavior changed intentionally (install examples); no doc made stale — `docs/reference/releases-and-updates.md` now matches `buildRelease`, `src/AREA.md`'s flagless mention stays accurate. No `AREA.md` path claims affected.

## Findings

None.

## Verdict

ready
