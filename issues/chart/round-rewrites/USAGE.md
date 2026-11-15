chart round-rewrites - operator wait 64.2 min, operator turns 5; A=101681, B=41310 output

window 2026-11-11T10:18:17.000Z to 2026-11-11T12:08:30.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/5f8592c2-2715-4043-90a4-b9db5148124a.jsonl):
  models claude-fable-5-2
  effort high
  turns 5
  calls 88
  average context per call 163702
  working minutes 64.2
  first turn in window 2026-11-11T10:17:19.143Z 47.8 min
  input_tokens 175
  output_tokens 101681
  cache_read_input_tokens 14153415
  cache_creation_input_tokens 252147

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/11/rollout-2026-11-11T11-19-50-01a1ca1e-fb0e-7113-95de-0685337f400f.jsonl):
  models gpt-6.1-sol
  effort high
  turns 6, 1 incomplete
  calls 52
  average context per call 123876
  working minutes 7.0
  first turn in window 2026-11-11T11:02:23.605Z 0.6 min
  input_tokens 6441558
  cached_input_tokens 6302720
  output_tokens 41310
  reasoning_output_tokens 15975

operator turns
  2026-11-11T10:17:19.143Z 47.8 min, output A=51033 B=32525
  2026-11-11T11:13:10.397Z 0.4 min, output A=1394 B=0
  2026-11-11T11:39:50.010Z 6.8 min, output A=28288 B=5720
  2026-11-11T11:48:37.870Z 1.6 min, output A=8267 B=0
  2026-11-11T12:00:24.592Z 7.6 min, output A=12699 B=3065
  total operator wait 64.2 min
