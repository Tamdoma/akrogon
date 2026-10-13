# Ship plan, merged (A, B, C notes: ship-A.md, ship-B.md, ship-C.md)

## Agreed
- Naked permit deletion at max_active 20 is unsafe: ~9 queued runs at ~10 GB on a ~23 GB base pass MemoryMax 96G (A,B,C). The operator's uncommitted two-lane stopgap in src/permit.ts stays live until the replacement merges and is never committed as the design (B,C).
- worker-duty: workers run only the targeted tests their brief names; A runs the changed-tests command after each pick and all checks at phase ends; edit worker-protocol, brief-template, implement-issue SKILL (A,B,C).
- evidence: close. Output outside the printed checks command is diagnostic, never checks or done proof (A,B,C).
- ceiling-trigger: close. The 300 s trigger stays verify:core only; changed-tests duration is selection breadth, not quota cost (A,B,C).
- dispatch-wip: lower max_active now, no pressure-reactive dispatch in this handoff (A,B,C). Value 6 now (B,C), 8 after the start check lands (A,C).
- Start check: replaces the permit for every check, no name exemptions (A,C); actual slice memory plus reservations for runs not yet charged, so simultaneous starters cannot share the same headroom (A,B,C). Nested runs inside an admitted run start at once (B,C).
- Per-run unit and stop-run: own leaf after the start check; unit type settled by proofs, not the operator (A,C; B accepts if supervision is independent).

## Differ
- D-a Leaf shape. A,C: start check alone first (ends the waiting soonest), per-run unit second. B: one leaf with both, because reservations should release on verified unit cleanup.
- D-b Reservation. A,C: reserve only for recently started runs (startup headroom), threshold 48 GB actual+reserve. B: 16 GiB per heavy run held for the run's life, admit below 60 GiB. B's form at a 23 GB base admits ~2 heavy runs, close to a two-lane permit.
- D-c Long-run path. C: skill background pattern now (whole printed command, log and exit file under $TMPDIR, wait on exit file), detached mode off route. A: detached mode in the unit leaf. B: durable run id start/status/wait/stop in the managed leaf.
- D-d Skill edits timing. B,C: a small leaf now, before code. A: after the unit leaf.

## A's merge proposal
- L1 skill-duty (S): worker duty, evidence sentence, background pattern (C's form). max_active 6 by operator config now.
- L2 start-check (M): C's L1 scope; reservation per D-b A,C form with the reservation also held until the run's own memory shows (no unit yet, so time-bound, e.g. 90 s); max_active 8 when merged.
- L3 run-unit (L): per-run unit, stop-run, stale sweep, detached run id (B's lifecycle criteria); stop-run replaces the PID rule text.
- L1 and L2 parallel, L3 blocked-by L2.
- Operator questions: max_active 6 now; L2 whole vs naked deletion today; threshold 48 GB and reservation shape; framework port isolation priority (test-cost chart).
