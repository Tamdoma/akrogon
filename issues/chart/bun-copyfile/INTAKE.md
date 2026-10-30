# Intake: bun-copyfile

## Scope

Destination akrogon. Every Bun install akrogon proposes, runs or documents passes `--backend=copyfile`, so installs get private `node_modules` files instead of hardlinks into the shared Bun cache.

## Provenance

- GitHub: Tamdoma/akrogon#122
- Operator: door pane w8:pNP, 2026-10-27, two messages

## Source: operator 2026-10-27 message 1

I just pulled a new set off gh issues. Analyze them and use slot b consultant (codex with default settings) to help you. Think about them from a systems thinking perspective. Consolidate them together and see if the same systemic issue plagues multiple of those issues. Then consolidate them together and find the best most elegant solutions. Always lean towards removing code and removing bloated overengineered subsystems if that helps resolving the problem and making things faster, cheaper and better quality. Do it on autopilot and when you're done charting, tell the watcher (watch-framework tab) to start the lifecycle process.

## Source: operator 2026-10-27 message 2

ok, just do it for the one issue that was pulled here, sorry

## Source: Tamdoma/akrogon#122

# Akrogon proposes and runs Bun installs without --backend=copyfile, so installs hardlink node_modules to the shared Bun cache

Source: Tamdoma/akrogon#122
URL: https://github.com/Tamdoma/akrogon/issues/122

Origin repo: Tamdoma/lingua-relay

Unverified intake.

## Observation

Akrogon's own Bun install commands leave out `--backend=copyfile`:

- `skills/init-akrogon/SKILL.md` (the commented `setup` example and the lockfile mapping paragraph) proposes `setup: bun install --frozen-lockfile` for a committed `bun.lock`, so every repo initialized from now on gets a setup line without the flag.
- `src/release.ts` (release build, `command([process.execPath, 'install', '--frozen-lockfile'], staging)`) builds every deployed release with a flagless `bun install --frozen-lockfile`.
- `docs/reference/config.md` (`setup` row) and `docs/reference/checks.md` (setup paragraph) show `bun install --frozen-lockfile` as the example.

Checked `origin/main` of Tamdoma/akrogon on 2026-10-27: no `copyfile` anywhere in `src`, `skills` or `docs`.

## Location

Akrogon: `skills/init-akrogon/SKILL.md`, `src/release.ts`, `docs/reference/config.md`, `docs/reference/checks.md`. Consumer repos' `issues/config.yaml` `setup` lines proposed by init-akrogon.

## Reproduction

`git grep -n "frozen-lockfile" origin/main -- src skills docs` in the akrogon repo lists the flagless commands; `git grep -n copyfile origin/main -- src skills docs` prints nothing.

## Expected behavior

init-akrogon proposes `bun install --frozen-lockfile --backend=copyfile` for a committed `bun.lock`, the release build passes the flag, and the docs examples match.

## Urgency

The operator moved every JS repo under ~/Work to `bun install --frozen-lockfile --backend=copyfile` on 2026-10-27 (procedure `/home/ivan/Work/BUN-COPYFILE-GUIDE.md`, Rules 1 and Step 4; for example blepsis eacc3d0 and lingua-relay `issues/config.yaml` `setup`). A repo initialized by init-akrogon after that gets the flagless line, and its node_modules files are hardlinked to the shared cache: an agent's patch inside node_modules then changes the cache and every other repo installed from it. Release builds have the same sharing, with lower risk because releases are not normally edited. Workaround: edit each repo's `setup` line by hand to add the flag.

## Suspected cause

The init-akrogon lockfile mapping and the release build predate the 2026-10-27 copyfile move and were not updated with it. Bun 1.4.4 hardlinks to its cache without the flag, and a bunfig `backend` key is ignored (seen in Tamdoma/akrogon#81's history), so only the CLI flag gives private copies.
Whose view: both (operator's guide and request, agent's inspection).
Files read: akrogon `skills/init-akrogon/SKILL.md`, `src/release.ts`, `docs/reference/config.md`, `docs/reference/checks.md` (workspace /home/ivan/Work/infra/akrogon at origin/main); `/home/ivan/Work/BUN-COPYFILE-GUIDE.md`.
Not inspected: other akrogon-run `bun install` calls outside `src`, `skills` and `docs` (for example skill-local installs such as broadcast-issue's `bun install --cwd <skill-folder> --frozen-lockfile`), and whether release folders share a filesystem with the Bun cache.
Related reports: Tamdoma/akrogon#81 (closed) is related but different: a chart locked an untested bunfig key in the framework repo; it does not cover akrogon's own defaults. Searched Tamdoma/akrogon, all states: own reports since 2026-10-25 (limit 30) and "backend copyfile" (limit 10).

## Agent findings

- Install sites on main (`git grep`, 2026-10-27): `src/release.ts` `buildRelease` runs `bun install --frozen-lockfile` with no flag; `skills/init-akrogon/SKILL.md` lines 27 and 42 map `bun.lock` to the flagless setup; `skills/broadcast-issue/SKILL.md:27` tells the seat to run `bun install --cwd <skill-folder> --frozen-lockfile` (not named by the reporter); docs examples in `docs/reference/config.md:58`, `docs/reference/checks.md:22` and `docs/reference/releases-and-updates.md:11` (the last not named by the reporter).
- The lockfile mapping exists only as skill text. No code in `src` builds a setup line (`git grep "npm ci" -- src tests` is empty).
- `tests/config.test.ts` uses `bun install --frozen-lockfile` only as an opaque fixture string for the setup wrap. It is not a proposed default.
- Akrogon's own `issues/config.yaml:6` is `setup: bun install --frozen-lockfile`. The operator's guide Step 4 says a repo's setup line changes "only with the user's approval, in a commit of its own".
- Machine: bun 1.4.4, home on btrfs, cache `/home/ivan/.cache/.bun/install/cache`.
