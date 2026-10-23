chart beginner-docs - operator wait 52.5 min, operator turns 17; A=130546, B=43784 output

window 2026-10-23T10:21:53.000Z to 2026-10-23T13:59:09.146Z (open)

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions 1c9d0b48-0ab4-43c9-be91-a873141eb04d):
  models claude-opus-5-5
  effort medium
  turns 17
  calls 116
  average context per call 142322
  working minutes 52.5
  first turn in window 2026-10-23T10:21:21.025Z 10.6 min
  input_tokens 251
  output_tokens 130546
  cache_read_input_tokens 16197048
  cache_creation_input_tokens 312043

seat B (harness codex, sessions 01a167ac-6ab1-78e2-bd57-bba97dba2cde + 01a16848-2c63-7f03-acf6-873a08bc6bf9):
  models gpt-6.1-sol
  effort medium
  turns 20
  calls 99
  average context per call 148219
  working minutes 27.1
  input_tokens 14673659
  cached_input_tokens 14462208
  output_tokens 43784
  reasoning_output_tokens 5480

operator turns
  2026-10-23T10:21:21.025Z 10.6 min, output A=23426 B=11183
  2026-10-23T10:33:34.463Z 0.4 min, output A=1336 B=0
  2026-10-23T10:35:12.924Z 3.1 min, output A=7535 B=3553
  2026-10-23T11:03:10.110Z 0.4 min, output A=1157 B=0
  2026-10-23T11:25:16.928Z 0.3 min, output A=776 B=0
  2026-10-23T11:54:32.750Z 4.9 min, output A=11936 B=4514
  2026-10-23T12:50:52.207Z 0.3 min, output A=749 B=0
  2026-10-23T12:57:38.073Z 5.3 min, output A=11056 B=5600
  2026-10-23T13:04:55.986Z 0.1 min, output A=574 B=0
  2026-10-23T13:06:32.017Z 3.6 min, output A=9723 B=508
  2026-10-23T13:10:19.855Z 0.1 min, output A=846 B=0
  2026-10-23T13:10:42.693Z 5.1 min, output A=8602 B=6119
  2026-10-23T13:20:24.697Z 0.2 min, output A=1115 B=0
  2026-10-23T13:21:37.370Z 5.4 min, output A=9453 B=5652
  2026-10-23T13:29:01.269Z 0.2 min, output A=960 B=0
  2026-10-23T13:44:44.989Z 0.1 min, output A=705 B=0
  2026-10-23T13:46:39.407Z 12.4 min, output A=40597 B=6655
  total operator wait 52.5 min
