# Intake: execution-readiness

## Scope
Chart handoff proves what execution needs before any leaf state exists: a usable configured git base and operation-level proof of every external write a leaf will perform. `next` refuses, with remediation, when the configured base is missing at dispatch. Covers #20 items 1 and 5 and the preflight observation in #19. GitHub identities are owned by `../noninteractive-leaf-execution/`.

## Provenance
- Operator: 2026-09-19, items 1 and 5 of Tamdoma/akrogon#20 and the preflight paragraph of #19, copied below
- Operator: script /home/ivan/Work/personal/MDConsultingNY/boulevard-automation/scripts/probe-ghl-scopes.ts

## Source: operator, Tamdoma/akrogon#20 items 1 and 5
1. First `akrogon next` on a fresh repo failed for every eligible leaf with `fatal: invalid reference: origin/main` (worktree add from `origin/main`). The repo had an origin remote but zero commits and nothing pushed. Full error: `{"command":["git","worktree","add","-b","worker-scaffold",".../issues/worktrees/worker-scaffold","origin/main"],"code":128,"stderr":"fatal: invalid reference: origin/main"}`. Resolved by a manual first commit and push. Nothing in handoff or `akrogon status` warned that the remote branch was missing.
5. The scope the seat asked for was partly real: `locations/customFields.write` was missing, `calendars.write` and `calendars/events.write` were already granted. A reversible probe (POST custom field 201 then DELETE, POST calendar 201 then DELETE) confirmed all three work after the operator added the one scope. The chart-issues pass that handed off this epic probed GHL with GET calls only, so no write scope was proven before handoff, and the chart recorded the operator's "I added the permission" without verification.

## Source: operator, Tamdoma/akrogon#19 preflight paragraph
Second observation from the same night, same root: the chart-issues preflight requires human prerequisites to be recorded and complete, but nothing in the skill requires proving external write permissions (GHL token scopes) with a reversible probe; the chart probed GHL with GET calls only, so the missing `locations/customFields.write` scope reached implement instead of being caught before handoff.

## Agent findings
See `slots/map-merged.md`. ensureWorktree runs `git worktree add -b <slug> <path> <remote>/<default_branch>` with no readiness check (src/next.ts:241-250, src/config.ts:111-116). skills/chart-issues/SKILL.md Take requires listing credentials but no write proof. The operator probe proves custom-field and calendar writes and only reads events (probe-ghl-scopes.ts:18-33); it logs failures without throwing and deletes a hardcoded field (:34-35).
