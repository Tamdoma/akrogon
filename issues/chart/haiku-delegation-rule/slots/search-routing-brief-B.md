# Slot B brief: fork search-routing, blind notes

You are slot B. Work blind: do not read A's notes for this fork (anything named `search-routing-A*` or `search-routing-merged*`). Read-only except your return file; never open `.env`; do not run `akrogon next` or `akrogon phase`.

## Permitted context
- Intake: `/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/INTAKE.md`
- Current question, carries and the operator's verbatim correction: `/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/forks/search-routing.md`
- Related taken fork: `/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/forks/rule-rewrite.md` (Question, Carries and Taken; the draft in its Findings is the accepted haiku.md text)
- Live surfaces: `/home/ivan/.claude/rules/haiku.md`, `/home/ivan/.claude/CLAUDE.md`, the Claude Code subagents doc (https://code.claude.com/docs/en/sub-agents), transcripts under `/home/ivan/.claude/projects/` if a claim needs evidence (keep it cheap).
- Note format: the five-part blind note definition in `/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md`, section `## Blind peer exchange`, third paragraph.

## Task
Answer the fork's Q1 as a systems thinker, in the five-part note format, and include:
1. A stock-and-flow sketch of the routing decision: the stocks (what accumulates), the flows into and out of them, and who decides each flow.
2. The reinforcing loops and the balancing loops that push the system away from the operator's goal today (most searches on Haiku, hard work on the main model). Name each loop, its links, and its observed or likely effect.
3. Structural fixes: changes to the rule text, to agent definitions (for example named agents with model and description), or to feedback (for example a signal the main model or the operator sees), that weaken the bad loops or add a corrective one. Prefer the fix that removes the routing guess over one that adds instructions.
4. Challenge the operator's premise "most searches should go to Haiku": when is a search better done by the main model, and what single test should decide it?
5. Whether `~/.claude/agents/Explore.md` with `model: haiku` belongs in the fix, given the operator's objection that a hard search would also land on Haiku.

Keep it proportional: the destination is a ~30-line rule file plus at most one or two small agent files.

## Return
Write your notes to exactly:
`/home/ivan/Work/infra/akrogon/issues/chart/haiku-delegation-rule/slots/search-routing-B.md`
Then reply with one line: `done search-routing-B`.
