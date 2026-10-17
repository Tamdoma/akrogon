# Review B: door-reset

Date: 2026-10-17. Phase: check.review. Verdict: **fix**.

Base: `17d611718c20e9a04ae67a5e547ed3a28c3c716e`.
Reviewed head: `01cf9de156c72a1d5ef444cdb5f608a9fe6e771b`.

Read brief, design, plan, implementation report, installed check-issue skill and ponytail reference, repository lesson rule, affected skill/shape/guide pages, reference index and skills area. Debate is off, so there are no B position/rebuttal artifacts. No peer review was read. No AREA.md changes or lesson removals occur in the diff. Code was not changed or committed.

## Fixes

### F1: Require the matching start prompt before inheriting autopilot

`skills/chart-issues/SKILL.md:147` authorizes continuation solely because the latest mode entry is a handover. It never requires the incoming start prompt to match that entry, and never tells old A what the start prompt must contain.

Real source: an operator opens a fresh conversation on a chart left with a pending handover, without the helper's start prompt, for example after an unconfirmed reset. The new rule tells that session to append continuation and operate autonomously. This breaks the brief's attended-mode guarantee and design decision 3a. Design requires matching pane, handover time and next item from the start prompt, which also names the absolute skill path and chart folder. Add that condition and prompt construction to the actual skill. Preserve attended behavior when the prompt is absent or mismatched. Trace: contract-trace log below. The reported attended check followed a successful continuation, so it does not exercise a chart whose latest entry is still handover.

### F2: Parent returns success for a stale session with an existing transcript

`door-reset.ts:75–85,165–183` uses `heldBefore` to queue a detached child despite a session mismatch. A transcript's existence does not identify which pane held it, and is not an exception permitted by C2 or the design's parent interface.

Scenario named by C2: passed session differs from the live pane session, while the old transcript still exists. The production parent returns 0 and `queued`, creates a log, and only its detached child reports `identity changed`. The caller receives success instead of immediate refusal. The existing inline test at `tests/door-reset.test.ts:191` hides the production exit behavior and expects the forbidden log. Remove the exception, restore immediate non-zero refusal with no log, and correct that expectation through A under the test-expectation repair rule. Test an identity change after initial validation separately if needed.

Reproduction through the real parent entrypoint and fake-herdr, without `DOOR_RESET_INLINE`: `check review-B-mismatch-parent: 0 implementation/check-review-B-mismatch-parent-1792259107854-2755264.log`, read back with `akrogon log`. Output: `parent_exit: 0`, `parent_stdout: queued`, log result `identity changed`, zero prompt calls. Probe fixtures and temporary script were deleted. This is proof of the C2 scenario, not a passing product assertion.

### F3: Codex start prompt can be sent while the check turn is working

`door-reset.ts:138–147` waits only for the check prompt to start working, then waits for a new session id and immediately sends the start prompt. It never waits for idle/done as the binding design's interface step 4 requires.

Real source: the helper's own `Reply OK` exchange exposes a new Codex session while the reply is still being generated. Session existence proves the reset, not completion of that exchange. The start prompt can therefore reach a busy Codex process and stall/refuse, preventing continuation. The readiness proof explicitly records that Codex refused a reset while busy. `tests/fake-herdr.ts:259` additionally removes the prior working-pane rejection, so the new happy-path test accepts precisely this sequencing error rather than catching it. Implement the design's wait before starting chart work, with bounded failure logging and no prompt retry, and retain a test that would detect a start prompt arriving during that check turn. Trace: contract-trace and proof-inputs logs below. The missing step is a design requirement, not a new feature.

### F4: C1 live evidence does not establish the required handoff

The report's Claude C1 entry explicitly says the second chart folder was created by the **new** session. C1 and the binding next-folder decision require old A to create INTAKE.md and CHART.md, including the handover mode entry, before reset. This required outcome therefore has not passed. The report nevertheless says there are no unverified criteria.

The retained Claude outgoing `seats.yaml` also has an unclosed span and the second chart has no retained seats file. Pi's second-chart seats file records `opened: 17:28:20Z` and the old A session, before the new session at `17:28:31.702Z`, contrary to the design's fresh-A entry ownership. These records do not substantiate the claimed compliant live run. The retained reset logs and continuation entries prove useful subsets, but do not replace the complete C1 scenario.

Use the planned existing herdr/harness/scratch-repo tools to record the missing C1 outcomes after the skill/helper fixes: second folder absent initially, creation and handover by old A before reset, outgoing span closure, fresh A's entry records and second-chart start, unchanged process/pane/layout, and the attended check. Correct the report's proof claims. This is missing proof using existing machinery, so it belongs with A under the repair split, not a missing-machinery stop. Trace: `check review-B-live-evidence: 0 implementation/check-review-B-live-evidence-1792259044209-2732537.log`, read back with `akrogon log`, plus report lines 38–48 captured in contract-trace.

### F5: Required C3/C5 outcomes have no detecting test or deliberate-break evidence

The new suite has only a completed-turn Codex happy path. It has no case where the last Codex task is still open at the bound, or where an older completed task precedes the current open task. The existing peer-wait tests exercise `codexEnded`, while the helper implements and calls a separate `codexTurnOpen`, so those tests cannot catch its failure. C3 explicitly requires this outcome for Codex. The suite also has only stalled **start** prompt coverage, with no stalled Codex **check** prompt case for C5.

Add the missing scenarios at the existing CLI/fake-herdr boundary and record current runs through the planned commands. Provide the design-required deliberate break that makes the relevant new-behavior tests red, followed by green restoration. The recorded pre-implementation run with an absent helper is not evidence that removing an individual gate would fail its test. These missing cases/recordings use existing helpers and belong with A under the repair split. Trace: complete suite and report inspected in contract-trace/proof-inputs; existing green targeted log read back as listed below.

## Verification

Kept commands below were read back with `akrogon log` before citation. Paths are relative to this leaf unless absolute.

- Existing `check door-reset: 0 implementation/check-door-reset-1792257560641-1486218.log`: 12 tests pass. The subsequent test edit was formatting only. The complete required test run below occurred after that edit.
- Existing `check peer-wait-reg: 0 implementation/check-peer-wait-reg-1792257583222-1487328.log`: 35 tests pass.
- Existing verify check logs: `check format: 0 implementation/check-format-1792257735680-1999768.log`, `check test: 0 implementation/check-test-1792257885438-1999768.log` (1043 pass, 0 fail), `check typecheck: 0 implementation/check-typecheck-1792257887574-1999768.log`. The report records `akrogon verify` green on `df41b94b`; later commits add commit-message citations only. No source, helper, fixture or runner changed after that green run. No full-suite rerun was needed for this review.
- `check review-B-artifacts: 0 implementation/check-review-B-artifacts-1792259036091-2729607.log`: head, commit messages, live docs, turn readers and readiness proof.
- `check review-B-contract-trace: 0 implementation/check-review-B-contract-trace-1792259063475-2738538.log`: numbered helper/skill/test excerpts and report claims.
- `check review-B-proof-inputs: 0 implementation/check-review-B-proof-inputs-1792259116315-2758209.log`: parser contracts, prior fake-herdr behavior, test-formatting commit and worker contract.
- Setup before the dependency-using parent probe: `check review-B-setup: 0 implementation/check-review-B-setup-1792259098241-2749380.log`, locked `bun install --frozen-lockfile`, no dependency changes. The first `review-B-mismatch` attempt passed Python on stdin, which run-check did not forward, so its empty log is not evidence. The subsequent file-based parent probe above is the actual reproduction.

The existing required checks are green. The verdict is fix because of the behavioral, contract and criterion-proof defects above, not a failing suite. No live resources were created or mutated during review. No operator-only actions were identified.

## Test-Change trailers

- `d9ff4316`: `Test-Change: tests/fake-herdr.ts door-reset criterion C4/C5 — agent prompt accepts prompts without wait flags and promptScript session effects; no existing expectation changed`. C4/C5 support plain reset prompts and simulated session effects. The diff also weakens the existing working-pane guard, which this citation does not justify and which masks F3.
- `01cf9de1`: `Test-Change: tests/door-reset.test.ts prettier formatting only, no expectation changed`. Checked against `df41b94b`: formatting only, accepted. The trailer is in a later message-only commit rather than the formatting commit, but the cited edit is unambiguous and adds no functional concern.

## Nits and operator actions

None.

## 2026-10-17 check.repair

Read both initial reviews, brief, design, plan and implementation report again. Starting head was the reviewed `01cf9de156c72a1d5ef444cdb5f608a9fe6e771b`; no intervening repair or rebase occurred. A reported no Fixes. No additional Nits are held by B.

### F1 repaired

Commit `7a767b6dda418fe6fc038aba0271a481b5594b97` changes only the handover paragraph in `skills/chart-issues/SKILL.md`. Old A must supply the pane, handover time, next handed item, absolute chart folder and absolute skill path in the start prompt. Fresh A must match that prompt to its pane, next item and the chart's latest handover entry/time. Missing or mismatched start prompts start attended. The plan's Implementation notes contain the required dated line citing the existing brief/design requirement; no locked decision changed.

Before: continuation was granted to “The fresh session whose latest mode entry is that handover”. After: “The fresh session continues only when that prompt names its pane and next item and matches the latest handover entry and time”. This closes the documented authorization gap without altering the existing attended-mode paragraphs. No behavior test was written for this docs-only correction.

Evidence, read back with `akrogon log`:

- `check repair-B-F1-evidence: 0 implementation/check-repair-B-F1-evidence-1792259253019-2801680.log`: before/after diff.
- `check repair-B-F1-docs: 0 implementation/check-repair-B-F1-docs-1792259253324-2801869.log`: planned `bun test tests/door-reset.test.ts -t docs`, 1 pass. This pre-existing proof was not written by B. Semantic inspection confirms prompt fields, matching condition and attended outcome. Complete runtime acceptance remains subject to F4's integrated C1 proof.
- `check repair-B-F1-commit: 0 implementation/check-repair-B-F1-commit-1792259260951-2804128.log`: isolated docs repair commit.

### Handed to A

- **F2 — test-expectation correction:** strict parent refusal contradicts the current `a session change before the reset sends nothing` test, which seeds the mismatched session before validation yet requires an `identity changed` log. A must remove `heldBefore`, restore immediate parent refusal, correct that expectation, and cover a genuine post-validation identity change separately. The product/test correction stays together with A rather than handing off a deliberately failing branch.
- **F3 — test-fixture/expectation correction:** the existing Codex happy-path fixture supplies only `promptScript: [{ session: 'sess-new' }]`; each fake prompt sets status to working and its empty waitScript never returns idle/done. A correct idle/done wait therefore contradicts that fixture's expected success. A must correct the fixture, repair the helper's missing bounded wait, and add fail-before/pass-after reproduction coverage. This correction includes the existing fake-herdr working-pane guard discussed in F3. The missing step already exists in design interface step 4; append its dated plan Implementation note before implementation. Trace: `check repair-B-contracts: 0 implementation/check-repair-B-contracts-1792259214533-2789225.log`, read back with `akrogon log`.
- **F4 — missing C1 case/capture with existing tools:** repeat the planned live herdr/harness/scratch-repo scenario on the final repaired head, capturing old-A second-folder creation and handover before reset, closed outgoing span, fresh-A entry records and second-chart start, unchanged process/pane/layout, plus attended behavior without the start prompt. Existing machinery is sufficient. Correct the implementation report's unsupported complete-proof claims. B made no live calls or grant changes.
- **F5 — missing C3/C5 cases and recordings with existing CLI/fake-herdr tools:** add Codex current-open-turn and old-complete/current-open scenarios, stalled check-prompt coverage, and deliberate-break red/green evidence. Use the planned commands and record runs after the final helper/fixture edits. No missing proof machinery was identified.

F2/F3 meet check-issue's exception for “any correction of a test expectation”. F4/F5 meet its handoff for a criterion whose proof “lacks only a case, capture or recording that the existing runner and helpers can run”. No operator action is currently open.

### Verification and destination

Only the skill's handover paragraph changed. The planned C6 docs proof was rerun. Helper logic, turn readers, fixtures and test source remain unchanged, so their earlier green targeted proofs remain applicable to unchanged inputs, subject to the unresolved findings above. C1's runtime proof must be refreshed by A under F4 because its skill input changed.

`akrogon verify` on committed head `7a767b6dda418fe6fc038aba0271a481b5594b97` completed red: format and typecheck passed, but one unrelated elapsed-time assertion failed. The required one retry of the same unfiltered test command passed. Disposition: **test inconsistent**, with both results retained, not a green verify receipt. No merge checks are configured or run. Destination is check.fix for A's four remaining findings, not merge.

- `verify format: 0 implementation/check-format-1792259263244-2804286.log` and `verify typecheck: 0 implementation/check-typecheck-1792259421138-2804286.log`, read back with `akrogon log`.
- `verify test: 1 implementation/check-test-1792259418629-2804286.log`, read back with `akrogon log`: `overview reads multiple repos outside git, retains hierarchy and recorded fields without writes` expected `0h 23m`, received `0h 22m` at `tests/status.test.ts:151`; 1042 pass, 1 fail.
- Causal review: `check repair-B-red-cause: 0 implementation/check-repair-B-red-cause-1792259435720-3275507.log`, read back with `akrogon log`, records the full leaf changed-file list and the test's wall-clock timing fixture. No status implementation, status test or timing logic is touched. The sole repair changes skill prose. No plausible causal connection to that assertion was found.
- Exact test-check retry in the leaf worktree, unchanged head and scope: locked frozen install, `akrogon guard own-modules`, then `bun test --timeout=30000`. `check repair-B-test-retry: 0 implementation/check-repair-B-test-retry-1792259590018-3275657.log`, read back with `akrogon log`: the same status test passes, 1043 pass, 0 fail. No filter, skipped tests, source edit or second retry was used. Under the skill's retry rule the check is inconsistent and no known-red run is required after a green retry. A must verify its final repaired head before returning to review/merge.

## 2026-10-17 check.review after check.fix, round 1

Verdict: **fix**, solely for the still-open **F4**. No new blocking findings.

Prior reviewed base: `17d611718c20e9a04ae67a5e547ed3a28c3c716e`.
Prior reviewed head: `01cf9de156c72a1d5ef444cdb5f608a9fe6e771b`.
Current reviewed head: `ddbe18bf2d47c4344c8108fdaf3c897f880af6cd`.

Reviewed only the repair range `01cf9de1..ddbe18bf`, including B's F1 commit, A's reproduction/fixture changes, helper fixes and test-helper signature correction. The report records no branch refresh or rebase; this is a direct descendant repair range, so no refreshed-range comparison is needed. Re-read brief, design, plan, report, skill references and affected documentation. No code changes or commits were made in this review. No AREA.md or lesson changes occur in the repair.

### Earlier findings

- **F1 resolved at the specification:** the skill requires the matching start prompt and specifies its fields. Runtime acceptance remains part of F4.
- **F2 resolved:** `heldBefore` is removed. The parent rejects every unsupported kind or mismatched session before opening the log or entering the inline/detached child path. The added transcript-present mismatch case is red before the fix and green after. The old contradictory test now changes the session during the actual turn wait, retaining the intended C3 coverage.
- **F3 resolved:** Codex now runs the bounded `herdr agent wait --until idle --until done` after the check prompt and before session confirmation/start. A timeout logs `turn open`; other wait failures preserve code/stderr and stop. The fake's non-idle guard is restored, its fixtures model reset returning idle, and the happy path plus timeout case detect removal of the wait. The new live Codex log shows check prompt at `18:08:00.644Z`, idle at `18:08:04.554Z`, session confirmation and then start at `18:08:05.161Z`.
- **F5 resolved:** current tests cover both Codex open-turn scenarios, stalled check prompt, check-turn timeout and identity change during the wait. Deliberate removal of the Codex open-turn gate and check-end wait produces the recorded red tests; restored code passes the complete 17-test file and final required checks. No required test was disabled or filtered out of the final run.

### F4 remains Fix: C1's unattended Claude handoff did not pass

The repair report explicitly states that fresh Claude required an operator correction before continuing, needed repeated nudges, and left the second chart incomplete. C1 requires the fresh session to record continuation with its own session id and start the second chart **with no operator input**. Calling this a model fidelity limitation does not satisfy that required outcome.

The retained artifacts independently show the identity problem: the latest Claude helper log confirms new session `f27ca408-8f3e-4174-a1e4-dc3ed475ab57`, while both copied `continue autopilot` entries and seats records still name old session `4f82223b-30b9-44c8-b9db-f14c904507e9`. The Claude seats records also have no closed outgoing span or fresh-session entry. The separate attended capture is for Pi, so it does not prove C1's required Claude attended case on the repaired skill.

This is the original F4 acceptance failure, not a new review requirement or an operator-access finding. The real source is the planned live three-harness run; the current consequence is that the Claude path stops for operator input and its continuation record identifies the wrong session. It fails brief criterion 1 and the design's continuation/seat/span contracts.

Complete the same planned live proof using existing machinery and correct the implementation report's original “Unverified criteria: None” and compliant-run claims. Keep useful Codex/Pi evidence, but provide the missing Claude outcome without an operator correction, with the fresh id in the record and the required attended check. Record final-head evidence for the next-folder and span/seat requirements already identified in F4. Do not waive the criterion or add machinery. If this returns to B for repair with only missing cases/captures remaining, F4 follows the existing Handed to A proof-case rule.

Trace: `check recheck-B-live-records: 0 implementation/check-recheck-B-live-records-1792262389556-2157711.log`, read back with `akrogon log`, captures `sessions.txt`, `chart-records.txt`, reset logs and the attended screen from `live-evidence-fix/`. The report's Repair round 1 entry supplies the explicit operator-intervention outcome.

### Proof and source review

All cited logs were read back with `akrogon log`.

- `check recheck-B-repair-diff: 0 implementation/check-recheck-B-repair-diff-1792262382454-2155436.log`: full repair diff, head and commit messages.
- `check recheck-B-contracts: 0 implementation/check-recheck-B-contracts-1792262407483-2163662.log`: current skill/shape/guide, helper wait sequence, timeout parser and readiness record. Documentation changes are confined to the F1 authorization correction; no other documented behavior changed in the repair.
- `check repair-tests-red: 1 implementation/check-repair-tests-red-1792259850278-3999107.log`: transcript-present mismatch, missing wait happy path and check-turn timeout fail before the helper fixes.
- `check break-codex-open: 1 implementation/check-break-codex-open-1792260029119-258098.log`: both required open-turn variants fail with the gate deliberately broken.
- `check break-check-wait: 1 implementation/check-break-check-wait-1792260042681-260635.log`: Codex happy path and check-turn timeout fail with the wait removed.
- `check door-reset-fix: 0 implementation/check-door-reset-fix-1792260046534-261545.log`: 17 pass after restoring the helper. The later `ddbe18bf` edit corrects only the Setup.run type signature; the complete verify test below runs after it.
- `check peer-wait-reg: 0 implementation/check-peer-wait-reg-1792260020306-152017.log`: 35 pass.
- Final verify evidence on reported head `ddbe18bf`: `verify format: 0 implementation/check-format-1792260063719-349487.log`, `verify test: 0 implementation/check-test-1792260235782-349487.log` (1048 pass, 0 fail), and `verify typecheck: 0 implementation/check-typecheck-1792260239973-349487.log`. These are current after the final test/helper/fixture edits. No rerun was needed to judge the explicit remaining live failure.

Repair Test-Change trailers:

- `054ea9d5`, `tests/fake-herdr.ts`: cites F3, restoring the non-idle guard and allowing promptScript status. Accepted against the busy-check source and design's idle/done requirement.
- `054ea9d5`, `tests/door-reset.test.ts`: cites F2/F3/F5. The changed mismatch expectation follows strict C2 refusal, and the corrected happy-path fixtures follow reset/check completion. Missing-case additions preserve existing regression coverage. Accepted.
- `ddbe18bf`, `tests/door-reset.test.ts`: type signature for the new extraEnv argument, with no expectation change. Accepted against the diff. Earlier trailers remain assessed above.

No Nits, operator actions, live mutations or reusable lesson writes in this re-check. Required checks pass, but F4 still blocks merge. Requested destination: check.repair.

## 2026-10-17 check.repair after round 1 re-check

Head remains `ddbe18bf2d47c4344c8108fdaf3c897f880af6cd`, with a clean worktree and no changes since the latest review. Re-read skill/references, brief, design, plan, report and latest B re-check. Only F4 remains open; F1–F3 and F5 stay resolved. No product defect requiring a new code repair was isolated by the latest finding. No files in the worktree were changed or committed during this pass.

### Handed to A

- **F4 — C1 missing live case/capture using existing machinery:** use the planned herdr panes, harness CLIs, scratch repositories and existing helper to record the required Claude handoff without operator correction, with continuation under the fresh session id and second-chart start. Capture the previously required old-A next-folder creation, outgoing span closure, fresh-A seat/span records and unchanged process/pane/layout. Run the Claude attended case without the start prompt; the retained Pi attended capture does not substitute for it. Correct the report's unsupported complete-proof claims. This meets check-issue's handoff rule: “A criterion whose proof lacks only a case, capture or recording that the existing runner and helpers can run goes under `Handed to A`”. There is no missing machinery, new live scope or operator-only action identified here.

The earlier attempt did not close F4 because it accepted an operator-assisted Claude continuation with the old session id as a completed unattended proof. The next proof must exercise the actual criterion and retain its observed outcome; another description of model limitations does not close it. No known root-cause code change is prescribed without evidence.

Evidence: `check repair-B-F4-handoff: 0 implementation/check-repair-B-F4-handoff-1792262477812-2185612.log`, read back with `akrogon log`, confirms the unchanged head/worktree and captures the latest F4 finding and report's intervention outcome. Current-head green verification (1048 tests, format and typecheck) is already recorded in the preceding re-check. No source, proof inputs or configuration changed in this pass, so those results are retained without a duplicate verify run. No live resources were touched, Nits held, or lessons written. Destination: check.fix for F4's proof and report correction.

## 2026-10-17 check.review after check.fix, round 2

Verdict: **fix**, with **F4 narrowed to the next chart's seat-record ownership/open time**. No new blocking findings. F1–F3 and F5 remain resolved.

Base remains `17d611718c20e9a04ae67a5e547ed3a28c3c716e`. Prior reviewed head: `ddbe18bf2d47c4344c8108fdaf3c897f880af6cd`. Current reviewed head: `e4aede1ebf2b7820a248101b76d650170f311396`.

Reviewed only `ddbe18bf..e4aede1e`: the mode-record session-source clarification, its literal API-field assertion, formatting and message-only trailer commit. No refresh/rebase is recorded, so no range-diff is required. Re-read brief, design, plan, report, latest review and skill references. No code changed or committed during review.

### F4 progress accepted

The corrected Claude run confirms the reset to `3499bf6c-0bd3-4a34-8b54-10c85fa98cd8` at `19:15:46.330Z`; both continuation entries use that real id at `19:16:08Z`. The outgoing span closes at `19:15:02Z`. Chart 2 has the requested destination, fresh-session entry and a completed fresh-session span. The report records zero operator corrections and old-A folder/handover preparation. The separate Claude capture says `Mode: Attended` and asks the operator, satisfying the previously missing attended case. Those earlier objections are closed; the failed/discarded attempts are not used as successful proof.

The new shapes guidance correctly gets session ids from live `agent_session.value`. The new literal API-field assertion and the Test-Change trailers in `2ca0721f` and `e4aede1e` are consistent with that source correction. Remaining formatting changes are whitespace and equivalent YAML flow spacing; no additional contract change was found.

### F4 still open: chart 2 is recorded as opened before fresh A enters

The retained `live-evidence-fix2/claude/readme-title-scratch-pad/seats.yaml` has:

```yaml
opened: '2026-10-17T19:15:02Z'
```

Its first seat is old A (`7b890562-ee7f-4025-a145-1cb45210786b`), followed by fresh A. Its first actual work span begins at `19:16:08Z`, after reset. Thus the next chart's recorded opening still predates the fresh session and its first span.

The binding design's **Next chart folder** decision says: “The fresh A writes its seats.yaml and opens its first span on entry”. Old A creates INTAKE.md and CHART.md before handover. The prior F4 finding already required this fresh-A entry ownership; this is its remaining part, not a new acceptance condition. The real source is this latest live handoff. Its consequence today is an incorrect chart-opening/seat record, despite the reset and continuation succeeding.

The skill's generic Open rule still says to write seats.yaml on folder creation, while the handover paragraph only specifies old-A folder creation and prompt matching. It does not state the design's handover-specific seat-record ownership. The live result follows that unresolved distinction. Clarify that one boundary from the existing design and capture an actual handoff where fresh A creates the next chart's seat record with its entry time and first span. Do not fix only the copied evidence. Existing Codex/Pi captures also carry pre-reset `opened`/old-A entries, so this ownership concern is not unique to the latest Claude model. Preserve accepted reset/continuation/attended evidence and limit the remaining proof to this boundary on the final skill text.

Evidence, read back with `akrogon log`:

- `check recheck2-B-live: 0 implementation/check-recheck2-B-live-1792265247250-1624898.log`: copied charts, both seat records, helper reset log, sessions listing and Claude attended screen.
- `check recheck2-B-seat-contract: 0 implementation/check-recheck2-B-seat-contract-1792265264537-1672274.log`: existing Open/shape seat rules and the latest review's carried F4 scope.
- `check recheck2-B-diff: 0 implementation/check-recheck2-B-diff-1792265238245-1594413.log`: repair range, exact head, commit messages and evidence inventory.

### Verification

Current required check logs, read back with `akrogon log`: `verify format: 0 implementation/check-format-1792265021882-475614.log`; `verify test: 0 implementation/check-test-1792265203376-475614.log` (1048 pass, 0 fail); `verify typecheck: 0 implementation/check-typecheck-1792265206127-475614.log`. These follow the changed assertion and shapes formatting. `check door-reset-fix2: 0 implementation/check-door-reset-fix2-1792264393055-141753.log` records 17 passing targeted tests; `check shapes-session-id: 0 implementation/check-shapes-session-id-1792264389490-139904.log` records the planned docs case. No test was skipped or disabled in the final required run. No repeated checks were needed for this artifact/contract comparison.

No Nits, operator actions, live mutations or lesson writes. No AREA.md or lesson retirement changes. Required checks pass. Requested destination: check.repair for the remaining F4 boundary.

## 2026-10-17 check.repair after round 2 re-check

Starting head: `e4aede1ebf2b7820a248101b76d650170f311396`. Only F4 remains open. Re-read skill/references, brief, design, plan, implementation report and latest B finding before acting. F1–F3 and F5 remain resolved.

### F4 guidance repaired at the source

Commit `dc4e5590f7212b896aa7855ef2f60b6a6689daaf` adds one paragraph to SKILL.md's Autopilot section. For a newly pre-created handover chart, fresh A owns initial seats.yaml creation; opened and the first span start at entry and the first A seat uses the live session id. The paragraph explicitly overrides the generic Open folder-creation rule and preserves the existing opened time for an already-open chart. A dated plan Implementation note cites the existing design requirement. No locked contract, helper, test expectation or unrelated file changed.

The earlier repair missed this because it fixed where a session id comes from, while leaving the independent question of who first creates the record governed by the generic folder-creation rule. Search across chart skill, shapes, human guide, scripts and src found that instruction in Open; the shape/guide define the same first-pass meaning of opened, and chart-usage only reads the record. No second automatic seat-record writer was found. The handover-specific paragraph resolves this at the common workflow rather than adding a timestamp repair to each harness.

Before: the handover instructions created the next folder without excluding the generic “written to `<chart>/seats.yaml` when the chart folder is created” rule. After: “defer `seats.yaml` creation to fresh A, overriding Open's folder-creation rule”. The prior live evidence remains the observed failing C1 boundary; copied records were not edited to make it pass. This is a docs correction with quoted before/after evidence, not a claim of new live red/green proof.

Evidence, read back with `akrogon log`:

- `check repair-B-F4-seat-search: 0 implementation/check-repair-B-F4-seat-search-1792265357148-1770153.log` and `check repair-B-F4-seat-writers: 0 implementation/check-repair-B-F4-seat-writers-1792265370936-1812574.log`: all relevant instruction/read sites and the new override.
- `check repair-B-F4-seat-diff: 0 implementation/check-repair-B-F4-seat-diff-1792265357268-1770223.log`: before/after and whitespace check.
- `check repair-B-F4-seat-docs: 0 implementation/check-repair-B-F4-seat-docs-1792265357526-1770364.log`: pre-existing planned `bun test tests/door-reset.test.ts -t docs`, 1 pass. Semantic review confirms first-entry ownership and existing-record preservation. No prose assertion or other test was added by B.
- `check repair-B-F4-seat-commit: 0 implementation/check-repair-B-F4-seat-commit-1792265360407-1771178.log`: isolated docs repair commit.

### Handed to A

- **F4 remaining C1 proof case/capture:** use the existing planned herdr/harness/scratch-repo tools on the final skill text to capture the new-chart record boundary. Old A prepares INTAKE.md/CHART.md and queues handover without creating seats.yaml for the new chart; fresh A creates it with its live session id, opened at its entry and the first span beginning then. Retain the actual pre-reset absence and post-entry record, not edited copies. Preserve already-accepted continuation and Claude attended evidence. This is the existing rule for a proof that “lacks only a case, capture or recording that the existing runner and helpers can run”. No new machinery or wider live scope is required. Update the implementation report to distinguish the repaired guidance from the still-needed final proof.

No live mutations, operator actions or reusable Nits in this pass. Helper/tests/fixtures are unchanged, so their current targeted evidence is retained. The docs proof was rerun because its input changed. `akrogon verify` on committed head `dc4e5590f7212b896aa7855ef2f60b6a6689daaf` finished red in an unrelated concurrent-notification test; the required same-command retry passed all 1048 tests. Disposition: **test inconsistent**, preserving both results rather than claiming a green verify receipt. Destination: check.fix for the remaining capture, not merge.

- `verify format: 0 implementation/check-format-1792265362557-1771271.log` and `verify typecheck: 0 implementation/check-typecheck-1792265526235-1771271.log`, read back with `akrogon log`.
- `verify test: 1 implementation/check-test-1792265522710-1771271.log`, read back with `akrogon log`: 1047 pass, 1 fail. `two simultaneous base runs produce one notification` at tests/verify.test.ts:765 expected child exits `[0, 0]`, received `[1, 0]`.
- Causal review: `check repair-B-F4-seat-red-cause: 0 implementation/check-repair-B-F4-seat-red-cause-1792265536127-2316520.log`, read back with `akrogon log`, captures the full leaf changed-file list and the fixture's two parallel verify calls. No verify implementation, fixture or test is changed by the leaf; its fake-herdr changes concern prompt/session handling rather than this notification path. The current repair changes skill prose only. No plausible cause in the diff was identified. Retry uses the exact unfiltered test check (locked setup, own-modules guard, `bun test --timeout=30000`) on the unchanged head.
- `check repair-B-F4-seat-test-retry: 0 implementation/check-repair-B-F4-seat-test-retry-1792265701129-2316746.log`, read back with `akrogon log`: the same concurrent-notification test passes, 1048 pass, 0 fail. No source edits, skipped tests or additional retry. The green retry takes the inconsistent disposition under the skill; no known-red run is required. A must verify its final proof/report handoff head as usual.

## 2026-10-17 check.review after check.fix, round 3

Verdict: **ready**. F4 is resolved. F1–F3 and F5 remain resolved. No open Fixes, Nits or operator actions.

Base: `17d611718c20e9a04ae67a5e547ed3a28c3c716e`. Prior reviewed head: `e4aede1ebf2b7820a248101b76d650170f311396`. Reviewed head: `dc4e5590f7212b896aa7855ef2f60b6a6689daaf`.

Re-read the skill/references, brief, design, plan, report and latest review. Reviewed only the repair range `e4aede1e..dc4e5590` and the new F4 capture. The only worktree change is B's already-recorded handover seat-creation paragraph, matching the locked design. A made no further code change, branch refresh or rebase, so no range-diff or new Test-Change trailer assessment is needed. No AREA.md, test source or lesson changes occur in this range. No code was changed or committed in this review.

### F4 closed

The new report records old A preparing INTAKE.md/CHART.md without seats.yaml before handover and zero operator corrections. The retained live records now agree with the fresh-entry contract:

- The helper confirms fresh Claude session `c815573f-911c-497e-ad72-7401eb570177` in pane `w8:pTG` at `19:40:58.624Z` and sends the start prompt afterward.
- Both charts' continuation entries use that real fresh session id and the matching handover reference.
- The new chart's seats.yaml contains one A seat, belonging to that fresh session. Its `opened` and first span `from` are both `2026-10-17T19:43:26Z`, after reset. The old session is no longer recorded as the new chart's first seat.
- The outgoing span closes at `19:39:40Z`. The fresh chart's span closes at `19:44:14Z` after it reaches the independently known missing-origin wait. The final pane capture confirms fresh A created the seat record and completed the chart pass. The report records unchanged pane/layout.

This closes the remaining seat-record boundary identified in the prior review. Retain the already-accepted Claude attended capture from round 2 and the earlier Codex/Pi reset/continuation evidence. The existing missing-origin waits in scratch repositories do not prevent observing second-chart entry and are not leaf product failures. No additional documented behavior changed beyond the design-required handover exception. Failed earlier attempts remain excluded from successful proof.

Evidence, read back with `akrogon log`:

- `check recheck3-B-scope: 0 implementation/check-recheck3-B-scope-1792266675321-3480341.log`: exact head, repair diff, commit message, proof inventory and prior handoff.
- `check recheck3-B-live: 0 implementation/check-recheck3-B-live-1792266681253-3482658.log`: final copied chart/seat records, helper log, live session listing and final screen from `live-evidence-fix3/`.
- Current-head `verify format: 0 implementation/check-format-1792266398631-3009272.log`, `verify test: 0 implementation/check-test-1792266547687-3009272.log` (1048 pass, 0 fail), and `verify typecheck: 0 implementation/check-typecheck-1792266550085-3009272.log`. These complete after the final skill change; no source/test/helper/fixture/configuration edits follow them. This fresh green verification supersedes the earlier inconsistent test run on the same head for the final handoff. No rerun was needed.

No reusable Nits are held, so no lesson write is required. No live mutations were performed by B in this review. Requested destination: merge.

## 2026-10-17 merge attempt 57b36550-52dd-49d7-9f8c-ca529d5de055

Applied memberless top: `503ae3e6f57a150825e0f3224a468bc14c3d0537`, built on `80f71f7e9ec47ce7eed3f470cf3094be860eae36`. The command rebased the reviewed `dc4e5590f7212b896aa7855ef2f60b6a6689daaf` branch mechanically. The worktree is clean and HEAD matches the assigned top. B did not fetch, rebase, commit or push.

Re-read the merge skill, brief/design, plan, implementation report and reviews. The single completion owner is standalone issue door-handover, whose ISSUE.md names only door-reset; its leaf brief is gathered for the completion broadcast. There are no stacked members or additional completion-owner briefs. No new live proof or fixture mutation is required, and no operator action or advisory Nit is open.

Evidence, read back with `akrogon log`:

- `check merge-B-holder: 0 implementation/check-merge-B-holder-1792266725607-3525856.log`: assigned attempt, applied top/base, empty members, clean worktree and completion-owner index.
- `check merge-B-rebase-evidence: 0 implementation/check-merge-B-rebase-evidence-1792266744980-3582307.log`: `git range-diff 17d61171..dc4e5590 80f71f7e..503ae3e6` shows all 15 commits unchanged by rebase. No conflict resolution or repair diff needs another review.

Running `akrogon verify --attempt 57b36550-52dd-49d7-9f8c-ca529d5de055` on the applied top; result will be recorded before merged --check and the command-owned push. Configured merge_checks, merge_covers and advisory lists are empty, so all three required checks run. The broadcast skill has been read and its local dependencies installed; it will run once only if the merged command prints issue completion.

First merge verify on `503ae3e6f57a150825e0f3224a468bc14c3d0537` was red only in the previously observed status timing assertion. Rebase target is `80f71f7e9ec47ce7eed3f470cf3094be860eae36`. Failing command exactly as configured:

```sh
akrogon run-check --name 'test' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''
```

`verify test: 1 implementation/check-test-1792266890597-3526125.log`, read back with `akrogon log`: 1047 pass, 1 fail; `overview reads multiple repos outside git, retains hierarchy and recorded fields without writes`, tests/status.test.ts:151, expected `0h 23m`, received `0h 22m`. `verify format: 0 implementation/check-format-1792266728135-3526125.log` and `verify typecheck: 0 implementation/check-typecheck-1792266892885-3526125.log` were also read back.

The stack diff changes no status implementation, status test or wall-clock timing logic; the same timing assertion previously alternated red/green before this merge. No plausible causal connection to the stack was found. Under Shared endings, one full `akrogon verify --attempt 57b36550-52dd-49d7-9f8c-ca529d5de055` rerun completed **green** on the unchanged top. Disposition: first test run **inconsistent**, with both logs retained. No repair, altered test, filter or skip was introduced.

Rerun logs, read back with `akrogon log`: `verify format: 0 implementation/check-format-1792266898372-4018870.log`; `verify test: 0 implementation/check-test-1792267064494-4018870.log` (1048 pass, 0 fail, including the previously failing status test); `verify typecheck: 0 implementation/check-typecheck-1792267066646-4018870.log`. Final result: `verify merge 503ae3e6f57a150825e0f3224a468bc14c3d0537: green`. The no-cause green rerun meets the merge skill's inconsistent-check rule, so no known-red run is needed. Proceeding to attempt-bound merged --check, then the command-owned push and one completion broadcast if the owner completes.

`akrogon phase door-reset merged --slot B --check --attempt 57b36550-52dd-49d7-9f8c-ca529d5de055` returned `ok`: merge receipt, assigned top and Test-Change citations accepted. The completion-owner index and its sole leaf brief are gathered for issue door-handover. Next operation is the attempt-bound merged call, which owns the fast-forward push, source closure and owner-folder move. B makes no direct push and leaves worktree/branch cleanup to the command's sweep.
