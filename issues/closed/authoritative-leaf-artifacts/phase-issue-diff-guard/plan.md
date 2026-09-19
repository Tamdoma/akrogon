# Plan: phase-issue-diff-guard

`akrogon phase` currently checks the branch for `issues/` files only when entering `check.review` (src/phase.ts:118). This leaf splits that check so the `issues/` refusal runs on every move with a recorded worktree, while the empty-branch refusal stays at `check.review`. Debate is off; this plan synthesizes the brief and locked design directly.

## Decisions

- D1: Split `requireCodeOnly(repo, worktree)` (src/phase.ts:139-147) into two exported helpers. `requireNoIssueFiles(repo: Repo, worktree: string, leafPath: string)` runs `git diff --name-only <target(repo)>...HEAD -- issues` in the worktree and throws `Issue files on leaf branch belong in ${leafPath}:\n${files}` when non-empty. `requireNonEmpty(repo: Repo, worktree: string)` runs the unrestricted diff and throws the existing `Empty leaf branch: no changes against ${target(repo)}` when empty. `requireCodeOnly` is deleted; the `Issue files on leaf branch` and `Empty leaf branch` prefixes are preserved so existing assertions keep passing.
- D2: In `transition()` (src/phase.ts:117-118), replace the review-gated call with two lines in the same position, after `requireClean` and before the `recorded`/`saveState`/`commitMove` block: `if (state.worktree !== undefined) await requireNoIssueFiles(repo, state.worktree, leaf.path);` then `if (requested === 'check.review' && state.worktree !== undefined) await requireNonEmpty(repo, state.worktree);`. `leaf.path` is the authoritative folder because `phaseCommand` resolves the leaf via `findLeaf(repo, slug)` under the registered root's `issues/open/`. No other call sites change; `transition`'s signature is unchanged.
- D3: Order stays `requireClean` → `requireNoIssueFiles` → `requireNonEmpty`. A dirty worktree still reports `Uncommitted work` first, matching the existing test's first refusal.
- D4: New tests in tests/phase.test.ts, all using `fixture()`, `leaf()`, `cli()` and a real `git worktree add -b` worktree exactly as the existing handoff test does:
  - T1 (criterion 3): leaf `stray` at `plan.positions` with `worktree`; in the worktree `mkdirSync` `issues/open/issue/stray`, write `positions-B.md`, `git add issues`, commit. `phase stray plan.rebuttal --slot B` is refused: non-zero code, stderr contains the leaf path (`resolve(f.root, 'issues/open/issue/stray')`) and `positions-B.md`; `readState(path)` shows `phase: 'plan.positions'` and `done: []`. Then `git reset --hard HEAD~1` in the worktree and rerun the same move: stdout is `recorded` (slot A still outstanding) and `done` is `['B']` — the empty planning branch is not refused.
  - T2 (criterion 4): leaf `empty-plan` at `plan.synthesis` with a clean empty worktree branch; `phase empty-plan implement` prints `moved implement`.
  - T3 (criterion 6): leaf `recover` at `failed` with a worktree whose branch carries an `issues/` file; `phase recover implement` is refused with the leaf path in stderr and phase stays `failed`. Leaf `no-wt` at `failed` with no `worktree` field; `phase no-wt implement` prints `moved implement`.
  - Fixture note: `rebuttal` defaults to true in the fixture config, so `plan.positions → plan.rebuttal` is the legal move for T1.
- D5: Prose updates for the widened scope. `src/AREA.md:20` becomes `- Every phase move rejects a dirty worktree and branch changes under \`issues/\`; the empty-branch refusal applies only at review handoff.` `docs/guide/files.html:60` second sentence becomes `The <code>phase</code> command checks this on every move and refuses if it finds one.` `docs/guide/limits.html:63` card body becomes `Every phase move refuses any file under <code>issues/</code> on the branch, and refuses a dirty worktree. The move into review also refuses an empty branch. Agents write issue files only in the registered checkout.` `docs/guide/phases.html:61` and `docs/guide/problems.html:66` stay unchanged — both describe the implement→review move, which is still refused, and neither claims the check is review-only.
- D6: No skills edits. `skills/implement-issue/SKILL.md:39` already states the rule without scoping it to review, so this leaf touches no file the parallel `prompt-leaf-folder` leaf owns.

## Read-first

- `src/phase.ts` — `transition()` guard block at :117-118 and `requireCodeOnly` at :139-147.
- `tests/phase.test.ts` — handoff refusal test (~:127-155) and empty-branch test (~:780-795) are the patterns and the regression surface.
- `tests/helpers.ts` — `fixture`, `leaf`, `cli`; worktrees are created with `git worktree add -b` from `f.root`.
- `src/config.ts` — `target(repo)` at :111 is the diff base; `rebuttal` default at :30.
- `src/state.ts` — `Leaf.path` (:40) is the authoritative folder used in the message.
- `src/AREA.md`, `docs/guide/files.html`, `docs/guide/limits.html` — prose owned by D5.
- `learnings/LESSONS.md` — no lesson changes this plan; the stale-prose lesson is why D5 greps were run.

## Interfaces

- `transition(repo, leaf, requested, explicitSlot, verdict)` — unchanged signature.
- `requireNoIssueFiles(repo: Repo, worktree: string, leafPath: string): Promise<void>` — new, exported (matches `requireClean`/`requireCodeOnly` export style).
- `requireNonEmpty(repo: Repo, worktree: string): Promise<void>` — new, exported.
- `requireCodeOnly` — removed; no other file references it (verify with `grep -rn requireCodeOnly src tests`).

## Checklist

Ordered; each step names its criterion.

1. Write T1, T2, T3 in tests/phase.test.ts (D4). Criterion: the three tests fail against the unmodified src/phase.ts — T1 and T3 because the move is not refused, T2 already passes.
2. Apply D1+D2 in src/phase.ts: split the helper, rewire the two call lines. Criterion: `grep -n requireCodeOnly src/` is empty; `bun run typecheck` passes.
3. Run `bun test tests/phase.test.ts`. Criterion: T1-T3 green and every pre-existing test in the file still passes unchanged (brief criteria 3-6).
4. Apply the three prose edits (D5). Criterion: `grep -rn "handoff" docs/guide/files.html docs/guide/limits.html src/AREA.md` shows no claim that the `issues/` check is review-scoped; `grep -rn "issues/" docs/guide/ skills/*/SKILL.md` shows no remaining review-only wording.
5. Confirm diff scope. Criterion: `git diff origin/main --stat` lists only src/phase.ts, tests/phase.test.ts, src/AREA.md, docs/guide/files.html, docs/guide/limits.html.
6. Run `bun run format`, `bun run typecheck`, `bun test`. Criterion: all pass (criterion 8).

## Verification

Acceptance evidence is functional, per the design: real `akrogon phase` invocations against an isolated fixture repo with a real worktree and real commits. T1's stderr assertions (leaf folder path + `positions-B.md`) are the criterion-2 evidence; T1's reset-and-record and T2 are the empty-branch edge cases; T3 covers `failed` recovery and the no-worktree leaf. Step 6 is the regression gate.

## Operator actions

None. The design names no credentials.

## Open limitation

The guard fires at the next `phase` move, not at commit time: a seat can commit `issues/` files and keep working until it calls `phase`, and a leaf with no recorded `worktree` is never checked. Both are the locked design's scope (no autocorrect, check keyed on `state.worktree`).

## Notes for review

Brief and design agree; no conflicts. Line numbers were verified against this worktree on 2026-09-19.
