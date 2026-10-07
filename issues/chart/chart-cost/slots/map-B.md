# Slot B: chart cost and time territory map

Independent assessment, 2026-10-06. Read the supplied intake first. Did not read this consultation's map-A.md or map-C.md. Changed no repository files. All proposals below are proposals, not approved changes.

## Finding first

F1. The claimed general slowdown beginning around October 4 is **not established by the measured sessions**. The October 5 seed-root-cause chart has higher A output than the October 2 leaf-readiness continuation, but its four measured between-fork waits are shorter. A separate October 5 merge-turn session has substantial operational stalls and additional review passes. These are different causes and must not be combined into a claim that one skill update made every fork slower. See the measurements below, especially S1:424-752 versus S2:136-345 and S6:217-647. Chart records: issues/chart/seed-root-cause/CHART.md:7-11 (923c6c9), issues/chart/merge-turn/CHART.md:1 (3ce2085).

F2. The seed-issue update did **not** add a new chart grouping workflow. The operator explicitly chose no chart-issues change. The three October 5 seed commits change only skills/seed-issue/SKILL.md. The actual new October 4 chart requirement is stronger lifetime-pitfall treatment and binding avoidance mechanisms. That expands what each independently researched round must resolve, but its incremental runtime/token effect has not been isolated. Evidence: issues/chart/seed-root-cause/forks/chart-grouping.md:23-32, CHART.md:11 (923c6c9), skills/chart-issues/assets/questions.md:27 and SKILL.md:37,47,55 (7bac4c1), git show --stat 0d15906, 3b8fdb5, 57bbe3c.

F3. Measured costs come from a pre-existing full-round peer protocol, the extra C participant relative to the one-peer leaf-readiness continuation, repeated presentation/explanation, growing context, and handoff work. The script already moves polling out of model turns. Removing that script would reinstate more model-visible wait calls. None of these measurements supports calling the seed change the sole cause. Evidence and commits are attached to each mechanism below.

## Sources and measurement rules

Repository paths are relative to /home/ivan/Work/infra/akrogon. The installed Claude and Codex chart SKILL.md both resolve to that repository's skills/chart-issues/SKILL.md, measured with readlink -f. Repository HEAD is 3ce2085. Transcript sources are unversioned local evidence, so a Git commit is not applicable to their usage/timestamp claims. The associated chart-record commit and rule commit are supplied separately instead of inventing transcript commits.

Transcript aliases, used as exact file:line citations below:

- S1 = /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/0c5414ba-e3d7-4b0a-9bdf-b3da1d815b91.jsonl. October 5 seed-root-cause A. Chart record commit 923c6c9.
- S2 = /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/546713ff-19d7-4350-9e77-f5d4109e2e94.jsonl. October 2 leaf-readiness continuation A. Related chart record commits 419ab19 and b2c15ec.
- S3 = /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/aaeb21c3-34bc-4fc7-8eb6-dcd8583dd4a6.jsonl. October 2 reviewer-repair/test-speed A with B and C. Chart record commit 22c4470.
- S4 = /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/ffece812-2efa-4907-ba92-73c7779ee919.jsonl. October 3 door-turn-and-stale-tab A, initially single slot then B. Chart record commit e68c865.
- S5 = /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/e9145798-46e4-42cf-bc2b-6abb0eea7c2f.jsonl. October 4 retro-concepts A with B and C. Chart record commit 76ec784.
- S6 = /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/0218f863-24eb-4467-9613-f9f6f4e21171.jsonl. October 5 merge-turn A with B and C. Chart record commit 3ce2085.
- S7 = /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/f4e10eb5-4839-4f84-96ac-e9e5b7464dc8.jsonl. Seed-root-cause C, claude-fable-5-1. Chart record commit 923c6c9.
- S8 = /home/ivan/.codex/sessions/2026/10/05/rollout-2026-10-05T11-12-49-01a10b56-5525-73d1-b6bb-38dc5b939a36.jsonl. Seed-root-cause B, gpt-6.1-sol, medium effort (S8:8). Chart record commit 923c6c9.

M1. Claude has several assistant blocks with the same message.id and identical usage, e.g. S1:32-33 and :43-44. Sum each unique message.id once, not each JSONL line. All Claude totals here are deduplicated. For example the naive whole-S1 sum is 319,168 output tokens while the deduplicated whole-session sum is 142,291. The chart-through-handoff subset is 142,055, excluding the later new-issues question. S1:32-33,43-44,9-1117,1120-1131. No repository commit applies to this transcript format observation.

M2. Codex total_token_usage is cumulative. Take the final cumulative total, or differences across phase boundaries. Do not sum cumulative events. B's final count is S8:455. B input includes cached input, whereas Claude reports input, cache creation and cache read separately. Keep those columns distinct. Model/effort metadata is S8:8. Dollar costs, provider tariffs, invoices, speed settings across every peer and actual account charging are **unmeasured**. Token totals alone do not establish a dollar increase.

M3. Time between forks means timestamp of an explicit answer to timestamp of the next original round. It excludes the operator's delay before answering and excludes subsequent elid rewrites. Startup, explanation, final-shape checks and handoff are reported separately. This follows the one-fork-then-answer dependency in skills/chart-issues/assets/questions.md:29 (fc1cd2e), rather than treating session duration as agent latency.

M4. The sample is intentionally identifiable chart sessions, not a full census or a controlled replay of the same intake. Old/new tasks, fork counts and peer counts differ. No general causal effect size, statistical significance, or model throughput regression is claimed. All generated/reasoning/tool output is included in output_tokens. Thinking tokens are a subset, not added again. Evidence: usage fields in S1:32 and the cited ranges below.

## Measured before/after

### A transcript totals

All these A transcripts use claude-opus-5-5, measured from their assistant message.model fields. Except the seed subset, these are whole-session totals and include explanation, compaction and any adjacent work present in that session. They are a workload comparison, not a controlled skill benchmark.

| Session | A messages, unique | Fresh input | Cache creation | Cache read | Output | Evidence |
|---|---:|---:|---:|---:|---:|---|
| Oct 2 leaf-readiness continuation | 120 | 244 | 281,015 | 14,351,386 | 119,551 | S2:1-920, chart record 419ab19/b2c15ec |
| Oct 2 reviewer-repair/test-speed | 151 | 302 | 564,902 | 19,081,507 | 141,976 | S3:1-1189, chart record 22c4470 |
| Oct 3 door-turn/stale-tab | 49 | 98 | 113,536 | 4,876,619 | 47,269 | S4:1-378, chart record e68c865 |
| Oct 4 retro-concepts | 87 | 176 | 176,560 | 12,015,044 | 80,655 | S5:1-660, chart record 76ec784 |
| Oct 5 seed-root-cause through handoff | 133 | 266 | 470,358 | 17,782,033 | 142,055 | S1:9-1117, chart record 923c6c9 |
| Oct 5 merge-turn | 186 | 374 | 489,387 | 22,073,326 | 181,468 | S6:1-1519, chart record 3ce2085 |

The seed A subset has 18.8% more output and 67.4% more cache creation than the leaf-readiness continuation, but essentially the same output as the earlier two-peer reviewer-repair/test-speed session. The much smaller retro-concepts total is another counterexample to a uniform October 4 step increase. Those percentage comparisons are arithmetic on this table, not causal estimates. Peer requirements are pre-existing at questions.md:40,48,50 and SKILL.md:67 (ffd7be0, September 26).

### Between-fork latency and usage

| Answer -> next original round | Elapsed seconds | A output | A cache creation | A cache read | Evidence |
|---|---:|---:|---:|---:|---|
| Oct 2 live-change-grant -> proof-fixtures | 410.6 | 12,624 | 27,765 | 1,748,100 | S2:136-248; 419ab19/b2c15ec |
| Oct 2 proof-fixtures -> blocker-record | 532.0 | 12,380 | 24,569 | 1,619,352 | S2:259-345; 419ab19/b2c15ec |
| Oct 3 first fork -> stale-tab | 127.3 | 8,977 | 9,277 | 832,239 | S4:188-241; e68c865 |
| Oct 5 discovery-role -> cause-section | 218.9 | 13,040 | 25,059 | 640,974 | S1:424-489; 923c6c9 |
| Oct 5 cause-section -> related-search | 247.9 | 14,061 | 25,715 | 1,080,295 | S1:500-577; 923c6c9 |
| Oct 5 related-search -> root-report | 233.5 | 14,380 | 21,740 | 1,047,260 | S1:588-652; 923c6c9 |
| Oct 5 root-report -> chart-grouping | 239.1 | 13,448 | 25,880 | 1,244,135 | S1:687-752; 923c6c9 |
| Oct 5 merge-turn issues-only -> turn-release | 304.8 | 16,726 | 36,408 | 1,524,604 | S6:664-785; 3ce2085 |
| Oct 5 merge-turn turn-release -> dependency-setup | 671.4 | 23,418 | 39,645 | 3,266,802 | S6:819-986; 3ce2085 |

The four seed intervals average 234.8 seconds. The two cited October 2 intervals average 471.3 seconds. The October 3 small fork is faster than either. This proves variability, not a universal regression. The serial answer dependency existed September 21, before the alleged window: questions.md:29 and SKILL.md:39,51 (fc1cd2e).

### Actual slot mtimes

Measured local st_mtime and byte sizes, local Europe/Zagreb time. A file's :1 is a content locator, not proof of its metadata. Metadata was read directly with Path.stat(), and compared with Git commit times.

| Slot evidence | Local mtime | Bytes | Commit / interpretation |
|---|---|---:|---|
| issues/chart/leaf-readiness/slots/proof-fixtures-A.md:1 | Oct 2 17:50:38.010346 | 3,370 | 419ab19/b2c15ec, original-looking write sequence |
| same folder/proof-fixtures-B.md:1 | Oct 2 17:54:00.351083 | 10,174 | Same record history |
| same folder/proof-fixtures-merged.md:1 | Oct 2 17:54:29.792341 | 4,256 | Same record history |
| same folder/proof-fixtures-rebuttal-B.md:1 | Oct 2 17:55:37.013926 | 3,037 | Same record history |
| issues/chart/retro-concepts/slots/adopt-prompt.md:1 | Oct 5 00:21:58.796748 | 1,373 | 76ec784 |
| same folder/adopt-A.md:1 | Oct 5 00:22:16.842966 | 1,762 | 76ec784 |
| same folder/adopt-B.md:1 | Oct 5 00:23:02.695385 | 5,421 | 76ec784 |
| same folder/adopt-C.md:1 | Oct 5 00:22:34.279282 | 4,133 | 76ec784 |
| same folder/adopt-merged.md:1 | Oct 5 00:23:29.865629 | 3,288 | 76ec784 |
| same folder/adopt-rebuttal-B.md:1 | Oct 5 00:24:05.102943 | 2,280 | 76ec784 |
| same folder/adopt-rebuttal-C.md:1 | Oct 5 00:23:54.294931 | 2,336 | 76ec784 |
| issues/chart/seed-root-cause/slots/cause-section-{A,B,C,merged,rebuttal-B,rebuttal-C}.md:1 | All Oct 5 14:28:13.583546-.583733 | 4,508 / 7,086 / 10,577 / 8,265 / 2,684 / 2,716 | 923c6c9 committed at 14:28:13 +02:00; these are checkout/writeback mtimes, not consultation timestamps |

All 38 seed slot files have mtimes within 0.0017 seconds at 14:28:13; all 39 merge-turn slot files within 0.0017 seconds at Oct 6 06:44:57, just after 3ce2085's commit time. They cannot measure original time between forks. Conversely retro adopt's prompt-to-last-rebuttal is 126.3 seconds, corroborating a fast post-update exchange. The 7bac4c1 skill change did not make every peer exchange inherently slow. Source: the listed slots' metadata, S5:252-302, commit 76ec784. Seed and merge original timing must come from S1/S6, not Git-checkout mtimes.

## Mechanisms and their exact evidence

F4. **More work per round was added October 4, not more peer phases.** 7bac4c1 adds 1,218 bytes and 217 whitespace-delimited words across SKILL.md and questions.md. Across the four chart guidance files the bytes rise from 42,775 to 43,993, a 2.85% increase. This is measured source size, not a tokenizer estimate. The stronger work is questions.md:27: design known traps out before display, bind avoidance mechanisms into the fork and leaves, and create a question for a material unavoidable trap. SKILL.md:37 extends the territory map over the lifetime. In the seed cause round, the merged artifact records avoidance through multiple done-criteria and provenance rules: issues/chart/seed-root-cause/slots/cause-section-merged.md:17,27,31,45,50 (923c6c9). The new instruction can explain extra reasoning/content in principle, but the precise extra token/time cost of 7bac4c1 is **unmeasured** without replay. It does not add a map, blind round, rebuttal or final-check phase.

F5. **The mandatory independent full rounds and rebuttals are a measured recurring cost, but originated September 26.** questions.md:40,48 requires each peer to research independently and return a full round. :50 requires merge then one rebuttal. SKILL.md:67 requires every peer to review every leaf draft. These are ffd7be0, not the October 5 seed update. In the seed chart B and C each receive 14 work prompts: map, map rebuttal, five blind forks, five rebuttals, one correction check, one handoff review. S8:9,78,104,138,162,196,222,259,283,307,333,366,392,413; S7:5,93,108,132,146,169,184,212,229,258,273,300,320,333. An extra C adds these 14 consultations relative to the B-only leaf-readiness continuation. That is an actual participant difference, not a newly added rule.

The entire seed C session costs 55 unique messages, 128 fresh input, 235,925 cache creation, 6,879,846 cache read, 72,128 output including 22,789 thinking tokens. B costs 6,195,959 input including 5,930,752 cached input, 23,129 output including 3,678 reasoning output. A chart-through-handoff costs the table totals above. Evidence: S7:1-405 deduplicated; S8:455 cumulative; S1:9-1117. Chart record 923c6c9, protocol ffd7be0. These measured peer totals quantify their participation, not the counterfactual savings if they were removed: A might need more work or miss a defect.

B's map rebuttal alone uses 201,130 input, of which 194,432 cached, and 750 output (difference through S8:97 from :71). Its five fork rebuttals use respectively 271,562 / 332,376 / 405,379 / 431,896 / 504,547 input and 803 / 858 / 905 / 954 / 960 output (S8:131-157,189-215,252-278,302-326,361-385). The total for those five rebuttals is 1,945,760 input and 4,480 output. The second pass is real work even though it is disagreement-only. Rule: questions.md:50 (ffd7be0). Whether fewer passes preserve the operator's desired quality is **unmeasured**, and dropping them changes the named-peer contract.

F6. **Large context is replayed even for short late returns.** B's final-shape check returns only 186 output while processing 347,471 input including 342,784 cached input (S8:385-406). Its handoff review processes 1,120,414 input including 1,099,392 cached, returning 2,611 output (S8:406-455). C's final check uses 364,302 cache reads and 2,431 output (S7:320-332). This is measured growing-history overhead associated with persistent peers and the correction/handoff rules, questions.md:50 and SKILL.md:67 (ffd7be0). How much can safely be removed by trimming context is **unmeasured**. The rule already forbids unnecessary rereading before compaction at SKILL.md:6 (0a6ea42), so blanket claims that the skill demands every full reread are wrong.

F7. **A repeats full round content across generated artifacts and operator presentation.** A writes its own round, writes the merged round, then presents the completed round. For cause-section, Write payloads are 4,491 and 7,598 characters at S1:452,464, followed by a 6,356-character displayed round at :489. Across the seed map and five fork A/merged Write calls the generated contents total 69,310 characters (S1:243,283,320,366,452,464,537,554,606,623,710,728). This is payload character count, not output-token attribution. Required full rounds are questions.md:48; merge/rebuttal/display :50 (ffd7be0), all-round shape :27 (7bac4c1). Saved artifact sizes differ later because they were edited. The exact fraction of output tokens caused by duplicating prose is **unmeasured**, but the duplicate generation is directly observed.

F8. **Repeated simplification is a measured cost and predates October 4.** Six seed re-presentation/explanation intervals together use 14,274 A output tokens and 1,723,077 cache-read tokens: S1:416-420,492-496,581-584,661-678,756-788,965-968. These include follow-up explanations and the chart-grouping correction, not only six literal rewrites. The four isolated simple rewrites (:416-420,:492-496,:581-584,:965-968) cost 6,537 output. The original five rounds are 5,567 / 6,356 / 6,111 / 5,566 / 4,632 characters (S1:413,489,577,652,752). Earlier sessions already show elid rewrites at S2:123-125,252-255,349-351,522-524 and S3:243-248,398-401. The operator-visible shape is mandated by questions.md:27 (7bac4c1). The operator explicitly requests simpler wording in those transcript lines. Starting with that language can avoid rework without deleting decision content. This cost is measured, but is not newly caused by the seed update.

F9. **Peer waiting has two different costs: substantive waiting and model-visible polling.** In the seed four between-fork intervals, blocking Bash calls containing peer-wait consume approximately 99.3 / 102.0 / 103.9 / 112.4 seconds of A's critical path (S1:454-455,466-472;539-545,556-562;608-614,625-631;712-718,730-736). Some calls also prompt/read files, so these are tool-call elapsed times, not pure sleep. B/C were prompted together; sequential waiting does not prove their reasoning was serialized. Foreground waiting is questions.md:44 (ddd43fc, path fixed 415fd09). The implementation checks return-file size only after a herdr wait of up to ten seconds, scripts/peer-wait.ts:85-106 (8b0c0ae, formatted 67d255b). It can therefore delay noticing a new file until that wait returns. The maximum normal poll interval is measured from code, not a measured runtime penalty. Actual detection-only delay is **unmeasured** because most original slot mtimes were lost.

Before the script, the two earlier S2 intervals spent 270.9 and 314.4 seconds inside model-visible wait/check Bash calls (S2:152-153,190-196,198-199,205-206,227-228;301-307,309-310,312-313,318-319,328-329). Many waits were around 100 seconds. The script addresses token-visible polling and readiness lag, not substantive peer research. It does not justify calling every blocked second avoidable. S4:188 explicitly asked for ten-second deterministic checking with almost no tokens. Removing the script is contrary to that operator request.

F10. **Measured startup/connection/permission interruptions are separate from skill reasoning.** Seed chart invocation :9 at 09:10:42Z to the operator's go :160 at 09:20:07Z is 564.3 seconds, with 6,571 A output and 134,025 cache creation (S1:9-160). It includes refusal to alter permission controls, manual correction and waiting for the operator, not just agent execution. Merge-turn C stopped for scratchpad-path confirmation (S6:217,233), then lost connection mid-response (S6:556,559). The interval from the failure report 17:52:18Z to operator retry 18:06:25Z is 847.0 seconds of operator/offline delay. Those timestamps do not identify a repo-code defect. Exact underlying harness permission/configuration implementation and network cause are **unmeasured**. questions.md:44,46 (415fd09/ffd7be0) already prescribes exact scratch return paths and reporting blocked peers, so these stalls are not evidence that another peer-research phase was added.

F11. **An unnecessary design proposal created measurable clarification/review work.** The seed chart-grouping round proposed additions despite existing consolidation. The operator asked A to inspect the existing process, then chose no change: S1:775-792, issues/chart/seed-root-cause/forks/chart-grouping.md:24-28 (923c6c9). C's original round claimed a grouping rule was missing and proposed extra mechanics: slots/chart-grouping-C.md:3,11,24,32,43 (923c6c9), contradicted by the settled fork at :27-28. The original round took 239.1 seconds and 13,448 A output (S1:687-752), then the correction required additional explanation and both final checks (S8:392-406,S7:320-332). Not all work in that fork was waste: verifying no change was necessary still had value. The exact avoidable fraction is **unmeasured**. Grounding and live-surface inspection are already required at SKILL.md:14-17,47. The new pitfall instruction does not authorize speculative additions.

F12. **Handoff cost is not between-fork latency.** After approval, seed handoff uses 333.0 seconds, 21,967 A output, 40,656 cache creation and 2,883,300 cache reads (S1:972-1117). The draft review wait alone is about 110.8 seconds (S1:1059-1063). Before review, the final-answer-to-handoff-proposal interval is 247.8 seconds and 15,800 A output (S1:792-956), including record edits, refresh, cap inspection, proofs and presentation. The obligations are SKILL.md:53,57-61,65,67,69,73-79 (readiness additions 97435f1, existing proof rules a72fa61, peer review ffd7be0, checkpoints b895b02). These can increase total pass cost but cannot explain a delay before each new fork. Source changed October 2, before the alleged October 4 threshold.

F13. **The other chart commits do not add a between-fork phase.** 036b367 removes the open-time lesson-prune offer from SKILL.md:29. 126e6d6 only tightens that sentence. 8f0338f changes handoff audit/done-criterion rules in shapes.md:252 and standing-design.md, not the number of independent fork rounds. 7c612ef adds the readiness example in shapes; 97435f1 formalizes readiness, grants, fixtures, key save, presence checks. The three seed commits change seed reporting, one-hop reading and related searches at skills/seed-issue/SKILL.md:26,46-60,75, not chart's blind peer exchange. Their indirect effect through larger future seed bodies is **unmeasured**. Do not claim zero indirect effect, but do not invent a new consolidation pass. Evidence: git show of the named commits and chart-grouping.md:27 (923c6c9).

## Material forks for improvement

The operator lock is to preserve the attended door, independent peer judgment when requested, one fork at a time, answer authority, lifetime pitfalls, and concrete reviewed handoff. Evidence for the current operator-facing contract: intake.md:7-11 (unversioned operator instruction), questions.md:27,29,48,50 (7bac4c1/fc1cd2e/ffd7be0), SKILL.md:65,67 (97435f1/ffd7be0). Recommendations below are engineering judgments. Savings and future failure probabilities are **unmeasured** unless expressly quantified above.

### Q1. Where should we remove repeated content while preserving full independent judgment?

O1. Recommended: keep peers' full independent analysis, but make the operator-ready merged round the one presentation source. Avoid generating another long variant before display. A's own evidence remains independently recorded, and attribution/rebuttal stays. The mechanism being targeted is measured duplicate payload generation in F7, not removal of a peer. questions.md:48,50 (ffd7be0), S1:452,464,489. Risk prediction, unmeasured: a premature single draft could anchor peers if shared before they finish. Preserve the existing blind boundary.

O2. Let peers return evidence/choices/disagreements only, while A renders full prose. This likely removes repeated prose, but changes the internal full-round contract at questions.md:48 (ffd7be0). Risk prediction, unmeasured: terse returns can conceal a missing lifetime pitfall, weaken independent reasoning or leave A to infer a recommendation. This needs an explicit fork decision and a representative quality comparison, not merely a word limit.

O3. Drop peers/rebuttals or turn them into a review of A's proposal. This changes how requested consultation works and violates the lock unless the operator explicitly changes it. Evidence: questions.md:40,48,50 and SKILL.md:67 (ffd7be0). Risk prediction, unmeasured: anchoring and missed cross-leaf obligations. It is outside the recommended optimization scope.

Practitioner questions: Is repeated prose serving an independent judgment or only serialization? Can a return explain an option's mechanism, evidence and remaining disagreement without copying the intake? Does the recorded merged artifact exactly match what the operator was shown? These derive from questions.md:27,48,50 and SKILL.md:51 (7bac4c1/ffd7be0/fc1cd2e), not outside-source claims.

### Q2. How do we stop growing-history cost without losing settled decisions?

O4. Recommended: send a bounded current-fork packet with intake, verbatim answer/correction, current question, relevant carries and exact live surfaces. Retain persistent sessions initially, avoid full-chart/raw-read dumps, and use the existing no-reread rule. questions.md:48, SKILL.md:6,51 (ffd7be0/0a6ea42/fc1cd2e). The measured target is B's 347k-input/186-output late check in F6. Savings are unmeasured.

O5. Fresh peer session per exchange, using the same complete packet. Risk prediction, unmeasured: fresh setup consumes input, loses prior operator nuance, breaks provenance continuity and may repeat research. Could outperform persistent growing context on late rounds, but this must be measured with the same fork and peer model. Current session cost is S8:71-455; independent full rounds remain questions.md:48 (ffd7be0).

O6. Share a neutral cache of exact source excerpts or common mechanical facts after the initial intake. Evidence origin and inspected revision stay attached. Risk prediction, unmeasured: shared interpretation would contaminate blindness, stale excerpts could hide changed contracts, and three peers agreeing on one bad summary is not independent verification. Research independence at questions.md:40,48 (ffd7be0) is the boundary. Share facts only after a deliberate decision about what counts as independent research.

Practitioner questions: What may be dropped after compaction? Which carries are material to this fork? Does the packet preserve operator corrections verbatim and separate source text from agent Findings? Can cached evidence be invalidated by revision rather than by guesswork? Current requirements: SKILL.md:6,31,49,51 and questions.md:48 (0a6ea42/ddd43fc/fc1cd2e/ffd7be0).

### Q3. Can orchestration wait less without changing readiness or human authority?

O7. Recommended: first keep existing script and prompt both peers before waiting, with A developing its view during peer work. Then measure true file-ready-to-observed delay before replacing polling. Already allowed/required: questions.md:44,48 (415fd09/ffd7be0). Do not claim the whole ~100-second blocked call can be saved. F9 measured total call wall time includes real peer work.

O8. Make waiting return on the matching exchange's completed file event as well as harness blocked/failure state, preserving confirmed-start and nonempty completed-result rules. Risk prediction, unmeasured: reading a partially written file, accepting an old return, losing a blocked notification or hanging after process death. Code today checks file size, scripts/peer-wait.ts:38-43,85-106 (8b0c0ae/67d255b). A stronger completion boundary, such as an atomic final result, must be evaluated before event-based readiness. This is a small internal mechanism decision, not a change to operator questions.

O9. Pre-research every future fork. Not recommended as a blanket optimization. The serial answer dependency is questions.md:29,40 and SKILL.md:51 (fc1cd2e/ffd7be0). Risk prediction, unmeasured: an answer invalidates the next fork, speculative research becomes wasted work, and stale questions accidentally appear authoritative. Only source discovery that cannot depend on the answer can overlap without changing the door.

Practitioner questions: Are B and C actually running together? Is A waiting before finishing its own evidence? Is the delay peer computation, harness idle lag, network interruption or file detection? Is every return path fresh? Can readiness distinguish full completion from the first bytes? questions.md:44,48 (415fd09/ffd7be0), peer-wait.ts:85-106 (8b0c0ae/67d255b), F9/F10 measured evidence.

### Q4. How do we preserve lifetime pitfall handling without expanding every fork into a design project?

O10. Recommended: keep the 7bac4c1 behavior, but apply its existing proportionality and materiality boundaries. Name the concrete trap, the responsible removal mechanism and a cost where one remains. Do not add speculative operations or reopen a contract already covered by inspected code. questions.md:3,27 and SKILL.md:37,47 (7bac4c1). The measured correction in F11 is the concrete failure to prevent.

O11. Revert the pitfall change. Risk prediction, unmeasured: options return to listing warnings without deciding who removes them, and implementation can inherit unresolved operational hazards. This changes the behavior the operator likes, questions.md:27 (7bac4c1), and is outside the recommendation.

O12. Restrict all forks to a fixed number of words/questions/pitfalls. Not recommended. Material unresolved questions must remain open, questions.md:29 and SKILL.md:51 (fc1cd2e). Risk prediction, unmeasured: fixed caps hide a real decision or force checklist padding on a small one. Semantic completeness and concise prose fit the operator's supplied instructions better than exact-format gates.

Practitioner questions: Is this a material choice or an existing invariant? What concrete observed scenario changes if we choose the option? Does the avoidance step have an owner? Is a required external probe being confused with a leaf's done-criterion? Would this extra rule change a present behavior? questions.md:27, SKILL.md:14-17,53,55 (7bac4c1/97435f1).

### Q5. Can the first displayed round already use the operator's preferred language?

O13. Recommended: write the required first round in the operator's established elid level. Keep every decision element, use plain terms, define chart/handoff terms once and avoid multi-step implementation lists inside each choice unless they decide something. The four isolated rewrites in F8 are a measured 6,537 output-token target. Avoidable savings are still unmeasured because some users may ask new questions anyway. Evidence: S1:416,492,581,965 and questions.md:10,27 (7bac4c1).

O14. Suppress detail or collapse answerable questions to obtain a shorter reply. Risk prediction, unmeasured: the operator approves without understanding the choice, misses an omitted material question or unknowingly accepts a cost. Preserve questions.md:27,29 (7bac4c1/fc1cd2e). This is not the same as concise language.

Practitioner questions: Can the operator tell what happens, why it wins and what it costs on first read? Is terminology like planning being used for charting without saying so? S1:763-788 and S2:129-132 demonstrate the specific ambiguity. Existing round context requirement is questions.md:3,10,27 (7bac4c1).

### Q6. Which handoff work can be cheaper without weakening the proof/grant boundary?

O15. Recommended: optimize duplication and command output before weakening required proofs. Keep one reviewed contract with linked evidence, perform each actual checkpoint once per deduplicated repo at that checkpoint, and avoid broad source dumps when a relevant function suffices. Current behavior already permits coincident checkpoints to count once: SKILL.md:69 (b895b02). Preserve real operation calls, scoped identity and cleanup, SKILL.md:53,57-61,73-79 (97435f1/a72fa61). F12 supplies measured phase costs but does not separate each proof's cost.

O16. Exempt prose-only skills or familiar commands from required operation proof. Changes the rule at SKILL.md:53 and shapes.md:250 (97435f1/a72fa61). Risk prediction, unmeasured: leaf contracts again depend on an unproven identity, target or CLI call. It requires an operator decision about the guarantee. It must not be disguised as a latency implementation detail.

O17. Ask fewer peers to review each leaf or review before approval. Changes SKILL.md:67 (ffd7be0). Risk prediction, unmeasured: a leaf miss survives, a later operator change invalidates the earlier review or the handoff is written before the concrete approved contract. Optimize review input size first.

Practitioner questions: Which calls prove behavior versus presence? Which identities/targets are identical? Is a refresh still current at the required checkpoint? Did a late operator correction change a mechanism, so a focused final check is required? Do retained fixtures have an owner/removal route? SKILL.md:53,59,67,69,73-79 and questions.md:50 (97435f1/ffd7be0/b895b02).

## Order and unresolved evidence

A1. Establish a reliable measurement ledger before claiming a regression: record invocation/answer/original-round boundaries, participant/model/effort, deduplicated usage by phase, operation failure, and original peer-result completion. Keep operator delay separate. This is an analysis requirement derived from M1-M4 and S6:556-559, not a proposal to add lifecycle states or repository telemetry. Dollar cost still needs actual billing evidence. No new repo files are requested here.

A2. First optimize O13 and O1/O4: first-pass plain language, one operator-ready rendering, bounded relevant context, and current-source inspection before new contract proposals. These preserve the visible door and address measured output/context duplication. Exact savings are unmeasured. Evidence targets F6-F8,F11, rules questions.md:27,48,50 and SKILL.md:6 (7bac4c1/ffd7be0/0a6ea42).

A3. Next inspect orchestration and any genuinely unnecessary extra checks using O7/O8, then decide whether an internal compact return protocol O2/O5/O6 is acceptable. Do not start by removing named peers, lifetime pitfalls, approval boundaries or real-operation proof. Those would change the maintained contract rather than optimize its execution: questions.md:27,29,40,44,48,50 and SKILL.md:53,65,67 (7bac4c1/fc1cd2e/ffd7be0/415fd09/97435f1).

Unmeasured: same-intake before/after replay, exact incremental cost of 7bac4c1, complete team totals for each baseline session, original seed/merge file-ready timestamps, actual billed dollars, provider throughput/queue latency, precise avoidable share of context/output/proof work, and quality loss from shorter peer returns or fewer passes. A consultant should not manufacture these numbers. The evidence supports specific cost mechanisms and specific stalled sessions. It does not support a single exact causal explanation for a general October 4 regression.
