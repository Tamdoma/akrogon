# Check entry points

## Question
Q1. When a chart decision needs an edit on main (like a config line), how is that step kept from being dropped?

### Carries
- Lock: a leaf branch carries code only; `issues/` diffs are rejected (skills/chart-issues/assets/shapes.md:284).
- Lock: checks before review and after repair, merge_checks only at merge (check-reruns).

## Findings
- Off route means excluded from the outcome (shapes.md:35), so a needed config edit is dropped. (A,B) slots/map-merged.md
- 1a (door files a seed-issue reminder for a waiting edit): (A,B) after B withdrew its chart-only carrier (slots/map-rebuttal-B.md). Rejected by the operator.
- 1d was proposed by A after the operator's objection. B's final-shape check (slots/carrier-final-check-B.md):
  - F1: scope to stored check entry points; akrogon's own stored entries are inline (issues/config.yaml:9-11) and src/config.ts:310-324 wraps them with setup, flock and run-check; init's inline example (skills/init-akrogon/SKILL.md:49-55) must be reconciled. Accepted (A).
  - F2: an entry point may be any repo-owned file run by its native tool, not only a package script; init cannot create scripts (init-akrogon SKILL.md:18, :80). Accepted (A).
  - F3: 1d does not cover a needed edit that truly waits on a leaf's code (framework's own case: `test:changed` did not exist when verify-gate was charted). Accepted (A); moved to forks/waiting-edit.md.

## Taken
Operator 2026-10-12, on 1a: "I don't understand this, can you explain it? Is this adding complexity? I like to keep my issues clean, and only actual issues"
Operator 2026-10-12: "1d"

Decision: check entries in config name a repo-owned entry point (a package script or a repo file run by its native tool), not an inline command, so a leaf that improves a check changes the entry point in code and it is live at merge. init-akrogon proposes entry points where one exists and otherwise keeps the existing command; existing stored entries are not migrated by this rule; the generated setup/flock/run-check wrapping stays. Reason: removes the config edit after the leaf, with no reminder, no new code and no new issue kind.
Foreclosed: 1a seed-issue reminders (fills GitHub issues with to-dos); 1b chart-only note (invisible after handoff); 1c new status field (new code and state); letting leaves edit issues/config.yaml (breaks the code-only lock).
