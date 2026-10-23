# Review B: config-refusals

Date: 2026-10-22
Phase: check.review
Base: bd996a7ad22225d35328088e7a7d1a1bc0c95d89
Reviewed head: 0e5fc9a303187adaccca738958f384d41f40059e
Verdict: fix

Reviewed blind. No debate artifacts exist (debate off). No code edited or committed.

## Fixes

### F1 — Remove the documentation wording test

`tests/worktree-store.test.ts:188-195` adds a test of English prose: it selects the first line containing `worktree_root`, requires the exact substring `outside the checkout`, and matches `/refus/`. Source: the real setup guide consumed by this test in every configured `test` check. Consequence: the suite enforces prose phrasing rather than the store contract. A valid edit such as “The store must be external to the checkout. Akrogon rejects an internal store.” fails these assertions despite preserving C5's meaning. The current test itself, rather than an unproven runtime scenario, violates check.review's explicit rule to reject akrogon tests of prose/output wording except executable commands, numbers and fixed references, and the operator's Function over form rule.

Delete this new prose test and assess C5 by reading the guide. Keep the real config/init/verify boundary tests. C5 requires correct documentation and a passing test check, not an executable prose assertion. This is a test-expectation correction and therefore goes to A under the repair split. No locked brief/design change is needed. The current guide satisfies C5.

## Scope and behavior assessment

The shared `worktreeStore` resolver rejects configured internal stores using canonical paths and `within`, including equality. Existing ancestors resolve through realpath before the missing suffix is appended. External prefix siblings remain accepted. `initialize` resolves the store before its first write. `verify.runOnce` resolves it before location checking, record creation and checkout creation. The own-modules message preserves the path and exit status and adds the requested setup remedy.

Read the changed setup guide, reference index, src/tests AREA pages and affected README/init skill pointers. No AREA file changed. The guide now documents refusal and removes the internal-store ignore claim. The init skill's stale phrase is explicitly excluded by the design and recorded in the report. README's conditional sync exclusion still describes existing defensive code. Neither supplies an additional blocking finding.

C6's history file is absent at the reviewed base. No lesson retirement was required or performed. No reusable Nit is held.

## Test-Change trailers

All changed test paths match `src/test-files.ts`. The reviewed range contains these trailers:

- `74717229`: `Test-Change: tests/config.test.ts brief criteria 1-2: in-checkout worktree_root now refused and sibling-prefix store accepted; moved custom/trees to ~/custom/trees, added repo2 sibling acceptance and 3-shape refusal cases`
- `74717229`: `Test-Change: tests/verify.test.ts brief criterion 1: verify refusal cases for relative, absolute and symlinked-alias in-checkout worktree_root; no checkout or receipt created`
- `74717229`: `Test-Change: tests/init.test.ts brief criteria 1 and 3: rootCases split into accepted external and refused in-checkout cases with no-write assertions; snapshot covers .gitattributes; store proposal moved external and .gitignore holds no store line`
- `74717229`: `Test-Change: tests/guard.test.ts brief criterion 4: own-modules and printed-check refusals now assert the setup in issues/config.yaml remedy`
- `74717229`: `Test-Change: tests/sync.test.ts brief criterion 1: remoteFixture default store moved outside the checkout; in-checkout exclusions and the root-shape loop dropped or converted to external stores; added sync refusal case`
- `74717229`: `Test-Change: tests/next.test.ts brief criterion 1: moved-worktree-root fixture now uses an external destination store so the recorded/expected mismatch stays reachable`
- `74717229`: `Test-Change: tests/worktree-store.test.ts brief criterion 5: setup.md worktree_root bullet test requires outside-checkout refusal wording`
- `28effb7f`: `Test-Change: tests/sync.test.ts remoteFixture default worktree_root resolves outside the checkout so sync tests run under an accepted store; worker finding F1`
- `28effb7f`: `Test-Change: tests/config.test.ts restore absolute worktree_root before the linked-worktree check; worker finding F2, no existing expectation changed`

Judgment: the config/init/sync/next changes remove expectations of the now-forbidden internal store, as the brief and design require. The linked caller correction restores the configured absolute store before comparing callers. Guard additions check the remedy keys required by C4. These sources justify the changes and deletions. The new worktree-store prose test is rejected under F1 despite its criterion citation.

## Verification evidence

Read the preserved logs with `akrogon log`. Final configured checks on reviewed head are green:

- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-test-1792697984136-420191.log` — 1112 pass, 0 fail.
- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-format-1792697763961-420191.log` — all matched files formatted.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-typecheck-1792697986760-420191.log` — tsc succeeds.

The planned config/verify/init/guard proofs show failures before implementation and passing current assertions afterward. No changed test/helper postdates the final full-suite proof. The first config attempt had an import error and is not proof, but its replacement records the expected four assertion failures. No proof-command correction, skipped test, runner change or known-red exception is used. No rerun was needed because no code changed and the final logs cover the reviewed head.

Review traces, also read back with `akrogon log`:

- `check review-b-inspect: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-review-b-inspect-1792698025212-1079906.log` — clean worktree, head, complete range/trailers and product diff.
- `check review-b-tests-docs: 128 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-review-b-tests-docs-1792698032421-1081502.log` — test diff, reference pointers and consumer locations. Exit 128 is the expected `git cat-file -e` result for the absent C6 history path, not a failed product check.
- `check review-b-proof-summary: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-review-b-proof-summary-1792698055447-1086154.log` — red-first and green proof summaries, clean worktree and empty base history listing.

## Operator actions

None.

## 2026-10-22 check.repair

Read both initial reviews for head `0e5fc9a303187adaccca738958f384d41f40059e`. A reports no Fixes. B's F1 is the only Fix and requires deleting a test expectation, which check-issue assigns to A. There are no product repairs for B, operator actions or missing proof machinery. No code changed and no commits were made. Existing green verification remains current, so no checks were rerun.

Evidence, read back with `akrogon log`: `check repair-b-handoff: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-repair-b-handoff-1792698128007-1099133.log` confirms the reviewed head, clean worktree and unchanged prose test.

### Handed to A

- F1: Delete the new documentation wording test in `tests/worktree-store.test.ts`, assess C5 by reading `docs/guide/setup.md`, update C5's proof record and rerun verification. Exception: correction of a test expectation, including deletion, belongs to A under check.repair. Preserve all config/init/verify boundary tests.

## 2026-10-22 check.review after check.fix

Prior reviewed base/head: `bd996a7ad22225d35328088e7a7d1a1bc0c95d89` / `0e5fc9a303187adaccca738958f384d41f40059e`.
Handed-off base/head: `c5e98748b9c79ae75a5e4cd2ddc410462435ffe8` / `7efe3d672e15773ff5f59396b5c8a0bf7c8a9cd8`.
Verdict: ready.

Computed `git range-diff` for these exact ranges myself. All seven original commits compare equal. The only added commit is `7efe3d67`, which removes the new prose test and nothing else. Worktree is clean. Main's intervening commits are outside this repair review.

F1 is resolved. The deletion removes an invalid prose assertion, not a product regression test. All existing boundary tests remain. The repair trailer is `Test-Change: tests/worktree-store.test.ts review-B F1: deleted the setup.md wording test; akrogon tests reject prose assertions, C5 is assessed by reading the guide instead`. Its source and reason match F1 and the changed test path. No other new trailer or changed original patch needs review.

Read the unchanged setup guide directly: it requires an external store, states refusal of an internal store and has no internal-store gitignore promise. C5's updated plan entry records this direct assessment and retains the configured full-suite check. This implements the requested proof correction without weakening any executable product case. No documented product behavior changed in the repair. No AREA file changed. No new Fix or reusable Nit is held, and no operator action remains.

Evidence read back through `akrogon log`:

- `check review-b-repair-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-review-b-repair-diff-1792698623319-2299078.log` — independent range-diff, repair diff/trailer, clean head and guide.
- `check f1-recheck: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-f1-recheck-1792698173667-1118203.log` — six surviving store tests pass after the deletion.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-test-1792698598253-1736444.log` — 1115 pass, zero failures, full configured command on the handed-off head.
- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-format-1792698432348-1736444.log`.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-typecheck-1792698601625-1736444.log`.
- `check review-b-repair-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/config-walls/config-refusals/implementation/check-review-b-repair-receipt-1792698640857-2320879.log` — completed green receipt `142fff75-693e-4e38-b6fb-ad7894a34117` for handed-off head/tree, setup zero and all configured commands zero, plus the earlier timeout trace and focused retry.

The configured test check is inconsistent: earlier `check test: 1` at `implementation/check-test-1792698407125-1123687.log` timed out in `merged and failed leaf slices with gone tabs are stopped and their processes end`; focused `check leaf-slices-retry: 0` at `implementation/check-leaf-slices-retry-1792698417884-1729227.log` passed all 15 cases. The focused retry alone would not replace the required full check. The later complete green verify receipt above supplies that missing evidence on the same repaired head. This is unrelated to the test-deletion repair and needs no product change. The implementation report stops before documenting that final run, so this entry records its current evidence. No check rerun was necessary in this re-review.
