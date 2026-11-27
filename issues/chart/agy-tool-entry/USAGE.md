chart agy-tool-entry - operator wait 21.5 min, operator turns 2; A=23648, B=24371, D=9393, C=unmeasured output

window 2026-11-27T10:10:59.000Z to 2026-11-27T10:33:15.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/cbe6ffb3-cf96-4e61-ac35-95fbfe7b9209.jsonl):
  models claude-opus-5-5
  effort medium
  turns 2
  calls 48
  average context per call 148917
  working minutes 21.5
  first turn in window 2026-11-27T10:10:04.655Z 9.6 min
  input_tokens 101
  output_tokens 23648
  cache_read_input_tokens 7001695
  cache_creation_input_tokens 146216

seat B (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/154c7ac7-b715-464c-b84e-ce68db59f3a7.jsonl):
  models claude-fable-5-2
  effort high
  turns 2
  calls 15
  average context per call 96085
  working minutes 4.2
  first turn in window 2026-11-27T10:11:06.634Z 3.7 min
  input_tokens 30
  output_tokens 24371
  cache_read_input_tokens 1353287
  cache_creation_input_tokens 87955

seat D (harness codex, sessions /home/ivan/.codex/sessions/2026/11/27/rollout-2026-11-27T11-21-56-01a21c86-a8b3-7133-acdd-d6beebe8b991.jsonl):
  models gpt-6.2-sol
  effort high
  turns 2, 1 incomplete
  calls 54
  average context per call 60706
  working minutes 7.9
  first turn in window 2026-11-27T10:21:56.912Z 6.7 min
  input_tokens 3278108
  cached_input_tokens 3170048
  output_tokens 9393
  reasoning_output_tokens 1684

seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-27T10:10:04.655Z 9.6 min, output A=7571 B=24371 D=0
  2026-11-27T10:21:20.802Z 11.9 min, output A=17276 B=0 D=9393
  total operator wait 21.5 min
