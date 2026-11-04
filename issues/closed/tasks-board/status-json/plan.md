# Plan: status-json

`akrogon status --json` prints one JSON envelope covering every registered repo
from any folder, built as a serialization of the existing `scanRepo` scan —
never a second scan — so every fact is the one the text board reads.

## Decisions

- **D1 — flag wiring**: `akrogon.ts` adds `json: { type: 'boolean' }` to the
  `status` verb's options and passes it as a third positional to
  `statusCommand(slug, charts, json)`. `--json` refuses a positional slug and
  refuses `--charts` (usage error like the existing `--charts`+slug refusal);
  bare `status --json` covers all registered repos regardless of cwd.
- **D2 — scan additions, no rendering change**: `Scan.ok` gains
  `closed: Leaf[]` (the same `repoInventory` call already collects closed
  leaves; `scanRepo` splits them out instead of filtering to open). `ScannedLeaf`
  gains `resolved: { a: SlotConfig; b: SlotConfig }` beside `seatSources` —
  `scanRepo` already calls `seats()`, it keeps the seat configs it computed.
  `unpackedLines` is refactored to return `{ path, command }[]` (rel path as
  today); the text caller formats the same `Unpacked: <path>: run <command>`
  line. Extract `phaseEntry(log, state): ts|undefined` (the `last` lookup in
  `cells`) for reuse by the leaf serializer. Extract `landOf(state)` as the
  existing `phase === 'merge' && batch?.owner === 'command'` predicate. Text
  output byte-for-byte unchanged.
- **D3 — leaf JSON** (per design's verbatim envelope): `slug`, `group` (the
  `rows()` groups list), `phase`, `phase_since` (ms from the last log record
  into `state.phase` via `phaseEntry`, null when absent), `first_prompt` (ms
  from `starts()`, null when absent), `stopped` (stopped.yaml
  `repo/slug`), `blocked_by: [{ slug, label }]` for every raw `blocked-by`
  entry (label = dep's phase; `'merged'` for a satisfied dep; `'parked'` /
  `'unreadable'` / `'missing'` from the same rules `unmergedDeps` uses),
  `broadcast_pending` (`broadcastPending`), `land: { alive, unit } | null`
  (`landAlive(batch.attempt)` + `landUnit`), `busy_since: { a, b }` (ms|null,
  lowercase per the design's `a`/`b`), `done`, `attempts`, `fix_rounds`,
  `verdict` (raw), `delivery_errors: { a, b }` (raw `delivery_error` A/B,
  null-absent; visibility lives in `red` and the panel's `busy_since` join),
  `failure` (raw|null), `missing: Gap[]` (`leaf.missing`), `worktree`
  (`resolve(worktreeStore(repo), slug)` — the same resolution `next.ts` uses),
  `plan` (`resolve(leaf.path, 'plan.md')`), `red` (D6 leaf predicate),
  `seats: { a: { harness, command, source }, b: {...} }` (`command` =
  `global.harnesses[harness].split(' ')[0]`, the template's first word),
  `history` (last 10 `LogRecord.text` for the slug, as the slug branch).
- **D4 — repo JSON**: `name`, `root` (expanded registered path on an
  unreadable repo), `paused`, `error` (scan error | null),
  `unreadable: [{ path, error }]` (`scan.failures`), `slow`
  (`scan.slow.slow` when `first` set and `close` unset →
  `{ leaf, run, ms, normal_ms }`, else null), `unpacked` (the structured
  `unpackedLines` result), `queue: [{ slug, place, no_record }]` from
  `scan.queue` (`place` 1 = holder; `no_record` carries the TURN
  "no merge record" fact — addition noted under Design conflicts below),
  `kept` (`readKept`, `{ path, reason }`), `charts` (`chartRows` cell arrays —
  every chart, all stages, as `--charts` shows), `parked: string[]`
  (`scan.parked`, parked folder names the text board rows show — design lists
  no field; noted below), `leaves` (D3).
- **D5 — envelope top**: `schema: 1`, `generated` (the single `now` ms),
  `red` (D6), `watch` (D8), `deploy` (`readDeployRecord()` →
  `{ failed: !ok, attempted, active, step, error }`, null record → null;
  `active` from `currentReleaseCommit()`, other fields `?? null`), `run`
  (while any listed run waits: the rendered `run line` block the text prints,
  joined text; else null — criterion 2 asks the line's facts be in the JSON,
  the design spells `<run line text>`), `kept` (`readHostKept`),
  `merges` (D9), `repos` (D4, sorted by name as `scans` already are).
- **D6 — red**: per leaf `phase === 'failed'` or `missing.length > 0` or a
  delivery error present while its seat is not busy (the `note()` prompt
  condition). Envelope `red` = number of red leaves + `scan.failures.length`
  per repo + 1 per unreadable repo + 1 for a failed deploy. No time input.
- **D7 — open question resolved (design: leaf-detail reuse)**: the slug
  branch and the leaf serializer share `leafGaps`, `seats`, `phaseEntry`,
  `landOf`, `landAlive`, `landUnit`, `broadcastPending`, `readKept`,
  `readHostKept` — not one shared builder. The slug branch's value is its
  print layout; routing it through the JSON shape adds a print-from-object
  conversion for zero behavioral gain and risks byte-drift in locked output.
- **D8 — watch**: `folders` = each registered repo's `issues/` (expanded
  registered path — watchable even when the repo is unreadable) plus
  `<globalHome>/runs`. `files` = `<globalHome>/config.yaml`,
  `paused.yaml`, `stopped.yaml`, `reconcile-host.json`, `deploy.yaml`, and
  `current` (the `currentLink()` path). Never `<globalHome>` itself.
- **D9 — last merges**: `closed` leaves with `phase === 'merged'`; `merged`
  ms = `Date.parse` of the last log record `(slug, to === 'merged')`;
  `total_ms` = `merged - first_prompt` from that repo's `starts()`, null when
  no first prompt; top 5 across repos by `merged` desc.
- **D10 — exit code**: `status --json` exits 1 when any scan is `!ok` or has
  `failures` — the text path's own rule — so the envelope and the failure
  signal coexist (criterion 3). Deploy failure alone does not change the
  exit code (matches text).
- **D11 — test helpers**: `tests/status-fixture.ts` (new non-test module)
  takes `register`, `event`, `mergeRecord`, `log`, `prompt`, `timings`,
  `snapshot`, `statStart`, `seedRunRecord`, `needs` from `status.test.ts`;
  both status test files import it. Committed in the test commit with the
  `Test-Change` trailer citing the move, no expectation changed.

## Design conflicts / open notes for review

- Design lists no `queue` `no_record` and no `parked` field; both facts are
  on the text board (TURN "no merge record", parked rows) and criterion 2
  requires every line kind's fact in the JSON. Added as `queue[].no_record`
  and `repos[].parked`.
- Brief says "run line"; design says `run: <run line text>`. The serialized
  rendered text is the fact the board shows.
- No conflicts between brief and locked design.

## Interfaces needed (all existing)

`readGlobal`, `readRepo`, `currentRepo` (unused in JSON path), `seats`,
`SlotConfig`, `globalHome`, `expandPath`, `worktreeStore` — `config.ts`;
`repoInventory`, `broadcastPending`, `DeliveryError`, `Leaf`, `State` —
`state.ts`; `readLog`, `LogRecord` — `log.ts`; `readTimings` — `timing.ts`;
`mergeQueue`, `QueueEntry` — `turn.ts`; `issueFolders` — `park.ts`;
`readReadiness`, `gaps`, `Gap` — `readiness.ts`; `readPaused` — `pause.ts`;
`readStopped` — `stop.ts`; `readKept`, `readHostKept`, `KeptEntry` —
`reconcile.ts`; `readDeployRecord`, `currentReleaseCommit`, `currentLink` —
`release.ts`; `landAlive`, `landUnit` — `land.ts`; `lineRuns` —
`admission.ts`; `readVerifyRuns`, `VerifyRun` — `verify.ts`.

## Read-first

- `src/status.ts` — `scanRepo`, `Scan`, `ScannedLeaf`, `cells`/`note`/`rows`,
  `chartRows`, `unpackedLines`, `lineRows`, `statusCommand` (both branches).
- `src/akrogon.ts` — `status` verb options + dispatch (~lines 46, 163).
- `src/config.ts` — `seats()` (~170), `worktreeStore()` (325), `expandPath`,
  `globalHome`.
- `src/state.ts` — `stateSchema`, `broadcastPending`, `repoInventory`.
- `src/turn.ts` — `mergeQueue`, `unmergedDeps` labels, `QueueEntry`.
- `src/reconcile.ts` — `readKept`, `readHostKept` (~100–132).
- `src/release.ts` — `readDeployRecord`, `currentReleaseCommit`, `currentLink`.
- `tests/status.test.ts` — fixture vocabulary and existing assertions.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`, `fakeHerdr`.
- `issues/chart/tasks-panel/forks/status-json.md` and the leaf `design.md`
  envelope block (verbatim names).

## Checklist

### Wave 1 — U1 (serial-solo: the only unit)

Owns: `src/status.ts`, `src/akrogon.ts`, `docs/reference/commands.md` (status
row + usage line). Tests already committed:
`tests/status-json.test.ts`, `tests/status-fixture.ts`,
`tests/status.test.ts` (import switch), `tests/helpers.ts` untouched. No
shared test resource. No prerequisite units.

- [ ] `akrogon.ts`: `json` flag on `status`; reject `--json`+slug and
  `--json --charts`; pass to `statusCommand`; usage line gains `--json`.
- [ ] `status.ts`: `Scan.ok.closed`, `ScannedLeaf.resolved`, structured
  `unpackedLines`, `phaseEntry`, `landOf`; `statusCommand(slug, charts,
  json)` builds and prints the D3–D5 envelope for `--json`.
- [ ] `commands.md`: `akrogon status [<slug>|--charts|--json]` row updated —
  the only doc line naming the command's invocation; no other doc carries
  command syntax. README's Inspect table has no status row — unaffected.
  No skill file documents `status` invocation syntax — unaffected.

## Criteria → observation

Proof command for every criterion:
`akrogon run-check --name status-json -- bun test tests/status-json.test.ts`
(runner exists at AKROGON_BASE: `bun test` over the committed file).
Plus the repo `test` check (whole suite, brief's "the repo's `test` check")
for the text-output-unchanged regressions. Size: seconds. Rerun trigger:
any change under `src/status.ts`, `src/akrogon.ts`, or the named test files.
Not a slow-run leaf; no restart boundaries.

| C | Test | What proves it |
|---|------|----------------|
| 1 | `envelope covers every registered repo from any folder` | CLI `status --json` at repo root and `/`; strictObject schema on the parsed envelope: `schema===1`, `generated` ms ≈ now, `repos` lists all names/roots incl. a repo registered from cwd; text `status` still prints the board (existing assertions, suite). |
| 2a | `envelope carries the board alert facts` | Fixture with failed leaf, readiness gap, deploy.yaml failure, slow merge (`verify-runs.jsonl` seed), unpacked folders, paused repo, run-line waiter (`seedRunRecord` moved helper): asserts `deploy`, `run`, `repos[].slow`, `repos[].unpacked[].command`, `repos[].paused`, leaf `missing`, `failure`, `red`, and that an unreadable leaf lands in `repos[].unreadable`. |
| 2b | `envelope carries row and section facts` | Fixture with stopped leaf, blocked-by (dep parked/missing/open labels), merge queue holder+place+no_record, broadcast pending, command-owned land, kept report, chart rows: asserts each leaf field and `queue`, `charts`, `kept` (repo+host). |
| 3 | `unreadable repo still prints the full envelope` | One repo's registered path removed; `code===1`, stdout still parses to the envelope with the healthy repo's leaves and `{ error, unreadable: [{ path }] }` naming the missing root on the bad repo. |
| 4 | `each leaf carries the detail fields` | zod strictObject on a leaf: every D3 key present; `group` deep-equals, `seats.command === 'fake'`, `worktree` = `~/.akrogon/worktrees/<repo>/<slug>` under the fake home, `plan` = `<path>/plan.md`, `history` length ≤ 10 lines matching `status <slug>` History content. |
| 5 | `merges and charts` | Two repos, 6 merged leaves in `closed/` with prompt timings + merge log records at staggered times + one non-merged closed leaf: `merges` holds the 5 newest by merged time desc, each `{ repo, slug, merged, total_ms }` with `total_ms` = merged − first prompt; `repos[].charts` equals the `--charts` row cells. |
| 6 | `red counts real blocks only` | Fixture: failed leaf + delivery-error leaf + missing-gap leaf + deploy fail + unreadable repo + unreadable leaf → `red === 6`, per-leaf `red` flags true; slow-merge-only and paused-only runs → `red === 0` (no time input: the same states that print amber carry no red). |
| 7 | `watch names folders and files` | `watch.folders` = both repos' `issues/` + `<home>/runs`, `watch.files` = the six named files; `<home>` itself appears in neither. |
| 8 | `status --json writes nothing` | `snapshot(f.home)` before/after `status --json` deep-equals; `herdr.json.calls` absent. |

Red at planning, shown: `akrogon run-check --name status-json -- bun test
tests/status-json.test.ts` ran 9 tests, 9 fail — `SyntaxError: JSON Parse
error: Unexpected EOF` in `envelope()` on every test: `status --json` exits
nonzero printing nothing because `parseArgs` rejects the unknown `--json`
option. `check status-json: 1
/home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-status-json-1793721427788-2418789.log`.
Every criterion's red is this same missing feature; per-criterion traces
below.

### Condition check (per-decision traces)

- **D1 (flag)**: conditions "covers all repos" (a cwd-scoped filter could
  reachably break it) → case: run from `/` and assert every registered repo
  present (T1). "Refuses slug/--charts" → covered by usage refusal assertions.
- **D2 (scan additions)**: "text byte-for-byte unchanged" → existing
  `status.test.ts` assertions stay green (suite run); a `closed` leaf never
  joins `leaves` → T5 asserts a non-merged closed leaf absent from `leaves`.
- **D3 (leaf serializer)**: "history = last 10" → 13 log records, assert 10
  and newest-last order (T4). "blocked_by labels all raw entries" → dep sets
  covering merged/parked/missing/open (T2b). "delivery error visible while
  not busy; hidden facts don't falsify red" → busy-seat-with-error leaf
  asserts `red === false` while `delivery_errors.a` still carries the record
  (T6). "worktree resolves to the same path next.ts would" → T4 assertion.
- **D4/D5 (repo/envelope)**: "unreadable repo must not drop the envelope"
  → T3 asserts code 1 plus full parse. "slow shows only while unclosed" →
  close=recovered seed asserts `slow === null` (T2a).
- **D6 (red)**: "never depends on time" → T6: paused/slow fixtures that text
  marks only amber stay `red === 0`; each real block increments once (a leaf
  with two gaps counts once).
- **D8 (watch)**: "never `~/.akrogon` itself" → T7 negative assertion.
- **D9 (merges)**: "across repos, closed issues included, 5 most recent" →
  T5 cross-repo ordering and exclusion of open-but-merged leaves' duplication
  (merged-in-open leaf not double-counted: only `closed` contributes).
- **D10 (exit)**: criterion 3 case itself.

Each condition case is one assertion inside its criterion's test (named
above); none needs a separate temporary-edit red beyond the missing feature
itself — the decisions are new behavior, so the red is the missing feature.

## Implementation notes

- 2026-11-03: Include merged leaves from open and closed owners in recent merges, as brief criterion 5 requires the five most recent merged leaves across repos, closed issues included, and the design requires merged leaves across repos. This supersedes D9's closed-only restriction (review-B F2).
