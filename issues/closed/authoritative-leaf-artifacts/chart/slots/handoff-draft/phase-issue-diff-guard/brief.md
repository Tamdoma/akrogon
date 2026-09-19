# Brief: phase-issue-diff-guard

## What
`akrogon phase` refuses any move whose leaf has a recorded worktree when the branch's net diff against the configured target touches `issues/`. The refusal names the authoritative leaf folder under the registered root and lists the offending paths. The empty-branch refusal (`Empty leaf branch`) stays where it is: only when the requested destination is `check.review`. The refusal runs before any slot completion or phase move is saved.

## Why
`transition()` checks `requireCodeOnly` only when entering `check.review` (src/phase.ts:118), so a seat that commits `positions-B.md` in the worktree copy of the leaf folder has a clean worktree and passes three planning moves. `akrogon next` then reads the authoritative folder, finds no positions files and reports "Debate leaf skipped its debate" (Tamdoma/akrogon#18). The mistake must fail at the first move after it happens.

## Done-criteria
1. `requireCodeOnly` in `src/phase.ts` is split into two checks: one refusing `issues/` paths in `git diff --name-only <target>...HEAD -- issues`, one refusing an empty branch. `transition()` calls the issues check on every move with `state.worktree` set, and the empty-branch check only when `requested === 'check.review'`. Both run before `saveState` or `commitMove`.
2. The issues refusal message contains the absolute authoritative leaf folder (`leaf.path`, under `<repo.root>/issues/open/`) and each offending path. Verify functionally: the test asserts the folder path and one file name appear in stderr, not exact wording.
3. Test in `tests/phase.test.ts`: a leaf at `plan.positions` with a worktree whose branch commits `issues/open/<owner>/<leaf>/positions-B.md` is refused on `phase <slug> plan.rebuttal --slot B`; state phase and `done` are unchanged; after `git reset --hard HEAD~1` in the worktree the same move succeeds with an empty branch (no code yet).
4. Test: a leaf at `plan.synthesis` with a clean empty branch moves to `implement` (empty branch is not refused before review).
5. (B) Test: the existing review-time behavior at `tests/phase.test.ts:127-155` (issue files refused at review) and the empty-branch refusal at `tests/phase.test.ts:780-795` both still pass unchanged.
6. Test: a leaf at `failed` with a worktree whose branch carries an `issues/` file is refused on its recovery move; a leaf with no `worktree` field is not checked and moves normally.
7. `src/AREA.md` "Review handoff rejects dirty worktrees and branch changes under `issues/`" is updated to state the new scope; `grep -rn "issues/" docs/guide/ skills/*/SKILL.md` hits that describe the review-only rule are updated or reported under known limitations in the report.
8. `bun run format`, `bun run typecheck`, `bun test` pass.
