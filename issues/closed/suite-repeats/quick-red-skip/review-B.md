# Review B: quick-red-skip

Date: 2026-11-01
Phase: check.review, initial blind review
Base: `318cfda32d8ee6a569326ba7785df740cfd22039`
Reviewed head: `bee1b5429f58e9cec1ab2d2bfe904c529e698ee8`
Reviewed tree: `916761c776917d7a9a7931788dcadd71ae0aee17`
Verdict: `ready`

## Findings

No blocking defects or retained Nits. Reviewed the whole diff against the brief, design, plan, affected documentation and receipt consumers. No peer review was read and no code was changed.

`implementation/report.md` is absent. This is not a material verification gap here: the saved configured-check receipt identifies the tested tree and exact commands, and its logs contain the current criterion cases. The head's final commit is empty, so its tree is identical to the verified commit below. No proof-command correction was needed to establish the criteria from the configured full test run.

## Verification

Existing completed leaf receipt `ee1468ef-1f67-4587-8a8b-61fe38348150` tested commit `8d5c5723bfaf3c41dde980cba614226cf7945bfd`, tree `916761c776917d7a9a7931788dcadd71ae0aee17`, with setup 0 and all configured commands 0. Independently read the ledger and each log with `akrogon log`. This run follows the latest changes to the tests, helpers and product code. No check was rerun because current evidence was already complete.

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-format-1793540068818-803909.log` — configured Prettier check passed.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-test-1793540136718-803909.log` — configured `bun test --timeout=30000 --parallel=4 --no-isolate`, 1267 pass, 0 fail across 72 files.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-typecheck-1793540139061-803909.log` — configured `bun run typecheck` passed.

Criterion mapping, with all named cases found passing in that current configured test log:

- C1/C2: CLI fixture places the full suite first in config, proves reorder, later quick execution after a red, absent suite marker, blocked receipt and gate rejection, then removes the broken tracked file and proves fresh full execution and gate acceptance. Setup-red case also passes.
- C3: CLI case proves the second full suite executes after the first full suite fails, while merge members remain blocked. The existing concurrent-member and all-members-finish cases remain intact and pass.
- C4: CLI retries count two executions of formerly reusable commands and members and assert no new `reused` entries. Command-text changes rerun siblings. The schema case, flaky reused-entry exclusion and slow-run eligibility/episode cases pass. Schema and consumer guards remain intact.
- C5: leaf and merge CLI cases prove no comparison row is created on a whole-green base and gate/CLI agree. Fresh red-base coverage still passes. Source uses the existing `greenRun` and `knownRedReceipt` predicates without changing their contracts.
- C6: read the changed red-disposition paragraphs in implement/check/merge skills, chart direct-route wording and all three named checks-document sections. They explain that blocked checks did not run, direct repair to their blocker and remove per-command reuse promises. Adjacent command/config/merge documentation and area descriptions were updated consistently.

Read back planning red evidence: `check plan-red-verify: 1 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-red-verify-1793539452393-447230.log` shows missing blocking/order/base-skip and retained reuse fail the criterion cases. `check plan-red-violation: 1 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-red-violation-1793539446758-445214.log` shows deliberately blocking the second full suite turns C3 red. `check plan-red-slowmerge: 1 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-red-slowmerge-1793539458635-451486.log` shows the converted slow cases red before implementation. These are intended planning reds, not failed current checks.

No planned test or runner configuration was skipped, filtered out or disabled by the implementation diff. The configured test run includes every planned case, so earlier focused runs are not needed as current proof. In particular, the slow test's later formatting change is covered by this run.

## Test-Change trailers

Listed over `318cfda32d8ee6a569326ba7785df740cfd22039..HEAD`, applying the path rule in `src/test-files.ts`:

- `a18a1e97`: `Test-Change: tests/verify.test.ts leaf quick-red-skip: per-command reuse deleted by design Q2; converted tests assert re-execution and no reused entries, new tests prove full blocking and the known-red base skip`
- `a18a1e97`: `Test-Change: tests/slow-merge.test.ts leaf quick-red-skip: per-command reuse deleted by design Q2; the two cases that produced reused entries become seeded rows / a blocked full conversion`
- `8d5c5723`: `Test-Change: tests/slow-merge.test.ts formatting only, no expectation changed`
- `bee1b542`: `Test-Change: tests/AREA.md doc line updated for full ordering and blocked entries, no test logic`

Accepted: design Q2/Q3 and brief C4 explicitly replace per-command reuse with re-execution, including obsolete reuse-only tests. The packing/reuse case is obsolete under that decision. Schema compatibility, blocked-member known-red behavior, all-member completion, and independent packed-log reader tests remain. The slow accepted-close conversion retains its acceptance-output regression assertion while exercising a current partial-run source. The formatting trailer matches a formatting-only test diff, and the area trailer matches prose only. The empty final citation commit is allowed by the repository's existing trailer contract.

## Documentation and path checks

Opened `docs/reference/checks.md` for the changed behavior, plus the reference index and affected command/config/merge pages. Followed the changed implementation through `verifyCommands`, `runOnce`, `verify`, receipt selection, pass/member boundaries, config validation and flaky/slow consumers.

Listed named paths from the repository root separately for each changed area file:

- `check review-b-area-src-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-review-b-area-src-paths-1793540256686-1122032.log`
- `check review-b-area-tests-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-review-b-area-tests-paths-1793540256813-1122108.log`

All named source/test pointers exist. Missing matches are runtime/generated state or illustrative local names (`issues/`, receipt/timing/config files, direct holders, reconciliation state and verify-pass directories), not dead source pointers. This sparse worktree intentionally omits authoritative issue state. No changed index pointer is broken.

Supporting inspection receipts:

- `check review-b-receipts: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-review-b-receipts-1793540266580-1122434.log` — exact configured-check receipt.
- `check review-b-final-contracts: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-review-b-final-contracts-1793540303171-1123806.log` — identical verified/current tree, clean code worktree, merge red-disposition and test helpers.
- `check review-b-citation-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-review-b-citation-diff-1793540337068-1124910.log` — test changes and absence of report confirmed.

No live/paid proof, operator action or reusable Nit remains.

## Phase result

`akrogon phase quick-red-skip merge --slot B --verdict ready` returned `moved check.repair`. B's verdict is ready; the command's aggregated result routes the next pass to B repair.

## 2026-11-01 check.repair

Before: `bee1b5429f58e9cec1ab2d2bfe904c529e698ee8`
After: `516759cf09df9d1c53215fe73796af0eebd15b2e`

F1 repaired. Plan D2 explicitly requires retaining the first quick failure, so B followed A's finding despite B's earlier ready judgment. Reproduction commit `4b0b2fbc97969b230d0758282dbacd650c67003a` adds one real CLI-boundary case with two failing quick checks and both full/member entries. Fix commit `516759cf09df9d1c53215fe73796af0eebd15b2e` changes only the blocker assignment to `??=`. Both quick checks still execute, and full/member entries now share the first quick check's name, exit and log. Search found one sequential blocker assignment and the existing member `ran.find` rule. This is the initial repair, not a repeated finding.

Red/green command: `bun test tests/verify.test.ts --test-name-pattern 'share the first failing quick check'`. Red on the reviewed product plus the new test: suite exit 7 versus expected 4. Green after the one-line repair: 1 pass, 8 assertions. Logs read back:
- `check repair-b-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-f1-red-1793540485440-1130324.log`
- `check repair-b-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-f1-green-1793540493212-1130986.log`

The reproduction's final trailer is `Test-Change: tests/verify.test.ts review-A F1: real verify passes with two failing quick checks must record the first failure for both full checks and merge members, as plan D2 requires`. No existing expectation was changed.

All planned proofs were rerun on the committed repaired head because `src/verify.ts` and its test changed. Each passed; commands and exact proof-head mappings are in the restored report:
- C1/C2: `akrogon run-check --name repair-b-c1-c2 -- bun test tests/verify.test.ts --test-name-pattern 'red check outside full|failed setup blocks'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 2 pass, 0 fail. `check repair-b-c1-c2: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-c1-c2-1793540510259-1131842.log`
- C3: `akrogon run-check --name repair-b-c3 -- bun test tests/verify.test.ts --test-name-pattern 'red full check never'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 1 pass, 0 fail. `check repair-b-c3: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-c3-1793540510068-1131846.log`
- C4: `akrogon run-check --name repair-b-c4 -- bun test tests/verify.test.ts --test-name-pattern 'same-tree retry|command text|incomplete or failed-setup|receipt schema'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 5 pass, 0 fail. `check repair-b-c4: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-c4-1793540510241-1131843.log`
- C4 flaky: `akrogon run-check --name repair-b-flaky -- bun test tests/flaky.test.ts --test-name-pattern 'reused green entry'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 1 pass, 0 fail. `check repair-b-flaky: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-flaky-1793540509840-1131845.log`
- C4 slow: `akrogon run-check --name repair-b-slow -- bun test tests/slow-merge.test.ts --test-name-pattern 'open episode pins|eligible rows'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 2 pass, 0 fail. `check repair-b-slow: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-slow-1793540510523-1131847.log`
- C5: `akrogon run-check --name repair-b-c5 -- bun test tests/verify.test.ts --test-name-pattern 'no base pass|fresh base run'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 3 pass, 0 fail. `check repair-b-c5: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-c5-1793540510077-1131844.log`

F2 repaired by restoring `implementation/report.md` in the authoritative leaf folder. It records changed files/reasons, original implementation commits and refresh SHAs reconstructed from reflog, original configured-check receipt, current head, repair commits, red/green evidence, exact planned proof commands/results and remaining design limitations. The report was absent before repair, recorded by `check repair-b-inputs: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-inputs-1793540442307-1128785.log`. It remains an issue artifact outside the code branch: implement-issue's handoff contract explicitly forbids branch changes under `issues/`, so this artifact repair has no code commit.

A's cosmetic N1 is deferred unchanged. B retains no reusable Nit. No Fix is handed to A, no operator action remains, and no design or plan decision changed. No live/paid proof was needed. The code worktree is clean and the repair diff contains only the reproduction and the blocker assignment.

F2 after evidence: `check repair-b-report-after: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-report-after-1793540623668-1140910.log` confirms the restored non-empty report, its base/head and clean code worktree. Read back with `akrogon log`.

The first merge move was refused for a missing receipt on `516759cf09df9d1c53215fe73796af0eebd15b2e`. The installed release enforces the receipt without launching verify, so B ran the refusal's prescribed `akrogon verify` explicitly. Run `779469b4-df4f-4fbd-be81-46ea820e4cbc` completed green on that committed head with setup 0. Logs read back:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-format-1793540634051-1141378.log`
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-test-1793540703124-1141378.log` — 1268 pass, 0 fail, 72 files.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-typecheck-1793540705688-1141378.log`

