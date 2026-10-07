# handoff-script, merged notes (A, B, C)

Q1. Does any of the door's handoff work move into a script, and which part?

Options
- O1 (A,B,C) No script. The fork closes with the measurement on record.
  - Reason: the scriptable part is small. The presence check is 2 calls and 1.4-2.7k characters per chart (1.7% and 6.9% of visible handoff characters) and the proof command was one 682-character call. At Opus output prices that is under $0.10 per chart (C). The check is already one fixed line that imports the live readiness code (C). Those shares are of visible characters and not of tokens, dollars or time (B).
  - Cost: handoff stays the largest single span of the door (A). A chart with many leaves pays one presence call per leaf (C).
- O2 A presence-check script that loops over draft folders. Rejected (A,B,C): saves at most one call per extra leaf, and adds a file that must track src/readiness.ts and src/config.ts.
- O3 A proof runner. Rejected (A,C): proofs differ per chart, so the runner is the same call text written to a file first.
- O4 A script that writes or publishes the leaf files. Rejected (B,C): it adds an input contract and recovery rules, or bypasses the attended review and peer exchange.

A second question the notes raise (A carry, B pick, C missing question)
Q2. After peer review, does A edit the reviewed draft files and move them into issues/open/, or write the leaf files again?

- O5 (B; A and C raise it) Edit and move. A applies the peer corrections to the scratchpad drafts, with the changed-line tags and any held disagreement, and transfers those files with ordinary file operations. Contract files are transferred by name, state last, prerequisites before dependents, after the existing collision and preflight checks (B).
  - Reason: the measured waste in handoff is writing twice. merge-turn wrote 13.5k characters of briefs before review and 22.7k after. The second writing is about 6k output tokens on that chart (C), and moving the reviewed text removes the gap between what peers reviewed and what ships (C). SKILL.md:67 asks for merged contracts to reach issues/open/ and does not ask for a second writing (B).
  - Cost: care that the moved file is the final consensus version (B). The saving is unproven, since not all of the second writing was unchanged text, and more than half of handoff output is thinking of unknown split (B).
- O6 Leave it to A's habit and only measure it in proof-of-saving (A's first position).
- Where slots differ: A carried this to proof-of-saving as a practice to measure with no rule change. B makes it the pick. C asks it as a question and has not measured how far shipped files differ from reviewed drafts.

Evidence
- better-than-training · the door's transcripts for merge-turn and seed-root-cause, measured 2026-10-06 by A · handoff $2.40 (20% of the door's bill) and $1.34 (13%); drafts and final files are the bulk of visible characters; presence check 1.7% and 6.9%.
- better-than-training · skills/chart-issues/SKILL.md:67 and :73-79, src/readiness.ts:87-120, shapes.md:250-256, read 2026-10-06 by B and C · the presence check proves named inputs exist and nothing more; write order and preflight rules already exist.
- practitioner · Erik S. and Barry Zhang, Anthropic, "Building effective agents", https://www.anthropic.com/engineering/building-effective-agents, read 2026-10-06 by B · add a component only with demonstrated benefit · supports no script.
- Unmeasured: thinking spent on proofs against drafts; how much of the second writing was unchanged.

Pitfalls and what removes each
- An early draft is moved and corrections are lost. Removed by one final scratchpad version per leaf after the exchange, and moving that one (B).
- A whole draft folder is copied and a premature state file appears. Removed by transferring files by name with state last (B).
- A clean presence result read as proof that grants work. Removed by the lock: every real proof and review stays (B,C).
- A later chart with many leaves makes the check slow. Removed by proof-of-saving recording handoff calls and characters per chart, with O2 written then against a number (C).
- The small check being dropped as not worth running. Removed by the lock (C).

## After rebuttals
- B R1 to R3 accepted (slots/handoff-script-rebuttal-B.md). "Under $0.10 per chart" is C's estimate for the visible presence and proof calls at Opus output prices. The thinking spent on them is unmeasured, so it is no upper bound on all scriptable cost (R1). Writing before and after review is the measured behaviour; how much of the second writing is avoidable is unmeasured, so repeated writing is a candidate cost (R2). Recording calls and characters helps decide a later script and does not remove the risk of a slow check on a chart with many leaves (R3).
- C R1 accepted: C holds O5. A joins O5 as well, because moving the reviewed file also removes the chance that the shipped text differs from what the peers reviewed.
- Options as shown to the operator: Q1 no script (A,B,C). Q2 edit and move the reviewed drafts (A,B,C), or leave it as today.
