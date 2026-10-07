# cut-boundary, merged round (A, B, C)

This round settles two things that every later question depends on: how much B and C write back to me, and which model C runs on. Both keep the shape of the round you read unchanged.

### 1 · Can B and C send me short notes instead of a full formatted round?

Today the rule (skills/chart-issues/assets/questions.md:48) makes each peer write a complete round with headings, options and prose, exactly like the one you read. You never see those. I read both, then write the round from scratch. Example: in merge-turn, C wrote about 10KB per fork file and B about 7KB, and I reused 0 to 4% of that wording.

Research: better-than-training · issues/chart/merge-turn/slots and seed-root-cause/slots, measured 2026-10-06 by C · 0-4% of each merged file comes from any peer file, and a notes-only file (today's rebuttals) is 25-35% the size of a full round · it showed the peers' formatting is not what reaches you, although their reasoning does through my rewrite. (C; A and B reached the same choice independently)

- **1a (recommended)** (A,B,C) Each peer sends notes per question: its pick with the reason and cost, the options it rejects, its evidence, the pitfalls it sees with what removes each, and where it disagrees with the question. I write the one round you read. It wins because the peers stop writing the formatting you never see. The estimate is about two thirds less peer writing, taken from file sizes and not yet measured on a real fork. Cost: a thin note could hide a missed pitfall.
- **1b** Peers keep writing full rounds. Nothing changes and nothing is saved.

Pitfalls avoided: a peer silently dropping pitfalls is reduced by making pitfalls a required part of the note (C), and a pitfall no peer thinks of can still be missed (B). Me tagging a peer as agreeing when it said nothing is removed by a rule that a tag may only cite a line the peer wrote (C). Me rewriting away an objection is removed by the rebuttal step, which stays (B). A saving that is claimed and never checked is removed by the later proof-of-saving question, which measures peer tokens per question (B,C).

### 2 · Which model should C run on?

C runs on Fable, the most expensive model. On the two 10-05 charts the door ran on Opus 5.5 and cost $11.20 and $12.92, while C cost $11.37 and $18.84. From the recorded costs, Fable costs about 2.5 times Opus for cache writes, 2.2 times for output and 1.4 times for cache reads. This is your setting when the pane starts, so no code changes either way.

Research: better-than-training · cost-state records in ~/.claude/projects/-home-ivan-Work-infra-akrogon, fitted 2026-10-06 by A · C's seed-root-cause bill splits about 43% cache write, 36% output, 20% cache read · applying the three price ratios to that split gives about 50% off C's bill on Opus if C uses the same number of tokens, which is not measured (the fit of the cache prices was added after C's rebuttal asked for it, so no peer has checked it). Practitioner · Anthropic "Demystifying evals for AI agents", read 2026-10-06 by B · compare models on the same tasks with cost and quality together · it is why B and C want one measured chart before switching.

- **2a (recommended)** (A) Start C on Opus 5.5 from the next chart. It wins because the estimate is about half of C's bill at once, roughly $6 to $10 per chart at the 10-05 sizes. Cost: nobody has measured how good C's second opinion is on Opus or how many tokens it would use, and on a chart where the door also runs on Opus, A and C agreeing counts as one model and not two.
- **2b** (B,C) Keep C on Fable for the next chart so only the note format changes, then you decide on the model with that chart's cost and quality numbers in hand. You get a clean before and after. Cost: one more chart at the Fable price, roughly $6 to $10 extra by the same estimate.

Pitfalls avoided: switching model in the middle of a chart is removed by changing only when a chart starts (C). A and C agreeing because they are the same model is reduced by B staying on codex, a different vendor (B,C). The 9-minute "go" stall is a Claude harness behaviour on any model and is removed by the later peer-packet question (C).

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
Both peers still prefer 2b over my 2a. B's reason: the door and C do different jobs, so C costing more than the door proves nothing about Opus being good enough, and changing the format and the model on the same chart blurs which change saved what. C's reason: the price saving is an estimate, while a C that shares a model with the door gives a weaker second opinion on every fork afterwards. I keep 2a because the estimated saving is the largest single one found, and I accept that its size and the quality on Opus are unproven until a chart runs. The two-thirds figure in 1a is a forecast from file sizes (B), so the proof-of-saving question has to measure it. The same price gap applies to the door itself: this session runs the door on Fable.
