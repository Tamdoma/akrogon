chart unblocked-runs - operator wait 25.6 min, operator turns 1; A=79862, C=0, B=unmeasured output

window 2026-11-25T22:37:16.000Z to 2026-11-25T23:02:56.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/2db277de-fd61-4972-b636-b8ea41ac2ae6.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 81
  average context per call 171464
  working minutes 25.6
  first turn in window 2026-11-25T22:36:40.522Z 25.6 min (opening reply was split across turns; not the whole map cost)
  input_tokens 163
  output_tokens 79862
  cache_read_input_tokens 13652101
  cache_creation_input_tokens 236300

seat C (harness codex, sessions /home/ivan/.codex/sessions/2026/11/25/rollout-2026-11-25T18-19-13-01a213b7-f6f5-77a1-aed1-df66d7089a88.jsonl):
  turns 0
  calls 0
  average context per call n/a
  working minutes 0.0
  input_tokens 0
  cached_input_tokens 0
  output_tokens 0
  reasoning_output_tokens 0

seat B: usage unmeasured (unknown harness agy)

operator turns
  2026-11-25T22:36:40.522Z 25.6 min, output A=79862 C=0
  total operator wait 25.6 min
