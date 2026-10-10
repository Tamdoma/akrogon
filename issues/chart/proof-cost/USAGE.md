chart proof-cost - operator wait 13.4 min, operator turns 8; A=62272, B=0, C=55190 output

window 2026-10-10T09:22:51.000Z to 2026-10-10T11:39:37.495Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0f21842f-d038-46f1-a1db-ba2b3c8ebb07):
  models claude-opus-5-5
  effort medium
  turns 8
  assistant messages 62
  working minutes 13.4
  first turn in window 2026-10-10T09:37:06.371Z 0.2 min
  input_tokens 135
  output_tokens 62272
  cache_read_input_tokens 8644542
  cache_creation_input_tokens 348725

seat B (harness codex, sessions 01a1248b-9d86-7922-b3c0-78bf688904e2):
  turns 0
  working minutes 0.0
  input_tokens 0
  cached_input_tokens 0
  output_tokens 0
  reasoning_output_tokens 0
  total_tokens 0

seat C (harness claude, sessions 1d9ac3af-a972-414b-ac34-990172f14f4a):
  models claude-fable-5-1
  effort medium
  turns 9
  assistant messages 54
  working minutes 13.5
  first turn in window 2026-10-10T09:23:43.667Z 2.0 min
  input_tokens 1451
  output_tokens 55190
  cache_read_input_tokens 6907913
  cache_creation_input_tokens 158576

operator turns
  2026-10-10T09:37:06.371Z 0.2 min, output A=1469 B=0 C=0
  2026-10-10T09:38:23.525Z 0.1 min, output A=644 B=0 C=0
  2026-10-10T09:39:12.280Z 0.2 min, output A=1126 B=0 C=0
  2026-10-10T09:40:15.193Z 0.1 min, output A=662 B=0 C=0
  2026-10-10T09:40:55.737Z 10.6 min, output A=18173 B=0 C=24618
  2026-10-10T11:34:13.670Z 0.1 min, output A=654 B=0 C=0
  2026-10-10T11:36:45.484Z 1.1 min, output A=6354 B=0 C=0
  2026-10-10T11:38:45.598Z 0.8 min, output A=4166 B=0 C=0
  total operator wait 13.4 min
