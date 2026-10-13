# Chart: akrogon

## Destination
Framework leaves reach merged with fewer test rounds and less post-implement time, measured by the log, with leaves-as-chunks decided on measured numbers.

Route: lifecycle (debate no)

Work: timing record and `akrogon timing`, chained-unit policy.

## Forks taken
- [fix-order](forks/fix-order.md): 1a, fix the test and merge loop first, decide leaves-as-chunks after 20 measured leaves

- [measure-and-revisit](forks/measure-and-revisit.md): 1a timing record and `akrogon timing`, 1a 20-leaf merit gate for leaves-as-chunks

- [chained-units](forks/chained-units.md): 1a, when every plan wave holds one unit, A builds the leaf with no workers

## Open forks

## Fog

## Off route
- Leaves-as-chunks now: deferred by fix-order 1a, reopened only by the measure-and-revisit gate.
- Separate investigation of the 245 h before the first merge prompt: the timing record measures it.
- Batching changes: the merge line was one leaf deep in 32 of 41 attempts since Oct 10. The timing record shows if that changes.
- Framework test selection and test health: framework chart `issues/chart/leaf-speed` at the framework root.

## Pending steps
- Cohort marker: after timing-events (akrogon), test-changed-shared-files and flaky-test-fixes (framework) merge, record the latest of their merge times here as `<iso>` for `akrogon timing --cohort --since <iso>` in framework. Owner: door. Check: the marker line exists with the three merge commits cited.
- Observe the first framework leaf after serial-plan-solo merges whose plan has only single-unit waves: its timing record shows no `worker` scope checks. Owner: door. Check: `akrogon timing <slug>` output cited here.

## Done steps
- Framework `issues/config.yaml` duplicate checks removed in framework 92b9f3131 (by the framework-repo agent). Verified 2026-10-12: `akrogon config` at framework root lists checks `test_changed`, `selftest`, `cheap` and the same `merge_covers`.

Handed off 2026-10-13
