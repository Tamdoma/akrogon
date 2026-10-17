# Plan: usage-spans

Slot A synthesis for `plan.synthesis`. `state.yaml` has `debate: "no"`, so this plan is built directly from `brief.md`, `design.md` and live inspection of the worktree and the three live charts' `seats.yaml` files and transcripts.

## Read first

1. `skills/chart-issues/scripts/chart-usage.ts` — the script being changed; current structure below.
2. `tests/chart-usage.test.ts` — existing CLI-boundary test pattern (`setup()` world: temp chart folder, `CLAUDE_CONFIG_DIR`/`CODEX_HOME` pointed at fixture homes, `spawnCaptured` run).
3. `tests/fixtures/chart-usage/README.md` — fixture capture/scrub convention (`USAGE_LEAK_MARKER`).
4. `skills/chart-issues/SKILL.md` line ~39 (seat record) and line ~71 (handoff usage run) — prose edits.
5. `skills/chart-issues/assets/shapes.md` `### seats.yaml` (~line 163) — prose edit.
6. `docs/guide/chart.md` ~line 155–165 (`seats.yaml`/`USAGE.md` paragraph) — prose edit.
7. `design.md` — binding decisions (1a/2a/3a) and leaf architecture; governs over the brief on conflict.
8. `learnings/LESSONS.md` — applicable lesson: grep `docs/` for a changed rule (done for prose surfaces); tests assert on behavior/labels, not incidental prose.
9. `src/shell.ts` — `spawnCaptured` helper the test uses.
10. Live shapes inspected (do not copy as fixtures at full size): `~/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-10-15T19-43-57-606Z_01a14117-*.jsonl`, `~/.codex/sessions/2026/10/17/rollout-2026-10-17T09-45-31-01a148d2-*.jsonl`, `issues/chart/{base-red,fresh-consultants,usage-windows}/seats.yaml`.

## Decisions

### D1. Span model in `seats.yaml`

`seatsSchema` gains optional `spans: z.array(z.strictObject({ from: z.iso.datetime(), to: z.iso.datetime().optional() }))`. `opened` stays required and still seeds the legacy window.

Semantic validation after schema parse, before any session work; on violation the script exits non-zero, stderr names the field (`spans.N.from`/`spans.N.to`) and rule, and writes no USAGE.md:

- `to <= from` → reject.
- `from` of span N < `to` of span N-1 → reject (covers out-of-order and overlapping).
- a span other than the last without `to` → reject.

### D2. Effective half-open windows

`effectiveSpans = [{start, endExclusive}]` computed once in `main` after parsing:

- With `spans`: per span `{start: from, endExclusive: min(to ?? +∞, untilMs)}`; spans with `from >= untilMs` contribute nothing (their clip is empty). A closed `to > until` therefore counts only to `until`.
- Without `spans`: one legacy span `{start: openMs, endExclusive: untilMs}` plus the historical inclusive `untilMs` record boundary (see below), and the window line prints `legacy window <opened> to <until>`.

Every membership test becomes `t >= start && t < endExclusive`. For the legacy span the historical `t <= untilMs` boundary is kept by treating endExclusive as `untilMs + ε` (i.e. the legacy span admits a record exactly at `until`, matching today's inclusive window and avoiding a behavior change no criterion asks for; explicit spans are strictly half-open).

`USAGE.md` window line: legacy → `legacy window <opened> to <until>`; explicit → `window <from> to <end>` per span joined by `, `, printing the recorded `to` when present and `to <until> (open)` for the open last span.

### D3. Calls, placement and per-call context

`SessionResult.assistantMessages` is renamed `calls`. One call = one model response that reports usage.

- **claude**: `message.id` groups are formed over the **whole session** first (records before any span still join their group), then a group is placed by its final record's timestamp into the effective spans. Counted groups contribute `calls += 1`, `input + cache_read + cache_creation` to context, final-record counters to token keys, and `max(output)` to output. A group straddling an edge counts once, in the span holding its last record. Turn/operator-turn building still uses in-span assistant records for reply detection (a reply ending in a span counts; detection over whole session for reply ends so a group finishing inside a span after starting outside still ends the turn — use whole-session assistant list for replyEnd, in-span for turn overlap below).
- **codex**: if the rollout contains top-level `type === 'token_usage_record'` records, calls = distinct `payload.response_id` among in-span records; `usage.input_tokens`, `cached_input_tokens`, `output_tokens`, `reasoning_output_tokens`, `total_tokens` sum from those records; the embedded `payload.latest_token_usage_record` inside `type === 'compacted'` records is skipped (it is a stringified or nested copy, not a top-level record — never read it). Average context = `input_tokens / calls`; cached input is never added. If no `token_usage_record` exists, the session keeps today's cumulative `token_count` path (baseline diff, reset refusal) and `calls = null`.
- **pi**: `locate('pi', session)` treats `session` as a file path; missing file → `usage unmeasured` naming the path. One call per `type === 'message'` entry with `message.role === 'assistant'` and a `message.usage` object, plus each `type === 'compaction'` entry with `usage`, each placed by its own timestamp. An assistant with `stopReason: 'error'` and `usage.totalTokens === 0` is not a call and adds no tokens; an error with nonzero usage counts. `tokensBefore` is never read. Missing `usage` on an in-span assistant message is a measure error naming field `message.usage`; missing `usage.<field>` names it; missing `timestamp` names `timestamp`. Token keys: `input_tokens ← usage.input`, `output_tokens ← usage.output`, `cache_read_input_tokens ← usage.cacheRead`, `cache_creation_input_tokens ← usage.cacheWrite`, `reasoning_output_tokens ← usage.reasoning` (kept out of context and out of output). Average context = `(input + cacheRead + cacheWrite) / calls`. Models come from `message.model`, efforts from `message.thinkingLevel`; `totalCostUSD` stays null. `spanOutput(a,b)` sums `usage.output` of call records with `a < t <= b` that are inside effective spans.

### D4. Interval clipping

Turn intervals `[t0, tEnd]` and operator-turn intervals `[startMs, replyEndMs]` are intersected with effective spans before minutes are summed. A turn or operator turn may overlap zero or more spans; its minutes = Σ intersection lengths. Rows whose intersection is empty are dropped (`turns` count, `first turn in window`, operator rows and operator wait all reflect spans only). `splitOpen` (compaction during first counted turn) unchanged for claude; pi sets it when a `compaction` record falls inside the first counted turn interval; codex keeps false.

`spanOutput(a,b)` in claude and codex gains the same effective-span membership condition so gap records never contribute.

### D5. Seat-level calls display

Per seat block:

- All measured sessions carry a count → `calls <sum>` then `average context per call <round(totalContext / sum)>`, or `average context per call n/a` when sum is 0. Context total = Σ per-session (input + cache_read + cache_creation for claude/pi; input only for codex).
- Any deficit (a session returning `calls = null` or errored out of `sessions[]`) → `calls unavailable` with no average; token totals and `turns`/`working minutes` still print. The qualifier `(cumulative-only rollout)` is appended to the session's own error/unavailable detail only when the deficit is a cumulative-only codex rollout (for a fully-unmeasured seat this lands in its `usage unmeasured (...)` line; for a mixed seat the deficit stays implicit in `calls unavailable`).

`assistant messages <n>` is removed from output; existing assertions that name it are updated to `calls <n>`.

### D6. Door prose

- `skills/chart-issues/SKILL.md` (seat record paragraph, ~line 39): the door opens a span when it begins work on a chart; after outstanding consultant turns are collected it closes the span on handoff, close or hold, when the chart waits on an approval, need or prerequisite, or before switching to another chart; it keeps the span open while waiting on this chart's consultants; it opens a new span on re-entry; only the last span may be open; the first chart's first span covers a shared opening map so the map counts once; a record without `spans` reads as a legacy window.
- `skills/chart-issues/assets/shapes.md` `### seats.yaml`: document the `spans:` list shape and the same open/close rule, half-open `[from, to)`, last may omit `to`; pi `session` is the session file path.
- `docs/guide/chart.md` `seats.yaml`/`USAGE.md` paragraph: spans definition, `legacy window`, `calls` and `average context per call` meaning (one call = one model response reporting usage; average context = per-call input context incl. cache), pi seats measured.

### D7. Savings check (criterion 4) as live run + report

`implementation/report.md` under the leaf folder (`/home/ivan/Work/infra/akrogon/issues/open/usage-windows/usage-spans/implementation/report.md`, matching closed-leaf convention) holds, per seat A/B/C × chart (base-red, fresh-consultants, usage-windows): calls, average context per call, input, cache read, output, working minutes, the window/spans and session ids. Under the tables, `% change = 100 * (new / base-red - 1)` for B and C separately per new chart, `n/a` where either side is zero or unmeasured, and the three required statements (base-red is a legacy shared window; fresh-consultants carries the shared opening map; figures are observational with no cause or quality claim). Scratch copies of the three `seats.yaml` files live in a temp dir outside `issues/`; nothing inside the main checkout's `issues/` is written. `<until>`: base-red `2026-10-17T09:04:40.067Z`; fresh-consultants `2026-10-17T10:22:40Z`; usage-windows `2026-10-17T10:35:45Z` (last span `to`).

## Interfaces

- `locate(harness, session)` gains a `pi` branch returning `{file: session}` when it exists, else `{detail}` naming the path.
- New `piSession(session, file, spans)`: mirrors `claudeSession`; returns `SessionResult` or an error string.
- `codexSession` branches internally on presence of `token_usage_record`; `calls: number | null`.
- Helper `intersectMs(a, b, spans): number` shared by all three readers and the operator-wait sum.
- `main` computes `effectiveSpans` and the window-line string once; passes `effectiveSpans` (replacing `openMs`/`untilMs` params) into the three readers.

## File/criterion checklist and waves

The work is one cohesive change to one script plus its test file; splitting mid-script across parallel workers creates merge risk on the same file. Wave plan:

- **Wave 1 — unit W1 (script + fixtures + tests):** `skills/chart-issues/scripts/chart-usage.ts`, `tests/chart-usage.test.ts`, `tests/fixtures/chart-usage/` (`pi/` folder, `codex/rollout-tur.jsonl`, `claude/claude-spans.jsonl`, README entries). Owns all new-behavior code paths.
- **Wave 1 — unit W2 (prose):** `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. Disjoint paths, no shared resource, no dependency → parallel with W1.
- **Wave 2 — unit W3 (savings report):** `implementation/report.md` + scratch runs. Depends on the working script from W1.

Docs affected (one line each): `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. No `src/` doc or README affected.

## Acceptance criteria → proof

Every proof is a `bun test` filter over `tests/chart-usage.test.ts` except C3 (text assertion) and C4 (live run + report). Commands run via `akrogon run-check --name <label> -- <cmd>`.

| Criterion | Test name | Proof / command | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| C1 spans | `spans filter records, calls and minutes into their half-open windows` | `bun test tests/chart-usage.test.ts -t 'spans filter records'` — hand-computed USAGE.md on synthetic `claude-spans` fixture: records in `[t1,t2)` and `[t3,t4)` count, `[t2,t3)` and exactly-`t2` do not, edge-crossing turns count only in-span minutes, closed `to > until` clips, span starting at/after `until` contributes nothing, edge-straddling `message.id` group counts once in the span holding its last record | seconds | script/test change |
| C1 invalid | `invalid spans exit non-zero, name the field and write no USAGE.md` | `bun test ... -t 'invalid spans'` — to<=from, overlap/out-of-order, non-last open span each exit 1 naming the field; chart dir untouched | seconds | script/test change |
| C1 legacy | covered inside `spans filter` and existing `writes USAGE.md` test | USAGE.md shows `legacy window` line without `spans` | seconds | script/test change |
| C2 claude | `claude calls and average context per call` | `bun test ... -t 'claude calls'` — calls = distinct message.id incl. straddler; avg = (input+cache_read+cache_creation)/calls hand-computed | seconds | script/test change |
| C2 codex modern | `codex token_usage_record calls skip compacted copies` | `bun test ... -t 'token_usage_record'` — per-response_id calls incl. compaction responses, embedded `latest_token_usage_record` skipped, cached never added to context | seconds | script/test change |
| C2 codex cumulative | `cumulative-only rollout prints calls unavailable` | `bun test ... -t 'cumulative-only'` — existing `codex-diff` fixture now shows `calls unavailable (cumulative-only rollout)`, token diffs unchanged | seconds | script/test change |
| C2 pi | `pi calls, compaction and error entries` | `bun test ... -t 'pi calls'` — assistant-with-usage calls + compaction call; zero-usage error skipped, nonzero error counted; avg context and `reasoning_output_tokens` present; `tokensBefore` ignored | seconds | script/test change |
| C2 mixed/zero/unmeasured | `mixed sessions print calls unavailable; zero calls print n/a; missing pi path is unmeasured` | `bun test ... -t 'calls unavailable'` — modern+cumulative seat prints `calls unavailable` with tokens still printed; pi fixture with no calls → `average context per call n/a`; missing pi path → `usage unmeasured` naming the path while another seat measures | seconds | script/test change |
| C3 prose | text inspection at review | grep the three files for `spans`, `legacy window`, `calls`, `average context per call`, `pi` and the open/close rule | seconds | doc edit |
| C4 savings | live local runs | `bun skills/chart-issues/scripts/chart-usage.ts <scratch>/<chart> <until>` for each of 3 charts on copied seats.yaml; report table + % change + disclaimers in `implementation/report.md` | minutes | rerun anytime; informative only |

Environment: no credentials named by the design; `akrogon status` shows no `Missing:` lines.

## Risks and notes

- **R1** Half-open spans change window inclusivity for explicit spans only; legacy boundary stays inclusive at `until`. No fixture record sits on an existing test boundary (verified by grep), so old expectations hold.
- **R2** `token_usage_record` records are top-level records, not `event_msg` payloads — the branch checks `r.type === 'token_usage_record'`; embedded copies inside `compacted` are nested and naturally never match the top-level filter.
- **R3** `calls unavailable` wording: criterion shows `(cumulative-only rollout)` for a solely-cumulative seat; for a mixed seat the brief requires only `calls unavailable`. The qualifier lives in the seat detail; do not invent per-session sub-lines.
- **R4** pi turn semantics mirror claude (user message → last assistant before next user); pi sessions can contain `custom`/`context_edit` entries — they are not operator turns and not calls.
- **R5** Conflict resolved in favor of design: the brief's example "a seat whose sessions do not all give a call count" covers errored sessions as well; `calls unavailable` prints while the seat's measured token totals still print.
- **R6** `window` line for explicit spans prints recorded times; counting always clips at `until`.

## Test plan (to write now, red before product change)

New tests added to `tests/chart-usage.test.ts` (one commit with fixtures; `Test-Change` trailer on the commit since it changes an existing path):

1. `spans filter records, calls and minutes into their half-open windows`
2. `invalid spans exit non-zero, name the field and write no USAGE.md`
3. `claude calls and average context per call`
4. `codex token_usage_record calls skip compacted copies`
5. `cumulative-only rollout prints calls unavailable`
6. `pi calls, compaction and error entries`
7. `mixed sessions print calls unavailable; zero calls print n/a; missing pi path is unmeasured`

New fixtures: `claude/claude-spans.jsonl` (hand-written, dense), `codex/rollout-tur.jsonl` (hand-written `token_usage_record`/`compacted`/`token_count`), `pi/pi-A.jsonl`, `pi/pi-zero.jsonl`, `pi/pi-nousage.jsonl` (hand-written sessions with message/compaction/error entries), plus README entries. Expected `calls` wording changes in existing tests ride in the same commit.

## Red evidence (recorded 2026-10-17)

Tests and fixtures committed as `7c577c8` on branch `usage-spans`, before any product change. Each planned test ran through `akrogon run-check`; all red against the unmodified script:

- `check spans filter records: 1` — fails on `window 2026-10-06T09:30:00.000Z to ...` (script prints the single legacy window, no `calls`, no span clipping).
- `check invalid spans: 1` — script accepts invalid `spans` (ignores the key), exits 0 and writes USAGE.md.
- `check claude calls: 1` — `calls 6` / `average context per call` absent; `legacy window` line absent.
- `check token_usage_record: 1` — rollout with `token_usage_record` records shows no `calls` line.
- `check cumulative-only: 1` — no `calls unavailable (cumulative-only rollout)` line; `assistant messages` wording instead.
- `check pi calls: 1` — `seat C: usage unmeasured (unknown harness pi)`.
- `check calls unavailable: 1` — mixed pi+codex seat shows no `calls unavailable`; missing pi path is `unknown harness pi`.

Log paths are under `implementation/check-<name>-*.log` in the leaf folder (auto-created by `run-check`).
