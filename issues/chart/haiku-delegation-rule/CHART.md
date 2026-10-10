# Chart: ~/.claude/rules/haiku.md

## Destination
The main model hands the retrieval work listed in `~/.claude/rules/haiku.md` to Haiku 5.5 instead of doing it itself, while Haiku stays out of planning, design, review, decisions and lifecycle skill work.

Route: operator-directed edit outside registered repos (no lifecycle leaf, no direct route)

## Forks taken
- [Rule rewrite](forks/rule-rewrite.md): draft haiku.md accepted (2a), 7-day recount (3a); routing wording follows search-routing
- [Search routing](forks/search-routing.md): Explore on Haiku by default, escalate per call to the main model (1a); one-search and fact-or-judgment tests in haiku.md (2a)

## Open forks


## Fog

## Off route
- akrogon lifecycle skills spawning Haiku: operator ruled out 2026-10-10; Haiku never runs implement-issue.
- `CLAUDE_CODE_SUBAGENT_MODEL=haiku`: would move lifecycle workers and judges to Haiku.
- PreToolUse hook enforcement: deferred until the measure in the rule-rewrite fork shows the text change is not enough.

Closed 2026-10-10
