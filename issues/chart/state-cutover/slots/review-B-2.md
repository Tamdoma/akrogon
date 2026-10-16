# Direct re-check B

Repair base: `033b9b415fa1d53c35e2d526bf0c0120974b408f`.
Reviewed head: `18eb7a9209c4d879cbf95b0f1e83f559d694b8ba`.
Verdict: **fix**.

Reviewed the single added commit and updated chart contract/report. No branch refresh is reported or present, so no range-diff is needed. F2 is resolved. F1 remains unresolved, and the repair introduces F3.

## F1 retained — Consumers switch before the record sweep finishes

`src/state-home.ts:81-84` still publishes destination config before the new sweep at `:103-104`. `globalHome()` immediately selects that destination (`src/config.ts:197-201`), and another CLI skips migration altogether once that config exists (`src/state-home.ts:68-69`). The migrator holds the source global lock, not the destination lock used by those commands.

Consequently the exact source and consequence in review-B-1 remain: an admission missed during the first copy is absent from the active home's `liveRuns()` until the sweep catches up. A reconcile command in that interval can stop the running check's slice (`src/reconcile.ts:173-185`, `:484-494`). Waiting for old slice locks and copying the record afterward cannot undo that stop. Moving the repair from a manual action into the migrator shortens the interval but does not exclude consumers from it.

**Required correction:** make the complete record inventory available before consumers may select the destination. Publication must follow a correctly synchronized final copy, or every consumer must remain behind a common transition barrier through the sweep. Preserve exclusion against new source-home admissions while doing so. Add a regression proving that a late admission remains visible to a concurrent reconciliation. The report explicitly supplies no such test, so its claim that the sweep closes F1 is unproven as well as contradicted by the ordering.

## F2 resolved — Test-change citation accepted

`18eb7a9` adds:

```text
Test-Change: tests/state-home.test.ts issues/chart/state-cutover/forks/writer-gate.md Taken 1a: a cwd holder no longer defers cutover, so the cwd test is reversed and the nested-run overlap case holds the gate with a seeded live record instead of a cwd sentinel.
```

The cited outcome supports both edits. Ran the actual citation guard over the full original range `83b9279..18eb7a9`; it passes. Evidence read back: `check recheck-b-trailers: 0 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-recheck-b-trailers-1792114123504-2640299.log`.

## F3 new — First cutover fails when the source has no runs directory

The added unconditional `cpSync` at `src/state-home.ts:104` throws when `<toolRoot>/runs` does not exist. This is a normal configured checkout before its first checked run, already represented by `toolCopy` and the cwd-holder test (`tests/state-home.test.ts:144-151`). The original copy loop treats these source entries as optional (`src/state-home.ts:73-75`), but the added sweep does not.

Confirmed through real copied CLI invocations with valid configuration, isolated HOME/AKROGON_HOME and no source runs directory. `033b9b4` exits 0 and returns configuration. `18eb7a9` publishes destination config and then exits 1 with `ENOENT` at the new copy, before returning configuration. Thus the first command fails after announcing a completed move. The cwd-holder test remains green because it checks the announcement and destination file, not the command exit or output.

**Required correction:** keep the source runs directory optional in the final sweep, and make the existing no-runs CLI scenario assert successful completion and usable config output. Show that assertion failing on this head and passing after repair.

Evidence read back: `check recheck-b-empty-runs-v2: 0 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-recheck-b-empty-runs-v2-1792114097265-2626367.log`. Exit 0 means the probe confirmed baseline success and repaired-head failure. It also confirms fixture removal. The first probe attempt selected the wrong source revision because its command was interpolated; it is discarded as comparison evidence and superseded by v2. Both attempts cleaned their temporary fixtures.

## Verification and scope

The prior 957-test log predates this product repair and is not current-head verification. The updated report claims ten state-home cases and formatting/typecheck success but provides no new retained logs. The F3 probe demonstrates why the claimed ten passes do not prove normal CLI completion. No redundant full-suite run was performed while these fixes remain open.

Reopened the machine-home section of `docs/guide/install.md`; its path remains correct. No AREA.md, test, fixture, dependency, runner or lesson file changed in this repair. No new Nits or operator-only access blockers. Worktree remained clean. No product edits, commits, phase commands or host cutover were performed. Only this review, allowed holder logs and cleaned temporary proof fixtures were written.

Last operation: direct re-check recorded `fix`; F2 resolved, F1 retained, F3 introduced by repair.
Next: chart door repairs F1/F3 and returns the new head for B's re-check.
