# Design: red-main-hold

## Binding decisions, verbatim

### red-main-hold (issues/chart/merge-throughput/forks/red-main-hold.md)

Operator 2026-10-09, verbatim: "1a | 2a | 3a"

- Settled before the round (A,B,C): B judges base cause under check-issue:61 and the test-runs base-red rule; the command owns the hold through `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <sha>` (refuses stale attempt and a sha that is not current fetched main; leaf stays in merge; carried members restored; batch record cleared without halving the limit; hold file under globalHome per repo with sha, command and B's evidence fields; prints and notifies; status annotates). Hold guard sits after the fetch at src/next.ts:996 and inside the locked build (C rebuttal).
- Q1 1a: hold clears when fetched main differs from the held sha outside `issues/` and `learnings/`; the next holder's normal run is the check; red again re-holds on the new sha. Foreclosed: 1b green proof run (no runner exists).
- Q2 2a: operator pushes a fix to main, or names one fix leaf in the hold that may take the merge turn during the hold (selection and phase authorization override, solo attempt, full gate, merge_stamp untouched, valid only while the hold exists). Foreclosed: 2b push only; holder-B fix-forward (unreachable without a solo continuation).
- Q3 3a: separate explicit command clears a hold (e.g. `akrogon unhold`); status shows paused and held; unpause prints the hold. Foreclosed: 3b reuse `akrogon next`.
- Sequencing lock: bounce-counting lands after this hold. Operator restart of long-running akrogon processes at handoff.

Excluded here: Q2 2a fix-leaf naming and override belong to hold-fix-leaf; this leaf stores no fix leaf.

### Not binding here
- first-package: not binding here, owned by another leaf of merge-throughput.
- bounce-counting: not binding here, owned by another leaf of merge-throughput.
- queue-order: not binding here, owned by another leaf of merge-throughput.
- attempt-records: not binding here, owned by another leaf of merge-throughput.
- batch-size: not binding here, owned by another leaf of merge-throughput.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Code-only leaf in the akrogon CLI. No auth, secrets, browser or outside calls (except where named). Each done-criterion is proven by the cheapest real-boundary test: a `bun test` case driving the command or function against a temp git repo and the fake herdr (tests/fake-herdr.ts, tests/helpers.ts), as the existing batch-merge and phase tests do. New behavior shows one deliberate break turning its test red. No live model run. The notification reuses the existing herdr call shape of mergeNotice (src/next.ts:827-864); its real call is proven at charting in readiness.yaml `proofs` (A,B,C). Long-running `akrogon next` processes keep old code until the operator restarts them at handoff (red-main-hold sequencing lock).

## Leaf architecture

Owned: src/phase.ts `--red-on-base` flag and ending, a new hold module beside src/pause.ts (read/write/clear under the same globalHome lock), the guard in mergeTurn after the fetch and inside the locked build, `akrogon unhold` command, status and unpause printing, skills/merge-issue/SKILL.md:65 red-ending order (base first), docs. Interface for hold-fix-leaf: hold record type with an optional `fix` slug field and the read/clear functions. For merge-attempt-records: calls its append with outcome `held`. Excluded: halving or batch_limit changes, fix-leaf override, fix_rounds counting.
