# Review brief D: release-slim (footprint)

You are slot D. Review origin/main..HEAD in /home/ivan/.akrogon/worktrees/akrogon/release-slim (one commit, one line in .gitattributes: `/issues export-ignore`). Why: issues/chart/footprint/forks/map.md M4 and X1 (B's A2): issues/ is 180 of 186 MB in every release built by `git archive` (src/release.ts:65).

Look for concrete defects only: any code, skill, script or test that reads issues/ (or anything under it) from a release folder / toolRoot / current link / import.meta.dir, which would now be missing. Check src/config.ts toolRoot uses, src/install.ts, src/state-home.ts, skills/*/scripts, tests/rollback.test.ts and self-update tests. Run only targeted test files you judge relevant, `--max-concurrency=5`.

Write slots/review-D-release-1.md: `Verdict ready|fix`, base and head, numbered findings with file:line and a scenario. Then run: hc send t126 "done D: <path>"
