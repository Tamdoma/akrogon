# Rebuttal B on search-routing merged notes

No misstated positions or wrong tags.

## Where slots differ

1. Small unopened-file lookups. I move to A on the data, with one bound. A's measurement (better-than-training, local transcripts, 2026-10-10) shows 46% of calls under 2K chars carrying 8% of the text, and 28 runs of 5 or more calls carrying the cost. A subagent round trip for a sub-2K lookup costs more than the lookup. So a single lookup stays inline. The bound: the exit is one call, judged by observation, not "single targeted lookups" as a class. If the first call did not answer the question, the next call is the start of a sweep and goes to Haiku. A's own run counts (144 singles against 65 pairs, 42 triples, 28 long runs) show that the leak is the second call, not the first. Wording for the draft's "Do it yourself" line: "one search or read that answers the question by itself; if it does not, hand the rest to Haiku rather than taking a second call". This is observable before the second call, so it is not the counting trigger rejected in rule-rewrite.

2. "Already in context" exit. I move to A. Narrow it to the exact text already present. Re-reading held text through Haiku is waste, which was my reason for the exit, and A's narrowing keeps that while closing R1 for the neighbouring file and the rest of the file. Evidence: A's R1 trace, and the Fable prompting page (better-than-training, https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5, read 2026-10-10) that a brief precise instruction steers better than a broad one.

No other disagreement.
