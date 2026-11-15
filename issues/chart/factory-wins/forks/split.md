# Split of the survey into charts

## Question

1. Which charts both seats support are opened, and in what order?
   - 1a (recommended) Three charts: quick fixes (W1, W2, W4, W5), then the dispatch flake (W3), then rule source and reading (W7 then W8).
   - 1b Quick fixes only for now; the rest stays in the map.

2. Does the question-round problem (W9) get a chart?
   - 2a (recommended) Yes, after the rules chart. Its first fork finds the cause; no rule text is added before the cause is known.
   - 2b No. It stays listed; the existing plain-language rule is applied (slot B).

3. Does the seat usage record (W10) get a chart, and the fresh implement session (W11) with it?
   - 3a (recommended) The record only. W11 stays listed as the first decision the record serves.
   - 3b Both, W11 proven by the one paid before/after run (needs row N1).
   - 3c Neither.

4. May the door run `akrogon pack` for herdr-panels and tasks-panel?
   - 4a (recommended) Yes. Storage only.
   - 4b No, leave them.

### Carries

- Signposts (forks/signposts.md, Taken 2026-11-10): 1a 2c 3a 4a 5b 6a 7a. Needs row N1 (paid run cap) pending.
- The merged map: slots/map-merged.md. Win codes W1 to W11, dropped X1 to X5, earlier decisions E1 and E2.
- E1 and E2 are listed under 7a and reopen only when the operator names one.

## Findings

- Territory map sources: slots/map-A.md, slots/map-B.md, slots/map-merged.md, slots/open-grounding-A.md.
- Research for question 1: operator tier, issues/chart/sources/systems-thinking-field-manual.txt lines 1759-1766 (find the slowest stage first) and 2850-2851 (watch it run before changing anything), read 2026-11-09; factory records read 2026-11-10 show no akrogon stage is a bottleneck (merge wait about 1 minute, checks 23% of elapsed time at the median), so the order follows signpost 1a instead of the largest clock delay. Practitioner, cited by B and not read by A: Fowler on Beck's design rules (https://martinfowler.com/bliki/BeckDesignRules.html) for one rule source.
- Research for question 2: better-than-training, Anthropic, "Effective context engineering for AI agents", https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents, 2025-09-29, read 2026-11-10: recall falls as the context grows, and a long task continues in a new window from a summary or written notes. Practitioner, secondary accounts only (web search 2026-11-10, essay not read): Horthy, "Advanced Context Engineering for Coding Agents", 2025-08-29: research, plan and implement each run in a fresh window; the same accounts warn that compaction drops details whose importance shows later. Factory record: in 31 of 33 leaves implement starts with the whole plan conversation, about 100k tokens at the median; implement is 40.6% of 952.8M context tokens read (reader, spot-checked by A).
- Slots differ: B opens no chart for W9 (apply the existing plain-language rule) and none for W11 (no seat reset justified by the measurements); B takes W3 alone because its root cause is not established.

- Rebuttal (slots/map-rebuttal-B.md, 2026-11-10): B recommends its own plan and 2b-equivalent for W11; A conceded W6 (listed, not charted), W3 as its own chart, the rule source before question rounds, and W11 listed until the usage record exists. The question set above is the one shown to the operator; the first draft (three questions) was replaced before the round. Still differing: B opens no chart for W9 and opens W10 only on the operator's word. Pack is storage only (src/pack.ts `packFolderLocked`, read 2026-11-10): `.log` files go into one verified archive; it settles no usage accounting.

- Operator reply 2026-11-10, verbatim: "1a | 2a | 3 - look at the latest research on context. I think the models I've gotten much better when it comes to actually pulling things from the context and not straying away so fast. | 4a |". Questions 1, 2 and 4 are answered (1a, 2a, 4a). Question 3 is a request for research and stays open; its research is redone.
- Step on main for 4a, done 2026-11-10: `akrogon pack issues/chart/herdr-panels issues/chart/tasks-panel` printed "22 packed, 22 deleted" and "13 packed, 13 deleted", exit 0; no `.log` file remains in either folder; both `direct/evidence.tar.zst` show modified in git, not committed.
- Factory record for question 3 (A, 2026-11-10, from scratchpad map/tokens/raw.json and map/repairs/findings.tsv, 35 leaves, slot A implement): review findings per leaf against the context size of the first implement call, Spearman 0.56; against implement output tokens 0.81; first-call context against implement output 0.74; findings against first-call context with implement output held fixed -0.09, with implement calls held fixed 0.08. Reading: bigger jobs carry more plan chat and get more findings; once job size is held fixed, carried chat shows no link to findings. 35 leaves, observational, findings table has 76 rows from the reader.

- Research redone for question 3 on the operator's request (2026-11-10; Haiku web reader, then A opened the pages marked "A read"):
  - practitioner, A read: Rajasekaran (Anthropic Labs), "Harness design for long-running application development", https://www.anthropic.com/engineering/harness-design-long-running-apps, 2026-03-24: "we found Claude Sonnet 4.5 exhibited context anxiety strongly enough that compaction alone wasn't sufficient"; "Opus 4.5 largely removed that behavior on its own, so I was able to drop context resets from this harness entirely."; "when a new model lands, it is generally good practice to re-examine a harness".
  - better-than-training, A read: Burnham and Adamczewski (Epoch AI), "LLMs now accept longer inputs, and the best models can use them more effectively", https://epoch.ai/data-insights/context-windows, 2025-06-25: "the input length where top models reach 80% accuracy has risen by over 250x in the past 9 months"; caveat "Many long-context tasks are likely more difficult than these benchmarks."
  - practitioner, reader: Yan (Cognition), "Don't Build Multi-Agents", https://cognition.com/blog/dont-build-multi-agents, 2025-06-12: "Share context, and share full agent traces, not just individual messages."; "Actions carry implicit decisions".
  - practitioner, A read: HumanLayer, ace-fca.md, https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md (no byline or date on the page; August 2025 by its contents): "you probably want to pause your work and start over with a fresh context window"; "keeping utilization in the 40%-60% range". Written for 2025 models. The earlier note that it warns about compaction losing details is withdrawn: the page states no such downside.
  - better-than-training, reader (abstracts): Chroma, "Context Rot", https://www.trychroma.com/research/context-rot, 2025-07-14, 18 models: "model performance consistently degrades with increasing input length"; no 2026 replication found. Martin and Roger, arXiv 2605.12366, 2026-05-12, a monitoring task on Opus 4.6, GPT 5.4 and Gemini 3.1: misses rise "2× to 30×" after 800K tokens, far above the 45k to 438k carried here.
  - Not found: a study comparing a fresh and a carried session for plan then implement; any test of the model slot A runs on pi. 2026 long-context scores for current models were found only on secondary sites that contradict each other and are not used.
  - Cost: Anthropic pricing page, https://platform.claude.com/docs/en/about-claude/pricing (reader): "A cache hit costs 10 percent of the standard input price." Whether slot A's harness bills carried context at a cached rate is not recorded, so no dollar figure exists for the carried chat.
  - What it changed: A's recommendation. The newest first-hand source dropped context resets as models improved, the factory record shows no link between carried chat and review findings once job size is held fixed, and the fresh session would add a part and risk losing unwritten plan knowledge. A now recommends not charting W11 and leaving W10 listed until a decision needs it, which is B's rebuttal position (RB5, RB6). Question 3 as re-asked: 3a neither now, W11 dropped as a quality fix, W10 listed; 3b the usage record only; 3c both.

## Taken

- Operator, 2026-11-10, verbatim: "1a | 2a | 3 - look at the latest research on context. I think the models I've gotten much better when it comes to actually pulling things from the context and not straying away so fast. | 4a |". Then, to question 3 as re-asked after the redone research (its options there labelled 1a neither, 1b usage record only, 1c both): "1a".
- Question 1: 1a. Three charts in order: the quick fixes (W1, W2, W4, W5) in this chart, then `dispatch-flake` (W3), then `shared-rules` (W7 then W8). Foreclosed: quick fixes only.
- Question 2: 2a. `round-rewrites` (W9) is charted after `shared-rules`. Binding: its first fork finds the cause, and no rule text is added before the cause is known. Foreclosed: leaving it listed.
- Question 3: neither chart now. The fresh implement session (W11) is dropped as a quality fix; it stays in the map with its numbers and can return if slot A moves to a weaker model. The seat usage record (W10) stays listed until a decision needs it. Reason: the redone research and the factory record in Findings. Foreclosed: charting the usage record alone, charting both. Needs row N1 (paid run cap) has no consumer left in this session's charts.
- Question 4: 4a, done 2026-11-10 (Findings). Binding: packing is storage only and settles no usage accounting.
- Session order of charts: factory-wins (quick fixes), dispatch-flake, shared-rules, round-rewrites.
