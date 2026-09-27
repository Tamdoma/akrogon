# Intake: task-cost

## Scope
Audit akrogon against the article's cost-per-completed-task principles and implement simple improvements without reducing reliability or capability. Destination: registered repo `akrogon`.

## Provenance
- Operator: chat message 2026-09-27 (chart-issues door invocation)

## Source: operator 2026-09-27
Read and analyze this article:

https://claude.dev/blog/what-a-task-costs-on-opus-5-5/

Then audit and improve our charting process system using the principles from the article.

Prioritize:

- Cost per successfully completed task, not cost per token.
- Fewer retry/iteration loops.
- Maximum prompt/cache reuse; avoid unnecessary cache invalidation.
- Medium reasoning by default; increase effort when the expected cost of failure/retries exceeds the added reasoning cost.
- Compact long-running contexts when the future-turn savings justify it.
- Escalate to a stronger model after repeated failures instead of endlessly retrying.
- Use tests and verification early when they reduce downstream rework.
- Avoid unnecessary subagents/parallel agents unless their added token cost produces a clear task-level benefit.

Inspect the current architecture, identify where it violates these principles, and implement concrete improvements without reducing reliability or capability.

Use slot B, and also create a claude-fable-5-1 with medium thinking slot C in this herdr tab. Only focus on simple, elegant and clear solutions. Hierarchy of importance: 1. simplicity, clarity elegance, 2. Cost

## Agent findings
Territory map: slots/map-merged.md (A, B, C blind maps and rebuttals in slots/).
Article: Addy Osmani, "What a task costs on Opus 5.5", 2026-09-25, read 2026-09-27.
Measured: pi session usage (254 leaves, 91,615 turns, 95.1% cache-read share) and issues/log.jsonl in 6 repos (255 leaves, 251 merged).
Correction from B's rebuttal: merge→check.fix does not increment fix_rounds (src/phase.ts:107-112), so that loop is uncapped (0.02 per leaf in the latest era, 0.17 to 0.36 earlier).
Correction from C's rebuttal: the "about 1 leaf per repo at the fix cap" figure is A's alone. In akrogon, 0 leaves reached the cap. C now agrees on medium effort.
Correction from B's rebuttal: implement-issue (SKILL.md:31) and check-issue (SKILL.md:33) also read design.md. The 78 to 92% copied share is from a historical review.
