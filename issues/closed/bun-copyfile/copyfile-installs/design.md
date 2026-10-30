# Design: copyfile-installs

## Binding decisions, verbatim

### Flag sites and proof (issues/chart/bun-copyfile/forks/flag-sites.md), A's pick under autopilot, 2026-10-27: `1a 2a`

- 1a: literal `--backend=copyfile` on every Bun command that writes `node_modules` in `src/release.ts` `buildRelease`, `skills/init-akrogon/SKILL.md` (commented setup example and `bun.lock` mapping), `skills/broadcast-issue/SKILL.md` skill-local install, `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md`, `docs/start/install.md`, and the fixture installs in `tests/deploy-fixture.ts`, `tests/install.test.ts` and `tests/self-update.test.ts` (no `--frozen-lockfile` added there). Reason: fewest moving parts, the flag is the only control Bun 1.4.4 honours. Rejected: akrogon rewriting `setup` strings (hidden mutation of consumer commands, breaks non-Bun setups); bunfig or env (ignored by Bun); `buildRelease` running configured `setup` (couples deploy to config).
- Excluded: akrogon's own `issues/config.yaml` `setup` (consumer config, guide Step 4 needs operator approval, offered separately, and leaves cannot touch `issues/`); `tests/config.test.ts` wrap strings (opaque fixtures for the setup wrap, not defaults); rebuilding existing releases (`buildRelease` returns an existing `releases/<sha>` unchanged, so only new builds change).
- 2a: one fail-first test in `tests/release-deploy.test.ts` on the existing `file:vendor/tiny` fixture asserting a fresh release's `node_modules/tiny/package.json` is a different inode from its `vendor/tiny/package.json`. Reason: a measured scratch run (bun 1.4.4, private cache) showed a plain install gives the same inode (2 links) and `--backend=copyfile` a different one (1 link), so the test fails without the flag, and it needs no new test machinery. Rejected: a flag-string test (vanity); a registry-cache fixture (new machinery).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: the one new test is the red-first proof of criterion 1 and uses the existing deploy fixture and runner, with no new machinery. Prose criteria 2 and 3 and fixture criterion 4 are checked by reading the diff, with no string-matching test. No secrets, auth or outside calls are involved.

## Leaf architecture

- `src/release.ts` `buildRelease`: the install argv becomes `[process.execPath, 'install', '--frozen-lockfile', '--backend=copyfile']`. Consumer: `src/self-update.ts` deploy, which classifies a failed build step as `install` from the `CommandError` argv. The change keeps `argv[0]` as `process.execPath`, so that classification is unchanged.
- `tests/release-deploy.test.ts`: one test that deploys the fixture and compares `statSync(...).ino` of `<release>/node_modules/tiny/package.json` and `<release>/vendor/tiny/package.json`. Open for the plan: which existing deploy helper in that file yields the built release path with the least setup.
- `tests/deploy-fixture.ts` seed install, `tests/install.test.ts` seed install (the `command([process.execPath, 'install'], seed)` call, not the `cli(f, ['install'])` calls) (A,B) and `tests/self-update.test.ts` seed install: add `--backend=copyfile` to the argv.
- Prose: `skills/init-akrogon/SKILL.md` (commented `# setup:` line and the lockfile mapping paragraph), `skills/broadcast-issue/SKILL.md` install line, `docs/reference/config.md` `setup` row, `docs/reference/checks.md` setup paragraph, `docs/reference/releases-and-updates.md` release line, `docs/start/install.md` install step.
- Exclusions: `issues/` (operator-owned config step), `tests/config.test.ts`, `learnings/history`.
