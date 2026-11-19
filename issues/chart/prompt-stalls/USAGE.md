chart prompt-stalls - operator wait 23.9 min, operator turns 1; A=81816, B=17847 output

window 2026-11-16T19:59:30.000Z to 2026-11-16T20:23:28.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/271637a5-a28b-4344-8742-b9d8c30081d3.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 89
  average context per call 191111
  working minutes 23.9
  first turn in window 2026-11-16T19:58:34.241Z 23.9 min
  input_tokens 182
  output_tokens 81816
  cache_read_input_tokens 16860286
  cache_creation_input_tokens 148417

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/16/rollout-2026-11-16T21-01-20-01a1e5f3-29cb-7ac3-bd79-74132ac78e95.jsonl):
  models gpt-6.1-sol
  effort high
  turns 6
  calls 47
  average context per call 92597
  working minutes 11.0
  first turn in window 2026-11-16T20:01:20.976Z 1.1 min
  input_tokens 4352061
  cached_input_tokens 4236032
  output_tokens 17847
  reasoning_output_tokens 5907

operator turns
  2026-11-16T19:58:34.241Z 23.9 min, output A=81816 B=17847
  total operator wait 23.9 min
