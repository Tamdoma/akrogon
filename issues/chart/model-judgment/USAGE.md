chart model-judgment - operator wait 24.6 min, operator turns 1; A=67722, B=80746, C=30791 output

window 2026-11-17T11:05:39.000Z to 2026-11-17T11:30:33.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/6f5a1336-78ad-4830-8698-bc0b8b6b4223.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 55
  average context per call 169367
  working minutes 24.6
  first turn in window 2026-11-17T11:04:46.776Z 24.6 min
  input_tokens 119
  output_tokens 67722
  cache_read_input_tokens 9171931
  cache_creation_input_tokens 143158

seat B (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/59fe5ab4-72f5-4ce4-ab36-2cc2a094145a.jsonl):
  models claude-fable-5-2
  effort high
  turns 5
  calls 35
  average context per call 143299
  working minutes 15.3
  first turn in window 2026-11-17T11:06:41.911Z 1.6 min
  input_tokens 69
  output_tokens 80746
  cache_read_input_tokens 4785597
  cache_creation_input_tokens 229798

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-17T11-06-42-159Z_93f66d7d-eb86-4623-8cfc-64fb3c2d1b54.jsonl):
  models muse-wonder-full-1.0-contributor
  effort high
  turns 5
  calls 47
  average context per call 73486
  working minutes 10.7
  first turn in window 2026-11-17T11:06:45.565Z 1.8 min
  input_tokens 122798
  output_tokens 30791
  cache_read_input_tokens 3331032
  cache_creation_input_tokens 0
  reasoning_output_tokens 17305

operator turns
  2026-11-17T11:04:46.776Z 24.6 min, output A=67722 B=80746 C=30791
  total operator wait 24.6 min
