chart config-walls - operator wait 12.4 min, operator turns 1; A=25736, B=5953, C=0 output

window 2026-10-22T18:44:19.000Z to 2026-10-22T18:56:52.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions f254b4d3-ac0a-4455-aec0-366ac6ba64c7 + cdda5a46-b1c9-4473-9694-68082ab53f55):
  models claude-opus-5-5
  effort medium
  turns 1
  calls 25
  average context per call 133461
  working minutes 12.4
  input_tokens 47
  output_tokens 25736
  cache_read_input_tokens 3278045
  cache_creation_input_tokens 58421

seat B (harness codex, sessions 01a164e5-f99d-7d01-b306-ba5223c3e7b1 + 01a164ed-c20b-71d0-9942-c348b1d870c4):
  models gpt-6.1-sol
  effort medium
  turns 5
  calls 26
  average context per call 52004
  working minutes 3.8
  input_tokens 1352114
  cached_input_tokens 1276416
  output_tokens 5953
  reasoning_output_tokens 1273

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-22T18-36-02-000Z_01a164e6-1250-73bf-981e-8b259c6fe393.jsonl):
  turns 0
  calls unavailable
  working minutes 0.0
  input_tokens 0
  output_tokens 0
  cache_read_input_tokens 0
  cache_creation_input_tokens 0
  reasoning_output_tokens 0

seat C: usage unmeasured (/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-22T18-44-31-620Z_01a164ed-d904-77d9-949e-802025e83e5d.jsonl: field message.usage.reasoning missing)

operator turns
  2026-10-22T18:43:51.666Z 12.4 min, output A=25736 B=5953 C=0
  total operator wait 12.4 min
