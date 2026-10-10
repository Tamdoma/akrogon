# Report: merge-clean-worktree

Base `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`, head `564a125c81dde5325668f64c6419efaf62d6b7ca` (lane `merge-clean-worktree`). Three worker commits, all landed: `d935fec` tests, `7748be9` docs, `564a125` implementation.

## Changed files and reasons

- `tests/batch-dispatch.test.ts` — T1 (applied `top=` form: root/tracked-dir/ignored-parent empty folders removed, all files + ignored paths + `.env` link byte-identical), T2 (`solo` form via dirty holder), T3 (extended the dirty-holder test with `empty-dirty/`), T4 (EACCES removal failure stops the prompt, no prompt recorded, folder survives). `Test-Change:` trailer on `d935fec`.
- `src/batch.ts` — `removeEmptyUntrackedDirs(worktree)`: `ls-files -c -o` ∪ `ls-files -o -i` file set; `readdirSync` walk skipping `.git`/symlinks/gitlinks; `git check-ignore -z --stdin` marks ignored dirs; non-ignored dirs holding no file or ignored entry removed deepest-first with `rmdirSync` (non-recursive: a racing file fails ENOTEMPTY rather than deleting work).
- `src/shell.ts` — `run`/`command` gained an optional trailing `stdin?: string`; existing callers untouched.
- `src/next.ts` — `dispatchSlot` calls the helper after the `idle(ready)` gate, guarded by `mergeContext !== undefined && state.worktree !== undefined && existsSync(state.worktree)`; failures propagate to `dispatchLeaf`'s existing `report` path, skipping the prompt.
- `skills/merge-issue/SKILL.md` — one clause at :41 and :51: the command removed empty untracked folders before the prompt; ignored files remain.

## Worker deviations from sub-brief 3 (verified on live git/Bun, same semantics)

- `check-ignore -z --stdin` input is NUL-joined, not newline-joined: on git 2.56 `-z` makes stdin NUL-separated, LF input matches nothing. Removes the plan's newline-in-dirname edge too.
- `rmdirSync` instead of non-recursive `rmSync`: Bun's `rmSync` on a dir without `recursive` throws EISDIR. Both are non-recursive empty-dir removal.

## Commands run and results

- Fail-first (criterion 1, after `d935fec` on lane): `AKROGON_BASE=1d7d536… bun test --changed="$AKROGON_BASE" --timeout=30000` → 24 pass, 4 fail, exactly the new removal assertions (`e1`, `solempty`, `empty-dirty` still present; T4 prompt still sent).
- `bun test tests/batch-dispatch.test.ts --timeout=30000` → 28 pass, 0 fail (~5s).
- `bun run format` → clean on leaf files; rewrote unrelated prettier drift in `src/status.ts`, reverted per learnings/2026-10-08 (~1min wall).
- `bun run typecheck` → clean.
- `bun test --timeout=30000` → 649 pass, 0 fail, 33 files (52.4s wall).
- `bun test --changed="$AKROGON_BASE" --timeout=30000` → 619 pass, 0 fail, 28 files (51.3s wall).
- `grep -n "empty untracked" skills/merge-issue/SKILL.md` → hits on lines 41 and 51.
- Worker worktrees `merge-clean-worktree-u{1,2,3}` created detached at lane HEAD and removed after cherry-pick; `git worktree list` shows only the lane.

## Criteria mapping

1. Folders gone before prompt in both forms — T1/T2, fail-first then green.
2. Byte-identical files/ignored/tracked — T1 comparisons including `.temp/out`, `node_modules` file, `.env` symlink, `up/ign.txt`, empty ignored `td/ige/` kept.
3. Dirty worktree keeps changes — T3.
4. Failed removal stops prompt — T4 (exit 1, folder path in stderr, no prompt, folder present).
5. Skill clause — grep evidence above.
6. Blocking checks — all green above.

## Known limitations

- Ignored-file leftovers (stale `.temp/` output) are not covered — stated plan limit, foreclosed alternative 1b.
- A `mkdir` racing an already-removed parent fails ENOENT and aborts that prompt — consistent with criterion 4's stop rule.
- T2 reaches the `solo` form via the dirty-holder path (`{ solo: true }` in `toMerge` is inert — `readState` strips it); it is the only solo shape producible in one pass.

## Unverified criteria

None.
