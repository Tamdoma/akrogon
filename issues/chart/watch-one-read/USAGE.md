chart watch-one-read - operator wait 16.2 min, operator turns 1; A=42884, C=17222, B=unmeasured output

window 2026-11-25T17:18:02.000Z to 2026-11-25T17:34:26.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/17ce552b-3b8d-454d-bbe6-6464a0195d5b.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 41
  average context per call 176521
  working minutes 16.2
  first turn in window 2026-11-25T17:15:58.616Z 16.2 min
  input_tokens 83
  output_tokens 42884
  cache_read_input_tokens 7150229
  cache_creation_input_tokens 87062

seat C (harness codex, sessions /home/ivan/.codex/sessions/2026/11/25/rollout-2026-11-25T18-19-13-01a213b7-f6f5-77a1-aed1-df66d7089a88.jsonl):
  models gpt-6.2-sol
  effort high
  turns 3
  calls 45
  average context per call 104240
  working minutes 7.0
  first turn in window 2026-11-25T17:19:13.343Z 3.6 min
  input_tokens 4690808
  cached_input_tokens 4552832
  output_tokens 17222
  reasoning_output_tokens 5645

seat B: usage unmeasured (unknown harness agy)

operator turns
  2026-11-25T17:15:58.616Z 16.2 min, output A=42884 C=17222
  total operator wait 16.2 min
