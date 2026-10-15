chart run-release - operator wait 10.3 min, operator turns 5; A=30483, B=6810, C=unmeasured output

window 2026-10-15T22:16:38.000Z to 2026-10-15T22:40:40.516Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0c42a11d-8bd3-4863-9a34-73f053b563e0):
  models claude-opus-5-5
  effort high
  turns 5
  assistant messages 30
  working minutes 10.3
  first turn in window 2026-10-15T22:27:48.487Z 0.1 min
  input_tokens 60
  output_tokens 30483
  cache_read_input_tokens 3192609
  cache_creation_input_tokens 65174

seat B (harness codex, sessions 01a1402e-4c09-7ba1-8e9b-cdd7b70dff76):
  models gpt-6-astra
  effort high
  turns 4
  working minutes 4.5
  first turn in window 2026-10-15T22:16:43.138Z 1.9 min
  input_tokens 2268097
  cached_input_tokens 2224000
  output_tokens 6810
  reasoning_output_tokens 2225
  total_tokens 2274907

seat C: usage unmeasured (unknown harness pi)

operator turns
  2026-10-15T22:27:48.487Z 0.1 min, output A=589 B=0
  2026-10-15T22:28:48.125Z 0.1 min, output A=355 B=0
  2026-10-15T22:29:13.675Z 8.7 min, output A=18037 B=4126
  2026-10-15T22:38:15.578Z 0.1 min, output A=635 B=0
  2026-10-15T22:39:17.134Z 1.3 min, output A=7549 B=0
  total operator wait 10.3 min
