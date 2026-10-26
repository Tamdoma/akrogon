# Brief: cost-rules

## What

Four changes to the chart-issues door in the akrogon repo, each judged on its own:

1. Attended handover. In attended mode, when Drain moves on to a named next chart (the current chart handed off, closed, held or waiting on an approval, need or prerequisite), old A writes the outgoing chart's records, collects every consultant turn and closes its span. It then appends a handover entry to the next chart's Mode record. The entry names the outgoing mode, the time, the reset log path, the next chart, the surviving consultants, and every conversation-only operator instruction still in force, verbatim with its provenance and scope. Old A runs `door-reset.ts` and ends its turn. The fresh A continues only when its start prompt matches the latest entry in that Mode record and that entry is a handover with no later continuation. It appends its continuation with its live session, which consumes the handover, records its seat and opens its span before any chart work, and stays attended. With no match it starts attended in no chart. (A,B)
   - When the next chart has no folder yet, old A creates only its CHART.md, holding a pending Destination that names the source (seed path, legacy path or the operator's note) and the Mode record. Fresh A imports the intake by the existing import rule and writes the Destination after its map. (A,C)
   - There is no handover at first entry, inside a chart, at a presented round or handoff review, after compaction, or when the pass ends. The handover steps are written once for both modes, which differ only in trigger, resume entry and who picks the next chart. Unsupported A kinds and runs outside herdr keep same-session behavior.
2. Reset cancel. `skills/chart-issues/scripts/door-reset.ts` records where A's session record ends when the handover is queued. It cancels, logging `superseded` and sending nothing more, when operator input appears in that record after that point. The check runs while it waits for the turn end and again at the recheck, which is the last step before the reset is sent. Operator input is:
   - claude: a `user` entry or a `queued_command` attachment whose `origin.kind` is `human`;
   - codex: a `task_started` event or a `response_item` `message` with role `user`;
   - pi: a `message` entry with role `user`.
   The queuing turn's own records (assistant output, tool calls, tool results, claude meta entries, compaction summaries and task notifications) do not cancel it. A session record the parent cannot read at queue time is refused the same way as an identity mismatch: an error on stderr, a non-zero exit, nothing sent and no log. A session record the child cannot read while waiting sends nothing, and the reason is logged. This applies in both modes. (A,B,C)
3. Seat C default. When the door creates peer panes and the operator names no kind for seat C, C starts as kind `pi` with empty arguments. An operator-named kind or arguments win. B and later seats are asked as today. Supplied panes are untouched.
4. One final check per reply. All mechanism or contract corrections from one operator reply (under autopilot, one pick) for one fork go into one proposed final shape with the corrections marked, sent to every named peer for one focused check before A records them. A correction adopted after that check gets another check only when it adds a mechanism or changes the contract. Restatements stay exempt. Corrections that conflict in meaning, obligations or behavior, with each other or with a lock or Taken answer, go back to the operator before the check (under autopilot, A's recorded pick). Fresh research on a reshaped question, the one rebuttal and leaf review keep their own triggers.

## Why

Attended A never resets, so it carries earlier charts: 120-160k context per call (this chart's A averaged 160,485 over 33 calls, issues/chart/door-cost/USAGE.md) against about 61k for a fresh session. An operator who types while a handover is queued can have that turn wiped, because the helper waits for the latest turn rather than the queuing one; claude even absorbs typed-ahead input into the running turn. The C kind question is asked every time panes are created, and fable C seats were the costliest consultant. Final checks chain: deploy-path ran three rounds of final-check briefs.

## Done-criteria

1. For each of claude, codex and pi, when operator input is recorded in A's session after the handover was queued and before the recheck, `door-reset.ts` sends no reset and no start prompt and logs `superseded`. This holds both when the input is present while it waits for the turn end and when it first appears after the turn end was seen. For claude it holds both for a new prompt and for input absorbed into the running turn. (A,B,C)
2. For each of claude, codex and pi, when A's session gains only the queuing turn's own records after the handover was queued, `door-reset.ts` still sends the reset and the start prompt as before. For claude this includes a task notification. (A,B)
3. When A's session record cannot be read at queue time, `door-reset.ts` exits non-zero with the reason on stderr and sends nothing. When it cannot be read while waiting, it sends nothing and logs the reason. (A,C)
4. The chart-issues skill text and the Mode record shape describe the attended handover in What 1, including the attended handover and continuation entry forms, with the existing `handover`, `continue autopilot (handover <time>)` and `handover queued` wording still present for autopilot. (A,C)
5. The chart-issues skill text, in both places that describe created peers, states the seat C default in What 3.
6. The chart-issues skill text, in both places that describe the final-shape check, states the batched check in What 4.
