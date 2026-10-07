# Design: peer-notes-single-writing

## Binding decisions, verbatim

### cut-boundary (issues/chart/chart-cost/forks/cut-boundary.md)
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

### round-writing (issues/chart/chart-cost/forks/round-writing.md)
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

### peer-packet (issues/chart/chart-cost/forks/peer-packet.md)
- Operator answer, 2026-10-06, verbatim: "1a | 2a |"
- Q1 = 1a. A hands every peer task as a brief file with a one-line prompt that names the file and the slot letter.
  1. The brief is finished before the prompt is sent and is not edited during the exchange. A new exchange gets a new brief or a new return path.
  2. The brief uses absolute paths and holds what questions.md:48 lists for that exchange, with the exact return path.
  3. Briefs live under `<chart>/slots/` and stay in the chart. Before the chart folder exists the temporary-path rule of questions.md:46 applies and the map briefs move into slots/ with the maps.
  4. The confirmed-start check and the rule against automatic re-prompting stay.
  5. Skill edit in the same commit as the other questions.md edits: questions.md:44 to :48 say the task travels in a brief file.
  6. Held for leaf review: whether the one-line prompt also repeats the return path (B, per questions.md:46) or the brief alone carries it (C).
- Q2 = 2a. No new mechanism. Each peer keeps one session per chart with its harness's own compaction. No skill edit and no leaf.
- Carried to proof-of-saving: cache read share of each peer's bill and B's input tokens per turn, per chart.
- The round was restated once on the operator's elid request before the answer.

### handoff-script (issues/chart/chart-cost/forks/handoff-script.md)
- Operator answer, 2026-10-06, verbatim: "1a | 2a |"
- Q1 = 1a. No handoff script. Every proof, the presence check, the grants and both reviews stay as they are.
- Q2 (raised by all three slots in the notes) = 2a. After peer review A corrects the draft files and moves those files into issues/open/. A does not write the leaf files a second time.
  1. One final scratchpad version per leaf after the exchange, with the changed-line tags and any held disagreement, and that version is the one moved.
  2. Files are transferred by name, state last and prerequisites before dependents, after the existing collision and preflight checks.
  3. Skill edit in the same commit as the other chart-issues edits: the leaf-writing sentence of SKILL.md Handoff says the merged draft files are moved and not rewritten.
- Carried to proof-of-saving: characters of leaf files written before and after peer review, handoff calls and output tokens per chart.
- The round was restated once on the operator's elid request before the answer.

### Exclusions
- peer-effort (forks/peer-effort.md): slot B's effort is operator practice at pane start. Nothing from it enters this leaf.
- cut-boundary Q2: slot C's model is operator practice at pane start. Nothing from it enters this leaf.
- map-size (forks/map-size.md): no change to the map rule. The opening-map sentence in questions.md stays as it is.
- peer-packet Q2: no context reset or new-session mechanism.
- handoff-script Q1: no script for handoff work.
- proof-of-saving (forks/proof-of-saving.md): owned by the leaf chart-usage-table. This leaf adds no measurement.
- Line numbers in the decisions refer to the files at commit 3ce2085. The done-criteria name each sentence by its words.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: the change is skill and guide prose, with no auth, secrets, backend state or runtime behavior, so those lines do not apply. No test is added for wording: the criteria are judged by reading the changed paragraphs for the stated substance, and the existing `test` check proves only that guide links and the shapes example still hold. No vanity test, no mock and no outside call. Leaf work is agent-owned and needs no operator step.

## Leaf architecture
- Owned surfaces: `skills/chart-issues/SKILL.md` (Take, the named-peers sentence; Handoff, the leaf-writing sentence), `skills/chart-issues/assets/questions.md` (round template, the paragraph after it, Blind peer exchange), `docs/guide/chart.md` (peer paragraphs), and `skills/AREA.md` and `README.md` only for a sentence describing the peer exchange.
- The installed skill at ~/.claude/skills/chart-issues is a link to this repository's main checkout, so the text is live on merge with no install step.
- Sentence edits in place. No new heading in SKILL.md or questions.md, and the template gains only the "How to choose" line.
- The sibling leaf chart-usage-table also edits SKILL.md and shapes.md, in other sentences. Neither leaf waits on the other.
- Settled in the peers' leaf review (A,B,C), slots/leaf-review-B.md D1 and slots/leaf-review-C.md H1: the brief alone carries the exact absolute return path. The one-line prompt names the brief's absolute path and the slot letter and tells the peer to follow the brief. The return path is not repeated in the prompt, because two copies can disagree. The confirmed-start and fresh-return-path rules stay.
- Dollars in a round (C, leaf review F3): the sibling leaf puts no price or rate into the skill, so a round states dollars only where a recorded figure exists.
- Exclusions: `src/`, `tests/`, `skills/chart-issues/scripts/`, other skills, config and `issues/`.
