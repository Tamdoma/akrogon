chart run-check-kept-evidence - operator wait 16.3 min, operator turns 1; A=57519, B=30276, C=unmeasured output

window 2026-11-20T11:04:04.000Z to 2026-11-20T11:20:31.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/f58162f1-a6f4-456b-8869-93a49d525c3c.jsonl):
  models claude-opus-5-5
  effort high
  turns 1
  calls 46
  average context per call 157934
  working minutes 16.3
  first turn in window 2026-11-20T11:03:17.343Z 16.3 min
  input_tokens 92
  output_tokens 57519
  cache_read_input_tokens 7159319
  cache_creation_input_tokens 105538

seat B (harness claude, sessions /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/3768615e-7099-4119-bdbc-263529418721.jsonl):
  models claude-fable-5-2
  effort medium
  turns 5
  calls 32
  average context per call 94268
  working minutes 6.0
  first turn in window 2026-11-20T11:04:41.929Z 1.4 min
  input_tokens 69
  output_tokens 30276
  cache_read_input_tokens 2890713
  cache_creation_input_tokens 125794

seat C: usage unmeasured (unknown harness agy)

operator turns
  2026-11-20T11:03:17.343Z 16.3 min, output A=57519 B=30276
  total operator wait 16.3 min
