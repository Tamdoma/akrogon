chart fresh-leaf-base - operator wait 34.1 min, operator turns 2; A=57261, D=43787, B=unmeasured, C=unmeasured output

window 2026-11-25T00:14:44.000Z to 2026-11-25T00:47:40.000Z, 2026-11-25T07:08:11.000Z to 2026-11-25T07:09:32.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/6bc67a19-6f25-4293-b35b-b07dacf6d218.jsonl + /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/9baf0156-26e9-4f88-84b4-84d560ea0b83.jsonl):
  models claude-opus-5-5
  effort high
  turns 2
  calls 68
  average context per call 146799
  working minutes 34.1
  first turn in window 2026-11-25T00:14:13.804Z 32.9 min
  input_tokens 147
  output_tokens 57261
  cache_read_input_tokens 9803619
  cache_creation_input_tokens 178553

seat D (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T00-16-40-662Z_01a2455a-e8ce-4714-820f-ab31abdf57bc.jsonl):
  models muse-wonder-full-1.0
  effort high
  turns 4
  calls 48
  average context per call 57803
  working minutes 12.6
  first turn in window 2026-11-25T00:16:41.886Z 3.2 min
  input_tokens 155983
  output_tokens 43787
  cache_read_input_tokens 2618584
  cache_creation_input_tokens 0
  reasoning_output_tokens 24049

seat B: usage unmeasured (/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T00-16-36-534Z_7d6c1d7d-97b3-45af-9a6c-8d773c9a8423.jsonl: field message.usage.reasoning missing)
seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-25T00:14:13.804Z 32.9 min, output A=50803 D=43787
  2026-11-25T07:07:50.014Z 1.2 min, output A=6458 D=0
  total operator wait 34.1 min
