# Opening map brief (same for B and C)

You are slot <your letter> in a chart-issues opening map. Work blind: do not read any other map-*.md in /tmp/claude-1000/-home-ivan-Work-infra-akrogon/a7a6765b-b14d-4e24-bc1e-b2fa7fcdbc97/scratchpad/open-63-69.

## Operator note, verbatim (2026-10-10)
"Reopen everything that needs to be sold. If we need to chart it, let's chart it out.We have to clear the whole backlog."
This reopens merge-throughput fork first-package Q3 3a, which had parked #63 (until recurrence) and #69 (until a traced load failure). Do not argue for parking them again on the same grounds; you may still argue a report needs no code change if evidence shows it.

## Intake (read verbatim)
- /home/ivan/Work/infra/akrogon/issues/seeds/63-merge-gate-passed-in-the-leaf-worktree.md
- /home/ivan/Work/infra/akrogon/issues/seeds/69-heavy-check-runs-from-all-seats-share.md

## Live surface (inspect, cite path:line)
- skills/merge-issue/SKILL.md (attempt top / solo gate, lines ~35-60), src/batch.ts (stack build, disposable state), src/phase.ts (merged, --check), src/next.ts (activeCount ~323), src/config.ts:25 (max_active), worktree creation and cleanup code (grep worktree in src/).
- Framework evidence: /home/ivan/Work/infra/tamdoma/framework, commit 264cc2f5b and 2ccc39534; gh issue view 207 and 208 -R Tamdoma/tamdoma-framework (read only).

## Existing locks and related work
- /home/ivan/Work/infra/akrogon/issues/chart/test-runs/CHART.md and forks/heavy-run-slot.md, forks/timeout-cause.md: heavy-run slot ruled out 2026-10-02 because #53 was a capture bug, "reopen only on a traced load failure".
- /home/ivan/Work/infra/akrogon/issues/chart/merge-throughput/CHART.md and forks/first-package.md (Q3), plus the 8 in-progress leaves under issues/open/merge-throughput/ (red-main-hold, bounce-repair-proof, batch-limit-repo, merge-attempt-records, ...). New work must not duplicate or conflict with them.
- /home/ivan/Work/infra/akrogon/issues/chart/framework-test-scope/CHART.md (framework destination).

## Task
Write a proportional territory map for both reports: is the suspected cause real (evidence for/against), the material forks with options, what each option could break or invite later, practitioner questions (name practitioners/sources with URL and tier: operator, practitioner, better-than-training, model-knowledge), pitfalls and what removes each, and whether #63 and #69 are one destination or two. Plain short language. Read only, change no files except your return file.

## Return
Write your map to exactly: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/a7a6765b-b14d-4e24-bc1e-b2fa7fcdbc97/scratchpad/open-63-69/map-<your letter>.md  (B -> map-B.md, C -> map-C.md)
