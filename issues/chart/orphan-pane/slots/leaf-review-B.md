R1. Criteria 1 and 4 cannot both hold in the operator-pane case. Criterion 1 requires the tab to contain only recorded A and B, while criterion 4 requires an unrecorded operator pane to remain open through that recovery.

Evidence: draft `record-panes-early/brief.md`, Done-criteria 1 and 4; `src/next.ts`, `allocate`, deliberately leaves unrecorded members alone; `tests/next.test.ts`, “recorded seats stay authoritative with an extra pane first” and “allocation handles an interrupted tab”, preserve the operator pane.

Exact correction: replace criterion 1's tab-membership requirement with “the next pass leaves no unrecorded pane created by this allocation, retains any pre-existing operator panes, and has recorded A and B boxed before any seat prompt.” Keep criterion 4's unboxed requirement.

R2. Criterion 2 is a regression fix, not new behavior. Current `allocate` can split replacement A, fail `box(first)`, and leave that new A unrecorded while B survives. The next pass creates another A. The full criterion therefore already fails on current code. Merely demonstrating that deleting a new pair save breaks it does not provide the required before/after bug proof.

Evidence: draft `record-panes-early/design.md`, standing-design interpretation classifies criterion 2 as new behavior; `src/next.ts`, `allocate`, performs replacement-A split and `box(first)` before the `repairB` pair save; installed `standing-design.md`, “Standing design lines”, requires a bug fix's test to fail before and pass after.

Exact correction: classify criteria 1, 2 and 3 as bug fixes requiring red-before/green-after evidence. Add that proof requirement to criterion 2 and remove the claim that a deliberate break alone proves it. Existing fixtures suffice: retain an already boxed B, remove A, enable `busctl.fail`, run next, then remove the failure marker and retry. `tests/fake-busctl.ts`'s existing failure switch and the existing fake proc/cgroup setup require no new runner or fixture capability.

R3. The issue index promises recovery for every allocation failure after pane creation, contradicting the binding exclusion for lost replies and failed state writes.

Evidence: draft `ISSUE.md`, `record-panes-early` summary, says “a seat allocation that fails after creating a pane leaves no pane ... that state does not record”; draft `record-panes-early/design.md`, Binding decisions 5, explicitly permits unrecorded panes when the reply is lost or `saveState` fails; `src/next.ts`, `allocate`, creates panes through Herdr before saving their IDs.

Exact correction: replace the index summary with “record seat pane IDs before boxing so boxing failures recover through the existing recorded-pane sweep.” Replace brief Why's final sentence with “Recording each returned ID before boxing makes boxing failures recoverable on the bootstrap, repaired-A and missing-B paths through the existing sweep.” Preserve criterion 5's manual-close limit.
