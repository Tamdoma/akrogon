# Review B: lean-exchange

Date: 2026-10-17. Phase: check.review. Verdict: **fix**.

Base: `17d611718c20e9a04ae67a5e547ed3a28c3c716e`.
Reviewed head: `78c5ed38932746506c6d9e2217a3cdd5a7022e25`.
Initial blind review. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. Worktree was clean and no code was changed.

## Fixes

### F1: A partial restart emits the previous session as the new receipt

`skills/chart-issues/scripts/peer-restart.ts:238` emits states on a later seat's start failure before the post-start resolution at line 248. `State.session` still contains the pre-restart value, and `emit` prints that value for an earlier successfully restarted seat. The same stale emission occurs if the final roster read fails.

Realistic source: the actual multi-seat restart integration can refuse or time out a start. The implementation report records a live cold-start timeout, and autopilot explicitly retains seats whose printed state is `restarted` when another seat fails. Trace: start B successfully, fail C's start, emit B with its old session, then the Open rule consumes that receipt as a fresh seat record. This loses or misattributes B's restarted-session usage today. It violates brief criterion 6 and plan D4.

The existing fake-herdr restart harness reproduced the partial-start path: B's receipt said `session: before-B`, while the resulting roster said `session-101`. C was `stopped`, exit 1. The temporary probe was removed and its child processes cleaned up. Fix session resolution for every emission path following a successful restart. Never emit the stored pre-restart session as a fresh receipt.

Evidence: `check review-b-partial-restart: 0 implementation/check-review-b-partial-restart-1792263417751-3370558.log` (probe succeeded in demonstrating the script's exit-1 partial restart and wrong receipt). Read back through `akrogon log`.

### F2: The measured runs do not establish lower spend or behavioral parity

Brief criteria 1 and 4, plan D8/D9. The report substitutes a different set of numbered criteria for the six locked criteria and never supplies the required all-seat spend comparison. The initial branch charts drop both consultants. The later README comparison uses two base exchanges versus four branch exchanges, with no fresh A session between charts. Its pi model also differs: base README uses `gpt-5.6-sol`, branch README uses `muse-wonder-full-1.0-contributor`.

The saved README USAGE files give rounded Σ(calls × average context) of 807,209 for base and 1,797,457 for branch. These unequal runs do not prove a regression caused by the change, but they cannot prove the required reduction. Harness version/argv equality is also not established in the report.

Content comparison: base `scratch-readme/slots/` has map and leaf-review returns but no fork-note or rebuttal returns. Branch `readme-file/slots/` has fork notes and rebuttals, and records C's standing dissent for both repo names. Base records B's later exact-text correction. These are useful independent contributions, but the runs do not exercise the same exchange rounds, so there is no complete comparison of preserved dissent, rebuttal disagreement, corrections, records and operator output shape.

Provide matched final-head runs with identical seat settings, fresh sessions and the same handed item, record the planned call/context totals, and review the actual records for parity. Do not call this criterion passed from call counts alone.

Evidence: `check review-b-run-details: 0 implementation/check-review-b-run-details-1792263438930-3372813.log`, read back through `akrogon log`; underlying files are `implementation/runs/{base,branch}/scratch/issues/chart/{scratch-readme,readme-file}/USAGE.md`, CHART.md and slots. The report itself describes the unequal exchange counts and dropped seats.

### F3: The required consultant reading outcome is not proven

Brief criterion 3 and plan D9 require section reads without repeated held content, with read calls shown for both runs. The report admits B read the whole installed SKILL.md and both consultants repeated INTAKE.md. It labels these deviations a pass because the instruction is normative, but the criterion requires the observed outcome. It provides prose summaries rather than the planned complete per-call/path accounting for both consultants on both runs.

The saved branch C transcript confirms INTAKE reads at lines 8 and 23 and section extraction afterward. Nothing in the report establishes a content change or compaction between those intake reads. The report's explanation that B's installed skill predates the branch rule also means its process-source provenance needs to be resolved before accepting a branch-skill proof.

Use the existing transcripts and runner to supply the missing call/path accounting and explain permitted rereads with evidence. If the run does not meet the outcome, rerun both measured runs under the locked repair scope. This finding requests observed proof, not a wording test or a new enforcement feature.

Evidence: implementation/report.md, Consultant read tallies; `check review-b-run-details: 0 implementation/check-review-b-run-details-1792263438930-3372813.log` (read back).

### F4: The timeout proof does not exercise the required rerun

Brief criterion 5 and plan D10 require a separate exchange where one pre-prompt wait times out, no peer is prompted, the whole chain exits non-zero, and rerunning the whole chain prompts each peer once. The report records only a busy-pane wait timing out and infers short-circuit/rerun behavior. There is no kept chain-timeout log, observed zero-prompt result, or successful whole-chain rerun with exactly one prompt per peer. The readiness probe predates implementation and uses echo rather than the required peer exchange.

Run the planned separate timeout exchange through the existing herdr/peer-ask machinery, keep the command and both results, and record prompt counts and cleanup. The current wait-only observation does not prove the named criterion.

Evidence: implementation/report.md criterion-results row 4, readiness.yaml proofs, and the implementation artifact inventory in `implementation/check-review-b-diff-1792263388853-3363761.log`. That log was read through `akrogon log` as part of diff inspection; no chain-timeout evidence is named by the report.

### F5: The guide makes codex seat recording depend on a line that cannot update

`docs/guide/chart.md:162` and `:174` say a restarted seat is appended only when its restart line reports a session, including codex after its first exchange. A restart line is emitted once, before that exchange. On the documented codex path it contains `none`; the later session arrives on the exchange outcome line instead.

Realistic source: an operator following the guide's seat-record instructions for a codex consultant. Consequence: no instruction there permits recording the actual post-exchange session, so the consultant's usage can remain missing. This contradicts the changed Open contract and plan D5's documentation sweep. Describe both restart and outcome receipts, matching SKILL.md. No prose-wording test is needed.

Evidence: `check review-b-line-refs: 0 implementation/check-review-b-line-refs-1792263450269-3373828.log`, read back through `akrogon log`; the live branch report records exactly the codex `none` then outcome-session sequence.

### F6: Adding the receipt also changes the carried exchange

`skills/chart-issues/scripts/peer-wait.ts:244` assigns the final roster session into `exchange.session` inside `finish`. Brief criterion 6 requires the existing `exchange` object unchanged, and plan D3 explicitly says the added field does not touch it. The new peer-ask test even expects this new mutation rather than limiting its assertion to the added top-level field.

Realistic source: the fresh codex session named by criterion 6. When a session appears during a wait that also produces a nonempty return file, the main loop returns through `finish` before the existing grace-path identity adoption. Previously the exchange retained its null seed on that path. Now the added receipt read modifies it. The same issue applies to a blocked outcome or an exhausted budget before grace adoption. Thus an additive receipt changes the rerun payload contract today.

Keep the final roster session solely in the added top-level field and preserve the prior identity-adoption behavior. Correct the new test's exchange expectation against that locked contract. This expectation correction belongs to A under the repair split.

Evidence: initial diff and `check review-b-exchange-contract: 0 implementation/check-review-b-exchange-contract-1792263459606-3374344.log`, read back through `akrogon log`; brief criterion 6 and plan D3.

## Verification

Existing latest verification logs were inspected rather than rerunning unchanged checks:

- `check format: 0 implementation/check-format-1792263152796-2871244.log`: formatting passed.
- `check test: 0 implementation/check-test-1792263308032-2871244.log`: 1,036 tests passed, zero failed, including the peer suites.
- `check typecheck: 0 implementation/check-typecheck-1792263310267-2871244.log`: tsc completed.

All three were read back with `akrogon log`. Their passing results do not cover F1's partial restart receipt or establish the live criteria. The report's per-file green log names are not present in the artifact inventory, but the current full-suite run covers those test files, so that naming gap is not a separate Fix. No test skipping, filtering or runner changes were found in the diff. Planned red logs exist. No AREA.md changed, no lesson line was removed, and no dependency changed. Documentation was checked from docs/reference-index.md through skills/AREA.md and the live chart guide.

## Test-Change trailers

The path rule in src/test-files.ts covers all four changed files under tests/. The following trailers are present in base..HEAD:

| Commit | Path | Cited source and judgment |
|---|---|---|
| a0d9a194 | tests/peer-wait.test.ts | Brief criterion 6, session on every outcome line. Existing assertions only gain the new field. Source supports the change. |
| a0d9a194 | tests/peer-ask.test.ts | Brief criterion 6, session passthrough. Source supports the field, but not the new exchange mutation expectation, see F6. |
| a0d9a194 | tests/peer-restart.test.ts | Brief criterion 6, post-start session or none. Source supports the change. |
| a0d9a194 | tests/fake-herdr.ts | Same criterion, staleSession/agent_session seeds. Source supports the fixture change. |
| 78c5ed38 | tests/peer-wait.test.ts | Brief criterion 6, correct top-level session for pi and unproven-harness session changes and extend expected type. Original exchange assertions remain. Source supports the correction. |
| 78c5ed38 | tests/peer-ask.test.ts | Same criterion, local ScriptEntry session type. Source supports the correction. |
| 78c5ed38 | tests/peer-restart.test.ts | Same criterion, mapped assertion typing. Source supports the correction. |

The other implementation commits change no test-path files. No old regression assertion was deleted or weakened beyond the cited added field. No tests of prose wording were introduced.

## Operator actions

None identified. Review required no live mutation or new permission. F2–F4 use existing planned proof machinery and require no acceptance-rule change.

## Disposition

Verdict: **fix**. Request check.repair. F1, F5 and the product portion of F6 are repairable code/docs defects. F6's expectation correction and missing live cases/captures follow the skill's handoff-to-A rule. No Nits retained.

## 2026-10-17 check.repair

Starting head: `78c5ed38932746506c6d9e2217a3cdd5a7022e25`.
Repaired head: `30a1c37dbb0f4a5ba6eb02dc050421a1c335b49f`.
Read both initial reviews. A has no Fixes. No brief, design, acceptance rule, dependency or live grant was changed.

### Repairs

- **F1 repaired:** reproduction commit `0b3ec55`, fix commit `fc76391`. One parameterized reproduction covers a later seat's refused start after B restarts, with both a fresh and a retained pre-restart session. Both cases fail before the fix. All 11 peer-restart tests, including the nine existing planned tests, pass afterward. The test commit's Test-Change trailer cites the actual restart-refusal integration and criterion 6.
- **F1 root fix:** every explicit receipt emission now goes through `finish`, which reads the final roster once if any seat restarted. `emit` compares that roster with the stored pre-restart session without overwriting the stored value. A failed final read reports its error, emits `none` sessions and returns failure. A later stop/start/poll failure therefore cannot print an old session as a fresh receipt. The full set of explicit emission paths was checked, not only the reproduced start-refusal path. This also resolves A N1.
- **F5 repaired:** commit `30a1c37`. Both affected guide sentences now permit restart and exchange outcome receipts. The detailed rule skips `none`/null and already-recorded sessions, including the codex first-exchange case. Before: “only when its `restarted` line reports a session”. After: “from the `session` field on its `restarted` line or an exchange outcome line”. No wording test was added.

### Evidence

All paths below are relative to this leaf and were read back with `akrogon log`.

- `check repair-b-f1-red: 1 implementation/check-repair-b-f1-red-1792263586861-3403719.log`: nine old cases pass, both reproduction variants fail because `session-before` is emitted.
- `check repair-b-f1-green: 0 implementation/check-repair-b-f1-green-1792263603074-3409749.log`: 11 pass, zero fail. This reruns plan criterion 6c using its existing fake-herdr boundary and tests. Setup ran under the installation lock first. The existing nine planned cases were not changed by B.
- `check repair-b-f5-before: 0 implementation/check-repair-b-f5-before-1792263607744-3412966.log`: old guide instructions.
- `check repair-b-f5-after: 0 implementation/check-repair-b-f5-after-1792263618016-3416941.log`: the two-sentence diff and separate documentation commit.

No new test, helper or fixture was added beyond F1's reproduction. F1's fixture directories and exact child processes were cleaned by the existing harness. No live resource was created or modified. Earlier peer-wait/peer-ask results remain applicable because their scripts, tests and fake-herdr inputs were unchanged in this repair. Changing peer-restart invalidates the old measured-run evidence under the brief, so the handed-off live runs must use A's final corrected head.

### Handed to A

- **F2:** brief criteria 1, 2 and 4, existing herdr/harnesses/chart-usage.ts and transcript machinery. Missing case/captures: matched final-head runs with identical models/efforts/versions/argv, fresh sessions and one handed item, all-seat spend comparison, per-exchange A calls and complete record/output parity. Rerun both measured runs after the final script/skill correction, as the brief requires.
- **F3:** brief criterion 3, existing consultant transcripts and read-call accounting. Missing capture: all consultant process reads on both matched runs, with evidence for any permitted changed-content/compaction reread and correct branch process-source provenance. An observed criterion failure cannot be relabeled a pass because the instruction is normative.
- **F4:** brief criterion 5, existing herdr wait and peer-ask. Missing case/capture: a separate actual timeout chain with zero prompts and nonzero exit, followed by rerunning the identical chain with exactly one prompt per peer, kept logs and cleanup.
- **F6:** exception: correction of a test expectation. The new peer-ask test expects finish-time exchange mutation that the locked criterion and plan D3 forbid. Handing off the whole coupled product/test correction lets A remove the mutation and correct its expectation together, without leaving B's committed head intentionally red. Existing grace-path adoption must remain intact. B did not edit peer-wait or that expectation.

### Remaining review notes

A N2 describes the final read explicitly required by plan D3, not an additional repair requirement. A N3/N4 are covered by the F2–F4 evidence handoff. No reusable Nit remains held by B, and no operator-only action was identified.

### Final verification and destination

`akrogon verify` completed at committed head `30a1c37dbb0f4a5ba6eb02dc050421a1c335b49f` and printed `verify leaf 30a1c37dbb0f4a5ba6eb02dc050421a1c335b49f: green`.

- `verify format: 0 implementation/check-format-1792263628104-3417496.log`.
- `verify test: 0 implementation/check-test-1792263785875-3417496.log`: 1,038 tests passed, zero failed.
- `verify typecheck: 0 implementation/check-typecheck-1792263790467-3417496.log`.

No merge checks were run. The committed worktree is clean. F1 and F5 are complete, while the coupled F6 correction and live acceptance proofs remain open. Destination: check.fix, slot A, with the Handed to A list above.

## 2026-10-17 check.review after check.fix

Verdict: **fix**. Original F2 and F3 remain open. F1, F4, F5 and F6 are resolved. No new blocking finding is introduced.

Prior reviewed base: `17d611718c20e9a04ae67a5e547ed3a28c3c716e`.
Prior reviewed head: `78c5ed38932746506c6d9e2217a3cdd5a7022e25`.
B repair handoff: `30a1c37dbb0f4a5ba6eb02dc050421a1c335b49f`.
Current reviewed head: `530bfd3308bed210a31e16975a5221bccea086c0`.

Scope was the five repair commits after the prior reviewed head, including B's repairs, plus the replacement evidence. The report says no rebase was needed; live `git merge-base HEAD origin/main` still gives the prior base, so no refresh/conflict-resolution range-diff was required. The worktree is clean. No code was edited or committed during re-check.

### Earlier findings

- **F1 resolved:** the repair keeps the old session only for comparison and routes explicit receipt exits through final-roster resolution. Partial failures cannot emit the stored pre-restart value. The reproduction and prior red/green evidence remain valid, and the latest full suite includes both added cases.
- **F5 resolved:** the live chart guide now names both restart and exchange outcome receipts and skips absent/already-recorded sessions. It agrees with the Open rule.
- **F6 resolved:** `530bfd33` removes only finish-time exchange adoption. The grace-path adoption remains. `bdea694f` corrects the newly introduced expectation to its null seed, citing brief criterion 6 and D3. The recorded reproduction is red before the fix and the current peer-ask/peer-wait run is green (45 tests). No older regression expectation was weakened.
- **F4 resolved for criterion 5:** the new timeout log records the nonzero first-wait timeout. The identical rerun produces one outcome per peer and exits zero, even though the vague prompt produces `failure` outcomes. Criterion 5 requires one prompt each, not successful return-file content. The later explicit-file prompt also produces two `done` outcomes. This establishes the timeout/rerun behavior missing from the initial report. The report records probe-file removal and retained run panes/tabs; it does not claim those panes were torn down.

### F2 remains open: the compared chart does not start with fresh A sessions

The replacement USAGE totals are arithmetically consistent: base AUTHORS is 2,211,236 and branch AUTHORS is 2,110,149 using the rounded per-seat averages. The pi model now matches, and the branch's three prompted exchanges each chain both waits and peer-ask in one tool call. There is no separate post-restart/exchange roster call in that branch turn.

However, both measured AUTHORS charts explicitly begin with **“Continue autopilot with a new handed item”** in the A session that already handled README. The transcript and seats.yaml evidence is direct:

- Base A session `20f47e7e-d3ec-4ea3-a1d2-75cd46487dc1`: README instruction at base-A.jsonl line 5, AUTHORS continuation at line 198; both chart seat records use that session.
- Branch A session `8db637a1-c59e-4f4d-a455-16a9d8e12856`: README instruction at branch-A.jsonl line 5, AUTHORS continuation at line 212; both chart seat records use that session.

The totals being compared cover only the later AUTHORS chart windows. They exclude each A session's earlier README work and begin with context retained from that work. Thus they are neither the whole fresh-session run totals nor a same-item comparison starting with fresh sessions. This is the same unresolved fresh-session problem from the initial F2 finding, not a requirement for identical probabilistic round counts. Brief criterion 1 and plan D8 explicitly require fresh seat sessions at the start of the compared runs.

The report also still omits the planned harness-version and full argv records. Base's exact comparison is not “~2–3/step”: the saved AUTHORS trace shows the map's waits in tool call line 241, peer-ask at 250 and a later roster read at 303. Leaf-review peer-ask is at 332, with its waits embedded in the preceding large preparation call. Branch map, rebuttal and leaf review are calls at 253, 286 and 345. Keep the actual per-step accounting instead of the approximate summary.

Required remaining proof: run the same handed item as the first work of fresh A/B/C sessions on each side, retain the seat argv/versions, and compare the corresponding complete chart windows at the final head. The existing tools suffice. Do not substitute the current warm-session subset for that criterion.

Content-parity review is improved: base maps/leaf reviews are retained, branch maps/rebuttals/leaf reviews are retained, branch C's label-versus-person dissent and attribution objections remain linked from the fork, and B's rebuttal remains independent. Both produce chart/intake/seat/usage/leaf records and Handed off footers. Different material forks can legitimately produce different round counts. This does not remove criterion 1's fresh-session measurement requirement.

### F3 remains open: the branch reading-rule outcome is still absent

The replacement branch B transcript at line 23 issues `cat /home/ivan/.codex/skills/chart-issues/SKILL.md` with a 16,000-token output budget, alongside a full standing-design read. This is whole process text during the opening map for a static AUTHORS file. The skill itself is not the subject being edited or reviewed, so the full-source exception does not justify that read. The report acknowledges that the installed copy is the pre-rule source; calling this the same provenance gap does not repair F3.

The saved branch consultant briefs contain no reference to questions.md or the consultant section-reading rule, and neither consultant opens questions.md in these transcripts. Consequently, the claim that the branch rule binds what the briefs supplied is not supported by their saved contents. Not repeating a path is only one part of criterion 3; it does not establish section reads under the branch process rule.

The report's purported complete accounting is also incomplete. For example, base B's leaf-review call at transcript line 66 reads eight paths (the five draft issue/leaf artifacts, INTAKE.md, CHART.md and shapes.md) omitted from the report's four-read list. Branch B's leaf-review call at line 93 reads five draft artifacts omitted from its eight-read list. Counts of high-level calls are not per-path counts when one call reads several files.

Required remaining proof: apply the branch reading rule to the actual consultants and provide complete call/path records for both runs, including batched shell reads. Prove section reads where process text is needed and account for any allowed reread. Do not call a full process-file read a pass merely because its path appears once. This continues original F3 under brief criterion 3 and plan D1/D9.

### Re-check evidence

The following kept logs were read back using `akrogon log`; paths are relative to this leaf:

- `check recheck-b-scope: 0 implementation/check-recheck-b-scope-1792265335941-1754983.log`: repair diff and commit trailers.
- `check recheck-b-run-records: 0 implementation/check-recheck-b-run-records-1792265360045-1771097.log`: both AUTHORS intakes, USAGE/seat/chart records, briefs and consultant tool calls.
- `check recheck-b-call-trace: 0 implementation/check-recheck-b-call-trace-1792265374438-1816464.log`: A's initial and continuation messages, exact exchange calls and seat-session reuse.
- `check fix-a-f6-red: 1 implementation/check-fix-a-f6-red-1792263885497-4018234.log` and `check fix-a-f6-green: 0 implementation/check-fix-a-f6-green-1792263915208-4020616.log`: F6 reproduction and 45 passing peer tests after correction.
- `check fix-a-chain-timeout2: 0 implementation/check-fix-a-chain-timeout2-1792264869211-420930.log`: inner chain_exit=1 and herdr timeout.
- `check fix-a-chain-rerun: 0 implementation/check-fix-a-chain-rerun-1792264967451-444791.log`: two outcomes, inner chain_exit=0.
- `check fix-a-chain-rerun2: 0 implementation/check-fix-a-chain-rerun2-1792264985971-458651.log`: both outcomes done, inner chain_exit=0.

The latest full verification evidence was read, with no unnecessary rerun on this unchanged head: format passed (`implementation/check-format-1792265154228-1216393.log`), 1,038 tests passed with zero failures (`implementation/check-test-1792265313402-1216393.log`), and typecheck passed (`implementation/check-typecheck-1792265316272-1216393.log`). This is newer than the repaired test and script. No test skipping, filtering or runner changes were introduced by the repair. The filtered F6 red reproduction does not replace the complete green run, which is present.

Additional Test-Change trailers in the repair range were checked against src/test-files.ts:

- `0b3ec55`, tests/peer-restart.test.ts: F1's later herdr start refusal and criterion 6. Valid source for the added reproduction.
- `bdea694f`, tests/peer-ask.test.ts: criterion 6 requires the existing exchange unchanged, and D3 forbids finish-time mutation. Valid source for the expectation correction.

The earlier initial-diff trailer inventory remains above. No AREA.md or lesson files changed. Documentation was followed from docs/reference-index.md to the live chart guide. No new documented behavior was introduced by A's two-commit F6 correction.

### Disposition after re-check

Verdict **fix**, requesting check.repair for the still-open F2/F3 acceptance evidence. Existing proof tools are available, no new operator-only action was identified, and no Nits are retained. F2/F3 need the existing missing-case/capture handoff to A rather than a new proof framework or relaxed criteria.

## 2026-10-17 check.repair: remaining acceptance evidence

Head remains `530bfd3308bed210a31e16975a5221bccea086c0`; the worktree is clean and unchanged from B's latest re-check. The only open findings are F2 and F3. No product, test, documentation, plan or design edit is required of B in this pass.

The applicable check-issue rule is: “A criterion whose proof lacks only a case, capture or recording that the existing runner and helpers can run goes under `Handed to A`, naming the criterion, the existing tool and the missing case.” Both remaining findings meet that rule. The existing herdr/harness/script and transcript machinery already produced runs; neither finding reports absent machinery or a dependency on unmerged work.

### Handed to A

- **F2 — criterion 1, with D8/D9 recording:** use the existing herdr-managed claude A/codex B/pi C seats and chart-usage.ts. Missing case: the same small handed item as the first measured work of fresh sessions on both base and branch, with equal seat models/efforts/argv/harness versions, full relevant chart windows and lower all-seat branch calls × context. Retain exact argv/version records and actual per-exchange call accounting. The prior repair missed the requirement by starting a second item in A's existing README sessions and reporting only that later window. Do not repeat that warm-session subset comparison or substitute a per-step normalization for the locked total.
- **F3 — criterion 3, with D1/D9 recording:** use the existing consultant sessions, branch skill/brief route and transcript read accounting. Missing case/capture: consultants actually receive and follow the branch section-reading rule, then complete call/path accounting for both B/C seats on both runs, including every path in batched shell reads. Keep each consultant's independent evidence selection under Q4. The prior repair missed the requirement by treating one whole installed-skill read as compliant and counting batched reads as fewer paths. The latest re-check traces the concrete full-skill read, absent rule references and omitted leaf-review paths. Establish section reads and any allowed reread from the actual calls, without relaxing the criterion or adding a wording test.

F1, F4, F5 and F6 remain resolved. No new or widened live action was attempted by B, and no operator-only action or reusable Nit is open.

Evidence: `check repair-b-evidence-handoff: 0 implementation/check-repair-b-evidence-handoff-1792265473146-2193525.log`, read back with `akrogon log`, confirms the unchanged head, clean worktree and existing proof scripts/transcripts. The previous head's green format/typecheck and 1,038-test verification remain current. With no code or proof-input change, B did not rerun those completed checks, create another test, or create a commit. No merge checks ran.

Destination: check.fix, slot A, for the two missing proof cases above.

## 2026-10-17 check.review: runs3 evidence

Verdict: **fix**. F2 is resolved by the new measurement and B's accounting below. F3 remains open. F1, F4, F5 and F6 remain resolved. No new blocking finding is added.

Prior and current reviewed head: `530bfd3308bed210a31e16975a5221bccea086c0`. Base remains `17d611718c20e9a04ae67a5e547ed3a28c3c716e`. There is no code diff, rebase or new Test-Change trailer in this pass. Scope is the replacement runs3 evidence and report. Worktree is clean. No code or tests were changed during review.

### F2 resolved

The NOTES item is now the initial user instruction in both fresh A transcripts: base session `51ec8037-01a9-4f49-9707-e5817512e9be`, branch session `fb40a761-f7b2-4f0a-af11-031f5bdc7f2f`. It is not a continuation after another chart. The intake words match except for run paths/panes. All three seat model/effort rows match between USAGE files, the report records identical argv, and runs3/versions.txt records claude 2.1.302, codex 0.163.0, pi 1.3.0 and herdr 0.9.1.

B checked the metric rather than relying on rounded averages. Summing the input/cache fields reported by chart-usage gives **1,829,636 base versus 1,772,572 branch**, a reduction of **57,064 context tokens**, about 3.1%. This sum is the unrounded equivalent of requests × average context across seats.

Branch USAGE says C's calls are unavailable because seats.yaml also names its unused pre-restart session, whose file is missing. The A trace shows restart before the first peer prompt; the retained post-restart C transcript's first user message is the map prompt at 19:35:03.128Z. No model request was sent to the pre-restart C seat in this run. The retained C transcript contains 11 assistant usage entries, summing to the same 165,013 input/cache tokens that chart-usage reports for the active C session. Base C has 10 such entries and 140,210 context tokens. This independently accounts for actual C requests without treating “calls unavailable” as zero usage or guessing its average. The unused-session warning does not hide a prompted turn in the reviewed trace.

Exact A exchange comparison: base map waits and peer-ask share the call at base-A.jsonl line 101, base leaf review shares the preparation/waits/peer-ask call at line 172, and base adds its separate seat-roster call at line 130. Branch map at line 127 and leaf review at line 179 each chain both waits before peer-ask in one call. There is no branch roster call after restart/exchange. Thus the measured base already batches waits on this run; the demonstrated saving includes removing the separate roster call, not an assumed extra wait call per exchange.

Both runs retain independent A/B/C maps, B/C leaf reviews, chart/intake/fork/seat/span/usage records, leaf handoffs and Handed off footers. Neither has a material fork requiring a rebuttal. This agrees with the earlier parity review of the runs2 dissent/rebuttal records; the implementation has not changed since those runs. The branch records that a redirect discarded its leaf-review outcome stdout and that it read both returns. No consultant return or operator-facing handoff is missing from the retained records.

### F3 remains open

Both branch consultants still read the **whole** questions.md while mapping the NOTES item:

- `runs3/logs/branch-B-codex.jsonl:19`: one shell call cats INTAKE.md and the full branch questions.md with a 14,000-token output budget.
- `runs3/logs/branch-C-pi.jsonl:8`: the read tool opens the full branch questions.md with no section bound.

The report explicitly calls this an unbounded read of the 15KB process file and records one deviation per consultant. Directing a brief at `## Research` does not make a whole-file read a section read. The process file is not itself the subject of the NOTES task, so the full-source exception does not apply. This directly fails the outcome named by brief criterion 3 and plan D1; uncertainty or a hypothetical case is not involved.

The installed-source provenance problem is now removed and no duplicate-read claim is needed to sustain F3. The remaining requirement is narrower: demonstrate the actual branch consultants locating and reading needed process sections with bounded output, using the branch source, and retain complete per-path read accounting. The existing runner and transcripts suffice. Do not reclassify the observed whole-file reads as a pass. If a skill/script change is needed to achieve the outcome, both measured runs must be refreshed at the final head under the brief's existing repair rule.

### Evidence and checks

All these logs were read back with `akrogon log`; paths are relative to this leaf:

- `check recheck-b-runs3-scope: 0 implementation/check-recheck-b-runs3-scope-1792266162694-2946555.log`: unchanged head/base, clean worktree, versions and current guide.
- `check recheck-b-runs3-evidence: 0 implementation/check-recheck-b-runs3-evidence-1792266169547-2947564.log`: intakes, USAGE, seat/chart records, A exchange calls and both full process-file reads.
- `check recheck-b-runs3-pi-requests: 0 implementation/check-recheck-b-runs3-pi-requests-1792266193949-2948869.log`: all base/branch C assistant usage entries.
- `check recheck-b-runs3-accounting-source: 0 implementation/check-recheck-b-runs3-accounting-source-1792266212704-2949935.log`: chart-usage pi accounting sums input + cacheRead + cacheWrite per request.
- `check recheck-b-runs3-total-corrected: 0 implementation/check-recheck-b-runs3-total-corrected-1792266218506-2950522.log`: unrounded chart-usage context totals and first branch C prompt. This corrects B's first tally attempt, which failed on an invalid Python regular expression and produced no measurement.

The prior 1,038-test green verification, formatting and typecheck remain applicable to the identical committed head. No unchanged suite was rerun. No documentation, AREA.md, lesson or test path changed, and the earlier trailer inventory remains valid. No operator-only action or Nit is open.

Destination: check.repair for original F3 only, with the missing-case/capture handoff to A under the existing skill rule. Acceptance criteria are unchanged.

## 2026-10-17 check.repair: F3 proof handoff

Head is unchanged at `530bfd3308bed210a31e16975a5221bccea086c0`, with a clean worktree. Only F3 remains open. F1/F2/F4/F5/F6 retain the dispositions in the latest re-check.

### Handed to A

- **F3 — brief criterion 3, plan D1/D9:** exception is the skill's missing-case/capture rule: “A criterion whose proof lacks only a case, capture or recording that the existing runner and helpers can run goes under `Handed to A`, naming the criterion, the existing tool and the missing case.” Use the existing herdr/harness sessions, branch skill/brief route and consultant transcript accounting. Missing case: branch B and C actually locate and read the process sections needed for their step with bounded output, without rereading unchanged held content, and the report retains complete call/path accounting for both measured runs. The current report and transcripts show a whole questions.md read by each branch consultant, so F3 cannot close from a named-section pointer alone. The earlier attempts missed the root behavior by providing a section pointer but accepting a full-file read. Preserve each consultant's own evidence selection under design Q4. No sliced evidence supplied by A, new proof framework, prose-wording test or relaxed acceptance criterion is requested. If the repair changes skill text or scripts, refresh both measured runs at the final head under the brief's existing repair scope, preserving criterion 1's demonstrated spend reduction.

This is a model-followed workflow outcome requiring a successful live case, not absent proof machinery or another code defect for B to patch. The existing proof machinery is present, so the missing-machinery failure rule does not apply. No new live mutation was attempted by B, no operator-only action is open, and no reusable Nit is held.

Evidence: `check repair-b-f3-handoff: 0 implementation/check-repair-b-f3-handoff-1792266265599-2962276.log`, read back with `akrogon log`, confirms the identical head, clean worktree and retained proof artifacts. The prior 1,038-test, formatting and typecheck verification remains current. With no code/test/proof-input edits by B, no unchanged checks were rerun, no additional test was written and no commit was created. No merge checks ran.

Destination: check.fix, slot A, for F3 only.

## 2026-10-17 check.review: post-handoff section case

Verdict: **fix**. F3 remains open. No new finding is added. Prior/current head remains `530bfd3308bed210a31e16975a5221bccea086c0`, base `17d611718c20e9a04ae67a5e547ed3a28c3c716e`. Worktree is clean, with no new commits, diff, refresh or Test-Change trailers. Scope is the added section-check briefs/returns, appended consultant transcripts and report's check.fix pass 3.

The new case does establish useful behavior: B and C locate the Drain heading, extract its section, answer using held Research content, and do not reread questions.md. Both returns are present. The two cited transcript checks pass and match the appended tool calls. B's locate/read calls occur at 19:45:38 and 19:45:41; C's at 19:45:40 and 19:45:44. This shows that explicit instructions can produce a section read and held-content reuse.

It does not establish the criterion still open. Brief criterion 3 says **“In that branch run, consultants read process text by section”**. The measured NOTES run still contains both whole-questions.md reads identified in the previous review. Adding a later successful read does not remove those earlier reads from the run.

The new brief explicitly says **“The NOTES.md chart has handed off”**. The chart's seats.yaml still ends the measured span at **19:37:25**, roughly eight minutes before the added reads. Thus this is a supplementary post-handoff probe outside the usage window used for F2, not the missing successful branch-run outcome. It cannot be substituted for criterion 3 within that measured run, nor silently included in the prior spend comparison without accounting for its additional work.

This review requires no claim that all future briefs will routinely succeed and no new product feature. The requirement is the existing finite live outcome: a matched final-head pair in which the measured branch consultants follow the reading rule during the chart, with call/path accounting and the required spend result. If changing the skill/brief delivery is necessary to achieve that outcome, stay within the existing decisions and rerun both measured runs as the brief already requires. A post-handoff exercise can remain supporting evidence, but it cannot turn an observed whole-file read into criterion compliance.

Evidence read through `akrogon log`:

- `check fix-a-f3-transcripts4: 0 implementation/check-fix-a-f3-transcripts4-1792266406667-3050728.log`: B's two post-exchange SKILL calls and zero questions reads.
- `check fix-a-f3-transcripts-pi: 0 implementation/check-fix-a-f3-transcripts-pi-1792266406755-3050872.log`: C's two post-brief SKILL calls and zero questions reads.
- `check recheck-b-f3-addon-scope: 0 implementation/check-recheck-b-f3-addon-scope-1792266437719-3187177.log`: unchanged head, measured span, focused brief and both returns.
- `check recheck-b-f3-addon-trace: 0 implementation/check-recheck-b-f3-addon-trace-1792266448330-3238540.log`: actual locate/extract calls with timestamps after the measured span.

No code, test, helper, fixture, documentation or check configuration changed, so the prior 1,038-test green verification and prior resolved findings remain applicable. No unchanged check was rerun. F2's accepted runs3 measurement remains valid for that window; the remaining problem is that the same window fails F3. No new operator-only action or Nit is open.

Destination: check.repair, original F3 only, for the existing missing measured-run case/capture handoff. Acceptance criteria remain unchanged.

## 2026-10-17 check.repair: measured F3 case

Unchanged clean head: `530bfd3308bed210a31e16975a5221bccea086c0`. F3 is the only open finding; the latest re-check governs its scope.

### Handed to A

- **F3, criterion 3:** use the existing herdr/harnesses, branch skill/brief route, transcript accounting and chart-usage.ts. Missing case: a measured chart run where branch consultants locate and read process sections with bounded output and respect held-content reuse, with complete per-path records. The earlier repair missed by adding a successful exercise after handoff, outside the spend window, while leaving the measured whole-file reads unchanged. Produce the successful measured case with its matching base comparison and spend accounting. Do not add another post-handoff exercise or retroactively omit the offending calls. Any necessary skill/script correction stays within the locked scope and triggers both measured runs at the final head. Consultant evidence selection remains independent under Q4.

This follows the skill's explicit rule: “A criterion whose proof lacks only a case, capture or recording that the existing runner and helpers can run goes under `Handed to A`”. Machinery exists; no operator-only action or unmerged dependency was identified. No brief/design change or new feature is requested.

Evidence: `check repair-b-f3-measured-case: 0 implementation/check-repair-b-f3-measured-case-1792266483047-3366872.log`, read back via `akrogon log`, confirms unchanged head/worktree and existing tools/artifacts. No code, tests or proof inputs changed in B's pass, so the existing green verification remains current. No checks were repeated, no commit was created, and no Nit is held.

Destination: check.fix, slot A, F3 only.

## 2026-10-17 check.review: final-head runs4/runs5

Verdict: **fix**, original F3 only. Prior head `530bfd3308bed210a31e16975a5221bccea086c0`; reviewed head `04e754161b1a50c649399d47a3f4e6073c5ee3d9`; base remains `17d611718c20e9a04ae67a5e547ed3a28c3c716e`. The worktree is clean. No refresh/rebase occurred. Scope is the one-sentence questions.md repair and the two new measured pairs. No new blocking finding is introduced.

The repair moves the instruction into briefs that cite process text. This addresses the cited-text path: in runs4, B's awk selects the named paragraph under Blind peer exchange, and C's grep returns that paragraph directly. The calls occur at 19:52:59 and 19:53:21, inside the measured 19:51:01–19:56:51 span. This closes the post-handoff timing problem for that case and is valid evidence of bounded reading on the final skill text.

### F3 still fails in the final-head spend pair

Runs5 branch B explicitly executes this at transcript line 28, 20:01:53.830Z:

`cat /home/ivan/.codex/skills/chart-issues/SKILL.md` with `max_output_tokens:11000`.

This is a whole process-file read during the NOTES map, within the measured span 20:00:47–20:04:34. The skill file is not the subject being reviewed or edited. The report calls it an installed-skill auto-load artifact, but the retained evidence is an actual consultant exec call and its process read must count under criterion 3. Reading the file once satisfies the reread cap, not the section-read requirement.

The remaining delivery gap is concrete: the new sentence applies only to a brief **“that cites process text”**. Runs5's saved map/review briefs cite no process source and carry no consultant reading rule. B can still independently choose to open process text, before ever receiving the instruction to read it by section. That is the same rule-discovery mechanism F3 identified, on the uncited-text path. The repair covered the named-citation case while leaving this observed path reachable.

Repair the rule's delivery before a consultant selects process text, preserving the existing exceptions and Q4's independent evidence selection. Do not add a wording test or change the locked outcome. Then demonstrate the behavior in the measured comparison. This is a concrete incomplete product-instruction repair, not merely a missing extra example: it is suitable for B's skill-text repair, with missing live-run capture following the existing handoff rule as needed.

### The evidence cannot be combined as one passing run

B recomputed unrounded input/cache totals from the chart-usage fields:

| pair | base context | branch context | result |
|---|---:|---:|---|
| runs4 | 1,780,106 | 2,896,973 | bounded-read case present, spend not lower |
| runs5 | 2,433,364 | 1,916,568 | spend lower by 516,796 (about 21.2%), whole-file read present |

The workload difference in runs4 can legitimately explain its extra spend and is not a new product-regression finding. Runs5 improves the final-head spend evidence. However, criterion 3 explicitly applies **“In that branch run”** from criterion 1. Taking reading behavior from runs4 and spend from runs5 does not establish that joint outcome. The prior runs3 spend proof predates the new skill text and cannot replace its required refreshed comparison. The remaining gate is still F3's successful measured run, not a new requirement for deterministic round counts.

Earlier code findings F1/F5/F6 remain resolved, and the timeout behavior F4 remains resolved. The added brief instruction does not change the wait/prompt scripts or timeout arithmetic. The live guide's exchange shape is unchanged. No AREA.md, tests, fixtures, lesson files, check configuration or dependencies changed. No Test-Change trailer is required for the sole prose commit, and the earlier trailer inventory remains valid.

### Evidence and verification

Kept logs read back using `akrogon log`, relative to this leaf:

- `check recheck-b-final-head-scope: 0 implementation/check-recheck-b-final-head-scope-1792267990490-2262156.log`: SHA/base, clean worktree, one-sentence repair.
- `check recheck-b-runs45-evidence: 0 implementation/check-recheck-b-runs45-evidence-1792268008389-2270246.log`: both pairs' measurement fields/spans and actual process-read calls.
- `check recheck-b-runs45-context: 0 implementation/check-recheck-b-runs45-context-1792268025604-2276672.log`: unrounded context totals above.
- `check recheck-b-f3-delivery-gap: 0 implementation/check-recheck-b-f3-delivery-gap-1792268041707-2285729.log`: runs5's actual map/review briefs omit the reading rule.

Latest verification was read: formatting passed (`implementation/check-format-1792267777706-1647929.log`), 1,038 tests passed with zero failures (`implementation/check-test-1792267963395-1647929.log`), and typecheck passed (`implementation/check-typecheck-1792267965884-1647929.log`). No unchanged checks were rerun by B. No new operator-only action or Nit is open.

Destination: check.repair, F3's remaining rule-delivery path and its measured proof. Brief/design/acceptance criteria remain unchanged.

## 2026-10-17 check.repair: F3 unconditional brief delivery

Starting head: `04e754161b1a50c649399d47a3f4e6073c5ee3d9`. Instruction-repair head: `7eff5e94e8f50756dd9db511b335061c89359b85`.

### Instruction repair

Commit `7eff5e9` changes only the brief-delivery sentences in questions.md's Blind peer exchange section. Before, the rule was delivered only by “A brief that cites process text”. After, “Every peer brief carries this reading rule and its exceptions, even when the brief cites no process text”. A consultant receives it before selecting a process source. Cited process sources remain named by section and bounded, while the consultant may select other needed sections and its own evidence. The original changed-content/compaction/full-source exceptions remain intact.

The previous repair missed because it covered only explicit process citations. Runs5's uncited map brief omitted the instruction and B independently opened the installed skill in full. The search across skills/chart-issues and docs/guide/chart.md found the conditional delivery rule only in questions.md, the shared brief contract for maps, fork notes, rebuttals and reviews. Fixing that common contract removes the condition across those task types without editing individual proof briefs or preselecting evidence.

This is the requested instruction/documentation repair. No prose-wording test was added, consistent with the design. The existing runs5 transcript remains the recorded failing behavioral case; a green live rerun is not claimed from the text edit or regression suite. F3's final acceptance remains open until the planned measured proof passes.

Evidence read back with `akrogon log`, relative to this leaf:

- `check repair-b-f3-rule-before: 0 implementation/check-repair-b-f3-rule-before-1792268102885-2342376.log`: old conditional contract and actual runs5 brief without the rule.
- `check repair-b-f3-rule-after: 0 implementation/check-repair-b-f3-rule-after-1792268110566-2357375.log`: before/after diff and separate instruction-fix commit.

### Handed to A

- **F3, criterion 3 together with the criterion 1 measured comparison:** missing live case/capture under the check-issue rule “A criterion whose proof lacks only a case, capture or recording that the existing runner and helpers can run goes under `Handed to A`”. Existing tools: herdr, the claude/codex/pi harnesses, chart-usage.ts and transcript accounting. Refresh both measured runs at `7eff5e9` or the final corrected head because skill text changed. Use the same handed item as the first work of fresh sessions with matched settings. Demonstrate that every branch brief carries the reading rule, including a brief with no process citation, and that actual consultant-selected process reads obey it within the measured chart window. Include every path in batched reads, complete records/parity and all-seat spend lower than the matched base. A separate post-handoff exercise or separate reading/spend pairs cannot supply this joint outcome. Keep a reproducible account of the earlier red case and the new green measured case.

No proof machinery is missing and no operator-only action is open. No live resource was mutated by B. No test, script, dependency, plan or design was changed, and no reusable Nit is held. Earlier fake-herdr criterion-6 proofs retain their unchanged inputs. Earlier measured-run evidence is superseded for final acceptance by the text-change rerun requirement.

### Verification and destination

`akrogon verify` completed on committed head `7eff5e94e8f50756dd9db511b335061c89359b85`, printing `verify leaf 7eff5e94e8f50756dd9db511b335061c89359b85: green`.

- `verify format: 0 implementation/check-format-1792268114365-2357863.log`.
- `verify test: 0 implementation/check-test-1792268382442-2357863.log`: 1,038 pass, zero fail.
- `verify typecheck: 0 implementation/check-typecheck-1792268385514-2357863.log`.

Only questions.md changed, in the separate instruction-repair commit. No temporary helper or test file was created. No merge checks ran. The remaining live measured case follows the skill's missing-case handoff rule, so destination is check.fix, slot A. F3 is not claimed closed by regression verification.

## 2026-10-17 check.review: final joint proof, runs8

Verdict: **ready**. F3 is resolved. All original findings F1–F6 are closed, with no remaining Fix, Nit or operator action.

Prior reviewed head: `04e754161b1a50c649399d47a3f4e6073c5ee3d9`. Reviewed head: `7eff5e94e8f50756dd9db511b335061c89359b85`. Base: `17d611718c20e9a04ae67a5e547ed3a28c3c716e`. The only repair commit is B's unconditional brief-delivery instruction already recorded above. No further commit, refresh or rebase occurred in A's proof pass. Worktree is clean. No code or tests were edited during this review.

### F3 acceptance

All four runs8 branch briefs (map B/C and leaf-review B/C) include the consultant reading rule **and its exceptions**, including changed content, unread sections, compaction and a source that is itself the subject of the work. This reaches consultants before their first process-source selection even though these briefs cite no process file.

B inspected the actual tool calls, including paths read in batched shell commands. Both branch consultants read their briefs, repository configuration, maps/chart records and draft leaf files. Neither reads SKILL.md, questions.md, standing-design.md or shapes.md. The installed whole-skill read that defeated runs5 is absent. No unchanged process content is reread.

This is a valid outcome of the reading rule for this small task: no process source was needed, so the rule does not require an unnecessary process read solely to demonstrate section extraction. Unlike the earlier post-handoff add-on, the compliant behavior occurs in the same complete chart window used for the final spend comparison. Earlier bounded-section cases demonstrate the extraction path, but are not substituted for this measured run's actual behavior. This accepts observed compliance, not an expectation that every future model run will behave identically.

### Joint criteria and record comparison

| Brief criterion | Final evidence |
|---|---|
| 1: matched fresh sessions and lower all-seat context | Same NOTES item is the first instruction in fresh base A `aa30db53…` and branch A `396fc199…`; fresh restarted codex/pi peers. Both sides use claude-opus-5-5/medium, gpt-6-astra/high and muse-wonder-full-1.0-contributor/high. Recorded harness versions match. Chart-usage input/cache fields sum to **2,491,736 base versus 1,625,932 branch**, lower by **865,804 (34.7%)** in this measured pair. All seat call counts are available in these USAGE files. |
| 2: one call per branch exchange, no separate seat roster | Branch map at A transcript line 95 and leaf review at 159 each use `wait && wait && peer-ask`; all four peer outcomes are done/proven within the first collection call. Each call has two 30-second waits, two sequential 5-second prompt caps and a 400-second collection budget, totaling 470 seconds below its 500-second tool timeout. No separate post-restart/exchange roster call. Base map at 109 and leaf review at 199 each already combine waits and peer-ask in one call, but base also reads the seat roster separately at 138. The observed saving is not inferred from an assumed split base wait call. |
| 3: consultant reading behavior in that branch run | The delivered rule and actual non-process read calls above show no unnecessary whole process-file read or held-process reread during the measured window. Both consultants' calls remain in runs8/logs, including batched path reads. |
| 4: independent findings and operator-facing records | Both sides retain independent A/B/C maps, B/C leaf-review returns, chart/intake/fork/seat/span/usage files and complete leaf handoffs with Handed off footers. Base's merged map is a file; branch's agreeing-slot synthesis and literal-versus-meaning difference are in the chart/fork record. Branch B/C's proposed literal sentence and A's meaning-based acceptance are preserved in Findings/Taken. All leaf reviewers return no disagreement. Neither run needs a material blind-notes/rebuttal round, so no existing disagreement return is lost. The unchanged exchange contract and earlier retained dissent/rebuttal examples remain supporting evidence. |
| 5: pre-prompt timeout and whole-chain rerun | Earlier kept live timeout/rerun evidence remains applicable: the scripts, wait chain and timeout arithmetic did not change in the reading-rule repair. No timeout behavior is inferred from a prose assertion. |
| 6: current session receipts and unchanged exchange | Earlier F1/F6 repair proofs remain current, with unchanged peer scripts/tests. Runs8 also prints the fresh codex session on its first done outcome while exchange.session retains its null seed; the recorded seat entry matches the receipt. All subsequent outcome sessions agree with the recorded entries. |

The report's rounded calls × average totals differ by a few tokens from the unrounded values above. B used the actual input/cache totals to avoid rounding drift. The reduction is evidence for this pair, not a claim of a fixed savings percentage on every chart.

B compared the run skill copies with the actual revisions: SKILL.md, questions.md, peer-ask.ts, peer-wait.ts and peer-restart.ts all match the final worktree on the branch and the recorded base revision on the base side. This confirms the measured proof is on the final instruction/script surface. F1/F5/F6 code/documentation repairs remain intact. No AREA.md, test, fixture, dependency or lesson file changed in this repair range. No new Test-Change trailer is needed for the instruction-only commit; the earlier full trailer inventory remains valid.

### Evidence and checks

Kept logs read back with `akrogon log`, relative to this leaf:

- `check recheck-b-runs8-scope: 0 implementation/check-recheck-b-runs8-scope-1792269946964-6840.log`: final head/base, clean worktree, instruction diff and harness versions.
- `check recheck-b-runs8-records: 0 implementation/check-recheck-b-runs8-records-1792269960621-12238.log`: both chart/usage/intake/seat records, every branch brief's rule and actual branch consultant calls.
- `check recheck-b-runs8-proof: 0 implementation/check-recheck-b-runs8-proof-1792269987922-19259.log`: exact context totals, initial A prompts, exchange calls/timeouts and final/base source-copy comparisons.
- `check recheck-b-runs8-parity: 0 implementation/check-recheck-b-runs8-parity-1792270018286-28286.log`: done/proven outcome lines, retained map/leaf-review returns and final fork decisions.

The green verification on this identical head remains current: 1,038 tests passed, formatting and typecheck passed, with the exact verification logs recorded in B's preceding repair entry. No tests, helpers, fixtures or check configuration changed afterward, so no completed check was rerun. No wording test, new proof framework or out-of-scope feature was introduced.

No Nits are retained and no reusable Nit requires a lesson entry. No live resource was mutated by this review. Destination: merge, slot B.


## Merge B — applied attempt 37f89809-6bcd-46cc-bb3f-776e5af0d050

Reviewed head `7eff5e94e8f50756dd9db511b335061c89359b85` was applied onto `503ae3e6f57a150825e0f3224a468bc14c3d0537` as `d5652d546185e85ea76582e9ec69525adc985682`, with no members. Worktree was clean and HEAD matched the supplied top. Range-diff from prior base `17d611718c20e9a04ae67a5e547ed3a28c3c716e` showed all 11 commits equivalent. No merge repair was needed.

Evidence read through `akrogon log`:

- `check merge-b-attempt: 0 /home/ivan/Work/infra/akrogon/issues/open/token-spend/lean-exchange/implementation/check-merge-b-attempt-1792270086118-47870.log`
- `check merge-b-owner-context: 0 /home/ivan/Work/infra/akrogon/issues/open/token-spend/lean-exchange/implementation/check-merge-b-owner-context-1792270094669-85117.log`
- `verify setup: 0 /home/ivan/Work/infra/akrogon/issues/open/token-spend/lean-exchange/implementation/check-setup-1792270086296-48007.log`
- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/token-spend/lean-exchange/implementation/check-format-1792270088722-48007.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/token-spend/lean-exchange/implementation/check-test-1792270316425-48007.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/token-spend/lean-exchange/implementation/check-typecheck-1792270319079-48007.log`

`akrogon verify --attempt 37f89809-6bcd-46cc-bb3f-776e5af0d050` completed green at the supplied top: 1,055 tests passed, zero failed, formatting and typecheck passed. No advisory failures. Completion owner `token-spend` contains only this leaf; its index and leaf brief were gathered before publication.
