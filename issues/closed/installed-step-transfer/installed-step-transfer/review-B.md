# Review B: installed-step-transfer

2026-11-17, initial `check.review`, slot B. Verdict: **fix**.

Base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`.
Reviewed head: `c127338e2188a4820b3c0560f82821588298b68d`.

Read the brief, design, plan, implementation report, full diff, shared review references, changed behavior's user documentation (`docs/use/learn-from-work.md`), `docs/reference/skills.md`, the reference index and skill index. Read all ten criterion-1 framework history files, the installed standing-design model-choice rule and plan-issue's proof-command rule. Did not read the peer's review or `learnings/LESSONS.md`. No code edits, commits, covered operations or proof reruns in this review.

## Fix

**F1. The prefix-regex Transfer decision omits a conflicting part of its required source.**

- Source: the criterion-1 case `2026-10-03-prefix-regex-does-not-prove-meaning`, specifically `/home/ivan/Work/infra/tamdoma/framework/learnings/history/2026-10-03-prefix-regex-does-not-prove-meaning.md:7`. Its learning ends: `Seed a break of the claimed meaning and a harmless wording change to distinguish the two.` The case concerns the closure-audit test's prose explanations, not just its four partition keys. The evidence at line 5 expressly distinguishes key membership from explanation meaning.
- Current decision: `implementation/report.md:28` calls this a Transfer to the model-choice sentence and says the installed step already states its rule. It discusses the shared prefix but does not weigh the learning's instruction to test the claimed meaning and alternative wording.
- Contradiction: the cited installed `skills/chart-issues/assets/standing-design.md` § Standing design lines, at release `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`, says the model's choice takes no test, case or deliberate break holding an expected value. No one-right-answer source for judging the explanations' meaning is named in this history. The new `skills/lesson-rule.md:9` explicitly routes contradicted or partly covered lessons to a proposed rewrite, including lessons recommending script checks on model output without such a source. The source's extra testing instruction cannot be treated as fully carried by a rule forbidding that proof.
- Consequence today: the report's required per-case reading declares complete coverage while ignoring an opposing instruction in the named case. That gives the future framework pass an unsupported example of deleting the lesson as fully transferred, rather than reconciling the instruction. No framework line has actually been removed.
- Criterion/gap: brief criterion 1 requires the reviewing seat to judge the per-case walk. This is a required input omitted from a recorded model choice, rather than a different preference between equally supported choices.
- Required repair: hand this recorded model choice to A. Have the writer reassess the whole learning with the conflicting final sentence as evidence and record the resulting Transfer/rewrite/keep reasoning. Do not add a test of the sorting choice or edit framework lessons in this leaf.

## Remaining criterion review

For criterion 1, the three histories `2026-09-30-resolver-guidance-prose-tests`, `2026-09-30-offer-analytics-guide-checks` and `2026-10-01-discovery-prose-assertions` support the report's Transfer reading: the installed model-choice rule reserves prose meaning for judgment and literal references for mechanical checks. The analytics-guard and residue-triage histories contain additional outcome-probe/report-reader duties, which the report recognizes as partial coverage and rewrite candidates. The no-op-commit history supports reassessing a proposed observable against permitted behavior; the report identifies the proof-command rule and explicitly retains its partially covered duty. The injector-and-routes and cross-site-repeat histories are retained with reasons rather than claimed as fully covered. The stash case remains checkable and cannot transfer. F1 is the only blocking defect found in this walk.

For criterion 2, all five committed skill-local `lesson-rule.md` entries are mode `120000`, blob `e94133cadf4e47ffc942154ebba5cf485e50e54f`, with target `../lesson-rule.md`. The lesson rule, learn-issues Sort/Apply and user Transfer bullet agree on the expanded outcome. The detailed procedure carries realpath classification, release/checkout citation, no installed-step edit, rewrite history, approval and stay counts. Sort order, Retire and footer text are unchanged. No `AREA.md` changed.

The behavior change is documented in `docs/use/learn-from-work.md`; the unchanged skills reference remains accurate that transfers are prepared for approval. Criterion 4's later operator-approved framework pass, framework-owned source naming and undetected later orphaning are all explicitly stated in the report. No framework files changed.

## Verification evidence

Read the kept logs through `akrogon log`. The existing evidence covers the current test and prose changes, so no check was rerun.

- `check criterion2-symlink-red: 1 implementation/check-criterion2-symlink-red-1794955981054-1592422.log`: the deliberate index-mode change to `100644` fails the new assertion. This is planned new-behavior evidence, not an unexplained red check.
- `check criterion2-3-docs-links-leaf: 0 implementation/check-criterion2-3-docs-links-leaf-1794956072726-1896587.log`: 13 pass, 0 fail, including symlink modes and resolved documentation links, after the latest test/prose edits.
- Verify receipt `f1ec2993-bb9b-4a1b-89dc-25b4051e6027` in the registered repo's `issues/verify-runs.jsonl` names the reviewed head and tree `6610eb0a3f4d92d96fd777fa674174312c66412e`. Setup, format, typecheck and test exit 0. Commands match the planned/configured checks, with no skipped or disabled planned tests.
- `check format: 0 implementation/check-format-1794956081675-1918064.log`: formatting passes.
- `check typecheck: 0 implementation/check-typecheck-1794956085259-1918064.log`: `tsc --noEmit` passes.
- `check test: 0 implementation/check-test-1794956245392-1918064.log`: 1225 pass, 0 fail across 83 files. This configured check also proves criterion 3.

No proof-command correction, missing live proof, unexplained paid activity or grant count applies. F1 concerns a recorded choice and needs review of the corrected record, not a reproduction test.

## Test-Change trailers

`39e203a79c5c4ebeef51d1e76a3d8ea43389debc..HEAD` contains one trailer, in `aed1ecb9951fe1ead025dcb5084aa296849b6903`:

`Test-Change: tests/docs-links.test.ts adds the lesson-rule symlink-mode case for done-criterion 2; no existing expectation changed`

The path matches `src/test-files.ts`. The cited criterion requires the five symlink modes, and the diff only adds that case. No existing assertion, fixture or output expectation changes. The deliberate red and subsequent current green runs support the addition. The implementation commit has no test-file change and requires no trailer.

## Operator actions and nits

None.

## check.repair — 2026-11-18

Read both initial reviews for head `c127338e2188a4820b3c0560f82821588298b68d`. A has no Fixes. B's F1 is the only Fix and concerns a recorded model choice, which the check.repair split assigns to A. A's N1 remains deferred because the linked shared lesson rule already supplies the instruction.

No B-owned Fix, operator action, missing proof machinery or live proof remains. No code or test changes, commits or proof reruns were made. The worktree is clean and its head is unchanged, so the existing mechanical verification remains applicable. F1 stays open pending A's reassessment and B's re-check.

### Handed to A

- **F1** — recorded-model-choice exception: redo the prefix-regex case's criterion-1 reading in `implementation/report.md`, weighing the history's instruction to seed a break of meaning and a harmless wording change against the installed rule prohibiting tests of the model's choice. Record the resulting decision and reason without testing that choice or editing framework lessons.

## Re-check after check.fix — 2026-11-18

Verdict: **ready**. **F1 resolved**. No open B Fixes, Nits or operator actions remain.

Prior and handed-off base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`. Prior and reviewed head: `c127338e2188a4820b3c0560f82821588298b68d`. A reports a refresh with no move and a record-only repair. Independently computed `git range-diff 39e203a79c5c4ebeef51d1e76a3d8ea43389debc..c127338e2188a4820b3c0560f82821588298b68d 39e203a79c5c4ebeef51d1e76a3d8ea43389debc..c127338e2188a4820b3c0560f82821588298b68d` through run-check: both commits are unchanged, with no added commits or conflict resolutions. Evidence: `check recheck-b-range-diff: 0 implementation/check-recheck-b-range-diff-1794956575174-3661103.log`, read back through `akrogon log`.

Reviewed A's corrected prefix-regex entry and check.fix record in `implementation/report.md`, together with the dated `plan.md` Implementation note, against the original history and installed standing-design lines 11 and 13. The record now weighs the history's final instruction to seed a break of meaning and a harmless wording change, identifies its conflict with the rule against testing the model's choice, and chooses a rewrite candidate that preserves the guarantee-versus-wording guidance while dropping that instruction. It names the deciding Apply sentence and history append. This addresses the omitted evidence and unsupported full-coverage claim in F1 without changing a locked outcome or testing the choice.

The repair is confined to lifecycle records. No product, test, helper, fixture, config, lockfile or documented behavior changed since the prior review. The worktree is clean and tree `6610eb0a3f4d92d96fd777fa674174312c66412e` is unchanged. The original current-head green verification receipt and criterion-2/3 evidence recorded above remain applicable; no test rerun is warranted. No proof-command correction or new `Test-Change` trailer exists. The revised record introduces no blocking defect, and no lesson or framework edit was made.

## Merge — 2026-11-18

Attempt `ccec1674-d4f3-48db-a32a-ef7578e5ff75`, applied top `a8c64d1d4500b0380cf81ca7a9a190feebd37f28`, rebase target `868cac1b071ea34adf5e5e58e89dc2f8192714a3`. Prior reviewed head was `c127338e2188a4820b3c0560f82821588298b68d`. The command already applied the rebase; B performs no fetch, rebase or product edit.

Land verify `21160252-5849-4eed-8f2c-487e50efee21` on the applied top failed `bun test --timeout=30000 --parallel=4 --no-isolate`, exit 1: 1224 pass, 1 fail. Read `implementation/check-test-1794956666827-3694216.log` with `akrogon log`. The failure is `no session, several sessions and an unreadable session refuse with today’s reasons, and a stale socket starts no core` at `tests/hc-identity.test.ts:130`: after sending SIGKILL to its fixture core, `expect(await listening(stale.socket)).toBe(false)` received `true`. Format and typecheck exited 0 in the same receipt.

Causal judgment: the failing unit probes fixture-process/socket shutdown immediately after SIGKILL. The leaf range from the rebase target changes only three Transfer prose surfaces and an index-reading symlink test; neither the failing test, its core fixture helpers nor session discovery code is changed. No plausible leaf cause was found. The runner ended with its ordinary summary. Under the shared unrelated-red rule, B launches one unchanged-head retry with `akrogon verify --attempt ccec1674-d4f3-48db-a32a-ef7578e5ff75`; result pending.

The unchanged-head retry completed red: receipt `eb1d85e9-399e-4445-b915-0d250ba3f895`, same tested top and tree. Exact failing command remains `bun test --timeout=30000 --parallel=4 --no-isolate`, exit 1, 1224 pass and 1 fail. `implementation/check-test-1794956761350-3978877.log`, read through `akrogon log`, shows a different failure: `a replaced blocked seat gets a fresh notice`, `tests/next.test.ts:514`. After the fixture kills and removes the old blocked terminal, the next invocation returns exit 1 where the test expects 0. The original socket test passes on retry. Format and typecheck again exit 0.

The replacement-seat test and all `src/` code are also unchanged in the leaf range. There is no plausible causal path from the Transfer prose or read-only symlink assertion to the replacement terminal operation. Both runs ended through the test runner's ordinary summary, not an external kill or timeout. Nevertheless, neither full run is green.

Ran the prescribed `akrogon verify --attempt ccec1674-d4f3-48db-a32a-ef7578e5ff75 --known-red` on the unchanged top: exit 1, `verify known-red a8c64d1d4500b0380cf81ca7a9a190feebd37f28: fail`. The base already has whole-green receipt `21875ec0-fde3-4fcf-a979-76b82f697995` at `868cac1b071ea34adf5e5e58e89dc2f8192714a3`, so no base run was launched. A green base cannot cover these red head runs. B accepts the refusal and makes no known-red agreement or base-red filing.

Merge is not approved or pushed. Route to A's `check.fix` with the attempt ID. A must reproduce the replacement-seat failure with the narrowest failing command through run-check and address or properly establish the unrelated red under the lifecycle rules; retain both head logs and the target/head SHAs above. No expectation correction, extra full-suite retry, product edit, commit or completion broadcast was made by B.

## Re-check after red-merge check.fix — 2026-11-18

Verdict: **ready**. F1 remains resolved. No new Fix, B-held Nit or operator action.

Rejected and handed-off base: `868cac1b071ea34adf5e5e58e89dc2f8192714a3`. Rejected and reviewed head: `a8c64d1d4500b0380cf81ca7a9a190feebd37f28`. A records a refresh with no move and no repair commits. B independently ran `git range-diff 868cac1b071ea34adf5e5e58e89dc2f8192714a3..a8c64d1d4500b0380cf81ca7a9a190feebd37f28 868cac1b071ea34adf5e5e58e89dc2f8192714a3..a8c64d1d4500b0380cf81ca7a9a190feebd37f28`; both commits are unchanged. Evidence: `check recheck-b-red-merge-range: 0 implementation/check-recheck-b-red-merge-range-1794957003759-784579.log`, read back through `akrogon log`. The repair adds evidence in lifecycle records only. No documented behavior changed in this pass.

The report's red-merge entry retains both rejected failures, the exact suite command and arguments, log paths, base and head, narrow reproducing commands and subsequent green results. B read the following kept logs through `akrogon log`:

- `check checkfix-repro-next: 0 implementation/check-checkfix-repro-next-1794956831036-71187.log`: `bun test --timeout=30000 tests/next.test.ts`, 201 pass, including the replacement blocked-seat test.
- `check checkfix-repro-hc-identity: 0 implementation/check-checkfix-repro-hc-identity-1794956839146-144687.log`: `bun test --timeout=30000 tests/hc-identity.test.ts`, 7 pass, including the stale-socket test.
- `check test: 0 implementation/check-test-1794956956748-180957.log`: the original configured `bun test --timeout=30000 --parallel=4 --no-isolate`, 1225 pass, 0 fail, across 83 files, including both previously failing tests and the documentation/symlink checks.
- `check format: 0 implementation/check-format-1794956848108-180957.log` and `check typecheck: 0 implementation/check-typecheck-1794956852772-180957.log`: both green.

Verify receipt `b20cd190-1399-4f36-9672-1ab31c0f81f0` identifies this exact reviewed head and tree `e0c8dcef63305969f7003de32e2be3c581d88065`, successful setup and all configured checks passing. B judges the earlier red runs **inconsistent**, with both red logs recorded in the preceding merge entry and this later green on the identical tree. This does not establish a particular fixture root cause or a base-red agreement. No product repair was made, so there is no required fail-before/pass-after repair test, changed expectation or proof-command correction. No further check rerun is needed in review.

The range's sole `Test-Change` trailer remains in rebased commit `8141972a`: `Test-Change: tests/docs-links.test.ts adds the lesson-rule symlink-mode case for done-criterion 2; no existing expectation changed`. Its prior source judgment still applies. The worktree is clean, no code or test input changed, and no proof was skipped or filtered out of the configured full check. Return to merge for its command-owned verification and landing.
