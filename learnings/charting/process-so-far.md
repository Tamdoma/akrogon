# The chart process as run on akrogon-new

Current state of the process, in order, one line per step. Update this file when a step changes, add a learning file for why.

1. Stamp check. Compare the installed chart skill stamp with the canonical one in the checkout. Report current, older, or unavailable.
2. Slot A reads the intake and the checkout once, in full.
3. Territory map. Slot A writes its own map. Slot A prompts slot B with the category "territory map" and nothing else, reads the result, merges. The merged map goes to the operator before any question.
4. Destination batch. Both slots research first, practitioners then primary docs, sources folder before the web. Slot A writes its questions, prompts slot B with the category "destination", merges, presents one batch in the version 3 question form: heading is the question, background says what the thing is with an example, options with the recommended first, a beginner line, the reply key.
5. Operator answers inline. "I don't understand" on any question is logged as a learning and produces a rule change in the skill, then the question is re-asked.
6. Operator notes that arrive mid-chart go into the intake under "Notes as they come", in the operator's voice, unless they are process rules, which go here.
7. Slot A writes CHART.md and the first decision files, wires blocked-by, fires research decisions, closes the round with the challenge check.
8. Every later decision category repeats step 4 with slot B blind.
9. Operator challenges after the chart is written are appended to the matching decision's Findings, dated, decision stays open.
10. Before a clear: unclaim, write open challenge items into CHART.md, hand the operator one paste-ready prompt for the next session.
11. Slot A's own view stays in scratchpad until slot B has returned; the shared checkout is a channel.
12. Slot A merges the two batches by the thing decided, keeps both recommendations as options when the slots disagree, and writes provenance per question into Findings.
13. Reshape after every resolution: every open Question is reread against the answer and narrowed, widened or ruled out, new forks become decisions, one dated line records the move.
14. Skill edits happen in the canonical folder, then the installer runs, then diff against the harness roots. The stamp moves when the template changes.

Step 7 ran on 2026-09-08: 25 decision files, six resolved from the destination round and one prototype, three research decisions fired as subagents. Not yet run: step 8, the handoff, the archive.

Work lane, first decision, ran 2026-09-08: # Next Command Owner. Two rounds, one prototype, one research pair, slot B blind both rounds, challenge check answered by the operator. It resolved with the driver removed from the design, and four blocked decisions opened.

Challenge C1 closed by the operator 2026-09-08: the one-day estimate stands as intent, one decision per session stays the rule, pace is measured by the git log, not argued.

Coverage pass 2026-09-08, both slots blind: slot B found 7 gaps, slot A 19 plus 7 contradictions, overlap 4. Applied: 12 decisions widened, 1 new (# Config Shape), 2 operator-locked lines added, 1 destination gap to Not Yet Specified, 3 Question wordings corrected where they locked what the intake left open.

Three-decision round 2026-09-08: # Debate Count, # Turn Within Phase, # Driver State taken together, ten questions in one message with evidence and challenge, slot B blind. Answers arrived over several chat turns with eli restatements. Resolved once the operator accepted the whole architecture on a worked five-leaf example. Opened # Peer Questions, # Model Tiering, # Skill Rewrite, # Status View. Series-folder finding carried into # Multi Chart Layout.

# Peer Questions resolved 2026-09-08: one round, seven questions, both slots blind and in agreement, intro paragraph rule added after the operator asked for one, reshape touched two Questions.

# Quality Layers resolved 2026-09-08: two rounds, 14 questions, both slots blind, one disagreement (the audit) settled by the operator, reshape touched five Questions. A write that assumed a `## Resolution` heading silently did nothing and slot B caught the missing answers; appends now target end of file.

# Implementer Brief resolved 2026-09-08: research type, both slots blind, formats merged, nine questions over two replies. Learning added: a letter is the answer, an explanation request is not.

Skill Rewrite resolved 2026-09-08 over four rounds. Slot B compacted once mid-pass. Two corrections came from operator evidence during the rounds: broadcast stays a skill because its message rules are prose, and pi has subagents through the tamdoma-subagents extension (read-only children today). One resolved decision was reshaped: Peer Questions moves the answer path from pane read to a file, after the same day's both-ends read failure. Three Not Yet Specified items graduated or closed: testing inside a leaf (settled by Quality Layers and Implementer Brief), compaction posture (rule inside the skills), Pocock as text source (three lines borrowed). New item: pi worker tier.

Operator finding 2026-09-08 during Parallel Merge: the territory map was slot A's alone, so slot B's later batches overlapped mine on most questions. Rule added to the skill: with a second slot the map is blind too, batches tag provenance, one rebuttal round after the merge. Not rerun for this chart by operator choice.

Parallel Merge resolved 2026-09-08 over four rounds. Slot B's contributions: the broken-after-both-landed case, the push-then-phase-write failure (carried to Repeat Safety), and the lock option that lost to the push. Operator added the round-three-by-B rule from a fear of fails reaching status.

Config Shape resolved 2026-09-08. First decision run with the rebuttal round: slot B disagreed on five of ten merged points, three changed the recommendation before the operator saw the batch (global file path collision, one config call instead of one per key, advisory list instead of a blocking flag), one the operator sided with slot B on (launch line per harness in config), one carried to Distribution. The round cost about three minutes.

Distribution resolved 2026-09-08. Slot B's rebuttal changed two of eight points (skill roots narrowed to two; skill-name collision surfaced as Q5) and the operator took A on all eight. The challenge answer produced a new fork instead of a disagreement: the operator asked how the chart itself gets built before the command exists, opened as # Bootstrap. The old repo is deleted when charting ends, which zeroed the Q5 coexistence window. Chat explanations that carried rules were appended to six decision files as "Operator explanations" paragraphs so the handoff carries the exact intent.

Bootstrap resolved 2026-09-09. Opened from the Distribution challenge answer (operator: how is this chart itself implemented). Slot B blind found three forks slot A missed (install from source first, takeover proof, fresh-leaf start) and its rebuttal tightened Q1 (first automated leaves elected without debate). Operator chose to drive the hand-built leaves personally for the mental model, against both slots' recommendation; recorded with the quote.

Model Tiering resolved 2026-09-09. Operator overruled both slots on worker awareness: akrogon knows only slot models, workers are harness-side, which retired the `workers` key both slots had accepted the day before. Lesson: intake 259 already said this and both slots drifted into designing the lever anyway. The operator opened a new fork in the reply (a per-repo performance log) and asked for a debate instead of a batch; settled in two chat turns, recorded as a resolved paragraph with the schema.

Repeat Safety resolved 2026-09-09. Both slots independently caught a contradiction between two recorded explanations and the locked Next Command Owner retry rule; slot A corrected before the batch. Operator asked for a more elegant answer than a lock, was offered removal of the race class (sequential passes) and chose the lock for speed after an honest sizing. New operator rule surfaced in the reply: broadcast once per resolved category, never per leaf.

Vocabulary lock 2026-09-09: operator retired "category". Series, issue, leaf are the only nouns; an issue broadcasts when its last leaf merges. Seven files rewritten.

Multi Chart Layout resolved 2026-09-09. Slot B found four forks slot A missed (authoritative state copy, leaf identity, atomic publish, closed records) and its rebuttal fixed the issue-lock scope. Operator renamed "series" to "epic" and locked the three-term vocabulary; chose direct handoff writes over atomic publish after the pitfalls were laid out, on the fact that the handoff is one attended pass. Q7 was recorded from "ok great" plus a rule, not a letter.

Handoff Location resolved 2026-09-09. Both slots proposed a file for the two ending lines. The operator asked on the eli round who would read it; nobody would, the next pass already has the prompt line, the state file and the leaf files. Collapsed to printed only, standardized, with "Next" reproducing the real prompt line, and confirmed the backup pane read was already locked in Skill Rewrite 6-A. Codex check agreed and added `Next: none`.

Status View resolved 2026-09-09. Slot B found a carried note (Parallel Merge: broadcast failure visible) that a later lock (Repeat Safety: nothing recorded) had silently invalidated, and raised the absent-operator gap; slot A answered it with a hook notification, no loop. Three of B's five rebuttal points were taken before the batch; one (verdict field is new) was wrong, it was locked the day before. Operator dropped hand_built from the row.

Index Levels resolved 2026-09-09. Both slots retired the "drop the index" fork from intake 203 before asking. Slot B moved docs ownership from the checker to the implementer (writer and reviewer stay separate) and caught a wrong citation of slot A. Operator asked for the concrete file shape and raised the merge-conflict challenge; the split answered it without a new mechanism.

GitHub Intake resolved 2026-09-09. Operator invited a challenge ("I'm not locked"); slot A proposed dropping seed-issue, operator corrected with a fact neither slot had (colleagues file through agents, from client projects with the framework installed), which reshaped the decision into two flows, a pull mirror, and closure by the command. Codex's final check raised seven points, all taken. Two batches and one check, one decision.

Door Second Slot resolved 2026-09-09. The decision about the two-slot process was settled by the two-slot process, using its own log as tier 1 evidence. All six answers took the recommended option; three rebuttal points from B were folded in before the batch (naming the pane is the election, pass only the Question section, B may answer direct requests).

Lessons resolved 2026-09-09. Slot B argued for no list at all; the operator kept the list but took B's corrections (no cap, history open to targeted reads, links fixed on migration) and added the canon rule: lessons are what happened, not what is true. Last open decision of the chart.

Command Tests resolved 2026-09-09. The graduated decision, last of the chart. Slots split only on placement (test tree vs inline self-test); B's rebuttal widened the allowed-test rule from transitions to observable contracts and exempted the Bootstrap live proof from the never-touch list. All four answers took the recommended option; the operator added that the suite must stay small. One batch, one rebuttal, one decision.

Handoff round 1, 2026-09-09. Both slots proposed the tree blind and agreed on the shape (two hand-built leaves, status as takeover, parallel github and doors lanes, retire-old last). B found three contract gaps the resolutions left (plan and broadcast needed by the first automated leaf, GitHub close owner, two-verdict review vs A-only re-check) and A one (the routing file path). Operator took every recommended option; Q3 needed one plain restatement because the question read as if this work would file a GitHub issue.

Handed off 2026-09-09. Eight leaves under epic akrogon-loop written into issues/open after two audits: eight dry-run subagents (one per leaf) and one slot B final check. The audits found what the resolutions never said: who exports AKROGON_BASE, who edits the merged transition for the GitHub close, how the first of two slots records completion, when the fix counter increments, that the merge pass closed its own tab before it could spawn the broadcast writer, that two reviewers were pointed at one file, and that LESSONS.md was read by every skill before the leaf that created it. All fixed in the staging tree before emission. Chart moved to issues/chart/akrogon-loop/ with the audit record beside it.
