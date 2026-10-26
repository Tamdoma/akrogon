# Merged opening map, door-cost, 2026-10-26

Tags name the seats whose own map states the line.

## Evidence
- door-reset.ts is mode-blind (pane, session, log, start prompt), detached, waits for a proven turn end, confirms a new session before the start prompt; kinds claude, codex, pi. (A,B,C)
- tests/door-reset.test.ts pins the strings handover, continue autopilot (handover, handover queued in SKILL.md and shapes.md. (A,B,C)
- Autopilot handovers ran live with the record-and-match shape on 2026-10-22 (config-walls, orphan-pane). (C)
- The peer-create kind question exists only when the door creates panes; the paragraph is duplicated in SKILL.md Open and questions.md Blind peer exchange. (A,B,C)
- pi's own settings default to provider meta, model muse-wonder-full-1.0-contributor, thinking high (~/.pi/agent/settings.json, 2026-10-26), so pi with empty argv starts the model C has run since 2026-10-17. (A)
- chart-cost cut-boundary (2026-10-06): "slot C's model is operator practice at pane start", "not hard coding any models". O8 fixes a harness, not a model. (A,B,C)
- Final-check chains exist: deploy-path ran three rounds of final-check briefs, night-flow two per fork. (A) 126 final-check return files across charts. (C)

## O1b attended handover
- Trigger: exactly the Drain move-on points where Drain names a next chart, after outgoing records are written, every consultant turn collected and the span closed. A presented round or handoff review is not a switch. No reset at first entry, compaction, inside a chart, or when the pass ends. (A,B,C)
- Record and resume:
  - O1. Start prompt only, carrying pane, time, next chart, skill path, consultants and standing instructions; no record, since attended has no authority to protect. (A)
  - O2. Generalize the handover record in the Mode record, naming the outgoing mode; fresh A verifies the match; attended continuation stays attended and never writes continue autopilot; autopilot keeps its handed list and dropped seats. (B,C) C's reason: a stale or re-sent prompt could point fresh A at a chart another door has since taken, with nothing on disk to check. A record also lets a reader tell the mode.
  - No match: start attended, enter no chart, the operator decides. (C)
- What crosses: surviving consultants by seat and pane (A,B,C); operator choices and authorizations by reference to durable records, never reconstructed from a summary (B); standing chat instructions verbatim in the prompt (A). Outgoing loose ends (promised closes, steps on main) must be in CHART.md before the reset is queued. (C)
- Shared text: write the handover mechanics once, both modes name only their differences (trigger, resume word, who picks the next chart). (C)
- Script: no door-reset.ts change. (A,B,C) C names one possible change: the detached child cannot tell the queuing turn from a later one, so an operator message in the gap between queueing and turn end could be wiped. A's view: no question is pending at a switch, so only an unprompted message is at risk; document and accept.
- Unsupported A kind or outside herdr: same-session behavior, unchanged. (A,B,C)
- Cost: /clear wipes the operator's visible scrollback in the pane. (A) Each switch pays a fresh start plus process re-reads; switch-heavy passes could cost more. (A,C) C asks whether a floor (no reset back into a chart left earlier in the pass, or after a short chart) is wanted.

## O8 seat C defaults to pi
- Door-created C with no operator-named kind starts as kind pi with empty argv; explicit kind or arguments win; supplied panes untouched; B and later seats still asked; both copies of the paragraph change; peer-create.ts unchanged; restarts keep their live kind and argv. (A,B,C)
- The first reply names C as pi so the default is visible. (C)
- No fallback if pi cannot start: existing failed-create rule. (A,B)
- Three pi seats would cut blind diversity; nothing in the lock removes it, flagged only. (C)

## O4 one final check per reply
- Batch all mechanism or contract corrections from one operator reply (under autopilot, one pick) for one fork into one proposed final shape, sent to every named peer for one focused check before recording; restatements exempt. Not across forks or across replies. (A,B,C)
- Peers get the full shape with the round's corrections marked, so interactions show. (C) Conflicting corrections are resolved before sending, not concatenated. (B)
- After the check:
  - O3. A change A accepts that adopts the checker's own stated correction is recorded without another check. (A)
  - O4. A later substantive correction reopens the changed-contract trigger. (B) A second check fires only when A's fix adds a mechanism or changes the contract again. (C)
- Fresh research on a reshaped question, the one rebuttal against the merge and leaf review keep their own triggers. (A,B,C)
- The batched brief names its round so return paths stay distinct. (B,C)

## Delivery
- One lifecycle leaf across SKILL.md, questions.md, shapes.md. (A,B,C)
- Proof: C proposes a live attended handover on throwaway charts and one peer-create run with C unspecified. B asks to verify attended switch and re-entry, autopilot continuity, no reset inside a chart or at session end, C override and supplied panes, and batched checks keeping every trigger. Wording tests stay limited to strings scripts or records parse. (C)
- Measurement: existing seats, spans and usage records judge results; 10-25% is not an acceptance bar. (B) C asks what number would make the operator revert O1b, and whether chart-usage attributes A correctly when each session covers one chart.

## Where seats differ
- D1. Attended handover record: prompt only (A) or Mode record entry with match (B,C).
- D2. Standing chat instructions: verbatim in the prompt (A) or by reference to durable records (B).
- D3. After a final check: adopt-the-checker's-point is exempt (A) or any substantive correction reopens the trigger (B,C).
- D4. Turn-gap risk in door-reset: accept and document (A) or decide a script change in the chart (C).
- D5. Reset floor for short or revisited charts: none (A,B) or a question (C).
