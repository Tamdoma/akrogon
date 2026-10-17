chart base-red - operator wait 29.0 min, operator turns 4; A=108398, B=32535, C=unmeasured output

window 2026-10-17T08:17:04.000Z to 2026-10-17T09:04:40.067Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions c954dd5e-b178-44b7-8495-f725d95b59e5):
  models claude-opus-5-5
  effort high
  turns 4
  assistant messages 109
  working minutes 29.0
  first turn in window 2026-10-17T08:33:36.458Z 0.4 min
  input_tokens 218
  output_tokens 108398
  cache_read_input_tokens 14669526
  cache_creation_input_tokens 297719

seat B (harness codex, sessions 01a148d2-b706-7d93-acd8-744c86365e07):
  models gpt-6-astra
  effort high
  turns 12
  working minutes 20.2
  first turn in window 2026-10-17T08:18:17.782Z 3.8 min
  input_tokens 10869186
  cached_input_tokens 10603136
  output_tokens 32535
  reasoning_output_tokens 8695
  total_tokens 10901721

seat C: usage unmeasured (unknown harness pi)

operator turns
  2026-10-17T08:33:36.458Z 0.4 min, output A=2199 B=0
  2026-10-17T08:34:34.818Z 0.2 min, output A=934 B=0
  2026-10-17T08:35:32.780Z 0.1 min, output A=680 B=0
  2026-10-17T08:36:10.717Z 28.3 min, output A=69003 B=19253
  total operator wait 29.0 min
