# Brief: usage-spans

## What
`seats.yaml` gains an optional top-level `spans:` list of half-open `[from, to)` windows, the last one allowed to omit `to`. `chart-usage.ts` counts every seat's records only inside those spans, each span cut at `<until>` (today's default stays) (C), and reads a seats.yaml without `spans` as one legacy span `opened..<until>`. It reads pi sessions (the seat's `session` is the session file path) and prints, per seat, `calls` and `average context per call`. One call is one model response that reports usage, compaction included. The door's prose says when it writes spans. The leaf report carries the operator's per-call savings comparison.

## Why
Charts opened in one pass share a single `opened` time, so each chart's table also counts the other charts' work (Tamdoma/akrogon#100; base-red, loop-counts and failed-cause all show 08:17:04Z). pi consultants are always `usage unmeasured`. The operator wants to see whether fresh consultants (#99) cut the context each call re-reads.

## Done-criteria
1. Spans (own test): with `spans` `[{from: t1, to: t2}, {from: t3}]` and `<until>` t4, records in `[t1, t2)` and `[t3, t4)` count, records in `[t2, t3)` and at exactly t2 do not, and a turn or operator turn that crosses a span edge counts only its minutes inside a span. A closed span whose `to` is later than `<until>` stops at `<until>`, and a span starting at or after `<until>` counts nothing (C). A call belongs to the span holding its final record: a claude `message.id` group is formed over the whole session first and placed by its last record, using that group's final counters and largest output, so a group straddling an edge counts once, in one chart (C). Without `spans` the window is `[opened, <until>)` and USAGE.md's window line says `legacy window`. Spans that overlap, are out of order, have `to <= from`, or leave a span other than the last without `to` make the script exit non-zero, name the field and write no USAGE.md.
2. Calls and context (own test, each expected number hand-computed in the test from the fixture):
   - claude: calls = distinct `message.id`; average context = (input_tokens + cache_read_input_tokens + cache_creation_input_tokens) / calls.
   - codex rollout with `token_usage_record` lines: one call per unique `payload.response_id`. Compaction responses count, and the copy inside `compacted.latest_token_usage_record` is skipped. Token totals come from the same records. Average context = input_tokens / calls, with cached input never added.
   - codex rollout without `token_usage_record` lines: token totals as today, and `calls unavailable (cumulative-only rollout)`.
   - pi: one call per `message` entry with role `assistant` and a `usage` object, plus each `compaction` entry with `usage`. An assistant with `stopReason: "error"` and `usage.totalTokens` 0 is not a call and adds no tokens, while an error with nonzero usage counts (fixture source line 566 is such a zero error) (B,C). `tokensBefore` is never read. Average context = (input + cacheRead + cacheWrite) / calls. Token lines use the claude names: input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, plus `reasoning_output_tokens` from `usage.reasoning`, kept out of context and output (C).
   - A seat whose sessions do not all give a call count (for example one modern and one cumulative-only codex rollout, or one session unmeasured) prints `calls unavailable` and no average, while its available token totals still print (B).
   - Zero calls print `average context per call n/a`. A pi session path that does not exist, or a pi assistant message without `usage`, gives `usage unmeasured` naming the path or field while other seats still measure.
3. Prose: `skills/chart-issues/SKILL.md` (seat record), `skills/chart-issues/assets/shapes.md` (seats.yaml) and `docs/guide/chart.md` say what the door does with spans:
   - It opens a span when it begins work on a chart. After outstanding consultant turns are collected, it closes the span on handoff, close or hold, when the chart waits on an approval, need or prerequisite, or before switching to another chart. It keeps the span open while waiting on this chart's consultants (B).
   - It opens a new span on re-entry. Only the last span may be open.
   - The first chart's first span covers a shared opening map, so the map counts once.
   - A record without `spans` reads as a legacy window.
   - `calls` and `average context per call` mean what criterion 2 defines.
   - pi seats are measured.
4. Savings check, informative only (it never blocks a merge, and missing or unmeasured fields still satisfy it):
   - Copy `seats.yaml` from `/home/ivan/Work/infra/akrogon/issues/chart/base-red`, `fresh-consultants` and `usage-windows` into scratch folders named after each chart, so no file under the main checkout's `issues/` is written.
   - Run the fixed script on each copy, with `CLAUDE_CONFIG_DIR` and `CODEX_HOME` unset or set to the operator's own `~/.claude` and `~/.codex`. Use `<until>` `2026-10-17T09:04:40.067Z` for base-red. For the other two, use each chart's last span `to`.
   - In `implementation/report.md`, put one side-by-side table per seat (A, B, C) × chart: calls, average context per call, input, cache read, output and working minutes, with the window or spans and session ids used.
   - Under the table, give the % change in average context per call `100 * (new / base-red - 1)` for B and for C separately, for each new chart, with `n/a` where either side is zero or unmeasured.
   - State that base-red is a legacy shared window, that fresh-consultants carries the shared opening map, and that the figures are observational with no cause or quality claim.
