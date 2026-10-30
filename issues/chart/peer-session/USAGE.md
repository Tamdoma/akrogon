chart peer-session - operator wait 29.8 min, operator turns 5; A=40718, B=31273, C=30717 output

window 2026-10-24T13:57:44.000Z to 2026-10-24T14:15:52.000Z, 2026-10-29T07:29:36.000Z to 2026-10-29T07:46:26.000Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions bacd17ee-47fd-4d72-9f7c-ee61ee8698cf + df4e7766-cbbc-4c40-8f28-60e419fee3e1):
  models claude-opus-5-5
  effort medium, high
  turns 5
  calls 36
  average context per call 209020
  working minutes 29.8
  first turn in window 2026-10-24T13:51:17.122Z 0.8 min
  input_tokens 74
  output_tokens 40718
  cache_read_input_tokens 7399412
  cache_creation_input_tokens 125240

seat B (harness codex, sessions 01a16e33-bffa-73c3-83a0-9e74bd66da9c + 01a18690-809a-7a20-8f8b-57936db4ebf2):
  models gpt-6.1-sol
  effort medium, high
  turns 6
  calls 57
  average context per call 88608
  working minutes 18.4
  first turn in window 2026-10-24T13:57:57.708Z 3.7 min
  input_tokens 5050644
  cached_input_tokens 4817024
  output_tokens 31273
  reasoning_output_tokens 9300

seat C (harness pi, sessions /home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-24T13-57-34-951Z_01a16e33-dc67-75ff-a510-3ffc1f80f7e0.jsonl):
  models muse-wonder-full-1.0-contributor
  effort high
  turns 2
  calls 28
  average context per call 62900
  working minutes 17.2
  first turn in window 2026-10-24T13:57:58.320Z 12.4 min
  input_tokens 187109
  output_tokens 30717
  cache_read_input_tokens 1574088
  cache_creation_input_tokens 0
  reasoning_output_tokens 14910

operator turns
  2026-10-24T13:51:17.122Z 0.8 min, output A=4417 B=3494 C=6794
  2026-10-24T14:00:15.283Z 0.1 min, output A=586 B=3647 C=14574
  2026-10-24T14:03:49.409Z 10.6 min, output A=8681 B=2719 C=9283
  2026-10-24T14:14:25.317Z 1.4 min, output A=2152 B=0 C=66
  2026-10-29T07:26:03.431Z 16.8 min, output A=24882 B=21413 C=0
  total operator wait 29.8 min
