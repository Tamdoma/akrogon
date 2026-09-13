# Chart: install removes dead skill links it once created

## Destination
After a skill folder is deleted from the repo, `akrogon install` removes symlinks in the harness skill folders that point into the repo's `skills/` folder and no longer resolve, and leaves every other entry alone.

## Forks taken
- [Which harness folders does install own](forks/harness-folders.md): all four folders, `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills`.

## Forks open
None.

## Fog
None.

## Off route
- Links pointing anywhere other than the repo's skills folder are never touched.

Handed off 2026-09-11 into `../../open/install-prune-dead-links/`.
