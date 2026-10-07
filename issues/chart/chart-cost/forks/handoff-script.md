# Handoff script

The map's K6 (B,C) with M9: handoff grew with 97435f1 (needs sheet, grants, fixture and save proofs, presence check).

## Question
Q1. Does any of the door's handoff work move into a script, and which part?

### Carries
- Lock (operator 2026-10-06, verbatim): "cutting down the costs and optimizing the process without necessarily changing how it works because I I actually do like the new way it works."
- Lock: every proof, the presence check, the grants, the attended handoff review and the mandatory peer review of leaf drafts stay. Reverting 97435f1 is off route (CHART.md).
- Rules today: SKILL.md Handoff gives the presence check as one `bun -e` command run verbatim per draft leaf folder. Proof calls are written per chart, since each chart names different operations. A drafts every brief and design to the scratchpad, each peer reviews them, and only the merged contracts reach issues/open/.
- Measured 2026-10-06 by A, door's own session (Opus 5.5 on both charts), from the operator's last fork answer to the end of handoff:
  - merge-turn: 13 minutes, 37 assistant messages, 47.5k output tokens, about $2.40, 20% of the door's $11.95 for the chart (output $1.07, cache read $0.75, cache write $0.58).
  - seed-root-cause: 6 minutes, 24 messages, 22.0k output tokens, about $1.34, 13% of the door's $10.20.
  - More than half of those output tokens are thinking. Of the visible characters, writing leaf drafts and final leaf files is the bulk: merge-turn wrote 13.5k characters of briefs before peer review and 22.7k characters of briefs again after it, plus an 11.0k design and a 3.1k readiness file.
  - The presence check was 2 calls and 1.4k characters on merge-turn (1.7% of visible characters) and 2 calls and 2.7k characters on seed-root-cause (6.9%). The merge-turn proof command was one call of 682 characters.
  - Peer side of the merge-turn handoff (slots/map-C.md F6): B 5.0 minutes, C 31.4k output tokens.
- Not measured: how much of the thinking goes to proofs and how much to drafts.
- Related fork, not yet written: proof-of-saving.

## Findings
- better-than-training · the door's transcripts for merge-turn and seed-root-cause, measured 2026-10-06 by A · handoff is $2.40 (20%) and $1.34 (13%) of the door's bill; the presence check is 1.7% and 6.9% of visible handoff characters and the proof command one 682-character call; leaf files are written before peer review and again after it (13.5k then 22.7k characters of briefs on merge-turn) · a script has almost nothing to take over, and the repeated writing is the candidate cost.
- better-than-training · skills/chart-issues/SKILL.md:67 and :73-79, src/readiness.ts:87-120, shapes.md:250-256, read 2026-10-06 by B and C · SKILL.md:67 asks for merged contracts to reach issues/open/ and does not ask for a second writing; write order and preflight rules already exist.
- practitioner · Erik S. and Barry Zhang, Anthropic, "Building effective agents", https://www.anthropic.com/engineering/building-effective-agents, read 2026-10-06 by B · add a component only with demonstrated benefit · supports no script.
- Unmeasured: the thinking spent on proofs against drafts, and how much of the second writing was unchanged text.
- Peer notes: slots/handoff-script-A.md, -B.md, -C.md. Merged notes and rebuttal outcome: slots/handoff-script-merged.md.

## Taken
- Operator answer, 2026-10-06, verbatim: "1a | 2a |"
- Q1 = 1a. No handoff script. Every proof, the presence check, the grants and both reviews stay as they are.
- Q2 (raised by all three slots in the notes) = 2a. After peer review A corrects the draft files and moves those files into issues/open/. A does not write the leaf files a second time.
  1. One final scratchpad version per leaf after the exchange, with the changed-line tags and any held disagreement, and that version is the one moved.
  2. Files are transferred by name, state last and prerequisites before dependents, after the existing collision and preflight checks.
  3. Skill edit in the same commit as the other chart-issues edits: the leaf-writing sentence of SKILL.md Handoff says the merged draft files are moved and not rewritten.
- Carried to proof-of-saving: characters of leaf files written before and after peer review, handoff calls and output tokens per chart.
- The round was restated once on the operator's elid request before the answer.
