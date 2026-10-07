# Round writing

Merges the map's K2 one-rendering and K4 plain-first-round: both are about how A writes the operator round.

## Question
Q1. May the peers rebut a compact merged notes file, with A writing the full operator round once, in chat, after the rebuttals? Today A writes the full round into `<fork>-merged.md` for the rebuttal and writes it again in chat.
Q2. Should every operator round be written from the start in the register the operator's `elid` alias asks for, so the operator does not need to ask for a restatement?

### Carries
- Lock (operator 2026-10-06, verbatim): "cutting down the costs and optimizing the process without necessarily changing how it works because I I actually do like the new way it works."
- Lock: peers B and C, blind independent work, one fork per round, rebuttal after merge, the focused final-shape check and the operator round shape stay.
- Taken (forks/cut-boundary.md): peers return blind notes, A alone writes the formatted round, a merge tag may only cite a line the peer wrote.
- Rules today: questions.md:27 fixes the round shape on every harness and effort level. questions.md:50: "A writes the merged file with agreeing-slot attribution", "Each named peer reads only that merged file and returns one disagreement-only rebuttal", "A includes the peer rebuttals under the challenge check in the complete operator round."
- The operator's alias, verbatim from ~/.claude/CLAUDE.md: elid = "Same as eli, but keep the previous response structure. Dumb it down even more and give context to make it easy to make a good and informed decision." eli = "Explain this like I'm 18. Simplify your language. Shorten your response."
- Measured 2026-10-06 by A, Claude transcripts of door sessions, usage deduplicated by message id:
  - A's bill on the two 10-05 akrogon charts splits about evenly: output $3.2 and $4.1, cache read $3.3 and $4.0, cache write $3.7 and $3.9, at a median context of 117k to 139k tokens per call.
  - One operator round is about 1.5k to 2k output tokens. Writing it one time fewer saves about $0.04 per fork at Opus 5.5 prices and about half a minute, roughly 3% of A's bill over a chart.
  - Alias requests (elid, eli, scr, foc) in door sessions: 17 of about 650 operator messages from 09-28 to 10-05, then 17 of 49 in the 10-06 framework door session and one after each of the three rounds of this chart. Each restatement is 1.1k to 2k output tokens plus one more read of the whole context, 6-8% of A's output in the 10-06 sessions.
  - In this chart A wrote rounds 1 and 2 in what it took to be the plain register, and the operator still asked for elid after each.
- Related forks, not yet written: map-research-volume, peer-packet, handoff-script, off-menu-answer, proof-of-saving.

## Findings
- better-than-training · A's transcript 1ce71920 against slots/cut-boundary-merged.md and slots/peer-effort-merged.md, measured 2026-10-06 by C · the chat round shares 46% and 40% of its 8-word sequences with the merged file the peers rebutted · the wording check A wanted to keep with a twice-written round is not real today, so A withdrew its first pick.
- better-than-training · 105 past rebuttal files under issues/chart/*/slots, keyword count 2026-10-06 by C · tags or attribution 59, pitfalls 26, figures 20, research lines 11, wording 32 · most of what rebuttals correct fits in compact merged notes.
- better-than-training · two round and elid-rewrite pairs in A's transcript, measured 2026-10-06 by C · same length (1,076 to 1,074 and 910 to 904 words), door vocabulary cut by two thirds · the rewrite is mostly vocabulary and context. A's rewrites also added a "How to choose" line, which C's rebuttal R1 missed.
- better-than-training · questions.md:3, :6, :10, read 2026-10-06 by C · "plain" appears three times without a definition.
- operator · transcript 0c5414ba lines 416, 763, 775, read 2026-10-06 by B · an earlier restatement request was about missing context (what "planning" meant), not vocabulary alone.
- Measured carries above (A): one round is 1.5k-2k output tokens, about 3% of A's bill; alias requests rose on 10-06.
- Rebuttals accepted (slots/round-writing-rebuttal-B.md R1 to R4, -C.md R1, R2): the compact merge keeps each pitfall's removal step and open questions; the register rules are guidance and keep paths, slot letters and numbers that help decide; the cause of restatement requests on other charts is unmeasured; "kept every figure" is C's measurement only; the "How to choose" line is a shape change the operator accepts or drops; 17 of 49 is all alias kinds.
- Trial 2026-10-06: round 3 was written under the proposed 2a rules and the operator still answered `elid`, naming no sentence. The rules as drafted did not remove the request. The dense Research and Pitfalls lines are A's untested guess at the cause.
- Round 3 took three versions before the operator answered: 1,275 words (with A's notes around it), then 699, then 402. Each was shorter. The operator then pointed at the alias text, which says "Shorten your response".
- Peer notes: slots/round-writing-A.md, -B.md, -C.md. Merge: slots/round-writing-merged.md.

## Taken
Operator answer to round 3, verbatim, 2026-10-06: "1a | 2a - but look at what elid means in your CLAUDE.md global prompt |"

Focused check: slots/round-writing-final-shape.md, slots/round-writing-final-check-B.md (no disagreement), slots/round-writing-final-check-C.md (C1 to C4 accepted).

- Q1: 1a.
  1. The merged file is compact notes: each option with its slot tags, reason and cost, the evidence lines, each pitfall with the step that removes it, open questions and the points where slots differ. Peers rebut that file.
  2. A writes the full operator round once, in chat, after the rebuttals. The tag rule from cut-boundary applies to the chat round.
  3. The record is the merged notes plus the fork's Findings and Taken. No second full-round file is written.
- Q2: 2a, with the rules taken from what the operator's elid alias asks for, written in the skill's own words.
  4. Simpler than explaining to an 18-year-old who does not know the process: everyday words, each process word explained the first time, each actor named by what it does for the operator (C1).
  5. Short: each part says only what the decision needs, keeping every part of the round shape and every number the decision depends on. No fixed word count.
  6. Context for the decision: what the thing is, what changes with each option, and a "How to choose" line when the options trade off.
  7. Structure unchanged otherwise. File names, slot letters and token detail stay in a sentence only when they help the operator decide.
  8. Before sending a round, A reads it once against 4 to 7 and fixes what fails (C4).
  9. The alias asks for shorter, simpler and more context together. Which of the three the operator reacts to is unmeasured (C2).
- Skill edit, one commit: questions.md:50 (merged notes, round written once after the rebuttals) and questions.md:27 (register rules 4 to 8 and the "How to choose" line as a part of the round, shown only when options trade off) (C3).
- Done-criterion, carried to proof-of-saving: restatement requests per round on later charts, against one or more per round on this chart.
- After this fork was taken, three rounds were written under the register rules (map-size, map-size second round, peer-packet). The operator answered the first directly and asked for an elid restatement on the other two. The restated versions differed by: each actor explained in one sentence on first use, everyday words for the mechanism (memory for context, wipe for reset), dollars and minutes with no tokens, and a line saying which answer is the safe one. Carried into the leaf's wording of the register rules and into proof-of-saving.
