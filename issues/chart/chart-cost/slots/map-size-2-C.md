# Slot C notes, fork map-size, round 2, 2026-10-06

Read: slots/map-size-test.md, slots/map-size-test-judge.md, slots/map-size-final-shape.md, URL counts in slots/map-size-test-map-C.md and merge-turn/slots/map-C.md.

## What the test supports and what it does not
- Supported, both seats: the content rule (1a) moves bytes, it does not remove them. Option text fell from 30-40% to about 1% and both maps stayed the same size or grew (B 31.3 to 30.5KB, C 28.5 to 33.4KB). Two seats, two models, same direction.
- Supported, C original turn: the map turn's cost is reading, not writing ($3.3 read against $1.2 output). Tool calls multiply the context, so cache read scales with calls times context, and 1a says nothing about calls.
- Not supported: that 1a lowers coverage. Scores moved 6.5 to 6.0 and 7.5 to 6.5 with one run, one judge and no noise estimate; the two test maps also gained 5 items each. Treat as "no gain shown", not "loss shown".
- Not supported: C's 2.8x minutes and 3.8x cache read as an effect of 1a. C's test effort was unmatched (final-shape Known limits) and output tokens were not recorded. That row compares two unknown settings.

## Q1. After this test, what should bound the opening map each seat writes?

Options I name:
- 2a. Bound the reading. The map inspects the intake and the surfaces the intake names (repo paths, git history of those paths, evidence folders it lists) and nothing outside the repository. Outside sources wait for the fork round, where questions.md:40 already requires them and where 4-7 of 10-11 map URLs were reused anyway (my map-size round 1). The 1a content rule is dropped: it changed nothing the operator sees or pays.
- 2b. Bound the turn. A stated budget in the map prompt, such as "about 15 tool calls, about 5 minutes", as guidance the seat plans against, measured afterwards, not enforced by a cutoff.
- 2c. Keep 1a as recorded and accept the test as neutral.
- 2d. Revert to the rule before this fork (options in the map, "proportional"), no new bound.

1. Pick: 2a, with 2b's numbers reported, not imposed, and tested by the same replay before the skill edit, C launched with the pane's flags (`--effort medium`) and output recorded.
   One reason: the only cost driver the test exposed is reads, and web research is the one class of reading the map does that the fork round repeats by rule. C's original map made 15 web calls and 27 tool calls, the test map 20 and 56; the merge-turn C map cited 10 URLs, the test map 12. Removing that class takes out the calls and their context re-reads without touching what the map is for, and leaves no judgement call about "how much" for a peer to get wrong.
   Cost: the merged map loses its practitioner synthesis paragraph (seed-root-cause and merge-turn merged maps had one), which the operator does see. The fork round brings the same sources back one question at a time. Saving in dollars unmeasured until the replay; the proxy is C's 15-20 web calls out of 27-56 and whatever in-repo reads they triggered.

2. Rejected:
   - 2b alone: a number in a prompt is the Anthropic practice B cited, but on its own it is a quota the seat meets by reading less of the right thing. It belongs next to 2a as the measurement that tells whether 2a worked (calls and cache read per map), not as the rule.
   - 2c: the test shows 1a costs nothing and saves nothing. Keeping a rule that only moves bytes adds a sentence to the skill with no effect, and its operator-visible change (no option discussion in the merged map) is paid for nothing.
   - 2d: reverting also restores the double-written options, which are the one part the test confirmed as dead weight in both seats (0-4% reuse, 30-40% of bytes). Drop the "what each option could break or invite later" clause from the map sentence regardless, since 1a showed peers can map without it at no coverage cost that the test can distinguish from noise.

3. Evidence:
   - Tier better-than-training. Source: slots/map-size-test.md, read 2026-10-06 by C. Finding: table rows above; option share 30-40% to 1%; map bytes level or up; C original $3.3 reading against $1.2 writing; C test 56 tool calls, 20 web calls, 3.8M cache read.
   - Tier better-than-training. Source: slots/map-size-test-judge.md, read 2026-10-06 by C. Finding: coverage 6.5/6.0 (B), 7.5/6.5 (C); 7 and 11 items lost, 5 and 5 gained; one judge, one run.
   - Tier better-than-training. Source: slots/map-size-final-shape.md Known limits, read 2026-10-06 by C. Finding: C's effort unmatched, output unrecorded, so C's cost row cannot be attributed to 1a.
   - Tier better-than-training. Source: URL count, slots/map-size-test-map-C.md (12 distinct URLs) and issues/chart/merge-turn/slots/map-C.md (10), counted 2026-10-06 by C; my round-1 notes: 7 of 11 (B) and 4 of 10 (C) merge-turn map URLs reused in fork files. Finding: outside research is a steady 10-12 sources per C map and is partly redone in forks by rule (questions.md:40, SKILL.md:47).
   - Tier practitioner. Source: Anthropic, "How we built our multi-agent research system", the source B read 2026-10-06; I did not re-read it today and cite it from the merged notes. Finding as B stated it: agents without explicit effort guidance overinvest in simple tasks; the post gives call budgets per task class. Supports 2b as a stated guide.

4. Pitfalls:
   - A fork exists only because of an outside fact and 2a hides it. Removed by: the map lists "not inspected" items it wanted, and A either names the surface in the intake and re-prompts once or carries the item as fog to the first fork, which reads it. B's round-1 condition (inspect at map time when it changes scope or order) stays for repository facts; for outside facts the answer is the fork round.
   - The reading bound is met and the seat spends the saved calls on deeper repo reads, cost unchanged. Removed by: 2b's numbers in the replay and in proof-of-saving (tool calls, web calls, cache read per map turn). If calls do not fall, the bound is not the lever and the fork reopens with that number.
   - The replay repeats this test's confound. Removed by: the replay launches C with the same flags as the operator's pane and records effort and output tokens before the run is read; a run without them is not scored.
   - Coverage judged by one Opus pass is read as a measurement. Removed by: a coverage move of one point or less is noise by the pass rule written before the run, or two runs per seat are paid for.
   - The operator misses the practitioner paragraph in the merged map. Removed by: the Missing question below, asked before the skill edit.

5. Missing question: in the merged map you read at chart open, do you use the practitioner synthesis paragraph (who has done this at scale and where they disagree), or do you decide from the fork list and findings? If the latter, outside research leaves the map with nothing lost on your side. The fork has not asked what in the map you read.

## Not measured
- Cost of the map turn under 2a; the replay measures it.
- C's test effort setting and output tokens.
- Run-to-run noise of coverage scores.
