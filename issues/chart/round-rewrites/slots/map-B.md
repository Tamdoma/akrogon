# Slot B territory map: round-rewrites

Read and measured 2026-11-11. Repository HEAD: `a33d967b`. Independent position. No other return in this chart was read, no agents were started, and no product file or live system was changed.

## 1. Measurement and its limits

**F1. The strongest supported diagnosis is that first drafts explain the process better than they explain the operator's choice.** Rewrites often change the level of explanation, relevance and recommendation, not just vocabulary. The records do not isolate one causal ingredient. They cannot establish that removing a round part, moving the reply key, or issuing an internal `elid` command will remove future rewrites. No replacement skill wording is proposed here.

**F2. In the recent, explicitly bounded cohort below, 33 of 35 completed decision requests needed clarification before completion. Two were answered immediately.** One additional proposal was superseded after a request for consultant review. Across these 36 proposals there were 40 clarification responses, containing 20,042 whitespace-separated words and 45,168 recorded output tokens, including 6,646 reported thinking tokens. These are costs already incurred, not a forecast of avoidable savings. Some responses also changed the proposal, as noted below. No dollar conversion or operator reading-time estimate is warranted.

### Method

I first inventoried `issues/chart/**/seats.yaml`, selecting seat A, and scanned text-message metadata and candidate dialogue from all 124 root `*.jsonl` files in:

`/home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/`

The seats inventory names 51 distinct transcript paths. Forty exist and 11 do not. These are not 51 independent door sessions: one transcript can cover multiple charts. The root directory also contains sessions with no seat pointer.

For detailed pairing I selected six recent manual interviews with an observed operator answer, after the drawing change of 2026-11-04. This is a recent diagnostic cohort, not a census of all factory rounds and not a random sample. It includes signposts and approval requests because they also consume operator turns. It does not treat autopilot's self-answers as successful operator answers.

The six fully identified transcripts, with the prefix used in the table, are:

- T1 `1160556f-c628-4449-8d45-fa8fb6899642.jsonl`: factory-wins, including the signposts resumed from the earlier session, through its handoff approval.
- T2 `22416b4c-510d-4fc3-be62-7aa16106f3d7.jsonl`: known-red-nameless signposts before delegated fork answers.
- T3 `270a95b0-278d-4c60-9453-dfce0c8a91d7.jsonl`: round-drawings signposts, found without relying on its seat pointer.
- T4 `4a3df037-e5ba-4393-85f4-67eb6d4ba7e8.jsonl`: herdr-app's manual interview through first handoff, ending at transcript line 6784. Later deployment and recovery conversations are excluded.
- T5 `846b5690-f87d-4c52-b009-a33971d75fe3.jsonl`: shared-rules shape and handoff.
- T6 `e12f9f5d-4003-4947-b67e-f2fc0c5637c4.jsonl`: dispatch-flake fix and handoff.

Extraction reads JSON records and only displays selected text. It excludes tool results, thinking blocks, sidechains, metadata, generated compaction summaries, local commands, interruptions and hc reports from operator-turn classification. A later progress note does not replace the still-open round: for example, T4:1076 is a late-report acknowledgement, while the first start/pane round is T4:1061. I checked the chains against operator text rather than classifying every occurrence of `1a` as an answer.

A request is completed when its material choices are answered, including explicit free text. An answer accompanied by a question counts as a choice, consistent with questions.md. An unanswered remainder stays in the same request. A new material proposal caused by a newly discovered constraint is a new row. A demand for explanation, including an alias embedded in longer text, is clarification. An evidence/review request is not automatically a demand for simpler words.

R means completed after clarification, D means answered directly, and S means superseded without an answer. Table coordinates are physical JSONL record numbers, not process-text reading ranges. Words use `len(text.split())`, including options, drawings and footer. The compared wording is the last full rewrite, or a narrower explanation that led to the remaining answer. For M33 the last full rewrite is :398, followed by a 421-word explanation at :405 and an unanswered-remainder reminder at :511. These are not three independent successful rounds.

Parts are literal labels: R Research, H How to choose, P Pitfalls avoided, C Challenge check. A missing label does **not** prove its function disappeared. “Blocks” counts fenced blocks other than the status footer. Most are drawings/trees, but M32's is a config example, not a drawing. All rows retain an actionable request or option choice, even when its label changes.

| ID | Transcript: first → compared wording → answer | Request | Result / clarify responses | Words | Labelled parts | Non-footer blocks |
|---|---|---|---|---:|---|---:|
| M1 | `1160556f:211 → 230 → 234` | factory-wins signposts | R / 1 | 977 → 783 | C → C | 0 → 0 |
| M2 | `1160556f:641 → 648 → 660` | survey split | R / 1 | 1214 → 1268 | RHPC → RHPC | 1 → 1 |
| M3 | `1160556f:826 → 833 → 837` | fresh-start/counts re-ask | R / 1 | 606 → 479 | RHPC → RHPC | 0 → 0 |
| M4 | `1160556f:998 → 1005 → 1017` | quick-fix contracts | R / 1 | 837 → 737 | RHPC → RHPC | 1 → 1 |
| M5 | `1160556f:1153 → 1223 → 1236` | quick-fix handoff | R / 1 | 704 → 612 | RPC → RHPC | 1 → 1 |
| M6 | `22416b4c:273 → 286 → 290` | known-red signposts | R / 1 | 731 → 840 | C → - | 0 → 0 |
| M7 | `270a95b0:288 → 301 → 305` | round-drawings signposts | R / 1 | 777 → 765 | C → - | 0 → 0 |
| M8 | `4a3df037:329 → 336 → 346` | port signposts | R / 1 | 1055 → 624 | C → - | 0 → 0 |
| M9 | `4a3df037:744 → 751 → 755` | engine shape | R / 1 | 1292 → 726 | RHPC → - | 2 → 0 |
| M10 | `4a3df037:895 → 912 → 916,927` | identity | R / 1 | 710 → 411 | RPC → - | 1 → 0 |
| M11 | `4a3df037:1061 → 1152 → 1156` | start/panes | R / 1 | 782 → 636 | C → C | 1 → 0 |
| M12 | `4a3df037:1195 → 1195 → 1199` | tab name added choice | D / 0 | 270 → 270 | - → - | 0 → 0 |
| M13 | `4a3df037:1350 → 1365 → 1369` | tab name changed proposal | R / 1 | 395 → 416 | - → - | 0 → 0 |
| M14 | `4a3df037:1755 → 1770 → 1774` | delivery | R / 1 | 681 → 676 | C → C | 0 → 0 |
| M15 | `4a3df037:2036 → 2050 → 2062` | session identity/path | R / 2 | 443 → 303 | C → - | 0 → 0 |
| M16 | `4a3df037:2354 → 2361 → 2365` | notices | R / 1 | 501 → 398 | C → C | 0 → 0 |
| M17 | `4a3df037:2568 → 2615 → 2619` | containment | R / 2 | 414 → 226 | C → - | 0 → 0 |
| M18 | `4a3df037:2752 → 2758 → 2770` | watcher | R / 1 | 371 → 336 | - → - | 0 → 0 |
| M19 | `4a3df037:2946 → 3014 → 3027` | chart door | R / 2 | 448 → 322 | - → - | 0 → 0 |
| M20 | `4a3df037:3369 → 3384 → 3388` | global skill | R / 1 | 528 → 396 | - → - | 0 → 0 |
| M21 | `4a3df037:3603 → 3617 → 3621` | patches | R / 1 | 461 → 281 | - → - | 0 → 0 |
| M22 | `4a3df037:3830 → 3844 → 3848` | tests | R / 1 | 378 → 264 | - → - | 0 → 0 |
| M23 | `4a3df037:4077 → 4083 → 4087` | cutover | R / 1 | 423 → 280 | - → - | 0 → 0 |
| M24 | `4a3df037:4299 → 4314 → 4317` | board focus (scrapped) | R / 1 | 260 → 147 | - → - | 0 → 0 |
| M25 | `4a3df037:4519 → 4525 → 4529` | harness config | R / 1 | 293 → 160 | - → - | 0 → 0 |
| M26 | `4a3df037:4544 → 4550 → 4554` | split | R / 1 | 340 → 218 | - → - | 0 → 0 |
| M27 | `4a3df037:4659 → 4659 → 4663` | paid-probe budget | D / 0 | 354 → 354 | - → - | 0 → 0 |
| M28 | `4a3df037:5046 → 5110 → 5056,5113` | proof results | R / 2 | 524 → 363 | - → - | 0 → 0 |
| M29 | `4a3df037:5643 → 5658 → superseded` | handoff before peer review | S / 1 | 771 → 637 | - → - | 0 → 0 |
| M30 | `4a3df037:5815 → 5821 → 5825` | revised peer-review proposal | R / 1 | 602 → 632 | - → - | 0 → 0 |
| M31 | `4a3df037:6297 → 6303 → 6307` | final approval | R / 1 | 484 → 480 | - → - | 0 → 0 |
| M32 | `4a3df037:6531 → 6608 → 6612` | config/retention | R / 1 | 338 → 399 | - → - | 1 → 1 |
| M33 | `846b5690:378 → 398 → 437,521` | shared-rules shape | R / 3 | 1252 → 497 | RHPC → C | 2 → 0 |
| M34 | `846b5690:818 → 826 → 836` | shared-rules handoff | R / 1 | 757 → 618 | PC → H | 1 → 1 |
| M35 | `e12f9f5d:506 → 519 → 523` | dispatch cause/fix | R / 1 | 581 → 540 | RHPC → RHPC | 0 → 0 |
| M36 | `e12f9f5d:563 → 576 → 580` | dispatch handoff | R / 1 | 637 → 435 | HPC → HPC | 1 → 1 |

Reproduction: load the named JSONL file with `enumerate(path.open(), 1)`, select the table coordinates, extract `message.content` text blocks, count `len(text.split())`, and inspect the intervening external user messages. For cost, sum `message.usage.output_tokens` once per clarification response's message ID. The exact response coordinates are:
- T1: 230, 648, 833, 1005, 1223.
- T2: 286. T3: 301.
- T4: 336, 751, 912, 1152, 1365, 1770, 2042, 2050, 2361, 2600, 2615, 2758, 2953, 3014, 3384, 3617, 3844, 4083, 4314, 4525, 4550, 5052, 5110, 5658, 5821, 6303, 6608.
- T5: 385, 398, 405, 826. T6: 519, 576.

Counts by transcript: T1 0 D/5 R; T2 0/1; T3 0/1; T4 2/22 plus 1 S; T5 0/2; T6 0/2.

### What was read but excluded from that denominator

The other 118 root transcripts were screened, not all semantically audited. They are excluded by the exact predicate “filename not in T1–T6”; reasons include older round rules, autopilot, no observed human answer, non-chart work, or incomplete/resumed sessions. I extracted historical candidate round/answer snippets dated 2026-10-17 through 2026-11-02 from the root files, but did not turn those ambiguous snippets into a second population statistic.

Supplementary close reads:
- `6fa8e51c-838c-4286-a49e-3944a99601c8.jsonl`: immediate handoff answers at 2252→2255, 5606→5610, 5940→5944 and 6232→6235. These are older controls, not additional recent-cohort rows.
- `66c37ff6-d3a4-479b-8d04-8fe62963e518.jsonl`: 1147→1151, a 133-word approval/plan choice answered `1a` with a request for deeper review. The explicit choice still counts.
- `bf6c9fb4-e5fd-4d8c-883f-af2eb97eb7ab.jsonl`: herdr-panels drawing requests and the round-shape history.
- `acb047ee-5b0d-44f9-91d9-101e77575049.jsonl`: direction/signposts history and transition to autopilot.
- `104c1d89-7120-45d8-9a89-9700c9427e3e.jsonl`: prior factory-wins session screened as context, not another answered signposts round.

Unavailable seat-A transcripts: `d37e972e`, `d6811aa5`, `f36fe13b`, `78c4491c`, `a7a6765b`, `5eb6ac92`, `0f21842f`, `cfe3439f`, `7194f47b`, `006b0531`, and the explicitly named fixture-session path ending `b6d3b442-0216-4ada-b80c-7f365e67ba61.jsonl` under `-var-tmp-akr-1000-e2e-final-akr-e2e-final-claude/`. The prefixes identify the seats.yaml entries uniquely. Missing files are unknown outcomes.

The intake's “77 of 102” and “123,472 output tokens” are earlier A-reader claims. I have not reproduced their population, classifications or token accounting. My 33/35 must not be presented as a revision of those figures or added to them.

## 2. What the answered text changed

**F3. Word reduction is common but not the necessary change.** The 33 completed R rows total 20,796 words before and 16,268 in the compared wording, a 21.8% reduction. Five got longer: M2 1214→1268, M6 731→840, M13 395→416, M30 602→632, and M32 338→399. This rules out a simple “the successful version is always shorter” account. It does not show that longer text causes success.

**F4. Required parts are sometimes removed, sometimes retained.** M2, M3, M4 and M35 keep all four labelled parts. M5 adds How to choose. M9, M10 and M33 remove labelled research/pitfall material and drawings; M33 retains a challenge check and integrates the choice guidance into ordinary sentences. Fourteen of the 33 first drafts already lacked all four literal labels and still needed clarification. Removing headings alone is not an established fix. The part/block columns report the change for every rewritten request.

**F5. The clearest missing context was concrete decision context.** In M33 the first draft begins with the handover, consultant identity, independent mapping and definitions of four process actors. The question is “Which repeated rules move into the one shared file?” After two simplification requests it becomes “How many copied rules do we clean up?” with “four small” rules versus one “big” rule and the recorded 18/8/4 counts. This cuts 1252→497 words and removes two drawings, yet the operator still asks:

> “1 - where are they copied exactly, and what will 1b do?”

The next 421 words give an actual location table and a concrete list of edits. The operator then answers `1b, then. Continue.` This is evidence of a specific missing explanation, not merely vocabulary too difficult for a given age. It also shows that a shorter rewrite can still fail.

**F6. Some rewrites replace implementation choices with the reason to care.** M15 changes a discussion of conversation IDs into why the file is needed after the operator asks:

> “q1 - why does it need to know the id? isn't it enough to just know the file with the response? challenge me”

The answered explanation starts “Mostly you're right. akrogon doesn't need the id for its own sake. It needs the file.” This also reshapes the proposal toward storing the path. Its improvement cannot be credited solely to prose.

M22 initially describes the real hc, the stand-in script, fake error responses and five seats' positions. The rewrite makes the consequence of the two scheduling choices immediate: “every time, before each change goes live” versus “only when you run them by hand.” Same two questions, 378→264 words, no research or challenge labels in either version. This supports relevance and synthesis over a label-only diagnosis.

M17 is a negative example. Replacing a process term with “box” and then “fence” still leads to “what does this fence even mean?” in an answer that also selects options. The standing instructions explicitly reject analogies. A childlike metaphor is not the same as plain, concrete language.

**F7. Peer history often becomes shorter, but no peer-step saving follows from this.** M22's first options carry `(A,C)`, `(B,D,E)`, `(A,C,D,E)` and `(B)`; the answered rewrite removes the seat tags and retains the practical tradeoffs. M19 similarly changes “consultant”, a named CLI call and seat attribution into an explanation of who waits and what a stopped helper does to the operator. This supports synthesizing peer work for the operator, not deleting the blind exchange, rebuttal or final checks. Material dissent must remain visible.

**F8. The last lines often remain process status in both versions.** Thirty-three of the 36 compared messages end with the fenced footer. T1:211 and both T5 requests already put the reply key in `Next:` in the first draft and still get clarification. Both T6 drafts put the reply line after the footer and still get `elid`. Moving a key to the end is therefore insufficient. Its meaning and the choices above it still matter. M28's final footer narrows from “probe round” to the still-open Q3. Many other footers merely change “presented” to “rewrote”; the operator's actual choice is not clearer.

**F9. These are not all content-preserving rewrites.** M15 changes the identity/path framing. M28 follows an extra proof and explains the unanswered Q3. M29 is not a successful rewrite: the operator asks for peer review; the next proposal, M30, follows findings that require fixes. M32's longer version adds a retention removal date and further cleanup context. Those changes can affect an informed answer. Counting their words is valid; treating all their tokens as avoidable rewriting waste is not.

**F10. Immediate answers share a narrower, already-grounded decision, not a magic length.** M12 asks who names the tab, with two local mechanisms and explicit costs, after the larger tab question was explained. The operator supplies a preference in free text immediately. M26 asks for approval of a concrete limit, “at most 8 sessions × 4 tiny prompts,” after the work split. It gets “approve.” Both lack research/challenge labels, but many rewritten requests do too. Their 270 and 354 words overlap rewritten first drafts, including the 260-word M24. Historical immediate handoffs mostly confirm already-discussed scope. Familiarity, smaller decision scope and writing are confounded. These controls disprove an unconditional second-step requirement across all requests; they do not prove a novel complex fork can always skip clarification.

## 3. Candidate causes, ranked

| Cause | Evidence for | Evidence against / limit | Observation that separates it |
|---|---|---|---|
| C1. First drafts lack the right decision context and synthesis. Rank 1. | F5's explicit “where”/“what will 1b do”; F6's “why does it need” and practical consequences; longer accepted versions in F3. | M33 still needed extra context after large simplification; repeated exposure may explain part of success. | On the next genuinely new fork, retain the existing parts but explain the actual change and consequence plainly. If clarification is requested, identify the exact missing fact from the operator's response before writing another version. |
| C2. The agent treats “simpler” as a register instruction instead of reducing conceptual work. Rank 2, overlapping C1. | Glossary plus full process narrative in T5:378; `elid` already in force; box/fence example. The aliases ask for compression, focus or decision context, not one interchangeable age level. | Plenty of original sentences already use ordinary words. Adding another “plain language” rule would duplicate one that already exists. | Hold facts and part order stable, change only terminology and explanation. Continued failure after all terms are understood favors C1/C3. No such isolated comparison exists today. |
| C3. Mandatory parts and their order spread the decision across repeated explanations. Rank 3. | Large reductions and removed R/H/P blocks in M9/M10/M33; ending with status conflicts with stated reading order. | Successful M2/M3/M4/M35 retain the shape. Fourteen rewritten originals have none of those literal labels. End-position keys already fail in F8. | Establish that the operator understands the terms and facts but cannot find/compare the choices. A location-only change on a new comparable choice tests order; removing facts at the same time does not. |
| C4. Fork content is too broad, immature or asks the operator to choose an implementation before its need is clear. Rank 4. | Multi-question shape round; M15 questions the need for an ID; M29 requests review before approval. | One-question dispatch rounds M35/M36 also get `elid`. The operator selected the material choices, and splitting every question would add turns. | A new, fully researched single decision still needing explanation weakens breadth as the main cause. A question made unnecessary by inspecting the mechanism supports immaturity instead. |
| C5. Peer material is carried into the round as a work log. Rank 5. | F7, long challenge tails and consultant narration; removing tags accompanies answered versions. | Some no-dissent/no-label requests still get aliases; material peer disagreement is part of informed choice. | Keep the same relevant disagreement and consequence, omit only who investigated which detail, and observe whether the operator still needs context. |
| C6. A rewrite is a fixed second step that no first draft can remove. Rank 6, unproved. | High repeat rate across unrelated topics and first drafts A believed were already `elid`; successive aliases in M19/M33. | Immediate answers in F10; exact free-text requests identify real omissions. An internal label does not establish the first draft met the operator's need. | A novel, understandable round answered immediately would falsify the unconditional claim for novel forks. If the operator explicitly says the second reading is wanted even when understood, respect that preference. No number currently measures that explanation. |

The broad failure mode in C1/C2 is supported. The relative contributions of vocabulary, relevance, structure and prior exposure are not identified. Those limits should appear in the first cause fork, not be hidden behind a definitive new template.

## 4. Rule texts in play

**R1. Plain language is already required.** questions.md says the register is “everyday words, simpler than explaining to an 18-year-old who does not know the process” and “each part saying only what the decision needs while every part of the round and every number the decision depends on stays.” It also orders A to read the draft once and fix failures. A second self-review step or another age instruction duplicates an existing responsibility.

**R2. Structural obligations can compete with relevance.** questions.md says “Every round uses this shape, on every harness and at every effort level” and “a drawing replaces no required round part.” It also says “A small round keeps the parts that carry the decision, the reply key and the challenge check.” Whether “small” permits dropping or integrating the other labels is ambiguous. The rule simultaneously requires research, context, recommendation/reason/cost, conditional choice guidance and pitfalls, which can repeat one consequence several times. That is a tension to investigate, not proof every part is unnecessary.

**R3. The record and the operator-facing round are related but not identical duties.** questions.md requires “Every question carries a Research line” while “its fork file keeps the full return under Findings.” SKILL.md Take says research decides “which questions are asked, which pitfalls the options are built to avoid and which option is recommended, never the answer.” It says A “merges the completed independent notes” and presents “the rebuttals under the challenge check.” None requires a full peer work log in the round. Preserving research and dissent does not require reproducing all provenance prose.

**R4. End-position instructions compete.** The two standing instruction files say, identically in the sections read, “I always see the last thing you write first. Place the most important information there.” The round template puts `Reply` before `Challenge check`. SKILL.md Printed footer says “End each door pass with the actual result and reason no automatic pass follows” and gives `Last operation` then `Next: none`. SKILL.md Shared context requires printed chat and a reply key. Existing `Next:` already accepts a named awaited answer; the door can put the useful request there without inventing an extra summary.

**R5. The aliases ask for different work.** The standing files say:
- `scr`: “Simplify, compress, and repeat your response.”
- `eli`: “Explain this like I'm 18. Simplify your language. Shorten your response.”
- `elid`: “Same as eli, but keep the previous response structure. Dumb it down even more and give context to make it easy to make a good and informed decision.”
- `foc`: “Focus on what matters most here. Whats the true signal? Whats the true value? Boil your response down into the most important thing we need to focus on.”
- `ref`: “Rewrite your responses with reference points”

They say an alias wins when it collides with a style rule, but “If these are referenced in a longer string, they are not aliases, do not expand.” The observed longer messages are nevertheless ordinary explicit requests to explain and are classified by meaning. I have not treated their literal occurrence as automatic alias execution. “Keep the previous response structure” also means the analyst cannot assume every `elid` request authorized deleting the round's parts.

**R6. Functional judgment already has an owner.** The standing instructions say “Quality judgment belongs to a thinking agent” and mechanical checks validate function. SKILL.md Handoff requires peer review of the actual draft contracts. Do not add readability scores, exact wording assertions, alias substring gates or a new reviewer step.

**R7. Prior decisions constrain the solution.** The landed fork-rounds brief preserves one fork's material questions per round, not one question per round. The question-labels brief fixes per-round numeric labels. The round-drawings brief makes drawings conditional on whether they make a visible distinction easier, preserves the other parts, and keeps the selected drawing in the record. The signposts/direction work supplies session priorities before individual forks. None establishes that drawings or signposts alone remove rewrites. Door-cost records “O6 prose caps: declined by the operator 2026-10-26 (‘without the caps’).” That fact has not changed. No cap is reopened here.

## 5. Material forks and evidence

These are planning alternatives, not replacement rule text. The first fork must settle the cause before any rule edit. No option removes a consultant exchange, approvals, decision records or clean-checkout merge checks.

### Q1. Is the observed failure sufficiently explained to choose a remedy, or is one operator observation still needed?

- **1a, my pick:** Record C1/C2 as the leading diagnosis and explicitly resolve the remaining ambiguity with the operator before any skill edit. Use one concrete failed round, especially M33, and ask what the rewrite supplied: missing meaning/consequences, easier location/comparison, or a wanted second reading. Then observe the next natural new fork under the current rules. Cost: one bounded diagnostic exchange in this chart, plus its ordinary next-round reply. Estimate: 10–20 minutes of door preparation, excluding operator wait. It can still fail to separate causes, in which case keep the uncertainty open.
- **1b:** Declare the mandatory format the cause now and change it. Cost: one text change and later review. It risks removing useful evidence or drawings while leaving the actual missing context untouched. I reject it because F4/F8 contain counterexamples.
- **1c:** Conclude aliases are an unavoidable preference and keep the current practice. No implementation cost. It preserves recurring clarification work and risks dismissing specific omissions the operator has actually named. Choose it only if the operator confirms that preference after seeing the evidence.

Factory cost: F2, 33/35 completed requests and 40 clarification responses, from the table and response coordinates, measured with Python JSON extraction on 2026-11-11. Most diagnostic specific cost: M33 has three clarification responses, 1092 + 497 + 421 = 2010 response words, before the choices are completed. The evidence supports spending a small amount to identify the cause, not claiming a known savings rate.

Outside practitioner: S4 supports observing actual task performance and avoiding leading the participant. No outside practitioner can establish this particular operator's motive from these logs.

### Q2. Once the cause is established, does the existing rule suffice or does its round contract need changing?

- **2a, preferred first:** Apply the current rule to actual decision context, remove irrelevant process narration, synthesize peer work into the relevant tradeoff, and use the existing awaited-answer/footer position clearly. Keep the required decision evidence, costs, material dissent, and useful drawings. If this works, create no product leaf. Cost: the writing/review work the door already owes. Risk over time: later doors may repeat the same interpretation error. Observe a new case before claiming this suffices.
- **2b:** If Q1 shows an actual conflict between required presentation parts and answerability, change that specific presentation obligation in one bounded akrogon text leaf. Full evidence remains in Findings and material dissent remains in the round. Do not create a parallel “simple round” file or a second automatic rewrite. Cost estimate: one leaf touching questions.md, and SKILL.md only if its footer obligation is implicated. Risk: hiding a real cost in the record, or contradictory instructions about which part can move. Remove those risks through the existing blind discussion and review of the complete final shape, with an explicit content-preservation comparison.
- **2c:** Retain the presentation as is and accept the extra rewrite exchange. No code/text-change cost. Appropriate if Q1 establishes a deliberate second-reading preference. Cost over time: continuing the measured clarification work. It cannot honestly be sold as “operator can answer first written.”

Factory cost: F3 4528 fewer words across compared complete-R versions, but five longer versions; F4 fourteen rewritten originals without any of the four literal labels; F8 three first drafts already carrying keys in `Next:`, plus both dispatch drafts with final-position keys. Commands are the table extraction, searches for Research, How to choose, Pitfalls avoided and Challenge check at the start of lines after optional Markdown heading/bold markers, and fenced-block inspection, run 2026-11-11. Those figures make blanket shortening, label deletion and footer relocation weak prescriptions.

Outside practitioners: S1/S2 support writing around the user's task and familiar concepts; S3 supports keeping secondary detail out of the primary task where it is genuinely secondary. Their evidence is from interfaces and websites, not this terminal interview. It does not authorize hiding material disagreement, importing word caps, or replacing one-fork-per-round with one-question-per-round.

### Q3. What observable result is enough to claim the leaf worked?

- **3a, my pick:** A real operator receives a first draft for one genuinely new, nontrivial fork of the kind that failed here, and answers its material choices without asking for a simpler explanation first. A human reviewer checks that the text retained the decision facts, tradeoffs and dissent, and the answer shows no evident misunderstanding. Record the actual first text, operator reply, affected question, harness/release and result. Cost: one natural operator turn, no separate paid run. This establishes a bounded observed result, not zero rewrites forever.
- **3b:** Require the same result on a new signposts round, a substantive fork and a handoff review. Stronger coverage across round types, but it can hold a small leaf for unrelated future work and more operator time. Pick it only if the intended contract explicitly promises all three.
- **3c:** Accept a shorter draft, a lower reading-age score, a peer's approval, or replaying an already-answered question. Cheapest to run but does not demonstrate the destination. Reject it. A peer is not this operator, and repeated material carries knowledge from earlier presentations.

Factory cost: baseline 33/35 for the bounded cohort, two direct approvals/continuations, and M33 still needing clarification after 1252→497 words. The JSONL pairing and immediate-answer controls were read 2026-11-11. **No number** measures success of a candidate remedy on a new fork today. Searches: the six named operator chains and supplementary historical immediate-answer controls. No proposed design exists to run a before/after claim against.

Outside practitioner: S4 supports a realistic task, the actual participant and observed behavior. No source found that makes a fixed number of trials universally sufficient to prove absence of clarification. Searches run: `site.nngroup.com articles plain language jargon users concise scannable objective 1997 124%`, `site.gov.uk Caroline Jarrett question protocol only ask questions need users questions`, plus the primary-source pages in S1–S4. The one-case choice is a scope/cost judgment, not a statistical guarantee.

### Practitioner sources

All read 2026-11-11. These guide candidate designs, not the operator's answer.

- **S1. Anna Kaley, Nielsen Norman Group, “Match Between the System and the Real World” (2018).** A practitioner at a usability research consultancy explains why familiar concepts and ordering reduce the user's need to interpret system terminology. Supports C1/C2 and Q2a. It does not imply that replacing technical terms with metaphors works. https://www.nngroup.com/articles/match-system-real-world/
- **S2. Jakob Nielsen, Nielsen Norman Group, “How Users Read on the Web” (1997).** Reports tasks on variants of the same website; concise and scannable versions improved measured usability. Supports relevance, scanning and testing multiple aspects separately. It does not supply a word limit for this workflow or evidence about a terminal's bottom-first reader. https://www.nngroup.com/articles/how-users-read-on-the-web/
- **S3. Jakob Nielsen, “Progressive Disclosure” (2006), and GOV.UK's service-design community, “Structuring forms.”** These practitioners describe reducing initial task complexity and asking only necessary questions, with the latter allowing grouping when research supports it. Relevant to distinguishing the operator's decision from its supporting record. The record cannot absorb facts needed for an informed choice. https://www.nngroup.com/articles/progressive-disclosure/ and https://www.gov.uk/service-manual/design/form-structure
- **S4. Kate Moran, Nielsen Norman Group, “Usability (User) Testing 101” (2019, reviewed 2026).** Describes observing a realistic participant perform a real task and warns that task wording can influence behavior. Supports Q1's missing observation and Q3's direct evidence. It does not establish that one success generalizes. https://www.nngroup.com/articles/usability-testing-101/

The sources agree on reducing interpretation work and observing users. None says to delete all explanation. GOV.UK's one-thing starting point could encourage more separate prompts, while this factory already binds one fork's material questions into a complete round. Keep that existing boundary unless evidence and an explicit operator decision require otherwise.

## 6. Uncovered practitioner questions and lifetime pitfalls

- **P1. Does “I see the last thing first” mean the initial viewport, reading habit, or both?** The standing instruction is clear about desired placement but not the actual visible region. Before a location-specific leaf, observe the real terminal at its normal width and the operator's account of what was first visible. Do not infer the screen from a JSONL file.
- **P2. Are some aliases shorthand for wanting a recommendation or time to think, rather than not understanding words?** Ask this in Q1 using the specific before/after pair. Do not equate an alias with failed comprehension. Free-text correction and explicit choice remain valid.
- **P3. Did the rewrite silently change the choice?** F9 shows this happens. In the existing peer review, compare the alternatives, costs, evidence and dissent by meaning. If they changed, report a reshaped proposal rather than attributing the outcome to style.
- **P4. Could the door learn the operator's preference without adding rules?** Q2a tests that possibility first. The existing pre-send reading obligation already covers plainness and relevant detail. Add no new lint, formatter, scorer, prompt mode, file, model call or review stage to enforce what it already requires.
- **P5. Could “no alias” mean the operator skipped reading or was pressured to pick?** Q3's reviewer checks the actual answer and the retained tradeoffs. Never forbid clarification or define a clarification request as user error. An honest request for missing information is useful feedback.
- **P6. Could a one-case success be mistaken for a permanent property?** Record the bounded observation and retain ordinary future feedback. No new ongoing telemetry system is justified by these data. Autopilot self-answers never count as operator comprehension.
- **P7. Will later releases or agents restore the same friction?** If a leaf is needed, review the final whole instruction path, not an isolated nicer paragraph. Confirm the candidate source is what the door loads, and state the next release-link timing. A new unreleased paragraph cannot explain a success by a door still reading the old installed copy.

## 7. Cheapest sufficient proof and handoff observations

There is no product change to prove yet. The next necessary observation is the operator's Q1 answer about what the rewrite supplies. Today the logs prove recurring friction and several concrete omissions, not a validated remedy.

For an eventual text leaf, Q3a is the cheapest proof that reaches the destination: preserve the first presentation and the operator's ordinary reply on a new substantive fork. A peer checks meaning and completeness. Existing link/doc checks only prove that the edited instruction files and references remain usable; they cannot prove the operator can decide. Do not add string-sensitive tests for “simple wording” or an alias parser. The acceptance observation must not be an already-explained remainder like M12 or an approval-only case like M26.

Pre-existing assumptions needing observation before handoff:
- **A1. Input evidence:** the named first-draft/rewrite/answer chains and their definitions, already observed here, with missing transcripts and cohort limits explicit.
- **A2. Actual reading surface:** normal terminal width and initial visible text, only if placement/visibility is part of the chosen remedy. Not yet observed. This is a read-only operator/UI observation, not permission to change the desktop.
- **A3. Loaded instructions:** the exact released/installed chart-issues source used in the proof, especially if testing a source edit before the next release link. HEAD is verified here; effective loading for a future proof is still pending.
- **A4. Human acceptance:** the actual operator performing the new decision, required if the contract retains “answered as first written.” A synthetic agent, a source-text check or an autopilot answer cannot substitute.

No external API, paid agent launch, account, key or live mutation is needed for the recommended investigation. The current needs-sheet paid-run cap remains unstated and is not used. If a later proposal introduces paid proof, it waits for the operator's bounded authorization. Use existing transcript and fork records, not a new measurement service. A leaf branch may not touch `issues/`; chart/proof observations stay in the chart's normal record rather than becoming implementation-branch edits.

## 8. Split

**D1. No implementation leaf yet.** The first cause fork is a real dependency, not implementation work to parallelize. Finish Q1 before drafting rule text.

**D2. Prefer no leaf if applying the current rule is sufficient.** That removes the need for another rule and respects “fewer parts first.” Show the Q3 observation and state its limits.

**D3. If the cause is a conflicting presentation obligation, one bounded text leaf is enough.** Its outcome is a usable first presentation with the selected evidence/placement treatment. questions.md owns the round, SKILL.md is touched only if its existing end-of-pass contract must change. The proof and content-preservation review belong to that leaf, not separate parallel leaves. No code feature, extra peer stage, automatic rewrite, new format mode, paid benchmark, word cap, desktop change or retrospective transcript-cleanup project is in scope.

The strongest next move is to resolve why M33 still needed “where exactly” and “what will 1b do,” then test that explanation on a new decision. Changing the age-level instruction again is not supported by the evidence.

