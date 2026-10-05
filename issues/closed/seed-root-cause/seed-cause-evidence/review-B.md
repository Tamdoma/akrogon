# Review B: seed-cause-evidence

Date: 2026-10-05. Phase: check.review. Verdict: fix.
Base: `ce4c9813982b690c78f075d1aecbb17ebcb01f9c`.
Reviewed head: `3b8fdb5fa776da6c90a23f4e5c051d9b49392c4f`.

## Scope and verification

Read the brief, plan, design, implementation report, verification/results.md, check-issue/ponytail.md, changed skill, affected create guide and reference index. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read.

The diff changes only skills/seed-issue/SKILL.md and docs/guide/create.md. Routing and compaction text are unchanged. No AREA.md is changed. The live guide describes the new section, bounded discovery, related searches and optional root-report line. A targeted documentation search found no stale five-section or diagnosis prohibition in the operator docs.

Inspected actual argv logs, submitted bodies and create-count files under `/tmp/seed-replay-kCKg/capture/`, plus replay-agent transcripts identified below. `git diff --check ce4c9813982b690c78f075d1aecbb17ebcb01f9c...HEAD` passed. The implementation records format and typecheck clean, 415 passing tests, and no changed test files. These repository checks were not repeated for this Markdown-only diff because the concerns are replay outcomes, not executable repository code.

The report enumerates 19 rule groups, including each of the five new placeholders separately. Its allowed report/outcome merges retain their meanings. The skill is 82 lines and 6,345 bytes, within the stated size ceilings. Only pi replay agents were exercised, and the report names other harnesses as unproven.

## Test-Change trailers

None in `ce4c9813982b690c78f075d1aecbb17ebcb01f9c..HEAD` (commits 0d15906, 5267b76, 3b8fdb5). Neither changed path matches src/test-files.ts, so none is required.

## Fixes

### F1. Reporter diagnosis remains in Observation

Source: the actual Tamdoma/tamdoma-framework#124 reporter body, preserved in verification/inputs/r124.txt and exercised by the r124 replay. It contains both observed refusal output and checkManifestRule reasoning.

Trace: skills/seed-issue/SKILL.md:26 requires preserving supplied facts and describes the title as observed, while the Observation placeholder at :32 only says what happened. Neither tells the writer to move supplied reasoning out of Observation. `/tmp/seed-replay-kCKg/capture/r124/create-body.md` keeps the paragraph explaining checkManifestRule's supersession requirement, the manifest check passing, and only dispatch records blocking close in Observation, while adding further reasoning in Suspected cause. Merely duplicating reasoning in the cause section does not separate observations from hypotheses. The implementation nevertheless lists C1 placement as proven.

Consequence today: filing this motivating report still mixes mechanism claims into the observed facts. Readers cannot rely on the section boundary to distinguish reported symptoms from diagnosis.

Criterion: brief done-criterion 1 explicitly requires Observation to hold only what was seen and #124's checkManifestRule reasoning to be in Suspected cause rather than Observation.

Required repair: make the existing report/template instruction express that separation, preserving the rule budget, and replay #124 with the captured submitted body proving the reasoning moved while supplied symptoms remain complete.

### F2. The replay evidence does not establish required outcomes at the reviewed head

This is a material verification gap under the named done-criteria, not a claim that every replay mistake requires more production instructions.

- The captured #126 submission (`capture/r126/create-body.md`) is 15 lines / 1,057 bytes, ends mid-sentence at “Not provided. The reporters”, and contains only Observation, Location and Reproduction. Expected behavior, Urgency and Suspected cause are absent. verification/results.md claims it demonstrated “none found” metadata, which is absent from the actual submitted body. Done-criteria 1, 5 and 8 are not established for this replay.
- The failed-lookup run (`capture/s8-faillist/create-count`) contains two entries. Its calls.txt records two successful create invocations and a view of issue 42 that the reporter did not supply. The replay-agent transcript explicitly says the first create returned success and then deliberately creates again after a truncated heredoc. This fails the required exactly-one-create outcome, regardless of calling it an actor artifact. Its final outcome is only a success URL plus “intake submitted”, with no lookup command/error. Done-criteria 6 and 8 are not established by this run.
- Commit 3b8fdb5 changes the footer after these replays. No replacement replay or captured final outcome at that head is provided for the known failures. The r125 transcript prints a root line but its footer does not name it. The report's reference to s5 not naming a printed root line is also inaccurate: s5 suppresses the line because #128 exists. The corrected footer outcomes required by criteria 6 and 8 therefore remain unproven.
- No captured successful body links a closed precedent. The keyword noise cases exclude closed #84/#38, which proves rejecting noise but not linking relevant closed evidence (criterion 5). No deliberate rule-removal break is recorded for the new behavior, although the design's verification contract requires it.

Consequence today: the handoff claims all criteria demonstrated while preserved submissions and final outputs contradict that claim. It cannot establish complete reports, one creation during lookup failure, or the corrected final outcomes.

Required repair: redo the affected boundary replays using the final skill and shell-safe submission, keep actual argv/stdin and final output evidence, demonstrate a relevant closed precedent and the required deliberate break, and correct results.md/report.md to match the captures. Keep create substituted. A clean replay can resolve actor mistakes without adding unrelated skill guards.

Transcript evidence (read only these replay-agent sessions, not the implementation agent's later review):
- s8: `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-seed-cause-evidence--/2026-10-05T11-00-34-177Z_01a10bb8-f901-73d9-a0f0-0685bcd0fe78.jsonl`.
- r125: same directory, `2026-10-05T10-54-34-394Z_01a10bb3-7b9a-73d9-a0f0-067c09163625.jsonl`.
- s5: same directory, `2026-10-05T10-58-04-547Z_01a10bb6-b083-73d9-a0f0-06810d798204.jsonl`.

## Operator actions

None. All listed repairs can use local reads and the already authorized substituted-create proof boundary.

## Verdict

fix. Request check.repair. F1 requires a behavior repair and F2 requires corrected verification evidence, with required live runs handed to A if needed under the repair skill.


## 2026-10-05 check.repair

Repair head: `57bbe3c` (parent reviewed head `3b8fdb5`).

### F1 repaired

Commit `57bbe3c` changes only the existing report-rule sentence in skills/seed-issue/SKILL.md. This instruction/document repair uses quoted before/after evidence, not a prose-matching repository test.

Before: “and the six body sections below, identifying the report as unverified intake”. The prior r124 capture retained the supplied checkManifestRule explanation in Observation.

After: “and the six body sections below, keeping Observation to what was seen and placing supplied or inferred cause reasoning in Suspected cause, identifying the report as unverified intake”. No new sentence, placeholder, dependency or routing change was added. This stays within the existing merged report rule, preserving the disclosed 19-rule grouping.

B performed a local model-authored #124 replay using the original reporter input and the final skill. Source inspection read blueprintPhaseRecords/checkManifestRule in the named advance-phase.ts and the one-hop checkpoint control in userprompt-controls.ts. Root routing and origin both identify Tamdoma/tamdoma-framework as destination source. Discovery ran no project command, install, edit or reproduction.

Boundary evidence: `/tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/seed-B-F1-y8uzudls/`. The existing gh shim served the historical case-124 list outputs. B passed the authored literal body via subprocess stdin, avoiding shell/heredoc quoting. calls.txt contains exactly the author lookup, keyword lookup and one substituted create, all exit 0. create-count has one entry. create-body.md contains all six complete sections. Observation contains the supplied variant selection, files-on-disk observation, refusal and failure-marker values. Suspected cause contains the checkManifestRule full-record-set, manifest-ordering and supersession explanations. final-output.txt records the shim's actual URL and intake-submitted footer. No root line was warranted because no linked report established the same abandoned-record refusal. No live issue was created.

This is a Codex B local replay, not an independent fresh-agent replay or the required live-read scenario. Those limits remain explicit for A's final verification.

### Checks at repair head

- `bun run format`: exit 0, every formatted file unchanged.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, two changed Markdown files, no affected tests.
- `bun test --timeout=30000`: exit 0, 415 pass / 0 fail, 4,566 assertions. Log: `/tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/tmp.zmGoOPVJ5x`.
- `git diff --check`: clean. Worktree clean after the commit.

No merge_checks were run. No test file changed, so no Test-Change trailer was required.

### Done-criterion audit

C1 has repaired #124 separation evidence above; the prior s10 copy-provenance evidence remains available. C2/C3 retain their thin-input and contradicted-suspicion captures. C4 has bounded local source-read evidence for this replay, while the full replay audit remains with A. C5 is still pending the relevant closed precedent. C6 is still pending a clean failed-lookup final outcome. C7/C10 pass for this repaired capture (list/list/create only; plain report identity in stdin). C8 is still pending clean one-create failed-lookup, cause-statement suppression and root-line footer proof. C9 remains pending replacement of the truncated #126 submission. C11: 82 lines / 6,451 bytes (about 1,613 tokens by the design's estimate), existing 19-rule grouping and explicit harness limits. C12: live create guide still matches the repaired skill, with no guide change needed.

The incomplete criteria are not claimed passed. The original implementation report/results retain their reviewed errors until A replaces the invalid proof and corrects those claims.

## Handed to A

- B F2 and A Fix 1: replace the invalid/incomplete replay evidence and correct verification/results.md plus implementation/report.md. This requires the final-skill replay matrix, including the design-mandated real read-only gh list/view run with create substituted, so it belongs to A under check.repair's required-live-runs exception. Include clean #126 and failed-lookup submissions, closed-precedent linkage, cause-statement suppression, printed-root-line footer, and the deliberate rule-removal break. Recheck #124 separation in that independent replay matrix. Keep the live create prohibition and prior scenario limits explicit.

No operator action is open. Next phase requested: check.fix, because this verification Fix remains handed to A.


## 2026-10-05 re-check after check.fix

Prior reviewed head: `3b8fdb5fa776da6c90a23f4e5c051d9b49392c4f`.
Repair/reviewed head: `57bbe3c5c3f4822a26cacaaad0313a158e7efeac`.
A added no code commit after B's instruction repair. Inspected only that one-sentence repair diff and the replacement report/replay evidence against the existing findings. `git diff --check 3b8fdb5..HEAD` passed and the worktree is clean. No new blocking code finding is introduced. Repository checks are reused from B's repair at this same head: 415 pass, format/typecheck clean, no affected changed tests. No Test-Change trailers or test paths were introduced.

### F1 status

The instruction repair remains appropriate, but A's independent #124 replay does not establish the required outcome. `/tmp/seed-replay-r2/r124b-body.md` still puts “The same check also requires ... superseded by a later completed record” and “the manifest's file-presence check passes. Only the dispatch records block the close” in Observation. This is the same supplied checkManifestRule reasoning identified by F1. The report's claim that r124b keeps only supplied facts in Observation is contradicted by its own draft. B's local corrected replay remains evidence for the instruction change, not a substitute for the claimed independent replay passing C1. The remaining outcome proof is included in F2 below; no further guard or broad rewrite is demanded solely because an actor failed to follow the existing rule.

### F2 remains blocking

The replacement evidence does not resolve the prior material verification gap:

1. **Submitted bodies are empty.** Direct `wc -c` reports zero bytes for all six main replacement captures: `capture/r124b/create-body.md`, `r125b`, `r126b`, `closedprec`, `causestmt`, and `faillist`, under `/tmp/seed-replay-r2/`. calls.txt records body-file paths, and separate authored drafts are nonempty, but those drafts do not prove what the substituted create consumed. The report claims complete captured submissions. C1/C5/C6/C8/C9/C10 therefore lack the asserted boundary evidence. Fix the capture boundary and rerun affected cases, rather than copying drafts into old capture files after the fact. Use the skill's literal stdin interface to avoid changing the proof interface.
2. **The #126 title still contains parser diagnosis.** `capture/r126b/calls.txt` passes “Motion coverage CLI parses the required application/json font-delivery script as JS ...” as the title. C9 explicitly requires this motivating #126 replay to omit parser diagnosis. Calling this a reporter cause suspicion in results.md does not satisfy the locked outcome. This remains the existing F2 #126 verification repair, not a new acceptance condition.
3. **The corrected printed-root-line footer is still unexercised.** Intact r125b and r125c both suppress the root line, so neither tests the footer naming a printed line at the repaired head. Retaining old r125 proves the old print but its footer says only intake submitted. The no-rootline variant is not a demonstrated fail-after-rule-removal pair because the corresponding intact round-2 run also prints no line. C8 and the existing deliberate-break verification gap remain open. Supply a qualifying intact replay with a printed line and matching footer, then its meaningful broken variant.
4. **Cause-statement suppression is masked.** The dedicated causestmt world already includes #128 covering the condition; its transcript explicitly explains suppression by existing coverage. Removing the cause-statement exclusion would still suppress the line. A Fix 1's stated scenario was a cause statement in a world with siblings; choose siblings sharing the condition but no report covering the cause/cases, so that this exclusion is actually exercised.

The failed-lookup replay transcript now does disclose the lookup error in its footer, and its create-count records one invocation. This is progress, but the zero-byte submitted-body capture still prevents end-to-end C6 proof. The closedprec draft links closed #40 with a reason, but its zero-byte create-body capture likewise prevents concluding the filed report carries that link. The discovery-removal variant honestly records no behavioral change; it does not supply the missing deliberate-break proof.

All concerns above confirm prior findings using the replacement artifacts. No repository tests were rerun because no code changed after the already green repair checks and the failures are in the named scenario outcomes/evidence.

Operator actions: none. Verdict: fix. Request check.repair with F2 (including independent F1 outcome proof) and A Fix 1 still unresolved. The repair seat should complete capture/proof corrections it can, or hand required live runs to A under the existing rule.


## 2026-10-05 check.repair, second pass

Code head remains `57bbe3c5c3f4822a26cacaaad0313a158e7efeac`. This pass repairs F2 and the overlapping A Fix 1 through actual local boundary replays and corrected pass artifacts. F1's required #124 separation outcome is demonstrated in the replacement submitted body. No code, test or plan/design change was necessary; no additional commit was made because only authoritative leaf pass artifacts changed.

Before: six primary round-2 submitted-body files were zero bytes; #124's draft repeated mechanism reasoning in Observation; #126's argv title named parser diagnosis; no repaired-head run printed a root action with its footer; the cause-statement test was masked by #128 coverage.

After: `/tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/seed-B-proof-7v0irj41/` contains seven intact local model-authored cases and three deliberate-break variants. Every run has one create invocation, nonempty captured stdin, and a saved final outcome. Creates use the literal `--body-file -` interface and actual captured bytes match the authored input. Original bad captures remain untouched. No live create, linked-issue mutation, fixture resources or cleanup identities were involved. No iteration-created executable helper remains.

Specific repaired outcomes:
- r124: 2,927 submitted bytes; observed selection/refusal/record values preserved, full-record/supersession reasoning confined to Suspected cause.
- r126: 2,701 bytes; title describes CLI exit and findings on working UI rather than parser diagnosis; all six sections complete; unrelated same-session reports excluded.
- r125: 3,031 bytes; linked #124 shares record blocking but does not cover the combined direct-mode-invisibility condition/cases; root action prints and Next reason names it. Historical identities and substituted URL limits are explicit.
- causestmt: 2,366 bytes; only #124/#127 symptom reports in the controlled world, with no #128/#125 covering cause; the cause-statement guard alone suppresses the otherwise qualifying root action. Its guard-removal variant emits the action, demonstrating the required outcome check would fail.
- closedprec and closed-only: 2,025 and 2,947 bytes; CLOSED #40 is a labelled hand-written fixture linked as evidence, not a live-history assertion. closed-only has no open shared-condition report, so it cannot trigger the root action.
- faillist: 1,888 bytes; two failing lookups, each retried once after a visible warning; one submitted report, with command/error and failure in the final outcome. No extra create or reporter-unsupplied view.

Deliberate root-rule removal loses the action in the same qualifying r125 world; lookup removal eliminates the list calls; cause-guard removal wrongly emits an action for the isolated cause statement. These are B model-judged functional comparisons, not independent model runs or prose-matching tests. Removing only discovery's prose rule remains redundant with the files-read placeholder, and this limitation is preserved.

verification/results.md is rewritten around actual evidence, source inspection, retained valid scenarios and explicit limits. implementation/report.md now names the correct head, current byte count and these proofs. The old round-2 draft/capture claims and old s8 duplicate-create success claim are not passing evidence.

Done-criteria: C1 through C12 are audited in verification/results.md. The new local proofs cover the open outcome gaps. Previously valid unsupported, contradicted-suspicion, copy-provenance, failed-creation and real read-only post-#128 scenarios are retained for unchanged behaviors. No fresh independent-agent claim is made for B's local replays. Cross-org views and unexercised harnesses remain unproven as permitted by the design.

Required checks rerun at the unchanged code head: format exit 0 (all unchanged), typecheck exit 0, changed-test command exit 0 (no affected files), full test exit 0 (415 pass, 0 fail, 4,566 assertions, 12.19 seconds). Full log: `/tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/tmp.LovAqt6F8G`. No merge_checks run. No Test-Change trailer needed.

### Handed to A (current)

None. The prior handoff is resolved by this pass's local replacement proof and retained valid live-read scenario. No operator action is open. Request merge.


## 2026-10-05 merge

Configured remote/branch: origin/main. Fetched origin and rebased successfully; no conflict, no changed head. Target/base: ce4c9813982b690c78f075d1aecbb17ebcb01f9c. Prior reviewed and merge head: 57bbe3c5c3f4822a26cacaaad0313a158e7efeac. Refreshed akrogon config after rebase confirms that base. No scoped outstanding worktree changes or reusable held Nit remain.

All configured checks pass: format (all unchanged), typecheck, full tests (415 pass, 0 fail, 4,566 assertions, 12.26 seconds), changed tests (two Markdown changes, no affected test files). Full test log: /tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/tmp.6afBdfOvue. merge_checks and advisory are empty. git diff --check passes and worktree is clean. akrogon phase seed-cause-evidence merged --slot B --check returned ok. No changed test paths require Test-Change trailers.

Completion context gathered before movement: seed-root-cause has one leaf, seed-cause-evidence. Its brief records bounded discovery, unverified cause/evidence gap, related-report lookup, conditional optional root-report action, observed-only titles, and one issue per filing. No live proof resource was created, so fixture cleanup is not required.

Push confirmed: git push origin HEAD:main exited 0, fast-forward ce4c981..57bbe3c.
