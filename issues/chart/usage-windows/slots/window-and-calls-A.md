# window-and-calls, slot A notes (written before reading B and C)

## Q1 pick: door-recorded active spans per chart, for every seat; a legacy record (only `opened`) reads as one span from `opened` to `<until>`
Each chart's seats.yaml gets `spans:` entries `{from, to}`: a span opens when the door begins work on that chart and closes when the door leaves it (handoff, close, hold, a wait, or moving to another chart); re-entry opens a new span. The script counts a record only inside a span of its chart. The shared opening map is one span recorded in the first chart created in the pass only; the others name it in their Autopilot/usage line, so no time is counted twice.
Reason: with restart-rule Taken, consultants already get a new session per chart entry, so their attribution is exact; A's door session is the one shared across charts, and only time marks can split it. Spans are the smallest record that survives interleaving (SKILL.md Drain: charts wait and resume).
Cost: the door writes two timestamps per chart entry; a forgotten close leaves a span open until `<until>`.
Rejected: one corrected opened/closed per chart (breaks on interleaving, which autopilot does when a chart waits); sessions alone (A is shared).

## Q2 pick: one call = one model response with usage, counted once; context = all input tokens the call read
- claude: one call per distinct `message.id` (non-sidechain, already grouped by chart-usage.ts); context = input_tokens + cache_read_input_tokens + cache_creation_input_tokens of the group's last record.
- codex: one call per `token_count` event whose cumulative `total_token_usage.input_tokens` increased over the previous event; context = that increase (codex input already includes cached input, so cached is not added).
- pi: one call per record carrying `usage` (assistant messages and compaction records alike); context = input + cacheRead + cacheWrite.
Reason: each definition reads the field the harness already reports per call, so a call is one billed request on every harness. Compaction is a real model call that costs.
Cost: compaction calls lower pi's average when they are small; they are few.
Rejected: counting turns (a turn has many calls); input + cached for codex (double counts).

## Q3 pick: calls and average context per call become columns on every usage run; the #100 leaf's done-criterion runs base-red (legacy window, until 2026-10-17T09:04:40.067Z from its USAGE.md) and the fresh-consultants and usage-windows charts and records a side-by-side table with the % change of average context per call for B and C in its report
Reason: removing over adding: no compare mode or new flag; the comparison is a one-off reading of numbers the script prints anyway. Per-call average resists the base-red window overlap (totals do not).
Cost: the comparison is manual arithmetic in the report, once.
Rejected: a separate compare mode (code kept for a one-off).

## Evidence
- better-than-training: chart-usage.ts:142-170 (claude grouping by message.id), :255-281 (codex cumulative counters, reset refusal), :103-117 (no pi), :361 (single opened); pi usage fields from the 2026-10-15 session file (assistant `usage {input, output, cacheRead, cacheWrite, totalTokens}`); restart-rule Taken.
- operator: savings check words in Carries.

## Pitfalls
- Double counting at span edges: a record belongs to a span when from <= t < to.
- Codex duplicate or zero token_count updates: counted only on an increase.
- Old records: legacy form stays readable, labelled `legacy window`.
- Unmeasured stays unmeasured: missing pi usage fields give `usage unmeasured`, never zero.
- Historical seats.yaml edits are door work on main, not the leaf (shapes.md issues/ rule).

## Question the fork does not ask
- Should the door write spans for charts already handed off? No; legacy reading covers them.
