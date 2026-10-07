# Slot C notes, fork map-size, 2026-10-06

Blind notes. Read: INTAKE.md, forks/map-size.md, SKILL.md:37, questions.md:36-40 and :48. Own measurements 2026-10-06 on the map files of seed-root-cause, merge-turn and chart-cost (bytes per section, outside URLs and their reuse in that chart's fork files, 8-word overlap with map-merged.md).

## Q1. What bounds the opening map each seat writes before the first fork?

Options I name:
- 1a. Bound by content. The map is notes in four parts, one line per item: forks (what the fork decides and why it changes the outcome), measured findings that pick or order forks (number, source, method), lifetime pitfalls (each with the fork that owns it), practitioner questions. Plus what was not measured. Excluded by name: options per fork, option prose, research synthesis, tables. Outside research is deferred to the fork that needs it; the map may name who the practitioners are in one line.
- 1b. Bound by size. A byte or token cap on each map file, checked by peer-wait or by A.
- 1c. Bound by research only. No outside sources in the map, everything else as today.
- 1d. No bound, as today ("proportional", SKILL.md:37, undefined).

1. Pick: 1a.
   One reason: the part of the map that is paid for and never used is the per-fork option prose, and only a content rule removes it. In C's maps the forks section is 43% of seed-root-cause (5.9 of 13.9KB) and 42% of merge-turn (11.9 of 28.5KB); every fork round then rebuilds its options from scratch (merged fork files share 0-4% of 8-word sequences with any peer file, my cut-boundary N2), and the map's text stays in the peer's context for every later turn of the session (Carries). SKILL.md:37 asks the map for "what each option could break or invite later", which is what produces that section; 1a moves that sentence to the fork rounds, where it is already answered.
   Cost: the map no longer carries worked options, so the first fork round starts from the fork's one line and the intake, not from pre-written options. If the map's option prose was speeding up the first fork, that is lost; unmeasured. Expected saving per chart is the forks-section share of each peer map turn plus its cache-read tail, order of 40% of the map turn's output; unmeasured until proof-of-saving.

2. Rejected:
   - 1b: a cap bounds bytes, not work. The chart-cost maps hit 34.2KB and 21.5KB with zero outside sources, mostly tables (33 and 23 table rows). Under a cap a peer cuts citations and method lines first, which are the parts A's merge uses; and a cap is a format check on a probabilistic writer, so it fails or is gamed rather than bounding thought. Keep bytes as a measurement in proof-of-saving, not as a rule.
   - 1c: outside research is not what made the maps large. URLs: 4-5 and 3 (seed-root-cause), 10-11 (merge-turn), 0 (chart-cost, the largest B map). Where it existed, 7 of 11 (B) and 4 of 10 (C) of merge-turn's map URLs were reused in that chart's fork files, so it was not wasted either. Bounding it alone leaves the forks section and the tables.
   - 1d: C's map turn was 62% of C's bill through round 3 (Carries) and the operator reads a merged map of 4.5-6.7KB built from 8-34KB per peer.

3. Evidence:
   - Tier better-than-training. Source: issues/chart/{seed-root-cause,merge-turn,chart-cost}/slots/map-{A,B,C}.md and map-merged.md, measured 2026-10-06 by C. Finding: section bytes in C's maps as in the pick; A's own maps 7.1, 6.0 and 2.7KB; merged maps share 0-2% of 8-word sequences with any peer map, so A writes the merged map from the findings, not the text.
   - Tier better-than-training. Source: same slots folders, outside URLs counted and matched against each chart's fork files, 2026-10-06 by C. Finding: as in 1c rejected. Research in the map is partly reused; option prose is not.
   - Tier better-than-training. Source: skills/chart-issues/SKILL.md:37, read 2026-10-06 by C. Finding: the map rule asks for forks, practitioner questions, pitfalls and "what each option could break or invite later". The last clause is the only part of the rule that requires options to exist at map time. "Proportional" has no referent.
   - Tier better-than-training. Source: skills/chart-issues/assets/questions.md:40 and SKILL.md:47, read 2026-10-06 by C. Finding: research "precedes every question" and "is redone when an operator answer reshapes the question". Options and their research belong to the fork round by the skill's own rule, so the map's option prose is a second copy by design.
   - Tier better-than-training. Source: forks/map-size.md Carries, A's measurement. Finding: C map turn 41.6k output, $6.9, 62% of C's bill through round 3; B 18.6k output against 3.6k per fork turn.
   - Tier practitioner: not searched. The bound is on this door's own artefact and the door's files are the stronger source.

4. Pitfalls:
   - Peers write the options anyway under "findings" or "pitfalls". Removed by: 1a names the excluded parts, the four parts are one line per item, and A's merge tags only lines in those parts, so option prose earns no tag and the peer learns it is unread. Probe in proof-of-saving: map bytes and map-turn output tokens per peer per chart, against 8.6-34.2KB and 18.6-41.6k today.
   - A fork is missed because no one explored options at map time. Removed by: the fork line must state what the fork decides and why it changes the outcome; a fork that cannot be stated in one line is fog, which the map already records. Options are built in the fork round, where the operator's answers to earlier forks are known, which the map never has.
   - Tables of raw numbers come back as "measured findings". My chart-cost map carried token tables that double-counted transcript lines and A had to correct them. Removed by: a finding is one line with the number, the source path and the method, so a wrong method is visible in the line, and tables are excluded by name.
   - The map's context still sits in each peer session for every later turn. 1a shrinks it but does not remove it. Removed by: the peer-packet fork (fresh context or bounded packet per fork), not this one; noted so 1a is not expected to fix M7.
   - "Proportional" stays in SKILL.md:37 next to the new rule and the two are read as a contradiction. Removed by: the skill edit replaces "proportional" with the four-part bound and moves "what each option could break or invite later" to the fork round sentence.

5. Missing question: does the operator read the peer maps or only A's merged map? If only the merged map (4.5-6.7KB), the peers' map notes have one reader, A, and the bound can be set to what A's merge actually uses: findings with sources, fork lines, pitfalls. The fork assumes the merged map is the operator's surface but does not ask.

## Not measured
- How much of the map's option prose shortened the first fork round, if at all.
- B's section split; I measured C's sections and B's totals, URLs and table rows only.
- The saving of 1a in tokens; the forks-section byte share is the proxy.
