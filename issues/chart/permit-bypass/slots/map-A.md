# Map A (blind)

## Claim check
- Partly right. Seats are boxed: every framework seat pid sits in akrogon.slice (`/proc/<pid>/cgroup`), so the direct run is inside the CPU quota (1600%) and memory brake. "Containment does not stop it" is wrong for load ceiling, right for serialization: the permit only lives in `akrogon run-check`/`base-run` (src/run-check.ts:20, src/permit.ts:94 nested via AKROGON_RUN).
- Load 18 on 32 threads is within the locked ceiling (ceiling-values 1a: "half the PC stays free"). The "1 to 2" baseline was the old one-run-at-a-time flock, not a promise of the new design.
- limit-boundary Taken (forks/limit-boundary.md:57-61): the permit is in run-check/base-run; seat boxing exists to bound and stop "worker scripts that bypassed run-check". So a direct run competing with the permit holder is a known residual of 1a, not a mechanism failure.
- Real gap = instruction: implement-issue SKILL.md:57 "runs the resolved changed-tests command" never says the run-check-wrapped `checks` entry. The seat ran the inner `bun run test:changed` (pi session 12:21Z) after pi's bash tool "timed out after 300s", then backgrounded it with nohup to /tmp/ftf-logs (outside leaf TMPDIR). technical-page-inventory backgrounded the wrapped command correctly, so backgrounding itself is fine.
- Bypass also skips run-check env hygiene: TMPDIR=runRoot, forbidden bunfig check, bus cut in constructedEnv (src/run-check.ts:35-57). Seat env still has the bus cut.

## Forks
F1 Where does "every heavy test run takes the permit" get enforced?
- 1a Skill text only: implement-issue/check-issue name the exact printed `checks` command (run-check form) for changed tests and any background run; inner script names forbidden. Cheap; agents still drift (probabilistic).
- 1b Consumer-side wrap: framework `test:changed` (and other heavy package scripts) re-enter via `akrogon run-check` so a direct `bun run test:changed` takes the permit; nested already a no-op (permit.ts:94). Destination framework. Breaks: manual operator runs outside akrogon now queue; `bun test <file>` still bypasses; each consumer must opt in.
- 1c akrogon-side shim: seat PATH gets a `bun` wrapper that takes the permit for `bun test`/`bun run test*`. Broad, fragile (argv parsing), invites false waits for tiny single-file runs and deadlock if a permit holder spawns a seat-level bun. Reject likely.
- 1d Accept as residual: slice quota bounds it; record in docs. Cost: permit holder slows under contention; timing data noisy.
F2 Single-file / targeted runs: should a seat's `bun test path/x.test.ts` need the permit? Locked heavy-runs says every run-check execution takes it; tiny runs through run-check would queue behind a 12-min run. Pitfall: forcing everything through the permit starves fast feedback.
F3 Tool-timeout pressure: pi bash 300 s limit pushes seats to background runs. Option: document the background pattern with the run-check command and `$TMPDIR` log path. Belongs with F1a.
F4 Queue throughput: 5-6 run-check waiters behind one permit, ~12 min each -> up to an hour of waiting per leaf. Locked: permit count 1 (limit-boundary), queue-order revisit "when wait fields show real cost". This is measurement, not a patch now. Pitfall: raising permits to 2 doubles peak (load 40 per run measured).

## Other live items
- Ceiling-values reopen trigger is framework:verify:core > 300 s; test_changed 12 min is a different command, so no trigger yet.
- The direct run logs to /tmp/ftf-logs: violates leaf TMPDIR rule; same skill-text fix.
- Running leaf: flaky-test-fixes; acting on it is an operator step, not chart work.

## Proposed destinations
- akrogon: skill text (implement-issue, check-issue; maybe merge-issue) so seats run heavy tests only through the printed `checks` command, including background runs. Likely direct-route sized, but direct: false.
- framework (only if F1 = 1b): wrap heavy scripts.
