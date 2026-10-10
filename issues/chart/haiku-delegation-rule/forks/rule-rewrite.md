# Rule rewrite

## Question
Q1 moved 2026-10-10 to [search-routing](search-routing.md) after the operator's answer reshaped it.

Q2. Is the haiku.md draft below the change: override clause in the opening reason, task-shape list with no counts, kept-inline cases, cost exit deleted, spot-check line, retrieval inside kept work still delegated, boundary line, single web pages fetched directly?

Q3. What counts as "working" afterwards: Haiku spawns counted with the intake's transcript query over 7 days, with a PreToolUse hook reconsidered only if the count stays near zero?

### Carries
- Operator 2026-10-10: "Haiku is never supposed to be running implement issue. Its only function is what is mentioned in haiku.md file, Which is information retrieval and all the other points that are mentioned there. The only place where we can check this is if the.md file is not explicit enough or it gives too much freedom to the main model."
- Operator 2026-10-10: "Then you'll implement directly after we're done." (destination outside registered repos; door edits directly)
- Locks: no akrogon skill changes; `CLAUDE_CODE_SUBAGENT_MODEL=haiku` excluded (it would move lifecycle workers to Haiku).

## Findings
Merged A/B notes: [slots/map-merged.md](../slots/map-merged.md), maps [A](../slots/map-A.md) and [B](../slots/map-B.md), rebuttal [B](../slots/map-rebuttal-B.md).

Research:
- better-than-training · code.claude.com/docs/en/sub-agents, read 2026-10-10 · built-in Explore uses the main conversation's model; "A user or project subagent named Explore overrides the built-in and keeps its own model field, so define one with model: haiku to run exploration on a lower-cost model"; model order is per-call param, frontmatter, CLAUDE_CODE_SUBAGENT_MODEL, main model; Explore skips CLAUDE.md · produced Q1. (A,B)
- better-than-training · platform.claude.com prompting best practices and Prompting Claude Opus 5, read 2026-10-10 · Claude Code adds its own delegation-damping instruction on Opus 5; current models over-trigger on "CRITICAL/MUST" and "if in doubt, use X"; Anthropic's damping sample uses task shapes, not counts · produced the override clause and the no-count trigger. (A,B)
- better-than-training · code.claude.com/docs/en/memory, read 2026-10-10 · rules are context, not enforced; contradicting instructions may be picked arbitrarily · produced the override clause and Q3's hook deferral. (B)
- better-than-training · session 5eb6ac92 system prompt, Agent tool description · "Do the work yourself when it is a handful of tool calls ... When in doubt, don't spawn." and WebFetch "answers prompt against it using a small fast model" · cause of the measured failure; single pages stay inline. (A)
- operator-placed evidence · INTAKE.md transcripts · model cited the cost exit and the re-read line as its reasons. (A,B)

Late A change before the round: B's boundary line "Haiku never implements" contradicts the kept list item "Mechanical edits with a clear spec". Draft uses "never plans, designs, reviews or decides, and never runs lifecycle skill work". Pending B's focused check after the operator answers.

Draft haiku.md (Q2):

```markdown
# Haiku 5.5 for routine work

Haiku is far cheaper and faster than you, weaker at hard reasoning. Because it costs a fraction of you, the usual default to do small reads and lookups yourself does not apply to the work listed below: send it to Haiku. Keep the judgment: planning, hard debugging, design, final review, and talking with me. The reading those need still goes to Haiku. Haiku never plans, designs, reviews or decides, and never runs lifecycle skill work; those skills choose their own agents. If you are Haiku, ignore this file.

## Send to Haiku: the Explore agent, or any subagent with `model: "haiku"`
- Explore: answer questions from files, logs or transcripts you have not opened; search, locate implementations, pull facts across files
- Summarize: articles, reports, transcripts, support threads, documents
- Extract to JSON: names, dates, prices, companies; bulk records
- Classify: tickets, documents, leads, requests
- Compress large tool output, logs, or file sets before they reach you
- Mechanical edits with a clear spec (renames, configs, one component); you review the diff
- Triage bugs: inspect the error, guess the cause, gather files; you fix
- Multi-page web research and repetitive browser work: forms, moving data between apps, scraping into structure
- Narrow lookups: one query, number, or fact; specific questions over given documents
- Test-verified attempts: run several in parallel, each with a different approach

Do it yourself: a file you will edit next, a file already in your context, one known file and line, or a single web page.

## In code you write: default to `claude-haiku-5-5` for
(unchanged)

## Hand-offs
- Subagents don't see this chat: give the goal, the decision the output feeds, known paths, and exact output format.
- Require from Haiku: (unchanged)
- Spot-check only the cited lines your decision depends on. If something expected is missing, follow up with the same subagent instead of redoing the work.
- Keep each task well under 100K tokens (pricing rises above that); split big jobs.
- Pass `effort: "high"` for mechanical edits and bug triage; leave other Haiku tasks at default.
- Skip delegation only if the task needs back-and-forth with me.
```

With Q1 = no, the heading stays `## Subagent with model: "haiku"` and the Explore bullet says "spawn Explore with `model: haiku`".

Explore.md draft (Q1):

```markdown
---
name: Explore
description: Read-only retrieval on Haiku. Use proactively to search code, locate implementations, read files, logs or transcripts, and return facts with path:line. Returns facts, not decisions.
model: haiku
tools: Read, Grep, Glob, Bash
---
Find and report facts. Cite path:line for every claim, list inputs read and skipped, flag surprises and low-confidence items. Do not edit files. Do not recommend designs or decide; report what is there.
```

## Taken
2026-10-10, operator reply verbatim: "1 - That's the reason why I haven't implemented this. A harder job should still route to the smarter model. But how does it decide what job it needs haiku or, what job it needs the smarter model for? Look at it as a systems thinker from the perspective of a system and consult with slot B. Look at what the stock flow analysis is and what the bad reinforcing loops are and what the bad balancing loops are right now and try to see if you can fix them systemically so that I get what I want. ost of the time for searches it should be using haiku. I I suppose, but challenge me on that. But for hard work it should default to itself. | 2a | 3a"

- Q2: 2a. The haiku.md draft above is the change: override clause, task-shape list without counts, kept-inline cases, cost exit deleted, spot-check line, retrieval inside kept work delegated, boundary line, single web pages inline. Foreclosed: a numeric trigger (2b). The Explore heading and bullet wording, and any routing lines, follow the answer in [search-routing](search-routing.md).
- Q3: 3a. Rerun the intake's transcript count after 7 days; consider a hook only if Haiku spawns stay near zero. Foreclosed: no check (3b).
