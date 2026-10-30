# Merged map: bun-copyfile

Sources: slots/map-B.md (B), A's own map (A). A measured one point after both maps (M1).

## Options

- **Flag literal on each invocation (A,B).** Add `--backend=copyfile` to every Bun command that writes `node_modules`, keeping `--frozen-lockfile` where present. Cost: a handful of literal edits.
- Rejected (A,B): bunfig `backend` key or env var (Bun 1.4.4 ignores both, guide Rule 1). Rejected (A,B): akrogon rewriting user `setup` strings or a new config option (hidden mutation of consumer commands, breaks non-Bun setups, adds machinery). Rejected (A): `buildRelease` running the repo's configured `setup` instead of its own install (couples every deploy to a config line, wider change than the defect).

## Scope

- In (A,B): `src/release.ts` `buildRelease`; `skills/init-akrogon/SKILL.md` commented setup example and lockfile mapping paragraph; `skills/broadcast-issue/SKILL.md` skill-local install; `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md`, `docs/start/install.md`.
- In (B), A agrees: the three real fixture installs in `tests/deploy-fixture.ts`, `tests/install.test.ts`, `tests/self-update.test.ts` (operator guide Rule 1 covers every Bun command that writes node_modules). No `--frozen-lockfile` added there because they generate fixture locks.
- Out (A,B): `tests/config.test.ts` setup strings (opaque wrap fixtures, not defaults), historical records under `issues/` and `learnings/history`.
- Out (A,B): akrogon's own `issues/config.yaml` `setup` line. It is consumer config, which the operator's guide Step 4 changes "only with the user's approval, in a commit of its own". It is offered to the operator, not done by the leaf (leaves cannot touch `issues/`).
- Out (A,B): rebuilding existing releases or migrating other repos' configs. `buildRelease` reuses an existing `releases/<sha>`, so only new builds change.

## Proof

- M1 (A, measured 2026-10-27, bun 1.4.4, tmpfs scratch with a private `BUN_INSTALL_CACHE_DIR`): a `file:vendor/tiny` dependency installed without the flag shares the inode of `vendor/tiny/index.js` (link count 2). With `--backend=copyfile` it is a private copy (link count 1, different inode).
- So (A, supersedes B's D4 fallback): one fail-first test in `tests/release-deploy.test.ts` on the existing `deploy-fixture.ts` seed (`file:vendor/tiny`): a freshly built release's `node_modules/tiny/package.json` is not the same inode as the release's `vendor/tiny/package.json`. It fails on today's `buildRelease` and passes with the flag. No registry or cache fixture is needed. B's registry-cache fixture would be new test machinery, which the standing design forbids a leaf building for its own proof.
- Prose sites (skills, docs) are checked by the reviewer reading the diff. No string-grep test (A,B).
- Charting proof (A, 2026-10-27): `bun install --frozen-lockfile --backend=copyfile` on a `git archive HEAD` copy of akrogon under `$HOME` (same btrfs as the cache): exit 0, 1540 of 1540 `node_modules` files at link count 1, `bun.lock` byte-identical. Without the flag: 1327 files at 13 links, 213 at 8. Scratch removed, absence checked.

## Pitfalls

- Disk use on non-btrfs filesystems (B P2): copyfile makes full copies there. Accepted cost; no filesystem detection.
- Future commands omitting the flag (B P3): the release test guards the one code path; prose relies on review. No repo-wide string gate.
- Existing user setups are not enforced (B P4): stated limit.

## Where slots differ

- B D4 proposed a registry-cache behavior test or an argv assertion fallback. A proposes the inode test on the existing `file:` fixture, based on M1.
- B Q1 asks whether the intake authorizes the akrogon `issues/config.yaml` change. A reads the intake as not authorizing it (the report scopes akrogon's defaults; the guide requires explicit approval).
