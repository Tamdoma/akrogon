# Brief: leaf-temp-dir

## What
Each leaf gets one private temp folder on disk, `/var/tmp/akrogon-<uid>/<first 20 slug chars>-<first 12 hex of sha256(repo.root + "\n" + slug)>`. `akrogon next` creates it (mode 0700, parent 0700, ownership checked) on every dispatch and exports it as `TMPDIR` to the leaf tab and every pane split, so seats and their workers inherit it. When a merged leaf's tab is confirmed gone, akrogon deletes the folder and runs `git worktree prune` at the repo root: in the `tab_closed` hook branch when the owning leaf is merged, and in `cleanupMerged` as catch-up when the folder exists and the tab had no live panes before `closeMergedTab` ran, before its `issues/open` early return. (C) Failed leaves keep their folder. implement-issue, check-issue and merge-issue each gain one line: temp files, logs and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder. The guide docs describing merged-leaf cleanup say the same.

## Why
Tamdoma/akrogon#49: on 2026-10-01 the operator's `/tmp` (RAM tmpfs) reached 98% of its inode limit from seat, worker and test leftovers that nothing deletes, which can stall every running seat at once. Each `node_modules` fixture copy costs about 66k inodes. A disk folder owned by the leaf and removed with it removes that class. The path must stay short: system Chromium aborts with `Socket path too long` once TMPDIR exceeds 62 bytes (probe 2026-10-01), and slugs and repo keys have no length cap.

## Done-criteria
1. Tests in `tests/next.test.ts` through the fake herdr show that fresh allocation carries `--env TMPDIR=<leaf temp folder>` on the tab create and the B-pane split, that recovery on an existing tab carries it when replacing either recorded seat (extend the existing missing-seat scenarios, `tests/next.test.ts:1784-1814`, without changing allocation topology), and that after dispatch the folder exists with mode 0700. (B,C)
2. A test shows the leaf temp path, for a 200-character slug and a long repo root, has at most 62 bytes for a 10-digit uid, starts with the slug's first 20 characters, and differs for the same slug in two repo roots.
3. A test shows a `tab_closed` hook event for a merged leaf's tab deletes its temp folder and that a stale registered worktree inside it no longer appears in `git worktree list`; the same event for a non-merged leaf (failed) leaves the folder in place.
4. A test shows a sweep (`akrogon next` without an event in a repo) deletes a merged leaf's temp folder when its tab had no live panes at the start of the sweep, including while the leaf is still under `issues/open`; when the tab still had live panes, the sweep closes the tab and leaves the folder. (C)
5. A test shows a dispatch recreates a missing temp folder for a leaf whose tab already exists.
6. No test in the suite creates anything under the real `/var/tmp/akrogon-<uid>`: the test helpers point the root at the fixture, and a test asserts the fixture root was used.
7. `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` and `skills/merge-issue/SKILL.md` each state the `$TMPDIR` rule once; `docs/guide/merge.md`, `docs/guide/problems.md` and `docs/guide/limits.md` describe temp-folder deletion when a merged leaf's tab closes, and no guide line contradicts it.
8. `bun run format`, `bun test` and `bun run typecheck` pass.

Credentials: none. Human prerequisites: none (the operator's 7-day `tmp-sweep` loop was added and tested on 2026-10-01 outside this leaf).
