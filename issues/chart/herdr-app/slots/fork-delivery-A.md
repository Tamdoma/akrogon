# Fork notes A: delivery

## Q1 first task at start
- Pick: direct `hc run --bg ... -- <harness argv> "<task>"`, the task in argv, as the live consultants run now (all four took their first task this way, INTAKE agent finding 2026-11-06). Proof: hc's launch-task tracking for children is template-only in the schema, so start reads one `hc get` after `hc run` returns and accepts `working` or `turn >= 1`; otherwise `hc wait <t> --timeout 60` once and re-read; still neither: failed start (kill, non-zero, Q4). Reason: closest to today (akrogon starts the harness itself), no new installed files. Cost: the 60 s readiness retry and `first_message` record of templates are not available, and harnesses that ignore an argv task would need their own argv form (config fork).
- Rejected: templates written by akrogon install from `harnesses:` (a new generated file set per kind and a second place harness argv lives; the template body is empty anyway). Plain launch then `hc send` (hc docs: a send to a booting agent can be dropped).
- Evidence: better-than-training · `hc --skill` "Delegate a task" (put the first task in run; direct form documented) · `hc schema` `RunResult.first_message` "Template runs" · `src/next.ts:786-826` (start then prompt today) · 2026-11-06.
- Pitfall: agy `-i` and pi take the task differently in argv. Removed by: the per-kind probe in signpost 7a.

## Q2 later tasks
- Pick: the busy refusal (`src/next.ts:765`) stays as a status read (`working` skips the seat); not `--if idle`, because a seat after a turn shows `done`, not `idle` (live consultants 2026-11-06), so `--if idle` would refuse every finished seat. Delivered = `started: true` with the returned turn recorded as `prompted` (identity Q2). `started: false` or `not_started`: read the screen, never blind resend (hc docs), record a delivery error and leave it to the next pass and the watcher, as today's delivery error. Blocked: hc refuses (`blocked`), same as today's busy return. Drop the session-file proof and `prompt --wait --until working` (signpost 2a). Keep the 60-minute busy notice (notices fork).
- Rejected: `--force` sends (types into dialogs); keeping session-file offsets (herdr session id is gone).
- Evidence: `hc schema` `terminal.send` (`if`, `force`, `started`, `turn`, errors `blocked`, `status_mismatch`) · `src/next.ts:221,765-771` · 2026-11-06.

## Q3 silent stop
- Leaf seats, pick: port today's rule. Today the pass re-prompts an idle seat that is not in `done` for the current phase once its prompt is older than 2 minutes (`src/next.ts:221,766-771`; watch-issues "The existing akrogon pass re-prompts the phase itself"). On hc the turn replaces the clock: when the seat's turn has advanced past the recorded `prompted` turn and the seat is not in `done`, the pass re-prompts the phase. Loops stay the watcher's (its unproductive-cycle and loop-evidence rules).
- Consultants under the door, pick: when `hc wait --children` shows a child done whose return file or `done` message is missing, the door re-prompts once with what is missing (as A did for E 2026-11-06); a second silent stop drops the seat for that exchange (existing dropped-consultant rule).
- Recurrence: the cause is the harness (agy ended a turn printing "⚙️"); akrogon cannot prevent it, only catch it. Record each case with harness and model so the config fork can drop or change a kind that repeats it.
- Pitfall: re-prompting a seat that is waiting on a long command it backgrounded. Removed by: the turn rule only fires after the turn ended, and the watcher judges the screen.
- Ask: should a re-prompt cap exist for leaf seats (today none), or stay with the watcher?
