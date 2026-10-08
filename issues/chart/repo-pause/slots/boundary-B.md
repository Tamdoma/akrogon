# Boundary — blind Slot B notes

Read intake, Boundary Question/Carries and related Control question. Did not read boundary-A.md, map-merged.md or another merged file. The brief lists the opening merged map but expressly forbids merged files, so that prohibition takes precedence. Only this requested return file is written.

## Q1 — What does a repo pause stop?

### 1. Pick, reason and cost

Recommend pausing automatic dispatch for the selected repo across all four Herdr events, plugin startup resume, completion-triggered dependent starts, the merge pass following an automatic next pass, and mergeWake following a phase command. A phase command itself remains permitted, but its implicit scheduling does not bypass pause. This closes the actual alternative launch paths rather than only the pane-close reproduction.

Allow deliberate manual next passes in full: target, folder, no-argument repo sweep, --all, and manually invoked --resume, including their existing dependent and merge cascades. Preserve the current target/cascade scope. Manual next grants one pass, not permission for later hook passes, and does not clear pause. For example, manual next on a paused leaf may launch its merge seat, but the subsequent idle event cannot launch another seat.

Keep existing completed-work cleanup available on the paths that already perform it: merged-tab closure, temp cleanup and startup/manual worktree cleanup. Do not add worktree deletion to hooks. Owner completion may still be recorded, but its dependent starts remain suppressed when the cause is automatic. Respect existing live-batch and open-owner retention guards.

Cost: cause must be carried through dispatch rather than inferred from leaf count or command names. Cleanup and scheduling currently share paths, so they need a clear separation. Pause does not stop a running agent or undo a committed phase move. A manual pass can start more work than its named leaf through its existing merge/dependent behavior, and that permission must be stated to the operator.

### 2. Rejected options and reasons

- Event-only pause: smaller diff, but restarting Herdr resumes paused allocations and phase commands independently wake merge seats. An operator trying to change models would still face relaunches.
- Pause only new leaf allocations: surviving seats still receive automatic prompts and missing seats in existing tabs can still be replaced. It does not satisfy the reported usage-limit or model-change need.
- Stop every next invocation: simple gate, but contradicts the explicit requirement that operator commands still work.
- Allow manual target but suppress its existing cascades: narrower permission, but changes the meaning of a manual pass and can leave merge-phase targets unable to progress without another command. Choose this only if the operator explicitly wants that restriction.
- Return before all automatic processing, including cleanup: avoids separating paths but retains completed resources and prevents existing completion bookkeeping. It is a coherent stronger freeze, but the intake asks to pause dispatch, not completed-work maintenance.
- Let phase-triggered mergeWake run because phase is an explicit command: phase is also issued by working agents, and its wake can prompt another leaf. Committing progress should not silently grant new launches while paused.

### 3. Evidence, tier, source and date

All read 2026-10-08. Repository references are relative to /home/ivan/Work/infra/akrogon.

- Operator: `issues/chart/repo-pause/INTAKE.md`, Tamdoma/akrogon#61, https://github.com/Tamdoma/akrogon/issues/61. Explicit operator commands must work while event dispatch skips the paused repo. This rules out a universal dispatch prohibition.
- Better-than-training, repository code: `plugin/herdr-plugin.toml:10` starts --resume; `plugin/herdr-plugin.toml:13` onward covers four events; `plugin/next.sh:3` forwards arguments unchanged. `src/next.ts:1232` reads event JSON only without an input, while `src/next.ts:1272` treats --resume uniformly. Startup and manual resume therefore need explicit, trustworthy invocation provenance.
- Better-than-training, repository code: `src/next.ts:1256`, `src/next.ts:1303` and `src/next.ts:1312` dispatch dependents following completion. `src/next.ts:1332` runs mergePass after the main lock. `src/akrogon.ts:75` calls mergeWake after a committed phase move, and `src/next.ts:1141` creates a fresh invocation for it. Pause must cover that fresh implicit wake too.
- Better-than-training, repository code: `src/next.ts:618` completes merged owners; `src/next.ts:678` guards tab cleanup against retained batch members; `src/next.ts:687` retains open-owner worktrees; `src/next.ts:1295` handles closed-tab temp cleanup. This changed the recommendation from an early return to preserving established maintenance without dependent dispatch.
- Practitioner: Ian Buss, Michael Claassen, Jed Cunningham and the Astronomer engineering team, authors operating managed Airflow and describing their scheduler/executor design, https://www.astronomer.io/blog/astro-airflow-re-engineered-for-speed-and-scale/ (published 2026-08-31). They describe committed durable state followed by event hints and scheduler reads, with ownership coordinated through database operations. This supports re-reading control state at the scheduling boundary instead of trusting a queued event. It does not prescribe Akrogon's pause semantics.
- Better-than-training, primary documentation: Temporal Schedule “Pause”, https://github.com/temporalio/documentation/blob/main/docs/encyclopedia/workflow/schedule.mdx. A paused schedule stops future scheduled actions, permits manual triggering, and leaves already-started workflows unaffected. This directly supports separating automatic launches, manual passes and active agents. It does not decide Akrogon's cleanup or merge-cascade scope.

Synthesis: the practitioner source informs race handling, while Temporal directly documents the automation/manual/running-work boundary. Their findings support the recommendation, but none determines whether Akrogon should freeze merge preparation or cleanup. That remains an operator choice.

### 4. Pitfalls and what removes them

- A queued close event or startup process uses stale pre-pause state. Require pause acknowledgement to serialize with dispatch and re-read pause at the launch boundary. Test pause followed by closed-pane/tab events and startup, with another repo still dispatching.
- A merge pass already preparing branches outside the main lock launches after pause succeeds. `src/next.ts:928` and `src/next.ts:981` have separate merge critical sections, with dispatch later. Check pause before automatic launch as well as pass entry. Do not claim a single early check provides an acknowledgement guarantee.
- An automatic completion runs cleanup and then starts a dependent. Carry the automatic cause into completion/dependent/merge paths. Prove cleanup occurs without new starts or prompts.
- Manual --all is mistakenly classified as automatic because it sweeps several leaves, or a typed command inherits Herdr context. Classify by invocation source, not target count, --all, or HERDR_PANE_ID alone. Prove the explicit manual override does not change persisted pause.
- Pause changes queue eligibility, capacity or leaf phases. Keep pause outside dependency/merge-turn eligibility. Prove paused allocations retain their state and other repositories still work within existing global capacity.

### 5. Questions missing from the fork

- Does successful pause guarantee no new automatic agent starts/prompts after acknowledgement, including an already-running merge preparation? Recommend yes. Existing agents remain free to finish. Define whether an in-flight stack may finish applying branches without prompting, or pause must wait for that preparation to settle. The latter is a stronger mutation boundary and can delay acknowledgement.
- Should manual --resume bypass pause, just as manual --all does? Recommend yes, with plugin startup explicitly identified as automatic. The current same-command path cannot distinguish these without added provenance.
- When cleanup completes an owner during pause, should archival/bookkeeping proceed? Recommend yes under existing guards, while retaining completed resources whenever those guards require it. Cleanup permission must not become permission to start dependents.

Storage, control command, unpause behavior and status display remain for the Control fork. No boundary choice is treated as settled by these recommendations.
