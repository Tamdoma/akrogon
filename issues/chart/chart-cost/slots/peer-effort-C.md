# Slot C notes, fork peer-effort, 2026-10-06

Blind notes. Read: INTAKE.md, forks/peer-effort.md, questions.md:44 (pane creation and peer args), ~/.codex/config.toml lines 1-2, codex transcripts ~/.codex/sessions/2026/10/01-06 (my own pass, below).

## Q1. Which reasoning effort should slot B run at for chart door work?

Options I name:
- 1a. medium, passed at pane start (`-c model_reasoning_effort=medium`), as this chart's B runs.
- 1b. high, the value in ~/.codex/config.toml line 2 since 2026-10-04 14:47.
- 1c. low.
- 1d. unset, so B inherits whatever config.toml holds at launch.

1. Pick: 1a medium, as operator practice at pane start, not written into the skill or config.
   One reason: effort is the single setting that multiplies B's time and tokens per turn without a measured gain. My pass over the codex transcripts (below): per turn, high produces 6.3-10.7k output tokens with 34-49% of them reasoning, medium 1.7-3.3k output with 15-25% reasoning, so high is 2.5-4x the tokens and 2.5-3.5x the minutes per turn. The operator's complaint is time between forks and tokens, and B's turns are on the critical path of every fork (A waits in the foreground, questions.md:44).
   Cost: B's quality at medium against high is unmeasured. The only quality signal I have is the map round, where all three of B's rebuttal points at medium were accepted, which is a floor, not a comparison.

2. Rejected:
   - 1b high: 2.5-4x the tokens and minutes per turn (my pass and M11), on 10-02 as on 10-06, so it is not a one-off. No measured quality gain to pay for it. High was also the effort of the 10-02 charts the operator remembers as slower (7-9 minutes per fork, M1), which fits.
   - 1c low: unmeasured on this door. The only low session in the window (7d5cceb4, 1 turn, 82 output tokens) is not chart work. Trading an unmeasured quality drop for a saving smaller than medium already gives (medium turns are 1-2 minutes, N4 in my cut-boundary file) is not worth a trial while larger levers (one-rendering, peer-packet) are untaken.
   - 1d unset: the operator's own config.toml now says high, so unset means high silently. The 10-03 unset session (34fe6a69, 40 turns, median 1.5 min, 16% reasoning) behaved like medium only because the config was edited the next day. Unset makes B's effort depend on a file outside the repo that the operator edits for other work.

3. Evidence:
   - Tier better-than-training. Source: ~/.codex/sessions/2026/10/01-06/rollout-*.jsonl, `turn_context.payload.effort`, `task_started`/`task_complete` timestamps, `token_count.info.total_token_usage`. Read 2026-10-06 by C. Finding, sessions with 10 or more turns (the peer-sized ones): high 61903a12 (10-01) 22 turns, median 3.9 min, 6.3k output per turn, 49% reasoning; 6e57eb2a (10-05) 16 turns, 5.3 min, 10.7k, 38%; 665ec723 (10-05) 42 turns, 4.1 min, 7.2k, 37%; abc2f85d and 41fa5a6d (10-02) 10 and 14 turns, 4.5-4.6 min, 6.6-9.6k, 32-34%. Medium or unset: 5b939a36 (10-05, seed-root-cause B) 14 turns, 1.1 min, 1.7k, 16%; e963142b (10-05, merge-turn B) 13 turns, 1.8 min, 2.8k, 25%; 34fe6a69 (10-03, unset) 40 turns, 1.5 min, 3.3k, 16%; 3f11de50 (10-01) 9 turns, 2.1 min, 2.8k, 15%. xhigh 6d61e976 16 turns, 7.9 min, 12.3k, 59%. This agrees with M11 on minutes and adds the token side.
   - Tier better-than-training. Source: ~/.codex/config.toml lines 1-2, read 2026-10-06 by C: `model = "gpt-6.1-sol"`, `model_reasoning_effort = "high"`. Finding: any chart pane started without an explicit effort flag runs at high.
   - Tier better-than-training. Source: skills/chart-issues/assets/questions.md:44, read 2026-10-06 by C. Finding: when the door creates peer panes it asks once for each peer's harness kind and arguments, so the effort flag already has a place to be given per chart without a code change. Operator-supplied panes are used as given.
   - Tier operator. Source: forks/peer-effort.md Carries, operator 2026-10-06 verbatim on C's model: "But don't hard code it anywhere, this is what I will do internally moving forward." Finding: the same stance applied to B's effort means the value lives in the launch command, not in the repo.
   - Tier practitioner: not found. I did not search outside sources for this; the question is about this operator's own measured sessions and vendor guidance on effort levels would be model-knowledge tier at best.

4. Pitfalls:
   - A pane started without the flag inherits high from config.toml and nobody notices until the fork feels slow. Removed by: a named operator step, the launch command for B carries `-c model_reasoning_effort=medium` every time, and the door's pane-creation prompt (questions.md:44) shows the args back so the operator sees what was passed. Probe: `turn_context.payload.effort` in B's first transcript record after launch.
   - Effort gets written into the skill or a door default to "fix" the pitfall above, against the operator's words on C's model. Removed by: the record states Q1 as operator practice, no leaf, same as cut-boundary Q2.
   - Medium is kept after a chart where B's notes were visibly thin and the cause is misread as the notes format (cut-boundary 1a) rather than effort, or the reverse. Removed by: proof-of-saving records B's effort and the note format per chart alongside tokens, so the two changes are separable.
   - Codex changes what "medium" means in a later gpt release and the 1.1-1.8 minute turns drift. Removed by: the per-turn minutes and output tokens per turn above are the baseline; proof-of-saving re-measures them on each chart.
   - A's foreground wait budget (peer-wait.ts, questions.md:44) was sized while B ran at medium. If the operator ever launches at high, 4-5 minute turns are still inside a 5000 s timeout, so nothing breaks, only time is lost. No removal needed, noted so the budget is not cut below high's turn time later.

5. Missing question: is the 2026-10-04 edit of ~/.codex/config.toml to high intentional for the operator's non-chart codex work? If yes, 1a stands and the flag is mandatory at every chart launch. If it was set for chart work, the operator may prefer to set the file back to medium and drop the flag, which makes 1d safe. The fork does not ask which it was.

## Not measured
- B's dollars at any effort (codex records tokens, not cost).
- B's quality at medium against high on the same fork. No chart has run the same fork at both.
- Which 10-06 codex session is this chart's B; I did not need it for the per-effort figures.
