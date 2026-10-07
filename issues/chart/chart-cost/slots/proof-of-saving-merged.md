# proof-of-saving, merged notes (A, B, C)

Compact notes for one rebuttal each. A writes the operator round once, after the rebuttals.

## Checked after the notes (A, 2026-10-06)
- The `cost-state` record is written when a Claude session ends. The two live sessions of this chart (A, C) have none, 82 of 85 ended sessions in the project have one, and it is a whole-session total. So no recorded dollars exist at handoff, and none per chart when a session spans charts. C's doubt was right. A withdraws "recorded dollars where the harness records them".
- Claude transcripts record effort per call (`"effort":"high"`, 297 records in A's transcript), so model and effort for every seat can be read from transcripts.

## Q1. What does each chart record, when, and who measures?
- 1a (A,B,C): the chart records the link to its sessions at open (per seat: pane, harness kind, session id from `herdr agent list`, open time), and one read-only script under skills/chart-issues/scripts/ reads those transcripts and writes the figures into the chart. No model tokens for parsing. The door reads only a summary.
  - Reason (A,B,C): the link is free at open and has to be searched for later; today's hand measurement cost several dollars of door tokens.
  - When: at handoff, every chart (A,C). After each of the first three charts that follow shipment (B).
  - Where: a Usage block in CHART.md (A). `<chart>/COST.md` with fixed rows (C). In the chart (B).
  - Rows all three name: per seat model and effort, turns, minutes working, output, cache read and write, the map turn on its own line, restatement requests, handoff output.
- 1b: record the session lines only, measure by hand when asked. Rejected (A,B,C): every measurement repeats today's cost.
- 1c: cost tracking in akrogon core. Rejected (C): ties core to two harnesses' private log formats.
- 1d: no record. Rejected (A,B,C).

Where the notes differ inside 1a:
- D1, size of the report. A: per seat totals plus the map turn, compared per operator round. C: also per fork, bounded by brief-file mtimes, and a handoff row. B: per seat and stage, per fork across all seats, elapsed time from the operator's answer to the next round, bytes written before and after draft review, with stage boundaries recorded by A during the chart (estimate 2-4 hours to build, 5-10 minutes of A per chart). A's merged proposal: the script splits the door's transcript at operator messages, which the transcript already marks, and prints one row per operator turn (minutes until the door's reply ended, output per seat inside that window). That gives time between forks with no boundary kept by hand and no mtimes. No per-stage breakdown beyond the map turn and the handoff span.
- D2, restatement requests. C: the script counts operator messages that are exactly `eli`, `elid`, `scr` or `foc`. A: that writes one operator's private aliases into the skill; the door marks which operator turns were restatement requests when it writes the block.
- D3, dollars. C: a dated price table per model id in the script, and asks whether dollars are wanted at all. B: dollars labelled measured, estimated or unmeasured, from an explicitly sourced rate. A: a price table per model id writes models into the akrogon system, which the operator locked out twice on this chart. Merged proposal: tokens by class and minutes only. They are model-neutral, and the operator changes C's model between charts.
- D4, quality beside cost. B: A reviews rounds and contracts for lost decisions and shows defects next to cost; three charts are an observation and not proof of cause; show ranges, not one average. A and C: restatement count is shown as a count and not as a grade. Merged: the block carries the figures and the restatement count; the comparison across three charts is written by the door on request, names model and effort differences, and claims no cause.
- D5, failure. A: a transcript the script cannot read gives "usage unmeasured" with the file and field, and never blocks handoff. C: transcripts pruned later are covered because the figures are written at handoff. B: missing boundaries or counter resets are explicit errors; Claude usage deduplicated by message id, codex read as cumulative differences.
- D6, pane restarted mid-chart (C): the door adds a session line whenever a seat's session id changes; the script accepts several ids per seat. A accepts.
- D7, privacy (B): the script prints ids, times and numbers, never message or tool text. A accepts.
- D8, proof that the script is right (C): done-criterion of the leaf is that it reproduces today's hand figures on seed-root-cause, merge-turn and chart-cost within a stated tolerance, with tokens in place of dollars.

Open questions carried: is a Usage block written when a chart is held or closed without handoff (A)? Are dollars wanted (C)?

## After rebuttals (A, 2026-10-06)
- B R1 accepted: rows split at operator messages are labelled operator turns, never forks. They include restatement and correction turns.
- B R2 kept as the round's second question: tokens and minutes prove less work, not fewer dollars. B's option is a rate the operator supplies, not a table in the script.
- B R3 accepted in part: the handoff review shows this chart's summary next to earlier charts' summaries, with no request needed. Held as B's disagreement: a review of rounds and contracts for lost decisions on every chart, shown beside the figures. A leaves it out because it costs model work per chart and the peer leaf review already checks contracts. The block claims nothing about quality.
- B R4 accepted: done-criterion is small fixtures with independently known totals (duplicate Claude blocks, cumulative codex counters, counter reset, missing session) matching exactly, then reproduction of this chart's hand figures.
- C R1 held for leaf review: C wants restatement words recorded per chart at open and counted by the script. A's changed proposal: the door notes each restatement request in the fork file when it records that fork's answer, so nothing is recalled at handoff. Both give an exact count.
- A's open question folded into 1a: the script runs when the chart ends, with any marker (handed off, held or closed).
