# Review B: prompt-leaf-folder

Base: e624357e825e21b38a15c07a435b1ff066c6ba38
Reviewed head: 609f93d dispatch prompt carries leaf= authoritative folder
Verdict: ready

## Criteria check

1. `src/next.ts:411` appends ` leaf=${leaf.path}` after `phase=`; `leaf.path` is the authoritative folder from `discover()`. Tests assert `endsWith(' leaf=${f.root}/issues/open/...')` at the plan.synthesis test (line ~120) and the merge test (~679); all 13 exact-text assertions carry the suffix. Met.
2. `split(' leaf=')[1]).not.toContain('issues/worktrees')` asserted in both tests, each with a worktree allocated in the same run. Met.
3. All four skills state `leaf=<folder>` on the prompt line, carry the artifacts-under-leaf/worktree/fallback sentence, and implement-issue keeps the standalone no-config note beside it. Met.
4. `grep -n "positions-\|rebuttal-\|plan.md\|report.md\|review-" skills/*/SKILL.md` — every write instruction qualified with `under the leaf= folder` or `<leaf>/`; remaining bare hits are read instructions. Met.
5. `docs/guide/next.html:68` updated to five fields with a `leaf=` example. `README.md` and `tests/command-reference.test.ts` have no prompt-shape mention (grep-verified); report states this. Met.
6. New test renames the fixture root to `repo root`, rewrites `repos.repo` in config.yaml, and asserts the recorded prompt equals `plan-issue spaced slot=B phase=plan.synthesis leaf=${spaced}/issues/open/issue/spaced` — one argv element, complete spaced value. Met.
7. `bun run format` clean, `bun run typecheck` clean, `bun test` 219 pass / 0 fail / 2881 expects (rerun by this reviewer, not just report-trusted). Met.

## Notes

- No AREA.md in the diff; the area-file existence check does not apply.
- Design exclusions respected: no phase gate, no artifact-existence check, no lessons relocation, no changes to non-dispatched skills.
- `debate: no`, so no positions/rebuttals expected.

## Findings

None.
