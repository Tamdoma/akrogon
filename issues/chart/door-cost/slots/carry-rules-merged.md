# Merged fork notes, carry-rules, 2026-10-26

## Q1 record or prompt
- Pick: fresh A continues only when the start prompt matches old A's handover entry in the next chart's Mode record, naming the outgoing mode, pane, time and next chart; no match starts attended in no chart. (A,B,C) Reason: fresh A pulls, restarts consultants and writes chart files on entry, so a stale prompt can act in the wrong chart; the entry shows the mode on disk. Cost: shapes.md Mode record stops being autopilot-only.
- Rejected: prompt alone. (A,B,C)
- Continuation is recorded with fresh A's live session so a superseded handover is not reused (B); a later attended open with no matching prompt appends its own entry, superseding a stale one (C). Fresh A records its seat and span before chart work (B, and C under Q4), keeping an existing chart's opened time (B).
- Open: does a match expire (an hours-late prompt)? (C)

## Q2 chat-only instructions
- Pick: old A writes conversation-only instructions verbatim, with provenance and scope, into the next chart's records before queueing the reset; the prompt points at them; already durable choices and approvals are referenced, never restated. (A,B,C)
- Session instructions go in the handover entry detail and are carried forward at each later handover. (C) Approvals given for the outgoing chart's undelivered work go into the outgoing chart's records before its span closes. (C) A dropped consultant is never revived by a carried choice. (B) Carry only what binds later charts. (A)
- The handover step names its contents (next chart, consultants, session instructions, pending steps) instead of "write the records". (C)

## Q3 turn gap
- O1. Accept and document; footer tells the operator the handover is queued. (A)
- O2. Change door-reset.ts: the parent records the session boundary at queue time (claude transcript, codex rollout, pi session file byte length); the child cancels with a logged `superseded` result if a new turn starts after the boundary, checked while waiting and at the identity recheck; an unreadable marker sends nothing. (B,C) Reason: in attended mode the operator is present and often types ahead; claude submits a queued message the moment the turn ends, so the child would wait for that turn and then wipe it. The change also protects autopilot. (C) Abort on a new turn start, not on any new entry, since the queuing turn itself appends after the boundary. (C) Machinery exists: peer-wait.ts byte boundary and bound turn id, claudeTurnOpen. (B,C)
- Limit: polling cannot make detection and reset atomic; a message arriving between the last check and the send stays a stated limit. (B)
- Name the log path in the handover entry so a superseded result is findable. (C)

## Q4 floor
- Pick: reset at every chart switch with a named next chart, including re-entry; no floor. (A,B,C) Cost: switch-heavy passes may cost more; seats, spans and the usage lines at each handoff review show it.

## Q5 conflicting corrections
- Pick: a substance conflict goes back to the operator before the batched check (under autopilot, A's recorded pick); A resolves only wording. (A,B,C) Test: two readings that would write different Taken, criterion or contract lines are substance. (C) A conflict between a new correction and an existing lock or Taken answer gets the same treatment. (C) A recorded operator priority that decides the case is applied. (B)

## Where seats differ
- D1. Q3: accept (A) or script change (B,C).
