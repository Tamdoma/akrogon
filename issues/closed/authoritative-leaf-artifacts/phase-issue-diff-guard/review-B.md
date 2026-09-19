# Review B: phase-issue-diff-guard

Base: `e624357e825e21b38a15c07a435b1ff066c6ba38` (origin/main). Reviewed head: `c9e31af` — `phase: refuse issues/ diffs on every move with a worktree` (5 files, +71/-6). Debate off, so no positions/rebuttals; judged against plan.md, design.md and the brief's done-criteria.

## Findings

None.

## Verification evidence

- Criterion 1-2 (split + call sites + message): `src/phase.ts` diff shows `requireNoIssueFiles(repo, worktree, leafPath)` called on every move with `state.worktree` set and `requireNonEmpty` gated on `requested === 'check.review'`, both after `requireClean` and before `saveState`/`commitMove`. Message is `Issue files on leaf branch belong in ${leafPath}:\n${files}` — `leaf.path` is the authoritative folder under `<root>/issues/open/` via `findLeaf`. `grep -rn requireCodeOnly src tests` is empty; no references to the new helpers outside `src/phase.ts`.
- Criteria 3-6 (tests): the three new tests use real fixture worktrees and commits, assert the leaf path and `positions-B.md` in stderr (functional, not wording), cover the empty planning branch (`recorded`, `done: ['B']`), `plan.synthesis → implement` on an empty branch, `failed` recovery refusal, and the no-worktree leaf moving normally. Existing handoff and empty-branch tests are byte-unchanged.
- Criterion 7 (prose): `src/AREA.md:20`, `files.html:60`, `limits.html:63` now state every-move scope verbatim per plan D5. `phases.html:61` and `problems.html:66` describe the implement→review move only and make no review-only claim — correctly untouched. `grep -rn "issues/" docs/guide/ skills/*/SKILL.md` shows no remaining review-only wording.
- Criterion 8 (checks): I ran `bun run format`, `bun run typecheck`, `bun test` on this head before commit — format clean, `tsc --noEmit` clean, 221 pass / 0 fail. Diff unchanged since.
- AREA.md path check: all seven paths named in `src/AREA.md` exist from the repo root.
- Edge check: a `merge → merged` move after push sees an empty `origin/main...HEAD` diff, so `requireNoIssueFiles` passes and `requireNonEmpty` is correctly not invoked — merged is not refused for an empty branch.
- Diff scope: exactly the five files in the plan's checklist; no out-of-scope edits.

## Verdict

ready
