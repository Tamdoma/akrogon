# Merged map and fork notes: token-spend

Sources: slots/map-A.md, map-B.md, map-C.md (blind, same intake and locks L1-L3). Tags name the slots whose own lines say it.

## System
- Spend = Σ seats calls x context at each call; a needless call costs the seat's whole stock, a removed token saves itself times the calls left before the next drain (A,B,C).
- Stocks: A floor 58k, drains only by compaction at `autoCompactWindow` 250k to 65-70k (A,B,C); A is 51-87% of a chart's spend (B,C). B floor 20.7k, C (pi) floor 6k; consultants drain by restart at chart entry, already built, −46..−57% for codex (A,B,C). Disk records are free until read (A,B,C).
- Inflows to A: process-text reads 28.5%, consultant returns 27.4%, other reads 27.3%, orchestration 10.3% of tool-result text; A's own written records re-enter as tool input; compaction restores skills and recent files (A,B,C).
- Reinforcing: plumbing tax, each mechanical exchange step is a full-stock A call (A R1, C R3, B R3); verbose in/out and return multiplication (A R3, C R2); warm rebuttal tax (A R4, C R1); compaction amnesia/restore inflation (A R2, B R1/R4, C R5); safety-read loop, whole-file reads feel safe (C R6); fresh-session re-read eats restart gains (C R4).
- Balancing: compaction, late and weakened by restores (A,B,C); per-chart consultant restart (A,B,C); read-once rule binds A only (A,C). Missing: stage gating for consultants (A,C), spend feedback only at handoff (A,B,C).
- Not a lever here: door-reset (A drain between handed autopilot charts) is owned by the handed-off leaf; attended A resets contradict the operator's door-handover scope (B,C).

## Levers (numbers per chart, overlapping, not additive)
- K-reads. Consultant reading rule: stage-scoped process text by section name, locate before reading, batch independent reads with bounded output, read an unchanged file once per session. 0.3-0.6M staged text + 0.5-0.9M pi call discipline (old pi model; re-measure) (A LP2, B K2, C LP3/LP8). Pitfalls: range rot, so name sections not line numbers (B,C); narrow slice hides a rule, so the full source stays allowed when it is the subject (B,C).
- K-calls. Fewer A transport calls: peer-ask absorbs the pre-prompt `herdr agent wait` (questions.md requires it as separate A calls today; peer-ask.ts has none) and prints what the seat record needs, so one A call goes from idle to collected returns for all peers. Sensitivity 0.6-1.6M per 5-10 calls removed (B K3); 5-15% of A (A LP1, C LP4). Pitfalls: every stop, refusal, budget and blocked outcome stays where A sees it today (A,B,C); longer single calls must stay under the harness command timeout (C).
- K-output. Project herdr JSON to the chart's panes and needed fields after discovery, errors verbatim; bounded search output. about 1% of A per event (B 0.87% measured, C 0.9-1.5% per roster dump), 1-3% per chart (A LP6, B K5, C LP6).
- K-restore. After compaction, read only what the restored copy lacks (SKILL.md:6 says re-read the file and its references after compaction; the restore holds a 20k-char prefix; prefix match must compare content, since skills changed mid-session (C)). 347k on door-handover, 1.45% of A (B K6, C LP7a). Restore selection itself is harness-owned and unverified (B,C).
- K-rebuttal. Fresh-session rebuttal reading own notes + merged: ~0.4-0.9M per pair (A LP3, B K4, C LP2). L2 unproven: the 78/81 disagreement base rate (issues/chart/chart-cost/CHART.md) makes a thinner rebuttal a quality cut (C); needs a paired trial with a deliberately distorted merge (B).
- K-floor. Hide unused skills from the model listing (`skillOverrides` "user-invocable-only" keeps slash commands; docs via subagent), connectors off, codex skills list off: ~5% A, ~5% codex (A LP4, B K7, C FK4). Lives in the operator's machine settings or seat argv, outside a repo leaf (A,B); C proposes a measurement leaf first. Settings mechanisms from A's docs lookup, not B's K7 (A).
- K-compact. Lower compaction window: no defensible estimate, global setting, more compactions feed restore inflation (A,B,C).
- K-gauge. Run chart-usage at each fork close for in-chart feedback; no direct saving, costs A calls (C LP5); no recurring dashboard or new round (B R5).
- Goal guard. Acceptance is less total spend for the same completed chart with the same material findings (B K1); no work moved to uncounted subagents and called a saving (C PF4); keep prefixes byte-stable so token cuts do not raise cache writes (C PQ3/PF6).

## Proof standard
- Same-shape before/after with model, effort, harness version and session boundaries named; count every seat's calls and average context (A,B,C). Thinking-reviewer parity of findings, not exact prose (B V3).
- A cost criterion names the structural work removed (shapes.md) (A).

## Where slots differ
- K-rebuttal: B keeps warm now and leaves funding a separate trial to A; C trial first then adopt on a clean diff; A open.
- K-gauge: C proposes fork-close runs; B rules out recurring in-chart dashboards; A open.
- K-floor: C proposes a measurement leaf first; B recommends repo-first, scoped runtime work only after a feasibility proof; A open.
- Orchestration share: INTAKE window 24% of A (A); C's upper bound ~40%; B calls the figure a ceiling, not removable spend.

## Rebuttals
- levers-rebuttal-B.md F1-F6, levers-rebuttal-C.md D1-D5; tag and bound corrections above applied from B F6, C D1, C D4.
