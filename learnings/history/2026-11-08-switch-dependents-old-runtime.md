# Switch leaf's dependents start on the old runtime

## Case

engine-on-hc was the switch from old herdr to hc. Its design drained every other open leaf before the merge (design.md:198), but chart-door-on-hc, watcher-on-hc and notices-on-hc were `blocked-by` engine-on-hc. The merge ran `akrogon phase engine-on-hc merged` on the pre-switch release, and its merge wake dispatched those three leaves into old herdr panes (w8:pYR..pYX, tabs w8:tFW..tFY) at 01:50Z, just before the deploy of e3202dff.

## Evidence

- Each leaf's plan.synthesis finished, then `akrogon phase <slug> implement` printed `moved implement` and dispatch refused: `state predates hc: <slug> records old herdr pane ids` (src/state.ts:151, plan D17 of engine-on-hc).
- chart-door-on-hc's later recovery would have hit the same refusal.
- Door t15 removed `tab` and `pane` from the three state files (copies in ~/.local/state/akrogon-door-backup/predates-hc-20261108/); `akrogon next --all` then started hc seats t6j, t6k, t6m.

## Learning

A runtime switch's drain must include the switch leaf's own dependents: either chart them to start after the deploy, or name the state reset they need when the old release dispatches them on merge.
