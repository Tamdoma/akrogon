# Intake (operator, 2026-10-13, chat)

Operator note verbatim: "This is what I got from the framework-watch tab in framework herdr workspace after the latest merge to akrogon today. Use slot b and slot c to consult (they're active), so we can patch everything that's needed."

Framework-watch tab report, transcribed verbatim from the operator's screenshot:
"The permit only partly works.
Working: checks that go through akrogon run-check hold the permit. akrogon status shows Run permit: framework/technical-page-inventory test_changed pid 3484562, and the timing log shows its runs starting with no wait.
Not working: flaky-test-fixes started its own bun run test:changed with nohup, outside run-check. That run has no permit and runs alongside the permit holder: 44 processes, including the variant-review browser tests. That is why load is 18 instead of the 1 to 2 we had with one run at a time. So seat containment does not stop a seat that runs a framework test command directly.
Speed: no run has finished under the permit yet, so there is no new number. For comparison, a solo test_changed took 12.1 to 12.4 minutes in the 4 runs from pull-rebuild-scripts this morning. The current permit run started 3 minutes ago at load 18, so expect it to take longer than that.
Do you want me to file this bypass on akrogon? I can also check for the next finished test_changed and report its duration against the 12-minute baseline."

# Door observations so far (A, 2026-10-13 ~14:30 local), for orientation only
- All framework seats run inside akrogon.slice (CPUWeight=20, CPUQuota=1600%, MemoryHigh=64G, MemoryMax=96G): `systemctl --user status akrogon.slice`, `/proc/<pid>/cgroup`.
- The direct run: pid 3693707 in worktree ~/.akrogon/worktrees/framework/flaky-test-fixes: `nohup env AKROGON_BASE=5870a83... bun run test:changed > /tmp/ftf-logs/tc-pick1.log 2>&1 &`. Preceded in the pi session (~/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-framework-flaky-test-fixes--/*.jsonl, 12:21Z) by a pi bash tool call that "timed out after 300s", after which the seat reasoned "I'll run it in the background and poll for results".
- At the same time 5+ `akrogon run-check --name test_changed` processes from other framework leaves were queued behind the one permit.
- Framework `akrogon config` test_changed = `akrogon run-check --name 'test_changed' -- sh -c '... bun run test:changed'`.
