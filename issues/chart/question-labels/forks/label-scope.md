# Label scope

## Question
1. Do question numbers restart at 1 every round, or keep counting for the whole chart session?

### Carries
- Operator 2026-09-28: "always stick to the 1A, 1b, 1c, 2a, 2b, 2c", "simplest, most elegant solution", "I don't want to overcomplicate the skill".
- Settled by the intake, not asked: labels are `<number><letter>` (`1a`, `1b`), reply key `1a 2b`, recommended option keeps `(recommended)`.

## Findings
- better-than-training · `skills/chart-issues/assets/questions.md:8,14,21,27` read 2026-09-28 · template mixes `Q1`, `A`, `1-A` and restarts at 1 each round · the edit is three template lines plus one rule sentence.
- better-than-training · `~/.claude/CLAUDE.md` Reference Points read 2026-09-28 · global rule says keep codes across the conversation and invent new ones · a per-round restart reuses `1a` inside one conversation, which is the collision that produced `QQ`. A skill sentence saying these labels replace any other code scheme resolves it either way.
- Operator 2026-09-28, not yet taken: "1 - I'm leaning more toward b Because that way we will have one whole unit. So one fork, no matter how many questions, will be one whole unit. However, I don't want to overcomplicate with remembering counters etc. I think the agent itself should be able to keep that in its memory." The stated reason (one fork is one unit) matches 1a, because a round is one fork (`questions.md:29`). Asked to confirm.
- Under 1b the agent needs no stored counter. It continues from the numbers in the conversation, and after compaction it reads the last number from the chart's fork files, which already record each question.
- Restart: fork files stay self-contained (`1a` means question 1 of that fork). Continuous: a label is unique in the session, so "3b" from an earlier round is unambiguous, but the counter must survive compaction.

## Taken
Operator 2026-09-28: `1a`. Question numbers restart at 1 each round. A round is one fork, so each fork is one unit: its questions are `1`, `2`, its options `1a`, `1b`, `2a`, its reply key `1a 2b`. Reason: one fork is one whole unit, with no counter to remember. Foreclosed: counting across the chart session (1b).
