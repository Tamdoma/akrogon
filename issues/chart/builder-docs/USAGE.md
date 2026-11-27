chart builder-docs - operator wait 32.4 min, operator turns 6; A=71891, B=84654, C=unmeasured output

window 2026-11-27T08:37:50.000Z to 2026-11-27T09:37:09.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/cbe6ffb3-cf96-4e61-ac35-95fbfe7b9209.jsonl):
  models claude-opus-5-5
  effort medium
  turns 6
  calls 54
  average context per call 158410
  working minutes 32.4
  first turn in window 2026-11-27T08:37:35.599Z 0.8 min
  input_tokens 120
  output_tokens 71891
  cache_read_input_tokens 8380095
  cache_creation_input_tokens 173911

seat B (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/9783838f-518e-4725-9ec9-14031d173788.jsonl):
  models claude-fable-5-2
  effort high
  turns 8
  calls 46
  average context per call 149117
  working minutes 15.4
  first turn in window 2026-11-27T08:39:18.157Z 1.6 min
  input_tokens 101
  output_tokens 84654
  cache_read_input_tokens 6528462
  cache_creation_input_tokens 330829

seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-27T08:37:35.599Z 0.8 min, output A=4960 B=0
  2026-11-27T08:38:44.726Z 6.9 min, output A=8016 B=16632
  2026-11-27T08:49:34.232Z 0.2 min, output A=1097 B=0
  2026-11-27T09:07:53.013Z 1.1 min, output A=5144 B=0
  2026-11-27T09:12:46.735Z 2.9 min, output A=4230 B=5174
  2026-11-27T09:16:35.132Z 20.4 min, output A=48444 B=62848
  total operator wait 32.4 min
