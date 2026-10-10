# Intake: haiku-delegation-rule

## Scope
Destination: `/home/ivan/.claude/rules/haiku.md`, the user-global Claude Code rule that tells the main model when to hand work to a Haiku 5.5 subagent. The file sits outside every registered repo, so no lifecycle leaf or direct route applies; after the chart settles, the door edits the file directly on the operator's instruction. One outcome, one destination.

Out of scope by operator decision: changing akrogon lifecycle skills (implement-issue, plan-issue, check-issue, merge-issue) to spawn Haiku. Haiku never runs lifecycle implementation work.

## Provenance
- Operator: session 5eb6ac92, 2026-10-10, three messages quoted below.

## Source: operator 2026-10-10 message 1
I want you to take a look at the logs for this repo and the framework repo in the last twenty-four hours. Look at how much times Haiku five point five was called as a sub agent to do the eploration or any other work. I need to check these numbers to see if it's working.

## Source: operator 2026-10-10 message 2
a1 - no, We won't make this change because that was determined by the Akargon framework itself. Haiku is never supposed to be running implement issue. Its only function is what is mentioned in haiku.md file, Which is information retrieval and all the other points that are mentioned there. The only place where we can check this is if the.md file is not explicit enough or it gives too much freedom to the main model. Search that out.

## Source: operator 2026-10-10 message 3
use the chart-issues process and spawn slot b as fable 5.1 medium effort and discuss the changes. Then you'll implement directly after we're done.

## Agent findings

### Measured usage, 2026-10-09 07:50 UTC to 2026-10-10 07:50 UTC
Source: Claude Code transcripts under `/home/ivan/.claude/projects/` for akrogon (`-home-ivan-Work-infra-akrogon*`) and framework (`-home-ivan-Work-infra-tamdoma-framework*`), main sessions and `<session>/subagents/*.jsonl` with `.meta.json`.
- haiku.md was created 2026-10-09 10:36 UTC, last edited 11:04 UTC. Sessions since then carry it as an `instructions` attachment.
- Haiku subagent spawns: 3, all `Explore` with `model: haiku`, framework session at 10:44-10:45 UTC, summarizing tests. Each ran as `claude-haiku-5-5`. akrogon: 0.
- Other spawns from main sessions: 15 general-purpose with model unset (implement-issue workers and 2 research-entry judges), 1 with `model: fable`. Out of scope per operator.
- Main-session tool calls after the rule loaded (non-eval sessions): about 357 shell search/read commands (`grep`, `rg`, `cat`, `find`, `ls`, `head`, `sed -n`, `git log/show/diff`, `jq`), 65 `Read`, 23 `WebFetch`, 4 `WebSearch`, 282 `akrogon` CLI calls, 837 other shell calls.

### The main model's own stated reasons for not delegating
akrogon main session, 2026-10-09 11:39 UTC, answering the operator's question why Haiku was not used:
> 1. The brief named the exact files and the exact functions to cite (...). There was nothing to locate, only to read. The key files total about 3,600 lines and I read the relevant ones in three parallel calls.
> 2. The deliverable was file:line claims in an argument I had to defend in a rebuttal round. Your haiku rule says to re-read cited lines myself before a decision anyway, so delegating the read and then re-reading it would have cost more than reading once.
> Where Haiku would have fit: the framework `log.jsonl` stats. I wrote a short Python script instead, which is cheaper and exact.

Same session, 11:40 UTC:
> **Haiku:** the reads were small. That was 12 short seed files and about 10 known code spots. A Haiku hand-off plus my own re-check of its cited lines would have cost about as much as reading them myself. (...) Line-hunting across `next.ts` and `phase.ts` could have gone to Haiku, and I'll hand that kind of search to it next time.

### Door's findings on the file (A's reading, offered to the operator before charting)
- F5: "Skip delegation if ... the hand-off costs more than doing it" is an exit the main model judges for itself; it used it.
- F6: "Before a decision, re-read the cited lines yourself" reads as double work and was cited as a reason not to delegate.
- F7: "Keep for yourself: planning, hard debugging, design, final review" absorbs retrieval done inside planning or review seats.
- F8: "high-volume or well-defined work" has no threshold; 12 files plus ~3,600 lines was judged small.
- F9: "Ask: is this wasting a stronger model?" is a question, not a rule.

### Door's proposed changes (A's proposal, offered to the operator before charting)
- A3: delete the hand-off-cost exception; keep only "Skip delegation if the task needs back-and-forth with me."
- A4: change the re-read line to "Spot-check only the cited lines your decision depends on. This is cheaper than reading the sources yourself, so it is never a reason to skip delegation."
- A5: add "Information retrieval inside planning, design or review is still delegated. You keep the judgment, Haiku gathers the facts."
- A6: replace the opening question with a hard trigger: "Delegate to Haiku before you read more than 3 files, run more than 3 search commands, or fetch any web page to answer a question. Exception: you are about to edit those files."
