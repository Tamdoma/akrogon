chart criterion-outcomes - operator wait 14.5 min, operator turns 4; A=23438, C=23823, B=6835 output

window 2026-10-19T16:29:18.000Z to 2026-10-19T16:46:05.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 6fa8e51c-838c-4286-a49e-3944a99601c8):
  models claude-opus-5-5
  effort high
  turns 4
  calls unavailable
  working minutes 14.5
  first turn in window 2026-10-19T16:28:58.208Z 8.5 min
  input_tokens 46
  output_tokens 23438
  cache_read_input_tokens 3983826
  cache_creation_input_tokens 44334

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-18T12-28-18-387Z_01a14efb-f852-7665-919f-14a9a09506a5.jsonl + /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-19T16-29-08-815Z_01a154fe-d34f-704c-867e-74ba1da7c116.jsonl):
  models muse-wonder-full-1.0-contributor
  effort high
  turns 4
  calls 43
  average context per call 49636
  working minutes 10.8
  input_tokens 79553
  output_tokens 23823
  cache_read_input_tokens 2054792
  cache_creation_input_tokens 0
  reasoning_output_tokens 14075

seat B (harness codex, sessions 01a14efb-ea70-75b0-aa4b-231ff3b1429d + 01a154fe-c4c8-71b1-8e99-7c1c2dc938cf):
  models gpt-6.1-sol
  effort high
  turns 4
  calls 22
  average context per call 57584
  working minutes 2.8
  input_tokens 1266851
  cached_input_tokens 1196416
  output_tokens 6835
  reasoning_output_tokens 1408

seat A: usage unmeasured (/home/ivan/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/7194f47b-fb9f-44af-a3f4-69ad45589a59.jsonl: field effort missing)

operator turns
  2026-10-19T16:28:58.208Z 8.5 min, output A=11534 C=11038 B=4249
  2026-10-19T16:39:22.114Z 0.1 min, output A=507 C=0 B=0
  2026-10-19T16:39:40.404Z 1.1 min, output A=6749 C=0 B=0
  2026-10-19T16:41:10.542Z 4.8 min, output A=4648 C=12785 B=2586
  total operator wait 14.5 min
