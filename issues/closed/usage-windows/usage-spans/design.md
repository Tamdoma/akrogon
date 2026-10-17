# Design: usage-spans

## Binding decisions, verbatim

### window-and-calls (issues/chart/usage-windows/forks/window-and-calls.md), Taken
A's pick under autopilot, 2026-10-17: 1a 2a 3a (not operator words).
- Q1 (1a): the door records `spans: [{from, to}]` per chart in seats.yaml, half-open, opened on chart entry, closed before another chart uses the door or consultants, a new span on re-entry; only the last span may be open and a run caps it at the explicit `<until>`. The script validates ordered, non-overlapping spans and clips working and operator-wait intervals to them. The shared opening map counts once, in the first chart of the pass, labelled shared-map overhead. A record with only `opened` reads as one legacy span `opened..<until>`, labelled `legacy window`; base-red uses `2026-10-17T09:04:40.067Z`. Reason: A's session spans every chart and restart-rule allows re-entry. Rejected: one corrected open/close (breaks on re-entry); sessions alone (A is shared).
- Q2 (2a): one call = one model response with usage, compaction included. claude: one per message.id, context = input + cache_read + cache_creation. codex: one per unique `token_usage_record.payload.response_id`, context = `usage.input_tokens` (cached is a subset), embedded copies in `compacted` skipped. pi: one per assistant message or compaction entry with `usage`, context = input + cacheRead + cacheWrite, `tokensBefore` ignored, zero-usage errors not counted. Average = total context / calls. Codex rollouts without per-response records keep token totals and show calls and average context as unavailable. Reasoning tokens stay separate. Reason: per-response records include compaction that counters miss; every current rollout has them. Rejected: `token_count` counting (misses compaction); an approximate legacy count (code no comparison uses). Standing dissent: C prefers an approximate legacy count, labelled approximate.
- Q3 (3a): calls and average context are columns on every usage run; no compare mode. The #100 leaf's done-criterion runs base-red (legacy window), fresh-consultants and usage-windows and records a per-seat table (calls, average context, input, cache read, output, minutes, window and session ids, legacy and shared-map labels) with % change `100 * (new / baseline - 1)` per consultant seat, B and C separately, `n/a` for zero or unmeasured; informative only, never blocks a merge. Rejected: compare mode (code for a one-off); totals (charts differ in size).

Operator words, 2026-10-17, verbatim: "#100: per-chart usage windows plus pi support."
Operator words, 2026-10-17, verbatim: "Savings check (approximate is fine): add a done-criterion to the #100 leaf. Run the fixed chart-usage.ts on the base-red chart as the baseline (old: long-lived consultants) and on the #99/#100 charts as the new case (fresh consultants). Print, per seat, calls, average context per call, input/cache-read tokens, output and minutes side by side, plus the rough % change in average consultant context per call. Rough baseline from the 2026-10-17 pass: A 141 calls at ~146k average context, B ~7.4M input for ~19k output, C 63 calls at ~84k average. The charts differ in size, so compare per call, not totals. Report the numbers. The check informs and never blocks a merge."

Lock: issues/chart/chart-cost/forks/proof-of-saving.md Taken. The script prints ids, times and numbers only. Unmeasured never blocks a handoff. No quality claim.

Recorded by the door on main (not leaf work): `spans` in `issues/chart/fresh-consultants/seats.yaml` (`[10:07:32Z, 10:22:40Z)`) and `issues/chart/usage-windows/seats.yaml` (from 10:22:40Z, closed at its handoff). The current script ignores the top-level key.

## Standing design
Installed path: /home/ivan/.akrogon/current/skills/chart-issues/assets/standing-design.md.
Interpretation:
- Criteria 1 and 2 are own tests at the CLI boundary of `chart-usage.ts` (the existing `tests/chart-usage.test.ts` pattern: spawn the script on a temp chart folder with `CLAUDE_CONFIG_DIR`/`CODEX_HOME` pointing at fixtures).
- New behavior shows one deliberate break turning its test red.
- Criterion 3 is prose. The lesson at learnings/LESSONS.md:12 (grep `docs/` for a changed rule) applies.
- Criterion 4 is a live local run that only reads transcripts. It needs no external service, grant or proof.

## Leaf architecture
- Owned:
  - `skills/chart-issues/scripts/chart-usage.ts`
  - `tests/chart-usage.test.ts`
  - `tests/fixtures/chart-usage/` (new `pi/` folder; a codex rollout with `token_usage_record` and `compacted` lines; README entries)
  - `skills/chart-issues/SKILL.md` (seat record paragraph)
  - `skills/chart-issues/assets/shapes.md` (seats.yaml)
  - `docs/guide/chart.md` (seats.yaml and USAGE.md paragraphs)
- Fixtures: capture real transcripts and scrub every message and tool body to `USAGE_LEAK_MARKER`, as the README describes.
  - pi: `~/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-15T19-43-57-606Z_01a14117-bea6-728a-9455-0db743e0cf11.jsonl`, trimmed. Assistant `message.usage {input, output, cacheRead, cacheWrite, reasoning, totalTokens, cost}`, `message.model`, `message.thinkingLevel`. A `compaction` entry with `usage` and `tokensBefore`, plus `custom`, `context_edit`, `thinking_level_change` and `model_change` entries without usage.
  - codex: `~/.codex/sessions/2026/10/17/rollout-2026-10-17T09-45-31-01a148d2-b706-7d93-acd8-744c86365e07.jsonl`, trimmed. `token_usage_record` with `payload.response_id` and `payload.usage`. `compacted` with `payload.latest_token_usage_record`.
- Schema: `seatsSchema` adds an optional `spans: z.array({from: iso datetime, to?: iso datetime})`. `opened` stays required. Validation as in criterion 1.
- Window: replace the single `[openMs, untilMs]` test with membership in a half-open span list, each span cut at `until`. The legacy list is `[opened, until)` (C).
  - Calls are placed by their final record: claude groups are built over the whole session before span filtering (today `chart-usage.ts:143` filters before grouping); codex per-response records and pi entries are single records (C).
  - Turn and operator-turn intervals are intersected with the spans before minutes are summed.
  - The `window` line in USAGE.md lists the spans.
  - The legacy form prints `legacy window <opened> to <until>`.
- `locate`: harness `pi` uses `session` as the file path, which must exist.
  - herdr prints a pi `agent_session.value` as that path (`kind: path`). The live seat entries in `issues/chart/usage-windows/seats.yaml` show it.
- Readers:
  - `codexSession` reads `token_usage_record` lines when the rollout has any. It keeps the existing cumulative path, with its reset refusal, only for rollouts without them.
  - A new `piSession` mirrors `claudeSession`: operator turns are user messages, and a turn ends at the last assistant message before the next user message.
- Output: per seat, `calls <n>` replaces `assistant messages <n>`. `average context per call <n>` follows, rounded to whole tokens. Seat calls are unavailable when any contributing session lacks a count; today `chart-usage.ts:435` treats null as zero, which must not carry over (B).
  - The summary line and the sibling first lines are unchanged. pi output appears in the summary through `output_tokens`.
- Consumers: the chart-issues door runs this script before every handoff review and records the summary line in CHART.md. A failed measurement never holds a handoff (unchanged).
- Rough figures in the operator's words are orientation, not expected test values. On the A-checked base-red window, B has 77 calls (input 11,191,306, cached 10,918,272, output 39,829), and the old pi session has 59 calls at ~80.7k average context.

Correction from leaf review, 2026-10-17 (slots/leaf-review-B.md, slots/leaf-review-C.md): spans cut at `<until>`; calls placed by their final record; pi zero-usage errors excluded by `stopReason: "error"` with `totalTokens` 0; pi reasoning kept as `reasoning_output_tokens`; mixed-session seats show calls unavailable; spans stay open while waiting on this chart's consultants (B,C).
Held disagreement (B, F1): require an explicit `<until>` whenever a span is open or the record is legacy, instead of keeping today's default. Not taken: the default is the door's existing calling form, and cutting every span at `<until>` makes closed charts stable on rerun; legacy reruns growing with today is existing behavior outside #100.
