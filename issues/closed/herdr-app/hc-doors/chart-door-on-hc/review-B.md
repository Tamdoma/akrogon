# Slot B review: chart-door-on-hc

Date: 2026-11-08
Base: e3202dff4cf2a660cb26004e1ef3d2e8af883193
Reviewed head: 064dd5239a7f1ecfa310b25a2bb5b93019ef7a31
Verdict: fix

Initial blind review. No peer review was read and no peer was contacted. No product or test files were changed, and no paid operation was launched.

## Fixes

### F1: The required transcript lookup still consumes consultant news before collection

Source: a door-created consultant finishes its first task without its return file/report, as real Claude consultants B and C did in `implementation/door-round/transcript-excerpts.txt` and `transcript-excerpts-2.txt`. The door follows `skills/chart-issues/SKILL.md:39`, which requires a transcript lookup after each start/restart, before the exchange has been collected.

Trace: `scripts/transcript.ts:12` calls `transcriptFor`; `src/transcript.ts:126` calls `terminal` even when the transcript label already exists; `src/hc.ts:270` executes `hc get --json <child>`. Thus the instruction in `assets/questions.md:60` to avoid consuming child news is bypassed by the mandatory seat-record operation. If the consultant has already stopped at that read, its unseen stop is consumed without the door receiving or handling its status.

Consequence today: the next children wait can sleep until its timeout before the first nudge, or before reporting a blocked/error/exited consultant. This is the same mechanism the implementation report's F2 and the recorded live repeat establish: reading C before the wait caused a 300-second stall. The preserved `door-round/hc-get-probe/` comparison records the second wake at 0 seconds without the read and 15 seconds (timeout) with it. Returning `-` from the transcript resolver does not prevent the read.

Hits: criterion 1's immediate child wake outcome and D4/D5's no-consumption collection contract. Existing exchange tests trigger stops after the wait begins and omit the required post-start transcript lookup, so they do not catch this reachable path.

Repair: reconcile transcript recording with unseen child news, including the indirect read. Keep the missing-file silent-consultant case at the actual start/record/wait boundary.

Additional diagnostic evidence is explicitly inconclusive: `check review-b-transcript-wake4: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-review-b-transcript-wake4-1794108534729-3710711.log` (read back with `akrogon log`) timed out in both its control and lookup setups. It does not establish the lookup's causal effect. F1 is grounded in the real consultant source, the complete call trace and the implementation's existing live comparison above, not that diagnostic. Earlier diagnostic iterations likewise supplied no isolated causal comparison. Temporary diagnostic code was deleted and every fixture core was stopped.

### F2: Criterion 2 has no attended proof of the final collection instructions

Source: commit `22e923c4` changes the model-facing Asking/Waiting instructions after both paid consultant rounds. The report explicitly says the corrected rule was not rerun. The recorded real door used `hc get`, including before the stalled second wait, rather than the final rule of using the wait JSON.

Consequence today: the only required real-door proof covers superseded instructions. Whether a real door can follow the final state/collection rule, issue exactly one missing-file nudge and then drop with kind/model remains unproven. The stand-in comparison proves hc behavior, not this model interaction.

Hits: criterion 2, its plan rerun trigger (“skill text change in collection or drop rules”), and standing-design's requirement to refresh a model stage when its instructions change. Green deterministic checks do not replace this attended criterion.

Repair: after the collection repair, rerun the smallest planned attended consultant round against the final instructions and retain its command, revision, nudge/drop record and cleanup evidence. Account for prior nine-session grant use before launch, using the skill's paid repeat-count warning rule where applicable. No new operation or target is requested by this finding.

## Verification

- Reused the existing completed verify receipt `9d65fd55-ce05-4505-a963-ba70e75449e2`. Its head `22e923c4` and reviewed head have the same tree `d5979340a945af6a50bab815f3c7e43081878314`; `064dd523` changes only commit-message trailers. Setup, format, typecheck and the configured full test command all exited 0. Read back the format/typecheck logs and test summary: 1161 pass, 0 fail, 80 files, 84.38 seconds. Baseline 75 seconds and the +9.4-second comparison are recorded in the report. No planned command, runner config, case or filter was removed after planning.
- Read back `check c1: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-c1-1794105679091-1664344.log` (6 cases), `check c3: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-c3-1794105683224-1680727.log` (6 cases), and `check c5: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-c5-1794105684162-1701238.log` (21 cases). The later full verify covers the latest versions of those tests and their helpers. Deliberate-break logs establish parent/wait-mode/rearm and reset guard failures. The all-to-any correction has the recorded O1 decision and keeps the observable wake cases, so that correction is accepted.
- Criteria 3/4: inspected reset code and three final per-kind helper logs, transcript comparison and start-prompt recordings. They establish ordering, warm-up completion, differing paths, label-before-prompt and the corrected plain-text start prompt. Criterion 5 keeps the recorded usage numbers. Criteria 6/7 have the recorded auto-mode start and window snapshots. Criterion 8 has its final scoped grep receipt and the outside-hc text.
- `check review-b-receipt-cleanup: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-review-b-receipt-cleanup-1794108552804-3712761.log`, read back, records the matching receipt/tree and physical absence of the throwaway socket, app-session directory and core-state directory.
- No full suite rerun was needed: the existing receipt covers this exact tree. No failed configured check, known-red disposition or abandoned review capture remains.

All relative evidence paths above are under this leaf.

## Documentation and path audit

Opened the changed behavior's live skill, questions, shapes, standing design, docs/reference/skills.md and affected AREA pages. Changes describe hc consultants, transcript paths and the reset helper. F1 concerns that live documented behavior.

`check review-b-area-listing: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-review-b-area-listing-1794108356871-3695157.log`, read back, lists the paths named by each of src/AREA.md, skills/AREA.md and tests/AREA.md from the repository root. All concrete source/test/skill pointers added or changed here exist. Missing entries are template paths, runtime/generated issue records absent from the worktree, or the unchanged installer mod destination. They establish no current dead-pointer consequence introduced by this leaf. Deleted peer-script pointers were replaced in skills/AREA.md. Wording outside the chart skill remains in the named herdr-sweep exclusion.

## Test-Change audit

Listed from `e3202dff..HEAD` in `check review-b-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-review-b-diff-1794108256593-3641375.log`, read back:

- `064dd523`: `Test-Change: tests/AREA.md added one Key files line naming tests/door-exchange.test.ts, tests/door-reset.test.ts and tests/door-agent.ts (implement-issue: update affected AREA.md files); no test expectation changed`. Accepted: affected-area documentation, no expectation changed.
- `b3bd8643`: four trailers, one each for `tests/peer-create.test.ts`, `tests/peer-ask.test.ts`, `tests/peer-wait.test.ts`, `tests/peer-restart.test.ts`, each citing brief “the five peer scripts ... and their tests are deleted”; tests removed behavior. Accepted as the explicit removal outcome, judged as a batch.
- `24695d05`: `Test-Change: tests/door-reset.test.ts brief "the handover reset (door-reset.ts) becomes one small helper on hc" and criterion 3; the herdr pane, peer-wait and session-id expectations test removed behavior and are deleted, replaced by the hc stage cases`. Accepted.
- `24695d05`: `Test-Change: tests/chart-usage.test.ts brief criterion 5 ("reads seats.yaml entries holding address, name, recipe and path") and design session-id 1a (paths, no ids); seats are written in the new shape with paths, the claude ambiguous-id seat is removed (lookup by id is removed behavior); no number expectation changed`. Accepted: only the obsolete ambiguous-id case and its count change disappear.
- `24695d05`: `Test-Change: tests/door-exchange.test.ts plan Q1 answer O1 (operator delegate 2026-11-08): the door's wait is --children any; added the re-armed wait case, no other expectation changed`. Accepted against O1 and its equivalent observable outcome.
- `784a20ca` adds a new file and requires no old-file trailer. No other changed old test path lacks its trailer under src/test-files.ts.

## Grant audit and remaining disposition

The launch records and timings account for six reset-tier processes, one Claude door and two consultants: nine harness sessions, matching the report's nine count lines. Reset sessions record four prompts each, consultants two each, and the door two. Paid starts are kept in c4-start/c4r2-start/c6-door-start; consultant starts and nudges are in the door's preserved excerpts. No unexplained additional paid launch or unwarned count overrun was found. The report labels the retained Claude project-trust entry separately and records cleanup. This review launched only isolated stand-in diagnostics, not a covered paid/live tier.

No Operator actions. No Nits. No lesson removal or changed lesson claim is present. The known hc read/news mechanism was already identified in the implementation artifacts, so this review adds no separate new reusable lesson.


## check.repair — 2026-11-08

Start: `064dd5239a7f1ecfa310b25a2bb5b93019ef7a31`.
Handoff head: `3ffe742209ea98e4c4293b3292e37d6beb8974ed`.
Base remains `e3202dff4cf2a660cb26004e1ef3d2e8af883193`. No refresh or test changes.

### Repaired instruction Fixes

- **A:F1**, commit `1e9fa3432283f13279c34ed8193e03a9974ca394`: ask once for every created consultant's model and effort. C still defaults to the pi harness. Before: “each created consultant except C, which defaults to pi with the lowest effort its template takes”. After: “the model and effort of every created consultant and for its harness except C, whose harness defaults to pi”. The start verb now receives explicitly supplied values, with no invented model/effort. This changes no locked design decision.
- **B:F1**, commit `3ffe742209ea98e4c4293b3292e37d6beb8974ed`: move the consultant transcript reads until every prompted consultant in the exchange is collected or dropped, including the first exchange after start/restart. Before: “after each consultant start or restart”. After: “After every prompted consultant in an exchange is collected or dropped”. The rule now states that the resolver's hc get consumes child news. This removes the triggering operation from the outstanding-exchange interval rather than adding a second status path.

Both are instruction fixes, each in its own commit, with before/after text evidence under the skill's docs/command Fix rule. No test of prose was added.

The earlier `22e923c4` repair missed the indirect hc get inside transcript.ts because it addressed only explicit status reads in Asking/Waiting. Root search covered every transcript.ts, hc get, start/restart and “once known” reference in the chart skill and its assets/scripts, plus the resolver/hc modules. Open held the one mandatory precollection consultant lookup. Other transcript reads describe A's own mode/handover identity or the seats.yaml shape; they do not require reading an outstanding consultant. The instruction repair therefore covers first start, restart and subsequent exchanges at their common collection boundary.

Evidence, all read back with akrogon log:

- `check repair-a-f1-after: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-repair-a-f1-after-1794108751695-3721481.log`.
- `check repair-a-f1-commit: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-repair-a-f1-commit-1794108757236-3721643.log`.
- `check repair-b-f1-sites: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-repair-b-f1-sites-1794108757370-3721755.log` (before text and complete reference search).
- `check repair-b-f1-after: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-repair-b-f1-after-1794108775710-3723039.log`.
- `check repair-b-f1-commit: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-repair-b-f1-commit-1794108775851-3723130.log`.
- `check repair-handoff-head: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-repair-handoff-head-1794108819484-3726973.log`: clean working tree, two commits, only two changed instruction paragraphs.

### Handed to A

- **A:F2 / B:F2**, criterion 2: missing current attended recording. The existing tools are the direct hc/start/send/wait commands already used by plan.md criterion 2 and `implementation/door-round/door-prompt.txt`; the missing case is the same real-door silent-consultant round on `3ffe7422` (or A's later final head). Use the existing prompt, final Open/Blind peer exchange instructions and cleanup, then preserve the door's one nudge, the second silent stop/drop with harness/model, and the consultant transcript excerpts. Include the delayed transcript-recording rule from repaired Open. This is the explicit check.repair exception: “A criterion whose proof lacks only a case, capture or recording that the existing runner and helpers can run goes under Handed to A”. No new machinery is missing. These instruction repairs still need that planned live proof before acceptance.

### Grant and operator-action disposition

Read all earlier count lines: prior use is nine harness sessions. This pass launched none, so use stays nine and there are no new terminal/session IDs, fixtures, retained resources or cleanup obligations.

A's OA1 asks for renewal solely because the paid session repeat count reached nine. The current Shared context rule explicitly permits a covered paid repeat-count overrun after a warning in the artifact and visible reply; readiness grants[0] has no spend cap and its stop_line does not make nine sessions a stop clause. OA1 therefore needs no separate operator grant renewal. Before any further paid launch A must record the count/warning and recheck operation, target, identity and all remaining bounds, effects and stop_line. This does not authorize a widened operation or a stop-type overrun. No open operator-only action remains.

### Verification and remaining work

Reran the exact planned criterion 8 command on the committed repaired head:
`akrogon run-check --name c8 -- sh -c "! grep -rnE 'herdr agent|herdr pane|HERDR_ENV|peer-create|peer-ask|peer-wait|peer-restart|peer-anchor' skills/chart-issues"`.
Result, read back: `check c8: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-c8-1794108837855-3784371.log`.

Criteria 1, 3, 4 and 5's code/tests/inputs, criterion 6's launch/settings contract, and criterion 7's placement contract are unchanged. Their earlier evidence remains applicable. Criterion 2's instruction input changed and its current attended proof is the handoff above. No claim is made that the earlier full verify covers this new tree. Under the check.fix route B runs no full verify; A must complete the current proof and verify before returning for review. No new reusable Nit is introduced.

## check.review re-check — 2026-11-08

Verdict: **ready**.

Prior reviewed base/head: `e3202dff4cf2a660cb26004e1ef3d2e8af883193` / `064dd5239a7f1ecfa310b25a2bb5b93019ef7a31`.
Handed-off and reviewed base/head: `d40c155648a5133f0223a64827dd64950c48f59e` / `f5d98e5c433a2ffddfecddedb4dd9ccb1c7557b2`.

### Scope and rebase

Computed the required range-diff myself:
`git range-diff e3202dff4cf2a660cb26004e1ef3d2e8af883193..064dd5239a7f1ecfa310b25a2bb5b93019ef7a31 d40c155648a5133f0223a64827dd64950c48f59e..f5d98e5c433a2ffddfecddedb4dd9ccb1c7557b2`.

Evidence, read back:
`check recheck-b-range: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-recheck-b-range-1794123735912-4147274.log`.

The first two test commits and the existing prompt/wait fixes are unchanged. The implementation commit changes only its AREA context at rebase: src/AREA.md preserves main's notice contract plus this leaf's transcriptByCode description, and tests/AREA.md preserves main's notice fixture description plus this leaf's door-test line. Reviewed those resolutions. Main's commits were not reviewed as repair.

Added repair commits are `4541b73e` (formerly `1e9fa343`), `1bcc0abe` (formerly `3ffe7422`), `59638e5d` (temporary timeout increase), and `f5d98e5c` (its exact reversal). The last two leave tests/hc-delivery.test.ts and tests/session-routing.test.ts byte-identical to base d40c1556. No assertion, fixture, runner configuration, test case or final timeout was weakened.

### Prior findings resolved

- **A:F1**: repaired Open explicitly asks for every created consultant's model and effort, retaining only C's pi harness default.
- **B:F1**: repaired Open defers all consultant transcript reads until the exchange is collected or dropped. The real rerun shows no hc get or transcript.ts call on B before the second stop/drop. The first wait returns immediately, and the second returns about two seconds after the nudge. This verifies the corrected ordering through a real door, in addition to the instruction fix's before/after evidence.
- **A:F2 / B:F2**: the current attended recording is present under `implementation/door-round/rerun-3ffe7422/`. Read its prompt, transcript excerpts and CHART.md. Door t3 starts consultant t4, observes the silent stop, sends one nudge naming the missing return file and report, observes a second silent stop, then records the drop with harness claude and model claude-haiku-5-5. Transcript lookup occurs after the drop. No permission denial is recorded. `git diff 3ffe7422 HEAD -- skills/chart-issues src/hc.ts src/seat.ts src/transcript.ts src/config.ts src/shell.ts` is empty, so this proof's product/model inputs remain current after rebase and the timeout revert.

No repair-introduced Fix or Nit remains. No Operator actions remain.

### Verification and grant audit

Accepted the completed verify receipt `806e4d86-984a-4486-81b4-c4a80a047a71` for this exact head and tree `821b102467e33f566a97ef00147244b055b88fff`. Setup, format, typecheck and the configured test command all exit 0. Read back the kept setup/format/typecheck logs and full-test summary:

- `implementation/check-setup-1794123542058-3614836.log`
- `implementation/check-format-1794123547051-3614836.log`
- `implementation/check-typecheck-1794123549846-3614836.log`
- `implementation/check-test-1794123669857-3614836.log`: 1165 pass, 0 fail, 81 files, 69.61 s. Timings record 69,677 ms for the test command. The report records this figure and the 75 s baseline.

The final green run is later than the timeout revert, runs all planned test files without filtering and needs no known-red exemption. Earlier red verify attempts do not stand in for this green receipt. Read the cited hc-shutdown-unit history: the report treats that host mechanism as an explanation supported by the subsequent green run, without retaining the ineffective timeout change. No lesson line is removed or retired by this repair.

Read back the final scoped grep evidence: `check c8: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-c8-1794123539317-3596510.log`.

Read back the current paid-run start, turn-end, terminal-cleanup and absence logs, including:
`check c2r3-door-start: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-c2r3-door-start-1794109040882-238217.log`;
`check c2r3-door-turn: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-c2r3-door-turn-1794109093788-300927.log`;
`check c2r3-absence: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-c2r3-absence-1794109130329-515967.log`.

The report counts launches 10 and 11 before launch, warns about the paid repeat-count overrun and keeps the same operation, target, identity, prompt limits and stop_line. Timings plus the door's recorded consultant launch account for these two additional harness processes. Total paid use is 11 against the warned bound of 9. No unexplained paid activity is shown. Cleanup records an empty terminal list and absent core/app/cwd/transcript resources; the retained Claude trust entry remains labelled separately.

Independent receipt, timing, changed-input, AREA-path and filesystem-absence evidence:
`check recheck-b-receipt-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-recheck-b-receipt-paths-1794123778118-4148581.log`, read back. The required throwaway socket, app-session folder and core state remain absent. Concrete source/test pointers in both conflicted AREA pages exist; the listing's missing template/runtime issue paths have no new dead-pointer consequence. The live Open/Blind peer exchange pages match the repaired behavior.

This re-check launched no covered operation and reran no test suite: the kept current proof and exact-head green receipt supply the needed evidence.

### Test-Change trailers in the repair

The original trailers retain the same sources and judgments under their rebased commits. Four additional trailers were inspected in the range/log evidence:

- `59638e5d`, tests/hc-delivery.test.ts: cites plan.md Operator decision 2, timeout-only changes to the two named cases, base-without-peer A/B and Tamdoma/akrogon#130.
- `59638e5d`, tests/session-routing.test.ts: cites the same decision and A/B for the one named case's timeout.
- `f5d98e5c`, tests/hc-delivery.test.ts: cites plan.md “Operator decision 2 withdrawn (2026-11-08 06:40, door t15)” and restores the original default 30 s timeouts.
- `f5d98e5c`, tests/session-routing.test.ts: cites that withdrawal and restores the original explicit 30000 ms timeout.

Accepted against the recorded authorization and withdrawal. The temporary change and its reversal are exact, and the final tree retains the original tests. The two instruction commits touch no test path. No additional Test-Change trailer is missing.

The latest verdict supersedes the historical initial fix verdict. No reusable Nit is held and no new lesson was found in this repair review.

## merge — 2026-11-08, attempt 03f44787-beaf-477e-925a-d4d6728fa295

Applied top: `75f61f001f0a1e2e3b98626b8ffad896f4736b21`.
Rebase target: `d97290ff02b7b4227201bd25c35ce698b46d6449`.
Prior reviewed head: `f5d98e5c433a2ffddfecddedb4dd9ccb1c7557b2`.
The worktree is clean at the command's applied top. B fetched/rebased nothing and made no commit.

Command-run red receipt: `676fd425-eba1-41e3-b13b-83bec3528c78`, merge scope, tree `ea1e1366ccde0a01a740844be242ac172c4b06e5`. Setup, format and typecheck passed. Failing command, exactly as invoked: `bun test --timeout=30000 --parallel=4 --no-isolate`. Kept log, read with akrogon log: `implementation/check-test-1794123941108-4157631.log`.

Failure: `tests/run-units.test.ts:989`, “a verify pass survives its caller being SIGKILLed mid-check and finishes like an uninterrupted run”. Its assertion `expect(existsSync(receipt.path)).toBe(false)` saw `true`. Summary: 1166 pass, 1 fail, 82 files, 69.47 s.

Cause judgment: no direct cause found in the leaf diff. The failing test and src/verify.ts, src/verify-pass.ts and src/shell.ts are unchanged from the rebase target. The test checks checkout absence as soon as a receipt has end; existing verify code writes the completed receipt before removing the checkout. The observed failure is consistent with that existing cleanup timing window. The leaf's changed transcript and chart-door paths do not own that removal.

Evidence, read back:
`check merge-b-red-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-merge-b-red-receipt-1794124020069-210652.log`;
`check merge-b-cause: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-merge-b-cause-1794124050654-211247.log`.

Integration inspection:
`check merge-b-rebase-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/chart-door-on-hc/implementation/check-merge-b-rebase-evidence-1794124084379-329111.log`, read back. The top descends from the recorded rebase target. Relative to the reviewed head, the new base carries watcher work. The chart skill, transcript resolver, seat launch, config and shell code are unchanged. src/hc.ts only adds a defaulted keep field and its optional Seen property; the reset/lookup/send/wait behavior and model-facing inputs are unchanged. Existing live proofs therefore remain applicable.

The first intake diagnostic had a quoting error, retained in `check-merge-b-intake-1794123997461-210142.log`; its recorded run completed with exit 1. B corrected the diagnostic and terminated only the two exact leftover processes of that invocation (PIDs 210141 and 210222, verified parent/child), not a test or verify run. No product file was changed and no abandoned capture resulted.

Per merge Shared endings, the one unchanged-head retry is `akrogon verify --attempt 03f44787-beaf-477e-925a-d4d6728fa295`, run `afd1458f-221b-4d96-a3db-c37f67ef9624`. Disposition follows below.

### Merge retry result

The unchanged-head retry `akrogon verify --attempt 03f44787-beaf-477e-925a-d4d6728fa295` completed green, receipt `afd1458f-221b-4d96-a3db-c37f67ef9624`, tested head `75f61f001f0a1e2e3b98626b8ffad896f4736b21`. Setup, format, typecheck and test exit 0. The full test command reports 1167 pass, 0 fail, 82 files, 69.39 s, including the previously failing caller-death/checkout-cleanup case.

Read-back logs:
- Red: `implementation/check-test-1794123941108-4157631.log`.
- Green: `implementation/check-test-1794124135226-211743.log`.
- Green format: `implementation/check-format-1794124063516-211743.log`.
- Green typecheck: `implementation/check-typecheck-1794124065759-211743.log`.

Disposition: **inconsistent** under merge Shared endings. No code or test was changed between the red and green runs. No known-red exemption or base-red filing is used. No paid operation was launched. Proceeding to merged --check on the same attempt and tested top.

Merge gates: `akrogon phase chart-door-on-hc merged --slot B --check --attempt 03f44787-beaf-477e-925a-d4d6728fa295` returned `ok` on the tested top. Gathered all six leaf briefs under completion owner epic herdr-app, including hc-doors' chart, watcher and notice briefs, before the final command-owned push.
