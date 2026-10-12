# Opening map brief, slot B (chart-issues door, akrogon)

You are slot B, a charting peer. Map independently. Do not edit any repo file. Write only the return file below.

## Intake
- Seed: /home/ivan/Work/infra/akrogon/issues/seeds/87-framework-test-changed-still-runs-no.md (Tamdoma/akrogon#87). Read it fully.
- Operator note, verbatim: "I just pulled another issue. Look at the systemic problem and come up with the simplest solution without adding more complexity."

## Live surfaces (inspect, cite path:line)
- akrogon: /home/ivan/Work/infra/akrogon (main, up to date with origin). skills/chart-issues/SKILL.md and assets/shapes.md (Off route, human-only prerequisite rule, "operator step on main" refusal in preflight), skills/init-akrogon/SKILL.md, skills/implement-issue/SKILL.md, skills/check-issue/SKILL.md, skills/merge-issue/SKILL.md, src/config.ts (checks are read from the registered root's issues/config.yaml, not the worktree), src/sync.ts, docs/guide/.
- framework: /home/ivan/Work/infra/tamdoma/framework. origin/main issues/config.yaml still has the stub test_changed. Framework issue #115 is CLOSED with the config switch never done.
- Related akrogon charts: issues/chart/changed-test-proof (#86, handed off 2026-10-11), issues/chart/check-reruns, issues/chart/test-time-and-temp, issues/chart/framework-test-scope.

## Existing locks (do not reopen)
- A leaf branch carries code only; `issues/` diffs are rejected, so config edits are operator steps on main.
- check-reruns lock: checks before review and after repair, merge_checks only at merge.
- changed-test-proof (#86): proof counts only if it ran after the test's latest change.

## Task
Produce your own territory map: what is the systemic problem (one root, not symptoms), the material forks, what each option could break or invite later, pitfalls, and the simplest solution that removes the problem class without adding machinery. Prefer removing a fragile part over adding a guard. Keep it compact.

Return blind notes with five parts per fork: pick with reason and cost; each rejected option with reason; evidence with tier, source (path:line or URL) and date; pitfalls with what removes each; any question you would ask that is not asked.

## Return path
/tmp/claude-1000/-home-ivan-Work-infra-akrogon/08f9bda6-5ef1-4d07-8526-5480cbe29dd6/scratchpad/door/map-B.md
