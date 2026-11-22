chart ai-budgets - operator wait 23.5 min, operator turns 1; A=43271, B=65840, C=unmeasured output

window 2026-11-22T12:42:57.000Z to 2026-11-22T13:06:36.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/5d8542a8-366c-477b-b80b-1a7c0cdf14df.jsonl):
  models claude-opus-5-5
  effort medium
  turns 1
  calls 49
  average context per call 174058
  working minutes 23.5
  first turn in window 2026-11-22T12:42:26.045Z 23.5 min
  input_tokens 108
  output_tokens 43271
  cache_read_input_tokens 8433943
  cache_creation_input_tokens 94788

seat B (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/6db30de1-40cc-4097-8a6f-174233402e1d.jsonl):
  models claude-fable-5-2
  effort high
  turns 6
  calls 31
  average context per call 133653
  working minutes 12.5
  first turn in window 2026-11-22T12:43:59.077Z 2.0 min
  input_tokens 70
  output_tokens 65840
  cache_read_input_tokens 3940044
  cache_creation_input_tokens 203135

seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-22T12:42:26.045Z 23.5 min, output A=43271 B=65840
  total operator wait 23.5 min
