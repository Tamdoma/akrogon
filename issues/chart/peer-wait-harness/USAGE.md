chart peer-wait-harness - operator wait 258.8 min, operator turns 51; A=528724, B=142082, C=250136, D=unmeasured output

window 2026-10-15T15:30:01.000Z to 2026-10-15T23:15:48.745Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 0c42a11d-8bd3-4863-9a34-73f053b563e0):
  models claude-opus-5-5
  effort xhigh, high
  turns 50
  assistant messages 546
  working minutes 258.8
  first turn in window 2026-10-15T16:33:27.084Z 0.8 min
  input_tokens 1102
  output_tokens 528724
  cache_read_input_tokens 74811573
  cache_creation_input_tokens 1431725

seat B (harness codex, sessions 01a13539-de42-7a81-870f-9af07464b724 + 01a1402e-4c09-7ba1-8e9b-cdd7b70dff76):
  models gpt-6-astra
  effort high
  turns 37
  working minutes 82.3
  input_tokens 33317908
  cached_input_tokens 32281984
  output_tokens 142082
  reasoning_output_tokens 34639
  total_tokens 33459990

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
  2026-10-15T20:40:37.586Z 2.0 min, output A=12690 B=0 C=0
  2026-10-15T20:43:35.735Z 0.1 min, output A=268 B=0 C=0
  2026-10-15T20:44:28.210Z 0.1 min, output A=461 B=0 C=0
  2026-10-15T20:46:25.587Z 5.0 min, output A=8731 B=8630 C=0
  2026-10-15T20:52:54.548Z 1.0 min, output A=5332 B=1481 C=0
  2026-10-15T20:55:35.484Z 1.4 min, output A=6303 B=5 C=0
  2026-10-15T20:57:59.139Z 0.2 min, output A=833 B=0 C=0
  2026-10-15T20:58:53.504Z 38.9 min, output A=70555 B=21540 C=0
  2026-10-15T21:38:09.799Z 0.2 min, output A=1351 B=0 C=0
  2026-10-15T21:39:23.519Z 1.1 min, output A=7005 B=0 C=0
  2026-10-15T21:40:45.062Z 0.1 min, output A=680 B=0 C=0
  2026-10-15T21:41:17.473Z 22.4 min, output A=45323 B=8692 C=0
  2026-10-15T22:05:03.782Z 0.4 min, output A=1992 B=0 C=0
  2026-10-15T22:05:32.123Z 3.1 min, output A=5542 B=0 C=0
  2026-10-15T22:09:12.102Z 4.9 min, output A=7846 B=0 C=0
  2026-10-15T22:14:39.423Z 0.1 min, output A=345 B=0 C=0
  2026-10-15T22:15:33.039Z 0.1 min, output A=330 B=0 C=0
  2026-10-15T22:16:10.786Z 11.5 min, output A=4476 B=2684 C=0
  2026-10-15T22:27:48.487Z 0.1 min, output A=589 B=0 C=0
  2026-10-15T22:28:48.125Z 0.1 min, output A=355 B=0 C=0
  2026-10-15T22:29:13.675Z 8.7 min, output A=18037 B=4126 C=0
  2026-10-15T22:38:15.578Z 0.1 min, output A=635 B=0 C=0
  2026-10-15T22:39:17.134Z 1.7 min, output A=9253 B=0 C=0
  2026-10-15T22:41:18.590Z 21.0 min, output A=26894 B=2686 C=0
  2026-10-15T23:08:21.966Z 0.9 min, output A=4396 B=0 C=0
  2026-10-15T23:09:48.042Z 0.1 min, output A=318 B=0 C=0
  2026-10-15T23:10:13.914Z 5.5 min, output A=6927 B=2384 C=0
  total operator wait 258.8 min
