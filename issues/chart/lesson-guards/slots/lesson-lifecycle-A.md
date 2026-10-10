# Fork notes, slot A: lesson-lifecycle

## Q1 routing
- Pick: route by who owns the mechanism. Akrogon skill or command defect -> Tamdoma/akrogon; consumer code or tests -> consumer issues_repo. Reason: docs/guide/learn.md already says "A report about an Akrogon skill belongs in Akrogon", and a framework seed about an akrogon skill would be charted in the wrong repo. Cost: seed-issue today routes only by the current repo (skills/seed-issue/SKILL.md:14-18, "without ... asking where to post"), so it needs an explicit destination input.
- Rejected: always consumer repo (shared defects land where they cannot be fixed); always akrogon (consumer bugs land in the wrong tracker).
- Evidence: better-than-training, skills/seed-issue/SKILL.md:12-20, framework akrogon.yaml `issues_repo: Tamdoma/tamdoma-framework`, read 2026-10-10.
- Pitfalls: wrong owner guess -> charting can transfer; seed body names the lesson history path so the receiver can trace.
- Extra question: none.

## Q2 line lifecycle and applied
- Pick: line stays active with the seed identity appended; it leaves only when a running mechanical guard is verified (today's learn-issues Applied rule). Reason: planners read the list (plan-issue/SKILL.md:25), so a filed but unfixed lesson is still a useful warning; filing is not prevention. Cost: stock shrinks only as guards land, not at filing.
- Rejected: leave at filing (stock drops but warning disappears before a guard exists); accept prose rules as applied (B evidence: 35 tests passed with guards inverted, framework history 2026-10-05-analytics-guard-proof.md).
- Evidence: better-than-training, skills/learn-issues/SKILL.md:18-29; Google SRE action items closed only on delivered fix.
- Pitfalls: line already has a seed -> writer skips refiling (the appended identity is the dedupe key); a guarded-but-active line (src/phase.ts:320 vs LESSONS.md:10) still needs learn-issues or charting to remove it.
- Extra question: who removes the line when the guard's leaf merges: the delivering leaf (it knows its sources) or learn-issues later?
