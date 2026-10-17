# Slot B blind notes

## Q1. Chart ownership of time

**Pick, reason, cost.** Door-recorded active spans, summed by the script. Close the current span before another chart uses the door or consultants, reopen on return, and freeze the final end at handoff/hold/close. Collect outstanding consultant turns before switching. Use disjoint half-open intervals `[start,end)` and cap an unfinished span at the run's explicit cutoff. Cost: the door records each switch, rather than only opening a chart.

Assign a shared opening map once to the first chart, explicitly labelled shared-map overhead for the named charts. Later charts reference that ownership without counting it. This is an allocation convention, not a claim that the first chart alone caused that work. Keep `opened` as historical metadata. For records lacking spans, require an explicit historical cutoff and label the result a legacy shared window. For base-red use its saved USAGE cutoff, `2026-10-17T09:04:40.067Z`, not today's time. Do not invent historical chart boundaries or relabel this baseline exclusive.

**Rejected.** Corrected single open/close still includes another chart's work on re-entry. Consultant sessions alone cannot bound A, whose session spans charts, or shared maps. Equal splitting invents attribution without evidence. Rewriting old windows from guesses hides uncertainty.

**Evidence.** operator · `issues/chart/usage-windows/INTAKE.md`, read 2026-10-17 · the requested fix is per-chart usage, with approximate comparison allowed. better-than-training · the five supplied `seats.yaml` files, base-red `USAGE.md`, `chart-usage.ts`, shapes.md seat shape and guide/chart.md, read 2026-10-17 · the three old charts share `08:17:04Z`; both new charts still share `10:07:32Z`; A's session is unchanged across all five. Related restart-rule Taken explicitly permits re-entry, making multiple spans a present requirement.

**Pitfalls and removal.** Validate ordered, nonoverlapping spans and one unfinished final span. Deduplicate repeated seat/session entries. Attribute each complete usage record once by its recorded completion time, stating this boundary convention. Intersect working and operator-wait intervals with active spans, including turns begun before a span, so cross-chart gaps do not become work. Fixtures must cover leave/return, adjacent boundaries, live cutoff, frozen rerun and the shared map counted once across charts. Invalid attribution becomes partial/unmeasured, never a handoff blocker.

**Unasked question.** Does the operator accept charging shared-map overhead to the first chart? My pick is yes, with that annotation also visible in the savings comparison.

## Q2. Calls and context

**Pick, reason, cost.** One call is one recorded model response with usage, including measured compaction, not a tool call or operator turn. Average context is total input context divided by those calls. Claude: group streamed blocks by `message.id`, retain the existing final-input/max-output aggregation, and context = input + cache read + cache creation. Pi: count assistant message entries and compaction entries carrying usage once, with context = input + cacheRead + cacheWrite. Do not use pi `tokensBefore` as compaction input. Keep zero-usage errors separate from measured calls. Codex: use unique `token_usage_record.payload.response_id` records and their per-response `usage`, including compaction. Context = `input_tokens`, which already includes cached input. Never add cached input again or count the embedded copy in `compacted.latest_token_usage_record`. Cost: distinguish modern per-response records from the older cumulative-only format.

For cumulative-only Codex transcripts, retain token totals and expose calls/context as unmeasured unless an explicitly labelled approximate counter-delta method is adopted. Do not silently equate every token_count event with a response. Missing usage is unknown, not zero. Pi session paths already appear verbatim in seats.yaml and should be read directly. Pi working minutes should preserve the existing user-to-final-reply meaning, clipped to chart spans, rather than substituting summed API duration.

**Rejected.** Counting assistant/tool events double-counts streamed output and omits hidden model work. Counting every token_count includes repeated counters. Positive cumulative deltas alone are also insufficient for the modern Codex evidence below. Excluding pi compaction understates the overhead fresh sessions are intended to change. Averaging per-session averages biases seats with unequal call counts.

**Evidence.** better-than-training · `chart-usage.ts`, `tests/chart-usage.test.ts`, captured fixtures and README, read 2026-10-17 · Claude already deduplicates message IDs; old Codex fixtures expose cumulative counters only. operator-supplied local data, inspected 2026-10-17 · Codex rollout `~/.codex/sessions/2026/10/17/rollout-2026-10-17T09-45-31-01a148d2-b706-7d93-acd8-744c86365e07.jsonl`: the saved base-red window contains 77 unique response usage records totalling 11,191,306 input, 10,918,272 cached input and 39,829 output. Existing USAGE reports 10,869,186 / 10,603,136 / 32,535. The difference exactly equals the two compaction responses, whose usage is present in response records but absent from legacy event counters. This rules out cumulative-only counting for current data.

The supplied pi baseline file `2026-10-15T19-43-57-606Z_01a14117-bea6-728a-9455-0db743e0cf11.jsonl` has 59 assistant responses in that window, totalling 308,376 input, 4,453,716 cache read and 42,208 output. Its compaction at `08:17:02.991Z` precedes the saved opening boundary and therefore does not belong to that window. It records actual usage separately from `tokensBefore`.

**Pitfalls and removal.** Add independently known fixtures for response/event duplication, compaction copies, pi compaction with and without usage, duplicate Claude blocks, partial/missing usage, multiple sessions and zero calls. Divide only matched context and call totals. Preserve raw token classes beside normalized context and identify the counting method. Treat missing model/effort metadata separately from otherwise measurable usage.

**Unasked question.** Should cumulative-only Codex call counts be approximate or explicitly unavailable? Prefer unavailable: the requested current baseline and new sessions have direct response records, so approximate reconstruction is unnecessary for this check.

## Q3. Savings report

**Pick, reason, cost.** Add calls and average context to ordinary usage output, then require the #100 done-criterion to print one side-by-side comparison of base-red, fresh-consultants and usage-windows using fixed cutoffs. Include each seat's calls, average context, raw input/cache-read, output and working minutes, plus exact window/session identifiers and shared-map/legacy qualifications. Cost: a small one-time comparison in the implementation report, rather than a new CLI mode.

For each consultant seat, compare each new chart's context-per-call with the baseline: `100 * (newAverage / baselineAverage - 1)`. If a pooled consultant figure is also wanted, divide combined B+C context by combined B+C calls for each case first. Do not average chart or seat percentages. Missing/zero baselines yield unavailable percentages. Report the measurements even when usage rises, and never impose a savings threshold.

**Rejected.** A separate compare mode expands the interface for a one-time requested check. Totals reward smaller charts. The rough operator figures are orientation, not expected test values. A causal or quality conclusion exceeds the evidence and the existing lock.

**Evidence.** operator · usage-windows INTAKE and fork Carries, read 2026-10-17 · the operator explicitly requests side-by-side per-seat numbers and a nonblocking approximate check. operator · chart-cost/proof-of-saving Taken, read 2026-10-17 · numbers only, partial measurement never blocks handoff, no quality claim. better-than-training · current script and tests, read 2026-10-17 · ordinary output already writes USAGE and shows sibling summaries, so new measurements fit that path.

**Pitfalls and removal.** Require the report to distinguish the legacy shared baseline from exclusive new spans, show harness/model/effort differences already available, and label this pass's pre-fix attribution where exact reconstruction is unsupported. Record a main-step owner for real chart-record corrections because leaf branches cannot own issues/ edits. The criterion requires an attempted measurement and publication of numbers or explicit missing fields, never a particular reduction.

**Unasked question.** None beyond Q1's shared-map convention and Q2's legacy-format policy.
