# Review A: rename-vocabulary

Base: d554f78d87bb7b29a4da8528da4c641e3ba66785
Reviewed head: 0a6ea42 Rename chart vocabulary to forks, taken, fog and off route
Diff: 9 files, +56/-60. No `issues/` paths on the branch, no AREA.md files in the diff.

## Verification evidence

- Criterion 1: all eight words present in `skills/chart-issues/` with the design's meanings (territory map SKILL.md:33, fog SKILL.md:43 + shapes.md `## Fog`, fork throughout, question, round SKILL.md:19/questions.md, chart, off route shapes.md:32,80).
- Criterion 2: `grep -rniE "decision|batch|not yet specified|out of scope" skills/chart-issues/` matches only binding-decision lines (SKILL.md:51; shapes.md:80,138-139,148,168). Pass.
- Criterion 3: shapes.md:80 states all three required sentences verbatim in substance: one fork file holds one or more questions always presented on one screen; a fork is taken when every material question is taken; a pre-handoff correction is a new fork naming the superseded one. Pass.
- Criterion 4: `bun test` 217 pass 0 fail; `bun run typecheck` clean; `bun run format` clean. Pass.
- Criterion 5: direct run at the root is blocked pre-merge (worktree schema rejects `prompted_at` written by pending root work — confirmed). Verified via `AKROGON_HOME=/tmp/akrogon-verify-mTJZ bun <worktree>/src/akrogon.ts status --charts` against a scratch repo holding byte-identical migrated charts (diff -r clean): header `CHART TAKEN FOG STAGE AGE`, `charting-vocabulary 5/5 0 handed off`, `status-empty-open 1/1 0 handed off`. Pass.
- Criterion 6 at the authoritative root: `find issues/chart issues/closed -type d -name decisions` prints nothing; old-heading grep prints nothing. All 10 charts migrated (2 live + 8 closed), `forks/` dirs present. Pass.
- Criterion 7: docs grep matches only files.html:99 (design.md locked-decisions row). files.html:102 and create.html:63 also reworded, consistent with the criterion admitting only that row. README.md:54 uses "forks". Pass.
- D5 spot checks: loop-hardening INTAKE.md:278, akrogon-loop forks/multi-chart-layout.md:32, install-prune-dead-links forks/harness-folders.md:7 all reference `forks/`. Remaining `decisions/` strings are verbatim history in slots/, INTAKE sources and fork bodies — allowed by D5.
- status.ts: `forks/` read, `/^## Taken\s*\n\s*\S/m` taken count, `section(markdown,'Fog')` fog count, stage rule unchanged, header `['CHART','TAKEN','FOG','STAGE','AGE']`. Matches D3/design literally. Test fixtures updated and assert `1/2`, `2` fog, `handed off`, `empty` for a `- None.` fog bullet (section filters none/nothing bullets).

## Findings

- N1 (Nit): plan D2/checklist step 4 ordered committing the migrated `issues/` paths on main; they are left uncommitted (79 dirty entries under issues/). The implementer's stated reason — avoiding local-main divergence — was already priced in by plan risk R2, so the deviation is unexplained beyond restating the accepted risk. No done criterion fails (all greps and the e2e check run against the working tree), but the migration is one `git clean`/`checkout` away from silently breaking `status --charts` after merge. Recommend committing the issues/ paths on main before or at merge.
- N2 (Nit): criterion 5's literal wording is `akrogon status --charts` in this repo; verification ran the worktree entrypoint against a scratch AKROGON_HOME. The blocker is real (pending root work's `prompted_at` key) and the plan's D7 anticipated the worktree-entrypoint path, so evidence is adequate; the installed-command pass remains to be confirmed post-merge.

## Verdict

nits — all seven done-criteria verified with concrete evidence; two non-blocking findings.

## Merge evidence

- Rebase onto origin/main (d554f78): no-op, branch already on top; AKROGON_BASE unchanged.
- Checks in worktree at 9ab8064: `bun run format` clean, `bun run typecheck` clean, `bun test` 217 pass 0 fail, `bun test --changed=$AKROGON_BASE` 15 pass 0 fail.
