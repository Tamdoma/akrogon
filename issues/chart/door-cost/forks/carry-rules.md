# Carry rules for attended handover and batched checks

## Question

### Q1
When attended A hands over at a chart switch, does the fresh A continue on the start prompt alone, or only when the prompt matches a handover entry old A wrote into the next chart's Mode record (naming the outgoing mode), with no match meaning start attended in no chart?

### Q2
Where do operator instructions that only live in old A's conversation (session-level instructions such as "only these charts today", consultant choices, scoped approvals) go so the fresh A has them: verbatim in the start prompt, written into the next chart's records before the reset is queued with the prompt pointing at them, or by reference to existing durable records only?

### Q3
door-reset.ts's detached child waits up to 600 s for A's turn to end and cannot tell the queuing turn from a later one, so a new operator turn in that gap completes and the reset then fires. Accept and document this, or change the script so the reset only fires after the queuing turn?

### Q4
Should attended handover have a floor, skipping the reset when the next chart is one A already worked earlier in the same pass or when the outgoing chart was short, or reset at every chart switch?

### Q5
When two corrections in one operator reply conflict in substance, does A resolve them before the batched final-shape check, or does the conflict go back to the operator (under autopilot, A's recorded pick) before any check?

### Carries
- Locks (operator 2026-10-26): O1b, O8, O4 only, no prose caps; every blind step stays; attended handover at chart switches only, never mid-chart, never at session end; route lifecycle.
- Opening map agreement: trigger is the Drain move-on points with a named next chart, after outgoing records, collected consultant turns and a closed span; no door-reset.ts change unless Q3 says so; unsupported kinds keep same-session behavior; C defaults to kind pi with empty argv only on the peer-create path; one reply's mechanism or contract corrections for one fork go to every named peer in one final-shape check with corrections marked; a correction adopted after that check gets another check only when it adds a mechanism or changes the contract (A,B,C after rebuttal); fresh research, rebuttal and leaf review keep their own triggers.
- Related: slots/map-merged.md, slots/rebuttal-B.md, slots/rebuttal-C.md.

## Findings

Full notes: slots/carry-rules-A.md, -B.md, -C.md; merge slots/carry-rules-merged.md; rebuttals slots/carry-rules-rebuttal-B.md, -C.md. Opening map: slots/map-merged.md with rebuttals slots/rebuttal-B.md, -C.md.
- Q1: match record (A,B,C). A's first map picked prompt-only on "attended has no authority to protect"; B and C showed fresh A pulls, restarts consultants and writes chart files on entry. Match expiry (C open question) is covered by Q3: any operator input cancels, and the reset waits at most the turn bound plus confirm (door-reset.ts, 600 s + 60 s defaults).
- Q2: write verbatim with scope before reset (A,B,C). C rebutted A's "only what binds later charts" filter: old A would predict scope just before its words are lost.
- Q3: script change (B,C) against accept (A). Evidence: door-reset.ts child waits for a proven turn end of the latest turn, with no bound to the queuing turn; claude submits typed-ahead input at turn end; peer-wait.ts codexEnded already binds a byte boundary and turn id. B: cancel on later operator input or turn, not only a new turn id; establish each harness's input signal before promising coverage; polling cannot make detection and send atomic.
- Q4: no floor (A,B,C). F2: carried history dominates context regardless of chart length.
- Q5: substance back to operator (A,B,C). B R3: the test is different meaning, obligations or behavior, not different lines. C: a conflict with a lock or Taken answer goes back too; a general recorded priority is not an operator answer in attended mode.
- O8 proof, 2026-10-26: `bun skills/chart-issues/scripts/peer-create.ts /home/ivan/Work/infra/akrogon w8:pWV '[{"seat":"C","kind":"pi","argv":[]}]'` in throwaway tab w8:tEY (label door-cost-proof), herdr 0.9.1, operator's local herdr and pi login. Result: exit 0, `{"seat":"C","pane":"w8:pWW","kind":"pi","state":"started"}`, agent list showed pi idle with a session file. Cleanup: `herdr tab close w8:tEY` ok, no tab or agent row left, the empty pi session file deleted. Limits: the started model comes from ~/.pi/agent/settings.json (meta muse-wonder-full-1.0-contributor, thinking high, read 2026-10-26), not observed in the session file; no prompt sent; the pick rests on "no model hard-coded" (C rebuttal), not on settings history.
- Input signals, leaf review evidence 2026-10-26 (B F2). Pi: across ~/.pi/agent/sessions files modified in the last 3 days, 615 `message` role `user` entries, 48 directly after a `toolResult` (input typed while pi was working, delivered mid-run), and tool results are always role `toolResult`, so pi's own turn never writes role `user`. Codex: 40 rollouts under ~/.codex/sessions (2026-10-24..26) hold 166 `task_started`, 208 `response_item` `message` role `user` (42 context messages starting with `<`, each the first message of a turn and followed by the prompt), and no role-`user` message later in a turn; codex input typed mid-turn was not observed, so its record is unknown. Claude: `queue-operation` `enqueue` plus `attachment` `queued_command` for input absorbed mid-turn, `user` with string content for a new prompt, and `user` with `tool_result` content for tool output (researched 2026-10-26).

## Taken

A's picks under autopilot, 2026-10-26 (round printed in door pane w8:pNP):
- Q1 1a: fresh A continues only when the start prompt matches old A's handover entry in the next chart's Mode record naming the outgoing mode, pane, time, log and next chart; no match starts attended in no chart; fresh A appends its continuation with its live session and records its seat and span before chart work. Rejected: prompt alone (nothing on disk to check).
- Q2 2a: old A writes every conversation-only operator instruction still in force verbatim with provenance and scope into the next chart's records before queueing the reset (session instructions in the handover entry detail, carried forward at later handovers; approvals for the outgoing chart's own work into the outgoing chart's records before its span closes); approvals and choices already durable are referenced, never restated; a dropped consultant is never revived. Rejected: prompt only (wiped by the reset), reference only (misses unsaved instructions), A's filter on what binds later charts (C dissent accepted).
- Q3 3b: door-reset.ts records the session boundary when the handover is queued and cancels with a logged superseded result when a later operator input or turn appears after it, checked while waiting and at the recheck before the reset is sent; an unreadable marker sends nothing; the handover entry names the log path; the change covers autopilot too; the remaining interval between the last check and the send is a stated limit. Rejected: accept and document (footer prints at the moment the risk starts; A's first pick, B and C dissent accepted).
- Q4 4a: reset at every chart switch with a named next chart, re-entry included; no floor. Rejected: short-chart or revisit floors (no observable measure, keeps carried context).
- Q5 5a: two corrections, or a correction and a lock or Taken answer, that differ in meaning, obligations or behavior go back to the operator before the batched check (under autopilot, A's recorded pick); A resolves only wording. Rejected: A resolves substance; applying a general recorded priority as an answer (C).
