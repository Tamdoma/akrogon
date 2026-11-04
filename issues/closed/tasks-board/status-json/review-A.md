# Review A: status-json

- Base: `2489ef32925837514f1452aaa1fc2f7d1c530225`
- Reviewed head: `27dff5a` (verified green as `9370b95`, same tree)
- Evidence: `akrogon verify` green on `9370b95` (format/typecheck/test, 1277 tests, `check-test-1793721872736-2746235.log`); `check status-json: 0` and `check status-text: 0` on head.

## Verdict: fix

## Fixes

### F1 — `blocked_by` labels a closed dependency `unreadable` instead of its real phase

Source: `blockedBy` in `src/status.ts` looks the dep up only in `scan.leaves`
(open leaves). A dependency that merged and moved under `issues/closed/` is no
longer found, falls through `isParked` (no) to `hasLeafFolder` (yes — it scans
open *and* closed), and is labelled `unreadable`.

Realistic source: leaf B lists `blocked-by: [A]`; A merges and moves to
`issues/closed/` while B stays open — the normal lifecycle for a satisfied
dependency.

Consequence today: `status --json` reports `blocked_by: [{ slug: 'done-dep',
label: 'unreadable' }]` for a dep that merged cleanly; the Tasks board row
shows a satisfied dep as broken. The text BLOCKED BY column prints just the
slug, so this mislabel is a JSON-only lie, hitting criterion 2 (every line
kind's fact in the JSON) and criterion 4 (`blocked-by` fact).

Reproduction on the reviewed head:
`akrogon run-check --name blocked-by-repro -- bun test tests/tmp-repro.test.ts`
where the test makes `waiter` `blocked-by: [done-dep]`, moves `done-dep`
(phase `merged`) under `issues/closed/issue/`, and prints:
`BLOCKED_BY: [{"slug":"done-dep","label":"unreadable"}]` —
`check blocked-by-repro: 1 /home/ivan/Work/infra/akrogon/issues/open/tasks-board/status-json/implementation/check-blocked-by-repro-1793722002563-3063251.log`
(scenario test deleted after the run).

Expected: `{ slug: 'done-dep', label: 'merged' }` (or the closed leaf's
actual phase — a closed-but-unmerged dep is also reachable). Fix is one line:
search `scan.closed` alongside `scan.leaves` in `blockedBy`'s dep lookup.
A case asserting the label belongs in `tests/status-json.test.ts` under the
check.fix missing-case exception (existing runner and helpers suffice).

## Nits

- N1: `repos[].queue[].no_record`, `repos[].parked`, `merges[].merged:
  nullable` are additions over the design's verbatim envelope. Each carries a
  text-board fact (TURN "no merge record", parked rows, record-less merges)
  the envelope would otherwise lose; recorded in plan.md and report.md for
  the downstream `tasks-mod` contract owner to confirm.
- N2: `run` is the rendered run-line text, not structured rows. The design
  spells `<run line text>` so this reads as conformant; a structured row
  array would save the panel re-parsing if its author prefers — promotion
  needs a consumer complaint.
- N3: `leaves[]` still emits merged-but-open leaves with `phase: 'merged'`
  while `merges[]` draws only from `closed/` — a leaf mid-land appears in
  both views. Matches the text board (which also shows merged-in-open rows);
  consistent, but the panel must not double-count if it renders merges
  separately.

## Docs

- `docs/reference/commands.md` status row updated for `--json` — accurate.
- `src/AREA.md`, `tests/AREA.md` name no stale paths (live listing checked:
  every named path exists; `tests/status-fixture.ts` is a shared helper the
  `Key files` section does not enumerate per-file — consistent with its
  existing granularity).

## Notes

- All 8 done-criteria covered by `check status-json: 0`; text output
  byte-unchanged per `check status-text: 0` (36 tests) plus the green suite.
- No operator actions.
