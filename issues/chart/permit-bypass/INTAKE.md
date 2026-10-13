# Intake: permit-bypass

## Scope
Destination akrogon (registered root /home/ivan/Work/infra/akrogon). Possible second destination pi-extensions (shell-timeout sentence) and framework (only if an entry-point gate is chosen). Grouping decided after the guarantee fork.

## Provenance
- Operator: chat 2026-10-13, after the latest akrogon merge, with a screenshot of the framework-watch tab (slots/watch-report.png).
- Operator: chat 2026-10-13 14:38 local, second framework-watch screenshot (slots/watch-report-2.png), sent as "another input".
- Operator: chat 2026-10-13 ~14:45 local, third framework-watch screenshot (slots/watch-report-3.png) with a systems-thinking request.

## Source: operator 2026-10-13
"This is what I got from the framework-watch tab in framework herdr workspace after the latest merge to akrogon today. Use slot b and slot c to consult (they're active), so we can patch everything that's needed."

Screenshot text (framework-watch tab), transcribed:
"The permit only partly works.
Working: checks that go through akrogon run-check hold the permit. akrogon status shows Run permit: framework/technical-page-inventory test_changed pid 3484562, and the timing log shows its runs starting with no wait.
Not working: flaky-test-fixes started its own bun run test:changed with nohup, outside run-check. That run has no permit and runs alongside the permit holder: 44 processes, including the variant-review browser tests. That is why load is 18 instead of the 1 to 2 we had with one run at a time. So seat containment does not stop a seat that runs a framework test command directly.
Speed: no run has finished under the permit yet, so there is no new number. For comparison, a solo test_changed took 12.1 to 12.4 minutes in the 4 runs from pull-rebuild-scripts this morning. The current permit run started 3 minutes ago at load 18, so expect it to take longer than that.
Do you want me to file this bypass on akrogon? I can also check for the next finished test_changed and report its duration against the 12-minute baseline."

## Source: operator 2026-10-13 14:38 ("another input")
Screenshot text (framework-watch tab), transcribed:
"Yes, it's slowing everything down. The permit works for checks that go through run-check, but workers that run the tests directly skip it, so 4 full test runs are going at once. Load is 87 on 32 cores.
What's running:
- spec-path-open-categories: holds the permit, so this run is the only one doing it properly.
- coverage-unavailable-guard-u1: a worker running bun run test:changed directly, with no permit.
- technical-pack-selection-u2: a worker also running its suite outside the permit.
- flaky-test-fixes: seat A started test:changed itself with nohup 16 minutes ago, with no permit.
About 9 other permitted checks are queued behind the permit, as they should be. The 3 unpermitted runs alone use about 9 cores, including Chrome, and the rest of the load comes from everything else running beside them.
Speed:
- The one finished permitted run (technical-page-inventory) took 13.8 minutes, against about 12.2 minutes for a solo run this morning.
- The next run then waited 2.5 minutes for the permit.
- Runs started at load 87 will take longer still.
Cause: seat containment does not stop seats or their implement-issue workers from calling bun run test:changed directly. The implement skill's worker steps and briefs tell workers to run tests themselves.
- O1 (recommended): I file this bypass on akrogon now, and let the current runs finish without killing anything.
- O2: O1, plus pause framework so no new seat starts more unpermitted runs while you fix it.
- O3: O2, plus kill the 3 unpermitted runs now. That brings load down right away, but those seats will need to rerun their tests later."

## Source: operator 2026-10-13 ~14:45 (systems request)
Operator note verbatim: "This also seems to be a huge issue. Is it an issue in architecture. I need to get the best bang for the buck while not making my PC explode. Figure it out with the consultants. Look at it from the system's perspective and systems thinking. See all the reinforcing loops and feedback loops that are balancing. See where something is missing and how we can optimize the system so it doesn't stall as much while not blowing my computer up. Send all these ideas to consultants and make them think about this as well."

Screenshot text (framework-watch tab), transcribed (table top cut off; visible rows):
"selftest 1.7 min | cheap 0.2 min | merge verify 5.5 min
A leaf with 3 fix rounds runs about 4 check cycles plus 1 verify. That's about 4 x 14 + 5.5 = 60 min of permit time.
What that means for merges:
- With one permit, the hard ceiling is about 1 leaf merged per hour, or about 20 a day if the permit never sits idle.
- Framework has about 20 open leaves, so expect roughly a day of permit time to clear them.
- Without the permit you'd still need that same CPU, plus the overload and reruns.
Queue wait per leaf:
- Seats spend most of their time coding and reviewing, so check requests come at different times. The one wait measured so far was 2.5 min.
- The worst case is 8 leaves asking at once. The last in line would wait about 7 x 14 = 1.5 hours.
- My guess is a typical wait of 5 to 20 min per check with 8 active leaves.
Uncertainty: browser tests spend part of their time waiting, not computing. So 2 runs at once might finish sooner than 2 in a row. I haven't measured that. A test would be to time 2 permitted runs together against 1 alone.
The bigger lever: test_changed runs the full suite whenever a change touches any path outside an owned folder. If it selected only the affected suites, many runs would take seconds to a couple of minutes instead of 12, and the queue would mostly go away.
This only holds once the bypass is closed. Right now 3 unpermitted runs overlap the permitted one, so neither the timing nor the serial benefit applies yet."

## Agent findings
See slots/map-merged.md (A, B, C independent maps).
- Door 14:40 local: akrogon.slice cpu.max 1600000/100000 (16 of 32 cores), host vmstat 86% idle, load 32/44/26. Load counts waiting tasks; the slice cap held and the operator's half stayed free. The cost is slower and flakier leaf runs.
- Workers: worker-protocol.md:11 and brief-template.md:37 have workers run changed tests themselves. If the fix makes workers use the run-check form, each worker queues for the one host permit behind 12+ min runs.

## Source 4: operator 2026-10-13 (framework-watch screenshot, transcribed; operator note: "<- more reports from watch-framework. Look into this, and ask it for more info, or get the logs yourself")
"This tick turned up a real slowdown, and it comes from how seats call the run permit, not from tests running one at a time.
- Starved leaf: crawl-run-binding's A seat has tried to start test_changed for about 55 minutes and never got the permit. Its tool calls get killed after a few minutes, so it wrapped akrogon run-check in timeout 240-400 and retried 7 times. Each timeout dropped it out of the queue, and other leaves took the permit every time.
- Action: I stopped that seat once and sent one prompt: start the run once in the background with nohup and no timeout, then poll its log. It's working again.
- Now: coverage-unavailable-guard holds the permit (4 min). Load is 12, with 17 test:changed processes. Eight A seats are busy (1h01-1h15), and favicon-render polls the same way but is already in the background.
- F1 (new): any seat whose tool calls get killed after a few minutes can lose its place this way. akrogon should hold a queued request's place even when the caller's command is killed, or seats should be told to start run-check in the background.
- Still need your call: O1, O2 or O3 on the bypass runs, the Codex hook trust, and whether to file F1 on akrogon."

### Agent findings (door, 2026-10-13 15:41)
- crawl-run-binding pi session: 8 run-check calls wrapped in `timeout 240/300/400`, several after `sleep 120-240`; 2 tool timeouts at 120 s.
- framework issues/timings.jsonl: crawl-run-binding `cheap` waited 3,849,859 ms (64 min) for a 15 s run (check_start 13:40:04Z); `selftest` waited 929,777 ms (15.5 min) for a 127 s run.
- flock has no FIFO: a killed waiter loses its place (src/permit.ts flock). Covered by guarantee Taken (permit removed) and fork long-run-path; not a separate seed.

## Source: Tamdoma/akrogon#89
Provenance: GitHub Tamdoma/akrogon#89, matched to concurrent-checks by operator "yes" 2026-10-13; added after handoff, so not in leaf sources; the door closes it on delivery.

# A leaf waited 55 minutes for the run permit and never got it: its seat wrapped run-check in a short timeout, so each try was killed while waiting and other leaves kept winning

Source: Tamdoma/akrogon#89
URL: https://github.com/Tamdoma/akrogon/issues/89

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation
On 2026-10-13, after the host-test-load run permit shipped, framework leaf crawl-run-binding (seat A, pi) tried to start `akrogon run-check --name test_changed` from 12:29 to 13:29 UTC and never got the permit. Its pi session log shows 7 attempts shaped `sleep N; timeout 240|300|400 akrogon run-check --name 'test_changed' -- ...`. Each printed `akrogon: waiting for run permit held by framework/<other leaf> test_changed pid <n>` and was then killed by its own `timeout`. In that hour the permit went to technical-page-inventory, spec-path-open-categories, favicon-render and coverage-unavailable-guard in turn. After one operator steer to start it once with `nohup` and no timeout, it got the permit about 14 minutes later.

## Location
`src/permit.ts` `acquire()` (LOCK_NB poll every 250 ms). Seat guidance for running checks: `skills/implement-issue/SKILL.md` and `brief-template.md`. framework leaves in plan.synthesis and implement.

## Reproduction
Several leaves need `test_changed` at once. One seat's harness kills tool calls after a few minutes (pi showed `timed out after 120s` on its first try), so the seat wraps run-check in `timeout` and retries after a sleep. Seen once and sustained for about 55 minutes.

## Expected behavior
A leaf that asks for the permit gets it within a bounded number of other runs, whatever its seat's tool timeout.

## Urgency
One leaf lost about 55 minutes. Every leaf on a harness with a short tool timeout is exposed, and the cost grows as more leaves reach checks together. Workaround: an operator steers the seat to start run-check in the background and poll its log.

## Suspected cause
Agent view. Main condition: the permit has no order (queue-order 1a: "no starvation promise", LOCK_NB poll). A waiter only competes while its process lives. Contributing condition: a seat whose harness caps tool time keeps killing its own waiter and sleeping between tries, so it is absent from the race most of the time. The chart predicted this: queue-order Findings list as fog "seat tool timeouts abandoning vs killing a waiting run, skill text telling seats to run checks without a short tool timeout", and `Foreclosed ... wait timeout`.
Files read: src/permit.ts:78-116, issues/chart/host-test-load/forks/queue-order.md, skills/implement-issue/brief-template.md:35-37, skills/implement-issue/SKILL.md:57, the seat's pi session log via watch-issues log-tail.
Not inspected: whether the skill text was later changed to warn seats off short tool timeouts. Whether other harnesses (claude, codex) cap tool time the same way.
Related reports: Tamdoma/akrogon#88 (the overload that led to the permit; this is a cost of its chosen order). Searched Tamdoma/akrogon all states: author @me since 2026-10-11 (limit 20), "run permit" (limit 8).

## Source: Tamdoma/akrogon#90
Provenance: GitHub Tamdoma/akrogon#90, matched to concurrent-checks by operator "yes" 2026-10-13; added after handoff, so not in leaf sources; the door closes it on delivery.

# Full test:changed suites run outside the run permit: two worker worktrees and one seat ran bare bun run test:changed while another leaf held the permit, host load 87

Source: Tamdoma/akrogon#90
URL: https://github.com/Tamdoma/akrogon/issues/90

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation
On 2026-10-13 around 14:37 local, with the host run permit live, host load was about 87 on 32 threads while one leaf (spec-path-open-categories) held the permit. Three full `test:changed` suites were running outside `akrogon run-check`:
- worker worktree coverage-unavailable-guard-u1 ran `bun run test:changed` directly
- worker worktree technical-pack-selection-u2 ran its suite with no run-check parent
- flaky-test-fixes seat A ran `nohup env AKROGON_BASE=... bun run test:changed > /tmp/ftf-logs/tc-pick1.log`

By 16:30 the same day, every running `test:changed` on the host had a run-check parent. So the bypass happens at times, not all the time.

## Location
framework leaves in implement, worker worktrees `<slug>-uN`. Worker brief command section: `skills/implement-issue/brief-template.md` section 7 ("The resolved `test_changed` command only"). `skills/implement-issue/SKILL.md:57`.

## Reproduction
Several framework leaves in implement with delegated workers. Frequency: seen once with 3 runs at a time. Not reproduced on demand.

## Expected behavior
Every slow test run on the host goes through the permit, as host-test-load's goal says: "All leaves, workers and their test runs on this host share one load limit enforced below the agent layer".

## Urgency
The bypass undoes the permit's purpose. Full suites run together, load was 87, and a permitted run got slower (technical-page-inventory test_changed 825 s vs about 730 s solo). Workaround: none in akrogon. An operator can only kill the runs.

## Suspected cause
Agent view. Main condition: the permit only covers commands launched through `akrogon run-check`, and nothing below the agent layer stops a seat or worker running the bare package script. Contributing condition: the worker brief passes "the resolved `test_changed` command", which does not say the run-check wrapper must be kept. A seat or worker can copy the bare inner command (`bun run test:changed`) instead. This rests on the observed command lines. The briefs the workers actually got were not read.
Files read: skills/implement-issue/brief-template.md:35-37, skills/implement-issue/SKILL.md:57, src/permit.ts, issues/closed/host-test-load/ISSUE.md, issues/chart/host-test-load/CHART.md, process trees on the host.
Not inspected: the worker sub-briefs those leaves wrote, and whether seat containment's CPU quota capped real CPU while load read 87.
Related reports: Tamdoma/akrogon#88 (same overload class. Its fix is the permit this run went around). Searched Tamdoma/akrogon all states: author @me since 2026-10-11 (limit 20), "run permit" (limit 8).
