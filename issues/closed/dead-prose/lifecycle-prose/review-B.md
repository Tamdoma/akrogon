# Review B: lifecycle-prose

Base: 735cd630afe03fe21b773aafeabdddddc88ca612 (origin/main)
Reviewed head: 4b9bce7 on branch lifecycle-prose
Debate: no — no positions/rebuttals expected or read.

## Verification evidence

Reproduced every done-criterion against the worktree:

1. `grep -rn "questions/" skills/ docs/guide/` → empty. Repo-wide sweep of `src/ tests/ plugin/ docs/reference-index.md README.md` also empty; no dangling references.
2. `grep -rni scrambled skills/` → empty. `grep -c "^Last operation:" skills/*/SKILL.md` and `grep -c "^Next:" skills/*/SKILL.md` → 1 for all eight skills.
3. `grep -rn "diagnosis paragraph\|A's diagnosis" skills/ docs/guide/` → empty; `grep -rn "moved failed" skills/` → empty. seed-issue:26 and create.html:61 retain their intake-exclusion "diagnosis" as designed. `tests/phase.test.ts:87` still contains a `moved failed` literal; tests/ is excluded scope and the command surface is unchanged.
4. `readlink skills/check-issue/ponytail.md` → `../implement-issue/ponytail.md`; `cmp` vs target exits 0; `git ls-files -s` shows mode 120000.
5. `grep -rn "leaf branch" skills/check-issue/SKILL.md` → empty; `grep -n "registered checkout" skills/check-issue/SKILL.md skills/merge-issue/SKILL.md` → exactly the two lesson lines (check-issue:41, merge-issue:25).
6. `git diff origin/main -- skills/implement-issue/SKILL.md` → hunks @@ -22,8 +22,6 @@ and @@ -65,4 +63,4 @@ only (orig lines 25-26 and 68). `git diff origin/main -- skills/plan-issue/SKILL.md` → hunks @@ -24,8 +24,6 @@ and @@ -64,5 +62,3 @@ only (orig lines 27-28 and 67-68). implement-issue:29 and plan-issue:31 byte-identical to origin/main (cmp verified).
7. `bun test` 217 pass 0 fail; `bun run typecheck` clean; `bun run format` all unchanged (run at implement; no code changed since).

Additional checks:

- No `AREA.md` in the diff; the area-path check is vacuous.
- `grep -rni "peer question\|peer-question" skills/ docs/ src/ tests/` → empty; removal is complete, not partial.
- phases.html:66 and problems.html:61 match the design's after-HTML verbatim, including the preserved 6-space indent and untouched sibling cells.
- Design exclusions confirmed untouched: learn.html:57-58, phases.html:64, files.html:58-60/:95, check-issue:14, chart-issues, seed-issue, init-issues.
- Full diff is 10 files, +7/-60; every hunk maps to a plan line.

## Findings

- Nit: brief done-criterion 6 says the plan-issue diff touches lines 68-69; the file has 68 lines so the actual hunk is orig 67-68 (scrambled line plus preceding blank). Intent satisfied, criterion text off by one; already disclosed in report.md.

## Verdict

nits
