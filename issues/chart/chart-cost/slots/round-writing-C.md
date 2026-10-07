# Slot C notes, fork round-writing, 2026-10-06

Blind notes. Read: INTAKE.md, forks/round-writing.md, questions.md:3-27 and :50. Own measurements on this chart's slots/ files, all 105 past `*-rebuttal-B.md` and `*-rebuttal-C.md` files under issues/chart/*/slots, and A's transcript for this chart (1ce71920, usage and text deduplicated by message id), 2026-10-06.

## Q1. Peers rebut a compact merged notes file, A writes the full round once in chat?

Options I name:
- 1a. Merged file becomes compact notes: per question, the pick and the rejected options each with slot tags, the evidence lines, the pitfalls with their removal, and each point where slots differ. Peers rebut that. A writes the operator round once, in chat, after the rebuttals. The compact file plus the fork's Findings are the record.
- 1b. As today: full round in `<fork>-merged.md`, rebuttals, full round again in chat.
- 1c. Full round written once into `<fork>-merged.md`, chat carries only the opening paragraph and the reply key with a pointer to the file. Rejected below.

1. Pick: 1a.
   One reason: the merged file exists for two readers, the peers and the record, and both are served by the compact form. Of 105 past peer rebuttal files, 59 dispute tags or attribution, 26 pitfalls lines, 20 figures, 11 research lines (keyword count, files overlap). All four live in the notes. The formatted prose around them is written for the operator, who never reads the merged file.
   Cost: $0.04 and half a minute per fork, about 3% of A's bill (Carries). This fork's Q1 is small money. Its value is removing a second copy, not the dollars. The real cost of 1a: the peers never see the operator-facing wording before the operator does. Today they do not either in practice, see Evidence: the chat round shares only 40-46% of its 8-word sequences with the merged file the peers checked, so A already rewrites after the rebuttal and that rewrite is unchecked.

2. Rejected:
   - 1b: pays for a second full writing whose text differs from the checked one by more than half (Evidence), so the "peers checked the round" guarantee it seems to give is not real today.
   - 1c: changes what the operator sees in chat, which the lock forbids, and the operator reads the pane, not files.

3. Evidence:
   - Tier better-than-training. Source: issues/chart/*/slots/*-rebuttal-[BC].md, 105 files, read 2026-10-06 by C. Finding: keyword hits per file, tag or attribution 59, pitfalls 26, figures with units 20, wording ("should read", "reads", "register") 32, research line 11. The wording disputes are the only class the compact form weakens, and most of them in my own rebuttals were about a figure or a tag inside a sentence, not the register.
   - Tier better-than-training. Source: A's transcript 1ce71920 against slots/cut-boundary-merged.md and slots/peer-effort-merged.md, 8-word sequence overlap, measured 2026-10-06 by C. Finding: the chat round that the operator read shares 46% (cut-boundary) and 40% (peer-effort) of its 8-word sequences with the merged file the peers rebutted. More than half of the operator-facing text is already written after the rebuttal, unchecked.
   - Tier better-than-training. Source: forks/round-writing.md Carries, A's dedup measurement. Finding: one round is 1.5-2k output tokens, $0.04 per fork, 3% of A's bill over a chart.
   - Tier better-than-training. Source: skills/chart-issues/assets/questions.md:50, read 2026-10-06 by C. Finding: the rule says A "writes the merged file with agreeing-slot attribution" and peers read "only that merged file". It does not say the merged file is the formatted round. 1a fits the sentence; only the practice changes. SKILL.md:49 "merges the completed independent rounds" becomes "notes" under cut-boundary's Taken anyway.

4. Pitfalls:
   - A's post-rebuttal chat round misstates a peer and no one catches it before the operator. Removed by: the cut-boundary tag rule (a tag may only cite a line the peer wrote) applied to the chat round as well as the merged file, and the focused final-shape check (lock) for anything the operator's answer then changes. Probe for proof-of-saving: per chart, count rebuttal points that were about wording of the merged file, before and after 1a, to see whether the lost check mattered.
   - The chart loses the text the operator actually read. Today `<fork>-merged.md` is the nearest copy, at 40-46% overlap. Removed by: the fork's Findings and Taken already record the decisions; if a verbatim copy is wanted, A appends the chat round to the fork file after the operator answers, one write, no second generation of new text. Name it as part of 1a or state that the record is the notes plus Findings.
   - Compact merged notes drift back into prose because the template at questions.md:5-25 is the only written shape. Removed by: the compact file follows the five-part note shape from cut-boundary's Taken (pick, rejected, evidence, pitfalls, missing question) with slot tags added, so it needs no new template.
   - The saving is claimed at 3% and never seen because other changes land in the same chart. Removed by: proof-of-saving records A output tokens per fork split by message, so the second rendering's absence is visible as one fewer 1.5-2k message per fork.

5. Missing question: does the operator ever read `<fork>-merged.md` or any slots file after a chart, or only the chat? If never, the merged file's only readers are the peers and the handoff, and the record pitfall above shrinks to nothing. The fork assumes the answer and does not ask.

## Q2. Write every round in the elid register from the start?

Options I name:
- 2a. Yes: questions.md gets the register as concrete rules, derived from what A's accepted elid rewrites actually change, and the round is written in it once.
- 2b. No: keep writing as now and pay the elid rewrite when asked (6-8% of A's output in the 10-06 sessions, Carries).
- 2c. Ask the operator once whether the elid version is the one they want every time, record it as operator practice, and write in that register without a skill change.

1. Pick: 2a, with the rules below taken from measurement, not from the alias text.
   One reason: the operator's own alias says elid keeps "the previous response structure", so writing in that register from the start changes nothing the shape lock protects, and each skipped rewrite saves 1.1-2k output tokens plus a full context read at 117-139k tokens, which is more than Q1 saves per fork and lands on the fork's wall time while the operator waits.
   Cost: A cannot check from inside that it hit the register. The operator asked elid after rounds 1 and 2 of this chart even though A wrote them as plain. The done-criterion is external: elid or eli requests per round over the next three charts, against 1 per round on this chart and 17 of 49 messages in the 10-06 framework session.
   What the measured rewrites change (A's transcript, two elid pairs on this chart): length is the same (1,076 to 1,074 words, 910 to 904), sentences shorten a little (18.2 to 15.8 words, 15.7 to 14.6), and door vocabulary drops by two thirds (61 to 20 and 32 to 20 hits of slot, token, cache, fork, merged, tag, rebuttal, peer, file names and paths). The rewrite replaces "slot B" with "helper B", "effort" with "a dial for how long the model thinks", "the record" with "what I saved", and moves paths and file names out of sentences. So the rules for questions.md are: name every actor by what it does for the operator, keep paths and token words in the Research line only, define any door term the first time it appears in a round, one concrete example per question. Not "shorter".

2. Rejected:
   - 2b: the rewrite costs 6-8% of A's output and a minute or more of operator wait per round, for a text that is the same length and structure. The thing being paid for is vocabulary, which can be chosen the first time.
   - 2c: records a preference the alias already states, and leaves the register undefined, so the next session writes "plain" the way rounds 1 and 2 of this chart did and the operator asks again. The operator's behaviour on this chart is the answer to 2c.

3. Evidence:
   - Tier operator. Source: ~/.claude/CLAUDE.md elid and eli aliases, verbatim in Carries. Finding: elid is "same structure, dumber, with context for a good decision". The shape lock and the elid register are compatible by the operator's own definition.
   - Tier operator. Source: A's transcript 1ce71920, read 2026-10-06 by C. Finding: elid asked after both rounds of this chart, after A wrote them in what it took to be the plain register. The register A reaches unaided is not the one the operator wants.
   - Tier better-than-training. Source: the two round/rewrite pairs in that transcript, measured 2026-10-06 by C. Finding: as in the pick, same length, slightly shorter sentences, door vocabulary cut by two thirds, actors renamed by role. The rewrite is a vocabulary pass, not a cut.
   - Tier better-than-training. Source: questions.md:3, :6, :10, read 2026-10-06 by C. Finding: the template already says "plain" three times ("plain context", "one plain paragraph", "plain sentences") and gives no definition, which is why "plain" produced rounds the operator rewrote. The rule exists; it lacks the test.
   - Tier practitioner: not searched. The question is about one operator's register, and their own rewrites are the stronger source.

4. Pitfalls:
   - "Plain" is defined by adjectives again and the next session drifts. Removed by: the rules in the pick are checkable by A before sending (no slot letters, paths or token words outside the Research line; every door term defined on first use; one example per question), a self-check, not a feeling.
   - Dumbing down removes the numbers the operator needs for the decision. Removed by: elid itself says "give context to make a good and informed decision", and the measured rewrites kept every figure. The rule is vocabulary, not content.
   - The register is written into the skill while the operator's aliases live in their CLAUDE.md, and the two drift. Removed by: questions.md names the rules in its own words and does not quote or reference the alias, so an alias edit does not break the rule, and the done-criterion (requests per round) shows when it stops matching.
   - The operator keeps asking elid out of habit and the saving never appears. Removed by: the done-criterion over three charts, and the Missing question below, asked once.

5. Missing question: after the next round written under 2a, ask the operator to point at one sentence that still made them want elid, or say none. One answer tells more than another chart of counting requests, and the fork does not plan to ask it.

## Not measured
- Whether anyone reads `<fork>-merged.md` after a chart.
- B's wording-dispute share; the 32 wording hits are a keyword count across both peers, not a reading of each file.
- Whether the 2a rules reduce elid requests; only three charts of counting show that.
