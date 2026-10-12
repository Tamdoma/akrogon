chart changed-test-proof - operator wait 18.5 min, operator turns 9; A=116249, B=15415 output

window 2026-10-11T19:22:59.000Z to 2026-10-11T20:04:57.422Z

- window tokens and minutes show that usage and elapsed time changed; they do not show that dollar cost fell.
- a whole-session dollar figure covers the whole session and can include other charts' work; it is not this chart's cost.
- subagent usage is not counted.
- a turn runs from an operator message to the end of the reply before the next operator message; a codex turn runs from task_started to task_complete; operator wait is the sum of completed operator-turn spans.

seat A (harness claude, sessions e2551340-ff8a-4098-ad7e-ed1082627d93):
  models claude-opus-5-5
  effort xhigh
  turns 9
  assistant messages 89
  working minutes 18.5
  first turn in window 2026-10-11T19:35:11.793Z 0.3 min
  input_tokens 182
  output_tokens 116249
  cache_read_input_tokens 10990817
  cache_creation_input_tokens 290061

seat B (harness codex, sessions 01a12be0-d438-7ff1-89a3-dc96b8ceebae + 01a12c12-d6b0-7d82-aa14-7acddfe4a526):
  models gpt-6.1-sol
  effort medium
  turns 7
  working minutes 8.7
  input_tokens 4006574
  cached_input_tokens 3846656
  output_tokens 15415
  reasoning_output_tokens 1611
  total_tokens 4021989

operator turns
  2026-10-11T19:35:11.793Z 0.3 min, output A=1543 B=0
  2026-10-11T19:38:12.786Z 5.9 min, output A=24323 B=4170
  2026-10-11T19:44:04.047Z 0.3 min, output A=1925 B=0
  2026-10-11T19:47:32.913Z 4.2 min, output A=18163 B=1821
  2026-10-11T19:54:33.666Z 2.5 min, output A=8656 B=0
  2026-10-11T19:58:07.125Z 1.6 min, output A=9269 B=0
  2026-10-11T20:00:23.206Z 0.1 min, output A=878 B=0
  2026-10-11T20:00:48.858Z 2.2 min, output A=13495 B=0
  2026-10-11T20:03:22.466Z 1.4 min, output A=2890 B=1632
  total operator wait 18.5 min
