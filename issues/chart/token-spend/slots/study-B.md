# B: Where door A's context comes from

The clearest cuts are duplicate skill text, unrelated files restored after compaction, and oversized command output. Consultant returns are large, but this audit does not establish that their reasoning can be removed without affecting decisions.

## Measurement

Source **T** is /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/c954dd5e-b178-44b7-8495-f725d95b59e5.jsonl. This audit fixes its boundary at **line 3567, 2026-10-17 16:49:24Z**, before the token-study discussion. Later additions to this live file are excluded.

**Native tokens** below come from usage counters. **c4** means characters divided by four, a rough text-size proxy, not Claude tokenization. Content-size tables describe text entering the transcript, not its exact share of a later context or bill. Tool blocks and compaction can change how text is retained.

Savings estimates count input tokens, including cache reads. They are not dollar savings. For replay estimates, I hold request count and compaction boundaries constant and multiply removed c4 by subsequent requests before the next compaction. Real runs must verify the result because smaller context can delay compaction.

## Findings

### F1. Count API requests, not assistant transcript rows

The audited interval has **993 assistant rows but 479 distinct message IDs and request IDs**. Several rows contain different blocks from the same response and repeat its usage counters.

Deduplicating by message ID gives:

| Measure | Native tokens |
|---|---:|
| Uncached input | 962 |
| Cache creation | 1,404,593 |
| Cache read | 66,516,610 |
| Total input, including both cache categories | 67,922,165 |
| Output | 459,405 |
| Average input context per request | 141,800 |

The shared brief's “1003 assistant calls” should not be treated as 1003 API requests. Its exact observation boundary differs from mine. The existing chart-usage script already groups by message ID correctly, so this is not a proposed script fix.

I reproduced the report's three chart windows with parsed timestamps and final-row ownership:

| Chart | Requests | Total input | Average context |
|---|---:|---:|---:|
| base-red, 08:17:04–09:04:40 | 110 | 15,154,945 | 137,772 |
| fresh-consultants, 10:07:32–10:22:40 | 36 | 5,899,077 | 163,863 |
| usage-windows, 10:22:40–10:35:45 | 37 | 4,514,350 | 122,009 |
| door-handover, 15:43:32–16:49:07 | 162 | 24,012,924 | 148,228 |

Sources: T:32–3567; /home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/chart-usage.ts:181–205; /home/ivan/Work/infra/akrogon/issues/closed/usage-windows/usage-spans/implementation/report.md:37–41. The three legacy charts base-red, loop-counts and failed-cause overlap. Do not add their window totals as independent work.

### F2. The fixed start is real, but tool-schema tokens cannot be isolated from this transcript

The first request has **58,096 native input tokens before any tool result**. Visible initial components are:

| Component | Characters | c4 | Source |
|---|---:|---:|---|
| System prompt snapshot | 10,550 | 2,638 | T:27 |
| Skill catalog, 97 entries | 30,080 | 7,520 | T:15 |
| Invoked chart-issues instructions | 26,193 | 6,548 | T:9 |
| CLAUDE.md and haiku rule, including wrappers | 14,459 | 3,615 | T:22 |
| Deferred tool names | 4,572 | 1,143 | T:12 |
| MCP instructions | 3,733 | 933 | T:14 |
| Subagent descriptions | 2,502 | 626 | T:13 |
| Other initial rendered attachments and operator prompt | 4,301 | 1,075 | T:8,10–26 |

The system snapshot includes **4,107 characters of Chrome instructions**. No browser tool is called in this interval. The used tools are Bash, Write, Edit, Read, Skill, Agent, ToolSearch, WebSearch and WebFetch.

The visible pieces total 96,390 characters. Their c4 total is not the native 58,096-token total. Tool schemas, wrappers and tokenizer differences prevent assigning the remainder to “tools” honestly. Prompt snapshots are records of the prompt, not additional messages to count twice.

### F3. File content dominates tool-result volume

There are **467 tool results, containing 1,211,530 characters, approximately 302,883 c4**. Bash accounts for 420 results and 1,113,889 characters.

The following is an approximate, mutually exclusive allocation by the command's main purpose. Shell commands often mix reads, peer calls, status and writes. Counts and character sums are exact for the assigned buckets, but the semantic split is approximate.

| Result origin | Results | Characters | c4 | Share of result characters |
|---|---:|---:|---:|---:|
| Process instructions and reference reads/searches | 42 | 345,839 | 86,460 | 28.5% |
| Consultant return reads | 75 | 331,734 | 82,934 | 27.4% |
| Other file reads, including source and chart records | 113 | 331,201 | 82,800 | 27.3% |
| Herdr and peer orchestration | 126 | 124,655 | 31,164 | 10.3% |
| Commands running chart-usage | 18 | 19,707 | 4,927 | 1.6% |
| Other searches and Git inspection | 29 | 14,375 | 3,594 | 1.2% |
| WebFetch and WebSearch | 11 | 27,888 | 6,972 | 2.3% |
| Other Bash | 20 | 6,258 | 1,565 | 0.5% |
| Agent launch receipts | 4 | 4,360 | 1,090 | 0.4% |
| Write, Edit, ToolSearch and Skill receipts | 29 | 5,513 | 1,378 | 0.5% |

Large examples: question/shapes references, 32,980 characters at T:43; B/C opening maps, 32,166 at T:148; full chart skill, 34,145 at T:2359; a peer-restart reference search, 31,598 at T:2580. That search returns whole long Markdown paragraphs despite a line-count limit.

Method: join each tool_result.tool_use_id to its earlier tool_use, measure content strings directly and JSON-serialize non-string content with ensure_ascii=False. Classify mixed shell commands by purpose, with the large mixed results checked individually. These buckets are an audit aid, not a billing allocation.

### F4. A's own writing is substantial, especially shell commands containing artifacts

A emits **108,353 characters of prose** and **528,774 characters of serialized tool arguments**. Of the arguments, **450,495 characters are Bash inputs** and **63,797 are Write inputs**. Much of this writes briefs, findings, merged notes and required records.

Native output is **459,405 tokens**, including **174,147 reported thinking tokens**. Most thinking is not visible. I excluded 990,128 characters of opaque thinking signatures from text estimates. Do not treat those signatures as readable prompt tokens.

Within base-red, prose is 14,812 characters versus 157,216 argument characters. Within door-handover, it is 26,605 versus 171,741. Shortening user-facing updates alone therefore misses most visible writing.

Source: T:32–3567, assistant content blocks and deduplicated usage. Required artifact writing is not automatically waste, and this audit does not recommend deleting records.

### F5. Compaction restores a meaningful amount of old material

Seven compactions occur at T:300,776,1269,1787,2330,2829,3455. First-request contexts afterward are **64,927; 69,989; 67,437; 67,393; 68,370; 68,367; 64,714** native tokens. The brief's 85k–120k description does not describe these immediate first requests.

Across those boundaries the transcript records:

| Restored material | Count | Characters | c4 |
|---|---:|---:|---:|
| Invoked-skill attachments | 7 | 215,482 | 53,871 |
| Full file attachments | 27 | 183,286 | 45,822 |
| Compaction summary text | 7 | 92,773 | 23,193 |

These are cumulative insertions across boundaries, not simultaneous retained context. The summary records also have transcript-visibility metadata, so their character size must not be added mechanically to API usage.

Each invoked-skill attachment restores chart-issues and seed-issue. The seed skill alone totals **69,546 characters, 17,387 c4**, across the seven restorations. Only two actual seed-issue invocations occur, at T:230 and T:2287.

Sources: T:307,787,1280,1798,2341,2840,3466 for restored skills; T:306 and subsequent attachment.type=file records; T:301 and subsequent isCompactSummary records.

### F6. Some repeat reads are duplicates, but many are legitimate recovery or changed versions

**Concrete same-context duplication:** T:2341 restores the first 20,000 characters of chart-issues. T:2359 then reads its entire 33,625-character source, producing 34,145 characters with line numbers. After removing line numbers, **19,831 contiguous characters match the restored text**. That is approximately **4,958 c4 duplicated before 70 subsequent requests**, or **347,042 c4 input exposure**, 1.45% of door-handover input.

The restored skill is capped at 20,000 characters. **Deleting the whole later read would lose the final instructions.** Read the missing portion while retaining the matching prefix.

Other repeats:

| Material | Evidence | Interpretation |
|---|---|---|
| Chart skill after the first compaction | T:307 and T:319 share 19,900 contiguous characters | Another restoration/full-invocation overlap, not a tool-result duplicate |
| shapes.md full reads | T:43,367,1522 | At least three reads, but compactions intervene and the later version grows from 19,991 to 21,710 characters |
| questions.md restored files | T:306,1278,1795,2340 | Four restorations, three distinct content hashes. T:1278 and 1795 are byte-identical source content |
| Door-handover B map | T:2813 and T:2870 share all 13,566 characters of the first result | Compaction T:2829 intervenes. Re-reading the live chart map is justified recovery |
| akrogon config | T:337 and T:3041 are identical 2,354-character results | Hours and several compactions separate them |

No complete tool-result string of at least 1,000 characters repeats verbatim inside another result in the same compaction interval. That does not rule out repeated sections or the same file in differently wrapped output. It does rule out claiming that most consultant reads are proven duplicate full-result dumps.

### F7. “No observed later use” is narrower than “the model did not use it”

The following are credible removal candidates, with different confidence:

| Material | Number and evidence | Assessment |
|---|---|---|
| Unrelated Herdr roster fields and panes | T:44 has 46 pane/agent entries across two JSON objects, 22,034 JSON characters. Selecting the three chart panes and pane_id/name/agent/agent_status/agent_session/cwd produces 1,490 characters | High confidence that scroll geometry, unrelated workspaces and terminal IDs are unnecessary for this peer lookup |
| Repeated full Herdr agent roster | T:336 has 19 entries and 10,362 JSON characters. The same relevant projection is 749 characters | High confidence. head -50 does not shorten a one-line JSON document |
| Old red-base-policy B notes | 8,261-character file attachment at T:1277. No later assistant reference to its filename before the next compaction | Medium confidence. No visible operational reuse, but filename absence does not prove no influence |
| Old loop-counts A notes | 2,701-character attachment at T:1797. No later assistant reference before T:2330 | Medium confidence. This chart's closed notes follow A into usage work and later tasks |
| Inactive seed instructions | 10,394 characters restored at each of T:2341,2840,3466, with no subsequent seed invocation through the cutoff | High confidence that seed workflow instructions are not executed during this interval |
| Chrome guidance and most skill-catalog entries | 4,107 Chrome instruction characters and a 97-entry catalog, versus no browser tool use and only chart-issues/seed-issue skill invocations | High confidence on non-invocation, lower confidence on what catalog discovery information can safely be omitted |

Settings.json is **not** a clean unused-read example. It is restored at T:2838 and mentioned again by A at T:3004 and 3018. I excluded it from proposed stale-file savings.

### F8. Chart-usage output and direct subagent returns are secondary

Commands invoking chart-usage account for approximately **4,927 c4**, just **1.6% of tool-result text**. This includes mixed status output, so the usage report itself is smaller. Preserve cost recording.

Four Agent calls return launch receipts totaling 4,360 characters. Three substantive handbacks visible by the cutoff contain **24,691 characters** at T:135,420,2162, approximately **6,173 c4**. These arrive through queued attachments or user-message delivery, not the Agent result body. Queue-operation records duplicate delivery bookkeeping and are not extra model-visible reports to count again.

This measures what A receives, not the subagents' own token consumption.

## Cuts that keep the steps and records

Percentages below are relative to A's total input for the named chart. These are independent estimates, not an additive forecast.

### C1. Project Herdr JSON before returning it to A

Keep peer discovery, session identity, status and necessary error details. Return the relevant tab/panes and fields instead of the full machine roster.

**Saving:** T:336 alone removes 9,613 characters, approximately 2,403 c4, before 55 subsequent requests. Estimated base-red saving: **132,179 input tokens, 0.87%**. T:44 offers another **169,488 c4 of replay exposure** before its next compaction. Savings are zero on charts that already use concise projections.

**Same process:** All peer checks and calls remain. Only unrelated output is omitted.

**Could break:** Filtering by guessed pane IDs could hide a replacement or missing peer. First discover the relevant tab roster, then select identified seats. Preserve nonzero exits and errors.

**Verify:** Compare selected peers, session IDs and status transitions against the original output, including a missing peer and a changed session. Measure native context before and after.

### C2. Read only missing skill content after restoration

When a restored prefix matches the current file, retain it and read the missing tail or changed sections. Do not remove the read merely because the filename appeared earlier.

**Saving:** The T:2341/T:2359 case removes approximately **4,958 c4** once, yielding **347,042 input tokens per door-handover chart, 1.45%** under the recorded boundaries. A chart without this overlap saves zero.

**Same process:** A receives all the same operative instructions once. All workflow stages remain.

**Could break:** Skill versions changed during this session, and automatic restoration truncates at 20,000 characters. Skipping a changed prefix or a truncated paragraph would lose instructions.

**Verify:** Compare content/version and coverage, not just the path. Ensure the complete skill, including the tail after the restoration cutoff, is available exactly once.

### C3. Restore active work, not every previously invoked skill and old chart note

Keep current chart evidence, unresolved decisions, authority and required references. Load an inactive skill again when invoked. Stop automatically restoring closed-chart artifacts without a current dependency.

**Saving from inactive seed instructions alone:** approximately **264k per base-red chart, 1.74%; 86k per fresh-consultants chart, 1.46%; 89k per usage-windows chart, 1.97%; 418k per door-handover chart, 1.74%**. Two specific stale note attachments add approximately **74k/1.26% in fresh-consultants** and **32k/0.71% in usage-windows**, with medium confidence.

**Same process:** Records remain on disk and all required skills still run when called. This changes context retention, not workflow steps.

**Could break:** Historical evidence may still govern an active decision. Filename non-use is insufficient to remove it automatically. Runtime support for selecting restored attachments has not been verified.

**Verify:** Have a reviewer check the active dependency set before excluding artifacts. Resume from the compacted context and verify the same outstanding constraints, authority, decisions and records. Treat the stale-note saving as provisional until that succeeds.

### C4. Shorten the fixed catalog and defer unused integration instructions

Retain discoverable skill names and useful short descriptions. Load full integration guidance when that integration is used. Do not remove user rules or required chart/seed instructions.

**Saving scenario, low confidence:** A **6,000-token reduction in fixed context**, if confirmed on native measurements, saves **216k in fresh-consultants, 3.66%; 222k in usage-windows, 4.92%; 660k in base-red, 4.36%**. The visible 30,080-character catalog plus unused Chrome guidance make this worth measuring, but they do not prove a 6,000-native-token saving. The transcript does not expose enough tool-schema detail to promise a larger cut.

**Same process:** The same capabilities remain available through discovery, with the same instructions loaded before use.

**Could break:** An over-short description can prevent selecting a required skill. The runtime may not support the intended lazy loading.

**Verify:** Run fresh-start and post-compaction context measurements. Check that chart-issues, seed-issue, web research and required peer tools remain discoverable and usable before relying on this estimate.

### C5. Bound broad search output by relevance, not line count

Return filenames and short matched excerpts first, or query the already-known relevant sections. Read complete operative paragraphs when needed. Do not blindly truncate evidence.

**Saving scenario, low confidence:** Reducing T:2580's 31,598-character reference dump to 8,000 relevant characters removes approximately **5,900 c4**. Across its 35 remaining requests before compaction, that is **206k input tokens per door-handover chart, 0.86%**. The 8,000-character target is a scenario, not an observed equivalent result.

**Same process:** A still finds references and inspects the governing code and rules.

**Could break:** Missing a reference or requiring extra model turns can erase the saving. One extra request costs roughly 142k input tokens at this session's average context.

**Verify:** Compare the discovered references and the resulting decisions. Count additional requests as well as reduced output. Reject this cut if it loses evidence or merely trades one large output for several expensive calls.

## Large reductions that need a process or quality decision

- **P1. Skip maps, blind notes, rebuttals, review or record writing.** This removes required work. It cannot be counted as an unchanged-process saving.
- **P2. Replace full consultant evidence with summaries or strict word limits.** Consultant reads contribute roughly 83k c4 of tool output, but this study has no proof that removing their reasoning preserves decision quality.
- **P3. Restart A at every chart or move A's work to another agent/model.** A reset from the observed 122k–164k average contexts to the 58,096-token fresh start suggests a theoretical **52%–65% per-call context reduction before rebuilding active context**. Actual charts immediately grow again. State reconstruction, authority and session continuity require the separate handover design and validation. This is not a measured saving from the smaller presentation cuts above.

## Inputs read, skipped and confidence

**Read:** brief-B.md and common.md; structural records and selected content from T through line 3567; seats.yaml for all seven named charts; the usage report's relevant rows; chart-usage.ts grouping logic; byte/character sizes of the pinned release's SKILL.md, questions.md and shapes.md. CLAUDE.md/rules content sizes were taken from the historical transcript attachments, which reflect what A actually received.

**Skipped:** consultant session logs and the contents of every return file on disk. A's actual returned text is already in T. No need to charge consultant-internal tokens to A. I did not run chart-usage.ts because it writes USAGE.md and the brief permits writing only this return file. Its relevant results were reproduced by read-only JSONL analysis.

**High confidence:** distinct request counts, native usage totals, measured character sizes, exact repeated text, actual tool/skill invocations and reproduced chart windows.

**Lower confidence:** semantic allocation of mixed Bash output, c4-to-native-token conversion, semantic non-use inferred from missing references, availability of runtime retention/catalog controls and prospective savings after compaction timing changes.

Prioritize C1 and C2 for concrete, reviewable reductions. C3 has broader potential once active dependencies and runtime controls are checked. None of the evidence supports removing peer reasoning or workflow stages merely to reduce tokens.
