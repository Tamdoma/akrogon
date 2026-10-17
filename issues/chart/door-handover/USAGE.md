chart door-handover - operator wait 46.5 min, operator turns 9; A=147371, B=14312 output

window 2026-10-17T15:43:32.000Z to 2026-10-17T16:41:31.965Z (open)

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions c954dd5e-b178-44b7-8495-f725d95b59e5):
  models claude-opus-5-5
  effort high
  turns 9
  calls 138
  average context per call 145519
  working minutes 46.5
  first turn in window 2026-10-17T15:42:02.982Z 3.6 min (opening reply was split across turns; not the whole map cost)
  input_tokens 276
  output_tokens 147371
  cache_read_input_tokens 19714489
  cache_creation_input_tokens 366891

seat B (harness codex, sessions 01a14962-9a70-7fe1-bb05-da800735f574 + 01a14a89-9519-7af0-95d2-cbf5c4b4e2d4):
  models gpt-6-astra
  effort high
  turns 5
  calls 34
  average context per call 80209
  working minutes 8.3
  input_tokens 2727119
  cached_input_tokens 2614912
  output_tokens 14312
  reasoning_output_tokens 3789

operator turns
  2026-10-17T15:42:02.982Z 3.6 min, output A=11688 B=0
  2026-10-17T15:47:15.830Z 4.7 min, output A=19323 B=5363
  2026-10-17T15:52:07.651Z 25.1 min, output A=68498 B=6167
  2026-10-17T16:21:03.506Z 1.4 min, output A=7446 B=0
  2026-10-17T16:22:35.078Z 0.1 min, output A=631 B=0
  2026-10-17T16:23:51.713Z 6.2 min, output A=17093 B=2782
  2026-10-17T16:35:16.946Z 0.2 min, output A=779 B=0
  2026-10-17T16:36:11.906Z 0.1 min, output A=680 B=0
  2026-10-17T16:36:23.640Z 5.1 min, output A=21233 B=0
  total operator wait 46.5 min
