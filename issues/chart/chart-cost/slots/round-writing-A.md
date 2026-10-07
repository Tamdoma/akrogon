# round-writing, A's position (written before reading B or C)

Q1. Pick: keep the merged file as the full round, so the text the peers rebut is the text the operator reads. A's own pre-merge position shrinks to notes, which cut-boundary already implies. Reason: the further step saves about 3% of A's bill and half a minute per fork, and it gives up the one guarantee that no peer-unseen wording reaches the operator. Cost: the round is still written twice, once to the file and once in chat.
Rejected: compact merged notes with the full round written only in chat (small saving, and A's prose after the rebuttal is checked by nobody). The operator reading the merged file instead of chat (changes how a round reaches the operator, against the lock).
Evidence: better-than-training · forks/round-writing.md Carries, measured 2026-10-06 by A · one round is 1.5k-2k output tokens, about $0.04 per fork at Opus prices · the lever is small against A's even three-way split of output, cache read and cache write.
Pitfalls: A's chat round drifting from the rebutted file. Removed by presenting the file's text as written and adding only the challenge check.
Missing question: none.

Q2. Pick: the round template gains two rules: internal process names (door, slot, merge, final-shape) are replaced by everyday words, and each question with a real trade-off ends with one "How to choose" line. Reason: those are the two things A's elid restatements added in this chart, and they fix the skill's own vocabulary leaking, which any operator would hit. Cost: a few more words per question, and the operator may still type elid from habit, so the saving is unproven.
Rejected: a line in the operator's own CLAUDE.md asking for elid register in chart rounds (works with no skill change, and leaves the leak in the skill for anyone else). No change (6-8% of A's output and one extra round trip per round on 10-06).
Evidence: better-than-training · Claude door transcripts, counted 2026-10-06 by A · 17 alias requests in about 650 operator messages through 10-05, then 17 of 49 on the 10-06 framework chart and one after every round here · ~/.claude/CLAUDE.md was last edited 2026-10-06 08:06 local, so the alias habit is new, and the edit time does not prove what changed.
Pitfalls: plain wording dropping a fact the decision needs. Removed by keeping every part of the round shape (questions.md:27). A saving claimed and not seen: proof-of-saving counts alias requests per round.
Missing question: none.
