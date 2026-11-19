chart consumer-lesson-fixes - operator wait 19.6 min, operator turns 1; A=59767, B=8864, C=40823, D=35411 output

window 2026-11-17T22:28:31.000Z to 2026-11-17T22:48:25.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/fda031a9-6aac-4d09-a2e7-cc953e7f308f.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 54
  average context per call 175141
  working minutes 19.6
  first turn in window 2026-11-17T22:25:46.174Z 19.6 min
  input_tokens 122
  output_tokens 59767
  cache_read_input_tokens 9354165
  cache_creation_input_tokens 103303

seat B (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-17T22-28-51-670Z_3eb6d029-cfaf-4af3-98ba-7c29f3736ccb.jsonl):
  models gpt-6.2-astra
  effort high
  turns 5
  calls 40
  average context per call 45050
  working minutes 8.5
  first turn in window 2026-11-17T22:28:52.618Z 0.7 min
  input_tokens 95139
  output_tokens 8864
  cache_read_input_tokens 1706880
  cache_creation_input_tokens 0
  reasoning_output_tokens 1194

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-17T22-28-52-933Z_ffad476f-a6b6-4850-bc8f-c23e553e104a.jsonl):
  models muse-wonder-full-1.0
  effort high
  turns 5
  calls 55
  average context per call 60078
  working minutes 11.6
  first turn in window 2026-11-17T22:28:53.696Z 1.0 min
  input_tokens 107262
  output_tokens 40823
  cache_read_input_tokens 3197048
  cache_creation_input_tokens 0
  reasoning_output_tokens 23783

seat D (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/0a0ac5ca-ed2b-481f-97ee-05f29c3049aa.jsonl):
  models claude-fable-5-2
  effort medium
  turns 5
  calls 30
  average context per call 90195
  working minutes 6.4
  first turn in window 2026-11-17T22:28:54.513Z 0.8 min
  input_tokens 65
  output_tokens 35411
  cache_read_input_tokens 2573956
  cache_creation_input_tokens 131832

operator turns
  2026-11-17T22:25:46.174Z 19.6 min, output A=59767 B=8864 C=40823 D=35411
  total operator wait 19.6 min
