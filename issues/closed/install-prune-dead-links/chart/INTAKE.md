# Intake: install-prune-dead-links

## Scope
One issue, one leaf, in src/install.ts plus a test.

## Provenance
- GitHub: Tamdoma/akrogon#2

## Source: Tamdoma/akrogon#2

Unverified intake.

## Observation
`akrogon install` leaves dead symlinks behind in `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills` and `~/.pi/agent/skills` when a skill folder is removed from the repo. Today `create-issue`, `braindump-issues` and `consolidate-issues` dangled in all four locations.

## Location
Project: akrogon. Surface: `akrogon install` CLI command, skill symlink installation into harness skill folders.

## Reproduction
Reported, frequency not provided:
1. Have a skill installed via `akrogon install` into the harness skill folders.
2. Remove that skill folder from the repo.
3. Run `akrogon install` again.
4. Observe symlinks named after the removed skill still present and dangling in the four harness folders.

## Expected behavior
`akrogon install` removes links that point into the repo's skills folder but no longer resolve.

## Urgency
Not provided.
## Agent findings
- src/install.ts links skills only into ~/.claude/skills and ~/.agents/skills. Nothing in src, skills or plugin writes ~/.codex/skills or ~/.pi/agent/skills, yet both folders hold links into this repo skills folder today. They came from an earlier install shape or a manual step.
- Install only ever creates links. It has no removal path, so a deleted skill leaves its link in every folder forever.
- The three dangling links named in the report are already gone today. Every akrogon link in all four folders resolves.
- No test covers install (no tests/install.test.ts).
