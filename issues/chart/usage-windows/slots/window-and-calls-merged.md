# window-and-calls, merged notes

## Q1 chart windows
- Door-recorded active spans per chart, half-open `[from, to)`, summed by the script. Open on entry, close before another chart uses the door or consultants, new span on re-entry; only the current chart's last span may be open and a run caps it at the explicit `<until>` (A,B,C). Reason: A's session spans every chart, and re-entry is allowed by restart-rule Taken. Cost: a small record update per chart switch.
- Shared opening map counts once, in the first chart (A,B), which here is also the chart holding the map files (C), labelled shared-map overhead.
- Legacy record (only `opened`): one span from `opened` to an explicit end. For base-red use its USAGE end `2026-10-17T09:04:40.067Z`, labelled a legacy shared window. Never default to today and never infer the end from sessions (A,B,C).
- Validate ordered, non-overlapping spans and drop repeated seat/session entries (B). Clip working and operator-wait intervals to spans so gaps between charts are not work (B).
- Rejected: one corrected open/close (breaks on re-entry) (A,B,C). Sessions alone (A is shared) (A,B,C). Equal splitting (invents attribution) (B).

## Q2 calls and context
- One call = one completed model response with usage, compaction included; not a turn or tool call. Average context = total context / calls, weighted across sessions (A,B,C).
- claude: one call per `message.id`, existing grouping kept; context = input + cache_read + cache_creation (A,B,C).
- pi: one call per assistant message with usage, plus each compaction entry with usage; context = input + cacheRead + cacheWrite; `tokensBefore` is not usage (A,B,C). Zero-usage errors kept apart from measured calls (B). `/clear` and context-edit records are not calls (C).
- codex, three views:
  - one call per unique `token_usage_record.payload.response_id`, context = its `usage.input_tokens` (cached is a subset, never added); skip the copy inside `compacted.latest_token_usage_record` (B).
  - one call per `token_count` event, usage from `last_token_usage` or the cumulative delta (C).
  - one call per `token_count` event whose cumulative input rose, context = the rise (A).
- Cumulative-only (old) codex rollouts: calls and context shown unmeasured, token totals kept (B), or an approximate count (A,C).
- Reasoning tokens stay a separate field, not added to output or context (C).

## Q3 savings report
- Calls and average context become columns on every usage run; no compare mode (A,B,C). Reason: a one-off reading of numbers the script prints anyway. Cost: USAGE.md is slightly wider.
- The #100 done-criterion runs base-red (legacy window), fresh-consultants and usage-windows with fixed ends and records one side-by-side table in the leaf report: per seat calls, average context, input, cache read, output, minutes, plus window and session ids and the legacy/shared-map labels (A,B,C).
- % change per consultant seat = `100 * (new / baseline - 1)`, separate for B and C; a pooled B+C figure only if asked, computed from combined totals (B,C). Zero or unmeasured gives `n/a` (B,C). Numbers are reported even when they rise; no threshold, no causal or quality claim (A,B,C).
- Rejected: compare mode (adds argument parsing and persistence for one check) (A,B,C). Totals (charts differ in size) (A,B,C).

## Evidence
- A check, 2026-10-17, of B's claim on rollout `rollout-2026-10-17T09-45-31-01a148d2-…jsonl`: 104 `token_usage_record` lines each with `response_id` and per-response `usage`; in the base-red window, 77 unique responses, input 11,191,306, cached 10,918,272, output 39,829. base-red USAGE.md shows 10,869,186 / 10,603,136 / 32,535 from cumulative counters; the gap equals two compaction responses (08:17:37Z, 09:01:54Z) that the counters miss (B; A confirmed totals).
- Old pi session in the base-red window: 59 assistant calls, ~80.7k average context; its compaction at 08:17:02.991Z falls before the window (B,C).
- chart-usage.ts: claude grouping :142-170, codex cumulative counters :255-281, no pi :103-117, single `opened` :361 (A,B,C). Fixtures hold only the old cumulative codex format (B,C).
- Operator savings words in fork Carries; chart-cost proof-of-saving Taken: numbers only, never blocks (A,B,C).

## Pitfalls and what removes them
- Double count at a span edge: half-open spans (A,B,C).
- Codex compaction missed: per-response records (B).
- Missing usage read as zero: shown `usage unmeasured` / `n/a` (A,B,C).
- Historical seats.yaml edits are door work on main, not the leaf (A,B).
- Fixtures for leave/return, adjacent edges, live cutoff, shared map once, duplicate claude blocks, codex compaction copy, pi compaction with and without usage, zero calls (B).

## Points where slots differ
- Q2 codex call unit: per-response `token_usage_record` (B) vs `token_count` events (A,C). A's own check shows `token_count` counters miss compaction.
- Q2 old cumulative-only codex: unmeasured (B) vs approximate (A,C).

## Open
- Does the operator accept charging the shared map to the first chart (B)?
