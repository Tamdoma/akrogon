chart consultant-recipe - operator wait 33.2 min, operator turns 1; A=50323, D=12637, B=unmeasured, C=unmeasured output

window 2026-11-25T13:44:44.000Z to 2026-11-25T14:17:56.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/bc9c88fb-09b5-4721-976d-216e082b60c9.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 80
  average context per call 169038
  working minutes 33.2
  first turn in window 2026-11-25T13:44:12.951Z 33.2 min
  input_tokens 172
  output_tokens 50323
  cache_read_input_tokens 13376654
  cache_creation_input_tokens 146189

seat D (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T12-03-46-564Z_fa046824-6aa1-46ce-bfe4-981574f8a384.jsonl):
  models muse-wonder-full-1.0
  effort high
  turns 4
  calls 32
  average context per call 119560
  working minutes 5.0
  first turn in window 2026-11-25T13:47:07.471Z 1.0 min
  input_tokens 135410
  output_tokens 12637
  cache_read_input_tokens 3690508
  cache_creation_input_tokens 0
  reasoning_output_tokens 5953

seat B: usage unmeasured (/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T12-03-43-736Z_033a4352-94e1-42c9-a40b-3c7e8337a49a.jsonl: field message.usage.reasoning missing)
seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-25T13:44:12.951Z 33.2 min, output A=50323 D=12637
  total operator wait 33.2 min
