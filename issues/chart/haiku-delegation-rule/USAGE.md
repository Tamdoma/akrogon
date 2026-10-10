chart haiku-delegation-rule - operator wait 7.7 min, operator turns 4; A=49689, B=23336 output

window 2026-10-10T08:23:43.000Z to 2026-10-10T08:48:23.986Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 5eb6ac92-9694-4129-a9d5-e4daf384da70):
  models claude-opus-5-5
  effort high
  turns 4
  assistant messages 41
  working minutes 7.7
  first turn in window 2026-10-10T08:30:00.887Z 0.2 min
  input_tokens 82
  output_tokens 49689
  cache_read_input_tokens 6712487
  cache_creation_input_tokens 100660

seat B (harness claude, sessions e28567ad-f17d-4190-8088-9746d11e7e53):
  models claude-fable-5-1
  effort medium
  turns 5
  assistant messages 27
  working minutes 6.2
  first turn in window 2026-10-10T08:24:43.084Z 2.5 min
  input_tokens 714
  output_tokens 23336
  cache_read_input_tokens 2322968
  cache_creation_input_tokens 123904

operator turns
  2026-10-10T08:30:00.887Z 0.2 min, output A=1197 B=0
  2026-10-10T08:33:23.658Z 4.8 min, output A=17479 B=9261
  2026-10-10T08:44:02.182Z 0.3 min, output A=1230 B=0
  2026-10-10T08:45:35.796Z 2.5 min, output A=6819 B=2512
  total operator wait 7.7 min
