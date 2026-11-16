chart unattended-runs - operator wait 57.2 min, operator turns 1; A=116225, B=31270, C=71566 output

window 2026-11-16T09:38:45.000Z to 2026-11-16T10:35:59.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/d810649d-c899-4771-8adb-a0ed2c5c7d5d.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 98
  average context per call 164166
  working minutes 57.2
  first turn in window 2026-11-16T09:37:20.107Z 57.2 min (opening reply was split across turns; not the whole map cost)
  input_tokens 206
  output_tokens 116225
  cache_read_input_tokens 15776213
  cache_creation_input_tokens 311888

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/16/rollout-2026-11-16T10-39-31-01a1e3b9-dfd6-7fc2-b9d3-86141be197f3.jsonl):
  models gpt-6.1-sol
  effort high
  turns 6
  calls 48
  average context per call 105317
  working minutes 18.6
  first turn in window 2026-11-16T09:39:32.124Z 1.5 min
  input_tokens 5055229
  cached_input_tokens 4905600
  output_tokens 31270
  reasoning_output_tokens 11144

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-16T09-39-32-342Z_66fe4239-41ec-4e29-9ffc-6fb6a4d39928.jsonl):
  models muse-wonder-full-1.0-contributor
  effort high
  turns 6
  calls 66
  average context per call 93233
  working minutes 32.3
  first turn in window 2026-11-16T09:39:33.368Z 2.6 min
  input_tokens 164806
  output_tokens 71566
  cache_read_input_tokens 5988596
  cache_creation_input_tokens 0
  reasoning_output_tokens 41164

operator turns
  2026-11-16T09:37:20.107Z 57.2 min, output A=117933 B=31270 C=71566
  total operator wait 57.2 min
