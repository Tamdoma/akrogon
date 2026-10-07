# Plan: chart-usage-table

Synthesis of brief.md and design.md (debate: no). Goal: each chart records its seat sessions at open, and a read-only script turns their transcripts into a per-chart usage table in tokens and minutes.

## Read first

- `issues/open/chart-door-cost/chart-usage-table/brief.md`, `design.md` (registered root, authoritative)
- `skills/chart-issues/scripts/peer-wait.ts` — arg checks, outcome-word contract, exit-code discipline
- `tests/peer-wait.test.ts` — boundary test pattern: temp dir, `Bun.spawn`, env override, `RunResult`
- `skills/chart-issues/SKILL.md` — edit sites: Open, Take, Handoff
- `skills/chart-issues/assets/shapes.md` — chart records tree; `tests/chart-shapes.test.ts` parses only its `### readiness.yaml` block, so tree additions are safe there
- `skills/chart-issues/assets/standing-design.md` — test-form rules (cheapest sufficient test, hand-written edge inputs allowed)
- `issues/chart/chart-cost/forks/proof-of-saving.md` (registered root) — reference totals and verbatim operator answers
- `docs/guide/chart.md` (~line 152, chart records listing — a hit, edit it), `docs/guide/files.md` (checked: covers leaf artifacts only, no chart records list — report states no hit)
- Live transcripts for field verification and the criterion-10 run:
  - `~/.claude/projects/-home-ivan-Work-infra-akrogon/1ce71920-4c64-414b-ac1c-af56890a1c4b.jsonl` (A)
  - `~/.claude/projects/-home-ivan-Work-infra-akrogon/14a11404-8a8d-482e-b5ca-0fdb6ae0f864.jsonl` (C)
  - `~/.codex/sessions/2026/10/06/rollout-2026-10-06T06-48-40-01a10f8a-d864-7f20-b425-d2fc02d57295.jsonl` (B)

## Decisions

- **D1 — `seats.yaml` contract.** Written by the door into `<chart>/`, parsed once by the script with a zod schema:
  ```yaml
  opened: '2026-10-06T16:34:47Z'   # time the door began its first pass; never reset by folder creation or session replacement
  restatements: 0                  # non-negative int; door adds one per restatement request it answered on a round that records a fork answer
  seats:
    - seat: A
      pane: w8:pCT
      harness: claude              # herdr agent list `agent` value
      session: 1ce71920-4c64-414b-ac1c-af56890a1c4b   # agent_session.value
  ```
  A replaced session is a second entry with the same seat letter. Outside herdr the file holds `opened` and an empty `seats` list (or only unresolvable seats). `herdr agent list` fields per readiness.yaml proof: `pane_id`, `agent`, `agent_session.value`.
- **D2 — CLI contract.** `bun <skill-folder>/scripts/chart-usage.ts <chart-folder> [<until>]` where `<until>` is an ISO-8601 instant defaulting to now and `<skill-folder>` is the loaded chart-issues skill directory (same convention as peer-wait). Prints this chart's summary line, then the first line of `USAGE.md` of each sibling chart folder that has one (a sibling is another directory under the chart folder's parent), then `outcome done|partial` as the last line. Exit 0 on both; writes only `<chart-folder>/USAGE.md`; calls no model. Exit non-zero with stderr and no `USAGE.md` when the chart folder is missing or `seats.yaml` is absent/unparseable — "does not parse" is read to include absent, since the script has nothing to measure without it. A schema mismatch error names the field.
- **D3 — Transcript location.** Claude: `<CLAUDE_CONFIG_DIR|~/.claude>/projects/*/<session>.jsonl`. Codex: `<CODEX_HOME|~/.codex>/sessions/*/*/*/rollout-*-<session>.jsonl`. Both env vars verified on the live harnesses (CLAUDE_CONFIG_DIR in the 2.1.268 binary, CODEX_HOME in `codex --help`); tests use them, no new variable. Zero or more than one match, an unknown harness kind, or a transcript lacking a needed field → that seat's row says `usage unmeasured` naming the file (or id) and the missing field; other seats are still measured; `outcome partial`, exit 0.
- **D4 — Record fields (verified on live transcripts 2026-10-06).**
  - Claude assistant: `timestamp`, `isSidechain`, `message.id`, `message.model`, `message.usage` (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`), top-level `effort`.
  - Claude user: operator message = `type:user` + `isSidechain:false` + not `isMeta` + content not a tool_result list. Command-invocation records (`<command-message>` markup) are operator messages — the design's open time is one. Tool results and `isMeta` records (local-command caveats) start no operator turn.
  - Claude ended session: one `type:"cost-state"` record with `totalCostUSD`.
  - Codex: `task_started`/`task_complete` bound a turn; `turn_context.payload.model` and `.effort`; `token_count.info.total_token_usage` cumulative (`input_tokens`, `cached_input_tokens`, `output_tokens`, `reasoning_output_tokens`, `total_tokens`).
- **D5 — Turn semantics.** Claude turn: operator message → last assistant record before the next operator message. Codex turn: `task_started` → `task_complete`. A turn with no end record inside the window is labelled `incomplete` and contributes no invented minutes. Working minutes per seat = sum of its complete turn spans in the window. Operator turns = per-operator-message rows in A's transcript (start time, minutes until A's reply ended, each seat's output in that span); by construction they cannot overlap, so operator wait = their sum. The seat's first turn starting in the window gets its own row labelled `first turn in window`, only for its first session; when the opening map took more than one turn the row carries the note that it is not the whole map cost.
- **D6 — Token method (reproduces reference figures).** Claude: group assistant records by `message.id`; output = largest `output_tokens` in the group, other classes = the group's last values; sum over groups; assistant messages counted apart from turns for a Claude seat. Codex: `total_token_usage` of the last `token_count` event in the window minus that of the last one before it; no event before the window → baseline zero; cumulative decrease → counter reset, reported as the seat's explicit error (a `usage unmeasured` row, `outcome partial`). Records outside `[opened, until]` are excluded. Two sessions for one seat are added.
- **D7 — `USAGE.md` contract.** Line 1 is the summary line (operator wait minutes, operator turns, restatements, output per seat) — sibling summaries are printed by reading first lines. Then per-seat rows (harness kind, each model and effort value found, turns, assistant messages for Claude, working minutes, tokens by the classes that harness records), the `first turn in window` row, operator-turn rows and total operator wait, the restatements count, and for an ended Claude session its `totalCostUSD` labelled a whole-session figure. Stated-limit text in `USAGE.md` and `docs/guide/chart.md`: window tokens/minutes show that usage and elapsed time changed, not that dollar cost fell; a whole-session dollar total can include other charts and is not this chart's cost; subagent usage is not counted; turn and operator-wait definitions; restatement requests on rounds that record no fork answer (map, handoff review, held charts) are not counted. A rerun replaces the file.
- **D8 — Exclusions and output hygiene.** `isSidechain:true` records and transcript files other than the located `<session>.jsonl` are excluded (matches the reference method; also why subagents are not counted). Output holds ids, times, numbers, and read model/effort values only — never message or tool text. No model name, effort level, price or rate literal appears in the script, SKILL.md or the guide; model and effort exist only as values read from transcripts.
- **D9 — Doc edits.** SKILL.md: Open gains the seats-record rules (capture `opened` at first-pass start and seat entries from `herdr agent list` into the door's temporary files, write `<chart>/seats.yaml` when the chart folder is created, append an entry when a seat's session id changes, outside-herdr form, no new operator questions); Take gains the `restatements` increment rule and keeps the Taken sentence saying how often the round was restated; Handoff gains running the script right before the handoff review, showing the printed lines there, reporting the outcome word and continuing on `partial` (a failed measurement never holds a handoff), and running it again when appending `Handed off`, `Held` or `Closed`. `shapes.md` chart records tree gains one line each for `seats.yaml` and `USAGE.md`. `docs/guide/chart.md` chart records listing gains the same two lines plus the stated-limit sentence.

## Interfaces

- `seats.yaml`: D1 schema, door-written, script-read.
- `chart-usage.ts`: D2 argv/outcome/exit contract; follows peer-wait.ts structure (argv length check → usage exit 1; zod at the boundary; JSON-safe errors to stderr).
- `USAGE.md`: D7 layout; line 1 is the stable summary contract consumed by sibling printing.
- `herdr agent list`: read-only, fields `pane_id`, `agent`, `agent_session.value` (proof already recorded in readiness.yaml).

## Units and waves

- **Wave 1**
  - **U1 — script and tests.** Owns `skills/chart-issues/scripts/chart-usage.ts`, `tests/chart-usage.test.ts`, `tests/fixtures/chart-usage/**`. Shared test resource: none (temp harness homes via CLAUDE_CONFIG_DIR/CODEX_HOME; fixtures are its own files). Depends on: nothing.
  - **U2 — skill and doc prose.** Owns `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`; reads `docs/guide/files.md` to confirm no chart-records list (report states none found). Shared test resource: none. Depends on: nothing (the D1/D2/D7 contracts above are fixed by this plan). Sibling leaf peer-notes-single-writing edits other sentences of SKILL.md on its own branch — touch only the sentences named in D9.
- **Wave 2**
  - **U3 — live-run verification.** Owns nothing (temporary chart folder outside the repo). Runs the criterion-10 command against the three real transcripts and reports totals or the explaining record class. Depends on U1 (the script). U2 may land in parallel; verification waits for both.

## Done-criterion → proof

1. **SKILL.md seat-record rules** — proof: read Open/Handoff/Take sections after edit + `grep -n "seats.yaml\|restatements" skills/chart-issues/SKILL.md`; catches a missing or misplaced rule. Size: seconds. Rerun: any SKILL.md edit.
2. **CLI contract** — proof: `bun test tests/chart-usage.test.ts` cases building a temp chart (run → `USAGE.md` exists, stdout = own summary + sibling first lines + `outcome` last; second run replaces the file; nothing else written). Catches contract drift. Size: seconds. Rerun: script change.
3. **Table contents** — same test file, fixture asserting every D7 row and label. Catches missing/wrong rows. Seconds. Rerun: script change.
4. **No literal model/effort/price/rate** — proof: `grep -rniE "claude-|gpt-|sonnet|opus|haiku|price|rate|USD" skills/chart-issues/scripts/chart-usage.ts skills/chart-issues/SKILL.md docs/guide/chart.md skills/chart-issues/assets/shapes.md` returns no model-name/price hit, plus fixture transcripts carry sentinel model names that appear in output only as read values. Catches hardcoding. Seconds. Rerun: any owned-file edit.
5. **Exact counting** — same test file fixtures: repeated `message.id` counts once; codex cumulative read as difference, never summed; counter decrease → explicit unmeasured error; outside-window records excluded; two sessions per seat added; tool-result and `isMeta` user records start no operator turn; unfinished turn → `incomplete` with no invented end. Catches arithmetic errors. Seconds. Rerun: counter change.
6. **Unmeasured path** — same test file: missing transcript and missing-field fixtures yield `usage unmeasured` row with file and field, other seats measured, `USAGE.md` written, `outcome partial` last line, exit 0; missing/unparseable `seats.yaml` and missing chart folder exit non-zero with no `USAGE.md`. Catches wrong exit/shape. Seconds. Rerun: script change.
7. **No transcript text in output** — same test file: fixture bodies carry marker `USAGE_LEAK_MARKER`; assert stdout and `USAGE.md` lack it. Catches text leakage. Seconds. Rerun: script change.
8. **SKILL.md restatement and run-points** — proof: reading Take/Handoff + `grep -n "restatements\|chart-usage" skills/chart-issues/SKILL.md`. Catches missing door behavior. Seconds. Rerun: SKILL.md edit.
9. **Records listings** — proof: `grep -n "seats.yaml\|USAGE.md" skills/chart-issues/assets/shapes.md docs/guide/chart.md` shows one line each in both trees; `docs/guide/files.md` grep confirms no chart-records list and the report states none was found. Catches stale docs. Seconds. Rerun: doc edit.
10. **Live run** — proof command: temp chart folder outside the repo holding `seats.yaml` with `opened: '2026-10-06T16:34:47.701Z'` and entries A `1ce71920-…` claude, C `14a11404-…` claude, B `01a10f8a-…` codex; `bun skills/chart-issues/scripts/chart-usage.ts <tmp-chart> 2026-10-06T20:16:00Z`. Expected: A 151 assistant messages / out 268,671 / in 324 / cache-read 19,653,997 / cache-write 635,593; C 116 / 111,968 / 250 / 14,434,644 / 336,356; B 19 turns / input 12,716,484 / cached 12,255,616 / output 49,427 / reasoning 9,681. Any difference gets the explaining record class named in the report; a transcript no longer on disk is reported as such (all three verified present 2026-10-06). Size: minutes. Rerun: any counting/parse change before merge.
11. **Suite and scope** — proof: `bun test --timeout=30000` passes; `git status --porcelain` and `git --no-pager diff main --stat` show no `src/` or `issues/` changes. Catches suite breakage and scope leak. Minutes. Rerun: before merge.

Checks run at implementation end: `bun run format`, `bun run typecheck`, `bun test --timeout=30000`. This is not a slow-run leaf; no restart boundaries needed — the live run is one command of minutes.

## Implementation notes

Dated 2026-10-06. Constraints discovered at implement time; each refines a decision, none changes a lock.

- Harness-generated claude user records are marked `isCompactSummary: true` (verified on the A transcript's 16:59:34 continuation record, which sits next to a `system`/`compact_boundary` record). Operator message = `type:user` + `isSidechain:false` + `isMeta` falsy + `isCompactSummary` falsy + content not a tool_result list. Refines D4/D5.
- "The map took more than one turn" (D5 note) is detected as: one or more harness-generated continuation records (claude `isCompactSummary`) or interrupted/unfinished turn boundaries inside the seat's first window-span, i.e. the reply to the opening operator message was split into more than one turn. When detected, the `first turn in window` row states it is not the whole map cost. A fixture pins this; if no reliable detector exists on a real transcript, note the limitation in the report rather than guessing.
- Claude operator-turn "output inside that span" = sum over assistant records in the span of (`usage.output_tokens` minus the previous record's `output_tokens` in the same `message.id` group, or the full value for the group's first record). Codex operator-span output = `total_token_usage.output_tokens` difference between the last `token_count` in the span and the last one before it. Refines D5/D6 without changing the reference-total method.
- `Bun.YAML.parse` parses `seats.yaml`; zod validates the shape (same pattern as `readReadiness` in `src/readiness.ts`).
- USAGE.md row layout is the implementer's to choose as long as D7's required fields and labels appear verbatim (`first turn in window`, `operator turns`, `incomplete`, `usage unmeasured`, `outcome done|partial`); sibling print order sorts sibling folder names.

## Notes

- Brief and design agree; no conflicts carried. The one reading settled here: an absent `seats.yaml` counts as "does not parse" for the exit-code rule (D2).
- Held disagreements already resolved in the design (no per-chart quality review; restatements counted by meaning at answer-recording time) are scope locks, not reopened.
- Credentials: brief declares none; `akrogon status` shows no `Missing:` lines. No operator action required.
