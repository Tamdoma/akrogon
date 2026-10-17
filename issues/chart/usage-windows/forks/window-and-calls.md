# Chart windows, call counting and the savings report

## Question
Q1. How does the usage record mark which time belongs to which chart: one corrected open and close per chart, door-recorded active spans per chart summed by the script, or consultant sessions alone? Where does a shared opening map count, and how is the old base-red record read?

Q2. What is one call and what is its context size for each harness (claude, codex, pi), and do pi compaction records count?

Q3. How is the operator's savings check delivered: new columns on every usage run plus a done-criterion that runs base-red and this pass's charts side by side, or a separate compare mode?

### Carries
- Operator 2026-10-17, verbatim: "#100: per-chart usage windows plus pi support."
- Operator 2026-10-17, verbatim: "Savings check (approximate is fine): add a done-criterion to the #100 leaf. Run the fixed chart-usage.ts on the base-red chart as the baseline (old: long-lived consultants) and on the #99/#100 charts as the new case (fresh consultants). Print, per seat, calls, average context per call, input/cache-read tokens, output and minutes side by side, plus the rough % change in average consultant context per call. Rough baseline from the 2026-10-17 pass: A 141 calls at ~146k average context, B ~7.4M input for ~19k output, C 63 calls at ~84k average. The charts differ in size, so compare per call, not totals. Report the numbers. The check informs and never blocks a merge."
- Lock: issues/chart/chart-cost/forks/proof-of-saving.md Taken (seat record, script prints ids, times and numbers only, unmeasured never blocks handoff, no quality claim).
- Related: sibling chart fresh-consultants (#99), whose restart rule decides how many sessions a seat has per chart.
- Map: ../fresh-consultants/slots/map-merged.md.

## Findings
Full notes: slots/window-and-calls-{A,B,C}.md, merged in slots/window-and-calls-merged.md, rebuttals in slots/window-and-calls-rebuttal-{B,C}.md.
- better-than-training · chart-usage.ts:142-170, :255-281, :103-117, :361, read 2026-10-17 · claude groups by message.id, codex reads cumulative counters, no pi, one `opened` per chart · spans and a pi reader are needed.
- better-than-training · codex rollout rollout-2026-10-17T09-45-31-01a148d2-b706-7d93-acd8-744c86365e07.jsonl, checked by A 2026-10-17 (B's finding) · 77 unique `token_usage_record` response_ids in the base-red window: input 11,191,306, cached 10,918,272, output 39,829. base-red USAGE.md (cumulative counters) shows 10,869,186 / 10,603,136 / 32,535; the gap is two compaction responses (08:17:37Z, 09:01:54Z) the counters miss · codex calls come from per-response records.
- better-than-training · rollouts 01a1494d-b330, 01a14954-bb53, 01a14962-9a70 (this pass), checked 2026-10-17 · every one has `token_usage_record` lines · the savings check needs no cumulative-only path.
- better-than-training · old pi session 2026-10-15T19-43-57-606Z_01a14117 in the base-red window · 59 assistant calls, ~80.7k average context; its compaction at 08:17:02.991Z precedes the window (B,C).
- operator · savings words in Carries · per seat, per call, approximate, never blocks.

## Taken
A's pick under autopilot, 2026-10-17: 1a 2a 3a (not operator words).
- Q1 (1a): the door records `spans: [{from, to}]` per chart in seats.yaml, half-open, opened on chart entry, closed before another chart uses the door or consultants, a new span on re-entry; only the last span may be open and a run caps it at the explicit `<until>`. The script validates ordered, non-overlapping spans and clips working and operator-wait intervals to them. The shared opening map counts once, in the first chart of the pass, labelled shared-map overhead. A record with only `opened` reads as one legacy span `opened..<until>`, labelled `legacy window`; base-red uses `2026-10-17T09:04:40.067Z`. Reason: A's session spans every chart and restart-rule allows re-entry. Rejected: one corrected open/close (breaks on re-entry); sessions alone (A is shared).
- Q2 (2a): one call = one model response with usage, compaction included. claude: one per message.id, context = input + cache_read + cache_creation. codex: one per unique `token_usage_record.payload.response_id`, context = `usage.input_tokens` (cached is a subset), embedded copies in `compacted` skipped. pi: one per assistant message or compaction entry with `usage`, context = input + cacheRead + cacheWrite, `tokensBefore` ignored, zero-usage errors not counted. Average = total context / calls. Codex rollouts without per-response records keep token totals and show calls and average context as unavailable. Reasoning tokens stay separate. Reason: per-response records include compaction that counters miss; every current rollout has them. Rejected: `token_count` counting (misses compaction); an approximate legacy count (code no comparison uses). Standing dissent: C prefers an approximate legacy count, labelled approximate.
- Q3 (3a): calls and average context are columns on every usage run; no compare mode. The #100 leaf's done-criterion runs base-red (legacy window), fresh-consultants and usage-windows and records a per-seat table (calls, average context, input, cache read, output, minutes, window and session ids, legacy and shared-map labels) with % change `100 * (new / baseline - 1)` per consultant seat, B and C separately, `n/a` for zero or unmeasured; informative only, never blocks a merge. Rejected: compare mode (code for a one-off); totals (charts differ in size).

Correction from leaf review, 2026-10-17 (slots/leaf-review-B.md, slots/leaf-review-C.md): every span is cut at `<until>` and `<until>` keeps defaulting to now (C; B's explicit-cutoff requirement held as dissent); a call belongs to the span holding its final record, claude groups formed over the whole session (C); pi assistants with `stopReason: "error"` and `totalTokens` 0 are not calls (B,C); pi `usage.reasoning` prints as `reasoning_output_tokens` (C); a seat with any session lacking a call count shows calls unavailable (B); a span stays open while the door waits on this chart's consultants (B).
