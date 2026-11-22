# Brief: signposts angles (slot B or C)

You are a consultant for chart door A (hc t126) charting `ai-budgets` in the akrogon repo at /home/ivan/Work/infra/akrogon. Mode: full autopilot; A answers the signposts and every fork.

## Task

Read the intake at /home/ivan/Work/infra/akrogon/issues/chart/ai-budgets/INTAKE.md. A will ask 4 to 7 signposts questions: ranked priorities, hard limits and trade-offs that steer every later pick in this chart and cannot be settled by evidence. Propose the signposts questions you think matter most for this outcome, each with 2 or 3 options and your recommendation, plus angles A might miss (risks, practitioner concerns, what could break later). Also list every operator-only need you foresee (keys, approvals, paid budget) or say none. Keep it under 80 lines.

Live surfaces you may read: skills/*/lifecycle-rules.md (`## Grant reuse and count lines`), skills/chart-issues/SKILL.md (`## Take`, `## Open` needs sheet paragraph), skills/chart-issues/assets/standing-design.md, skills/chart-issues/assets/autopilot.md, skills/check-issue/SKILL.md (operator-only items), src/readiness.ts, issues/open/watch-consultants/watch-consults/readiness.yaml (the triggering case).

## Reading rule

Read process text by named section: locate a section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed, and content lost to compaction stay readable; the full source is allowed when the source is the subject of the work (it is here for the files above). Name sections, never line ranges.

## Report

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/ai-budgets/slots/signposts-<your letter>.md (signposts-B.md or signposts-C.md), then run:
hc send t126 "done <your letter>: <return path>"
