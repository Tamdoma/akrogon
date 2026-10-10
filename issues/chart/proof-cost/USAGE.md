chart proof-cost - operator wait 19.2 min, operator turns 9; A=80645, B=24058, C=64945 output

window 2026-10-10T09:22:51.000Z to 2026-10-10T11:49:30.009Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0f21842f-d038-46f1-a1db-ba2b3c8ebb07):
  models claude-opus-5-5
  effort medium
  turns 9
  assistant messages 83
  working minutes 19.2
  first turn in window 2026-10-10T09:37:06.371Z 0.2 min
  input_tokens 175
  output_tokens 80645
  cache_read_input_tokens 10945314
  cache_creation_input_tokens 437328

seat B (harness codex, sessions 01a1248b-9d86-7922-b3c0-78bf688904e2 + 01a1250e-a444-7171-9b8d-17ab3e4c4bf0):
  models gpt-6.1-sol
  effort medium
  turns 9
  working minutes 15.1
  input_tokens 6579488
  cached_input_tokens 6409216
  output_tokens 24058
  reasoning_output_tokens 3515
  total_tokens 6603546

seat C (harness claude, sessions 1d9ac3af-a972-414b-ac34-990172f14f4a):
  models claude-fable-5-1
  effort medium
  turns 10
  assistant messages 60
  working minutes 15.8
  first turn in window 2026-10-10T09:23:43.667Z 2.0 min
  input_tokens 1614
  output_tokens 64945
  cache_read_input_tokens 7900682
  cache_creation_input_tokens 370560

operator turns
  2026-10-10T09:37:06.371Z 0.2 min, output A=1469 B=0 C=0
  2026-10-10T09:38:23.525Z 0.1 min, output A=644 B=0 C=0
  2026-10-10T09:39:12.280Z 0.2 min, output A=1126 B=0 C=0
  2026-10-10T09:40:15.193Z 0.1 min, output A=662 B=0 C=0
  2026-10-10T09:40:55.737Z 10.6 min, output A=18173 B=8784 C=24618
  2026-10-10T11:34:13.670Z 0.1 min, output A=654 B=0 C=0
  2026-10-10T11:36:45.484Z 1.1 min, output A=6354 B=0 C=0
  2026-10-10T11:38:45.598Z 1.2 min, output A=6129 B=0 C=0
  2026-10-10T11:44:01.765Z 5.4 min, output A=16410 B=2292 C=9755
  total operator wait 19.2 min
