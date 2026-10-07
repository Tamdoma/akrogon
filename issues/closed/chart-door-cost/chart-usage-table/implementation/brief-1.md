# Brief 1: chart-usage.ts script, tests and fixtures

## 1. Goal

Build `skills/chart-issues/scripts/chart-usage.ts`, a read-only CLI that turns a chart's `seats.yaml` plus the seats' harness transcripts into `<chart>/USAGE.md`, plus its boundary test and fixtures. Plan decisions D2–D8.

## 2. Acceptance criteria

1. `bun skills/chart-issues/scripts/chart-usage.ts <chart-folder> [<until>]` reads `seats.yaml`, writes `<chart-folder>/USAGE.md`, prints this chart's summary line, then the first line of `USAGE.md` of each sibling directory that has one (sorted by folder name), then `outcome done` or `outcome partial` as the last line. Exit 0 in both cases. It writes nothing else and calls no model. A second run replaces `USAGE.md`.
2. Exit non-zero (stderr explains, no `USAGE.md` written) only when the chart folder is missing or `seats.yaml` is absent/unparseable; a schema mismatch names the field.
3. Per seat the table holds: harness kind, each distinct model and effort value found in the transcript window, turns, assistant messages counted apart from turns (claude), working minutes, tokens by the classes the harness records, a `first turn in window` row for the seat's first session only, one `operator turns` row per operator message in that seat's transcript with start time, minutes until the reply ended and each seat's output inside the span, total operator wait, and the `restatements` count from `seats.yaml`. An ended claude session's `totalCostUSD` is shown labelled a whole-session figure. No other dollars.
4. `USAGE.md` states: window tokens/minutes show usage and elapsed time changed, not that dollar cost fell; a whole-session dollar total can include other charts; subagent usage is not counted; turn and operator-wait definitions; restatement requests on rounds recording no fork answer are not counted; when detected, that a `first turn in window` row is not the whole map cost.
5. Exact counting on fixtures: a claude message streamed as several records with one `message.id` counts once; codex cumulative counters are read as differences, never summed; a codex cumulative decrease is an explicit error (seat unmeasured, `outcome partial`); records outside `[opened, until]` are excluded; two sessions for one seat are added.
6. A missing transcript, an ambiguous search (zero or >1 match), an unknown harness kind, or a needed field missing gives that seat a `usage unmeasured` row naming the file or id and the field; other seats are still measured.
7. Tool-result user records, `isMeta` records and `isCompactSummary` records start no operator turn; an unfinished turn is labelled `incomplete` with no invented end.
8. Output holds ids, times, numbers and read model/effort values only: a fixture with message bodies carrying the marker `USAGE_LEAK_MARKER` produces output and `USAGE.md` without it. The script contains no model name, effort level, price or rate literal.
9. One deliberate break turns a counting test red before you finish (record which break and which test in the report).

## 3. Read-first list

- `skills/chart-issues/scripts/peer-wait.ts` — copy its contract style: argv check → usage error exit 1, zod at the boundary, outcome word, exit discipline.
- `tests/peer-wait.test.ts` — copy its test harness shape: `mkdtempSync`, `Bun.spawn`, `RunResult`, env overrides.
- `src/readiness.ts` — `Bun.YAML.parse` + zod schema pattern.
- Real transcripts for field confirmation (read-only):
  - `~/.claude/projects/-home-ivan-Work-infra-akrogon/1ce71920-4c64-414b-ac1c-af56890a1c4b.jsonl`
  - `~/.codex/sessions/2026/10/06/rollout-2026-10-06T06-48-40-01a10f8a-d864-7f20-b425-d2fc02d57295.jsonl`
- This skill's `ponytail.md`.

## 4. Change list and interfaces

Owns: `skills/chart-issues/scripts/chart-usage.ts`, `tests/chart-usage.test.ts`, `tests/fixtures/chart-usage/**`. Depends on nothing; wave 1.

`seats.yaml` (parsed once, zod; mismatch names the field):

```yaml
opened: '2026-10-06T16:34:47Z'
restatements: 0
seats:
  - seat: A
    pane: w8:pCT
    harness: claude
    session: 1ce71920-4c64-414b-ac1c-af56890a1c4b
```

A replaced session = a second entry with the same `seat` letter. `restatements` ≥ 0 int. An outside-herdr chart may carry `opened` with no or empty `seats`.

Transcript search: claude → `<CLAUDE_CONFIG_DIR|~/.claude>/projects/*/<session>.jsonl`; codex → `<CODEX_HOME|~/.codex>/sessions/*/*/*/rollout-*-<session>.jsonl`. Tests move the homes with these env vars; add no new variable.

Verified record fields (2026-10-06):
- claude assistant: `timestamp`, `isSidechain`, `message.id`, `message.model`, `message.usage.{input_tokens,output_tokens,cache_read_input_tokens,cache_creation_input_tokens}`, top-level `effort`.
- claude operator message: `type:user`, `isSidechain:false`, `isMeta` falsy, `isCompactSummary` falsy, content not a tool_result list. Command-invocation records count.
- claude ended session: one `type:"cost-state"` record with `totalCostUSD`.
- codex: `task_started`/`task_complete` bound a turn; `turn_context.payload.model`/`.effort`; `token_count.info.total_token_usage` is cumulative with `input_tokens`, `cached_input_tokens`, `output_tokens`, `reasoning_output_tokens`, `total_tokens`; operator message ≈ `type:message` with `payload.role:"user"` (confirm on the real file).

Counting (must reproduce the reference method):
- claude tokens: group assistant records by `message.id`; output = largest `output_tokens` per group, other classes = the group's last values; sum over groups. Assistant message count = group count.
- codex tokens: last in-window `token_count`'s `total_token_usage` minus the last one before the window; none before → baseline zero; cumulative decrease → explicit seat error.
- claude turn = operator message → last assistant record before the next operator message. codex turn = `task_started` → `task_complete`. No end record in window → `incomplete`, no invented minutes. Working minutes = sum of complete turn spans in the window.
- Operator turns: per operator message row; span output per seat = claude per-record `output_tokens` delta within its `message.id` group summed over records in the span (full value for the group's first record), codex = `output_tokens` difference between last `token_count` in the span and last before it. Operator wait = sum of completed operator-turn spans (they cannot overlap).
- `first turn in window` row only for a seat's first session; carries the not-whole-map-cost note when a continuation/compaction split the opening reply (see plan.md implementation notes).
- Exclude `isSidechain:true` records and any file that is not the located `<session>.jsonl`.

`USAGE.md`: line 1 = summary line (operator wait minutes, operator turns, restatements, output per seat). Then the D7 rows/labels — use the literal strings `first turn in window`, `operator turns`, `incomplete`, `usage unmeasured`; whole-session dollars labelled as such; the stated-limit sentences from criterion 4 above. Rerun replaces the file.

Fixtures: keep real record structure and field names of both harnesses, captured from real transcripts with every message and tool body replaced; state harness versions (claude 2.1.268, codex per `codex --version`) and capture date 2026-10-06 in a comment or fixture README. Hand-written edge inputs (repeated message id, counter reset, missing field, outside-window record, marker text, unfinished turn) are allowed and required.

## 5. Do-not

- Never edit `src/`, `issues/`, other skills, SKILL.md or any doc file — U2 owns prose; a test that fails because prose is absent is wrong, the script must not depend on it.
- No new dependency — zod and `Bun.YAML` are installed; no npm/yaml. Exception: a revised brief from A.
- No model name, effort literal, price or rate in the script — read values only.
- No fallback or broad catch that turns a parseable-but-wrong transcript into zeros — a missing needed field is `usage unmeasured` with the field named, not silently zero.
- Do not print message or tool text anywhere — ids, times, numbers, read model/effort only.
- A conflicting requirement or impossible interface → return a mismatch with evidence to A instead of changing scope. Exception: a revised brief from A authorizing it.

Reasons restated: scope isolation (U2 owns prose), no invented values (measured or explicitly unmeasured), output hygiene (criterion 7), no hardcoded rates (criterion 4/8). Exceptions restated: only a revised brief from A changes scope or interfaces.

## 6. Ordered steps

1. Write `tests/chart-usage.test.ts` + `tests/fixtures/chart-usage/**` covering criteria 1–8; run it, see it fail red (script absent).
2. Implement `chart-usage.ts` to green.
3. Deliberate break: one counting rule (e.g. sum codex counters instead of differencing) → confirm the matching test goes red → revert. Record it.
4. Advisory size: ~3 files groups, under 60 turns.

## 7. Commands

```bash
AKROGON_BASE=3ce20853c64d843d97a1ebe0fbef335958ac0dff
bun install   # once, in your worktree
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

All criteria green via the commands above; commit your chunk on the worktree HEAD with message `feat: chart usage table script and tests` (or similar). Report the commit id and paste results.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
