# Brief: opening map (slot B or C)

You are a consultant for chart door A (hc t126) charting `ai-budgets` in /home/ivan/Work/infra/akrogon. Mode: full autopilot. Work blind: do not read any other seat's map.

## Inputs

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/ai-budgets/INTAKE.md
- Locks: /home/ivan/Work/infra/akrogon/issues/chart/ai-budgets/forks/signposts.md `## Taken` (S1-S6, ranked priorities) and `## Needs`.
- Live surfaces: skills/*/lifecycle-rules.md (`## Grant reuse and count lines`); skills/chart-issues/SKILL.md (`## Open` needs paragraph, `## Take` grant/proof paragraphs, `## Handoff` live-run line); skills/chart-issues/assets/{autopilot.md, standing-design.md, shapes.md `### readiness.yaml`, questions.md}; skills/check-issue/SKILL.md (operator-only items, check.review live-proof line, check.repair); skills/implement-issue/SKILL.md and skills/plan-issue/SKILL.md (their grant/blocker lines); src/readiness.ts; src/run-check.ts; src/config.ts (globalSchema); src/status.ts / src/next.ts where they read readiness; tests touching readiness or grants; docs/ pages that state grant rules (grep). The triggering case: issues/closed/watch-consultants/watch-consults/readiness.yaml.

## Task

Write a proportional territory map for this outcome, under 120 lines:
1. Forks that change the outcome (each with options and what each could break or invite later), especially: where the ceiling lives and its shape; where counting happens (run-check vs seat-written lines) and how a per-day total is known; what replaces `grants[]` repeat counts and `approved` (seat-owned budget record vs config only); what happens to open leaves with old-shape grants (strictObject); how S5's sufficiency floor is written once and read by implement/check seats; which autopilot.md / SKILL.md lines remove; whether absent ceiling means old per-leaf path or no self-budgeting.
2. Every surface that holds a rule this changes (file and section), and redundancy that can be removed.
3. Practitioner questions and lifetime pitfalls.
4. Proposed split into leaves (only real dependencies order them) and what each proves with free checks.
5. External operations needing a real observation before handoff (expect none paid).

Name sections, never line ranges; cite file and function for code.

## Reading rule

Read process text by named section: locate a section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed, and content lost to compaction stay readable; the full source is allowed when the source is the subject of the work (it is here for the surfaces above). Name sections, never line ranges.

## Report

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/ai-budgets/slots/map-<your letter>.md, then run:
hc send t126 "done <your letter>: <return path>"
