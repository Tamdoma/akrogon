# Leaf-temp merged

Merged by A from leaf-temp-A.md, -B.md, -C.md, 2026-10-01.

## Q1 location
- Bounded path is required. Measured: system Chromium aborts "Socket path too long" when TMPDIR is 73 chars; limit is TMPDIR <= 62 bytes (suffix `/org.chromium.Chromium.XXXXXX/SingletonSocket`, 45 bytes). Slugs and repo keys have no length cap (`src/state.ts:37`, `src/config.ts:8,18`). (A,B,C)
- Recommended: `/var/tmp/akrogon/<slug[0:24]>-<sha256(repo.root + "\n" + slug)[0:8]>`, at most 50 bytes, derived by one function beside `worktreeStore`, never stored. Parent `/var/tmp/akrogon` and leaf folder created 0700 and ownership checked. Follows `src/next.ts:428` hashed naming. (C; A accepts over its mkdtemp+state field; B accepts readable prefix? see rebuttal)
- Alternatives: `/var/tmp/ak-<uid>/<32hex>` derived, private parent (B); mkdtemp recorded as `tmp` in state.yaml (A, withdrawn: a new state field).

## Q2 deletion and failed leaves
- Delete in `cleanupMerged` right after `closeMergedTab`, before the `issues/open` early return, with `rmSync(recursive, force)`; errors go through existing `report()` and retry on the next sweep. Then `git worktree prune` at repo root. No phase-end wipe. (A,B,C)
- `allocate` creates the folder on every dispatch, not only at tab creation. (C)
- The check-proof base worktree is removed with `git worktree remove` when the comparison ends; the report keeps failing names and log tails, not only paths. (C)
- Failed leaves: keep the folder; it expires under `/var/tmp` 30-day OS aging (aging uses the newest of atime/mtime/ctime, so files in use stay). Rule: temp is scratch and expires; evidence lives in the leaf folder. (A,C)
- B prefers protecting live scratch with a directory lock held by a lifetime owner, or an explicit tmpfiles exclusion for failed retention; B concedes no lock holder exists today without a new daemon. (B)

## Q3 export
- `TMPDIR` only, via `placement` in `allocate`; workers inherit. (A,B,C; B withdrew TMP/TEMP and explicit carry)
- Probe 2026-10-01: codex-cli 0.159.2 and pi 0.99.1 pass TMPDIR to shell commands (`os.tmpdir()` and `mktemp -d`). (A)

## Pitfalls
- `--env` reaches only new panes; running leaves keep `/tmp` until recreated. (B,C)
- akrogon tests will write under `/var/tmp/akrogon`; hashing on the fixture root avoids collisions and tests clean their folders. (C) B prefers an injected test root. (B)
- `next` without args closes a merged tab without waiting for B idle (`src/next.ts:744-753`); deletion inherits that existing race. (C)
- Hardcoded `/tmp/<name>` and browser-core's `~/.tamdoma` profile ignore TMPDIR: framework. (A,B,C)

## Noticed, outside this fork
- framework `issues/worktrees/` still holds worker worktrees `emdash-content-fixes-uR1`, `-uR2`, `emdash-conversion-ufix-b`, so worker cleanup also leaks. (C)
