# Direct re-check B

Repair base: `18eb7a9209c4d879cbf95b0f1e83f559d694b8ba`.
Reviewed head: `568556b99236a3463e2eec416a625700e8990b06`.
Verdict: **fix**.

Reviewed the single repair commit and updated chart contract/report. No branch refresh is reported, so no range-diff is needed. F3 is resolved. F1's synchronization works for commands using the repaired admission code, but its rollout precondition remains incomplete.

## F1 retained — Drain pre-barrier commands before enabling cutover

The new shared/exclusive `admission.lock` closes the race for participating commands (`src/admission.ts:45-51`, `src/state-home.ts:85`). Config publication again follows the complete copy and final live-record check. However, the Taken contract in `forks/writer-gate.md` still checks only for an akrogon process “older than state-home” and explicitly permits arrivals throughout cutover.

The actual currently installed build, `83b9279`, already has state-home but takes only a slice lock in `withAdmissionLock` (`src/admission.ts:43-46`). A command loaded from that build does not gain the new barrier when the checkout is updated. For example, `verify` admits setup and subsequent checks separately (`src/verify.ts:154-170`). It can have no live record between checks, pass the stated cutover conditions, and then admit its next check while the new migrator holds `admission.lock`. Its record can still land in the source after the final `settled()` and before config publication. Destination consumers then miss that running check, preserving review-B-2 F1's consequence: reconciliation can stop its slice.

**Required correction:** make the attended rollout condition cover every process using admission code from before `568556b`, including commands started after state-home was introduced. Drain those writers and prevent launches of the old implementation before any invocation of the repaired CLI can auto-migrate. Arrivals using the repaired barrier can then continue. Record this condition in the Taken contract and door handoff. This is a correction to O1's rollout, not a request to restore the process scan or reopen O2/O3. No host cutover was performed in this review.

Source comparison read back: `check recheck3-b-barrier-versions: 0 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-recheck3-b-barrier-versions-1792114532438-3239327.log`.

## F3 resolved — Missing runs directory is optional again

Removing the post-publication sweep removes its unconditional copy of the absent runs directory. The remaining copy loop checks each optional source entry. The existing no-runs cwd-holder CLI case now asserts exit 0 and usable configuration output, so it catches the previously silent test failure. The report records that assertion failing on `18eb7a9`; the current retained full-suite run passes it.

## F2 remains resolved — Test-change citation accepted

The repair carries:

```text
Test-Change: tests/state-home.test.ts issues/chart/state-cutover/slots/review-B-2.md F1 and F3: the lock test now holds an in-flight admission's shared admission.lock instead of a slice lock, a new case proves an admission waits while the move holds it, and the cwd-holder case asserts exit 0 and usable config output.
```

The cited findings support these changes. The actual citation guard passes over `83b9279..568556b`. Evidence read back: `check recheck3-b-trailers: 0 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-recheck3-b-trailers-1792114532606-3239522.log`.

## Verification and scope

Read back the current-head retained checks through `akrogon log`. All pass, and the runs follow the latest test changes:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-format-1792114287956-2715729.log`.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-typecheck-1792114289864-2716695.log`.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/chart/state-cutover/direct/check-test-1792114423336-2717647.log`: 958 pass, 0 fail, 9,644 assertions across 57 files.

The lock cases verify exclusion in both directions for repaired-code participants. They do not establish the required drain of older implementations. No redundant full-suite run was needed. The documented machine-home path remains correct. No AREA.md, dependency, runner or lesson changes require further review. No Nits or operator-access blockers. Worktree remained clean. Only this return file and allowed holder logs were written, with no product edits, commits or phase commands.

Last operation: direct re-check recorded `fix`; F3 resolved, F2 remains resolved, F1 narrowed to the pre-barrier rollout condition.
Next: chart door corrects the rollout contract and returns it for B's re-check.
