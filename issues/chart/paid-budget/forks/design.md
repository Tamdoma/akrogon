# Design: paid-budget

## Question

What replaces the stored paid_budget cap, given the locks (seed #152 as corrected, signposts 2 and 3b)?

## Findings

Maps: slots/map-B.md, slots/map-C.md, A's own read of src/budget.ts, src/config.ts:31-40, tests/e2e/tier.ts:39-48, skills/lifecycle-rules.md:5-11.

- The cap, budget.jsonl, budget.lock and --sessions only exist to count against a stored number (B; C keeps them as a log). With no stored number they have no job. (A,B)
- The tests already enforce a budget from AKROGON_SESSIONS and AKROGON_SESSION_MINUTES (tier.ts:42-48, watch-consults.e2e.ts:153-159). A too-small session count fails before any spend and prints the needed number. (A,B,C)
- issues/timings.jsonl check_end rows already hold name, exit and duration_ms per run (src/timing.ts:55-62). budget.jsonl holds no name, minutes, duration or result. (A,B,C)
- This host's config.yaml carries paid_budget. globalSchema is strict, so a build without the key fails every command while the stanza stays. An older build accepts a config with no key. (B,C)
- No money or usage limit exists on nested runs, only non-inheritance of the two names (B). (A,B,C)

## Taken

A's picks (full autopilot), 2026-11-23:

1. Delete the machine budget: paid_budget key, src/budget.ts, budget.jsonl writes, budget.lock, the --sessions flag and its tests and docs (B Q1 O1). C's keep-and-log (C F3) is not taken: a log with no reader is a second record of what timings.jsonl and the seat's record already hold. A row reader command is not added.
2. The seat passes the budget inside the command: `akrogon run-check --name <x> -- env AKROGON_SESSIONS=<n> AKROGON_SESSION_MINUTES=<m> <test>`. Repo config still may not set the two names (src/config.ts:133). (B)
3. First guess: the seat reads past runs of the same check name in issues/timings.jsonl, takes the longest green duration, sets minutes to at least twice that, and sessions to the test's planned count plus spare. No history: guess generously. The seat writes n, m and the reason in its record file. (B, with "generous" from the operator)
4. Budget stop: a run that stops on its own budget (the test's session refusal or its minute deadline) is not a red. The seat raises (at least doubling the bound that stopped it, or the printed number) and reruns with no operator. A minute stop counts as a budget stop only while the run got further than the previous one. A second stop with no more progress is a red under lifecycle-rules :9. (B Q3, C F4 merged)
5. Grants (3b): count and spend bounds in any grant are the seat's to size and raise. Account, target and outside effects still need the operator. "Spend past a recorded grant" leaves the watch stop list. (B Q4)
6. Review (check-issue :69): compare the sessions in kept evidence with the n, m and reason in the seat's record. Raised reruns after a budget stop are normal. Paid activity the record does not explain stays a Fix, repaired in the record, never by a fresh paid run. (B R2, C)
7. Host stanza: A deletes paid_budget from ~/.akrogon/config.yaml in the same step as deploying the build (N1 covers it). Safe on rollback because older builds accept a config with no key. (B Q5)
8. Kept: the tests' own guards (tier.ts reservedSessions, the minute deadline), the nested non-inheritance test (moved from budget.test.ts), host overload caps. The guard comment changes to "under a budget the seat set". (A,B,C)

### Final shape corrections (A, 2026-11-23, from slots/rebut-B.md and slots/rebut-C.md)

- [3] The history file is `<main checkout>/issues/timings.jsonl` (leaf worktrees exclude issues/, src/next.ts:265). The rule names it by the repo root beside `leaf=`. (B1)
- [2,4] Worded by function: the budget is whatever limit the test takes as a parameter, passed in the command; a stop on that limit is the budget stop. AKROGON_SESSIONS and AKROGON_SESSION_MINUTES are akrogon's own e2e convention. (B2)
- [4] Raise and rerun only when the recorded evidence does not already meet the fresh-run floor at lifecycle-rules :11. (B3)
- [7] Order: A deletes the stanza before pushing the build (B4). C's accept-and-ignore release is not taken: the direct route deploys only through A, and B found no open or parked leaf in akrogon or framework that records --sessions, so the old build never needs the key in the gap.
- [new 9] The door's paid_budget needs row and the chart wait on it are deleted; the door sizes its probe like a seat. (B G1)
- [new 10] Standing grant entry: date 2026-11-23, answer the operator's 3b words (forks/signposts.md), bounds "none" when no non-count limit; lifecycle-rules :7 "never widens it" gains "except count and spend bounds". (B G2)
- [1,5] Also drop budget.jsonl from src/state-home.ts:17 and its test; watch consultant-brief :27 drops both the paid_budget ceiling clause and "spend past a recorded grant", and docs/use/watch-while-away.md:30 drops the same phrase. (C2, B final)

## Deadline classification (A, 2026-11-23, after D round 5 F7)

The outcome is decided by what the test knows when the deadline fires: a failure the body has seen before the deadline is a red; anything still pending at the deadline is a deadline stop at the last completed stage. A failure whose result reaches the test only after the deadline is a deadline stop by definition, since the session ran out of time before learning it. Built as a race of the body against the deadline (49b32bcf).

## Contain, then kill (A, 2026-11-23, after D rounds 7-8; B and C both picked it: slots/teardown-B.md, teardown-C.md)

Patching the deadline/teardown seam kept finding races (round 7: 3, round 8: 4). Replace it with containment:
1. The tier's core gets a scratch runtime folder with a `bus` link and no `systemd` link, as tests/hc-fixture.ts already does, so the core, its terminals and any replacement core stay in the caller's cgroup (B and C both observed this on the host; with the real runtime they escape to app.slice units).
2. The test file is a judge outside; it starts the body as one child in one transient slice `akrogon-e2e<pid>.slice` (single hyphen, under akrogon.slice) with AKROGON_RUN_SLICE set to it, so consultant run-check/verify scopes are inside too.
3. Deadline or body exit, whichever first: write 1 to the slice's cgroup.kill, wait for cgroup.events `populated 0` (bounded; expiry is a teardown failure), stop the slice and the one leaf slice, remove state, run the absence check. No fallback to systemctl kill.
4. The outcome is read from files the body writes as it goes: stage, a red marker written the moment it fails (before any screen read), each paid start. Body exit 0 = pass, nonzero = red, deadline first = deadline stop at the last stage unless a red marker exists. A teardown failure is appended.
5. Removed: stopCore, stopAndBlockCore, block/unblock, the timer, closingTier, deadlineStop, the race block, the list/kill/rm loop. stopDaemon stays for hc-fixture with killSignal SIGKILL (F12).
Risks: R1 agy has not run under a scratch-runtime core, so one free agy start comes before the paid run. R4 transcripts may lose last lines on SIGKILL. R6 a killed judge leaves the slice running, as today.

## One lock for the akr-e2e-watch session (D round 11, F21-F23)
B and C both picked a kernel lock (slots/ownership-B.md, ownership-C.md). Decision by A:
1. `tests/e2e/watch-tier.ts` exports one function that takes `flockHold('<realRuntime>/akr-e2e-watch.lock', '-x')` (src/flock.ts). Each test file that uses the session (watch-consults, watch-live, watch-stop) calls it at module level, before any test timer starts, so a second run waits instead of failing. The body script never takes it. The lock file stays.
2. claimCoreRuntime and its folder-as-claim are deleted. A dead run leaves no claim behind, because the kernel drops the lock on any exit.
3. The slice name is fixed (`akrogon-e2ewatch.slice`). One cleanup function (kill and stop the slice and the ledger leaf slices, remove coreState and coreRuntime) runs at the start under the lock, for a dead run's leftovers, and again at the end. absent() runs at the end under the lock.
4. <out> is removed and then written as one set.
Accepted: B R1, a judge killed after its body starts can let the body start about one more session in the second before the next judge's start cleanup kills it. That session is not counted.
