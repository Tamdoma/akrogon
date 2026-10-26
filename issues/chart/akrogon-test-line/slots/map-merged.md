# Merged opening map, chart akrogon-test-line, 2026-10-26

Sources: slots/map-A.md, slots/map-B.md. Tags name the slots that wrote each line.

## Agreed

- Mechanism: bring back the queue from 20455420 (waiting record written before waiting, promotion to live under one short lock, arrival order by registration with a deterministic tie-break), but only akrogon's runs join the line, so no other repo waits on akrogon and akrogon waits on no other repo. Do not restore the host-wide range wholesale. (A,B) Rejected: a lock held through the whole suite or all of verify (delays setup, format, typecheck and cleanup) (B); `flock` in the command (no status view, no arrival order) (A); lower `--parallel` (runs still overlap) (A).
- Status: the existing table renderer, shown only while at least one run waits (operator correction 2026-10-24), holder first then waiters in queue order, columns repo, leaf, check, state, age. (A,B) Add the run id so `akrogon stop-run <id>` is usable. (B)
- Nesting: a line run inside a run that already holds this line is nested and creates nothing; a line run inside any other run (format, another repo's run) takes its own turn. (A,B) An inherited holder from another repo never grants the exemption. (B)
- Release: `ended` records keep the line until unit shutdown and record removal finish; after a killed wrapper a waiter may start up to ~5 s early (TimeoutStopSec=5), a stated residual. (A,B)
- Wait time stays in `wait_ms`, separate from execution time (src/admission.ts `held.wait_ms`, src/run-check.ts timing). (B, answers A Q1)
- What joins: runs launched through akrogon admission with the line's check name, which covers `akrogon verify`'s `test` and a seat's `akrogon run-check --name test`. Raw `bun test` and other names stay outside, a stated residual. (A,B)
- fewer-repeat-calls criterion 5 pairs run under `run-check --name c5r2-pair-*`, outside the line, so its proof is untouched. (A)
- Benefit: the leaf proves the mechanism only. It does not prove faster runs or fix failing tests; any later judgement uses wait plus run time from records. (A,B)
- Tests: own state home and fixture commands with handshakes, no heavy suite copies or timing thresholds; the removed two-repo test is inverted (another repo's `test` starts at once). (A,B)

## Differ

- Eligibility. A: restore the repo config field `full: [test]`, set in akrogon's issues/config.yaml as a main step after the release with the field is deployed (strict schema). B: a fixed akrogon/test rule in code using the repo name and check name already passed to admission; no config field, no rollout order, but a rename needs a code change.
- Cancelling a waiting run. B: `akrogon stop-run <id>` must cancel a waiting run (no unit or guard exists yet), with an explicit cancel transition under the admission lock so it cannot race promotion, and the "rewrite a vanished record" rule must not undo a cancel. A: did not cover it.
- Other consumers of run records. B: reconcile's slice protection (`liveRuns` in src/reconcile.ts) and state-home migration (`liveRecords` in src/state-home.ts, live only) must see waiting records, or an active waiter is invisible to cleanup and cutover. A: did not cover it.
- Rollout. A: config edit waits for deploy. B: old binaries still running at deploy start at once and read a `waiting` record as unreadable; drain or stop named runs before relying on the line.

## Pitfalls and what removes each

- Config written before deploy breaks every config read: removed by the fixed rule (B) or by the deploy-ordered main step (A).
- A stopped head waiter stalls the queue: visible as waiting 1 in status, no automatic timeout (accepted residual 2026-10-24) (A,B), cancellable by `stop-run` (B).
- Invisible waiters in cleanup or migration: waiting records join those consumers (B).
- Old binary sweeps a waiting record as stale: the waiter rewrites a vanished record with its original time, unless cancelled (A,B).
