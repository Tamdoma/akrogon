chart door-name-after-reset - operator wait 16.0 min, operator turns 1; A=56997, B=10068, C=27125 output

window 2026-11-14T09:49:37.000Z to 2026-11-14T10:06:01.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/60966401-82eb-4ba7-b48c-aafd6669305a.jsonl):
  models claude-fable-5-2
  effort medium
  turns 1
  calls 50
  average context per call 145751
  working minutes 16.0
  first turn in window 2026-11-14T09:49:14.134Z 16.0 min
  input_tokens 105
  output_tokens 56997
  cache_read_input_tokens 7145501
  cache_creation_input_tokens 141960

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/14/rollout-2026-11-14T10-53-50-01a1d97a-436b-7ec2-9e32-9bba1de9fb8b.jsonl):
  models gpt-6.1-sol
  effort high
  turns 5
  calls 35
  average context per call 67319
  working minutes 5.2
  first turn in window 2026-11-14T09:53:51.130Z 1.1 min
  input_tokens 2356182
  cached_input_tokens 2265472
  output_tokens 10068
  reasoning_output_tokens 2510

seat C (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/2af0f4fa-1087-450f-8fcc-29ec6daee066.jsonl):
  models claude-fable-5-2
  effort medium
  turns 5
  calls 31
  average context per call 106632
  working minutes 6.3
  first turn in window 2026-11-14T09:53:51.867Z 0.9 min
  input_tokens 64
  output_tokens 27125
  cache_read_input_tokens 3188493
  cache_creation_input_tokens 117046

operator turns
  2026-11-14T09:49:14.134Z 16.0 min, output A=56997 B=10068 C=27125
  total operator wait 16.0 min
