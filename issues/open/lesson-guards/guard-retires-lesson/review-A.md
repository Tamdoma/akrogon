# Review A: guard-retires-lesson

Base: `2d9beca` · Reviewed head: `e8be187`

## Verification performed

- Full `git diff` of all 6 commits read line by line; `src/lessons.ts`, `src/batch.ts`, `src/phase.ts` traced against `restack`, `buildStack`, `batchCheck`, `batchPush`, `applyStack` call sites.
- `bun test --timeout=30000`: 651 pass / 0 fail. `bun run typecheck`: clean. `bun test --changed=$AKROGON_BASE`: 155 pass. `bun test tests/docs-links.test.ts`: 4 pass.
- `Test-Change:` trailers present on `d195e0e`, `e659ae1`, `e8be187` for `tests/batch.test.ts` + `tests/phase.test.ts`.
- Fresh-agent artifacts (`implementation/fresh-agent/`) inspected: brief-guard carries the retirement criterion, brief-touch does not, verdict is `fix` citing the bar.
- Live git reproductions in `$TMPDIR` scratch repos (commands run, output pasted below):
  1. Union resurrection reproduced: leaf deletes `alpha` line + adds `Applied`; main adds `gamma` adjacent; `git rebase main` leaves the `alpha` line back in `LESSONS.md` — the mechanism under test fires exactly as designed.
  2. Defect F1 reproduced below.
  3. Defect F2 confirmed by code inspection: `removeRetiredLessons` filters on `line.includes(stem)` where stem is `history/alpha` — a line naming `history/alpha-x.md` matches. Reproduced live: after rebase, `LESSONS.md` held `- lesson alpha extended. 2026-10-10. history/alpha-x.md`; `removeRetiredLessons` deleted it (removed `[ "history/alpha" ]`, file empty).

## Fixes

- **F1 — `src/lessons.ts` `retiredLessonsPresent`/`removeRetiredLessons` over-remove lesson lines** — Realistic source: a real rebase (reproduced in scratch repo, pasted above). Two loss shapes in one root cause: (a) stem substring match — a lesson line referencing `history/alpha-x.md` is deleted when `history/alpha` retires; (b) a legitimate new lesson line that happens to reference a retired stem (lesson recurred while the retiring leaf was in flight — the lesson lifecycle explicitly supports re-adding lines) is also deleted. Consequence today: `buildStack`/`merged --check`/the solo one-liner silently drop a lesson the operator or another leaf legitimately keeps — data loss of lesson content on the merge path, the exact thing criterion 2 protects ("with the new one"). The criterion hit: done-criterion 2 requires the pushed file to keep the new line; this removes new lines that merely share a stem or history path. Fix shape: match the lesson line to remove by exact deleted text — collect `-`-lines from `git log -p <base>..<head> -- learnings/LESSONS.md` (per-commit diffs catch lines present at both endpoints), keep only those naming a retired stem, and flag/remove a `LESSONS.md` line only when it equals one of those deleted lines (resurrected lines are byte-identical; a new lesson line added by main differs in text even when it shares the stem).
- **F2 — `skills/merge-issue/SKILL.md` solo one-liner imports `./src/lessons.ts` relative to a consumer worktree** — Realistic source: a real merge on any consumer repo (all 9 other registered repos lack `src/lessons.ts`). The skill text instructs B to run `bun -e "import {mergeBase, removeRetiredLessons} from './src/lessons.ts'; …"` inside the leaf worktree; in a consumer repo `src/lessons.ts` does not exist, so the documented step errors on import (`Cannot find module`) before any re-removal runs. Consequence today: the solo path's only documented re-removal instruction fails on every non-akrogon repo, leaving B with no sanctioned way to satisfy `merged --check` (which does run). Criterion hit: criterion 2's solo half — the skill text is the mechanism there, and it fails at invocation. Fix shape: resolve the installed akrogon root (same pattern as chart-issues' `readlink -f $(command -v akrogon)` — here the binary symlinks to `src/akrogon.ts`, so the import root is `dirname $(readlink -f $(command -v akrogon))`) and import `lessons.ts` from there, or document a `bun -e` that resolves the module path from `process.env.AKROGON_*`/`command -v`. Keep `process.cwd()` as the repo argument.

## Nits

- **N1 — `retiredHistoryStems` stem slicing assumes `.md` suffix** — a future `learnings/history/*.yaml` or extensionless history file yields a wrong stem. Deferred: every shipped lesson file is `.md`; promoting evidence = a non-md history file convention landing.
- **N2 — member `tips` retain resurrected retired lines** — the fixup lands only on the stack top, so `git show <member-tip>:learnings/LESSONS.md` still contains the line. Harmless today (only `top` is pushed and `--check` verifies the top), noted in the implementation report. Promote if any future consumer diffs against member tips.

## Docs sweep

`docs/guide/learn.md`, `docs/guide/merge.md`, `src/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md` header — all edited claims verified against shipped code; no wrong claims. No stale pointers. `tests/docs-links.test.ts` green covers every edited `*/SKILL.md` + guide page; `lesson-rule.md`/`shapes.md` have no relative links (inspected).

## Verdict: fix

Two defects block: F1 (lesson-line data loss on the merge path, reproduced live) and F2 (documented solo command cannot run outside akrogon).
