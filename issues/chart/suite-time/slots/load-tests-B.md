# Load-sensitive tests: blind notes from slot B

2026-10-25. No repository implementation edits. Temporary-copy experiments only. No full suites run.

## Q1: fix the limits, keep the outcomes

### Pick, reason and cost

D9. Fix the actual races, and trial a bound on concurrent test bodies before rewriting dozens of timeout tests. Candidate check: `bun test --timeout=30000 --parallel=4 --no-isolate --max-concurrency=4`. This retains file parallelism while reducing the upper bound from 80 to 16 concurrent test bodies per suite. Three copies permit at most 48 instead of 240. Those are scheduling bounds, not measured process counts. Keep the existing 15/20/30/60-second per-test limits.

D10. Keep the agreed O1a/O1b work. Split the nine named-target cases. Give real systemd fixtures unique slice identities. Replace door-reset's elapsed sleep with a protocol-triggered identity change. Fix the status fixture's timestamp origin. Recheck the two short peer-wait budgets after bounding concurrency. Do not move the workflow or import the off-route Git/prebuild work.

This is a measured candidate, not completed S1 proof. On eight CPUs, three batch-dispatch files at concurrency 20 failed 6, 6 and 7 tests. At concurrency 4, all three passed all 23 tests with all 248 expects each. Group completion improved from 23.81 to 21.20 seconds, 10.95%. Combined child CPU fell from 171.44 to 148.58 seconds, 13.33%. No test cap or assertion changed. This does not prove the full check is 20% faster.

Cost: one extra runner flag plus focused fixture changes. A smaller concurrency limit can slow a quiet file, so the original S1 speed and overlap proof remains mandatory. Do not adopt it from this one-file experiment alone.

### Groups, causes and proposed changes

G1. Runner per-test limits: 39 unique names. Thirty-five hit 15000 ms, two hit 20000 ms, one hit 30000 ms and named-target hit 60000 ms. They account for 71 recorded failure events. These are runner limits, not the configured 30000 ms default overriding every explicit cap.

The cause demonstrated for batch-dispatch is excess concurrent work. Its holder test performs multiple real dispatches, Git changes and reconciliation before checking the result (tests/batch-dispatch.test.ts:124, :127, :136, :139, cap at :156). next's queue-reentry test similarly builds three leaves and drives several ordered phase/dispatch transitions before finishing (tests/next.test.ts:5019, :5022, :5033, :5049, :5083). These sequences share CPU with up to nineteen other tests in the same file. The targeted cap experiment reproduced seven names from the original failing family and made every copy green without raising a cap.

Change: trial the concurrency bound. Apply the already accepted nine-case split at tests/next.test.ts:5594. Split other independent parameter cases only where they do not share a recovery sequence. Keep queue, retry and wakeup sequences intact. The appendix maps every affected name to its source and limit. I have not proved that the bound fixes every next.test.ts timeout.

G2. Shared systemd identities: five unique names, 21 failure events. tests/leaf-slices.test.ts:105 and :209 use the real user bus. src/scope.ts:13 hashes only repo name and slug. Fixed names at tests/leaf-slices.test.ts:354, :383, :388, :490 and :544 therefore denote the same slices in concurrent suite copies. Cleanup at :318 and :375 can stop another copy's slice. A private HOME does not isolate the user manager.

Change: make every real-systemd fixture's repo/slug identity unique per fixture, and use that identity consistently in state, commands and expected slices. Keep production leafSlice unchanged. Process-unique names were sufficient for the single-case experiment. A fixture nonce is the more complete boundary when one process owns multiple fixtures.

Demonstration: three copies of the live-tab test produced two passes and one failure at load 9.09, in about 0.4 seconds. In a temporary copy, changing only its three tabbed-merged slug uses to include process.pid produced three passes, all seven expects each. This establishes a shared-name race for that case. It does not establish the exact cause of every other slice failure.

The two missing-marker cases also ignore the sdrun result before polling for up to thirty seconds (tests/leaf-slices.test.ts:524 and :525, :562 and :563). Capture and assert its exit code with stdout/stderr before interpreting an absent marker as slow execution. Fix identity collisions first, then recheck these cases. Their logs do not establish whether the inner command was killed, failed, or simply delayed. Do not blindly lengthen the marker wait.

G3. Internal peer collection budgets: two names, four events. tests/peer-wait.test.ts:902 allows 0.3 seconds but requires an observed working status. The overloaded logs return null. tests/peer-wait.test.ts:585 scripts a session change on the second wait, while :588 and :599 give each run one second. The failed outcome still reports session-A. These limits can expire before the required protocol observations. Raising Bun's per-test cap does not change them.

Change: choose these cases' collection budgets against the complete required observation sequence under the bounded scheduler, keeping exact status/session/exchange/signal assertions. Recheck the current values first after G1. If still insufficient, change only the measured internal windows. Do not replace every budget with one common constant or weaken the expected outcome. Startup of one subprocess alone is not the whole required sequence.

The final values are unresolved. My severe-affinity probe ran three copies of both cases on one CPU. Both original windows passed in every copy. Changing their internal windows to three seconds also passed, but increased file wall from 2.57 to 6.52–6.62 seconds. That does not demonstrate a fix or justify choosing three seconds. Any added collection time must be included in S1's net speed proof. This is distinct from the operator-rejected blanket increase of explicit per-test timeouts.

G4. Door-reset ordering: one name, one event. tests/door-reset.test.ts:210 starts the child, sleeps 700 ms at :211, then rewrites its session at :212. The test assumes the child has taken its original identity snapshot by then. That ordering is not established by an elapsed sleep. A concurrent fake read/write can also overwrite the rewrite.

Change: have the fixture change identity on the next agent-list read after returning the initial identity. A temporary wrapper changed the database on the second agent-list call. The test then passed in 77 ms of test-body time, with all three existing asserts, including the identity-changed log and no prompts. This removes the 700 ms delay and places the change at the observed protocol boundary. No production setting changes.

A first prototype using the fake's waitScript session change failed after 3.13 seconds. That branch did not drive this test's identity observation. Do not use that prototype. The successful agent-list wrapper is the evidence for this change.

G5. Terminal-duration fixture clock: one name, one event. tests/status.test.ts:38 and :73 sample Date.now separately. The overview writes the seven-minute terminal event before the thirty-minute prompt (tests/status.test.ts:124 and :130). Their difference can be just below 23 minutes. src/status.ts:114 floors minutes. The log expected 0h 23m and got 0h 22m at tests/status.test.ts:149.

Change: derive both terminal-duration endpoints from one captured epoch. Keep the exact 23-minute assertion. Do not freeze a shared global clock across concurrent tests or allow either minute value. This is the already identified status-fixture cause, not evidence for a runner timeout change.

### Rejected options

O19. Raise explicit per-test timeouts: reject. It conflicts with operator “2 no” and leaves shared identities, ordering and CPU contention intact. The file experiment passed without it.

O20. Serialize the whole suite or every integration test: reject as the first move. The bound retains useful concurrency and made the stressed file faster. Complete serialization could lose the accepted speed target.

O21. Replace Bun, Git or the fake backend in this fork: reject without evidence. A new runtime does not namespace the user bus, order a session mutation or fix fixture timestamps. Git-call and prebuilt-fake changes are explicitly off route in the Carries. Existing runner controls address the demonstrated contention more cheaply.

O22. Delete cases, loosen outcome asserts, retry until green, or label every assertion a timeout: reject. The five groups have different limits and need different repairs.

### Evidence: tier, source and date

F23. operator, 2026-10-25: fork Carries requires fixing load sensitivity before S1 and excludes a plain explicit-timeout raise. suite-shape Taken and its refinements keep the workflow, exact-check proof and three-suite bar.

F24. better-than-training, 2026-10-25: parsing all supplied S1 logs yields 48 unique failing names and 98 failure events. Nine names fail assertions. Thirty-nine hit explicit runner caps. This includes the single after1 failure as well as the nine triple-run logs. The appendix preserves every name and source location.

F25. better-than-training, 2026-10-25: the targeted scheduling, slice-identity and protocol-gate experiments above use the existing tests and keep their outcome assertions. The per-run commands, results and loads are recorded below. None is a full-suite acceptance run.

### Pitfalls and what removes them

R16. A smaller scheduling bound can trade quiet speed for reliability. Prove both the original quiet speed target and three green concurrent full checks before adopting it. The 8-CPU file experiment is diagnostic, not a substitute for that bar.

R17. Unique service names alone do not isolate their parent slice. Namespace the repo/slug identity used to derive the slice and every reference to it. Keep cleanup confined to that identity.

R18. One passing namespace case does not prove all five slice cases. Re-run their existing outcome checks after isolation. Capture real command failures instead of hiding them behind marker polling.

R19. A short-budget failure can occur before the behavior being tested. Keep the branch-specific asserts and measure the required observation sequence. A larger fixed guess alone is not proof.

R20. All experiments used a shared host. Copies within each triple deliberately overlapped. Other consultant work may also have overlapped. Affinity limits were applied only to these child tests, not to the host. No claim here excludes unrelated host activity.

### Missing question

Q7. May S1 add a within-file concurrency cap alongside its chosen file-worker count? That is a new runner choice worth settling explicitly. The existing fallback adjusts only file workers, although both levels multiply the load.

## Q2: overload bar

### Pick, reason and cost

D11. Keep three exact full checks at once as the acceptance bar. Do not replace it with a lower historical overlap number. Three confirmed full-suite executions already overlapped in the supplied history. It is also the explicit operator choice. The cost is a stress proof after the focused fixes, not permission to change phases, gates or queue policy.

### Rejected options

O23. Lower the bar to one or two suites because today's old command also fails: reject. That would hide existing shared-resource bugs. It would not meet the operator's choice.

O24. Require green execution under an arbitrary unbounded load average: reject. Load includes unrelated work and does not specify CPU allocation or test mix. Keep the concrete three-copy workload, record host conditions and preserve the quiet speed comparison.

### Evidence: tier, source and date

F26. better-than-training, supplied timings.jsonl joined to verify-runs.jsonl, 2026-10-25: 403 test check_end events exist. Command-log joins identify 251 executed commands as exactly bun test --timeout=30000. For these, intervals reconstructed as end timestamp minus duration_ms reach three concurrent executions. Aggregate wall time at concurrency three is 169.46 seconds. Idle time is excluded from that figure.

One confirmed overlap is 2026-10-15 20:54:45–20:55:08 UTC: kept-status, check-path-print and stacked-member-close were all executing the full command. This is execution overlap, not merely overlapping verify receipts or active leaves.

F27. better-than-training, same data and date: all 403 test-named execution intervals briefly reach four, including scratch-copy-removal for about 1.17 seconds. Its command text was not recovered by the receipt join, so I do not call that four confirmed full suites. The unmatched 152 timing events, manual tests and other host work mean three is not a proven upper bound on all host activity.

### Pitfalls and what removes them

R21. A receipt interval includes setup and other checks. Use actual test execution durations, as above. Do not infer suite count from leaf count, run starts or load average.

R22. Historical suites were staggered and the suite has changed. Treat history as support for retaining three, not a calibrated guarantee that synchronized new suites have identical CPU demand. Re-prove the chosen new command directly.

### Missing question

Q8. Should the overlap proof also report aggregate completion time and CPU for the three runs? It should be recorded to expose a reliability fix that merely adds waiting. The existing quiet-host 20% target still governs acceptance.

## Complete failure map

G1 is the explicit runner-cap group. G2 is real-systemd identity/marker behavior. G3 is peer observation budget. G4 is door-reset ordering. G5 is fixture timestamps. Locations are the live test declaration, with the assertion and helper evidence described above.

| Group | Source | Limit | Failing test |
| --- | --- | --- | --- |
| G1 | tests/batch-dispatch.test.ts:124 | 15000 | the holder gets a batch record rebased onto the remote and only the holder is prompted |
| G1 | tests/batch-dispatch.test.ts:158 | 15000 | an interrupted build is discarded and rebuilt under a new attempt |
| G1 | tests/batch-dispatch.test.ts:354 | 15000 | a dirty holder worktree drops the batch to solo and keeps its branch |
| G1 | tests/batch-dispatch.test.ts:479 | 15000 | empty untracked folders are removed before an applied merge prompt |
| G1 | tests/batch-dispatch.test.ts:521 | 15000 | empty untracked folders are removed before a solo merge prompt |
| G1 | tests/batch-dispatch.test.ts:548 | 15000 | unreadable ignored folders do not stop empty-folder cleanup before merge |
| G1 | tests/batch-dispatch.test.ts:582 | 15000 | a failed removal stops the merge prompt |
| G1 | tests/batch-dispatch.test.ts:678 | 20000 | a holder that cannot be rebased takes a solo turn with nothing stacked |
| G1 | tests/next.test.ts:244 | 20000 | a stale prompt never re-prompts a busy or done seat, and repeated delivery failures keep the leaf in phase |
| G1 | tests/next.test.ts:426 | 30000 | busy seats persist, warn strictly after an hour, retry delivery and clear independent episodes |
| G1 | tests/next.test.ts:623 | 15000 | merged phase closes tab on typed next and starts the dependent |
| G1 | tests/next.test.ts:823 | 15000 | next recovers only merge-phase work by ancestry against a non-default remote target |
| G1 | tests/next.test.ts:1258 | 15000 | bad YAML and invalid states reserve occupancy at capacity 3 |
| G1 | tests/next.test.ts:1258 | 15000 | bad YAML and invalid states reserve occupancy at capacity 4 |
| G1 | tests/next.test.ts:1289 | 15000 | dirty merged worktree is kept while its tab lives, then removed once clean |
| G1 | tests/next.test.ts:1454 | 15000 | foreign leaves do not consume capacity while healthy leaves in both repos dispatch |
| G1 | tests/next.test.ts:1853 | 15000 | a blocked non-merge seat does not stall a merge leaf |
| G1 | tests/next.test.ts:1886 | 15000 | merge, check.fix, check.repair and post-repair review dispatch to their swapped seats |
| G1 | tests/next.test.ts:3371 | 15000 | retryable agent start failures keep the leaf in phase until a start succeeds |
| G1 | tests/next.test.ts:4250 | 15000 | fixture temp root isolates every TMPDIR and envs carry override |
| G1 | tests/next.test.ts:4597 | 15000 | a live tab freezes .env while a dead tab lets the next dispatch rewrite it |
| G1 | tests/next.test.ts:4886 | 15000 | only the earlier-stamped merge leaf is prompted while the waiting leaf keeps its tab and panes |
| G1 | tests/next.test.ts:4907 | 15000 | an ineligible merge leaf never holds the turn (blocked-by) |
| G1 | tests/next.test.ts:4938 | 15000 | the operator merged holder exit wakes the next merge leaf without a manual next |
| G1 | tests/next.test.ts:4938 | 15000 | the prompt delivery fault holder exit wakes the next merge leaf without a manual next |
| G1 | tests/next.test.ts:4938 | 15000 | the seat check.fix holder exit wakes the next merge leaf without a manual next |
| G1 | tests/next.test.ts:4938 | 15000 | the seat failed holder exit wakes the next merge leaf without a manual next |
| G1 | tests/next.test.ts:4938 | 15000 | the seat merged holder exit wakes the next merge leaf without a manual next |
| G1 | tests/next.test.ts:4995 | 15000 | a committed merge whose log append fails still wakes the next leaf |
| G1 | tests/next.test.ts:5019 | 15000 | a leaf re-entering merge queues behind the two leaves stamped earlier |
| G1 | tests/next.test.ts:5085 | 15000 | a merge seat consumes one delivery attempt per pass and retries instead of failing |
| G1 | tests/next.test.ts:5111 | 15000 | an idle hook retries a faulted merge holder before its waiter |
| G1 | tests/next.test.ts:5146 | 15000 | a saved holder failure wakes the stamped queue when the log is a directory |
| G1 | tests/next.test.ts:5166 | 15000 | unstamped merge dispatch uses log order and refuses unreadable history |
| G1 | tests/next.test.ts:5400 | 15000 | blocked-report manual forms bare, all inside, all outside match |
| G1 | tests/next.test.ts:5417 | 15000 | blocked-report manual forms stay manual with pane and event set |
| G1 | tests/next.test.ts:5436 | 15000 | blocked-report automatic silence on hook, resume, and merge wake |
| G1 | tests/next.test.ts:5510 | 15000 | blocked-report no line for merge turn waits |
| G1 | tests/next.test.ts:5594 | 60000 | named target equivalence: owner name matches folder path from root, subfolder and worktree |
| G2 | tests/leaf-slices.test.ts:323 | assertion | merged and failed leaf slices with gone tabs are stopped and their processes end |
| G2 | tests/leaf-slices.test.ts:352 | assertion | a finished leaf with a live tab keeps its slice, and the pass fetched the pane list |
| G2 | tests/leaf-slices.test.ts:380 | assertion | a finished leaf slice named by a live run record is not stopped |
| G2 | tests/leaf-slices.test.ts:485 | assertion | a reconcile pass running inside a leaf slice does not stop that slice |
| G2 | tests/leaf-slices.test.ts:539 | assertion | akrogon phase merged inside the leaf slice stops no slice |
| G3 | tests/peer-wait.test.ts:582 | assertion | an unproven harness session change keeps waiting with its original exchange |
| G3 | tests/peer-wait.test.ts:899 | assertion | budget keeps the last status herdr returned |
| G4 | tests/door-reset.test.ts:206 | assertion | a session change during the turn wait is logged and nothing is sent |
| G5 | tests/status.test.ts:98 | assertion | overview reads multiple repos outside git, retains hierarchy and recorded fields without writes |

## Commands and run record

C1. `bun test --timeout=30000 tests/leaf-slices.test.ts -t '^a finished leaf with a live tab keeps its slice'`. Three simultaneous copies in the repo, then three in a temporary copy changing only the three slug references to include process.pid. Existing seven expects retained in the passing runs.

C2. `taskset --cpu-list 0,1,2,3,4,5,6,7 bun test --timeout=30000 --max-concurrency=20 tests/batch-dispatch.test.ts`. Three simultaneous copies. Repeated with --max-concurrency=4. Same eight-CPU allocation. Same 23 tests and 248 expects per run. Every cap-20 failure was a 15000 ms timeout. Combined CPU: cap 20, 137.49 user + 33.94 system seconds; cap 4, 118.42 user + 30.16 system seconds.

C3. `bun test --timeout=30000 tests/door-reset.test.ts -t '^a session change during the turn wait'` in the temporary copy. The waitScript prototype failed. The replacement fixture wrapper changed the session on agent-list call two and passed all three expects. All production code and existing outcome assertions were retained.

C4. `taskset --cpu-list 0 bun test --timeout=30000 tests/peer-wait.test.ts -t '^(an unproven harness session change|budget keeps the last status)'` in the temporary copy. Three copies with original budgets, then three with just the internal 1-second and 0.3-second windows changed to three seconds. All six passed both tests with twelve expects. The longer version was slower and did not establish a fix.

Every table row records one process. Loads are 1/5/15-minute averages before and after. “Shared” means original slice names. “Unique” means the temporary process-unique slug experiment. Triple batches deliberately overlapped internally; other host overlap is unknown.

| Run | Exit | Pass/fail | Wall seconds | Load before | Load after |
| --- | --- | --- | --- | --- | --- |
| leaf-shared-0 | 0 | 1/0 | 0.364 | 9.09 / 17.24 / 28.34 | 9.09 / 17.24 / 28.34 |
| leaf-shared-1 | 1 | 0/1 | 0.414 | 9.09 / 17.24 / 28.34 | 9.09 / 17.24 / 28.34 |
| leaf-shared-2 | 0 | 1/0 | 0.365 | 9.09 / 17.24 / 28.34 | 9.09 / 17.24 / 28.34 |
| leaf-unique-0 | 0 | 1/0 | 0.615 | 7.18 / 16.28 / 27.79 | 7.18 / 16.28 / 27.79 |
| leaf-unique-1 | 0 | 1/0 | 0.616 | 7.18 / 16.28 / 27.79 | 7.18 / 16.28 / 27.79 |
| leaf-unique-2 | 0 | 1/0 | 0.616 | 7.18 / 16.28 / 27.79 | 7.18 / 16.28 / 27.79 |
| batch-cap20-0 | 1 | 17/6 | 23.759 | 6.65 / 15.08 / 26.90 | 32.57 / 20.51 / 28.44 |
| batch-cap20-1 | 1 | 17/6 | 23.808 | 6.65 / 15.08 / 26.90 | 32.57 / 20.51 / 28.44 |
| batch-cap20-2 | 1 | 16/7 | 23.759 | 6.65 / 15.08 / 26.90 | 32.57 / 20.51 / 28.44 |
| batch-cap4-0 | 0 | 23/0 | 21.200 | 32.57 / 20.51 / 28.44 | 29.20 / 20.74 / 28.31 |
| batch-cap4-1 | 0 | 23/0 | 21.200 | 32.57 / 20.51 / 28.44 | 29.20 / 20.74 / 28.31 |
| batch-cap4-2 | 0 | 23/0 | 21.100 | 32.57 / 20.51 / 28.44 | 29.20 / 20.74 / 28.31 |
| door-scripted-session | 1 | 0/1 | 3.134 | 4.44 / 13.57 / 24.51 | 4.17 / 13.36 / 24.39 |
| door-agent-list-gate | 0 | 1/0 | 0.110 | 2.33 / 10.45 / 22.39 | 2.33 / 10.45 / 22.39 |
| peer-original-0 | 0 | 2/0 | 2.567 | 1.86 / 7.24 / 19.57 | 2.19 / 7.22 / 19.50 |
| peer-original-1 | 0 | 2/0 | 2.567 | 1.86 / 7.24 / 19.57 | 2.19 / 7.22 / 19.50 |
| peer-original-2 | 0 | 2/0 | 2.567 | 1.86 / 7.24 / 19.57 | 2.19 / 7.22 / 19.50 |
| peer-3second-0 | 0 | 2/0 | 6.522 | 2.19 / 7.22 / 19.50 | 2.50 / 7.20 / 19.43 |
| peer-3second-1 | 0 | 2/0 | 6.622 | 2.19 / 7.22 / 19.50 | 2.50 / 7.20 / 19.43 |
| peer-3second-2 | 0 | 2/0 | 6.522 | 2.19 / 7.22 / 19.50 | 2.50 / 7.20 / 19.43 |

Inspection commands: cat read the brief, S1 summary/failure names, selected S1 logs and live configuration. rg located named process sections, failures, test declarations, time limits and fixture/systemd calls. sed and nl read the relevant bounded bodies and supplied process sections. bun test --help filtered by rg confirmed max-concurrency defaults to 20. Python parsed log failures, source locations and execution overlap; created temporary copies; ran and recorded the targeted tests; calculated ratios; wrote and verified this return; and removed this consultation's temporary files. Inspection and test orchestration commands exited 0. The first return-file verification exited 1 because its row counter included the table header; the corrected verification passed. Child test exits are recorded above. No full-suite command ran in this consultation.

Recommendation: keep the three-suite bar. Fix resource identity and ordering, and prove a smaller within-file concurrency limit before lengthening per-test caps or replacing the stack.
