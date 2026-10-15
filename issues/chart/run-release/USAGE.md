chart run-release - operator wait 30.9 min, operator turns 6; A=56628, B=9496, C=unmeasured output

window 2026-10-15T22:16:38.000Z to 2026-10-15T23:01:39.264Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0c42a11d-8bd3-4863-9a34-73f053b563e0):
  models claude-opus-5-5
  effort high
  turns 6
  assistant messages 67
  working minutes 30.9
  first turn in window 2026-10-15T22:27:48.487Z 0.1 min
  input_tokens 134
  output_tokens 56628
  cache_read_input_tokens 9450890
  cache_creation_input_tokens 118839

seat B (harness codex, sessions 01a1402e-4c09-7ba1-8e9b-cdd7b70dff76):
  models gpt-6-astra
  effort high
  turns 5
  working minutes 5.9
  first turn in window 2026-10-15T22:16:43.138Z 1.9 min
  input_tokens 2954753
  cached_input_tokens 2897280
  output_tokens 9496
  reasoning_output_tokens 3589
  total_tokens 2964249

seat C: usage unmeasured (unknown harness pi)

operator turns
  2026-10-15T22:27:48.487Z 0.1 min, output A=589 B=0
  2026-10-15T22:28:48.125Z 0.1 min, output A=355 B=0
  2026-10-15T22:29:13.675Z 8.7 min, output A=18037 B=4126
  2026-10-15T22:38:15.578Z 0.1 min, output A=635 B=0
  2026-10-15T22:39:17.134Z 1.7 min, output A=9253 B=0
  2026-10-15T22:41:18.590Z 20.1 min, output A=24441 B=2686
  total operator wait 30.9 min
