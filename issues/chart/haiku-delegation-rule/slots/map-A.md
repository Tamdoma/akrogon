# Slot A map: haiku-delegation-rule

## Root cause (new since the intake)
The Claude Code harness gives the main model a delegation-damping instruction in the Agent tool description. Seen verbatim in session 5eb6ac92's own system prompt (2026-10-10):
> "A fresh agent costs more than it looks. ... Do the work yourself when it is a handful of tool calls or a lookup whose target you already know; don't delegate a check you could run inline. ... When in doubt, don't spawn."
> "Once you've delegated something, don't also run it yourself; wait for the result."
Anthropic confirms the harness adds this on Opus 5 (Prompting Claude Opus 5, "Controlling subagent spawning", read 2026-10-10: "Claude Code adds a delegation instruction of its own on Claude Opus 5 only when you use its claude_code system prompt preset").
haiku.md never says it overrides that default. Its cost test ("hand-off costs more than doing it") is the harness's same-model cost model, which does not hold for Haiku. Its re-read line contradicts "don't also run it yourself". So two instructions point the same way (don't delegate) and one soft question points the other way.

## Forks
1. Override framing. Does haiku.md explicitly name and override the harness's "do it yourself / when in doubt, don't spawn" default for the listed categories, with the reason (Haiku's cost is a fraction, so the harness's cost math does not apply)?
   - 1a (pick) Yes, one sentence near the top. Cost: none; risk of over-delegation is bounded by the category list.
   - 1b Leave implicit. Keeps the measured failure.
2. Trigger. Soft question (today) vs a concrete trigger.
   - 2a (pick) Concrete trigger by task shape: "a question whose answer needs reading, searching or fetching that you would not otherwise edit". Works with any file count.
   - 2b Numeric threshold (A6: >3 files, >3 searches, any web fetch). Easy to check, but counts are arbitrary; a model will game "3"; the 11:39 case (3 parallel reads of 3,600 lines) slips under it.
   - 2c Keep the question. Measured: 3 delegations in 24 h.
   Pitfall: over-triggering. Anthropic notes current models over-trigger on aggressive wording ("CRITICAL/MUST", "if in doubt, use X"). Plain imperative wording, no capitals.
3. Exits. Which "skip delegation" exits survive?
   - 3a (pick) Keep "needs back-and-forth with me"; add "you will edit those exact files next" and "one known file and line" (a single targeted read is cheaper inline even with Haiku). Delete "hand-off costs more than doing it" (A3).
   - 3b Delete all exits. Haiku gets single-line lookups; latency and noise.
4. Verification rule (A4). The re-read clause became a reason not to delegate.
   - 4a (pick) "Spot-check only the cited lines your decision depends on." State that this is the expected cost of delegation, not a reason to skip it.
   - 4b Drop verification entirely. Haiku errors reach decisions unchecked. Anthropic warns against self-verification on Opus 5, but this is checking a weaker model's facts, a different case.
5. Retrieval inside reasoning seats (A5).
   - 5a (pick) Add: retrieval inside planning, design or review is still delegated; you keep the judgment.
   - 5b Leave "Keep for yourself" as is. The 11:39 case recurs.
6. Mechanism outside haiku.md (operator limited scope to haiku.md, so this is an ask, not a pick).
   - 6a Add `~/.claude/agents/Explore.md` with `model: haiku`. Docs (code.claude.com/docs/en/sub-agents, read 2026-10-10): "A user or project subagent named Explore overrides the built-in and keeps its own model field, so define one with model: haiku to run exploration on a lower-cost model." Every Explore call then runs Haiku without the main model remembering `model`. Removes the "forgot model:" failure class. Cost: a second file; Explore also runs Haiku when the main model wanted a stronger explorer.
   - 6b haiku.md only. Operator's stated scope.

## A3-A6 verdicts
- A3 right.
- A4 right, wording tightened in 4a.
- A5 right.
- A6 wrong as written: the numeric threshold is arbitrary and misses the measured case; replace with a task-shape trigger (2a). "Fetch any web page" is a good concrete clause to keep inside 2a.
- Missing: the override sentence (fork 1). It is the main cause.

## Pitfalls over time
- Over-delegation: Haiku spawned for one-line lookups. Removed by the 3a exits.
- Haiku on reasoning: Haiku returns a judgment, not facts. Removed by "Haiku gathers facts with path:line; you decide" (already in Hand-offs).
- Rule rot: harness wording changes. Removed by naming the behavior ("the harness default to do small work yourself"), not quoting it.
- Measure after: re-run the 24 h count in a day; same transcript query as the intake.
