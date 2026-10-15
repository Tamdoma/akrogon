chart check-evidence - operator wait 129.4 min, operator turns 25; A=291893, B=89854, C=250136, D=unmeasured output

window 2026-10-15T15:30:01.000Z to 2026-10-15T20:42:14.652Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0c42a11d-8bd3-4863-9a34-73f053b563e0):
  models claude-opus-5-5
  effort xhigh, high
  turns 24
  assistant messages 220
  working minutes 129.4
  first turn in window 2026-10-15T16:33:27.084Z 0.8 min
  input_tokens 442
  output_tokens 291893
  cache_read_input_tokens 29492131
  cache_creation_input_tokens 782854

seat B (harness codex, sessions 01a13539-de42-7a81-870f-9af07464b724 + 01a1402e-4c09-7ba1-8e9b-cdd7b70dff76):
  models gpt-6-astra
  effort high
  turns 18
  working minutes 52.0
  input_tokens 17485177
  cached_input_tokens 16902912
  output_tokens 89854
  reasoning_output_tokens 19523
  total_tokens 17575031

seat C (harness claude, sessions c05ba915-aafe-4964-8748-888f0da7a475):
  models claude-fable-5-1
  effort high
  turns 14
  assistant messages 119
  working minutes 64.8
  first turn in window 2026-10-15T15:31:38.467Z 13.5 min (opening reply was split across turns; not the whole map cost)
  input_tokens 3390
  output_tokens 250136
  cache_read_input_tokens 14364842
  cache_creation_input_tokens 800867
  session c05ba915-aafe-4964-8748-888f0da7a475 totalCostUSD 37.41362275000003 (whole-session figure; can include other charts)

seat C: usage unmeasured (unknown harness pi)
seat D: usage unmeasured (unknown harness agy)
seat D: usage unmeasured (unknown harness agy)
seat D: usage unmeasured (unknown harness pi)

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
  2026-10-15T18:32:29.496Z 13.6 min, output A=15237 B=10159 C=27680
  2026-10-15T19:23:28.613Z 0.2 min, output A=1287 B=0 C=0
  2026-10-15T19:26:29.403Z 0.1 min, output A=920 B=0 C=0
  2026-10-15T19:27:35.240Z 0.9 min, output A=3995 B=0 C=0
  2026-10-15T19:28:59.569Z 15.3 min, output A=16598 B=12431 C=35344
  2026-10-15T19:44:43.163Z 0.3 min, output A=1569 B=0 C=0
  2026-10-15T19:45:52.104Z 15.5 min, output A=15203 B=14047 C=0
  2026-10-15T20:04:23.464Z 0.1 min, output A=751 B=0 C=0
  2026-10-15T20:08:43.146Z 7.4 min, output A=19917 B=1615 C=0
  2026-10-15T20:28:36.026Z 0.2 min, output A=918 B=0 C=0
  2026-10-15T20:29:02.835Z 10.5 min, output A=23778 B=7196 C=0
  2026-10-15T20:40:04.915Z 0.1 min, output A=328 B=0 C=0
  2026-10-15T20:40:37.586Z 1.5 min, output A=10636 B=0 C=0
  total operator wait 129.4 min
