# Slot B brief: focused final-shape check

You are slot B. The operator answered: rule-rewrite 2a and 3a, search-routing "1a | 2a" (see `## Taken` in `/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/forks/rule-rewrite.md` and `/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/forks/search-routing.md`).

Check once, as the implementer, the proposed final files against those answers:
- `/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/slots/final-haiku.md` (replaces `/home/ivan/.claude/rules/haiku.md`)
- `/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/slots/final-Explore.md` (new `/home/ivan/.claude/agents/Explore.md`)

A's corrections since the merged notes:
- Boundary line reads "Haiku never plans, designs, reviews or decides, and never runs lifecycle skill work", not "never implements", because the list keeps "Mechanical edits with a clear spec".
- The 2a draft's separate "Do it yourself" line is folded into Route rule 1; "one known file and line" is covered by "one search or read answers the question".

Return only defects: a taken answer the text misses or contradicts, a contradiction inside the files, frontmatter that Claude Code would reject or misread (check https://code.claude.com/docs/en/sub-agents), or a loop the text reopens. Evidence with tier and source. If none, write `no defect`.

Write it to exactly:
`/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/slots/final-check-B.md`
Then reply with one line: `done final-check-B`.
