# Review B: seat-containment

Date: 2026-10-13
Phase: check.review, initial blind review
Base: 6c43d3f3e8b353015e94f19bf56e4a884b0c3139
Reviewed head: e5776ade920e619e923a7825140f823c2e89123e
Verdict: ready

## Scope and findings

Reviewed the entire base-to-head diff against brief criteria 1-6, plan decisions and implementation notes, design exclusions, and implementation/report.md. Debate is off, so there are no positions-B.md or rebuttal-B.md inputs. No peer review was read. No Fixes, Nits or operator actions remain.

The allocation ensure step reaches recorded panes before busy-seat dispatch. Outside recorded panes are closed and the inventory is refreshed before tab resolution. Unreadable reads throw without closing that pane. Both resolved panes are boxed before dispatch; the intermediate repair-A save records only an already boxed first pane and the surviving recorded B. Adoption waits for the real asynchronous systemd job, and failure prevents starts and prompts. Scope identity includes the current shell PID and stat start time, so a restored shell cannot pass using its old scope. run-check and base-run share constructedEnv, which sets the bus cut after declared variables, and config rejects overriding that name in either list.

Install and self-update use the existing link conflict mechanism, link the exact unit file and reload after applying links. No additional stop, permit, migration or herdr configuration behavior was added.

## Verification evidence

Reused current proof rather than rerunning unchanged checks. HEAD was committed at 13:09:30+02:00. The implementation checks ran afterward, at 13:10:58 through 13:14:35+02:00, on the same head and base. Their check_end records in the registered checkout's issues/timings.jsonl all report exit 0, and the logs contain the new containment, install, configuration and bus-cut cases. No later test, fixture, helper or runner change invalidates those runs.

- format: implementation/check-format-1791889858939-1160889.log, exit 0.
- typecheck: implementation/check-typecheck-1791889860687-1161892.log, exit 0.
- test: implementation/check-test-1791889968925-1163037.log, 878 pass, 0 fail.
- test_changed: implementation/check-test_changed-1791890075127-1518934.log, 863 pass, 0 fail.

The report names the exact configured checks, including setup, guard and the changed-test base. The full test command includes every planned fixture proof. No test filtering, skipping or disabling was introduced. The plan's red evidence covers all fixture criteria. The later asynchronous-placement reproduction was red before the fix and passed in the final full runs. Existing expectation changes are limited to the environment contract required by C3. Other old test-file changes add cases or update fixtures for the new live dependencies.

C1, C2, C5 and C6 live evidence is in report.md attempt 3 on this head, at 13:15:17-13:17:24+02:00: the manager's five ceiling values, shell and seat cgroup paths, Chromium placement without a new app scope, four scopes' stop properties, and cold startup replacement of p2/p3 with p4/p5. The new scopes were active before the new prompt. This matches chart proofs T2, T3, T6 and T7 and the grant in readiness.yaml. All three granted live attempts have been consumed, so this review performs no further fixture mutations.

Read-only live checks in this pass: herdr pane process-info --help confirms --pane; herdr pane close --help confirms the positional pane ID. systemctl --user list-units --all 'akrogon-l*' 'akl-*' --no-pager returned 0 loaded units. The live akrogon.slice symlink is absent. No new IDs or retained resources were created.

Independent git diff --check passes, and the code worktree is clean. No comparison records are required because no check is red.

## Documentation and area paths

Opened docs/reference-index.md and the affected install, setup and next guide pages plus the README command row. Their changes match the implemented installation, environment and dispatch behavior. The accepted cold-restore window, hand-split panes and loaded empty slices remain design limitations, not new findings.

Listed paths named by src/AREA.md and tests/AREA.md from the repository root. All source, test, skill and index pointers exist, including src/scope.ts, tests/fake-busctl.ts and tests/fake-proc.ts. Missing issues/config.yaml and the journal paths issues/base-runs.jsonl, issues/red-records.jsonl, issues/timings.jsonl and issues/merge-attempts.jsonl describe runtime records in the registered checkout rather than tracked source files. This diff does not create a dead navigation pointer or a current behavioral consequence from their absence in the leaf worktree. No lesson lines were removed.

## Test-Change trailers

The changed-file rule was inspected in src/test-files.ts. The following trailers are present in base..HEAD:

- `8ad2109` Test-Change: tests/base-run.test.ts added case "a base-run command runs with the session bus cut"; no existing expectation changed
- `8ad2109` Test-Change: tests/config.test.ts brief criterion 3, DBUS_SESSION_BUS_ADDRESS joins the reserved env list; added case "config refuses DBUS_SESSION_BUS_ADDRESS in pass_env"
- `8ad2109` Test-Change: tests/fake-herdr.ts brief criteria 2 and 5, fixture gains pane process-info, pane close, proc seeding and start cgroups per plan D7; no existing handler changed
- `8ad2109` Test-Change: tests/helpers.ts brief criterion 2, fakeHerdr links fake busctl and sets AKROGON_PROC_ROOT and XDG_RUNTIME_DIR per plan D7
- `8ad2109` Test-Change: tests/install.test.ts brief criterion 1, installEnv adds fake systemctl; added cases for the slice link and conflict; no existing expectation changed
- `8ad2109` Test-Change: tests/run-check.test.ts brief criterion 3, the allowlist admits DBUS_SESSION_BUS_ADDRESS; added case "run-check cuts the session bus even when the caller has one"
- `8ad2109` Test-Change: tests/self-update.test.ts brief criterion 1, fixture puts fake systemctl on PATH; added case for the slice link after deploy; no existing expectation changed
- `4d70139` Test-Change: tests/AREA.md plan Docs list, adds the tests/seat-containment.test.ts key-file line and its fixtures; no test expectation changed
- `4eb6178` Test-Change: tests/install.test.ts plan R2, U1's installStage now runs systemctl --user daemon-reload, so withHome puts the fake systemctl on PATH for in-process selfUpdate calls; no expectation changed, a PATH sentinel shows no real systemctl call
- `947fdce` Test-Change: tests/fake-busctl.ts real busctl argv `PIDs au 1 <pid>` carries the count then the values, so the fixture's width is 1 + count, not 2 + count; worker U3 showed the fixture rejecting the design's exact argv
- `3be9dd1` Test-Change: tests/fake-busctl.ts adds a busctl.delay marker that moves the shell 0.5 s after the call returns, as real systemd did in the live run; no existing behavior changed
- `3be9dd1` Test-Change: tests/seat-containment.test.ts adds a case for the live-run race (real output: "Pane w1:p2 for leaf live-seat-1 is not in its own scope after adoption: ...akl-live-server.service"); no existing expectation changed

All cited sources match the diff: brief C1-C6 and plan D7 authorize the initial test and fixture changes; plan R2 authorizes isolating in-process reloads; the exact real busctl argv justifies fixing the au fixture parser; attempt 2's real systemd placement failure justifies the delay fixture and reproduction. The tests/AREA.md trailer cites the plan's documentation list. New fake-proc.ts and fake-systemctl.sh need no old-file trailer. No unsupported deletion or replacement of an existing assertion was found.

## Merge proof 2026-10-13

Attempt: 443022f6-135d-4ebc-b609-49eb72f5f335
Base: 6c43d3f3e8b353015e94f19bf56e4a884b0c3139
Tested top: e5776ade920e619e923a7825140f823c2e89123e

Applied stack has no carried members. No fetch, rebase or commit was performed. The reviewed plan and report still apply. A has three nonblocking Nits and no operator action. All configured checks ran on the recorded top with AKROGON_BASE refreshed from config. merge_covers, merge_checks and advisory are empty. No additional live proof mutations were performed.

- format: exit 0, 1520 ms, log `implementation/check-format-1791890461046-2105184.log`.
  Command: `AKROGON_BASE=6c43d3f3e8b353015e94f19bf56e4a884b0c3139 akrogon run-check --name format -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun run format'"'"''`
- test: exit 0, 108571 ms, log `implementation/check-test-1791890580072-2112146.log`.
  Command: `AKROGON_BASE=6c43d3f3e8b353015e94f19bf56e4a884b0c3139 akrogon run-check --name test -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun test --timeout=30000'"'"''`
- typecheck: exit 0, 1694 ms, log `implementation/check-typecheck-1791890587365-2468344.log`.
  Command: `AKROGON_BASE=6c43d3f3e8b353015e94f19bf56e4a884b0c3139 akrogon run-check --name typecheck -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun run typecheck'"'"''`
- test_changed: exit 0, 106423 ms, log `implementation/check-test_changed-1791890704257-2475268.log`.
  Command: `AKROGON_BASE=6c43d3f3e8b353015e94f19bf56e4a884b0c3139 akrogon run-check --name test_changed -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''`

Full suite: 878 pass, 0 fail. Changed suite: 863 pass, 0 fail. Both cover the delayed-placement reproduction. The worktree remains clean after all checks. No red comparison record is needed.

Completion owner: host-test-load is still open because leaf-stop remains in plan.synthesis. This attempt cannot close an issue or epic.

Merge guard: `akrogon phase seat-containment merged --slot B --check --attempt 443022f6-135d-4ebc-b609-49eb72f5f335` returned `ok`.

Landing: the same command without `--check` exited 0 and printed `moved merged` and `deployed 6c43d3f3e8b3..e5776ade920e`. No issue complete or epic complete line was printed, so no broadcast is due.
