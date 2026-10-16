# Review B: release-deploy

Verdict: fix
Base: `83b92799495c40595a09ca13e08c588f89ae66ca`
Reviewed head: `b1169c5c5db5c70722d4062abcfe7b24ce20a52c`
Date: 2026-10-16

Initial blind review. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. No code or tests were changed and no commits were made.

## Fixes

### F1. Failed link deployment activates the release, hides the failure and never retries

Locations: `src/self-update.ts:233-247`, `src/status.ts:427`, `tests/install.test.ts:612-635`.

Source: criterion 4 explicitly names a failing link step. A new skill can collide with an existing directory in a harness skill root, a conflict the installer already supports and tests. CLI probe: deploy c0, push a commit adding `new-skill`, create `.claude/skills/new-skill` as a directory, run `next --all`, inspect `status`, remove the conflicting directory, run `next --all` again.

Observed: `current` moves to the attempted commit before the link error. Status prints only the repository and `no open leaves`, hiding the recorded failure because attempted equals active. After conflict removal, the next pass prints only `current <sha>` and the skill link remains absent. The early equality return also skips reload/plugin linking and recording. This disproves report.md's claim that this path self-heals. Failure writing additionally retains the old record's `previous`, losing the actual preceding current release.

Consequence today: a failed deployment is active, missing links remain missing indefinitely on unchanged main, the operator sees no persistent status warning, and previous-release bookkeeping can be lost. Violates brief criterion 4 and design Q3. Plan D6 cannot override that outcome. Preserve the previous active release on failure and retry unfinished deployment work until successful, retaining the actual previous release and a visible failure record. Correct the existing conflicting-directory test's expectation that a failed deployment activates the new release. That expectation correction belongs to A under the repair split.

Evidence: `check review-B-failure-retention: 0 implementation/check-review-B-failure-retention-1792120672647-2204033.log` (observational probe, exit zero means observations were collected). Read back with `akrogon log`. Excerpts: retry `output: "current fd9f886b4a4b"`, `missingLink: true`; status `"akrogon\n  no open leaves"`.

### F2. Records-stage fetch/push errors bypass deployment and persistent failure reporting

Location: `src/self-update.ts:299-305`.

Source: criterion 4 explicitly names fetch failure, and the architecture requires deployment after records whatever their outcome. `gitStage` throws CommandError on fetch/push, and this catch returns before `deployStage` can run or write failure state. A records push failure likewise prevents deploying an already fetched merged main.

CLI probe: deploy c0, push c1 and fetch its tracking ref, point the temporary remote URL at a missing bare repository, then run `next --all` and plain `status`. The pass prints `fetch failed`, but deploy.yaml remains the old successful c0 record, despite the known c1 tracking SHA. Status prints no failure line. A real inaccessible remote reaches this same command/error path.

Consequence today: the required persistent fetch-failure report is absent and dispatch's later status loses the failure. Violates criterion 4 and the deploy-after-records contract. Retain records-stage output while executing or recording the deployment outcome, including an accurate fetch step and available target identity.

Evidence: `check review-B-fetch-failure: 0 implementation/check-review-B-fetch-failure-1792120715478-2224179.log`, read back with `akrogon log`. The before and after records are identical with `ok: true`; status has no deploy line.

### F3. Retention timestamps start when a release leaves previous, rather than when it is replaced

Locations: `src/release.ts:104-113,143-160`, `src/self-update.ts:233,267`; criterion-5 test in `tests/release-deploy.test.ts`.

Source: criterion 5's ordinary sequence of deployments. After c0 -> c1, c0 is previous and prune skips it before stamping. The probe's successful c1 record has `previous: c0` and `replaced: {}`. Only c1 -> c2 stamps c0. If c1 ran more than 24 hours, c0 is already eligible when c2 replaces c1, but instead receives a fresh 24-hour retention period. The design explicitly requires replaced time recorded at each flip. The current test overwrites both timestamps, so it cannot catch this defect.

Consequence today: obsolete releases accumulate beyond the agreed retention deadline. Also, the probe gives an already non-current/non-previous release a 25-hour-old recorded timestamp, runs `next --all` with unchanged main, and it remains present because the equality return bypasses pruning. Prune eligible releases on the deploy pass and stamp each outgoing current at its actual replacement, while keeping current and previous protected.

Violates brief criterion 5 and the design's replaced-time contract. Update the CLI proof to exercise real replacement timestamps, rather than supplying timestamps the implementation failed to record.

Evidence: `check review-B-failure-retention: 0 implementation/check-review-B-failure-retention-1792120672647-2204033.log`, read back with `akrogon log`. Observations include an empty replaced map immediately after replacement and `stillPresent: true` for the aged eligible release.

### F4. The required deliberate-break proofs for criteria 3-5 are missing

Source: design.md's binding interpretation requires criteria 3-5 each to show one deliberate break making their proof red. Plan/report record red runs on the base and green runs of the implemented suite, but no deliberate break of each implemented mechanism or corresponding red result. The saved proof inventory contains no such evidence. Base runs before the implementation, with a subsequently corrected fixture, do not show that the final tests catch broken link reconciliation, failure preservation or retention timing. F1 and F3 demonstrate why that distinction matters here.

Consequence today: the explicitly required validation is incomplete while report.md says no criteria remain unverified. Use the existing CLI runner and fixtures to record the three deliberate breaks and restored green results on the final test versions, and correct the report. This is missing proof capture using existing machinery, handed to A under the repair rules, not missing machinery.

## Verification

- E1. Read back the implementation's retained green logs: `check deploy-tests: 0 implementation/check-deploy-tests-1792120209269-1146599.log` (49 passing tests), `check format: 0 implementation/check-format-1792120218280-1160373.log`, `check typecheck: 0 implementation/check-typecheck-1792120227981-1164592.log`, `check test: 0 implementation/check-test-1792120368653-1168226.log` (965 pass, zero fail). These runs follow the final test/helper edits. No planned check or runner was skipped, filtered or disabled in the diff. The focused file run covers the named criterion cases, but the deliberate-break evidence is missing as F4 explains. No full-suite rerun was needed to establish these code-path defects.
- E2. Read back criterion 2's base red log, `check deploy-dirty-workspace: 1 implementation/check-deploy-dirty-workspace-1792114102827-2629124.log`: checkout pending is present and release deployment is absent. The current green suite proves the dirty-workspace regression is fixed.
- E3. Own CLI probes reused the existing temporary HOME/repository/bare-remote and fake herdr/systemctl fixtures, with the configured frozen install under flock before dependency use. All fixture homes were removed in finally blocks. No live host installation was changed. Probe logs above retain the actual outputs.

## Documentation and AREA review

Started from the deploy behavior and read `docs/guide/install.md`, README, the changed create/learn guides and seed/chart skill contracts, plus merge-issue's existing helper command. The release model is documented. Failure persistence and retry claims are contradicted by F1/F2, rather than separate documentation-only findings. Skill imports remain rooted in the resolved release entry point. The seed workflow uses the registered workspace for Git destination lookup.

`check review-B-area-paths: 0 implementation/check-review-B-area-paths-1792120672743-2205200.log`, read back with `akrogon log`, lists every literal repository path named by changed `src/AREA.md` from the repository root. All source/helper/index pointers exist. `issues/closed`, `issues/timings.jsonl` and `issues/verify-runs.jsonl` are absent in this code worktree and are generated/state-home locations already documented before this diff, with no newly broken pointer or present consequence. No AREA deletion or lesson removal occurs.

## Test-Change trailers

Judged against design.md's explicit permission to update checkout-pointing expectations/own-repo tests, the plan's registered-name identity and the actual Bun fixture/retention requirements:

| Ref | Commit | Trailer | Judgment |
| --- | --- | --- | --- |
| T1 | 63a2cd8 | `Test-Change: tests/install.test.ts design update: links resolve through current; repoint replaces wrong-owned-link refusal; lockfile test rewritten (dirty workspace files are ignored by release deploys)` | Link ownership and dirty-workspace changes are supported. The changed failed-link active-release expectation contradicts criterion 4, covered by F1. |
| T2 | 63a2cd8 | `Test-Change: tests/self-update.test.ts design update: selfUpdate drops its ownRoot argument, identity is repo.name; herdr fake added for the deploy stage's plugin link` | Supported by the design/plan interface change and new external command. |
| T3 | 63a2cd8 | `Test-Change: tests/release-deploy.test.ts plan correction: own-repo identity is repo.name === 'akrogon', fixture registers under that name` | Supported by plan D1. |
| T4 | 7b96cf9 | `Test-Change: tests/install.test.ts remaining stale selfUpdate ownRoot call sites` | Supported by the same interface change. |
| T5 | 7b96cf9 | `Test-Change: tests/self-update.test.ts slice-link realpath now resolves through the release; herdr fake actually added` | Supported by criteria 3/6 and the plugin-link command. |
| T6 | 7b96cf9 | `Test-Change: tests/release-deploy.test.ts fixture needs a dependency for bun.lock to exist; prune test backdates both replaced releases` | Bun lockfile fixture change is supported. Artificial stamps leave the real retention timing untested, covered by F3. |

No other Test-Change trailers occur in base..HEAD. The path rule is `src/test-files.ts`. Existing regression tests remain, with the dirty-workspace lockfile expectation changed for the explicit release isolation outcome.

## Nits and operator actions

None. No reusable deferred Nit is held.


## 2026-10-16 check.repair B

Repair start: `b1169c5c5db5c70722d4062abcfe7b24ce20a52c`.
Repair head: `4812c0d3f9239764d8183762402c0f8fae645d5e`.
Read both initial reviews. A's F1 overlaps B's F1. No operator-only findings are open. No locked contract or existing test expectation was edited.

### Repairs completed

- F2: reproduction commit `a937dfc`, product fix `fe31a0c`. Records fetch/push errors retain their output and continue to the deployment stage. Deploy fetch failures record step `fetch`, the locally known tracking commit when available, and the original command error. The new CLI regression exercises an inaccessible temporary bare remote, persistent status, unchanged current and recovery after restoring the remote URL. Red: `check repair-B-F2-red: 1 implementation/check-repair-B-F2-red-1792121046803-2368771.log`. Green: `check repair-B-F2-green: 0 implementation/check-repair-B-F2-green-1792121059375-2374509.log`. Red failed because deploy.yaml still reported the previous successful deploy. The records push-error sibling was traced through the same catch and no longer returns before deployment.
- F3: reproduction commit `b476888`, product fix `4812c0d`. Successful deployment records the outgoing current's replacement time immediately, retaining earlier stamps. An unchanged-main deploy pass still prunes eligible releases. The new CLI regression checks the actual timestamp on c0 -> c1, then c1 -> c2, ages recorded c0/c1 stamps, and confirms an unchanged-main pass deletes c0 while protecting previous c1 and current c2. Red: `check repair-B-F3-red: 1 implementation/check-repair-B-F3-red-1792121074317-2381558.log`. Green: `check repair-B-F3-green: 0 implementation/check-repair-B-F3-green-1792121094601-2390632.log`. Red failed because the replaced release had no timestamp. Existing tests and their expectations were retained.

Both reproduction tests pass on the final committed source/test versions: `check repair-B-regressions-final: 0 implementation/check-repair-B-regressions-final-1792121153233-2616904.log` (2 pass, 17 assertions). All cited test logs were read back with `akrogon log`. Each reproduction commit carries its exact changed test path and the finding/brief source in a final `Test-Change` trailer. No additional repair tests were written.

### Planned proofs on repaired head

All eight existing criterion tests, which B did not author, were rerun through `akrogon run-check --name repair-B-C<n> -- sh -c '<flocked frozen install> && bun test tests/release-deploy.test.ts -t "<planned case>"'`. Each passed on `4812c0d`, with every log read back using `akrogon log`:

| Criterion | Retained result |
| --- | --- |
| C1 | `check repair-B-C1: 0 implementation/check-repair-B-C1-1792121108281-2397318.log` |
| C2 | `check repair-B-C2: 0 implementation/check-repair-B-C2-1792121108306-2397317.log` |
| C3 | `check repair-B-C3: 0 implementation/check-repair-B-C3-1792121108381-2397316.log` |
| C4 | `check repair-B-C4: 0 implementation/check-repair-B-C4-1792121108537-2397320.log` |
| C5 | `check repair-B-C5: 0 implementation/check-repair-B-C5-1792121108594-2397319.log` |
| C6 | `check repair-B-C6: 0 implementation/check-repair-B-C6-1792121108281-2397322.log` |
| C7 | `check repair-B-C7: 0 implementation/check-repair-B-C7-1792121108281-2397323.log` |
| C8 | `check repair-B-C8: 0 implementation/check-repair-B-C8-1792121108461-2397321.log` |

The existing C4 case exercises install failure only. Its green result does not close F1. All proof fixtures remained under temporary HOME with fake herdr/systemctl, and finally blocks removed their fixture roots. No live host deployment, outside mutation or grant expansion occurred. No iteration-created temporary helpers were added. Worktree was clean at the repair head.

### Handed to A

- F1 (both reviews): correction of an existing test expectation, an explicit B repair exception. `tests/install.test.ts`'s conflicting-directory case currently requires activating the attempted release after link failure, contrary to criterion 4. Correct that expectation and repair the product path together: preserve the active release on failure, retain true previous-release bookkeeping, retry after the conflict is removed or a deploy is interrupted, and show recorded failures in status. This whole finding remains open, including A's overlapping retry/status concern. Plan D6 is subordinate to the locked brief/design outcome and does not authorize changing those outcomes.
- F4: proof-only gap using existing machinery. Criteria 3-5 need the deliberate-break red runs and restored green captures required by design.md, using `bun test tests/release-deploy.test.ts -t <case>` and the existing fixture/runner. Record the exact breaks, final test versions and retained results, and update implementation/report.md's stale known-limitations and completion claims. No new proof machinery or live access is needed.

No reusable deferred Nit is held by B. A's cosmetic Nits were not expanded into repairs.


### Final verification and handoff

`akrogon verify` completed on committed head `4812c0d3f9239764d8183762402c0f8fae645d5e`: `verify leaf 4812c0d3f9239764d8183762402c0f8fae645d5e: green`. All configured checks ran on the fresh verification checkout. Results, read back with `akrogon log`:

- V1: `verify format: 0 implementation/check-format-1792121112804-2401292.log`.
- V2: `verify test: 0 implementation/check-test-1792121248192-2401292.log` (967 pass, zero fail, 9719 assertions).
- V3: `verify typecheck: 0 implementation/check-typecheck-1792121250189-2401292.log`.

No merge checks ran. F2 and F3 are repaired. F1 and F4 remain handed to A above, so the requested next phase is `check.fix`.


## 2026-10-16 check.review B after check.fix

Verdict: fix.
Original base: `83b92799495c40595a09ca13e08c588f89ae66ca`.
Prior reviewed head: `b1169c5c5db5c70722d4062abcfe7b24ce20a52c`.
B repair handoff: `4812c0d3f9239764d8183762402c0f8fae645d5e`.
Reviewed head: `cfadc48bc2daac78e34d2e029090f42cb4554cee`.

Reviewed only the repair range, including B's already recorded F2/F3 repairs and A's `2edd5b8`, `27d471b`, `cfadc48`. Report says the branch was already on origin/main, and no branch refresh/rebase occurred, so no range-diff was required. No code/tests changed and no commits were made in this review.

### Earlier findings

- F1: retry and failure visibility now work for the recorded scenarios, and ordinary link conflicts no longer flip current. Read back the corrected tests' pre-fix red log and repaired green suite. However, the newly reordered link mutations introduce F5, and the resumed-success bookkeeping introduces F6 below. These regressions prevent accepting the overall repair.
- F2: records errors still reach deployment and persist fetch failure. No regression to that handling was found. F6 affects the subsequent same-commit recovery bookkeeping.
- F3: replacement stamping and unchanged-main pruning remain implemented. F6 corrupts their previous-release input on a newly reachable recovery path.
- F4: closed. Read back all six deliberate-break logs: C3 red/green `check-break-C3-red-1792123141288-3727075.log` / `check-break-C3-green-1792123145911-3729411.log`; C4 red/green `check-break-C4-red-1792123153336-3732991.log` / `check-break-C4-green-1792123159172-3735765.log`; C5 red/green `check-break-C5-red-1792123159715-3736453.log` / `check-break-C5-green-1792123163571-3738703.log`. Each red fails at the intended link-source, failure-record or retention assertion, followed by a restored green run. The final suite also runs the current tests.

### F5. Preparing links before flip can disable the installed command on a failed first deployment

Locations: `src/self-update.ts:257-272`, `src/install.ts:45-58`.

Realistic source: criterion 6's existing installation with the CLI linked directly into the workspace and no current link, combined with the supported skill-directory conflict from criterion 4. The repair moves `planSkillLinks` and `applySkillLinks` before the flip but still mutates links before refusing conflicts. Planning itself also unlinks active skills based on the candidate tree.

CLI reproduction using the existing temporary-HOME fixture: seed `.local/bin/akrogon` pointing at the workspace entry point, leave current absent, create an existing `.claude/skills/skill-one` directory, then run `next --all`. Before the pass the command target exists. After the links failure it has been repointed to `current/src/akrogon.ts`, but current was never created. The installed command is dangling, so the next installed `akrogon next` cannot execute the promised retry without a manual repair. This is introduced by moving link application before flip.

The same ordering breaks an existing release: deploy c0 with skill-one, push c1 removing skill-one and adding skill-two, place a conflicting directory at `.claude/skills/skill-two`, run next. Current correctly remains c0 and `current/skills/skill-one` still exists, but its harness link was removed. Other harnesses receive dangling `current/skills/skill-two` links because c0 lacks that skill. Thus retaining the pointer does not retain a usable installed release.

Consequence today: a supported link conflict disables the CLI during automatic migration or removes working skills and leaves dangling links on a failed upgrade. Hits criteria 3, 4 and 6. Keep the installed command and active release links usable when candidate preparation fails, including first-switch installations. Validate conflicts before applying candidate link mutations, and handle stale-link removal at a point where failure cannot leave the active installation broken. Add a regression at the real CLI boundary. The corrected conflict test currently checks current's absence and the new dangling readlink targets, so it does not catch this regression.

Evidence: `check recheck-B-previous-protection: 0 implementation/check-recheck-B-previous-protection-1792123753962-1070539.log`, read back with `akrogon log`. Observational probe collected all scenarios successfully. Excerpt: migration `commandExists: true` before, `commandExists: false` after, with `currentExists: false` both times. Existing-release case: `activeSkillSourceExists: true`, `activeSkillLinkExists: false`, `addedSkillLinkExists: false`.

### F6. Recovery from a fetch outage records current as its own previous and deletes the real previous release

Location: `src/self-update.ts:244-247,289-292`; failure record carry in `src/release.ts:121-130`.

Realistic source: ordinary deployment c0 -> c1, a temporary fetch failure while main remains c1, then the remote recovers. The failure writer preserves `commit: c1` and `previous: c0`. On recovery `previous === sha`, so the new resuming branch calls `writeDeploySuccess(c1, record.commit)` and stores `previous: c1`. This confuses retrying an already deployed commit with completing a flip from a different last successful commit.

CLI reproduction: deploy c0 then c1, retain c0's actual recorded replacement stamp but age it to 25 hours as the planned retention fixture does, make the temporary remote inaccessible for one next pass, restore it, and run next again without changing main. Before outage, c0 exists and the record names previous c0. After recovery, the record names c1 as both commit and previous, and `pruneReleases` deletes c0 immediately. Both observations are in the retained probe output.

Consequence today: a transient network failure permanently removes the protected previous release, violating criterion 5's explicit requirement that current and previous are never deleted. The regression is introduced by the repair's resumed-success previous selection. Preserve the previous field when recovery concerns the already successfully deployed commit, while retaining the last successful commit when finishing an actual interrupted switch. Add a CLI regression for same-commit fetch recovery with an aged protected previous release. The new interrupted-deploy test uses a synthetic failure record with no prior commit/previous, so it cannot catch this case.

Evidence: `check recheck-B-previous-protection: 0 implementation/check-recheck-B-previous-protection-1792123753962-1070539.log`, read back with `akrogon log`. Excerpts: before `oldReleaseExists: true`; after `oldReleaseExists: false` and the same SHA in `commit` and `previous`.

### Verification and documentation

Read the unchanged install guide for the failure-preservation and automatic-first-switch contracts. No documentation or AREA file changed in the repair. The guide's promise that the failed step retries without other changes is contradicted by F5, not a separate documentation finding.

Read back `check repair-A-F1-red: 1 implementation/check-repair-A-F1-red-1792121911226-3173931.log` and `check repair-A-deploy-tests: 0 implementation/check-repair-A-deploy-tests-1792123099014-3696878.log` (52 pass). Checked the final receipt `8c5e6c13-6aad-4f7a-b38f-342a8764a01b` for the exact reviewed head, which confirms setup zero and all commands green. The report's cited full-suite path belongs to the preceding unformatted head, so the current receipt and these current logs were checked directly instead. Current logs, all read back:

- E4: `verify format: 0 implementation/check-format-1792123471071-523906.log`.
- E5: `verify test: 0 implementation/check-test-1792123606803-523906.log` (968 pass, zero fail, 9731 assertions).
- E6: `verify typecheck: 0 implementation/check-typecheck-1792123608794-523906.log`.

No planned test or runner configuration was skipped or disabled. No full-suite rerun was necessary: retained verification is current, and the specific CLI probes establish F5/F6. Probes ran with configured frozen setup under flock, temporary HOME and bare remotes, fake herdr/systemctl and finally-block fixture cleanup. No live installation or external resources were changed. Temporary review scripts were removed after evidence capture.

### Repair Test-Change trailers

Original T1-T6 remain listed above. Additional trailers in the repair range:

| Ref | Commit | Trailer and judgment |
| --- | --- | --- |
| T7 | a937dfc | `Test-Change: tests/release-deploy.test.ts review-B F2 and brief criterion 4: an inaccessible configured remote must persist the attempted commit and fetch failure while current stays active` — supported CLI regression for F2. |
| T8 | b476888 | `Test-Change: tests/release-deploy.test.ts review-B F3 and brief criterion 5: actual deployment replacements must start retention and next must prune expired releases while protecting current and previous` — supported CLI regression for F3. |
| T9 | 2edd5b8 | `Test-Change: tests/install.test.ts review A F1 / review B F1 and brief criterion 4: a deploy failing in the links step must not flip current onto the attempted release; conflict removal retries the deploy` — correction is supported by criterion 4. F5 identifies a product behavior the corrected expectations do not catch. |
| T10 | 2edd5b8 | `Test-Change: tests/release-deploy.test.ts review A F1 and brief criterion 4: a recorded failure with attempted == active must print in status and the next pass must finish the interrupted deploy` — supported by F1 and criterion 4. |
| T11 | cfadc48 | `Test-Change: tests/install.test.ts prettier reflow of the criterion-4 expectation corrections` — whitespace only, no expectation change. The final verification runs after this change. |

No deferred Nits or operator actions. Verdict fix for F5 and F6, both introduced by the repair.


## 2026-10-16 check.repair B, round 2

Start: `cfadc48bc2daac78e34d2e029090f42cb4554cee`.
Committed repair head: `5d46382338566abdc27c154fcd1d8c26a1e267bf`.
Latest reviewed findings are F5/F6. No operator actions, locked decision changes or new live actions are needed.

### F6 repaired

Reproduction commit: `179e83232b5467735683ccdaee690729c36bfcf8`.
Product fix: `5d46382338566abdc27c154fcd1d8c26a1e267bf`.

The resumed-success path now distinguishes recovery of the last successfully deployed commit from finishing an interrupted switch to a different commit. Same-commit recovery retains the stored previous field. `writeDeploySuccess` also retains the outgoing release's original replacement timestamp when the last successful commit is unchanged, so a transient outage cannot restart its retention clock.

Why the earlier repair missed: it treated `record.commit` as the outgoing commit for every resume. That is correct after a flip to a different commit, but after a fetch outage `record.commit` already equals current. The interrupted-deploy proof had no successful prior commit/previous pair and could not expose that distinction. Merely correcting the previous SHA would still refresh the timestamp, so both the caller's selection and the writer's stamp condition were fixed.

Root-cause search: `rg -n "writeDeploySuccess|readDeployRecord" src` finds one success writer and one caller, plus failure preservation, prune and status readers. The only success caller is repaired; the only replacement-time update on success is repaired. Ordinary fresh deploys still stamp the outgoing release, and actual interrupted-switch recovery still uses the differing last successful commit. No other success writer or caller remains with the mechanism.

One new CLI regression deploys c0 then c1, ages the real c0 replacement stamp, makes the temporary remote inaccessible, restores it without changing main, and verifies c0 stays previous and retains its timestamp. It then deploys c2 and proves the now-unprotected aged c0 is removed while c1/c2 remain. Existing tests and expectations were not changed. The reproduction commit has the exact changed test path and F6/criterion-5 source in its final Test-Change trailer.

- R2-red: `check repair2-B-F6-red: 1 implementation/check-repair2-B-F6-red-1792123900546-1135754.log` — fails because previous is the active SHA instead of c0.
- R2-green: `check repair2-B-F6-green: 0 implementation/check-repair2-B-F6-green-1792123908694-1139745.log` — 1 pass, 10 assertions, final committed source/test versions.

Both logs were read back with `akrogon log`.

### Planned proofs

All existing criterion proofs, authored before B's repair, were rerun on the committed head with their planned `bun test tests/release-deploy.test.ts -t <case>` filters through run-check, after the configured frozen install under flock. All passed and every log was read back with `akrogon log`:

| Criterion | Retained result |
| --- | --- |
| C1 | `check repair2-B-C1: 0 implementation/check-repair2-B-C1-1792123919868-1145544.log` |
| C2 | `check repair2-B-C2: 0 implementation/check-repair2-B-C2-1792123919906-1145542.log` |
| C3 | `check repair2-B-C3: 0 implementation/check-repair2-B-C3-1792123919986-1145541.log` |
| C4 | `check repair2-B-C4: 0 implementation/check-repair2-B-C4-1792123920145-1145543.log` |
| C5 | `check repair2-B-C5: 0 implementation/check-repair2-B-C5-1792123920203-1145547.log` |
| C6 | `check repair2-B-C6: 0 implementation/check-repair2-B-C6-1792123919865-1145540.log` |
| C7 | `check repair2-B-C7: 0 implementation/check-repair2-B-C7-1792123919877-1145545.log` |
| C8 | `check repair2-B-C8: 0 implementation/check-repair2-B-C8-1792123920070-1145546.log` |

All fixtures use temporary HOME/bare remotes and fake herdr/systemctl, with finally-block cleanup. No live host resources or grant expansion. No temporary scripts/helpers were created. No docs or index edits were made.

### Handed to A

- F5: correction of an existing test expectation, explicitly excluded from B repair by check-issue. `tests/install.test.ts`'s conflicting-directory test requires creating `current/skills/*` links while current remains absent. Those assertions require the partial link mutation responsible for F5. Correct those expectations and the product ordering together, with the CLI preservation cases recorded in the latest review: an existing workspace-pointing command must remain usable on first-switch conflict, and an active release's skill links must survive a rejected add/remove deployment without new dangling links. Planning currently mutates stale links as well as apply mutating planned links, so validating conflicts after either mutation is too late. F5 remains wholly open; no partial product change was made.

No deferred Nit or operator-only finding is held by B. The next phase is check.fix for F5 after verification.


### Round 2 final verification

`akrogon verify` on `5d46382338566abdc27c154fcd1d8c26a1e267bf` completed green. All configured checks ran on the fresh checkout; no merge checks ran. Logs read back with `akrogon log`:

- V4: `verify format: 0 implementation/check-format-1792123920410-1144910.log`.
- V5: `verify test: 0 implementation/check-test-1792124056529-1144910.log` — 969 pass, zero fail, 9741 assertions.
- V6: `verify typecheck: 0 implementation/check-typecheck-1792124058482-1144910.log`.

Worktree clean after both commits. F6 is repaired and verified. F5 remains handed to A under the existing-test-expectation exception, so this pass requests check.fix.


## 2026-10-16 check.review B after round 2 check.fix

Verdict: ready.
Original base: `83b92799495c40595a09ca13e08c588f89ae66ca`.
Prior reviewed head: `cfadc48bc2daac78e34d2e029090f42cb4554cee`.
B repair handoff: `5d46382338566abdc27c154fcd1d8c26a1e267bf`.
Reviewed head: `cc09b62f6acbb95e64a46ea62e6b91b851951b88`.

Reviewed the repair range only: B's F6 reproduction/fix already recorded above, then A's `140929f` test corrections and `cc09b62` product repair. The branch was already on origin/main, with no refresh or rebase, so no range-diff is needed. No code/tests changed, no commits made and no live mutation performed during this review.

### Findings confirmed

- F1: closed. Recorded failures remain visible and interrupted deployment work retries. Conflict rejection preserves current.
- F2: closed. Records fetch/push failures still continue through deploy handling and persist deployment failure.
- F3: closed. Actual replacement stamps and unchanged-main pruning remain in place.
- F4: closed in the prior re-check. The deliberate-break evidence remains retained; the current full suite exercises the final tests.
- F5: closed. `planSkillLinks` now returns stale paths without unlinking them. Deploy refuses conflicts before applying or removing any links. Its successful path applies planned links and removes only stale destinations outside the planned set. The install caller explicitly retains its previously tested prune-before-refusal behavior. All planner callers were checked. The corrected install conflict case and both new CLI regression cases fail on the rejected product head and pass on this repair: the first-switch workspace command remains usable, and a rejected add/remove preserves the active skill links without adding dangling links.
- F6: closed. Same-commit recovery retains the real previous release and original replacement stamp; the new regression also proves a later actual deployment prunes the old release only after it loses previous protection. No change to that repair in A's F5 diff.

No new concrete defect introduced by the repair was found. No unresolved Fix, deferred Nit or operator action remains.

### Verification evidence

Read back with `akrogon log`:

- E7: `check repair2-A-F5-red: 1 implementation/check-repair2-A-F5-red-1792124369775-1770155.log` — all three corrected/new cases fail before the fix at the intended link-creation, command-repoint and active-skill-removal assertions.
- E8: `check repair2-A-deploy-tests: 0 implementation/check-repair2-A-deploy-tests-1792124812340-1975693.log` — 55 pass across the three affected test files, including both F5 CLI cases, F6 and all planned criterion cases.
- E9: `verify format: 0 implementation/check-format-1792124817394-1990915.log`.
- E10: `verify test: 0 implementation/check-test-1792124953994-1990915.log` — 971 pass, zero fail, 9764 assertions.
- E11: `verify typecheck: 0 implementation/check-typecheck-1792124955983-1990915.log`.

Verified receipt `fadf6b98-bb82-42b9-bff0-9f6e3c9b9c28` belongs to the exact reviewed head/tree, has setup zero, all configured commands zero and a completed end time. Evidence follows the latest source/test/helper changes, with no skipped or disabled planned test or runner. The report's final test count says 969; the actual retained final log records 971, a non-material reporting count mismatch. No extra full-suite rerun was needed.

Read the unchanged install guide for the affected behavior. This repair restores documented failure preservation and adds no new documented behavior. No AREA/index or lesson file changed in this repair range. Worktree clean and HEAD unchanged at review end. No reusable deferred Nit is held, so no lesson write is needed.

### Additional Test-Change trailers

T1-T11 remain recorded in the earlier reviews. New trailers in this repair range:

| Ref | Commit | Trailer and judgment |
| --- | --- | --- |
| T12 | 179e832 | `Test-Change: tests/release-deploy.test.ts review-B F6 and brief criterion 5: recovery from an inaccessible remote on unchanged main must retain the protected previous release and its original replacement timestamp` — supported F6 reproduction, with red/green evidence above. |
| T13 | 140929f | `Test-Change: tests/install.test.ts review-B F5 and brief criterion 4: a links-step conflict must leave every planned destination untouched, not partially applied` — supported correction to the expectation that required broken partial deployment. Conflict/retry coverage remains. |
| T14 | 140929f | `Test-Change: tests/release-deploy.test.ts review-B F5 and brief criteria 3/4/6: CLI regressions prove a first-switch conflict keeps the workspace-pointing command usable and a rejected add/remove keeps the active release's skill links` — supported by F5's real installation paths and explicit done outcomes. |

Requested next phase: merge, verdict ready.


## 2026-10-16 merge B

Attempt: `0a40dd8b-3e8c-4010-bc10-51b33fdb8d07`.
Applied memberless top: `4e2ecd24c22954c84d76bf00da4503c8b4270dcf`.
Built on origin/main: `0bea6beca6a516ef6d6d8cba4009d7370d381253`.
Prior reviewed head: `cc09b62f6acbb95e64a46ea62e6b91b851951b88`.

Worktree clean and HEAD matches the requested applied top. No fetch, rebase or commit performed by this merge seat. Computed `git range-diff 83b92799495c40595a09ca13e08c588f89ae66ca..cc09b62f6acbb95e64a46ea62e6b91b851951b88 0bea6beca6a516ef6d6d8cba4009d7370d381253..HEAD`: all 21 reviewed commits map unchanged to their rebased equivalents. Evidence: `check merge-B-owner-context: 0 implementation/check-merge-B-owner-context-1792125103363-2543415.log`, read back with akrogon log. The absent owner brief.md was resolved to the actual ISSUE.md index; its state-home/release-deploy/release-rollback briefs were gathered before completion.

`akrogon verify --attempt 0a40dd8b-3e8c-4010-bc10-51b33fdb8d07` completed: `verify merge 4e2ecd24c22954c84d76bf00da4503c8b4270dcf: green`.

- M1: `verify format: 0 implementation/check-format-1792125103986-2542806.log`.
- M2: `verify test: 0 implementation/check-test-1792125244632-2542806.log` — 980 pass, zero fail, 9835 assertions.
- M3: `verify typecheck: 0 implementation/check-typecheck-1792125246620-2542806.log`.

All listed logs read back with akrogon log. No merge_checks, merge_covers or advisories configured. No red or inconsistent run. Proceeding to the command-owned check stamp and push for this attempt.


Merge result: `akrogon phase release-deploy merged --slot B --check --attempt 0a40dd8b-3e8c-4010-bc10-51b33fdb8d07` printed `ok`. The subsequent command-owned push/move with the same attempt exited zero and printed:

```text
moved merged
deployed 0bea6beca6a5..4e2ecd24c229
```

No issue-complete or epic-complete line was emitted, so no broadcast was due. The run-release owner still includes release-rollback. Final result: release-deploy merged at tested top `4e2ecd24c22954c84d76bf00da4503c8b4270dcf`.
