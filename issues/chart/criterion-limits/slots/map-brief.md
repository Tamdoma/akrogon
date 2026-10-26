# Skill gap brief, 2026-10-26

Leaf: /home/ivan/Work/infra/akrogon/issues/open/repeat-calls/fewer-repeat-calls (read brief.md done-criteria 2 and 3, plan.md D2, D3, C2, C3 and `## Implementation notes`).
Skills: /home/ivan/.claude/skills/plan-issue/SKILL.md (`## plan.synthesis`), /home/ivan/.claude/skills/check-issue/SKILL.md, /home/ivan/.claude/skills/implement-issue/SKILL.md (test rules in `## implement`).

Facts. The A seat's first plan.md had two defects that an outside reader caught before implement:
1. D3 memoized `commonDirectory` including a non-repo `null`. Criterion 3 says "a failed lookup is retried on the next call".
2. D2 derived each repo's pane list in `reconcileRepos` from one host-wide read, while `reconcile()` on an earlier repo can run `tab close` before a later repo uses it. Criterion 2 says "with no herdr write, prompt or wait between".
The seat's planned tests (C2, C3, crit3b) did not exercise either case. Both are now corrected in Implementation notes.

Question. What is the smallest change to these skills that would make the A seat's plan honor its brief and catch this class of defect on future leaves, with compounding benefit? Name the class first, then the change (file, section, exact wording), what it would have caught here, what it costs or could break, and why a smaller change would not do. If you think no skill change is right, say so with the reason.

Read only what you need. Short answer. Evidence: tier, source, date.
