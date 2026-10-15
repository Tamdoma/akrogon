chart temp-release - operator wait 14.2 min, operator turns 3; A=35066, B=11808, C=unmeasured output

window 2026-10-15T23:25:34.000Z to 2026-10-15T23:43:31.305Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0c42a11d-8bd3-4863-9a34-73f053b563e0):
  models claude-opus-5-5
  effort high
  turns 3
  assistant messages 40
  working minutes 14.2
  first turn in window 2026-10-15T23:27:36.312Z 1.2 min
  input_tokens 84
  output_tokens 35066
  cache_read_input_tokens 4957923
  cache_creation_input_tokens 79186

seat B (harness codex, sessions 01a1402e-4c09-7ba1-8e9b-cdd7b70dff76):
  models gpt-6-astra
  effort high
  turns 4
  working minutes 7.9
  first turn in window 2026-10-15T23:26:03.783Z 2.5 min
  input_tokens 3988907
  cached_input_tokens 3857792
  output_tokens 11808
  reasoning_output_tokens 3848
  total_tokens 4000715

seat C: usage unmeasured (unknown harness pi)

operator turns
  2026-10-15T23:27:36.312Z 1.2 min, output A=5650 B=3254
  2026-10-15T23:30:18.140Z 1.4 min, output A=5893 B=0
  2026-10-15T23:31:45.109Z 11.6 min, output A=19801 B=6310
  total operator wait 14.2 min
