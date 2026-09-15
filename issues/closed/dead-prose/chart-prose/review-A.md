# Review A: chart-prose

Base: 735cd630afe03fe21b773aafeabdddddc88ca612
Reviewed head: f466617dfd65b2326f6d80ac856477e17ddef8c8 (branch chart-prose)

Debate: no — positions-A.md/rebuttal-A.md absent as expected. No AREA.md in diff.

## Findings

None.

## Verification evidence

Diff scope: `git diff 735cd63..HEAD --stat` lists only `skills/chart-issues/assets/{questions.md,shapes.md,standing-design.md}` — matches owned surfaces.

Done criteria, all run from worktree root:

1. `grep -n "never cut" skills/chart-issues/assets/questions.md` → empty. New sentence matches design literal verbatim, including the unchanged continuous-numbering sentence.
2. `grep -rn "Forks open" skills/chart-issues/` → empty; `grep -c "^## Fog$" shapes.md` → 1. Template now reads Forks taken / Fog / Off route.
3. `grep -n "binding only for the answer it changes" shapes.md` → line 77, one line. Old never-reopened sentence fully replaced; open-inventory sentence appended at paragraph end; all other sentences in the paragraph unchanged.
4. `grep -n "installed path" shapes.md` → line 139, the new placeholder. "Copy every binding decision" sentence at the following paragraph intact.
5. `grep -n "verbatim into each leaf design" standing-design.md` → empty; `grep -n "installed path" standing-design.md` → line 13.
6. `grep -n "plan.positions when debate" shapes.md` → line 149, the sample phase line.
7. Preflight paragraph (line 163) ends with the refusal sentence.
8. `grep -n "before state.yaml" shapes.md` → line 167; inserted before "Then run `akrogon status`" as designed.

Repo-wide greps (excluding issues/): "Forks open", "never cut", "verbatim into each leaf", "creation-locked" hit only historical review/audit docs and learnings — not live contracts. `src/` and `tests/` do not read these assets (grep empty), so no code parses the removed section.

Consistency: SKILL.md:37 "every fork in every chart is taken" and SKILL.md:45 handoff-readiness rule agree with the new open-inventory sentence and preflight refusal. SKILL.md untouched per exclusion.

Checks: report records `bun test` 217 pass, `typecheck` clean, `format` clean. Prose-only diff with no code readers; no rerun warranted.

## Verdict

ready

## Merge evidence (slot A)

- Rebase: `git fetch origin` + `git rebase origin/main` → no-op, branch already on top of origin/main (735cd63). No conflicts. Head unchanged: f466617.
- AKROGON_BASE after rebase: 735cd630afe03fe21b773aafeabdddddc88ca612
- `bun run format` → clean, all files unchanged
- `bun run typecheck` → clean
- `bun test` → 217 pass, 0 fail
- `bun test --changed=$AKROGON_BASE` → 3 changed files, no test files affected
