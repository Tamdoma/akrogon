# Signposts proposal: slot B

Settled: one complete cutover, no old-Herdr compatibility or fallback, no polling, explicit slot messages, visible panes from launch and restart, ordered consultant layout, repo-prefixed names, chart files in their chart folder, and operator involvement throughout.

## Q1. Simplicity versus unattended recovery
Question: When recovery needs extra machinery, should akrogon stop and ask you, or keep trying to finish unattended?
- Q1a: Prefer fewer parts. Report the interruption and resume only after an explicit instruction.
- Q1b: Prefer unattended progress. Preserve enough recovery machinery to continue without you.
Recommend Q1a: an interrupted agent may already have changed files or external state, so restarting its task can repeat work.
Steers: replacement of the plugin, restart and resume behavior, reconciliation, stall handling, and what watch-issues promises.
Missed angle: moving process ownership to hc does not decide who owns recovery of unfinished work.

## Q2. Work survival when its launcher terminal closes
Question: Which agents should keep running if the terminal that launched them is killed?
- Q2a: None. Children end with their launcher.
- Q2b: Leaf work continues, but chart consultants end with their door.
- Q2c: All agents continue independently.
Recommend Q2b: closing a chart should end its helpers, while closing the terminal that dispatched a leaf should not discard long-running implementation work.
Steers: parent relationships across the engine and slots, use of outlive-parent, result delivery after a parent disappears, and cleanup ownership.
Missed angle: closing the herdr-app window and killing a parent terminal are different events. Window closure alone already leaves core terminals running.

## Q3. Missing capabilities in hc or herdr-app
Question: If a required behavior needs a change in herdr-core or herdr-app, should that change land there first or should akrogon supply the missing behavior?
- Q3a: Land the upstream capability first, then depend on it.
- Q3b: Keep the port self-contained with akrogon helpers using supported public interfaces.
Recommend Q3a: it avoids rebuilding terminal and pane management inside akrogon when the goal is to remove it.
Steers: supported version requirements, pane placement, event delivery, launch readiness, harness status gaps, and the order of the epic's work.
Missed angle: a complete cutover can depend on upstream work. Decide whether that dependency is acceptable before designing local substitutes.

## Q4. Active work at cutover
Question: Must the cutover carry unfinished legacy leaves and chart seats forward, or can we finish or stop them first?
- Q4a: Drain or explicitly stop active legacy work before switching. Preserve files, then launch fresh hc seats for anything unfinished.
- Q4b: Transfer active records so unfinished work resumes automatically under hc.
Recommend Q4a: old terminal and agent identities cannot identify newly launched hc seats.
Steers: persisted state changes, reconciliation, seat records, installation instructions, self-update behavior, and migration tests.
Missed angle: one cutover rules out running both systems together, but does not decide how to handle work already in progress.

## Q5. Ownership of shared environment guidance
Question: Who should provide herdr-core awareness for agents launched outside akrogon?
- Q5a: Herdr setup owns shared guidance that applies inside hc. Akrogon adds only its workflow instructions.
- Q5b: Akrogon install and self-update also manage that shared guidance across harnesses.
Recommend Q5a: agents outside akrogon need the same environment knowledge without making akrogon responsible for their general setup.
Steers: installer scope, replacement of the legacy global skill, launch briefs, harness integration, and responsibilities outside this repository.
Missed angle: writing the right instructions and ensuring every hc-launched harness receives them are separate requirements.

## Q6. Required live proof
Question: How much live evidence must we collect before declaring the cutover ready?
- Q6a: One complete leaf lifecycle, plus focused live launch/message/restart checks for every supported harness and an interruption check.
- Q6b: A complete lifecycle and recovery run for every supported harness.
- Q6c: Automated tests and a single live smoke run.
Recommend Q6a: it checks the shared engine end to end and the harness-specific boundaries without multiplying every expensive lifecycle run.
Steers: validation effort and cost, test-fixture scope, release acceptance, upstream dependencies, and when operator participation is needed.
Missed angle: a successful launch or a done status does not prove that a task ran, its report arrived, or its pane was visible.
