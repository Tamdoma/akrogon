chart merge-lanes - operator wait 82.1 min, operator turns 7; A=173891, B=316907, C=unmeasured output

window 2026-11-21T17:21:10.000Z to 2026-11-21T17:49:24.000Z, 2026-11-21T18:36:02.000Z to 2026-11-21T19:42:08.000Z, 2026-11-21T20:03:12.000Z to 2026-11-21T20:06:45.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/1ecb941e-86d6-4fdc-a7d8-89cbbf388953.jsonl + /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/a6b8daac-b25d-4f61-aa42-e82a6f320dc1.jsonl):
  models claude-opus-5-5
  effort high
  turns 7
  calls 160
  average context per call 164653
  working minutes 82.1
  first turn in window 2026-11-21T17:20:30.441Z 4.7 min
  input_tokens 349
  output_tokens 173891
  cache_read_input_tokens 25848141
  cache_creation_input_tokens 495924

seat B (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/f3d060db-ea30-46b3-8dcb-e57c9a06f157.jsonl + /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/87d64506-1930-48dc-9bd8-0d735ace48ba.jsonl):
  models claude-fable-5-2
  effort high
  turns 14
  calls 136
  average context per call 157049
  working minutes 57.6
  first turn in window 2026-11-21T17:34:24.841Z 4.3 min
  input_tokens 279
  output_tokens 316907
  cache_read_input_tokens 20572474
  cache_creation_input_tokens 785949
  session /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/f3d060db-ea30-46b3-8dcb-e57c9a06f157.jsonl totalCostUSD 5.057152299999999 (whole-session figure; can include other charts)

seat C: usage unmeasured (unknown harness agy)
seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-21T17:20:30.441Z 4.7 min, output A=22221 B=0
  2026-11-21T17:33:15.660Z 0.4 min, output A=1741 B=0
  2026-11-21T17:33:56.706Z 6.0 min, output A=9094 B=26080
  2026-11-21T17:46:00.426Z 0.3 min, output A=1458 B=0
  2026-11-21T17:48:07.764Z 1.3 min, output A=7113 B=0
  2026-11-21T18:35:30.665Z 66.1 min, output A=129937 B=275721
  2026-11-21T20:03:02.002Z 3.4 min, output A=6277 B=15106
  total operator wait 82.1 min
