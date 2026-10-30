# Flag sites and proof

## Question

Q1. Where does `--backend=copyfile` go, and which install sites are in scope?
Q2. How does the leaf prove the release build gets private files?

### Carries

Operator guide `/home/ivan/Work/BUN-COPYFILE-GUIDE.md` Rules 1-2 and Step 4. Operator values: simplicity, removing over adding, speed and price.

## Findings

Merged notes: [slots/map-merged.md](../slots/map-merged.md) (A,B). B rebuttal: [slots/map-rebuttal-B.md](../slots/map-rebuttal-B.md), no disagreement.

- Research: operator · BUN-COPYFILE-GUIDE.md, 2026-10-27 · Bun 1.4.4 ignores bunfig `backend` and has no env var; only the CLI flag works · removed any single-switch option.
- Research: better-than-training · proof call below · the flag yields private files on this machine's btrfs with the shared cache.
- Correction after the round (A): `cli(f, ['install'])` in `tests/install.test.ts` is akrogon's own command, not a Bun install.
- Correction at leaf review (B, verified by A 2026-10-27): `tests/install.test.ts:320` does run `command([process.execPath, 'install'], seed)`, a real Bun install. Real fixture installs are `tests/deploy-fixture.ts:42`, `tests/install.test.ts:320` and `tests/self-update.test.ts:54`.

### Proof: bun install with --backend=copyfile

- command: `git archive HEAD | tar -x -C <dir>` then `bun install --frozen-lockfile --backend=copyfile` in `<dir>`; control copy with `bun install --frozen-lockfile`
- identity: local user ivan, no credential
- target: `/home/ivan/.cache/chart-proof-bun-copyfile` (btrfs, same filesystem as cache `/home/ivan/.cache/.bun/install/cache`)
- version: bun 1.4.4, akrogon 2cd0ec17
- date: 2026-10-27
- result: exit 0; 1540 of 1540 `node_modules` files at link count 1; `bun.lock` byte-identical to HEAD. Control: 1327 files at 13 links, 213 at 8.
- cleanup: `rm -rf` the directory; `test ! -e` confirmed absent
- limits: proves Bun 1.4.4 behavior on this host only; does not prove behavior on other filesystems or Bun versions.

### Measurement M1 (A, scratch, discarded)

tmpfs scratch, private `BUN_INSTALL_CACHE_DIR`, package with `"tiny": "file:vendor/tiny"`: plain `bun install` gives `node_modules/tiny/index.js` the same inode as `vendor/tiny/index.js` (2 links); with `--backend=copyfile` a different inode (1 link).

## Taken

A's pick under autopilot, 2026-10-27: `1a 2a`.

- 1a: literal `--backend=copyfile` on every Bun command that writes `node_modules` in `src/release.ts` `buildRelease`, `skills/init-akrogon/SKILL.md` (commented setup example and `bun.lock` mapping), `skills/broadcast-issue/SKILL.md` skill-local install, `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md`, `docs/start/install.md`, and the fixture installs in `tests/deploy-fixture.ts`, `tests/install.test.ts` (added at leaf review, B) and `tests/self-update.test.ts` (no `--frozen-lockfile` added there). Reason: fewest moving parts, the flag is the only control Bun 1.4.4 honours. Rejected: 1b akrogon rewriting `setup` strings (hidden mutation of consumer commands, breaks non-Bun setups); bunfig or env (ignored by Bun); `buildRelease` running configured `setup` (couples deploy to config).
- Excluded: akrogon's own `issues/config.yaml` `setup` (consumer config, guide Step 4 needs operator approval, offered separately); `tests/config.test.ts` wrap strings; rebuilding existing releases.
- 2a: one fail-first test in `tests/release-deploy.test.ts` on the existing `file:vendor/tiny` fixture asserting a fresh release's `node_modules/tiny/package.json` is a different inode from its `vendor/tiny/package.json`. Reason: M1 shows it fails without the flag, and it needs no new test machinery. Rejected: 2b flag-string test (vanity); B's registry-cache fixture (new machinery).
- Standing consultant dissent: none.
