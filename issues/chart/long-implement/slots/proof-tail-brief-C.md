# Blind fork round: proof-tail (chart long-implement)

Work independently. Do not read proof-tail-A.md or the other peer's file. Do not edit any repo file. Write only your output path.

## Question
Q1. How should A's slow proof loop shorten? Case: framework leaf emdash-launch. Workers finished about 11:46 UTC, then A spent about 2h35m alone running live proof (convert, launch, first-boot, cron, `framework:verify`), polling with `sleep 280; tail log`, landing 9 in-branch fixes for live-discovered defects, with 7 launch attempts (implementation/report.md:29-33,52-58). check.fix repeats the pattern (repair briefs R6, R6b, R7, R8). Candidates so far: (C) while a slow proof command runs, A starts every unit or repair that does not depend on its result; (B) one repair plus one rerun per criterion proof, then `failed`; or no change. You may propose a better one.

## Carries
- Operator 2026-10-01 wave-plan, verbatim "1a | 2a": no clock (Q1 1a); plan.md writes a wave table, "one at a time when unsure" deleted, check.fix repairs follow the same wave rule (Q2 2a). Full text: ../forks/wave-plan.md Taken.
- Locks: leaf-run-stalls Off route "Any clock, watchdog, elapsed trigger or numeric size gate"; red-criterion 2a (unmeetable criterion ends `failed`); provider-death answers; operator "I want to be removed as much as possible from the entire process."
- Standing design (slow-run leaf rules, reuse of unchanged proof): /home/ivan/.claude/skills/chart-issues/assets/standing-design.md
- Related: ../slots/map-merged.md (M6, K3, corrections), ../forks/proof-tail.md, ../forks/wave-plan.md
- Live surfaces: /home/ivan/Work/infra/tamdoma/framework/issues/open/emdash-cms/emdash-build/emdash-launch (implementation/, review-*.md, plan.md), its pi session under /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-launch--/, other proof-tail leaves (live-replay, emdash-deploy-profile, satellite-review), akrogon skills implement-issue (SKILL.md, worker-protocol.md), plan-issue.

## Produce (full operator round, not a reaction)
1. Where the tail's time actually goes (measure: proof command durations, how many reruns, which reruns were forced by a fix vs re-proof of unchanged stages, sleep/poll overhead).
2. Each material question, options with one-sentence consequence, your recommendation and reason, pitfalls.
3. Research line per question: tier, source (file:line or URL with date), finding, what it changed.
4. Challenge check.
Under ~100 lines. Output path: /home/ivan/Work/infra/akrogon/issues/chart/long-implement/slots/proof-tail-C.md
