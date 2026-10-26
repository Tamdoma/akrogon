chart door-cost - operator wait 24.7 min, operator turns 1; A=69694, B=14699, C=26937 output

window 2026-10-26T09:41:37.000Z to 2026-10-26T10:06:24.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions c8a48fc5-8a0e-4cc6-bd95-474f9490fb19):
  models claude-opus-5-5
  effort high
  turns 1
  calls 60
  average context per call 150244
  working minutes 24.7
  first turn in window 2026-10-26T09:40:40.817Z 24.7 min (opening reply was split across turns; not the whole map cost)
  input_tokens 120
  output_tokens 69694
  cache_read_input_tokens 8775590
  cache_creation_input_tokens 238956
  session c8a48fc5-8a0e-4cc6-bd95-474f9490fb19 totalCostUSD 0 (whole-session figure; can include other charts)

seat B (harness codex, sessions 01a17783-3fb8-7640-8f20-a1633d413577 + 01a17797-1f96-7e63-88d1-eed7b602500c):
  models gpt-6.1-sol
  effort high
  turns 5
  calls 31
  average context per call 64779
  working minutes 10.9
  input_tokens 2008142
  cached_input_tokens 1933312
  output_tokens 14699
  reasoning_output_tokens 5026

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-26T09-20-56-762Z_01a17783-4fba-73b0-a25a-e3b5b3f12c34.jsonl + /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-26T09-42-39-320Z_01a17797-2fd8-7029-a689-602c06aea1a9.jsonl):
  models muse-wonder-full-1.0-contributor
  effort high
  turns 5
  calls 31
  average context per call 52488
  working minutes 8.6
  input_tokens 80601
  output_tokens 26937
  cache_read_input_tokens 1546520
  cache_creation_input_tokens 0
  reasoning_output_tokens 12850

operator turns
  2026-10-26T09:40:40.817Z 24.7 min, output A=69694 B=14699 C=26937
  total operator wait 24.7 min
