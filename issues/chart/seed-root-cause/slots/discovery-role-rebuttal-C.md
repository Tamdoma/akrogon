# Rebuttal C: discovery-role merged round

Disagreements only. Line numbers refer to `slots/discovery-role-merged.md`.

## Question 2: I change to 2a, with two conditions

I move from session-only to the read-only trace (2a). Reasons:

- My objection in my own round was to reruns and to an unbounded "bounded check". Merged line 31 bans reproduction runs, reruns with side effects, installs and edits under every option, and line 27 gives a stop rule. That removes what I objected to.
- The gap between the two options is smaller than line 28 states. See D1.
- The operator note says "try to discover the root cause" (`INTAKE.md:43`). A one-hop read is closer to that than synthesis alone, and line 28 already concedes this cost for session-only.

Conditions I attach to 2a:

- C1. The trace is one hop and local. Line 27 says "to the immediate caller or shared contract, from where the agent runs". That wording must survive into the skill as the stop rule. "Follow them" without the one-hop limit is 2c.
- C2. The cause section names each traced path as read, and says when it is an installed or vendored copy and not the destination repo's source. See D2.

## Disagreements

- D1. Line 28 misstates my option as "No new reads to test the cause". My round said filing "runs no new commands to test the cause" and "reads nothing in the destination repo", and it kept "the nearby context the skill already allows" (`slots/discovery-role-C.md`, option 2a). The current skill already permits reading nearby context (`skills/seed-issue/SKILL.md:26`). So the real difference between the two options is one hop of reading past the named files, not reads versus no reads.
- D2. Omitted pitfall for 2a: tracing an installed copy. A consumer repo often holds the framework only as an installed copy. #56 itself gives its Location as `~/.claude/skills/seed-issue/SKILL.md` (`INTAKE.md:26`), an install path, not a repo path. A file:line from that copy can be stale against the destination repo, the same failure this repo recorded at the chart door (`learnings/LESSONS.md:18`). Line 31's "states what was and was not inspected" does not cover it unless the copy is named as a copy. Condition C2 removes it.
- D3. Line 27 claims the trace "captures the one file read that often separates two causes". No source or case is cited for "often". The one measured case points the other way: #128 was written from session evidence in ten minutes (`INTAKE.md:46`, merged line 21). The sentence should be stated as the option's intent, not as a finding.
- D4. The challenge check drops one point from my round that still applies under 2a: the skill runs in repos it knows nothing about, so "read-only" needs to mean file reads only. Line 31 bans reruns "with side effects", which leaves side-effect-free commands open to judgment. I would close it: the trace opens files and runs no project commands.

No disagreement with question 1 or its attributions.
