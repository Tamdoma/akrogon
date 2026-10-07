# Cut boundary

## Question
Q1. May a peer return a short position for each fork (its choice per question, the evidence, the pitfalls it sees and its disagreements) while A alone writes the formatted operator round, or must each peer keep returning a full formatted round?
Q2. Which model runs slot C?

### Carries
- Lock (operator 2026-10-06, verbatim): "cutting down the costs and optimizing the process without necessarily changing how it works because I I actually do like the new way it works."
- Lock: peers B and C, blind independent work, one fork per round, rebuttal after merge and the operator round shape stay.
- Current rule: skills/chart-issues/assets/questions.md:48 "Each returned peer file is a full round, not a reaction to A."
- Measured: slots/map-merged.md M3 to M7 and the After rebuttals list.
- Related forks, not yet written: one-rendering, peer-packet, plain-first-round, map-research-volume, handoff-script, off-menu-answer, proof-of-saving.

## Findings
- better-than-training · issues/chart/merge-turn/slots and seed-root-cause/slots, measured 2026-10-06 by C · 0-4% of each merged file is wording from a peer file, and a notes-only file is 25-35% the size of a full round · peers' formatting does not reach the operator, so Q1 asks about notes.
- better-than-training · cost-state records in ~/.claude/projects/-home-ivan-Work-infra-akrogon, fitted 2026-10-06 by A · Fable over Opus 5.5: cache write 2.5x, output 2.2x, cache read 1.4x (fit error 0.1% on 24 Fable sessions, 2.3% on 30 Opus sessions); C's seed-root-cause bill is about 43% cache write, 36% output, 20% cache read · about 50% off C's bill on Opus at equal token counts, unmeasured on a real chart.
- practitioner · Anthropic, "Demystifying evals for AI agents", https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents, read 2026-10-06 by B · compare models on the same tasks with cost and quality together · source of option 2b.
- Peer rounds: slots/cut-boundary-A.md, -B.md, -C.md. Merge: slots/cut-boundary-merged.md.
- Rebuttals accepted (slots/cut-boundary-rebuttal-B.md R1 to R5, -C.md R1 to R3): the two-thirds saving is a forecast; the 2.2x ratio was output only and the cache classes were fitted afterwards; 2b is "one chart with only the format change, then the operator decides on cost and quality"; B on another vendor reduces, not removes, shared misses; sizes are per fork file.
- Held: B and C prefer 2b, A recommends 2a.

## Taken
Operator answer 2026-10-06, verbatim: "1 - I'm leaning towards A of course, but it should be blind. It should not be criticizing your inputs as the main agent that I'm working with. | 2a - But don't hard code it anywhere, this is what I will do internally moving forward."

- Q2: operator practice at pane start. No peer model is named in the skill, config or docs, and no leaf comes from Q2 (final check C2).
- Q1: 1a with the blind condition. Focused check: slots/cut-boundary-final-shape.md, slots/cut-boundary-final-check-B.md (no disagreement), slots/cut-boundary-final-check-C.md (C1, C2, C4 accepted).
  1. Each peer returns blind notes per question. A alone writes the formatted operator round.
  2. The peer receives what questions.md:48 lists today and never A's draft, the fork's Findings or the other peer's work.
  3. The note is the peer's own position and not a review of A. Required parts per question: the pick with its reason and cost, each rejected option with the reason, the evidence with tier, source and date, the pitfalls with what removes each, and any question the peer would ask that the fork does not ask.
  4. A merge tag may only cite a line the peer wrote.
  5. Skill edit, one commit (C1): the last sentence of questions.md:48 becomes the note definition with the five parts, SKILL.md:49 says notes where it says rounds, and peer briefs point at questions.md and do not restate the parts.
  6. Baseline for proof-of-saving (C4): full-round peer files of 9.7-10.1KB (C) and 6.7-7.2KB (B) per fork file, and deduplicated C output of 72k tokens on seed-root-cause and 110k on merge-turn.
  7. The rebuttal after the merge and the focused final-shape check stay. The operator's blind condition covers the blind step only (round 2 question 2, answer 2a, 2026-10-06, verbatim: "1 - okay, But we are not hard coding into the Acrogon system any models, so I will just remember to do it when I tell you what slot B should be, okay? | 2a").
- First notes trial, fork peer-effort, 2026-10-06: no saving visible. B took 2.1 minutes and 3.7k output tokens for the full two-question round and 2.1 minutes and 3.6k for one question in notes plus the final check. C took 7.2k output for the full round and 7.9k for the notes turn. File bytes per question rose (B 4.6KB to 5.4KB, C 4.3KB to 6.5KB). The tasks differ, so this is not a clean comparison, and evidence lines are most of each note.
