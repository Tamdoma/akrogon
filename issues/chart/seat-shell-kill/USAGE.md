chart seat-shell-kill - operator wait 99.3 min, operator turns 1; A=134029, D=89890, B=unmeasured, C=unmeasured output

window 2026-11-25T07:15:22.000Z to 2026-11-25T08:54:37.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 147
  average context per call 182398
  working minutes 99.3
  first turn in window 2026-11-25T07:14:13.699Z 99.3 min (opening reply was split across turns; not the whole map cost)
  input_tokens 307
  output_tokens 134029
  cache_read_input_tokens 26390382
  cache_creation_input_tokens 421785

seat D (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T07-16-33-089Z_1e3d5dc5-3105-4898-a446-f6fc5e21d696.jsonl):
  models muse-wonder-full-1.0
  effort high
  turns 6
  calls 87
  average context per call 141341
  working minutes 39.9
  first turn in window 2026-11-25T07:16:34.123Z 7.9 min
  input_tokens 238556
  output_tokens 89890
  cache_read_input_tokens 12058104
  cache_creation_input_tokens 0
  reasoning_output_tokens 47296

seat B: usage unmeasured (/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T07-16-26-622Z_73724e9a-624c-46be-b54b-12bf0d84255b.jsonl: field message.usage.reasoning missing)
seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-25T07:14:13.699Z 99.3 min, output A=134029 D=89890
  total operator wait 99.3 min
