# Fork change: notes A

Written before reading slots/change-B.md.

## 1 · How does the door get second-version quality on the first print?

Pick: a second writing pass. The door writes the full round as today, does not print it, rewrites it under one instruction that says in the skill's own words what `elid` asks (for a reader of 18 who does not know the process: simpler words, shorter, same structure and every element, plus the context that makes the choice easy, meaning what each option does for the operator), and prints only the rewrite. The pass replaces today's last sentence of the register rule ("Before sending a round, A reads it once against these rules and fixes what fails"), so the door gains no step: the read-once check becomes the rewrite. Cost: one more writing pass per round, a median of 776 output tokens per alias rewrite today (survey reader, 132 rewrites); the operator's alias turn goes away.

Rejected:
- Wording only, one pass. The rule already asks for everyday words and "only what the decision needs". Doors that wrote "at the `elid` level" in one pass in this session got `elid` on 3 of 3 rounds (shared-rules shape, shared-rules handoff, this chart's cause round). More words in the rule repeat a rule that exists.
- No edit, apply the existing rule better. Same 3 of 3.
- A second seat or a fresh session rewrites. A fresh reader does not know the process, which is the point, but it adds an exchange per round. The same seat's rewrite is what the operator answers today.

Evidence:
- better-than-training · A's reader (scratchpad `rr/`, 2026-11-11): 64 rewritten rounds, 52 answered after the first rewrite (81%), against 18 of 82 first prints (22%). B's cohort: 33 rewritten, 28 after one rewrite.
- better-than-training · Anthropic, "Prompting best practices", section "Chain complex prompts", https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices, read 2026-11-11: "The most common chaining pattern is self-correction: generate a draft → have Claude review it against criteria → have Claude refine based on the review."
- practitioner · Anna Kaley, NN/g, "Match Between the System and the Real World" (from B's map): write in the user's concepts. Chip and Dan Heath, HBR, "The Curse of Knowledge", 2006-12, https://hbr.org/2006/12/the-curse-of-knowledge, read 2026-11-11: people immersed in a subject speak in abstractions that summarize knowledge the listener lacks. The seat that just did the research is that writer; a rewrite with one job reads the text as its reader.

Pitfalls:
- A rewrite changes an option (3 of 21 sampled pairs). Removed in the same pass: every option, recommendation, number the decision depends on and consultant disagreement of the draft is in the print, compared by meaning.
- A rewrite reaches for analogies ("box", "fence" failed). The instruction asks for concrete words.
- The draft becomes a second record. It stays in the scratchpad and is discarded; "no second full-round file is written" stays true for the chart.
- "Shorter" read as a cap. No number is stated (O6 stays).

Question the fork does not ask: who keeps the alias text in step with the operator's private instructions. Nobody: the skill states the rewrite in its own words, so it works for any operator and any harness.

## 2 · Which outputs?

Pick: every round the operator must answer: fork rounds, the signposts round, the split proposal and the handoff review, each with its own required elements. Reason: all four got `elid` in this session. Cost: the pass also runs on small rounds.

Rejected: fork rounds only (the handoff review got `elid` twice in this session). Also covering rounds A answers itself under autopilot: no operator turn is saved there, so the pass is pure cost; those rounds skip it.

## 3 · How is the result shown?

Pick: three plain things and no new counter.
- Before the edit: this chart's next round is written with the second pass; the draft-to-print changes and the operator's reply are recorded in the fork.
- The leaf: questions.md holds the pass and still names every required element; the existing skill checks pass.
- After release: the usage line every chart already prints ("operator turns N") against the forks taken. shared-rules shows 8 operator turns for 3 answers.

Rejected: a new count of rewrites in `chart-usage.ts` (my map position). The existing line already moves with the rewrite rate, and signpost 1a ranks fewer parts first. A paid before/after run: recorded data and the live rounds show it.

Evidence: `issues/chart/shared-rules/USAGE.md`, read 2026-11-11.
