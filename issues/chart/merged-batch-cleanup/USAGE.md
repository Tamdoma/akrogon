chart merged-batch-cleanup - operator wait 21.0 min, operator turns 1; A=51948, B=22880 output

window 2026-11-09T14:14:01.000Z to 2026-11-09T14:35:06.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/70154c62-73f9-47a5-8e8e-e3f78f692cf8.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 50
  average context per call 158559
  working minutes 21.0
  first turn in window 2026-11-09T14:13:27.382Z 21.0 min
  input_tokens 103
  output_tokens 51948
  cache_read_input_tokens 7819885
  cache_creation_input_tokens 107982

seat B (harness codex, sessions /home/ivan/.codex/sessions/2026/11/09/rollout-2026-11-09T15-17-08-01a1c0ab-8337-7981-af59-6de589cc478a.jsonl):
  models gpt-6.1-sol
  effort high
  turns 5
  calls 49
  average context per call 85431
  working minutes 13.6
  first turn in window 2026-11-09T14:17:08.306Z 2.3 min
  input_tokens 4186115
  cached_input_tokens 4090496
  output_tokens 22880
  reasoning_output_tokens 9928

operator turns
  2026-11-09T14:13:27.382Z 21.0 min, output A=51948 B=22880
  total operator wait 21.0 min
