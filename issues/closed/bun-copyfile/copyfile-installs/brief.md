# Brief: copyfile-installs

## What

Add `--backend=copyfile` to every Bun command in akrogon that writes `node_modules`: the release build in `src/release.ts` `buildRelease`, the `bun.lock` setup proposal in `skills/init-akrogon/SKILL.md`, the skill-local install in `skills/broadcast-issue/SKILL.md`, the install examples in `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md` and `docs/start/install.md`, and the fixture installs in `tests/deploy-fixture.ts`, `tests/install.test.ts` and `tests/self-update.test.ts` (A,B). A release akrogon builds then holds private `node_modules` files instead of hardlinks into shared files.

## Why

Without the flag, Bun 1.4.4 hardlinks `node_modules` files to its shared cache, so a patch inside one checkout's `node_modules` changes the cache and every other repo installed from it. Bun ignores a bunfig `backend` key and has no environment variable for it, so only the flag gives private copies. The operator moved every JS repo to `--backend=copyfile` on 2026-10-27, and new repos initialized by init-akrogon and every new release still get the flagless command (Tamdoma/akrogon#122).

## Done-criteria

1. A release built by `buildRelease` holds private dependency files: in the deploy fixture (`file:vendor/tiny` dependency), a freshly built release's `node_modules/tiny/package.json` is a different file (inode) from that release's `vendor/tiny/package.json`. The leaf's test shows this failing on the current `buildRelease` and passing after the change, and runs in the repo's `test` check.
2. For a committed `bun.lock`, init-akrogon proposes `setup: bun install --frozen-lockfile --backend=copyfile` in both its commented setup example and its lockfile mapping paragraph. The npm, pnpm and yarn mappings are unchanged.
3. The skill-local install in `skills/broadcast-issue/SKILL.md` and the Bun install examples in `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md` and `docs/start/install.md` pass `--backend=copyfile`, each keeping its existing `--frozen-lockfile` choice.
4. The Bun fixture installs in `tests/deploy-fixture.ts`, `tests/install.test.ts` and `tests/self-update.test.ts` (A,B) pass `--backend=copyfile` and gain no `--frozen-lockfile`.
