chart token-spend - operator wait 19.6 min, operator turns 1; A=52467, C=31041, B=12148 output

window 2026-10-17T17:26:01.000Z to 2026-10-17T17:45:44.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions c954dd5e-b178-44b7-8495-f725d95b59e5):
  models claude-opus-5-5
  effort high
  turns 1
  calls 41
  average context per call 122395
  working minutes 19.6
  first turn in window 2026-10-17T17:25:20.648Z 19.6 min (opening reply was split across turns; not the whole map cost)
  input_tokens 82
  output_tokens 52467
  cache_read_input_tokens 4867082
  cache_creation_input_tokens 151047

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-17T17-26-06-913Z_01a14ae6-4340-711d-8935-4d75ec4238ac.jsonl):
  models muse-wonder-full-1.0-contributor
  effort high
  turns 4
  calls 35
  average context per call 55354
  working minutes 9.9
  first turn in window 2026-10-17T17:26:08.039Z 1.1 min
  input_tokens 95764
  output_tokens 31041
  cache_read_input_tokens 1841640
  cache_creation_input_tokens 0
  reasoning_output_tokens 13318

seat B (harness codex, sessions 01a14ae6-33dd-7311-8256-23f49c5ca63d):
  models gpt-6-astra
  effort high
  turns 3
  calls 26
  average context per call 70932
  working minutes 6.9
  first turn in window 2026-10-17T17:28:20.726Z 4.3 min
  input_tokens 1844219
  cached_input_tokens 1744384
  output_tokens 12148
  reasoning_output_tokens 2468

operator turns
  2026-10-17T17:25:20.648Z 19.6 min, output A=52467 C=31041 B=12148
  total operator wait 19.6 min
