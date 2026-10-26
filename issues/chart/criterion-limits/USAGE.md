chart criterion-limits - operator wait 16.2 min, operator turns 3; A=35328, B=6800, C=16428 output

window 2026-10-26T08:12:17.000Z to 2026-10-26T08:30:47.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions c8a48fc5-8a0e-4cc6-bd95-474f9490fb19):
  models claude-opus-5-5
  effort high
  turns 3
  calls 32
  average context per call 129330
  working minutes 16.2
  first turn in window 2026-10-26T08:11:29.428Z 5.6 min
  input_tokens 64
  output_tokens 35328
  cache_read_input_tokens 4054626
  cache_creation_input_tokens 83877
  session c8a48fc5-8a0e-4cc6-bd95-474f9490fb19 totalCostUSD 0 (whole-session figure; can include other charts)

seat B (harness codex, sessions 01a17709-5dff-7513-be9e-5b98548e92aa + 01a1774e-46a2-77d3-99a4-1c86ffddaa5f):
  models gpt-6.1-sol
  effort high
  turns 4
  calls 23
  average context per call 63124
  working minutes 5.6
  first turn in window 2026-10-26T08:12:21.203Z 2.6 min
  input_tokens 1451860
  cached_input_tokens 1386624
  output_tokens 6800
  reasoning_output_tokens 3018

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-26T07-07-49-074Z_01a17709-6dd1-73a9-bf2e-045aaf5df656.jsonl + /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-26T08-23-05-201Z_01a1774e-56f1-7266-943c-debe23f9cb23.jsonl):
  models muse-wonder-full-1.0-contributor
  effort high
  turns 4
  calls 27
  average context per call 35527
  working minutes 10.5
  first turn in window 2026-10-26T08:12:21.804Z 5.7 min
  input_tokens 70324
  output_tokens 16428
  cache_read_input_tokens 888904
  cache_creation_input_tokens 0
  reasoning_output_tokens 10823

operator turns
  2026-10-26T08:11:29.428Z 5.6 min, output A=1925 B=2960 C=4784
  2026-10-26T08:19:15.402Z 0.1 min, output A=686 B=0 C=0
  2026-10-26T08:20:06.744Z 10.5 min, output A=32717 B=3840 C=11644
  total operator wait 16.2 min
