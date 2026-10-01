# Positions A: leaf-temp-dir

## Recommendation

Build the derived per-leaf TMPDIR exactly as designed. One function `leafTemp(repo, slug)` in `src/config.ts` beside `worktreeStore` returns `/var/tmp/akrogon-<uid>/<20>-<12>`. `allocate` creates parent and leaf (0700, ownership checked) on every dispatch and adds one `--env TMPDIR=...` to `placement`, so tab create and both pane splits inherit it. Delete with `rmSync` recursive force plus `git worktree prune` at repo root in two places: `tab_closed` branch when the owner is merged, and `cleanupMerged` catch-up before the `issues/open` early return when the tab had no live panes before close. Failed leaves keep their folder. Test seam is an internal env override, no config key, no flag, no guide mention.

Test seam: `AKROGON_LEAF_TEMP_ROOT` overrides the `/var/tmp/akrogon-<uid>` root when set. Production never sets it. `tests/helpers.ts` `cli()` defaults it to `<fixture-home>/leaf-temp` unless the caller passes an explicit value, so every CLI test is isolated without per-test setup.

Read-first: `src/next.ts`, `src/config.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`, `docs/guide/merge.md`, `docs/guide/problems.md`, `docs/guide/limits.md`.

## Concrete changes

- `src/config.ts` (~127): add exported `leafTemp(repo: Repo, slug: string): string` beside `worktreeStore`. Internal root is `process.env.AKROGON_LEAF_TEMP_ROOT ?? \`/var/tmp/akrogon-${process.getuid()}\``. Leaf is `resolve(root, \`${slug.slice(0, 20)}-${createHash('sha256').update(repo.root + "\n" + slug).digest('hex').slice(0, 12)}\`)`. Slug regex (`src/state.ts`) allows only `[a-z0-9-]`, so the prefix cannot contain a slash. No schema change, no export for the root.
- `src/next.ts` imports (~1): add `mkdirSync`, `chmodSync`, `lstatSync`, `rmSync` to the `node:fs` import; import `leafTemp` from `./config`.
- `src/next.ts` `allocate` (~298-310): after `ensureWorktree`, before `placement`, ensure parent and leaf exist with mode 0700. Refuse a symlink (`lstatSync().isSymbolicLink()`) or a uid mismatch (`statSync().uid !== process.getuid()`) with an error naming the path. Use `mkdirSync(path, { mode: 0o700 })` then `chmodSync(path, 0o700)` so umask cannot weaken it; if the path exists as a non-directory, throw rather than delete. Then add `'--env', \`TMPDIR=${leafTemp(repo, slug)}\`` to `placement`. This covers tab create (~315) and both splits (~330, 338) including missing-seat recovery, with no extra branching.
- `src/next.ts` `closeMergedTab` (~552): return `Promise<boolean>` (`true` when the tab had live panes before close, `false` when `tab` is undefined or already gone). Herdr call unchanged.
- `src/next.ts` `cleanupMerged` (~559): capture `hadLive` from `closeMergedTab`. Before the `issues/open` early return, call shared `removeLeafTemp(repo, slug)` only when `!hadLive`. Then keep the open check and worktree/branch removal unchanged.
- `src/next.ts` shared `removeLeafTemp(repo, slug)`: `existsSync` check first (missing folder costs one stat, no git call); else `rmSync(path, { recursive: true, force: true })` then `command(['git', 'worktree', 'prune'], repo.root)`. Let errors throw so `cleanupRepos` reports them and the next sweep retries.
- `src/next.ts` `tab_closed` branch (~721): after `dispatchLeaf` and dependents, re-discover the owner by slug; when its phase is `merged`, call `removeLeafTemp` inside `try`/`report(invocation, repo.name, leaf.path, error, slug)` matching `cleanupRepos` (~642-650). Non-merged owners do nothing here.
- `tests/helpers.ts` `cli()`: default `AKROGON_LEAF_TEMP_ROOT` to `resolve(f.home, 'leaf-temp')` when the caller env does not set it.
- `tests/next.test.ts`: extend the missing-seat cases (~1784-1814) to assert `--env TMPDIR=...` on the replacement splits without changing topology; add fresh-allocation (tab create plus B split carry TMPDIR, folder exists, `statSync().mode & 0o777 === 0o700`), path-length (200-char slug plus long root, 10-digit uid, at most 62 bytes, 20-char prefix, distinct roots differ), `tab_closed` merged (folder gone, `git worktree list` drops the stale entry inside it) versus failed (folder kept), sweep with no live panes (deletes even under `issues/open`) versus live panes (closes tab, keeps folder), recreate-missing on existing tab, and fixture-root (created path starts with fixture home).
- Skills: one sentence each in `skills/implement-issue/SKILL.md` (Shared context), `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`: temp files, logs and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder.
- Docs: update `docs/guide/merge.md`, `docs/guide/problems.md`, `docs/guide/limits.md` merged-cleanup lines to state the temp folder is deleted once the merged tab is confirmed gone. Sweep other guide lines about merged cleanup for contradictions. `src/AREA.md` names no allocate env today, so expect no change there; verify at implement.

Fuzzy terms fixed: ownership checked means not a symlink and `stat.uid === process.getuid()`. Confirmed gone means a `tab_closed` event arrived or a sweep saw zero live panes for that tab before closing. Live panes means `panes()` entries with matching `tab_id`.

Scenario: dispatch `leaf-temp-dir` creates `/var/tmp/akrogon-1000/leaf-temp-dir-<12>` 0700 and passes it to tab create and splits. Operator merges, seat B goes idle, hook closes the tab, `tab_closed` deletes the folder and prunes. If the hook is missed, the next `akrogon next` sweep sees no live panes and deletes before the open check. A failed leaf keeps its folder for diagnosis. A sweep that finds live panes only closes the tab and leaves the folder for the next run.

## Risks

- R1: prune failure after a successful `rm` leaves a stale `git worktree list` entry with no retry, because later sweeps skip the git call when the folder is gone. Stale entries are repo-wide, so the next successful leaf-temp deletion in the same repo prunes them. Accept; do not add a git call per merged leaf per sweep.
- R2: ownership refusal inside `allocate` becomes a dispatch skip with exit 1. A prior sudo run or a full `/var/tmp` stalls the leaf until the operator fixes the path named in the error. That is the correct stop; the message must name the path and the fix.
- R3: `fake-herdr.ts` ignores `--env`, so tests prove placement only through the `.calls` log, not through pane shell env. Real-herdr delivery was already proved on 2026-10-01 (herdr 0.9.1 tab create and pane split reached `os.tmpdir()` and `mktemp -d`). No live herdr run needed for merge.
- R4: leaves running at rollout keep their old env until panes are recreated. They keep writing to `/tmp` until the next allocation recreates their panes. Documented exclusion, no migration.

## Simpler alternative

Put scratch inside the leaf worktree (for example `<worktree>/tmp`) and skip the new root, creation checks and two deletion sites. This fails three locked constraints: the framework worktree root alone is 57 chars, so any worktree path blows the measured 62-byte Chromium socket limit; temp files in a worktree make `akrogon phase` refuse it as dirty (`src/phase.ts` `requireClean`); and a bare slug path collides for the same slug in two repos. The derived `/var/tmp` path with repo-root hash is the smallest form that clears all three.

## Acceptance evidence

- C1: `tests/next.test.ts` fresh allocation plus extended missing-seat cases assert `--env TMPDIR=<leafTemp>` on tab create and replacement splits via `calls()`, and `statSync` mode 0700 after dispatch.
- C2: path unit test with a 200-char slug, long repo root and 10-digit uid asserts byte length at most 62, 20-char slug prefix and distinct paths for two roots.
- C3: `tab_closed` tests assert merged deletes the folder and drops the stale worktree entry from `git worktree list`, while failed keeps the folder.
- C4: sweep tests assert no-live-panes deletes even under `issues/open`, and live-panes closes the tab and keeps the folder.
- C5: existing-tab dispatch after manual `rm` recreates the folder.
- C6: helpers default plus one test asserting the created path starts with the fixture root and no test writes the real `/var/tmp/akrogon-<uid>`.
- C7: review only, no wording tests per standing design; grep skills and guides for the one-line rule and consistent cleanup text.
- C8: `bun run format`, `bun test`, `bun run typecheck` pass.
