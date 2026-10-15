chart worktree-cleanup - operator wait 63.9 min, operator turns 13; A=181816, B=44406, C=187112, D=unmeasured output

window 2026-10-15T15:30:01.000Z to 2026-10-15T18:32:43.699Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0c42a11d-8bd3-4863-9a34-73f053b563e0):
  models claude-opus-5-5
  effort xhigh, high
  turns 12
  assistant messages 127
  working minutes 63.9
  first turn in window 2026-10-15T16:33:27.084Z 0.8 min
  input_tokens 254
  output_tokens 181816
  cache_read_input_tokens 18229992
  cache_creation_input_tokens 483334

seat B (harness codex, sessions 01a13539-de42-7a81-870f-9af07464b724 + 01a1402e-4c09-7ba1-8e9b-cdd7b70dff76):
  models gpt-6-astra
  effort high
  turns 8
  working minutes 27.7
  input_tokens 9125716
  cached_input_tokens 8783616
  output_tokens 44406
  reasoning_output_tokens 7646
  total_tokens 9170122

seat C (harness claude, sessions c05ba915-aafe-4964-8748-888f0da7a475):
  models claude-fable-5-1
  effort high
  turns 8
  assistant messages 78
  working minutes 45.1
  first turn in window 2026-10-15T15:31:38.467Z 13.5 min (opening reply was split across turns; not the whole map cost)
  input_tokens 2256
  output_tokens 187112
  cache_read_input_tokens 8624999
  cache_creation_input_tokens 658630

seat D: usage unmeasured (unknown harness agy)
seat D: usage unmeasured (unknown harness agy)

operator turns
  2026-10-15T16:33:27.084Z 0.8 min, output A=6093 B=0 C=0
  2026-10-15T16:35:24.528Z 17.5 min, output A=29823 B=8089 C=52716
  2026-10-15T16:54:03.892Z 0.3 min, output A=2183 B=0 C=0
  2026-10-15T16:57:46.108Z 29.6 min, output A=22684 B=16414 C=36455
  2026-10-15T17:28:47.625Z 0.3 min, output A=1765 B=0 C=0
  2026-10-15T17:29:40.164Z 12.9 min, output A=35450 B=2632 C=15617
  2026-10-15T17:43:20.308Z 0.1 min, output A=771 B=0 C=0
  2026-10-15T17:43:33.828Z 0.2 min, output A=1397 B=4225 C=19017
  2026-10-15T17:47:52.908Z incomplete (reply not finished before the next operator message or the window end), output A=0 B=0 C=5342
  2026-10-15T18:28:05.870Z 0.1 min, output A=298 B=0 C=0
  2026-10-15T18:28:18.549Z 1.9 min, output A=13598 B=0 C=0
  2026-10-15T18:32:10.085Z 0.1 min, output A=554 B=0 C=0
  2026-10-15T18:32:29.496Z 0.2 min, output A=1060 B=0 C=0
  total operator wait 63.9 min
