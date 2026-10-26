# Review B: cost-rules

Date: 2026-10-26. Phase: `check.review`. Verdict: **fix**.

Base: `c9b619c65cc287cf592431d898e88021334b1308`.
Reviewed head: `58dd9496686fba0109a3dbf6f888cb6841efbaba`.

Reviewed the six-file diff against brief, design, plan, implementation reports, the referenced standing design, and the affected chart-issues contracts. Initial review was blind. No code or test changes and no commits were made.

## Fixes

### F1: Queue-time readability checks only metadata

Location: `skills/chart-issues/scripts/door-reset.ts:264`.

Criterion 3 explicitly requires an unreadable session record at queue time to produce a nonzero parent exit, a reason on stderr, no log, and no sends. `statSync(path).size` succeeds for an existing file with no read permission. The parent consequently creates the log, detaches the child, prints `queued`, and exits 0. The child later discovers EACCES and logs `record unreadable`. The caller receives success instead of the required refusal.

Reproduced through the actual script and existing fake-herdr boundary, as uid 1000, for claude, codex and pi. Each fixture existed before invocation and had mode 000. In all three cases the observed result was:

```text
parent_exit: 0
stdout: queued
stderr: empty
log_exists: true
child result: record unreadable (EACCES)
prompts: []
```

This is the unreadable-at-queue outcome named by criterion 3, so it blocks independently of how often session permissions change. It also contradicts the design's parent-refusal interface. Existing queue-time cases exercise missing records only and do not catch this failure.

Required repair: establish readability while capturing the boundary, before opening the log or dispatching the child. Add a reproduction at the existing CLI boundary for an existing unreadable record and show the required refusal before and after the repair. No live authorization is needed.

Evidence, read back with `akrogon log`:

`check review-B-readability: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-review-B-readability-1793013614554-18938.log`

The diagnostic command exits 0 because it records actual outcomes. Its output demonstrates the criterion failure, not a passing criterion test. Fixture permissions were restored and all fixture directories were removed.

### F2: Both peer-creation contracts still require asking C

Locations: `skills/chart-issues/SKILL.md:27` and `skills/chart-issues/assets/questions.md:46`.

Real source: an operator requests created consultants B and C inside herdr without naming C's kind or arguments. Both entry-point paragraphs still direct A to ask once for **each** created peer's harness kind and arguments before running peer-create. Appending the pi default does not exclude C from that instruction. Following it still asks the C question that this change is meant to remove.

Consequence today: the normal created-peer workflow still waits for C's configuration instead of immediately using pi with empty argv. This conflicts with brief What 3 and Why, design O8, and plan D8's distinction between the defaulted C and the seats that remain asked. Criterion 5's two copies must describe that behavior consistently.

Required repair: exclude defaulted C from the asking instruction in both paragraphs. Preserve explicit C kind/argument overrides, asking for the other created seats, supplied-pane behavior, and the existing failed-create behavior. This is a process-contract correction, verified by review, not a prose-string test.

Evidence, read back with `akrogon log`:

`check review-B-doc-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-review-B-doc-diff-1793013537665-4158088.log`

## Verification

The current head already has a completed green leaf verify receipt, run `30fce26c-ba9e-46f9-9065-b3321846682a`, ending 2026-10-26T11:18:04.458Z. I checked the recorded SHA, commands and logs. Format and typecheck pass. The configured test command reports 1195 pass, 0 fail. No planned test or configured runner was skipped, disabled or narrowed in the diff. This receipt is after the last test-file change, including formatting.

Kept logs, each read back with `akrogon log`:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-format-1793013398804-3855899.log`
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-test-1793013480695-3855899.log`
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-typecheck-1793013484457-3855899.log`

Replayed the four exact per-criterion commands named by plan.md on the reviewed head, using their planned filters. All pass:

- `check crit1: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-crit1-1793013632762-149009.log` — 9 cancellation cases, both timing paths and claude queued input.
- `check crit2: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-crit2-1793013634802-157884.log` — 5 own-record/boundary cases, including claude task notifications.
- `check crit3: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-crit3-1793013634069-165340.log` — 2 missing-record cases. The planned `unreadable` filter excludes the missing-pi and deleted-while-waiting cases. Their current evidence is the full configured test run, not this filtered run. Neither set covers F1.
- `check crit4: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-crit4-1793013634459-168254.log` — the entry-name/footer test passes.

Read back the plan-red2, naive2, naive3 and final-tests logs cited by planning and implementation. They show missing-behavior failures and the intended discrimination/boundary/recheck failures, followed by all 37 door-reset cases passing. The current full verify provides evidence after the later test formatting change. No proof-command correction is needed to account for the full suite observing the same cases. No full verify was repeated during review because its current receipt already exists and no code changed.

## Contract and documentation review

Criterion 4: the shared handover section covers Drain move-on triggers and exclusions, collecting turns and closing spans, durable instruction carry, pending Destination for an attended next chart, latest unconsumed handover matching, live-session continuation, seat/span creation, and same-session behavior outside supported herdr runs. Autopilot retains its handover, continuation and footer wording and its explicit overrides.

Criterion 5: pi/empty-argv defaults and explicit overrides exist in both paragraphs, but F2 remains. `peer-create.ts` is unchanged.

Criterion 6: both final-shape paragraphs describe one marked shape for one reply/pick and fork, sent to every named peer. The referenced final-shape rule preserves substantive-conflict escalation, post-check mechanism/contract rechecks, the restatement exemption and the other review triggers.

Opened `docs/use/plan-work.md` and `docs/use/autopilot.md`, following `docs/reference-index.md`. Their existing operator instructions remain accurate. No `AREA.md` is in the reviewed diff. No lesson removal is in the diff. `learnings/LESSONS.md` was not used as review input.

## Test-Change trailers

The path rule in `src/test-files.ts` matches the changed existing `tests/door-reset.test.ts`. All three commits changing it have a trailer:

1. `652d5214`: `Test-Change: tests/door-reset.test.ts added superseded/record-unreadable/unreadable-at-queue cases and the attended docs assertions; extended the existing docs case; no existing expectation changed`
2. `97f47f8e`: `Test-Change: tests/door-reset.test.ts corrected a stale two-arg call in the refuses-when case; no expectation changed`
3. `58dd9496`: `Test-Change: tests/door-reset.test.ts prettier line wraps only; no expectation changed`

Accepted against the diff: the first adds brief criteria 1–4 cases and makes pi session fixtures readable under the new queue-time contract. Existing behavioral assertions remain. The second fixes the helper invocation's extra argument and leaves assertions unchanged. The third changes formatting only. No old assertion or recorded expected output is weakened or deleted.

## Nits

None.

## Operator actions

None. No required env values, paid calls or live mutations were used. The permission-denied reproduction used owned temporary fixtures and needs no operator permission change.

## Verdict

**fix** for F1 and F2. Request `check.repair` for slot B. The phase command owns aggregation and dispatch.

## 2026-10-26 check.repair

Starting head: `58dd9496686fba0109a3dbf6f888cb6841efbaba`.
Repaired head: `672a2ab513d80e9705e17cbb3f883f57153a258f`.

Read both initial reviews. A has no Fixes. B's F1 and F2 are repaired in separate commits. No locked design, live action, existing test expectation or proof command changed. No item is handed to A and no operator action remains. The review nits require no code changes, and B holds no reusable Nit to record.

### F1 repaired

- Reproduction commit `f500ceee19dfdf78b305cd5af1367c0cceaceb45`: one table-driven CLI reproduction with an existing mode-000 session file for claude, codex and pi. The inline execution used by the existing test helper exposes the missing stderr refusal and unwanted log directly. All three cases fail before the product fix and pass after it. No existing assertion changes.
- Fix commit `7399f151f7cb1797946c744deeda4216695961e7`: captures the boundary using `readFileSync(recordPath(...)).byteLength`. A successful read establishes readability and obtains the byte boundary in one operation. An unreadable file reaches the existing parent refusal before log creation or dispatch. Removed the now-unused stat import.
- Added one dated Implementation notes line to plan.md for the queue-time read required by brief What 2 and the design's parent-refusal interface. No other plan text changed.

Red and green evidence, read back with `akrogon log`:

- `check repair-B-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-repair-B-F1-red-1793013901906-1663611.log` — 3 fail because stderr is empty.
- `check repair-B-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-repair-B-F1-green-1793013919639-1775747.log` — 3 pass, including no log and no sends.
- `check repair-B-F1-parent: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-repair-B-F1-parent-1793014021893-2340285.log` — replayed the actual production parent path with inline/child overrides removed. For each harness: exit 1, stderr carries EACCES, empty stdout, no log and no prompts. This confirms the original review's detached-parent failure is repaired. All temporary fixture directories were removed.

The reproduction commit ends with:

`Test-Change: tests/door-reset.test.ts review-B F1 and brief criterion 3 require stderr refusal with no log for an existing unreadable session record; reproduce EACCES for claude, codex and pi`

### F2 repaired

Commit `672a2ab513d80e9705e17cbb3f883f57153a258f` corrects both created-peer paragraphs. Before, they asked for each created peer's kind and arguments. After, they ask for each created peer **except C**. C defaults to pi with empty argv, and operator-named kind or arguments still win. The remaining creation command, supplied-pane rules and failed-create behavior are unchanged.

Before/after diff evidence, read back with `akrogon log`:

`check repair-B-F2-commit: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-repair-B-F2-commit-1793013965383-2031371.log`

Reviewed both corrected paragraphs against the planned criterion 5 proof. No prose-string test was added. Criterion 6's final-shape paragraphs are unchanged and retain their earlier review evidence.

### Current proof results

Reran every affected planned criterion command on the committed repaired head. These include the original A-authored proofs, not only B's reproduction. All logs below were read back with `akrogon log`:

- `check crit1: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-crit1-1793013980267-2097392.log` — 9 pass.
- `check crit2: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-crit2-1793013982601-2106232.log` — 5 pass.
- `check crit3: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-crit3-1793013983094-2119556.log` — 5 pass, including the original two refusal cases and the three reproduction parameters.
- `check crit4: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-crit4-1793013983523-2122452.log` — 1 pass.

Full verification on the repaired head, run `008ed7fa-ed57-44bf-bf48-06cc9f4ccebb`, ended red. Format and typecheck pass. The full test run reports 1148 pass and 50 timeouts, principally in unchanged lifecycle-dispatch tests. No failing test is in door-reset.test.ts. The full leaf diff touches no dispatch source or failing test file, and none of its script changes is called by those dispatch paths. Host load was 89.50 when the result was checked and later rose to 126.13. This is an unrelated-red judgment, not a passing result. The same test command was retried without changing arguments, cases or timeout, in the leaf worktree at the identical committed head after the verify scratch checkout was removed. The retry reports 1157 pass and 41 timeouts. Neither run is green or classified inconsistent.

Initial verify logs, read back with `akrogon log`:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-format-1793013987613-2124853.log`
- `check test: 1 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-test-1793014201732-2124853.log`
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-typecheck-1793014229051-2124853.log`
- `check test-retry: 1 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-test-retry-1793014554448-3317028.log`

### Known-red judgment and stop

`akrogon verify --known-red` exited 1 with `verify known-red 672a2ab513d80e9705e17cbb3f883f57153a258f: fail`. It reused the completed head run above and completed base run `6dd05e5b-3261-4199-8232-08dc788960f4` on merge-base `c9b619c65cc287cf592431d898e88021334b1308`. Base format and typecheck reused green evidence. The fresh base test command reports 1150 pass, 25 timeouts, across 1175 tests and 69 files.

Base test evidence, read back with `akrogon log`:

`check test: 1 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-test-1793014774252-8372.log`

Read both complete test logs through `akrogon log` and compared their actual failed names. Both runners reached their normal test summaries and named real tests. Only 10 of the head's 50 failed names also fail on base. Forty are uncovered, including `the holder gets a batch record rebased onto the remote and only the holder is prompted`. The comparison therefore cannot establish the required causal fit for accepting a known-red receipt. I agree with its failing disposition and do not count any of these red runs as passing verification.

Comparison trace:

`check repair-B-known-red-judgment: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-repair-B-known-red-judgment-1793014823624-1127837.log`

F1 and F2 are fixed and committed, and all focused planned proofs pass. The configured full check remains red. No test timeout, runner setting, expectation or unrelated dispatch code was changed to make it pass. The worktree is clean at the repaired head. No live fixtures or temporary helper files remain from this repair.

Pass result: **failed verification**, not ready for merge. End the pass in `failed` with the recorded suite-timeout reason. Resume verification on the unchanged repaired head when the host can complete the configured test command. No Fix is handed to A.

## 2026-10-26 check.repair resumed verification

Resumed at unchanged head `672a2ab513d80e9705e17cbb3f883f57153a258f`, with a clean worktree. Both fixes and their previously green focused proofs remain valid. No code, test, timeout or runner setting changed in this resumed pass.

Operator-approved evidence supplied in the door on 2026-10-26: at this head, the operator reports that the 41 previously head-only failures (40 in tests/next.test.ts and one in tests/batch-dispatch.test.ts) pass in isolation. Command: `bun test tests/next.test.ts tests/batch-dispatch.test.ts`. Reported result: 277 pass, 0 fail in 29 seconds at load 28. The operator identifies concurrent pairs of full suites from fewer-repeat-calls as the source of host load. This is operator-supplied evidence, not a new run by B or a replacement for the configured full verify receipt.

The operator directed this pass to run the configured full verify only when 1-minute load is below 20, without changing tests or timeouts. Initial observed load was 37.02, then 39.81. Waited for that launch condition before rerunning `akrogon verify`.

At 2026-10-26T12:15:52.644194Z the 1-minute load measured 16.14599609375. Launched the unmodified `akrogon verify` immediately after that measurement on the same committed head. The configured format and typecheck members reused their passing results. The configured test member reran with the original arguments and timeouts.

Launch-condition evidence:

`check resume-B-load: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-resume-B-load-1793016952652-3738286.log`

### Resumed verification completed

`akrogon verify` exited 0 with `verify leaf 672a2ab513d80e9705e17cbb3f883f57153a258f: green`. Receipt `c80211a3-6eb3-43f4-95cc-05b8a0b3fd23` covers the unchanged repaired tree and configured command set, ending 2026-10-26T12:16:47.381Z. The full configured test command, `bun test --timeout=30000 --parallel=4 --no-isolate`, reports **1198 pass, 0 fail**, across 69 files in 54.31 seconds. Format and typecheck are both recorded exit 0, reused from the completed same-tree run `008ed7fa-ed57-44bf-bf48-06cc9f4ccebb`.

Current test evidence, read back with `akrogon log`:

`check test: 0 /home/ivan/Work/infra/akrogon/issues/open/door-cost/cost-rules/implementation/check-test-1793017007193-3738341.log`

The same full test command is now green on the identical head without any code, test or timeout changes. The earlier red runs are inconsistent observations under host contention. This fresh green receipt resolves the prior verification block without relying on the rejected known-red comparison or substituting the operator's focused run for full checks.

Final repair outcome: **ready**. F1 and F2 remain repaired by the three commits recorded above. Retained the unchanged green criterion proofs, added no commits in this resumed pass, and confirmed the worktree is clean. No Fix is handed to A, no operator action remains, and B holds no reusable Nit. Request the move to `merge`.
