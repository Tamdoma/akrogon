# Worker brief 1: chart-usage.ts spans, calls and pi support

## 1. Goal

Implement plan.md D1–D5 in `skills/chart-issues/scripts/chart-usage.ts`: per-chart `spans:` windows in seats.yaml, per-harness call counting with `calls` and `average context per call`, pi session support, and `calls unavailable` semantics. Plan: `/home/ivan/Work/infra/akrogon/issues/open/usage-windows/usage-spans/plan.md` (read it; binding facts are copied below).

## 2. Numbered acceptance criteria

All seven planned tests in `tests/chart-usage.test.ts` pass, and no previously-passing test regresses:

1. `spans filter records, calls and minutes into their half-open windows`
2. `invalid spans exit non-zero, name the field and write no USAGE.md`
3. `claude calls and average context per call`
4. `codex token_usage_record calls skip compacted copies`
5. `cumulative-only rollout prints calls unavailable`
6. `pi calls, compaction and error entries`
7. `mixed sessions print calls unavailable; zero calls print n/a; missing pi path is unmeasured`

Planned tests live in the leaf diff already (commit on the branch). You write and edit no test: a test that is wrong or stays red once your code is correct is a mismatch returned to A, never a test fix.

## 3. Read-first list

- `skills/chart-issues/scripts/chart-usage.ts` — the file you own (only file you edit).
- `tests/chart-usage.test.ts` — read only, for expected output strings and exact assertions.
- `tests/fixtures/chart-usage/` — the new synthetic fixtures (`claude/claude-spans.jsonl`, `codex/rollout-tur.jsonl`, `pi/*.jsonl`) show the input shapes.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `skills/chart-issues/scripts/chart-usage.ts` alone. Depends on nothing else in the leaf. Shared test resource: none.

Required changes (from plan D1–D5):

- `seatsSchema` gains optional `spans: z.array(z.strictObject({ from: z.iso.datetime(), to: z.iso.datetime().optional() }))`; `opened` stays required.
- Semantic validation after parse, before session work; violation → `die` naming the `spans` field and rule, no USAGE.md: `to <= from`; `from[i] < to[i-1]` (covers out-of-order and overlapping); a non-last span without `to`.
- Effective spans computed once in `main`: with `spans` → `[from, min(to ?? Infinity, untilMs))`; `from >= untilMs` contributes nothing. Without `spans` → legacy single span `[opened, until]` keeping today's inclusive `untilMs` record boundary (`t <= until` still counts in legacy mode only). All other membership is strictly `t >= start && t < end` half-open.
- USAGE.md window line: no spans → `legacy window <opened-iso> to <until-iso>`; with spans → `window <from-iso> to <end-iso>` per span comma-joined where a closed span prints its recorded `to` and the open last span prints `<until-iso> (open)`.
- `SessionResult.assistantMessages` → `calls` (number | null).
- claude: build `message.id` groups over the whole session (assistant records outside all spans still join a group); place each group by its last record's timestamp into effective spans; counted groups add calls, context (input+cache_read+cache_creation), final-record token counters and max(output). Required-field validation applies to all assistant records (whole session). Reply-end detection for operator turns uses the whole-session assistant list (`t > t0 && t <= next-op or until`).
- codex: if any top-level `type === 'token_usage_record'` record exists → per-response mode: calls = distinct `payload.response_id` among in-span records; token keys sum `usage.input_tokens`, `cached_input_tokens`, `output_tokens`, `reasoning_output_tokens` (drop `total_tokens` from output keys; keep `cache_write_input_tokens` out too — the existing CODEX_KEYS minus `total_tokens`... check the test: asserts input/cached/output/reasoning only). `type === 'compacted'` embedded `payload.latest_token_usage_record` is never read (only top-level records count). If none exist → keep the existing cumulative `token_count` path (baseline diff, reset refusal) and `calls = null`.
- codex `turn_context` model/effort collection: in-span membership (same half-open rule; legacy mode inclusive).
- pi (`locate` gains a `pi` branch): `session` is a file path; `existsSync` false → `{detail}` naming the path. New `piSession(session, file, spans)` mirrors `claudeSession`: `type === 'message'` with `message.role === 'user'` starts an operator turn; `message.role === 'assistant'` with `message.usage` is a call placed by the record's top-level `timestamp`; `type === 'compaction'` with `usage` is also a call. An assistant with `stopReason === 'error'` and `usage.totalTokens === 0` is not a call and adds no tokens; an error with nonzero usage counts. Never read `tokensBefore`. In-span assistant missing `usage` → error naming `message.usage`; missing `usage.<field>` or `timestamp` names that field. Token keys map: `input_tokens ← usage.input`, `output_tokens ← usage.output`, `cache_read_input_tokens ← usage.cacheRead`, `cache_creation_input_tokens ← usage.cacheWrite`, `reasoning_output_tokens ← usage.reasoning` (kept out of context and out of output). `models` from `message.model`, `efforts` from `message.thinkingLevel`; `totalCostUSD` null. `spanOutput(a,b)` sums `usage.output` of call records with `a < t <= b` inside spans. `splitOpen`: true when a `compaction` record falls inside the first counted turn interval (mirror claude's isCompactSummary rule).
- Intervals: build turns and operator turns whole-session, intersect `[t0, tEnd]`/`[start, replyEnd]` with effective spans for all minute sums (`working minutes`, `operator wait`, per-row `min`); drop rows whose intersection is empty (turns count, first-turn row, operator rows). A replyEnd after until still forms a complete turn whose minutes clip to spans. `spanOutput(a,b)` in claude and codex gains span-membership too.
- Seat block output: `assistant messages <n>` removed. All sessions counted → `calls <sum>` + `average context per call <round(totalContext/sum)>` (claude/pi context = input+cache_read+cache_creation; codex = input only), or `average context per call n/a` when sum is 0. Any session `calls === null` or errored out → `calls unavailable`, no average line; a session whose only deficit is cumulative-only codex carries `cumulative-only rollout` in its error detail so a fully-unmeasured seat shows `usage unmeasured (...)` naming it — check the exact string the tests want: `calls unavailable (cumulative-only rollout)` for a measured seat whose session is cumulative-only. Tokens/turns/minutes still print.
- Summary line and sibling first lines unchanged.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/` or fixtures: planned tests are A's; a wrong or red expectation is a mismatch, not a repair.
- Do not change the summary line, sibling first lines, the four limit bullets, or output order beyond what criteria need.
- Do not add fields, keys or output not in the criteria (no cost lines for pi, no `total_tokens` key for codex modern mode unless a test needs it — it does not).
- Do not restructure the file beyond what the change needs; single-purpose helpers only where three readers share them (e.g. one `intersect` helper).
- Do not write anything under `issues/` or the leaf folder.
- Return a mismatch with evidence instead of changing scope, signatures or tests; the exception is a revised brief from A.

## 6. Ordered steps

1. Read plan.md D1–D5, the script and the new tests.
2. Refactor window plumbing: `effectiveSpans` in main + membership helper + span validation (criteria 2's four invalid cases exit 1 naming `spans` before any session work).
3. Update claude/codex readers to spans + calls; add `piSession` + `locate` pi branch.
4. Update output block (calls/average/unavailable) and window line.
5. Run the seven named tests plus the full `tests/chart-usage.test.ts` file.
6. Commit your chunk on the detached HEAD.

Advisory size: ~1 file, under 40 turns.

## 7. Commands

Targeted (run in your worktree after `bun install --frozen-lockfile`):

```sh
bun test tests/chart-usage.test.ts
```

Keep kept output through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Every test in `tests/chart-usage.test.ts` passes. Commit only your chunk, with the commit ID and kept check citations in your return.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
