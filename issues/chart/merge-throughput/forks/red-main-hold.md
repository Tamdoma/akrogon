# Red-main hold

## Question
Q1. When does a red-main hold clear: when main moves, or only after a green proof on the new main?
Q2. Who repairs red main, and how does that repair pass the hold?
Q3. Is the base comparison judged by B or mechanized by the command?

### Carries
- test-runs base-red rule: stop only on completed comparable runs with a recorded shared cause (issues/chart/test-runs/CHART.md:7).
- repo-pause: pause is operator-only, explicit commands still run (issues/chart/repo-pause/CHART.md).
- failed-leaf-routing: fix leaf over reopening delivered work.

## Findings
- Consensus: red gate -> run failing command on fetched main -> red there: leaf stays in merge, repo merge turn waits, no check.fix (A,B,C). Hold must be checked at mergeTurn entry (src/next.ts:962), not only dispatchMergeLeaf, or stacks are built and branches moved while nothing runs (C rebuttal).
- Clear: main moves then normal holder rerun is the proof (C, src/phase.ts:644); green proof first (B). B rebuttal F3: a completed red can still be a flake; needs an owner and retry route.
- B rebuttal F2: two red exits are not enough; base failure must explain the leaf failure (check-issue:61).

## Taken
Operator 2026-10-09, verbatim: "1a | 2a | 3a"

- Settled before the round (A,B,C): B judges base cause under check-issue:61 and the test-runs base-red rule; the command owns the hold through `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <sha>` (refuses stale attempt and a sha that is not current fetched main; leaf stays in merge; carried members restored; batch record cleared without halving the limit; hold file under globalHome per repo with sha, command and B's evidence fields; prints and notifies; status annotates). Hold guard sits after the fetch at src/next.ts:996 and inside the locked build (C rebuttal).
- Q1 1a: hold clears when fetched main differs from the held sha outside `issues/` and `learnings/`; the next holder's normal run is the check; red again re-holds on the new sha. Foreclosed: 1b green proof run (no runner exists).
- Q2 2a: operator pushes a fix to main, or names one fix leaf in the hold that may take the merge turn during the hold (selection and phase authorization override, solo attempt, full gate, merge_stamp untouched, valid only while the hold exists). Foreclosed: 2b push only; holder-B fix-forward (unreachable without a solo continuation).
- Q3 3a: separate explicit command clears a hold (e.g. `akrogon unhold`); status shows paused and held; unpause prints the hold. Foreclosed: 3b reuse `akrogon next`.
- Sequencing lock: bounce-counting lands after this hold. Operator restart of long-running akrogon processes at handoff.

## Proof
- 2026-10-10, herdr 0.9.3, operator's local herdr session: `herdr notification show "akrogon/merge-throughput probe" --body "charting proof for red-main-hold notify, ignore" --sound request` returned exit 0 with `{"reason":"shown","shown":true,"type":"notification_show"}`. No cleanup needed. Does not prove the operator saw it or other herdr versions.
