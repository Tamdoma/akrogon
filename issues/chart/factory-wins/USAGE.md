chart factory-wins - operator wait 73.4 min, operator turns 12; A=166230, B=72090 output

window 2026-11-09T19:45:00.000Z to 2026-11-09T19:55:00.000Z, 2026-11-10T09:08:06.000Z to 2026-11-10T09:09:05.000Z, 2026-11-10T09:33:00.000Z to 2026-11-10T13:53:00.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/104c1d89-7120-45d8-9a89-9700c9427e3e.jsonl + /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/1160556f-c628-4449-8d45-fa8fb6899642.jsonl):
  models claude-fable-5-2
  effort xhigh, high
  turns 12
  calls 105
  average context per call 151516
  working minutes 73.4
  first turn in window 2026-11-10T09:08:06.389Z 1.0 min
  input_tokens 228
  output_tokens 166230
  cache_read_input_tokens 15321540
  cache_creation_input_tokens 587391

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/10/rollout-2026-11-10T10-35-50-01a1c4d0-5718-7d51-8e31-d970727b0e4e.jsonl):
  models gpt-6.1-sol
  effort high
  turns 6
  calls 84
  average context per call 193708
  working minutes 40.3
  first turn in window 2026-11-10T09:35:50.691Z 3.4 min
  input_tokens 16271477
  cached_input_tokens 15640320
  output_tokens 72090
  reasoning_output_tokens 39353

operator turns
  2026-11-10T09:08:06.389Z 1.0 min, output A=3441 B=0
  2026-11-10T09:33:58.688Z 6.2 min, output A=15152 B=5558
  2026-11-10T09:41:06.700Z 0.3 min, output A=1667 B=0
  2026-11-10T09:43:05.571Z 25.8 min, output A=62358 B=29243
  2026-11-10T10:31:22.741Z 0.5 min, output A=2512 B=0
  2026-11-10T10:35:19.626Z 4.3 min, output A=19791 B=0
  2026-11-10T10:42:56.854Z 0.2 min, output A=954 B=0
  2026-11-10T10:43:41.191Z 20.6 min, output A=25741 B=25200
  2026-11-10T11:46:01.068Z 0.3 min, output A=1448 B=0
  2026-11-10T11:48:32.724Z 4.6 min, output A=24474 B=0
  2026-11-10T13:38:43.401Z 0.4 min, output A=2028 B=0
  2026-11-10T13:42:58.079Z 9.3 min, output A=6664 B=12089
  total operator wait 73.4 min
