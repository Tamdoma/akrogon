chart test-temp-leftovers - operator wait 46.7 min, operator turns 1; A=50616, D=34434, B=unmeasured, C=unmeasured output

window 2026-11-25T12:03:00.000Z to 2026-11-25T12:49:57.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/fa54cbd9-3365-4924-9cc8-4d9e0baea1a7.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 69
  average context per call 169280
  working minutes 46.7
  first turn in window 2026-11-25T12:02:07.908Z 46.7 min
  input_tokens 146
  output_tokens 50616
  cache_read_input_tokens 11542020
  cache_creation_input_tokens 138167

seat D (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T12-03-46-564Z_fa046824-6aa1-46ce-bfe4-981574f8a384.jsonl):
  models muse-wonder-full-1.0
  effort high
  turns 3
  calls 60
  average context per call 61043
  working minutes 10.0
  first turn in window 2026-11-25T12:03:47.492Z 7.7 min
  input_tokens 103594
  output_tokens 34434
  cache_read_input_tokens 3558972
  cache_creation_input_tokens 0
  reasoning_output_tokens 18926

seat B: usage unmeasured (/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T12-03-43-736Z_033a4352-94e1-42c9-a40b-3c7e8337a49a.jsonl: field message.usage.reasoning missing)
seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-25T12:02:07.908Z 46.7 min, output A=50616 D=34434
  total operator wait 46.7 min
