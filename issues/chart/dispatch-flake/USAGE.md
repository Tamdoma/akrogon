chart dispatch-flake - operator wait 32.2 min, operator turns 5; A=95808, B=22886 output

window 2026-11-10T13:53:58.000Z to 2026-11-10T14:43:17.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/e12f9f5d-4003-4947-b67e-f2fc0c5637c4.jsonl):
  models claude-fable-5-2
  effort high
  turns 5
  calls 97
  average context per call 163352
  working minutes 32.2
  first turn in window 2026-11-10T13:53:17.426Z 18.9 min
  input_tokens 193
  output_tokens 95808
  cache_read_input_tokens 15537916
  cache_creation_input_tokens 307052

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/10/rollout-2026-11-10T14-55-21-01a1c5bd-ee44-7210-806f-9209d74aa978.jsonl):
  models gpt-6.1-sol
  effort high
  turns 3
  calls 45
  average context per call 96285
  working minutes 13.8
  first turn in window 2026-11-10T13:55:21.433Z 9.1 min
  input_tokens 4332827
  cached_input_tokens 4209536
  output_tokens 22886
  reasoning_output_tokens 8245

operator turns
  2026-11-10T13:53:17.426Z 18.9 min, output A=52789 B=17614
  2026-11-10T14:16:47.102Z 0.2 min, output A=1102 B=0
  2026-11-10T14:17:13.340Z 1.5 min, output A=7948 B=0
  2026-11-10T14:29:16.349Z 0.2 min, output A=872 B=0
  2026-11-10T14:31:49.347Z 11.5 min, output A=33097 B=5272
  total operator wait 32.2 min
