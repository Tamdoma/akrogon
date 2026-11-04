# Report: status-json

Serial-solo run (plan's only wave holds one unit): A implemented, no workers.

## Base and head

- Base: `2489ef32925837514f1452aaa1fc2f7d1c530225` (AKROGON_BASE at plan and implement; no refresh moved the branch — fetch+rebase reported already up to date)
- Head: `27dff5a` (same tree as verified `9370b95`; amended to add the `Test-Change: tests/status.test.ts` trailer the phase guard required for prettier-touched files)
- Commits: `d0be6992` tests (planned criterion tests + `tests/status-fixture.ts` extraction), `27dff5a` product.

## Changed files and why

- `src/akrogon.ts`: `json` boolean on the `status` verb; `--json` refused with a slug or `--charts`; passed as third arg to `statusCommand` (D1).
- `src/status.ts`: `Scan.ok.closed`, `ScannedLeaf.resolved` (seats resolved once in `scanRepo`), `unpackedEntries` returning `{path, command}` with the text caller formatting the same `Unpacked:` line, `phaseEntry`/`landAttempt` extracted, and the `--json` envelope (`JsonLeaf`/`JsonRepo`/`JsonEnvelope`) built from the existing scan (D2–D10). Text output path unchanged.
- `docs/reference/commands.md`: status row gains `--json` and its effect (the only doc naming the invocation).
- `tests/status-json.test.ts`: planned criterion tests.
- `tests/status-fixture.ts` / `tests/status.test.ts` / `tests/command-reference.test.ts`: helper extraction and the status contract's `--json` alternative (committed under `Test-Change` trailers).

## Design notes for review (from plan.md)

- `queue[].no_record` and `repos[].parked` are additions over the design's verbatim envelope: both facts are on the text board (TURN "no merge record", parked rows) and criterion 2 requires every line kind's fact in the JSON.
- `run` carries the rendered run-line text (`run line (one per repo)` + table) while a listed run waits, per the design's `<run line text>` spelling.
- `merges[].merged` is `null` for a closed merged leaf with no `to:'merged'` log record (no merge event to timestamp); sorted last.
- `--json` with a slug or `--charts` is a usage refusal — locked surface, no new mode.

## Commands run

- Refresh: `git fetch origin` + `git rebase origin/main` — already up to date, twice.
- Criterion proof: `akrogon run-check --name status-json -- bun test tests/status-json.test.ts`
  - red at planning: `check status-json: 1` (`check-status-json-1793721427788-2418789.log`) — all 9 fail, `--json` unknown option.
  - green on head `9370b95`: `check status-json: 0` (`check-status-json-1793721876296-3055737.log`) — 9 pass.
- Text regression: `akrogon run-check --name status-text -- bun test tests/status.test.ts` — `check status-text: 0` on head (`check-status-text-1793721877195-3056382.log`), 36 pass.
- `akrogon verify` on `9370b95`: green — format/typecheck/test all 0; 1277 tests pass (`check-test-1793721872736-2746235.log`).

## Criterion → proof

All 8 criteria proven by `check status-json: 0` on `9370b95`; the text-unchanged condition proven by `check status-text: 0` (36 assertions) and the green verify suite (1277 tests, includes every status text assertion).

| C | Test | Result |
|---|------|--------|
| 1 | `status --json covers every registered repo from any folder` | pass |
| 2 | `envelope carries every board alert fact` + `envelope carries row and section facts` | pass |
| 3 | `one unreadable repo exits 1 and still prints the full envelope` | pass |
| 4 | `each open leaf carries the detail fields status <slug> prints` | pass |
| 5 | `merges hold the 5 most recent across repos and charts match --charts rows` | pass |
| 6 | `red counts real blocks once and never counts amber or time` | pass |
| 7 | `watch names each repo issues dir and runs plus the named files, never the home itself` | pass |
| 8 | `status --json writes nothing under the home or any repo` | pass |

## Repairs inside the pass (test-side only)

- Prettier violations on first verify (3 files): formatted, amended.
- `command-reference.test.ts` contract table missing `--json`: updated to mirror the new flag (`Test-Change` trailer), 4 tests pass.
- Planned-test fixture fixes while debugging (paused/stopped yaml shape, parked-owner twin conflict, per-repo log/timings, `merged` nullable schema): committed with `Test-Change` trailer. No expectation was weakened.

## Limitations

None known. No unverified criteria.
