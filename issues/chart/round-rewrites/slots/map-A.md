# Map A: round-rewrites

Written before reading slots/map-B.md. "Checked" means A ran the script or read the cited lines itself on 2026-11-11. Scripts: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/5f8592c2-2715-4043-90a4-b9db5148124a/scratchpad/rr/{pairs.py,cuts.py}`, output `chains.json` and one file per round chain under `chains/`.

## 1. Measurement (checked)

Method. 28 claude door transcripts (the 27 of the survey reader plus this session's 846b5690). A "round" is the last assistant text before an operator message that holds both `1a` and `1b` and more than 300 characters. The operator message after it is an alias (exact `eli`/`elid`/`scr`/`foc`/`ref`), an alias with more words, a short clarify request, an answer (holds a label like `1a`), or other. A chain runs from the round to the answer. Compaction summaries and pasted content are excluded as operator messages (the first pass counted two summaries as answers; fixed). Limits: codex and pi doors are not read; a round answered in free text without a label counts as "other" (25 chains, left out); the label test also catches handoff reviews and signposts rounds, which is intended.

- 107 chains, 82 ended in an answer. 18 answered as first written (22%), 64 after one or more clarify messages (78%): 52 after one, 10 after two, 2 after more.
- All 85 alias messages are `elid`. 9 further clarify messages are free text.
- Length. First draft answered directly: median 459 words. First draft that got rewritten: median 671.5. The rewrite that was answered: median 458.5 (quartiles 342 to 634, the same as the direct ones, 342 to 598). 92% of rewrites are shorter, median ratio 0.71.
- Direct answers by first-draft length: under 500 words 11 of 25; 500 to 800 words 6 of 39; over 800 words 1 of 18.
- Parts. First drafts with a Research line, a Pitfalls line and a Challenge check: 2 of 31 answered directly (median 764 words). First drafts with none of the three: 14 of 31 (median 458). Inside the long rounds (500+ words) the Research line alone does not separate: 1 of 29 with, 6 of 28 without.
- Word budget (means). Rewritten first draft: 697 words, of which the three record parts 147 and the footer 25. Answered rewrite: 489, record parts 58. Direct: 498, record parts 65. A first draft with all three parts: 806 words, 278 of them (35%) in those parts, 497 in the rest. So a rewrite takes about 90 words from the record parts and about 120 from the questions and options.
- What a rewrite drops: Research line 29 → 13 of 64, Pitfalls 32 → 16, Challenge check 47 → 35, file paths median 2 → 0, backticked names 9.5 → 5, words after the reply key 68 → 33.5. It does not move the reply key to the end (last line is the reply key in 1 of 64 first drafts and 2 of 64 rewrites).
- Short rounds are rewritten too: 14 of 25 under 500 words got `elid`, and those rewrites went shorter again (for example 353 → 244, 443 → 303, 423 → 280).
- Sessions differ: 4a3df037 (W45) 1 direct of 19; 6fa8e51c (W43) 5 of 18; bf6c9fb4 4 of 6; c954dd5e 3 of 4.
- Timing, from the round's log time to the operator's message: direct answer median 139 s; first `elid` median 106 s, 16 of 62 within 30 s and 24 within 60 s; answer after the rewrite median 75 s. A 670-word round takes about 2.7 minutes at 250 words a minute, so about 4 in 10 aliases came before the first draft could have been read through. Limit: the log time is the end of the text block, so reading during streaming is not counted.
- This session's rounds, written "at the elid level": 1252, 757, 977, 1214, 606 and 837 words. Plain words, still 1.3 to 2.7 times the size the operator answers.
- Qualitative pair 066 (2026-11-11, 757 → 618 words, answered 54 s after the rewrite): the rewrite explains two terms ("link file" → "pointer file", what the shared file is), adds a "pick 1a unless" line, and drops usage, route and existing-parts lines. A Haiku classification of 21 pairs is running; its totals go into the merged map.

## 2. Candidate causes, ranked

- C1 Too much text for one decision. For: the answered size is the same whether direct or rewritten (about 460 words); the direct rate falls from 44% under 500 words to 6% over 800; 92% of rewrites are shorter. Against: half of the short rounds are still rewritten.
- C2 The round shape makes C1 certain. questions.md requires eight parts "on every harness and at every effort level", and Handoff adds one information line per leaf and the usage lines. With all three record parts a round averages 806 words, above anything the operator answers directly (1 of 18 over 800). The record parts serve the audit and already live in the fork file ("its fork file keeps the full return under Findings"). For: 2 of 31 full-shape rounds answered directly. Against: the rest of the round (497 words) is also above the answered size, so dropping the parts alone does not reach it.
- C3 A fixed second step. The operator skims the first draft and decides on the second read. For: 16 of 62 aliases within 30 s; the answer follows the rewrite in a median 75 s; one session aliased 18 of 19 rounds at any length; `elid` asks for "even more", which no first draft can pre-empt. Against: the rate depends on length, and three sessions answered most rounds directly.
- C4 Unexplained process words. For: pair 066; the register rule's own check ("A reads it once against these rules") is run by the writer, who cannot see which words are unknown. Against: not measured yet; the classification sample will say.
- C5 Order. The operator's standing instructions say "I always see the last thing you write first", and a round ends with the Challenge check and the footer. For: 68 words after the reply key in rewritten first drafts against 24.5 in direct ones. Against: rewrites do not fix the order and are answered anyway.
- C6 Fork content. Against: the direct rate does not follow question count (1 question 1 of 13, 2 questions 7 of 21, 5 questions 3 of 4).

Ranking: C1 with C2 as its mechanism, then C3, then C4. C5 and C6 are weak. What separates C1 from C3: the operator's own account, which is the highest research tier and costs one question; and the direct rate of first drafts under 500 words without record parts in later sessions (today 11 of 25).

## 3. Rule texts that pull against each other

- questions.md: "Every round uses this shape, on every harness and at every effort level: the opening paragraph, the sentences under each question, the research line, the labelled recommendation with its reason, the how-to-choose line only when the options trade off, the pitfalls-avoided line, the reply key and the challenge check."
- questions.md: "each part saying only what the decision needs while every part of the round and every number the decision depends on stays".
- questions.md: "A small round keeps the parts that carry the decision, the reply key and the challenge check." (no test for "small")
- SKILL.md Handoff: the review shows tree, scope, repo, choices, grants, seats, the route question, the usage lines, one live-run line and one key-part line per leaf.
- Operator, /home/ivan/.claude/CLAUDE.md: "Talk to me like I'm 18. Simplify your language. Make your response short and concise."; "I always see the last thing you write first. Place the most important information there."; "Match the level of detail to the level of task and request."; `elid`: "keep the previous response structure. Dumb it down even more and give context to make it easy to make a good and informed decision."
- The register rule governs words; no rule governs how much the operator must read to decide. The shape rule adds parts; the operator's instructions ask for less.

## 4. Material forks

- F1 Cause, asked of the operator: what does `elid` give you that the first draft lacks? Options: too much to read (C1/C2); words and background I do not know (C4); I always decide on the second, simpler pass (C3). More than one may hold. Pick: ask it first; it reshapes every later fork. Cost: one round.
- F2 What the operator sees. (a) The round shows only what the decision needs (question, context, options, recommendation, how to choose, reply key); the Research line, the Pitfalls line, the Challenge check and peer rebuttals are written to the fork file as today and the round names that file in one line. (b) All parts stay on screen, the record parts after the reply key. (c) No change. Later risk of (a): a peer's standing disagreement goes unseen, so a disagreement that would change the pick has to stay on screen in one line. Pick (a): one level of deferral, fewer words by removing a duplicate, no step removed (signpost 2c keeps every step; the parts are still produced).
- F3 Size. The operator declined prose caps on 2026-10-26 (door-cost O6), binding under 7a. New number since: 1 of 18 rounds over 800 words answered directly, and answered texts sit at about 460 words. Listed, not reopened.
- F4 The loop is open: the door never sees its own rewrite rate. `chart-usage.ts` already prints operator turns and wait; a count of rounds and of rounds answered as first written beside it closes the loop and gives the before/after number signpost 3a asks for. Pick: yes, as its own leaf, because it measures any change from F2.
- F5 If the operator says the second pass is fixed (C3): no round change removes it; the outcome is the cheaper second pass or none, and the chart narrows to F4 or closes.

## 5. Evidence per fork

- F1/F2 cost today: 64 of 82 answered rounds needed a rewrite; 123,472 output tokens for 132 alias rewrites in the survey reader (factory-wins map, A reader, 2026-11-10); operator wait on a rewritten round is the alias delay plus the rewrite plus the second read.
- F2 outside sources (read 2026-11-11, quotes verified by A). Jakob Nielsen, NN/g, "Progressive Disclosure", 2006-12-03, https://www.nngroup.com/articles/progressive-disclosure/: "Initially, show users only a few of the most important options"; "You must get the right split between initial and secondary features"; "designs that go beyond 2 disclosure levels typically have low usability". Jakob Nielsen, NN/g, "How Little Do Users Read?", 2008-05-05, https://www.nngroup.com/articles/how-little-do-users-read/: "users have time to read at most 28% of the words during an average visit"; "they spend only 4.4 seconds more for each additional 100 words" (naturalistic browser logs, no eye tracking, web pages and not decision requests). Michael Nygard, "Documenting Architecture Decisions", 2011-11-15, https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions: "The whole document should be one or two pages long" (a record of a decision made, not a request for one). Where they flip: detail goes up front when the reader must check the evidence before acting; an approval of a grant or a paid call is such a case.
- Not usable: the BLUF rule in Army Regulation 25-50, the Amazon six-page memo, agent approval guidance from named teams and the email-length studies were found only as search snippets (Haiku helper, 2026-11-11). No named-team guidance on agent question length was found. Choice-overload results conflict and are not cited.
- F4: no number yet beyond this reader; the leaf's own output is the number.

## 6. Practitioner questions and pitfalls

- Does the operator want the record parts at all on screen, or only on request? Asked in F2.
- Does a shorter round hide a risk the operator would have caught? Removed by keeping any consultant disagreement that changes the pick on screen, and by the fork file keeping every part.
- A count turned into a target makes doors write short rounds that leave things out. Removed by counting only, with no gate and no cap (O6 stays).
- The alias list lives in the operator's private instructions, not in akrogon. A counter must not depend on that file: it counts an operator message that follows a round and holds no answer label.
- The change lands in a skill, so doors get it at the next release link only.

## 7. Proof

"Answered as first written" is the operator's behaviour and cannot be a leaf's done-criterion. What a leaf can show: on a recorded door transcript the usage output prints rounds and rounds answered as first written, matching a hand count; and a round written under the new shape from a recorded fork holds the decision parts and names the fork file for the rest. The outcome itself is read from later charts' usage lines. No outside operation and no paid run is needed. Pre-existing parts to observe before handoff: `chart-usage.ts` reading claude, codex and pi transcripts, and the operator-turn detection it already has.

## 8. Split

One chart, at most two leaves: the round view (questions.md, and SKILL.md Handoff if the review lines move) and the count in `chart-usage.ts`. They are parallel. Nothing is proposed before F1 is answered.
