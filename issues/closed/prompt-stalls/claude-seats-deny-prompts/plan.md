# Plan: claude-seats-deny-prompts

`harnessArgv` (src/seat.ts) merges `permissions.denyInsteadOfPrompting: true` into the claude
harness line's single `--settings` JSON object, appends the pair when the line has none, and
refuses a claude line it cannot merge without dropping a setting. codex, pi and agy argv are
untouched. Signature `{ kind, argv }` unchanged; `startSeat` and `startConsultant` keep appending
the task last.

## Read-first

- src/seat.ts (`harnessArgv`, lines 68-82; consumers `startSeat` line 225, `startConsultant` line 317)
- tests/seat.test.ts (committed criterion tests, real machine template verbatim)
- tests/helpers.ts (`fixture()`, `globalConfig` pattern)
- docs/reference/config.md (`harnesses` row, line 29)
- src/next.ts `dispatchLeaf` catch (report + 'skipped', ~line 775) — the throw's landing path
- design.md, brief.md, readiness.yaml proofs in the leaf folder
- learnings/LESSONS.md read; no line applies to this mechanism

## Decisions

- D1: Merge inside `harnessArgv` on the parsed argv (post `{model}`/`{effort}` fill), only when
  `config.harness === 'claude'`, before the `extra` spread. One element exactly `--settings`
  (pair form: next element is its value) or one element matching `--settings=...` (equals form).
  Zero settings flags: insert `'--settings', JSON.stringify({permissions:{denyInsteadOfPrompting:true}})`
  at `argv.length` (after every template element, before `--disallowedTools`). Exactly one: parse the
  value with `JSON.parse` (parse failure is the refusal), validate with
  `z.looseObject({ permissions: z.looseObject({}).optional() })` — loose keeps every other key —
  then write back `JSON.stringify({ ...obj, permissions: { ...(obj.permissions ?? {}), denyInsteadOfPrompting: true } })`
  in the same element position and spelling. More than one: refuse. Any element `--`: refuse.
  An explicit `false` comes out `true`.
- D2: Refusal errors are plain `Error` in the file's existing style (`Missing harness template`),
  message `Harness claude: --settings operand '<operand>' <reason>` — quotes around the operand, as
  the tests assert. The operand is the flag element as typed for pair/equals/multi/`--` (`--settings`,
  `--settings=<v>`, `--`), and the value element for a present-but-unusable pair value.
- D3: The throw needs no new handling. `akrogon next`: `dispatchSlot` → `dispatchLeaf`'s catch
  reports `{repo,path,slug,error}` to stderr and returns 'skipped'; each later pass retries until
  the operator fixes the line — same as the existing missing-template throw. `akrogon seat --slot`:
  propagates, non-zero exit. Neither swallows.
- D4: Doc: `docs/reference/config.md` `harnesses` row gains the merge/refuse rule in one clause.
  src/AREA.md and tests/AREA.md describe seats/tests at a level this does not change. No other doc.

## Units

Two units, one wave (disjoint owned paths, no shared test resource, no ordering between them).

- U1: `src/seat.ts` — implement D1+D2.
- U2: `docs/reference/config.md` — `harnesses` row only.

Doc lines: docs/reference/config.md `harnesses` row (U2). No other agent or human doc affected.

## Criterion proofs

Boundary: `harnessArgv` on a `GlobalConfig` from the fixture's real config.yaml, templates verbatim
in tests/seat.test.ts. Command for all: `akrogon run-check --name seat-tests -- bun test tests/seat.test.ts`.
Size: seconds (fixture is local tempdir, no model, no outside stage; no recording or replay).
Rerun trigger: the file's bun:test run; nothing else consumes these tests.

- C1 (pair-form merge: one flag, env kept, keys kept, false→true): tests "for a pair-form
  --settings line..." (3 cases). Failure caught: a second flag, dropped env, or unmerged object
  reaches `hc run` and claude silently keeps only the last settings (proof 3 in readiness.yaml).
- C2 (equals form): test "for an equals-form --settings line...". Same failure via the `=` spelling.
- C3 (no --settings: append pair, position, exact value): test "a claude line without --settings...".
  Failure caught: claude seats launch without the deny setting and stall on the rm prompt (#139).
- C4 (refusals): test "harnessArgv refuses a claude line with $name..." (10 cases). Failure caught:
  a line claude itself misreads (two flags, path, non-object) launches with settings silently dropped.
- C5 (non-settings elements unchanged, disallowed once last, other harnesses unchanged): the
  filter-comparison assertions inside the C1/C2/C3 tests plus the two pre-existing tests. Failure
  caught: a merge that reorders or mutates the template argv, e.g. claude flags shifted off their
  positions.

## Red evidence

- Missing feature (baseline, committed tests): `check seat-tests: 1 .../implementation/check-seat-tests-1794861299711-1226162.log`
  — all 15 new cases red, 4 pre-existing green. Conditions: deny true, merged object, appended pair,
  throw/refusal all fail on the old code.
- Break α (append second flag instead of merging): `check break-alpha: 1 .../implementation/check-break-alpha-1794861308619-1226736.log`
  — `Expected length: 1, Received length: 2` on the exactly-one assertion; equals test red on its
  startsWith count; every C4 case red (no validation). C3 green (its pair lands).
- Break β (pair inserted at index 1 with `false`, last template element dropped):
  `check break-beta: 1 .../implementation/check-break-beta-1794861313722-1227271.log`
  — position, spelling, false→true, non-settings-order and C3 position/value assertions all red.
- Break γ (throw `SyntaxError('Unexpected token')` on any `--settings`):
  `check break-gamma: 1 .../implementation/check-break-gamma-1794861319324-1227818.log`
  — every case asserting the message names `claude` and `'<operand>'` red; merge/append cases red.
- All break code reverted; tests committed (a7e928f5) before product code. Note for implement:
  Test-Change trailers need a blank line before the trailer block or %(trailers) misses them.

## Notes

- Design wins over brief where they differ; none found — brief and design agree.
- Machine `~/.akrogon/config.yaml` claude line unchanged (design Q1 rejected 1b).
- No env names in this leaf (`env_names: []`, `akrogon status` shows no `Missing:` lines).
- No grants in readiness.yaml, so no count lines.
- Stated limit stands: Claude Code honoring the key is charting's proof (readiness.yaml proofs);
  no live claude session and no paid call in this leaf's proof.
