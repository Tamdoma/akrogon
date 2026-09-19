# Review A: phase-issue-diff-guard

Base: e624357e825e21b38a15c07a435b1ff066c6ba38 (origin/main)
Reviewed head: c9e31af `phase: refuse issues/ diffs on every move with a worktree` (5 files, +71/-6)
Debate: no — no positions/rebuttal artifacts expected.

## Verification evidence

- `git diff e624357...HEAD --stat`: exactly the five files named in plan step 5 (src/phase.ts, tests/phase.test.ts, src/AREA.md, docs/guide/files.html, docs/guide/limits.html). Working tree clean.
- src/phase.ts: `requireCodeOnly` split into `requireNoIssueFiles(repo, worktree, leafPath)` and `requireNonEmpty(repo, worktree)`, both exported. Call order in `transition()` is `requireClean` → `requireNoIssueFiles` (every move with `state.worktree`) → `requireNonEmpty` (only `requested === 'check.review'`), all before `saveState`/`commitMove`. Message prefixes `Issue files on leaf branch` and `Empty leaf branch` preserved; refusal now names `leaf.path` (the authoritative folder) per criterion 2.
- `grep -rn requireCodeOnly src tests`: empty.
- tests/phase.test.ts: three new tests use `fixture()`, `leaf()`, `cli()` and real `git worktree add -b` worktrees, matching the existing handoff test pattern. T1 asserts leaf path + `positions-B.md` in stderr, unchanged state, then `recorded` after `git reset --hard HEAD~1` (criteria 2, 3). T2 covers `plan.synthesis` → `implement` on an empty branch (criterion 4). T3 covers `failed` recovery refusal and the no-worktree leaf (criterion 6). Assertions are content-based, not exact wording; no mocks of the unit under test.
- Routing verified against src/routing.ts: `plan.positions` requires A+B so T1's `recorded` is correct; `plan.synthesis` auto-selects B; `failed` skips slot checks.
- AREA.md check: all paths named in src/AREA.md and tests/AREA.md exist from repo root (single-command existence check).
- Prose: `grep -rn "issues/" docs/guide/ skills/*/SKILL.md` shows no remaining review-only claim; phases.html/problems.html correctly still describe the implement→review refusal. src/AREA.md:20 states the new scope.
- Rerun blocking checks in the worktree: `bun run format` clean, `bun run typecheck` clean, `bun test` 221 pass / 0 fail / 2887 expects.
- Report accuracy: base/head, file list, and command results match what I reproduced. Known limitations match the plan's open limitation (guard fires at next move; no-worktree leaves unchecked) — locked design scope, not a defect.

## Findings

None.

## Verdict

ready

## Merge evidence (slot A)

- Rebase: `git fetch origin` + `git rebase origin/main` — branch already up to date; head unchanged at `c9e31af`. `git merge-base --is-ancestor origin/main HEAD` confirms rebased onto origin/main (e624357). No conflict, no range-diff needed.
- AKROGON_BASE after rebase: e624357e825e21b38a15c07a435b1ff066c6ba38 (unchanged).
- Checks on rebased head: `bun run format` clean; `bun run typecheck` (tsc --noEmit) clean; `bun test --changed=$AKROGON_BASE` 23 pass / 0 fail; `bun test` 221 pass / 0 fail / 2887 expects.
