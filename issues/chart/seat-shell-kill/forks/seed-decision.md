# Seed decision: an ended seat turn is idle for prompt delivery

## Question

Tamdoma/akrogon#157: `## Operator decision (Ivan Juras, 2026-11-24)`

## Findings

Check record, 2026-11-24. Pull time 2026-11-24T22:57:50Z (`akrogon pull`, cwd /home/ivan/Work/infra/akrogon).

- `gh api graphql` issue 157: author `ivanjuras`, `lastEditedAt` null, `userContentEdits.totalCount` 0 (no body edits).
- `gh api repos/Tamdoma/akrogon/collaborators/ivanjuras/permission --jq .permission`: `admin`.
- Counts: author reads admin, no editors, no edit at or after the pull time.
- F1 (non-blocking, A, 2026-11-25). The sweep at phase advance (forks/shell-sweep.md `## Taken`) makes the first sentence true for shells started before the seat's phase call, which is the incident's case. It is not true for two other cases:
  - a shell started after that call in the same turn
  - a turn that ends without a phase call while a shell runs.
  hc cannot tell those ended turns from working ones (P1), and the listener has no timer (`src/listen.ts:listenCommand`), so no pass runs and the 1 h busy notice does not post. Covering them needs a periodic wake, plus either a time-threshold kill or a per-harness end-of-turn read. The chart goes on. The periodic wake is a candidate seed for its own chart.

## Taken

## Operator decision (Ivan Juras, 2026-11-24)

- Fix this in akrogon/hc, not with a watch-side kill permission: a seat whose agent turn has ended counts as idle for prompt delivery even when a background shell it started is still running.
- Leftover seat shells end when the leaf's phase advances.
- Not in scope: granting the watch permission to kill seat shells as the workaround.

seed decision from Tamdoma/akrogon#157, taken at import on 2026-11-24, not asked, decided by ivanjuras

Reason: not stated. Alternatives: not stated.
