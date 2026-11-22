chart watch-any-harness - operator wait 65.8 min, operator turns 6; A=157183, B=21877, C=unmeasured output

window 2026-11-20T11:30:27.000Z to 2026-11-20T12:02:37.000Z, 2026-11-20T12:54:17.000Z to 2026-11-20T13:34:57.000Z, 2026-11-20T13:36:50.000Z to 2026-11-20T13:40:38.718Z (open)

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/2b32091a-f4f9-4382-8ed3-14ed9495e28b.jsonl):
  models claude-opus-5-5
  effort high
  turns 6
  calls 148
  average context per call 181500
  working minutes 65.8
  first turn in window 2026-11-20T11:29:54.420Z 5.3 min
  input_tokens 316
  output_tokens 157183
  cache_read_input_tokens 26504123
  cache_creation_input_tokens 357561

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/20/rollout-2026-11-20T12-31-53-01a1f8ba-2fd4-7e40-b31e-c26038163be0.jsonl):
  models gpt-6.2-astra
  effort high
  turns 13
  calls 91
  average context per call 90758
  working minutes 13.6
  first turn in window 2026-11-20T11:31:54.198Z 0.8 min
  input_tokens 8258991
  cached_input_tokens 8116992
  output_tokens 21877
  reasoning_output_tokens 3412

seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-20T11:29:54.420Z 5.3 min, output A=15049 B=1188
  2026-11-20T11:35:54.001Z 0.2 min, output A=1403 B=0
  2026-11-20T11:37:49.189Z 24.8 min, output A=49856 B=8717
  2026-11-20T12:54:10.255Z 7.0 min, output A=14937 B=2693
  2026-11-20T13:10:08.730Z 24.8 min, output A=73328 B=8125
  2026-11-20T13:36:41.503Z 3.6 min, output A=6464 B=1154
  total operator wait 65.8 min
