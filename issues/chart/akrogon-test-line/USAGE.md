chart akrogon-test-line - operator wait 12.4 min, operator turns 1; A=32523, B=9864 output

window 2026-10-26T11:16:40.000Z to 2026-10-26T11:29:12.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions c8a48fc5-8a0e-4cc6-bd95-474f9490fb19):
  models claude-opus-5-5
  effort high
  turns 1
  calls 23
  average context per call 147023
  working minutes 12.4
  first turn in window 2026-10-26T11:14:16.733Z 12.4 min (opening reply was split across turns; not the whole map cost)
  input_tokens 46
  output_tokens 32523
  cache_read_input_tokens 3327435
  cache_creation_input_tokens 54057
  session c8a48fc5-8a0e-4cc6-bd95-474f9490fb19 totalCostUSD 0 (whole-session figure; can include other charts)

seat B (harness codex, sessions 01a17797-1f96-7e63-88d1-eed7b602500c + 01a177ed-f12e-7fb2-951b-f367c0ee36ac):
  models gpt-6.1-sol
  effort high
  turns 3
  calls 22
  average context per call 68630
  working minutes 6.7
  input_tokens 1509851
  cached_input_tokens 1415168
  output_tokens 9864
  reasoning_output_tokens 3921

operator turns
  2026-10-26T11:14:16.733Z 12.4 min, output A=32523 B=9864
  total operator wait 12.4 min
