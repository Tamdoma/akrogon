# Design: failure-log

## Binding decisions, verbatim

### Off route entry ([CHART.md](../../../chart/leaf-readiness/CHART.md))

Write the existing `failure` record into log.jsonl: direct, no fork, joins the handoff as its own leaf.

### Excluded binding decisions

- readiness-contract, key-creation, key-sheet, env-source, live-change-grant, proof-fixtures, blocker-record and save-route: none concern the log record. blocker-record keeps the existing `phase failed --reason` command whose move this leaf logs

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md (installed at ~/.claude/skills/chart-issues/assets/standing-design.md)

- Cheapest sufficient tests: existing phase and next command tests with fixtures. No live call.
- No hardcoded secrets: the log copies only the reason text the seat wrote, and seat-input-rules keeps values out of reasons.
- Not applicable: auth mocks, server authorization, backend mutation, chain triggers, browser flows.

## Leaf architecture

Owned surfaces: `src/log.ts` (`logMove`), additions to `tests/phase.test.ts` and `tests/next.test.ts`.

Change: `logMove` adds `failure: after.failure` to the record when `after.phase === 'failed'`, and omits the key otherwise. Both `cause: blocked` (`src/phase.ts:202`) and `cause: attempts` (`src/next.ts:431,444`) moves reach `logMove` through `commitMove`. `src/status.ts` `logSchema` is a non-strict `z.object`, so the extra key needs no status change, which criterion 3 proves.

Exclusions: no backfill of old records, no log format version, no new status display of failure reasons.
