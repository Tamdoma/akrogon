# Opening map, merged (A, B): #73 lessons to guards

## Evidence
- Plans and the chart door read LESSONS.md, only implement and review exclude it (plan-issue/SKILL.md:25, chart-issues/SKILL.md:31, implement-issue/SKILL.md:31, check-issue/SKILL.md:45). Intake's "seats are told not to read" is too broad. (A,B)
- No command code drains lessons. Only init scaffolding and batch diff exclusion (src/init.ts:55-70, src/batch.ts:24). (A,B)
- Framework: 144 active lines, 0 `Applied` histories. Akrogon: 3 Applied. (A,B)
- Named bounce classes are mostly absent from framework LESSONS (biome 0, ancestry 0, schema-version 1). Bounce attribution is unproven. (A, B agrees it is intake-only)
- The generated-artifact lesson is a cleanup workaround; promotion must fix the test side effect, not codify the revert (framework history 2026-10-08-manifest-determinism-rewrites-checksums.md:15-27). (B)
- A guard can already exist while its lesson stays active: dirty-tree guard at src/phase.ts:320-321 vs LESSONS.md:10. Stock size overstates missing protection. (B)
- Practitioners: Google SRE (Lunney/Lueder/Beyer SREcon17; Postmortem Culture workbook chapter) want tracked, owned, measurable action items. Allspaw (SREcon24) warns artifacts become a museum and not every learning is a fix. (A,B)

## Fork 1: trigger and authority (reshapes everything else)
Q1 What runs follow-up without the operator?
- At write time, the writing seat sorts and files (A). Cost: in-flight scope grows, concurrent duplicates (B).
- At a completion boundary (issue complete), a separate pass owned by the command (B). Cost: scheduling, dedupe, failed/abandoned leaves.
- Periodic sweep (A,B listed, neither prefers).
- Operator-run with status signal (A listed as cheapest, not preferred).
Q2 What may automatic promotion do?
- File deduplicated, evidence-backed intake only; charting still decides (A,B).
- Open leaf contracts or edit checks inside the leaf: rejected (B), A did not consider.

## Later forks
- Q3 What counts as applied: running mechanical guard only (learn-issues today) vs also brief/skill rules with outcome evidence. Intake wants both. (B)
- Q4 Where the guard belongs: route by mechanism owner (akrogon vs consumer repo). (B)
- Q5 Existing stock: bounded initial triage vs new lessons only. (A,B)
- Fog: recurrence matching via merge-attempts.jsonl after merge-attempt-records lands. (A,B)

## Differences
- D-a: trigger. A prefers write time, B prefers completion boundary.
- D-b: #63 and #69. A: close, they were ruled off route with reopen conditions. B: chart them separately (#63 clean-checkout guarantee, #69 needs load measurement).
