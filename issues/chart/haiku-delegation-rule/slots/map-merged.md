# Merged map: haiku-delegation-rule

Sources: `slots/map-A.md`, `slots/map-B.md`. Tags name the slots that wrote the line.

## Cause
- The rule is advisory and every exit is self-judged; the main model took the cost exit both measured times. (A,B)
- The harness Agent tool description damps delegation: "Do the work yourself when it is a handful of tool calls or a lookup whose target you already know ... When in doubt, don't spawn." haiku.md never says it overrides this, and its cost test is the harness's same-model cost model, which does not hold for Haiku. (A)
- The same harness text also says "when answering would mean reading across several files — delegate that and you keep the conclusion", so a task-shape rule can agree with it. (B)
- Built-in Explore runs on the main conversation's model, never Haiku, unless a user agent named `Explore` overrides it. No `~/.claude/agents/` exists. All 3 Haiku spawns passed `model: haiku` by hand. (A,B)

## Options and picks
1. Explore override file `~/.claude/agents/Explore.md` with `model: haiku`, read-only: pick yes, if the operator widens scope by one file (A,B). Removes the "forgot model:" failure class. Cost: one more file; any Explore call runs Haiku, including one the main model meant for harder exploration. `CLAUDE_CODE_SUBAGENT_MODEL=haiku` rejected: it would move implement-issue workers and judges to Haiku. (B; A agrees)
2. Trigger: task-shape closed list, no counts (A,B). Numeric threshold (A6) rejected: arbitrary (A), cannot be judged before the reads happen (B), misses the 11:39 case (A), and conflicts with the harness's "handful of tool calls" line (B). Keeping the question rejected; "if in doubt, delegate" rejected as a known over-trigger pattern (B).
3. Override sentence: name the harness's do-it-yourself default and say it does not apply to the listed retrieval because Haiku's cost is a fraction (A). B: resolve the conflict as one clause inside the opening reason sentence, without quoting the harness (B, rebuttal); A accepts.
4. Exits: delete "hand-off costs more than doing it" (A,B). Keep "back-and-forth with me" (A,B). Kept-inline cases: you will edit those files next (A,B); the file is already in your context (B); a single known file:line lookup (A).
5. Re-read line: "Spot-check only the cited lines your decision depends on." (A,B). Second sentence "never a reason to skip delegation": drop, it argues with a past excuse and duplicates the cost reason (B); A accepts.
6. Retrieval inside kept work: merge into the Keep line: "Keep the judgment ... The reading those need still goes to Haiku." (B; A agrees with merge)
7. Boundary line: "Haiku never implements, plans, reviews, or decides. Lifecycle skills choose their own agents." (B; A agrees)
8. Hook enforcement: none now; measure first (A,B).
9. Web fetch: A6's "fetch any web page" clause (A) vs single-URL fetches stay with the main model because a subagent would fetch again (B). A concedes: the WebFetch tool already summarizes pages with a small fast model, so a single fetch through Haiku doubles the work. Multi-page research or scraping stays in the Haiku list.

## Pitfalls and removers
- Over-delegation: closed shape list plus kept-inline cases; plain wording, no capitals. (A,B)
- Haiku on reasoning: boundary line (7) and Explore description limited to retrieval. (A,B)
- Wrong facts reaching decisions: spot-check line (5); hand-offs already require path:line. (A,B)
- Rule rot: no numbers; describe the harness behavior rather than quoting it. (A,B)
- Latency on interactive sessions: back-and-forth exit and "already in context" case. (B)

## Open questions for the operator
- Q1 Explore override file: allowed? (A,B)
- Q2 Single-URL web fetch: stays with main model? (B; A now agrees)
- Q3 Latency trade on interactive sessions. (B)
- Q4 Success measure: Haiku spawns per main session over 7 days, same transcript query. (A,B)

## Where slots differ
- None after rebuttal. Override as one clause (A,B). Spot-check second sentence dropped (A,B). Kept case "single known file:line" (A,B).
