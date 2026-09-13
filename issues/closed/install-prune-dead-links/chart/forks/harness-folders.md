# Which harness skill folders does install own?

## Question
Should install manage (link and prune) `~/.codex/skills` and `~/.pi/agent/skills` in addition to `~/.claude/skills` and `~/.agents/skills`? The code links two folders today. The report expects pruning in four.

### Carries
Operator Only Install (issues/chart/akrogon-loop/forks/operator-only-install.md): only the operator installs, skills stay individually usable.

## Findings
- Config harnesses are claude, codex and pi. Codex reads ~/.codex/skills (and ~/.agents/skills). Pi reads ~/.pi/agent/skills. Claude reads ~/.claude/skills.
- If install links into a folder, pruning there is the same rule. If it does not, pruning there means deleting links install never made.

## Taken
Operator answer (2026-09-11): `2-B`, on consultant review overturning the recommendation. Install links and prunes all four folders: `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills`. Reason: all four folders hold links dated 10 Sep 11:46 made by an earlier install, and `plan-issue` (added 11 Sep 08:06) exists only in the two folders the current code links, so codex and pi already run with a missing skill. Every folder a configured harness reads is owned by install. Foreclosed: keeping two folders and leaving pi and codex uncovered.

