No disagreement.

Note, not an objection: `callerScope()` takes the last `.scope` segment of `/proc/self/cgroup` with no name pattern (`src/admission.ts:220-222`), and `akrogon stop` stops the leaf slice (`src/stop.ts:52`), so the new unit name needs no parser change.
