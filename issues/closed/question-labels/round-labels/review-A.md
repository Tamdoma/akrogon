# Review A: round-labels

Base: `d6f42f8493f909b3e19c46b57d4dabf5f92e8ce4`
Reviewed head: `e7106c4` ("Relabel round template to per-round 1/1a labels")

Debate was off (direct synthesis); no positions/rebuttal artifacts, expected.

## Verification evidence

- AC1: Worktree `skills/chart-issues/assets/questions.md` template block shows `### 1 ·`, `### 2 · ...`, `- **1a (recommended)**`, `- **1b**`, reply key ``Reply `1a 2b`, or a numbered free-text answer.``. No `Q1`, `Q2`, `1-A`, `2-B`, `**A`, `**B` remains in the block.
- AC2: Line-27 paragraph ends with "Label questions `1`, `2` and options `1a`, `1b`, `2a`, and use no other code scheme in a round.", added directly after the restart-at-1 sentence, which is kept verbatim. Matches design target and D3.
- AC3: `grep -rnE "\bQ[0-9]\b|\b[0-9]-[A-B]\b" skills/ docs/` from worktree root -> exit 1, no output.
- AC4: `git status --porcelain` clean; `git diff --stat` shows 1 file, 6 insertions, 6 deletions, all inside `questions.md`. Matches D1 scope.
- AC5: Report records `bun run format` exit 0, `bun test` 326 pass / 0 fail, `bun run typecheck` exit 0 on the lane after cherry-pick. Markdown-only diff does not affect tests; no rerun needed.

## Doc surface check

- `docs/reference-index.md` links `skills/AREA.md`, which exists; `AREA.md` names no chart-issues files, so no stale pointer.
- `skills/chart-issues/SKILL.md` and `assets/shapes.md` carry no label-scheme text that would now conflict (verified by grep).
- Live check: `~/.claude/skills/chart-issues` is a symlink to the registered checkout, so the change goes live on merge. Consistent with the leaf contract.

## Findings

None. No Fix, no Nit.

## Verdict

`ready`

## Merge evidence

- Rebase onto `origin/main` clean; old base `d6f42f8493f909b3e19c46b57d4dabf5f92e8ce4`, new base `b1739908342dd98ee575fefa58a7372f0b9bfda4`, rebased head `19f71f4`. No conflicts, no range-diff needed.
- `bun run format`: exit 0, all files unchanged.
- `AKROGON_BASE=b1739908... bun test --changed`: 0 pass / 0 fail, no test files affected (markdown-only).
- `bun test`: 326 pass / 0 fail, 3863 expect() calls, 15 files, 154.83s.
- `bun run typecheck` (tsc --noEmit): exit 0.
- No Nits held; no learning to record.
