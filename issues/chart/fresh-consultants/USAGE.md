chart fresh-consultants - operator wait 0.0 min, operator turns 0; A=49073, B=11825, C=unmeasured output

window 2026-10-17T10:07:32.000Z to 2026-10-17T10:22:40.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions c954dd5e-b178-44b7-8495-f725d95b59e5):
  models claude-opus-5-5
  effort high
  turns 0
  assistant messages 37
  working minutes 0.0
  input_tokens 74
  output_tokens 49073
  cache_read_input_tokens 6014588
  cache_creation_input_tokens 89774

seat B (harness codex, sessions 01a1494d-b330-73d0-9833-6c8428d3c16b + 01a14954-bb53-7350-bfb4-c0afd7e62302):
  models gpt-6-astra
  effort high
  turns 4
  working minutes 9.0
  input_tokens 2350031
  cached_input_tokens 2240768
  output_tokens 11825
  reasoning_output_tokens 3239
  total_tokens 2361856

seat C: usage unmeasured (unknown harness pi)

operator turns
  total operator wait 0.0 min
