chart paid-proof-bounds - operator wait 0.0 min, operator turns 0; C=9582, B=49783, A=unmeasured output

window 2026-10-18T12:27:44.000Z to 2026-10-19T08:54:08.000Z, 2026-10-19T08:56:27.000Z to 2026-10-19T09:03:01.066Z (open)

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-19T08-54-18-436Z_01a1535e-6844-756c-9cfd-a1de089645ef.jsonl):
  models muse-wonder-full-1.0-contributor
  effort high
  turns 1
  calls unavailable
  working minutes 5.6
  first turn in window 2026-10-19T08:56:28.853Z 5.6 min
  input_tokens 81757
  output_tokens 9582
  cache_read_input_tokens 524528
  cache_creation_input_tokens 0
  reasoning_output_tokens 6231

seat B (harness codex, sessions 01a14efb-ea70-75b0-aa4b-231ff3b1429d):
  models gpt-6-astra, gpt-6.1-sol
  effort high
  turns 9
  calls 74
  average context per call 181668
  working minutes 26.0
  first turn in window 2026-10-18T12:29:10.167Z 5.6 min
  input_tokens 13443412
  cached_input_tokens 12727552
  output_tokens 49783
  reasoning_output_tokens 11697

seat A: usage unmeasured (/home/ivan/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/7194f47b-fb9f-44af-a3f4-69ad45589a59.jsonl: field effort missing)
seat C: usage unmeasured (/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-18T12-28-18-387Z_01a14efb-f852-7665-919f-14a9a09506a5.jsonl: field usage missing)

operator turns
  total operator wait 0.0 min
