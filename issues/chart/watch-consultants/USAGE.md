chart watch-consultants - operator wait 34.6 min, operator turns 4; A=104420, B=16415, C=unmeasured output

window 2026-11-21T17:11:18.000Z to 2026-11-21T17:57:20.000Z, 2026-11-21T18:06:26.000Z to 2026-11-21T18:07:09.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/5d8542a8-366c-477b-b80b-1a7c0cdf14df.jsonl):
  models claude-opus-5-5
  effort medium
  turns 4
  calls 87
  average context per call 175103
  working minutes 34.6
  first turn in window 2026-11-21T17:10:55.839Z 5.8 min
  input_tokens 187
  output_tokens 104420
  cache_read_input_tokens 14921539
  cache_creation_input_tokens 312248

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/21/rollout-2026-11-21T18-12-40-01a1ff18-87a0-76d2-80a0-3208eed95654.jsonl):
  models gpt-6.2-astra
  effort high
  turns 10
  calls 59
  average context per call 75052
  working minutes 9.5
  first turn in window 2026-11-21T17:12:40.305Z 0.7 min
  input_tokens 4428076
  cached_input_tokens 4311168
  output_tokens 16415
  reasoning_output_tokens 734

seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-21T17:10:55.839Z 5.8 min, output A=14146 B=1233
  2026-11-21T17:20:44.179Z 0.3 min, output A=1268 B=0
  2026-11-21T17:29:25.712Z 27.9 min, output A=84750 B=15182
  2026-11-21T18:06:09.937Z 0.6 min, output A=4256 B=0
  total operator wait 34.6 min
