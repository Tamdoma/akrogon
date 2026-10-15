chart live-worktree-guard - operator wait 23.4 min, operator turns 4; A=83691, B=22485, C=unmeasured output

window 2026-10-15T21:15:35.000Z to 2026-10-15T22:03:25.569Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0c42a11d-8bd3-4863-9a34-73f053b563e0):
  models claude-opus-5-5
  effort high
  turns 4
  assistant messages 96
  working minutes 23.4
  first turn in window 2026-10-15T21:38:09.799Z 0.2 min
  input_tokens 192
  output_tokens 83691
  cache_read_input_tokens 13567797
  cache_creation_input_tokens 214976

seat B (harness codex, sessions 01a1402e-4c09-7ba1-8e9b-cdd7b70dff76):
  models gpt-6-astra
  effort high
  turns 6
  working minutes 12.3
  first turn in window 2026-10-15T21:15:59.640Z 5.4 min
  input_tokens 6530833
  cached_input_tokens 6342272
  output_tokens 22485
  reasoning_output_tokens 5469
  total_tokens 6553318

seat C: usage unmeasured (unknown harness pi)

operator turns
  2026-10-15T21:38:09.799Z 0.2 min, output A=1351 B=0
  2026-10-15T21:39:23.519Z 1.1 min, output A=7005 B=0
  2026-10-15T21:40:45.062Z 0.1 min, output A=680 B=0
  2026-10-15T21:41:17.473Z 21.9 min, output A=42633 B=8692
  total operator wait 23.4 min
