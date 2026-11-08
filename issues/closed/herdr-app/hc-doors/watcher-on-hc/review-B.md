# Review B: watcher-on-hc

Date: 2026-11-08. Initial blind review, slot B. Verdict: **fix**.

Base: `e3202dff4cf2a660cb26004e1ef3d2e8af883193`.
Reviewed head: `92fcae92bccf89889152c9eb5ca9ba0b1dcd0ed8`.
The working tree is clean. Its tree equals `793055a4`, the final verified head. No peer review was read, no code was changed and no covered operation was launched.

## Fixes

### F1: criterion 3 lacks a current agy stop proof

The only agy run is I-1 on `37925b59`, before `27b83bcd` changed `tests/e2e/watch-stop.e2e.ts`. That change replaced the on-command wait and added the process-tree precondition at lines 128-135. Only codex was run afterwards. Therefore the report's final criterion-3 green status does not establish that the current agy test passes.

Source and consequence: the actual attended agy proof, `check watch-stop-agy: 0 implementation/check-watch-stop-agy-1794104761724-93363.log`, ran the older test. Its saved `agy-before-screen.txt` shows `Running (sleep 600)`, so this is not a claim that agy failed to stop. It does not exercise the new descendant-process assertion. That screen also shows agy reading `watch-stop.e2e.ts`, so this test file was an actual model input in I-1. Reusing its older output cannot silently establish the effect of that changed input. The review rule explicitly rejects a changed test's proof from before its latest change, and criterion 3 names live interaction.

Required repair: B runs the existing planned agy command on the current head, records the current precondition, stop, same-address/conversation and corrective-send results, completes cleanup and absence evidence, and updates the criterion-3 proof record. No test or expectation change is requested. The exact planned command is:

```sh
akrogon run-check --name watch-stop-agy -- env AKROGON_E2E=watch-stop AKROGON_E2E_KIND=agy AKROGON_E2E_ROOT=/var/tmp/akr-1000/5d20/3eecfe3d AKROGON_E2E_OUT=/home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/watcher-on-hc/implementation/watch-e2e bun test --timeout=30000 ./tests/e2e/watch-stop.e2e.ts
```

Reuse grants[0] within its existing target, identity, effects and cleanup. Record the count and warn before this ninth session exceeds the renewed seven-session repeat bound. Run the configured dependency setup first as the skill requires. Review launches none of this operation.

## Verification and contract review

- Observe uses `repoSpace`, `leafSeats` and `transcriptFor`. The existing seat matcher checks labels, recorded address and session. The changed status mapping handles null, finished and keep-shell terminals. Transcript existence is checked and log fields remain limited to working seats. The line protocol and failure/inventory reporting remain covered by `tests/hc-observe.test.ts`.
- Criterion 1: read back `check c1-observe: 0 implementation/check-c1-observe-1794104642793-79211.log` (2 pass). Its test and product inputs have not changed since that run. The report records C1.1-C1.7 mutation reds. The final configured test run also includes it.
- Criteria 2 and 4: read back `check watch-check-5: 0 implementation/check-watch-check-5-1794109319505-881577.log` (1 pass, 15 assertions). It ran after the final watcher-test change `793055a4`. The test drives a real listener, exit wake, queued ticks and stop. The kept transcript summary and screens record the judgment and label removal. Decision C2 explicitly replaces the original folding rule with one check per queued tick.
- Criterion 3 codex: read back `check watch-stop-codex-2: 0 implementation/check-watch-stop-codex-2-1794106047902-2022262.log`. Its current test and saved screen establish the notify-only outcome allowed by the criterion. The skill records that outcome. agy remains F1.
- Criterion 5: the source diff removes the old shell imports and old agent/pane/session commands. The two notice lines remain under the explicit notices-on-hc exclusion. The report explains the only grep matches as recorded transcript fixture contents.
- Criterion 6: the final configured `test` log has 1270 pass, 0 fail, 92.26 s against the 75 s baseline. The report names all deleted old tests/fixtures and explains the increase with same-test-content runs of 79.84 s and 92.26 s, plus about 2.4 s for the added core test.

Final verify receipt: `d4e74894-e82c-4735-ab17-af6200b81a1c`, head `793055a4`, tree `1e6ffd5cc3231e4175a3881007c52725dd27e3f7`, matching the reviewed tree. Setup, format, typecheck and test all exit 0. Read back:

```text
verify format: 0 implementation/check-format-1794109658880-2119207.log
verify typecheck: 0 implementation/check-typecheck-1794109661367-2119207.log
verify test: 0 implementation/check-test-1794109753674-2119207.log
```

The earlier `test` red is inconsistent: `implementation/check-test-1794109549100-1204339.log` fails three batch-dispatch cases and one next case at their initial seat allocation, and the same-command retry `check test-retry: 0 implementation/check-test-retry-1794109652450-1792610.log` passes all 1270 tests. The failing files and allocation path are untouched by this leaf, whose engine change only adds parsed `keep` metadata. The final verify is independently green. The report calls all four failures next tests, but the kept log identifies the three batch-dispatch cases. This naming error changes no verification result. No known-red filing is required for a green retry.

No check was skipped, filtered or disabled. The ordinary test runner does not include the attended `*.e2e.ts` runs, as designed. No full suite was rerun during this review because its final receipt is current.

## Grant and evidence audit

`check b-proof-audit: 0 implementation/check-b-proof-audit-1794109979686-2784299.log` compares the kept run records with `issues/timings.jsonl`, the current tree, and absence records. Read back with `akrogon log`.

The timing rows and check files account for eight paid harness sessions: I-1 agy, I-2/I-3 codex, and I-4 through I-8 watcher. P-1/P-2 stop before launching a harness. The stand-in-only `repro-wake` launches no paid harness. Session overruns I-5, I-6 and I-8 have advance warnings. I-6's fourth internal watcher check exceeded the then-three-check bound and is expressly recorded in the report; C2 subsequently renews that bound to four. This historical excess is disclosed, not an unexplained extra session. The final I-8 uses four checks within the renewed per-launch bound.

Known watcher cost is 2.67 USD. agy/codex cost is not reported. Retained resources are separately named as approved agy conversation history and codex/Claude trust entries. All three final absence records contain `left: []`; the throwaway socket and core-state folder are absent. No paid activity is unexplained by the artifacts. This pass launches no covered operation and changes no bound.

## Documentation and paths

Opened the changed behavior's user page `docs/use/watch-while-away.md`, the watcher skill, reference index, and affected area entries. The user page describes hc-only start, label lifecycle, event wakes and per-tick checks consistently with C2. The notice wording remains intentionally owned by notices-on-hc.

One retained listing per changed AREA file, read back with `akrogon log`:

```text
check b-skills-paths-final: 0 implementation/check-b-skills-paths-final-1794109953967-2780663.log
check b-tests-paths-final: 0 implementation/check-b-tests-paths-final-1794109954116-2780769.log
```

All source paths and the newly named watcher test paths exist. Local shorthand paths resolve under their stated skill/assets or e2e folders. The test area's absent `issues/merge-attempts.jsonl`, `issues/config.yaml`, `cleared-<run>.md` and `direct/` describe generated, registered-checkout or holder-specific artifacts rather than promised worktree source files. No current dead-pointer consequence was found. No lesson line changes occur in this diff.

## Test-Change audit

The following section lists every `Test-Change:` trailer in `e3202dff..HEAD`. Judgments:

- `293e03d3`: deletions cite the brief's hc migration and criterion 5. Replaced format/log-tail behavior is named in `tests/hc-observe.test.ts`; removed old substrate/session-id logic belongs to the engine resolver. The two existing e2e files only move/share the trust-answer helper, with no changed expectation.
- `27b83bcd`: actual codex I-2 output shows the old wait matched task text. The stronger live-command precondition is justified. Its application to agy needs the current run in F1.
- `a3eb81b1`: actual I-5 modal/screens justify disabling auto-mode onboarding in the settings-less proof launch. Expectations stay unchanged.
- `539072f8`: C2 justifies the check-count expectation change, and the real slash-command records justify counting only command-args entries.
- `793055a4`: I-7's recorded hc events justify replacing turn-count settlement with transcript tick settlement. The four-check expectation stays intact.
- `92fcae92`: the tests/AREA.md trailer cites the documentation-only line change. Its empty commit has the same tree as the final verified head.

All existing test-file modifications have source trailers under `src/test-files.ts`'s path rule. No prose-wording test was added. No proof command was substituted for a different case set. The watch-check corrections were rerun after their latest changes. F1 is the remaining proof-freshness gap.

## Nits and operator actions

None outstanding. F1 is a planned proof replay available to B under the existing grant, not an operator action or a test-expectation correction.

## Trailer list


293e03d3

```text
Test-Change: skills/watch-issues/scripts/observe.test.ts deleted: every case drives a fake herdr; brief "observe.ts ... built from hc ls --json"; format cases ported to tests/hc-observe.test.ts
Test-Change: skills/watch-issues/scripts/observe-log-tail.test.ts deleted: fake herdr agent_session; brief "logs come from the engine's transcript resolver"; wiring case ported to tests/hc-observe.test.ts
Test-Change: skills/watch-issues/scripts/fixtures/herdr-agent-list.json deleted: herdr agent list no longer read (brief, criterion 5)
Test-Change: skills/watch-issues/scripts/fixtures/herdr-session-list.json deleted: herdr session list no longer read (brief, criterion 5)
Test-Change: skills/watch-issues/scripts/fixtures/herdr-workspace-list.json deleted: herdr workspace list no longer read (brief, criterion 5)
Test-Change: tests/e2e/tier.ts gains answerTrust moved from kinds.e2e.ts, taking an address lookup; no expectation changed
Test-Change: tests/e2e/kinds.e2e.ts uses the shared answerTrust through a liveSeat lookup; no expectation changed
```

27b83bcd

```text
Test-Change: tests/e2e/watch-stop.e2e.ts real output implementation/watch-e2e/codex-before-screen.txt and codex-after-screen.txt (interrupt before the tool call); the on-command expectation now waits for "Running" and asserts a `sleep 600` process in the seat's tree
```

a3eb81b1

```text
Test-Change: tests/e2e/watch-check.e2e.ts real output implementation/watch-e2e/i5-events.log (+10s and +60s screens show the auto-mode onboarding dialog over the prompt after check 1, watcher status done, no turn after the seat exit); the watcher launch adds --permission-mode dontAsk, no expectation changed
```

539072f8

```text
Test-Change: tests/e2e/watch-check.e2e.ts brief criterion 2 as amended by plan Operator decision C2 and real output implementation/watch-e2e/transcript-summary.json (I-6: queued ticks at lines 26 and 36 each a turn; each tick recorded as <command-args> plus skill expansion); ticks counted by <command-args> records, checks expected 4 in all and 3 from the first tick, settle by turn count instead of the last-entry loop
```

793055a4

```text
Test-Change: tests/e2e/watch-check.e2e.ts real output implementation/watch-e2e/i7-events.log (watcher turn 1 at 03:24:28Z, turn 2 at 03:25:05Z after the wake and both ticks; transcript held 3 <command-args> ticks and 4 `akrogon status` checks); the settle condition is idle, turn past check 1 and 3 ticks in the transcript; tick and check expectations unchanged from 539072f8
```

92fcae92

```text
Test-Change: tests/AREA.md doc line naming tests/hc-observe.test.ts and the watch e2e files (commit 84777459, plan "Docs affected"); no test expectation
```

## check.repair, 2026-11-08

Read both initial reviews. A has no Fix and B has F1. No operator action is open. Head remains `92fcae92bccf89889152c9eb5ca9ba0b1dcd0ed8`, with no worktree change. This pass repairs F1 by the exact existing planned agy proof, with no test or product change.

Preflight: `check b-repair-preflight: 0 implementation/check-b-repair-preflight-1794110117599-2788539.log`. Identity uid 1000; throwaway socket, core state, recorded cwd and its agy trustedWorkspaces entry are absent. Saved the previous I-1 artifacts under `implementation/watch-e2e/i1-agy/` before the runner overwrites the agy filenames. Baseline `b-repair-agy-before.json` records the conversation filenames and trust entries for precise cleanup and retained-ID discovery.

WARNING, paid repeat-count bound: the next run is harness session nine, beyond grants[0]'s renewed limit of seven. Prior use is eight, established by report I-1 through I-8 and the timing/log audit. The skill permits a warned paid-repeat overrun. No stop-type bound or stop_line is widened.

Count line B-R1: grants[0], bound seven harness sessions, count so far eight, unit harness session. Planned launch: one agy session, `gemini-3.8-flash-low`, low effort, target `HC_SESSION=akr-e2e-watch`, operator user ivan (uid 1000), existing harness login used by agy. Recorded cwd `/var/tmp/akr-1000/5d20/3eecfe3d/akr-e2e-watch-agy`, tier root `/var/tmp/akr-1000/5d20/3eecfe3d/akr-e2e-watch-agy-root`. Two prompts planned within the four-prompt stop-check bound: first task and one corrective send. Operations are the granted start verb, interrupt/esc/wait/send and cleanup. No watcher, cron, listener service, window or operator terminal is modified. Cleanup uses grants[0].fixtures[0].cleanup as uid 1000. Any new agy conversation is retained under retained[2], with its ID recorded after the run.

B-R1 setup: `check b-repair-setup: 0 implementation/check-b-repair-setup-1794110138578-2789031.log`, the configured frozen install under the install lock. No dependency or source file changed.

Live observation while the proof waits on its on-command precondition: `check b-repair-seat-read: 0 implementation/check-b-repair-seat-read-1794110216729-2793048.log`, read back with `akrogon log`. The seat at `akr-e2e-watch/t1` explicitly refuses the exact planned task: "I cannot run sleep 600 in the shell" and explains that its system guidelines prohibit shell sleep as a timer. It offers scheduling instead. No corrective prompt, force-send or extra paid session was used to bypass that refusal. The runner is allowed to reach its own bounded result and cleanup.

Count line B-R1 completed: `check watch-stop-agy: 1 implementation/check-watch-stop-agy-1794110323052-2789027.log`, read back with `akrogon log`. Run `0abed506-cd85-419c-8cad-24b25167d300`, head `92fcae92`, elapsed 184.38 s, one paid harness session, count after nine against the seven-session repeat bound (warned above). Seat `akr-e2e-watch/t1`. One prompt was sent; execution never reached interrupt or corrective send. Cost is not reported by agy. Its retained[2] conversation ID is `5df4f39a-3218-485f-83c2-4d1e246b314c`, file `~/.gemini/antigravity-cli/conversations/5df4f39a-3218-485f-83c2-4d1e246b314c.db`.

The test is red at `tests/e2e/watch-stop.e2e.ts:133`: the seat's descendant tree contains no `sleep 600`. The preceding `hc wait --output Running --timeout 180` timed out. This is the leaf's own added proof's commanded precondition failing, with a direct trace from its task to agy's refusal, not an unrelated base-red test. No automatic same-command retry or known-red filing is appropriate. Criterion 3 is still unproved on the current test. The earlier agy result is not substituted for this failure.

Cleanup: `check b-repair-cleanup: 0 implementation/check-b-repair-cleanup-1794110364564-2800328.log`, read back with `akrogon log`. The runner's finally killed/removed its seat, stopped its own core and removed its recorded folders, with `b-r1-agy-absence.json` reporting `left: []`. B removed exactly the recorded agy cwd's single trustedWorkspaces entry, preserved every other setting, then read the file back. OS reads confirmed no socket, core-state folder, recorded cwd/folder or process in the recorded cwds remains. No listener was started in B-R1. The new native agy conversation remains only under the approved retained[2]; no other harness transcript was created. The proof wrapper terminal `infra/t6r` was removed after its exit code 1 and completed check line were collected.

B-R1's runner artifacts are preserved as `implementation/watch-e2e/b-r1-agy-{cwd,start,on-command,tree,absence}.*`. `b-repair-agy-cleanup.json` lists their exact filenames and the retained ID. I-1's original filenames were restored from the preserved `i1-agy/` copies so historical report citations remain valid. The B-R1 screen/refusal is in the separate kept `b-repair-seat-read` log. No old stop result is presented as B-R1 evidence.

### Handed to A

- F1 remains open: the planned `sleep 600` stimulus is refused by the real agy harness. Correct the proof stimulus and its matching process expectation in `tests/e2e/watch-stop.e2e.ts`, preserving criterion 3's long-running shell tool call, same-conversation stop and corrective-send outcome, then rerun the existing attended proof. This meets the check.repair exceptions for a needed proof correction and a correction of a test expectation. The current runner/helper exists; no missing machinery or unmerged prerequisite is involved.

No source, test, lockfile or product documentation changed, so there is no repair commit. No documented product behavior changed. Other criterion proofs retain their earlier evidence because their inputs are unchanged. A's N1-N3 are not promoted by this failed precondition, and B holds no additional reusable Nit. No operator action is open. The pass requests `check.fix`; it runs no full verify because the skill assigns none to this handoff.

## Re-check after check.fix, 2026-11-08

Verdict: **ready**. F1 is resolved. No new Fix, Nit or operator action.

Prior reviewed base/head: `e3202dff4cf2a660cb26004e1ef3d2e8af883193` / `92fcae92bccf89889152c9eb5ca9ba0b1dcd0ed8`.
Handed-off base/head: `d40c155648a5133f0223a64827dd64950c48f59e` / `d97290ff02b7b4227201bd25c35ce698b46d6449`.
Reviewed tree: `ba3625ba36758d9e4745f0aa833a60f2300af931`. Worktree clean.

### Scope and refresh

Computed the required range-diff myself, rather than reviewing main's commits as repair:

```text
check b-recheck-range: 0 implementation/check-b-recheck-range-1794123642043-4109152.log
check b-recheck-diff: 0 implementation/check-b-recheck-diff-1794123649990-4138198.log
```

Read both kept logs with `akrogon log`. The rebase preserves the earlier implementation and adds three repair commits: `e243df3b`, `f4b2e04b`, `d97290ff`. Changed prior-commit entries come from main's notice/session context and the import conflict. The resolved `tests/e2e/kinds.e2e.ts` import retains both main's `engine` and this leaf's shared `answerTrust`. Main's notice wording is retained. No new leaf-authored AREA pointer is introduced by this repair, and earlier pointer findings remain resolved.

Opened the current `docs/use/watch-while-away.md` and watcher contract. No documented product behavior changed in the repair. Main's notice-to-toast change belongs to notices-on-hc and is not reopened here.

### F1 and proof equivalence

`e243df3b` changes only the agy proof stimulus to the long shell command `ping -c 600 127.0.0.1`. The codex command remains `sleep 600`. `f4b2e04b` waits for agy's actual command block instead of its generic exploratory-command spinner. Both preserve the process-tree precondition, working-seat check, stop-key branch, idle/address/transcript confirmation, corrective send and notify-only outcome. The loopback target adds no public or DNS effect. The report records the old command, new command, observed refusal and equivalence evidence under its proof-command correction heading.

Read back the current attended results:

```text
check watch-stop-agy-3: 0 implementation/check-watch-stop-agy-3-1794110641219-2815594.log
check watch-stop-codex-3: 0 implementation/check-watch-stop-codex-3-1794110886464-2820347.log
check watch-check-7: 0 implementation/check-watch-check-7-1794111130168-3355728.log
```

The agy tree recording contains `ping -c 600 127.0.0.1`; interrupt reports key `esc`, outcome `stopped`; the after record is live/idle at `t1` with the same transcript label; corrective send reports `started: true`. This closes F1 with a real run after the final stop-test change. Codex's fresh run confirms its allowed notify-only result. The later `d97290ff` commit changes only the separate watcher test, so neither stop proof is stale.

`d97290ff` corrects the watcher checker to count command turns containing a status read, allowing another status read within a check. A-F4's real recording has four command turns and five status calls, so the old count was wrong. The new checker retains four checks in total, three after the first tick, three tick records, label-at-start and label-removal assertions. A-F5 runs after that final change.

B checked both deterministic predicates using their actual current source expressions and the unmodified real recordings, with deliberate breaks applied only in memory:

```text
check b-recheck-stop-guard: 0 implementation/check-b-recheck-stop-guard-1794123767564-4148298.log
check b-recheck-watch-guard: 0 implementation/check-b-recheck-watch-guard-1794123695830-4145973.log
```

Both recorded process trees pass and removing the long command fails. Both A-F4 and A-F5 watcher recordings pass; removing the status read from any tick or collapsing the final tick turn fails. No case was removed, no paid operation was launched and no recording was edited. These checks support the proof corrections' equivalence guard without repeating a live interaction.

### Configured verification

Receipt `5e99a0b5-9b27-4e20-b51a-9d69ee121279` is whole-green for the exact reviewed head/tree. Read back:

```text
verify format: 0 implementation/check-format-1794123534884-3587162.log
verify typecheck: 0 implementation/check-typecheck-1794123537272-3587162.log
verify test: 0 implementation/check-test-1794123599621-3587162.log
```

Setup also exits 0. `test` has 1274 pass, 0 fail, 62.29 s, and both observe cases pass inside it. This is below the 75 s baseline. Earlier red verify runs and the disagreeing known-red judgment do not count as proof; the completed green run on the identical head/tree now supplies the required receipt. No planned check was disabled, filtered or replaced. No full suite rerun is warranted during this re-check.

### Grant audit and trailers

`check b-recheck-audit: 0 implementation/check-b-recheck-audit-1794123745590-4147493.log`, read back with `akrogon log`, confirms the current receipt/tree, 14 paid-session timing rows and the trailer inventory. The five A-F1 through A-F5 launches reconcile with the nine previously counted sessions. Each over-bound launch has an advance warning in the report. The current watcher runs stay within four checks per launch. All activity is accounted for. Known watcher cost is 3.94 USD; other harness cost is not reported.

Final agy, codex and watcher absence records each contain `left: []`; the throwaway socket and core state remain absent. The report records cleanup read-back and separates four retained agy conversations and the existing approved trust entries from deleted resources. No new operator permission is required.

The 12 original Test-Change trailer payloads remain unchanged in the rebased range and retain their earlier judgments. The three new trailers below cite the actual B-R1 refusal, A-F1 premature marker and A-F4 extra status read. Those sources justify the corresponding changes. No source trailer is missing under `src/test-files.ts`'s path rule.

```text
Test-Change: tests/e2e/watch-stop.e2e.ts real output implementation/check-b-repair-seat-read-1794110216729-2793048.log and check-watch-stop-agy-1794110323052-2789027.log (agy refused sleep 600; red at the process-tree precondition); each kind names its long command, agy `ping -c 600 127.0.0.1`, codex `sleep 600` as before, and the tree check matches that command
Test-Change: tests/e2e/watch-stop.e2e.ts real output implementation/check-watch-stop-agy-2-1794110545811-2808210.log and watch-e2e/a-f1-run1/agy-tree.json (wait ended on "Running", tree empty, red at the tree check); per-kind `running` marker, agy "Running (ping -c 600", codex "Running" as before; no expectation changed
Test-Change: tests/e2e/watch-check.e2e.ts real output implementation/watch-e2e/transcript-summary.json (A-F4: four /watch-issues turns, each opening with `akrogon status`; the last also runs `observe ...; akrogon status` after its next, summary line 36); checks are the /watch-issues turns that run `akrogon status`, still expected 4 in all and 3 from the first tick
```

No repair-introduced blocking defect remains. B holds no reusable Nit requiring a lesson entry. Request `merge` with verdict `ready`.
