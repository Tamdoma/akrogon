chart busy-seat-notice - operator wait 91.2 min, operator turns 30; A=248108, B=83706, C=56705 output

window 2026-10-10T16:50:33.000Z to 2026-10-10T21:15:50.854Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions cfe3439f-85f2-4472-a49d-d163111cd153):
  models claude-opus-5-5
  effort medium, xhigh
  turns 28
  assistant messages 210
  working minutes 91.2
  first turn in window 2026-10-10T16:55:23.073Z 0.2 min
  input_tokens 458
  output_tokens 248108
  cache_read_input_tokens 28723618
  cache_creation_input_tokens 769322

seat B (harness codex, sessions 01a1250e-a444-7171-9b8d-17ab3e4c4bf0 + 01a12604-574e-7302-ae28-44897fd2db99):
  models gpt-6.1-sol
  effort medium, xhigh
  turns 22
  working minutes 53.2
  input_tokens 17746993
  cached_input_tokens 16942080
  output_tokens 83706
  reasoning_output_tokens 27946
  total_tokens 17830699

seat C (harness claude, sessions 7f813b89-c7f0-4374-9c77-dfd6d05ad833):
  models claude-fable-5-1
  effort medium, high
  turns 10
  assistant messages 47
  working minutes 14.9
  first turn in window 2026-10-10T20:19:57.993Z 2.1 min
  input_tokens 1172
  output_tokens 56705
  cache_read_input_tokens 5592142
  cache_creation_input_tokens 251426

operator turns
  2026-10-10T16:55:23.073Z 0.2 min, output A=1398 B=0 C=0
  2026-10-10T16:56:10.729Z 12.4 min, output A=18138 B=4853 C=0
  2026-10-10T17:08:41.044Z 0.2 min, output A=1206 B=0 C=0
  2026-10-10T17:10:22.331Z 1.4 min, output A=6595 B=0 C=0
  2026-10-10T17:14:02.533Z 0.2 min, output A=1091 B=0 C=0
  2026-10-10T17:14:54.088Z 7.3 min, output A=13822 B=7389 C=0
  2026-10-10T17:22:17.916Z 0.2 min, output A=1012 B=0 C=0
  2026-10-10T17:23:00.221Z 3.7 min, output A=7099 B=5049 C=0
  2026-10-10T17:28:35.058Z 0.1 min, output A=778 B=0 C=0
  2026-10-10T17:29:04.016Z 4.3 min, output A=9406 B=5552 C=0
  2026-10-10T17:33:52.690Z 0.2 min, output A=1045 B=0 C=0
  2026-10-10T17:34:42.301Z 5.9 min, output A=7965 B=7748 C=0
  2026-10-10T17:42:43.405Z 0.1 min, output A=927 B=0 C=0
  2026-10-10T17:43:45.978Z 0.3 min, output A=1657 B=0 C=0
  2026-10-10T17:44:28.231Z 6.1 min, output A=9899 B=5461 C=0
  2026-10-10T17:50:37.758Z 0.1 min, output A=604 B=0 C=0
  2026-10-10T17:52:35.820Z 1.0 min, output A=4283 B=0 C=0
  2026-10-10T17:54:42.133Z 0.2 min, output A=407 B=0 C=0
  2026-10-10T17:54:59.929Z incomplete (reply not finished before the next operator message or the window end), output A=0 B=0 C=0
  2026-10-10T17:55:20.027Z 0.1 min, output A=757 B=0 C=0
  2026-10-10T17:57:17.047Z 1.3 min, output A=4469 B=0 C=0
  2026-10-10T20:12:34.448Z 2.6 min, output A=6148 B=3203 C=0
  2026-10-10T20:16:31.598Z 0.2 min, output A=828 B=0 C=0
  2026-10-10T20:19:31.995Z 6.9 min, output A=10784 B=10189 C=19277
  2026-10-10T20:33:05.312Z incomplete (reply not finished before the next operator message or the window end), output A=0 B=0 C=0
  2026-10-10T20:33:14.948Z 15.4 min, output A=32832 B=15028 C=22065
  2026-10-10T20:52:52.734Z 2.6 min, output A=8744 B=3007 C=3054
  2026-10-10T20:55:49.250Z 0.1 min, output A=574 B=0 C=0
  2026-10-10T20:56:31.818Z 6.4 min, output A=39758 B=0 C=0
  2026-10-10T21:04:02.726Z 11.7 min, output A=38321 B=10744 C=12309
  total operator wait 91.2 min
