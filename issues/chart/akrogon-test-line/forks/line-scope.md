# Fork: line-scope

## Question

1. How does akrogon know which runs join the line: the repo config list `full: [test]`, or a fixed akrogon/test rule in code?
2. Can `akrogon stop-run <id>` stop a run that is still waiting?

### Carries

- Operator 2026-10-26 (INTAKE.md): akrogon only, one at a time per repo, `akrogon status` shows it, lifecycle route on autopilot, slot B as checker.
- Earlier decisions: issues/chart/host-run-load/forks/full-suite-line.md (Taken, status correction "ONLY if there's waiting", accepted residuals); revert 20455420 (operator O7, 2026-10-24: cross-repo waiting).
- Locks: no per-test timeout raises, no `--retry` or `test.serial`, no removing tests; stop runs only with `akrogon stop-run <id>`; never touch `.env`.

## Findings

Merged map: slots/map-merged.md (A: slots/map-A.md, B: slots/map-B.md), rebuttal slots/map-rebuttal-B.md.

- better-than-training · `git show 20455420`, src/config.ts `repoSchema` (strict), 2026-10-26 · a config list can be added only after the release that knows it is deployed. (A,B)
- better-than-training · src/stop-run.ts `stopRunCommand` (candidates from `liveRuns`, then systemctl stops run and guard units), src/scope.ts `startRunGuard`, 2026-10-26 · a waiting run has no unit or guard, so stop-run cannot stop it today. (B)
- better-than-training · src/reconcile.ts slice protection (`liveRuns`), src/state-home.ts `liveRecords` (live only), 2026-10-26 · waiting records must be visible to both. (B)
- B R1: rewriting a vanished record does not stop an old binary admitting another suite at deploy; deployment needs coordination either way.

## Taken

A's pick under autopilot, 2026-10-26: `1a 2a`.

1a: restore the repo config list `full` (names from `checks` or `merge_checks`), set to `[test]` only in akrogon's issues/config.yaml, as a pending main step after the leaf lands, the deploy record shows its release and `akrogon status` shows no live akrogon `test` run. Reason: a config list is the existing pattern for per-repo check settings and stays discoverable; a repo name inside the tool's code is a hidden special case that needs a release to move. Rejected 1b (fixed akrogon/test rule in code). Standing dissent (B): 1b needs no config activation step.

2a: `akrogon stop-run <id>` cancels a waiting run within its current scope-ownership check: under the admission lock the record moves to a cancel state the promotion and the vanished-record rewrite both respect, and the waiter exits without running its command, with a non-zero exit. Reason: stop-run is the only sanctioned stop; without this a stuck waiter can only be cleared by killing processes. Rejected 2b (no cancel, residual).

Binding decisions agreed in the map (A,B), carried into the leaf:
- Per-repo line: only runs of the same registered repo whose check name is in that repo's `full` list join one queue; no other repo waits on it. Arrival order by registration time with a deterministic tie-break; a waiting record is written before waiting; selection and promotion run under one short lock released before polling or running the command.
- Nesting: a line run inside a run that already holds the same repo's line is nested and creates nothing; inside any other run (another check, another repo) it takes its own turn.
- `ended` records keep the line until unit shutdown and record removal finish. After a killed wrapper a waiter may start up to ~5 s early (TimeoutStopSec=5): stated residual.
- Wait stays in `wait_ms`, separate from run time.
- Waiting records are visible to reconcile's slice protection and to state-home migration's live-record count.
- `akrogon status` shows the line with the existing table renderer only while at least one run waits: holder first, then waiters in queue order, with repo, leaf, check, state, age and run id.
- One stderr line on the waiting run names the holder.
- Raw `bun test` and other check names stay outside the line: stated residual. A stopped head waiter stays visible as `waiting 1` with no automatic timeout: stated residual, cleared with stop-run (2a).
- Tests use their own state home and fixture commands with handshakes, no heavy suite copies and no timing thresholds.

### A correction 2026-10-26 (B leaf review F1)

1a's activation condition "`akrogon status` shows no live akrogon `test` run" is dropped: status hides the line when nothing waits and cannot show that runs started earlier have drained. The main step waits only for the deploy record; a run started before the edit may overlap once, a stated residual. Also from the leaf review: criterion 1 covers normal completion (F2), cancel frees the queue and a suspended waiter exits when resumed (F3), and `reconcile` and `reconcileHost` join the run-record consumers (F4).
