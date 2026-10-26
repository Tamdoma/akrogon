# Opening map, seat A, door-cost, 2026-10-26

## O1b attended handover
- Q1. What does a fresh attended A need that only lived in old A's conversation? Consultant panes (in seats.yaml of the outgoing chart), the next chart (Drain order), operator standing instructions given in chat, and session authorizations ("recognize concrete handoff authorization already supplied in the session"). Evidence: SKILL.md Open, Drain, Handoff; door-reset.ts start prompt is free text (better-than-training, skills/chart-issues/scripts/door-reset.ts main, 2026-10-26).
  - 1a (pick) Start prompt carries pane, handover time, next chart folder, skill path, consultant panes, and the operator's standing session instructions verbatim; fresh A starts attended in that chart. No mode record needed, since attended has no authority to protect. Cost: one longer prompt.
  - 1b Reuse the Mode record handover line in attended charts with the same match check. Cost: mode record stops being autopilot-only, shapes and tests change, adds nothing attended needs.
  - 1c Old A writes a carry file under the next chart. Cost: one more record that can go stale.
- Q2. When does attended hand over? Only at a chart switch where Drain names a next chart, after outgoing records and span close, every consultant turn collected. Never mid-chart, never when the pass ends (operator lock). A presented round or handoff review is not a switch.
- Q3. Should the operator be asked each time? Pick no: the operator approved it as standing behavior; the footer names the handover. Pitfall: /clear wipes the operator's visible scrollback in claude; removed by chart records and the footer line; cost stated.
- Pitfall: authority leak, a start prompt with the autopilot wording would resume autopilot. Removed by keeping the existing match check unchanged for autopilot and saying an attended start prompt never says "continue autopilot".
- Pitfall: tests/door-reset.test.ts "docs describe the handover entries" pins the strings handover, continue autopilot (handover, handover queued in SKILL.md and shapes.md; keep them.
- Pitfall: fresh A re-reads SKILL.md and assets (about 20k tokens) each switch; still below carried 60-90k excess (F2).

## O8 seat C defaults to pi
- Scope check: the kind question exists only when the door creates panes (SKILL.md Open, questions.md Blind peer exchange). Named panes are used as given, so O8 changes only peer-create.
- Q4. What argv? 4a (pick) kind pi with empty argv, so pi uses its own configured default (~/.pi/agent/settings.json defaultProvider meta, defaultModel muse-wonder-full-1.0-contributor, defaultThinkingLevel high, read 2026-10-26). No model name in the skill to rot. 4b Hardcode the model flags in SKILL.md. Cost: rots on rename, conflicts with the 2026-10-06 chart-cost cut-boundary lock "slot C's model is operator practice at pane start; nothing hard coded".
- Q5. B too? The operator approved C only. 5a (pick) B stays asked; 5b default B codex. Cost of 5a: the kind question still runs for B, so the saving is the fable-C risk, not a turn.
- Pitfall: a machine without pi. peer-create prints a failed start and the turn ends with states reported (existing rule). Nothing new needed.

## O4 one final check per round
- Today: questions.md Blind peer exchange, last paragraph, and SKILL.md Take: each later mechanism or contract change gets one focused check before A records it; restatements exempt. Chains happen: deploy-path ran three final-check briefs (deploy-path-final-brief, -brief2, -brief3), night-flow two per fork (slots listing, 2026-10-26).
- Q6. 6a (pick) All mechanism or contract changes from one operator reply (under autopilot, one pick) go to each peer in one final-shape check; corrections A accepts from that check are recorded without a further check only when they adopt the checker's own stated change; a new mechanism A adds beyond them gets the next check. 6b Batch only, keep a check per later accepted correction. Cost: chains stay.
- Keep: fresh blind notes when a question changes, the one rebuttal against the merge, leaf review. B's study rebuttal: these keep their own triggers.

## Fog / questions the chart does not ask
- Is attended handover for codex and pi As worth it? door-reset supports them; keep same kinds as autopilot.
