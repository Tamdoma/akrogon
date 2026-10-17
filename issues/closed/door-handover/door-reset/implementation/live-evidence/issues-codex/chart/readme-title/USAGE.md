chart readme-title - operator wait 0.0 min, operator turns 2; A=706 output

window 2026-10-17T17:28:31.000Z to 2026-10-17T17:29:14.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness codex, sessions 01a14ae8-6959-7663-882e-c01e0f3b6a48):
  turns 0, 1 incomplete
  calls 5
  average context per call 31030
  working minutes 0.0
  input_tokens 155150
  cached_input_tokens 115200
  output_tokens 706
  reasoning_output_tokens 28

operator turns
  2026-10-17T17:28:29.403Z incomplete (reply not finished before the next operator message or the window end), output A=1
  2026-10-17T17:28:31.457Z incomplete (reply not finished before the next operator message or the window end), output A=705
  total operator wait 0.0 min
