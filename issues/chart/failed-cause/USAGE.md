chart failed-cause - operator wait 21.4 min, operator turns 4; A=84258, B=29399, C=unmeasured output

window 2026-10-17T08:17:04.000Z to 2026-10-17T08:57:05.025Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions c954dd5e-b178-44b7-8495-f725d95b59e5):
  models claude-opus-5-5
  effort high
  turns 4
  assistant messages 84
  working minutes 21.4
  first turn in window 2026-10-17T08:33:36.458Z 0.4 min
  input_tokens 168
  output_tokens 84258
  cache_read_input_tokens 10625503
  cache_creation_input_tokens 246681

seat B (harness codex, sessions 01a148d2-b706-7d93-acd8-744c86365e07):
  models gpt-6-astra
  effort high
  turns 11
  working minutes 16.2
  first turn in window 2026-10-17T08:18:17.782Z 3.8 min
  input_tokens 10099939
  cached_input_tokens 9883392
  output_tokens 29399
  reasoning_output_tokens 7621
  total_tokens 10129338

seat C: usage unmeasured (unknown harness pi)

operator turns
  2026-10-17T08:33:36.458Z 0.4 min, output A=2199 B=0
  2026-10-17T08:34:34.818Z 0.2 min, output A=934 B=0
  2026-10-17T08:35:32.780Z 0.1 min, output A=680 B=0
  2026-10-17T08:36:10.717Z 20.7 min, output A=44863 B=16117
  total operator wait 21.4 min
