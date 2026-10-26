# Review A: one-test-run

- Base: `672a2ab513d80e9705e17cbb3f883f57153a258f`
- Reviewed head: `5e50bb3c` (d379ecc3 tests red → 46f9635e product → 34fe236a test rename → 5e50bb3 trailers)
- Verified: `akrogon verify` green receipt at 34fe236a in report.md (1207 pass, 0 fail); criterion logs cited there match plan commands. Diff inspected in full.

## Findings

### F1 — Fix: bare `stop-run` on a single waiting run stops units that do not exist

- Source: real user action — `akrogon stop-run` with no id from the same pane while the pane's only run is a `full` waiter.
- Defect: `src/stop-run.ts` applies `cancelWaitingRun` only in the `id !== undefined` branch. The bare branch takes `matched(candidates[0])` and runs `systemctl --user stop` on `akrogon-run-<id>.scope` and its guard, which were never started for a waiting run; the nonzero exit throws `CommandError`, so the cancel fails and the waiter keeps its queue slot.
- Consequence today: the only sanctioned way to clear a stuck waiter fails on exactly the call form a seat reaches first (`stop-run` bare, which the command itself advertised by listing the run). Criterion 5 names stop-run cancellation of a waiting run from its scope.
- Fix: apply the waiting-cancel branch to the resolved record in both branches (share the post-resolution path).

### F2 — Fix: `nested()` lets a listed run skip its own repo's queue under another repo's holder

- Source: real user action — inside a `full` run of repo Y's holder, run `akrogon run-check --name test` in a worktree of repo X while repo X's line is held.
- Defect: `nested(token, full)` returns true when the token's record is a live `full` holder **of any repo** (`record.full || !full`, no repo check). The design's nesting decision says "inside any other run (another check, another repo) it takes its own turn"; the current code treats a cross-repo listed inner as nested.
- Consequence today: the inner repo-X run starts without joining repo X's queue, so two listed runs of repo X overlap — the exact overlap criterion 1 forbids.
- Fix: require `record.repo === holder.repo` for the `record.full` arm of `nested` (signature gains the holder's repo, or compare inside `withAdmission`).

### N1 — Nit: user guide's stop-run section omits the waiting-cancel case

`docs/use/park-pause-stop.md` "Stop one check run" says only that stop-run stops the run's units; `commands.md` now documents cancellation but this guide does not. Consequence today: a reader of the guide thinks a stuck waiter can only be killed. Deferred because the reference page carries the new behavior; would promote if the guide is meant to be the seat-facing contract.

## Checks

- AREA.md paths named in the diff all exist (`src/admission.ts`, `src/scope.ts`, `src/state-home.ts`, `src/status.ts`, `src/stop-run.ts`, `src/run-check.ts`, `src/config.ts`).
- Test-Change trailers on the branch cite real output and cover every changed test path (`run-permit`, `status`, `leaf-slices`, `state-home`, `tests/AREA.md`).
- Deliberate-break evidence recorded (`check c2-break: 1` with the repo-filter drop) and the sort-order blind spot that made the first break invisible was repaired in the fixture.

Verdict: **fix**
