# Review B: known-red-pass

Base: `483c693771e83aa46aa074c7576bc3e3b5beb1b3`
Reviewed head: `b9bc11e1a9d9f0004ee49a86912958d2f5f127bb`
Phase: initial `check.review`. Verdict: **fix**.

Read the brief, design, plan, implementation report, reference index, changed surfaces, receipt consumers, extraction, current guide pages and test-file rule. Debate is off, so no positions/rebuttal artifacts exist. No peer review was read. No code changed or committed.

## Fixes

### F1: A failed head setup can produce a passing known-red result

Location: `src/verify.ts:109-118,281-289`.

Criterion 3 explicitly forbids passing when either setup is nonzero. The fresh-head path checks neither head completion/setup nor the existence of a nonzero head command before calling `baseCoversHead`, which validates only the base. With `checks: {}`, a head setup failure and successful base setup pass vacuously.

CLI reproduction used the existing temporary-repository helpers and real verify runs, not seeded receipts: configure `setup: test ! -f head-only`, `checks: {}`, and commit `head-only` only on the caller branch. `verify --known-red` recorded head `setup: 1, commands: []`, base `setup: 0, commands: []`, printed `verify known-red ...: pass`, and exited 0. This is also the existing plain-verify failed-setup scenario extended to the new flag. It violates criterion 3 even though the later receipt gate independently refuses this head. Validate the head's eligibility in the common pair predicate and add this missing CLI case.

Evidence: `check review-b-known-red: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-review-b-known-red-1792229152075-2091739.log`, entry F1. The probe exits 0 only when the incorrect behavior is reproduced.

### F2: An earlier failed base comparison hides a later qualifying pair

Location: `src/verify.ts:135`.

Criterion 1 requires a successful check.review move for a qualifying pair. A repeated `verify --known-red` deliberately reuses the completed red head and runs another fresh base, but `knownRedReceipt` uses `runs.find` and examines only the first linked base record. If that first comparison failed and a later comparison passes, verify exits 0 while the gate still refuses.

CLI reproduction used a committed `check.sh` with a persistent temporary marker outside the checkout. It emits `(fail) alpha` and exits 7 on the head. On the first base invocation it creates the marker, prints `runner-unavailable`, and exits 8. Later base invocations emit `(fail) alpha` and exit 7. Two real `verify --known-red` calls returned 1 then 0. The subsequent `phase caller check.review --slot A` returned 1 with `No green leaf verify receipt`. This models retrying the comparison after a transient base runner failure, and directly exercises criterion 1's outcome. All temporary repos and markers were cleaned.

Evaluate all eligible linked base records, so one rejected or incomplete comparison does not hide a qualifying fresh comparison. Add the repeated-call case through the CLI gate.

Evidence: the same `check review-b-known-red: 0` log, entry F2. The qualifying second base and rejected phase move are retained in its output.

### F3: New tests mechanically enforce prose wording

Location: `tests/docs-links.test.ts:135-158`.

The new tests assert the prose strings `Every commit on the default branch passed` and `failing known-red`. Those are neither executable commands, numbers nor fixed references. A valid rewrite of the new skill paragraphs would fail the required test check despite preserving the behavior. The review rule explicitly rejects tests of prose wording, and the supplied AGENTS.md says mechanical checks validate function rather than exact wording. Keep assertions for literal executable command forms and judge the policy prose in review. This correction changes existing expectations and therefore belongs to A under the repair split.

### F4: The operator merge guide still sends base reds into repair

Locations: `docs/guide/merge.md:28`, also `docs/guide/setup.md:53` and `docs/guide/phases.md:94`.

The live merge guide says a no-cause red rerun ends with `check.fix --attempt <id>`, omitting the newly required known-red comparison. An operator or seat following that documented workflow still dismantles a red stack or routes a leaf into repair instead of proceeding on a qualifying pair. This contradicts the binding decision that base reds pass without that detour and the new merge skill. The setup guide still requires a green-only receipt, and the phases guide still says a red retry keeps the repair path without the new exception. Update these existing descriptions to the implemented policy. The plan explicitly called for checking guide references, but its assertion that none describe verify receipts was incorrect.

## Verification

- Read back the implementation's kept logs with `akrogon log`: `proof-verify` (20 pass), `proof-gates` (5 pass), `proof-skills` (7 pass), and the initial `plan-verify` red proof (3 fail, 1 pass). Planned file-level commands ran without skipping or disabling planned cases. The initial proof preceded the product implementation. The criterion-1 selector correction has an actual source: the seeded green base receipt was selected instead of the linked fresh base record.
- Current-head verify receipt is run `c1a3a88d-d19b-45d9-9a78-842980cd8b4d` at the full reviewed SHA, setup 0, all commands 0. Read back its format, test and typecheck logs: formatting passed, 1001 tests passed, and `tsc --noEmit` passed. This final run follows the last prettier change to tests/helpers. The report's approximate `87ae425a` receipt identifier is inaccurate, but the actual complete current-head receipt exists, so that report detail does not block.
- Specific missing scenarios were exercised by `akrogon run-check --name review-b-known-red -- bun <temporary probe.ts>` after the configured locked setup. F1 and F2 above reproduce on the reviewed head. No full-suite rerun was needed because no code changed and current-head full-suite evidence exists.
- `check review-b-inspect: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-review-b-inspect-1792229096787-2087414.log` keeps the clean status, full head, diff and trailers. Read back with `akrogon log`.
- `check review-b-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-review-b-area-paths-1792229110296-2088565.log` lists paths named by changed `src/AREA.md` from the repository root. Source, test and index pointers exist. Absent `issues/chart/`, `issues/closed/` and record JSONL paths are runtime/state locations excluded from the sparse worktree, not dead documentation destinations. No dead-pointer Fix.
- Runtime changes are confined to CLI flag wiring, verify receipts/run extraction, and exporting the existing failure extraction. Phase and direct guard consumers remain unchanged. No lesson removal, dependency change or runner filtering is present.

## Test-Change trailers in base..HEAD

- `5fb7672`: `tests/helpers.ts added seedRun record seeder, greenReceipt delegates to it; no existing expectation changed`; `tests/verify.test.ts added known-red pass/refuse cases, pair-refusal matrix and plain-verify regression guard; no existing expectation changed`; `tests/receipt-gates.test.ts added qualifying/non-qualifying pair cases through the merge gates; no existing expectation changed`; `tests/docs-links.test.ts added seat-skill and direct-landing known-red wording contracts; no existing expectation changed`.
- `24dca88`: `tests/verify.test.ts wrong expectation found by worker u1: runs.find(sha === base) returns the seeded green receipt instead of the fresh base run; select by compares === headRun.run instead`.
- `b9bc11e`: `tests/helpers.ts prettier line-wrap in greenReceipt after seedRun extraction; no expectation changed`; `tests/verify.test.ts prettier line-wrap in imports and failureScript signature; no expectation changed`.

Judgment: changed paths match `src/test-files.ts`. New tests need no prior source. The existing greenReceipt helper retains its behavior. The selector correction cites and fixes the actual seeded-receipt ambiguity. Formatting changes alter no expectations. F3 separately rejects the prose checks despite the plan requesting them.

## Operator actions and Nits

None.


## 2026-10-17 check.repair

Start head: `b9bc11e1a9d9f0004ee49a86912958d2f5f127bb`. Repaired head: `60b30f3adc0b72df885cb7af2717fca64d42c44a`. Base unchanged: `483c693771e83aa46aa074c7576bc3e3b5beb1b3`. Read both initial reviews, the current brief/design/plan/report and skill references. No live-service grants are needed: all behavior proofs use isolated local fixture repositories with finally cleanup.

### Repairs

- **B F1:** committed reproduction `538f404`, then product fix `3cacd39`. `baseCoversHead` now requires completion and setup 0 on both sides, sharing the rule between verify and receipt acceptance. The CLI regression first failed because verify returned 0 despite head setup 1, then passed with exit 1. Existing plain-verify and seeded eligibility checks remain unchanged.
- **B F2:** committed reproduction `1c4341a`, then product fix `af71335`. Receipt acceptance now examines every linked base record for each candidate head. A first unqualified base no longer hides the second qualifying comparison. The CLI regression first failed at the check.review move (exit 1), then passed (exit 0). It also proves both fresh comparisons link to the same reused red head, with three total records.
- **A F1 / B F4:** documentation fix `60b30f3`. README's verify usage includes `--known-red`, and its phase and verify descriptions accept qualifying pairs. Setup, implement/review and merge guides describe the matching receipt rule and the retry, comparison, both-log judgment and passing continuation. The analogous review paragraph and merge gate/restack descriptions were included in the same stale-contract sweep. Before: “a red rerun ends with `check.fix --attempt <id>`”. After: a no-cause red retry gets `akrogon verify --attempt <id> --known-red`, with an agreed pass continuing to `merged --check`. A dated implementation note was appended to plan.md before the guide edits, citing the binding policy and criteria 7–8. No locked artifact changed.

Each reproduction is the only new test for its behavior Fix and was committed before its separate product fix. Both test commits carry Test-Change trailers citing the finding and corresponding brief outcome. No prior test expectation changed. The documentation finding shared by the two reviews is one Fix, repaired in one commit.

### Proofs on the repaired head

Ran all five existing planned file-level commands, authored before this repair: `bun test tests/verify.test.ts` (22 pass), `bun test tests/receipt-gates.test.ts` (5 pass), `bun test tests/docs-links.test.ts` (7 pass), `bun test tests/flaky.test.ts` (3 pass), and `bun test tests/keep-rule.test.ts` (3 pass), each through run-check. These include the original qualifying/refused pairs, exact-base freshness, unchanged plain verify, leaf/merge/direct gates and existing consumers. No planned proof was filtered, disabled or replaced by B's reproduction. The skills test remains mechanically green while its prose expectations await A's F3 correction.

Specific formatting and `git diff --check` also passed. The working tree was clean after the five repair commits. Setup used the configured frozen install behind the per-worktree flock. All cited logs below were read back with `akrogon log`.

- `check repair-b-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-f1-red-1792229233664-2097994.log`
- `check repair-b-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-f1-green-1792229238481-2098732.log`
- `check repair-b-f2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-f2-red-1792229254199-2099768.log`
- `check repair-b-f2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-f2-green-1792229254697-2100287.log`
- `check repair-b-docs: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-docs-1792229278475-2102470.log`
- `check repair-b-proof-verify: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-proof-verify-1792229293696-2103557.log`
- `check repair-b-proof-gates: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-proof-gates-1792229288025-2103554.log`
- `check repair-b-proof-skills: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-proof-skills-1792229287552-2103556.log`
- `check repair-b-proof-flaky: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-proof-flaky-1792229287684-2103555.log`
- `check repair-b-proof-keep: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-proof-keep-1792229289490-2103558.log`
- `check repair-b-format: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-format-1792229288899-2109678.log`
- `check repair-b-final-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-repair-b-final-diff-1792229306243-2156219.log`

### Handed to A

- **B F3:** remove or replace the new prose-string expectations in `tests/docs-links.test.ts` while preserving executable command checks. This is a correction of existing test expectations, which the check.repair skill explicitly reserves for A. No missing runner, fixture factory, environment value or operator action blocks it. Rerun the planned docs-links proof after that correction.

- **A F1 / B F4 follow-up:** update `tests/command-reference.test.ts:32`'s verify argument contract to include `[--known-red]`. The full current-head verify exposed this stale expectation after README correctly documented the new supported flag. This is another correction of an existing test expectation, reserved for A. Its real source is the implemented CLI option and the README fix requested by A F1/B F4. Keep the command contract test, since executable command syntax is allowed. Rerun `bun test tests/command-reference.test.ts` through run-check, then verify the committed final head.

A's N1–N3 are unchanged and receive no unrelated cleanup. No new reusable Nit is held by B.

### Final verify and disposition

`akrogon verify` on `60b30f3adc0b72df885cb7af2717fca64d42c44a` exited 1: format 0, test 1 (1002 pass, 1 fail), typecheck 0. The sole failure is `README covers every dispatched command and its argument contract`: expected arguments omit `--known-red`, while README includes it. The cause is in the documentation repair, so no no-cause retry or known-red exception applies. The expectation correction is handed to A above, and no green receipt is claimed.

Read back the verify logs with `akrogon log`: `implementation/check-format-1792229295595-2111444.log`, `implementation/check-test-1792229442063-2111444.log`, and `implementation/check-typecheck-1792229444160-2111444.log`. The test log records the additional optional `--known-red` argument as the only expected/actual contract difference. The original planned proofs and B's regressions all pass, but the full test check remains blocking until A corrects the current expectation.


Completed verify run: `6786c7ae-0d74-481a-9e7b-3f6f2e28301b`, setup `0`, scope `leaf`, end `2026-10-17T09:30:44.161Z`. No merge_checks were run. Next phase requested: `check.fix`.


## 2026-10-17 check.review after check.fix round 1

Verdict: **ready**. All earlier Fixes are resolved. No new blocking finding, Nit or operator action.

Base: `483c693771e83aa46aa074c7576bc3e3b5beb1b3`.
Prior reviewed head: `b9bc11e1a9d9f0004ee49a86912958d2f5f127bb`.
B repair handoff: `60b30f3adc0b72df885cb7af2717fca64d42c44a`.
Reviewed head: `c9f658b16d3cf8ee4a153260f54756410bbc8786`.

Reviewed only the repair range from the prior reviewed head, including B's separately proven behavior/docs repairs and A's final test correction. The check.fix report records an unchanged base and no refreshed/rebased branch, so there are no main commits or conflict resolutions to distinguish with range-diff. The worktree is clean. No AREA.md changed in the repair range.

### Finding disposition

- **F1:** the shared pair predicate now requires completed head setup 0 as well as completed base setup 0. The committed failed-head-setup reproduction remains in the current full green suite. Earlier fail-before/pass-after evidence remains applicable.
- **F2:** receipt lookup evaluates all linked base records. The committed retry reproduction still proves a rejected first comparison does not hide a later qualifying pair, including the actual check.review move. Earlier red/green evidence remains applicable.
- **F3:** A removed only the disallowed prose expectations and redundant bare-flag substring assertion from docs-links. Checks for the literal seat, merge-attempt and direct-holder commands remain. The policy prose remains subject to the prior human review rather than wording assertions.
- **F4 / A F1 and follow-up:** README and existing guides describe qualifying pairs and the retry/comparison/log-judgment continuation. A updated the command-reference test to the actual verify CLI flag. Its prior red expectation was contradicted by the implemented option and corrected README, so the changed expectation has a real source and preserves the command-contract test.

A's commit `c9f658b` changes only `tests/docs-links.test.ts` and `tests/command-reference.test.ts`, with no runner filtering, disabling, helper edits or production changes. The two Test-Change trailers cite B F3's rejected prose expectations and B's README/CLI handoff respectively. Both are valid sources. The two earlier B reproduction trailers (`538f404`, `1c4341a`) cite brief criteria 3 and 1 and their findings. The initial branch trailers remain as audited above. No documented runtime behavior changed in A's final test-only correction.

### Current verification

Read back with `akrogon log`:

- `check fix-docs-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-fix-docs-tests-1792229509895-2560308.log`: the two changed test files pass all 13 tests after A's edits.
- Completed leaf receipt `67377518-3b29-406b-a1af-8eb6ac3c7f81` names the exact reviewed SHA and current command set, setup 0, all exits 0, end `2026-10-17T09:34:23.640Z`. Its kept logs are `implementation/check-format-1792229514278-2560575.log`, `implementation/check-test-1792229661545-2560575.log` (1003 pass, 0 fail), and `implementation/check-typecheck-1792229663640-2560575.log`. All were read back. This run follows the latest test edits and includes the earlier planned proofs and both reproduction cases.
- `check recheck-b-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-recheck-b-diff-1792229684759-2998620.log`: exact head, clean status, A's complete diff and commit trailers.
- `check recheck-b-repair-range: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-recheck-b-repair-range-1792229696199-2999378.log`: complete earlier repair diff, whitespace check and all branch Test-Change trailers.

No rerun was needed: current-head checks are complete, the two changed test files have current proof, and no new correctness concern remains. No B-held reusable Nit requires a lesson entry. Requesting merge with verdict ready.


## 2026-10-17 merge attempt a4a927fa-3f1b-4abf-8d1b-c73ebfe646be

Applied top: `c9f658b16d3cf8ee4a153260f54756410bbc8786`. Batch base: `483c693771e83aa46aa074c7576bc3e3b5beb1b3`. No members. HEAD matches the prompt and batch, worktree clean. No fetch, rebase or commit performed.

`akrogon verify --attempt a4a927fa-3f1b-4abf-8d1b-c73ebfe646be` exited 0 and printed `reuse receipt 67377518-3b29-406b-a1af-8eb6ac3c7f81 tree=3a54b6936f3a3f2ede7f012a72186c893a8aaaf1`. The merge command set matches the already verified set: merge_checks and merge_covers are empty. Current config and tree are unchanged, so reuse is valid. The receipt's format, 1003-test and typecheck logs were read in the preceding re-check.

`akrogon phase known-red-pass merged --slot B --check --attempt a4a927fa-3f1b-4abf-8d1b-c73ebfe646be` printed `ok`, stamping the tested top and passing receipt, ancestry, trailer and lesson guards. Kept evidence read back: `check merge-b-preflight: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/implementation/check-merge-b-preflight-1792229740155-3003860.log`.

Gathered the main-red owner's ISSUE.md and all three child briefs (known-red-pass, expiring-time-rule, main-red-notice) before the push. Completion broadcasting is conditional on the command printing issue complete or epic complete. No advisory failure or operator action.

Final command `akrogon phase known-red-pass merged --slot B --attempt a4a927fa-3f1b-4abf-8d1b-c73ebfe646be` exited 0, printed `moved merged` and `deployed 483c693771e8..c9f658b16d3c; deployed c9f658b16d3c`. The command completed the push and deployment. It printed no issue complete or epic complete line, so no broadcast was due.
