chart merge-test-facts - operator wait 91.6 min, operator turns 1; A=59346, D=37032, B=unmeasured, C=unmeasured output

window 2026-11-25T01:31:59.000Z to 2026-11-25T03:03:44.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/49b07d56-880f-44ff-9ec6-91b9391daef8.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 79
  average context per call 184640
  working minutes 91.6
  first turn in window 2026-11-25T01:31:31.810Z 91.6 min
  input_tokens 175
  output_tokens 59346
  cache_read_input_tokens 14414511
  cache_creation_input_tokens 171885

seat D (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T01-33-53-176Z_14e3293c-1918-4624-9ab5-1ccf9fcb5b61.jsonl):
  models muse-wonder-full-1.0
  effort high
  turns 4
  calls 65
  average context per call 60003
  working minutes 72.5
  first turn in window 2026-11-25T01:33:54.734Z 67.0 min
  input_tokens 245250
  output_tokens 37032
  cache_read_input_tokens 3654936
  cache_creation_input_tokens 0
  reasoning_output_tokens 14402

seat B: usage unmeasured (/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T01-33-49-255Z_69a66df2-ceb3-4619-b5bb-b8a7dcf41478.jsonl: field message.usage.reasoning missing)
seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-25T01:31:31.810Z 91.6 min, output A=59346 D=37032
  total operator wait 91.6 min
