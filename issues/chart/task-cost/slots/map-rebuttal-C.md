# Rebuttal C

1. **Misattribution, Baseline line 6.** "About 1 leaf per repo ever hit [the fix cap] (A, C)". I did not say that. My count from `issues/log.jsonl`: 0 akrogon leaves reached the cap; fix rounds per leaf were 0/1/2 for 52/6/1 leaves, and both `failed` moves came from stalled seats in `plan.positions` and `plan.synthesis`. Attribute the per-repo figure to A alone.

2. **F-workers: "measure first (A)" is already answered by A's own baseline.** Line 9 records subagent workers as the largest turn share (about 3.6 workers per leaf × 46 turns), and my count shows 27 of 38 closed leaves had one or two units where workers run sequentially (`worker-protocol.md:11`). That is the measurement. Deferring the default flip to a further measurement adds a round without new evidence. Flip `src/config.ts:32` to `inline`; `implement: subagents` stays as the per-repo opt-in.

3. **F-effort: I no longer hold `high` over `medium`.** A's era data (line 10: review→fix 0.31 per leaf at medium versus 0.40 to 0.42 at max) is the retry evidence I said was missing. Medium is the article's default and the data shows no loop cost. Record C as agreeing with medium, one value per seat.

No other disagreement.
