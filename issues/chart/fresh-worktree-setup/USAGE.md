chart fresh-worktree-setup - operator wait 46.0 min, operator turns 1; A=51867, D=41531, B=unmeasured, C=unmeasured output

window 2026-11-25T11:14:50.000Z to 2026-11-25T12:00:48.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 65
  average context per call 194015
  working minutes 46.0
  first turn in window 2026-11-25T11:12:55.047Z 46.0 min (opening reply was split across turns; not the whole map cost)
  input_tokens 152
  output_tokens 51867
  cache_read_input_tokens 12368811
  cache_creation_input_tokens 241998

seat D (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T11-15-53-453Z_10785c86-5030-4e39-9346-ad0ad5dd087a.jsonl):
  models muse-wonder-full-1.0
  effort high
  turns 4
  calls 62
  average context per call 84923
  working minutes 16.3
  first turn in window 2026-11-25T11:15:54.306Z 8.6 min
  input_tokens 142390
  output_tokens 41531
  cache_read_input_tokens 5122852
  cache_creation_input_tokens 0
  reasoning_output_tokens 23212

seat B: usage unmeasured (/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-25T11-15-49-498Z_408ee010-26f0-4357-9e3a-3d0c0dcce6b0.jsonl: field message.usage.reasoning missing)
seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-25T11:12:55.047Z 46.0 min, output A=52548 D=41531
  total operator wait 46.0 min
