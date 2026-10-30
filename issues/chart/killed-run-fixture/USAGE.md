chart killed-run-fixture - operator wait 20.8 min, operator turns 1; A=51590, B=23539 output

window 2026-10-28T12:53:36.000Z to 2026-10-28T13:14:40.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions df4e7766-cbbc-4c40-8f28-60e419fee3e1):
  models claude-opus-5-5
  effort high
  turns 1
  calls 41
  average context per call 148869
  working minutes 20.8
  first turn in window 2026-10-28T12:52:57.998Z 20.8 min
  input_tokens 77
  output_tokens 51590
  cache_read_input_tokens 6007978
  cache_creation_input_tokens 95566

seat B (harness codex, sessions 01a18292-ed39-7173-9896-11f60473ed82):
  models gpt-6.1-sol
  effort high
  turns 5
  calls 39
  average context per call 63849
  working minutes 10.6
  first turn in window 2026-10-28T12:56:15.467Z 3.4 min
  input_tokens 2490100
  cached_input_tokens 2388992
  output_tokens 23539
  reasoning_output_tokens 12815

operator turns
  2026-10-28T12:52:57.998Z 20.8 min, output A=51590 B=23539
  total operator wait 20.8 min
