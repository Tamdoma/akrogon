# Implementation report

Implemented D1–D6 and verified C1–C7. Failed-leaf notification delivery persists only after success and resets on transitions. Busy observations track physical seats, retry failed warnings and clear on observed idle/done/agentless panes. Merge waiting and peer fallback are covered. Status displays elapsed busy time without writes or herdr calls.

Changed files and reasons: `src/state.ts` adds default delivery fields, `src/phase.ts` resets failure delivery, `src/next.ts` observes seats and records successful notifications, `src/status.ts` adds durations. `tests/next.test.ts`, `tests/phase.test.ts`, and `tests/status.test.ts` verify the behavior using real CLI subprocesses and isolated external command fixtures.

Tests run:
- Worker fail-first run before source edits: 36 pass, 7 fail. Final changed-test command `AKROGON_BASE=9dc1055a0a1ba3682335622d81f41873de966f11 bun test --changed=9dc1055a0a1ba3682335622d81f41873de966f11`: exit 0, 54 pass, 0 fail, 524 assertions. Worker details are in brief.md.
- `bun /home/ivan/Work/infra/akrogon/issues/open/loop-hardening/dispatch-progress/failure-signals/implementation/verify-cli.ts`: exit 0. Saved `implementation/cli-artifact.log` alongside this report, containing actual fake herdr notification calls, CLI exit outcomes and state/status evidence.
- `bun run format`: exit 0, only scoped files changed.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 95 pass, 0 fail, 1028 assertions in 28.45 seconds. Output saved in `implementation/full-test.log`.
- `git diff --check`: exit 0.

Known limitations: Delivery and state saving are separate operations, so a crash between them can duplicate a notification. Warnings require sweeps and cannot establish unobserved idle intervals. Documentation remains outside the locked scope. No dependency, configuration, routing or automatic-failure behavior was added.

Unverified criteria: none.

Committed implementation: `9ad20ab` on `failure-signals`. Post-commit worktree status is clean and the branch diff contains only the seven listed source/test files, with no issue artifacts.

# Merge conflict repair

Review A's pending rebase onto `131b02de1c3352f35371ca391c59beca5f8dcd95` is complete. Original reviewed head: `9ad20abf0143db42eaf359760bf153fd1f26e02d`. First rebased head: `f644c76`. Import resolution produced `6aae8fcf7d1b7f9c3b7a2570b7ba7ceeb0b0d499`.

The only conflict was the helper import in `tests/next.test.ts`. Resolution retains `entry` and all upstream imports. Range-diff against the first rebase confirms no other leaf patch changes. Integrated source retains the upstream defined-session guard, recorded-seat allocation, 30-second agent start timeout, and working/blocked merge guard.

Changed tests then exposed one integration expectation conflict: the upstream blocked merge test demanded byte-for-byte equivalent parsed state despite the new required busy observation. Updated that test to require a valid new A timestamp, retained B timestamp, cleared idle-seat maps, and unchanged remaining state. All original no-fetch/no-status, prompt/start and dirty-file assertions remain. The failing run had 65 pass and 1 fail. The corrected worker run had 66 pass and 0 fail. A matcher type mismatch found by root's typecheck was corrected by reversing the equality assertion's operands, with unchanged comparison semantics.

The retained CLI harness passed against the completed rebase and refreshed `implementation/cli-artifact.log`. No production behavior beyond the reviewed leaf implementation changed. No documentation/index change is needed for this import and test integration repair. Plan R1/R2 limitations remain unchanged.

Final repair head: `e2eba23c87f23618941b9ab39c4a2370733a4dc9`. Rebase is complete and worktree is clean. Review the import integration using `git range-diff 35a2088..f644c76 131b02d..6aae8fc`, then the test correction using `git diff 6aae8fc..e2eba23`.

Final verification: `bun run format` exit 0 (unchanged), `bun run typecheck` exit 0, `AKROGON_BASE=131b02de1c3352f35371ca391c59beca5f8dcd95 bun test --changed=131b02de1c3352f35371ca391c59beca5f8dcd95` exit 0 (66 pass, 613 assertions), `bun test` exit 0 (140 pass, 1371 assertions). Final test runs followed the matcher correction. Logs: `implementation/repair-format.log`, `implementation/repair-changed-test.log`, `implementation/repair-full-test.log`. CLI evidence: `implementation/cli-artifact.log`.

Unverified repair criteria: none.

# Tab-closed integration repair (round 2)

Before repair: `389c0b45b4eab8efb22693ec72c059a745b51acf`, rebased onto `eed65fb70e72215d300d40c5187b77ec01d01bdc`. Review A identified an upstream tab_closed handler calling obsolete discovery and dispatch interfaces. Root reproduced all six compiler errors, recorded in `implementation/tab-closed-typecheck-red.log`. Worker reproduced the existing CLI regression without changing its assertions: 65 pass, 1 fail.

Changed only `src/next.ts` in the tab_closed branch. It now uses registeredRepos/discover with the current Invocation, passes the owning Leaf and Invocation to dispatchLeaf, and calls sweepAll with Invocation only for the completed outcome. Missing and ambiguous owner behavior remains unchanged. No failure notification, seat observation, plugin or configuration behavior was changed.

Changed-test command: `AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc bun test --changed=eed65fb70e72215d300d40c5187b77ec01d01bdc`. Green result: exit 0, 66 pass, 0 fail, 614 assertions. Existing tests and expectations were unchanged.

Real CLI evidence: `bun /home/ivan/Work/infra/akrogon/issues/open/loop-hardening/dispatch-progress/failure-signals/implementation/verify-tab-closed.ts` exited 0 and saved `implementation/tab-closed-cli.log`, proving a merged tab close starts the dependent leaf in workspace w2, consumes one attempt and records its busy timestamp. The existing `implementation/verify-cli.ts` also exited 0 and refreshed `implementation/cli-artifact.log` for failure delivery/retry and busy warning/status behavior.

Formatting and typecheck exited 0. No docs/index update is needed because this repair restores the upstream handler's intended behavior. Existing plan R1/R2 limitations are unchanged.

Final full suite: `bun test` exit 0, 140 pass, 0 fail, 1372 assertions in 37.62s. Evidence: `implementation/tab-closed-full-test.log`. `git diff --check` passed. Repair committed as `9da8210983fb21aa626e1ae083f69ce19476ad37`; worktree clean. Review repair diff `389c0b4..9da8210`. Unverified repair criteria: none.
