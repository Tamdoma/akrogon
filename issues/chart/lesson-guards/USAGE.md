chart lesson-guards - operator wait 26.3 min, operator turns 12; A=83853, B=19164, C=32850 output

window 2026-10-10T06:43:42.000Z to 2026-10-10T08:23:16.358Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions a7a6765b-b14d-4e24-bc1e-b2fa7fcdbc97):
  models claude-opus-5-5
  effort medium
  turns 11
  assistant messages 71
  working minutes 26.3
  first turn in window 2026-10-10T06:44:55.210Z 3.9 min
  input_tokens 157
  output_tokens 83853
  cache_read_input_tokens 9912274
  cache_creation_input_tokens 187784

seat B (harness codex, sessions 01a11d66-cf8f-75a2-95e4-a6cc685b1a70 + 01a1248b-9d86-7922-b3c0-78bf688904e2):
  models gpt-6.1-sol
  effort medium
  turns 9
  working minutes 11.9
  input_tokens 3896169
  cached_input_tokens 3757568
  output_tokens 19164
  reasoning_output_tokens 3459
  total_tokens 3915333

seat C (harness claude, sessions 17afe92f-f47e-446f-b005-6c217b21b2c5):
  models claude-fable-5-1
  effort medium
  turns 5
  assistant messages 27
  working minutes 7.6
  first turn in window 2026-10-10T07:52:59.890Z 2.4 min
  input_tokens 726
  output_tokens 32850
  cache_read_input_tokens 2233751
  cache_creation_input_tokens 137660

operator turns
  2026-10-10T06:44:37.092Z incomplete (reply not finished before the next operator message or the window end), output A=0 B=0 C=0
  2026-10-10T06:44:55.210Z 3.9 min, output A=9272 B=4674 C=0
  2026-10-10T07:44:51.684Z 0.2 min, output A=1384 B=0 C=0
  2026-10-10T07:46:24.902Z 3.5 min, output A=11046 B=3064 C=0
  2026-10-10T07:52:14.733Z 5.0 min, output A=13874 B=3724 C=12013
  2026-10-10T07:57:54.397Z 0.2 min, output A=856 B=0 C=0
  2026-10-10T08:01:27.500Z 2.2 min, output A=6591 B=1214 C=4006
  2026-10-10T08:09:41.784Z 1.0 min, output A=4473 B=0 C=0
  2026-10-10T08:11:26.026Z 0.1 min, output A=805 B=0 C=0
  2026-10-10T08:11:45.690Z 5.6 min, output A=16544 B=4223 C=12721
  2026-10-10T08:18:07.613Z 0.1 min, output A=823 B=0 C=0
  2026-10-10T08:18:38.594Z 4.6 min, output A=13540 B=2265 C=4110
  total operator wait 26.3 min
