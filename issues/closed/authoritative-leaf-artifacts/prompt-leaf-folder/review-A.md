# Review A: prompt-leaf-folder

Base: e624357e825e21b38a15c07a435b1ff066c6ba38
Reviewed head: 609f93d dispatch prompt carries leaf= authoritative folder
Debate: no — positions-A.md/rebuttal-A.md absent as expected.

## Findings

None. No Fix, no Nit.

## Verification evidence

- `src/next.ts:411` — prompt ends with ` leaf=${leaf.path}`; `leaf.path` is the absolute authoritative folder from `discover()`. Sole prompt construction site (grep `slot=${` over `src/`). Criterion 1.
- `tests/next.test.ts` — all 13 exact-text prompt assertions carry the ` leaf=` suffix (9 planned + 4 found at ~877, 994, 1144, 1211, matching report); remaining non-leaf hits are `includes`/`toContain` assertions untouched per plan. Ends-with and not-`issues/worktrees` assertions present at the plan.synthesis test (~120) and merge test (~679). Criterion 2.
- New spaced-root test renames the repo root to `repo root`, rewrites `repos.repo` in config.yaml, and asserts `prompts[0].text` equals the full prompt with the complete spaced `leaf=` value; the fake harness records `args[3]` verbatim, so a split value fails equality. Criterion 6.
- All four SKILL.md files state the prompt shape with `leaf=<folder>`, carry the pass-artifacts/worktree/manual-fallback sentence, and implement-issue keeps the standalone no-config note beside it. Criterion 3.
- `grep -n "positions-\|rebuttal-\|plan.md\|report.md\|review-" skills/*/SKILL.md` — every write instruction qualified with `leaf=`/`<leaf>`; bare hits are read instructions only. Criterion 4.
- `docs/guide/next.html` names five fields with a `leaf=` example. `README.md` and `tests/command-reference.test.ts` grep empty for `slot=`/`phase=`/`prompt` — report's no-mention claim verified. Criterion 5.
- Design exclusions respected: no `src/phase.ts`, debate gate, `learnings/`, or non-dispatched skill changes; diff is exactly the 7 planned files. No `AREA.md` in the diff, so the area-path check is vacuous.
- Tests exercise real dispatch through the fake herdr binary boundary; no mocks of the unit under test, no prose-wording assertions.

## Checks rerun (code changed)

- `bun run format` — clean.
- `bun run typecheck` (`tsc --noEmit`) — clean.
- `bun test` — 219 pass, 0 fail, 2881 expect() calls, 12 files, 51.45s.

## Verdict

ready

## Merge evidence (slot A)

- Rebase: `609f93d` → `c8dac2a` onto `origin/main` `c9e31af` (`phase: refuse issues/ diffs on every move with a worktree`), no conflicts.
- `AKROGON_BASE` refreshed: `c9e31af6f3d51be980b4f858d222c69ff0940894`.
- `bun run format` — clean. `bun run typecheck` — clean. `bun test` — 222 pass, 0 fail, 2894 expect() calls, 51.42s (3 new tests arrived with the rebase target).
