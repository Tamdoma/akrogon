# Report: phase-issue-diff-guard

## Changed files and reasons

- `src/phase.ts` — `requireCodeOnly` split into `requireNoIssueFiles(repo, worktree, leafPath)` (runs on every move with `state.worktree` set, message names the authoritative leaf folder and offending paths) and `requireNonEmpty(repo, worktree)` (runs only when `requested === 'check.review'`). Both run before `saveState`/`commitMove`; `requireClean` still runs first (D1-D3).
- `tests/phase.test.ts` — three new tests (D4): planning move refused with leaf path + `positions-B.md` in stderr then `recorded` after `git reset --hard HEAD~1`; `plan.synthesis` with empty branch moves to `implement`; `failed` leaf with `issues/` file refused on recovery while a no-worktree leaf moves normally.
- `src/AREA.md`, `docs/guide/files.html`, `docs/guide/limits.html` — prose updated from review-only to every-move scope (D5). `phases.html` and `problems.html` verified unchanged-needed and left byte-identical.

## Commands run

Worker 1 (brief-1), `bun test --changed=$AKROGON_BASE` (base e624357e825e21b38a15c07a435b1ff066c6ba38):
- Red: 21 pass, 2 fail — the two new refusal tests failed with `Expected: not 0, got 0` before the code change.
- Green: 23 pass, 0 fail, including unchanged handoff and empty-branch tests.
- `grep -rn requireCodeOnly src tests`: empty.

Worker 2 (brief-2): same changed-test command, 23 pass 0 fail; greps confirmed no review-only wording remains in `docs/guide/` or `skills/*/SKILL.md`.

B, full blocking checks in the worktree:
- `bun run format` — clean (all files unchanged).
- `bun run typecheck` (`tsc --noEmit`) — clean.
- `bun test` — 221 pass, 0 fail, 2887 expect() calls across 12 files.

## Base and head

- Base: `e624357e825e21b38a15c07a435b1ff066c6ba38` (origin/main)
- Committed head: `c9e31af` — `phase: refuse issues/ diffs on every move with a worktree` (5 files, +71/-6)

## Known limitations

- The guard fires at the next `phase` move, not at commit time: a seat can commit `issues/` files and keep working until it calls `phase`. A leaf with no recorded `worktree` is never checked. Both are the locked design's scope (no autocorrect, check keyed on `state.worktree`).

## Unverified criteria

None. All eight done-criteria verified functionally.
