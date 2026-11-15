# Review B: failure-names

Date: 2026-11-11. Phase: check.review. Verdict: **fix**.

Base: `97e88038a7d26ee0940de20a074d3ad71d8f9840`.
Reviewed head: `7001a46a2e5350412a19c3e53f9c770bd6e96102`.
Worktree clean. Initial review performed independently, without reading the peer review.

## Fixes

### F1. New prose assertions violate the review contract

Source: the new test at `tests/docs-links.test.ts:260`, introduced by `bbfb0213`, runs in the configured `bun test --timeout=30000 --parallel=4 --no-isolate` check. Lines 264, 267 and 268 require the literal prose `is not a real test title`, `timed out` and `the command ended by its own verdict` in two Markdown files. These are neither executable commands nor fixed references that run literally as written.

Consequence today: the test enforces wording instead of the seat behavior. For example, replacing “is not a real test title” with the equivalent “does not identify a real test title” would fail the first assertion despite retaining the rule. The current test also accepts the isolated words “timed out” without checking the runner-summary distinction. It is an added mechanical prose gate, explicitly rejected by check-issue's test rule and the operator's Function over form rule. Design's final paragraph permits existing phrase assertions only where their pinned sentence changes; it does not require this new prose test.

Remove the newly added prose assertions. Keep the structural symlink check. Judge criteria 7 and 8 from the actual text, as this review does below. This finding does not request rewriting the existing command-literal tests.

### F2. Criterion 5's corrected scenario has no valid red proof

Source: `implementation/report.md` cites `plan-red-verify2` as criterion 5's red evidence, but `70cfb4ad` subsequently changed the scenario in `tests/verify.test.ts:592`: main now fails `test:y`, the seeded notice represents `test:x`, the head has the same failure as main, and the expected known-red exit changed from 1 to 0. This is the right direction for exercising a new main-red notice, because `newRedUnits` reads the base comparison's own log.

Trace: read with `akrogon log implementation/check-plan-red-verify2-1794434988935-3608439.log` (absolute leaf path used). That run stops at the old `expect(result.code).toBe(1)`, receiving 0. It never reaches the notice-count assertion. `check-impl-verify-1794435384922-4000966.log` later fails the old scenario at the notice count, but its main still fails the already-noticed `test:x`; that is the fixture error corrected in `70cfb4ad`. Neither red demonstrates the corrected criterion-5 case detecting the loss of script identity. All recorded runs after the correction are green.

Consequence today: the claimed red proof for the new notice behavior is a failure of the superseded scenario, not evidence that the current test catches a regression. The design explicitly requires one deliberate break for criterion 5, and check-issue requires new behavior to show its test turning red. Record a deliberate break of script identity against the corrected existing notice test, restore the code, then record its green run and correct the report's criterion-5 evidence. The existing runner and case suffice. No new proof machinery or product change is requested.

## Verification evidence

Read the kept logs through `akrogon log`; no tests or covered operations were launched in this review.

- `check proof-flaky: 0 implementation/check-proof-flaky-1794435482001-4116721.log`: 7 pass, 0 fail. Includes mixed named/script streams, wrapper invariance and tuple-prefix distinction, unnamed streams, pipe-containing title, outside-grammar holder file, missing file, archives and corrupt-archive propagation.
- `check proof-verify: 0 implementation/check-proof-verify-1794435487771-4118571.log`: 60 pass, 0 fail. Includes same-script cover, different-script refusal, nameless cover, receipt refusal matrix, new notice/dedup and holder logs on both sides. This is after the latest test/helper changes in `70cfb4ad`.
- `check proof-docs: 0 implementation/check-proof-docs-1794435489479-4140889.log`: 12 pass, 0 fail. Green does not excuse F1.
- Committed-head verify receipt `5e8c1aab-defe-4f11-a620-909fb3b6b3ee`, tree `94d678ada3fa631aa24230d74eb86ce58405c141`, setup 0, completed 2026-11-11T22:19:17.628Z: format 0, typecheck 0, test 0. Read `check-format-1794435494147-4142886.log`, `check-typecheck-1794435496749-4142886.log` and the test summary in `check-test-1794435557372-4142886.log`: 1,170 pass, 0 fail across 82 files. Commands match `akrogon config`; no planned test or runner configuration was skipped, filtered or disabled. File-wide proof runs include the planned focused cases. The verify proof uses timeout 120000 instead of the focused plan command's 60000, retaining all cases.
- Read planning reds `plan-red-flaky1b`, `plan-red-flaky2`, `plan-red-flaky4`, `plan-red-verify` and `plan-red-verify3`: respectively missing script names, missing qualified unnamed name, holder file read as gone, wrong script-vs-script cover, and holder cover refusal. These are relevant red observations. F2 limits only the notice red claim.
- No grants, paid/live operations, env requirements, abandoned captures, or known-red disposition. All 24 `implementation/check-*.log` files have matching `check_end` entries in `issues/timings.jsonl`; no capture files remain.

## Behavior and documentation review

Traced `failedTests` through `flips`, `knownRedReceipt`, `newRedUnits` and `requireGreenReceipt`. The unchanged consumers compare the returned names as opaque sets. The reader follows the binding token-tuple wrapper rule, suppresses only the exact stream with a `(fail)` line, preserves unprefixed pipe-containing titles, ignores Signaled/free text, and falls back to the recorded regular file only after `readLog` returns nomatch. Archive/member errors still propagate. No product defect found in these paths.

Opened the changed behavior's live pages, `docs/reference/checks.md` Known red/flaky/refusal row and `docs/reference/files.md` Flaky report, via `docs/reference-index.md`; both describe the expanded names. Read the changed `src/AREA.md` verify/evidence paragraphs. Read both seat texts: all-real-title heads use the named branch, any coarse name takes the whole two-log read, and a runner-summary timeout counts as the command's own verdict. These satisfy criteria 7 and 8 by judgment. All four lifecycle-rules entries remain mode 120000 and point to the shared file.

One shell command extracted paths named in `src/AREA.md` and tested existence from the repository root. All concrete source/test targets exist: `src/{admission,akrogon,config,evidence,flaky,flock,hc,init,install,land,listen,notice,pack-command,pack,phase,preflight,readiness,reconcile,release,rollback,scope,seat,self-update,shell,state-home,stop-run,stop,timing-report,timing,transcript,verify-pass,verify}.ts`, `tests/helpers.ts`, `tests/phase.test.ts`. The listing reports `issues/chart/`, `issues/closed/`, `issues/timings.jsonl` and `issues/verify-runs.jsonl` absent in this worktree; these are generated issue-store paths in the registered checkout, not broken source pointers. The authoritative ledger/timing files were read there for this review. No dead-pointer Fix.

## Test-Change trailers

Path rule inspected in `src/test-files.ts`; all three changed existing test files match it. Trailers in base..HEAD:

`bbfb0213`:

```text
Test-Change: tests/flaky.test.ts added script-name, unnamed, and outside-grammar cases for criteria 1, 2 and 6; no existing expectation changed
Test-Change: tests/verify.test.ts added script-name known-red, notice and holder cases for criteria 4, 5 and 6; no existing expectation changed
Test-Change: tests/docs-links.test.ts added non-title-name phrase assertions for criteria 7 and 8; no existing expectation changed
```

The flaky and verify additions map to their cited outcomes and use real consumer boundaries over the chart-approved Bun-shaped fixture logs. No base expectation was removed or weakened. The docs addition is cited, but F1 rejects its prose checks.

`70cfb4ad`:

```text
Test-Change: tests/flaky.test.ts criterion 1: count expectations corrected to the observed output, the wrapped log moved to its own file and the ledger seeded for the akrogon flaky assertion; no existing expectation changed
Test-Change: tests/verify.test.ts criterion 5: the seeded incident is test:x while the current main run fails test:y, matching how newRedUnits reads the compares run's own log; observed at impl-verify
Test-Change: tests/docs-links.test.ts format only: prettier line wrap; no expectation changed
```

Inspected the actual correction diff. Both fan-out files contain every shared name, so count 2 is correct; the separate wrapped path restores the intended fixture distinction; the CLI needs ledger rows rather than only the direct `flakyLines` input. The notice correction matches `newRedUnits`' real base-run direction and criterion 5, with F2 requiring current red evidence. The docs change is formatting only. The trailer's “no existing expectation changed” refers to base expectations; the new planned expectations did change as the commit body explains. No uncited old regression test change found.

## Nits and operator actions

None. No lesson-list changes in the reviewed diff. No reusable Nit held.

## Handoff

`akrogon phase failure-names check.repair --slot B --verdict fix` returned `moved check.repair`. No code changes or commits made during review.


## check.repair — 2026-11-11

Read both initial reviews, the current brief, design, plan and implementation report. A has no Fixes. B's F1 and F2 remain open on unchanged head `7001a46a2e5350412a19c3e53f9c770bd6e96102`; worktree clean.

### Handed to A

- **F1** — Removing the new prose assertions in `tests/docs-links.test.ts:260` corrects test expectations, an explicit check.repair exception reserved to A. Remove those assertions, retain the structural symlink check, and record criteria 7 and 8 by text review. Cite F1 and the design's existing-phrase-test restriction in the test-change trailer.
- **F2** — Criterion 5 lacks a deliberate-break recording for the corrected existing notice case. Use the existing `akrogon run-check` and `bun test --timeout=60000 tests/verify.test.ts -t 'a red main in one script reports new'` runner plus its existing fixture helpers. Record that case turning red when script identity is deliberately removed, restore the reader, record green, and replace the superseded red citation in `implementation/report.md`. This is the explicit missing-case/capture/recording exception, with no missing machinery.

No B-owned Fix remains to repair. No code changes, commits, proof launches, paid/live operations or operator actions in this pass. Existing green evidence remains as recorded above, with F2's red-proof gap still open. No checks rerun because no inputs changed and the handoff runs none. B holds no reusable Nit.

Phase command: `akrogon phase failure-names check.fix --slot B`.

Phase result: `moved check.fix`.


## check.review re-check — 2026-11-11

Verdict: **ready**. F1 and F2 resolved. No new Fixes, held Nits or operator actions.

Prior base: `97e88038a7d26ee0940de20a074d3ad71d8f9840`.
Prior reviewed head: `7001a46a2e5350412a19c3e53f9c770bd6e96102`.
Handed-off base: `97e88038a7d26ee0940de20a074d3ad71d8f9840`.
Reviewed repair head: `ec988c5cb1bc4996d48515cdb16e078e0edc2576`.

Re-read the skill and references, brief, design, plan and current implementation report. Reviewed only `7001a46a..ec988c5c`. Worktree clean. The report records a refresh with no base movement. Independently computed `git range-diff 97e88038..7001a46a 97e88038..ec988c5c` through run-check: all four original commits unchanged, only `ec988c5c` added. No conflict resolutions or main commits enter the repair scope.

### Findings resolved

- **F1:** `ec988c5c` removes the three narrative phrase assertions and adjusts the test title. The structural symlink assertions remain. Remaining literal-name checks concern the fixed `(script)` and `(no test name)` interfaces, not the removed prose. No product code, documented behavior, runner configuration or other test changed. The earlier judgment review of criteria 7 and 8 still applies.
- **F2:** Read `check-fix-red-notice-1794435910259-608808.log` through `akrogon log`: with the reported deliberate collapse of `(script) <inner>` to `(script)`, the corrected current case passes the known-red exit assertion, then fails the actual notice count at `tests/verify.test.ts:622` (expected 2, received 1). Read `check-fix-green-notice-1794435918329-616998.log`: the same case passes after restoration, 1 pass/0 fail, six assertions. The repair diff confirms the reader is restored exactly and the notice test/helper is unchanged. The report's criterion-5 mapping now cites this relevant red/green pair. This closes the missing recording without changing proof commands or expectations.

### Evidence

All paths below are under the leaf's `implementation/` and were read through `akrogon log`.

- `check review-b-range: 0 .../check-review-b-range-1794436033548-976864.log` — B's independent range comparison.
- `check fix-red-notice: 1 .../check-fix-red-notice-1794435910259-608808.log` and `check fix-green-notice: 0 .../check-fix-green-notice-1794435918329-616998.log` — valid criterion-5 deliberate-break proof.
- `check proof-docs2: 0 .../check-proof-docs2-1794435918455-618456.log` — 12 pass/0 fail after the latest docs-test change. Commit timestamp 22:25:15 UTC precedes this run's completion at 22:25:18 UTC.
- Committed-head verify receipt `34a30ac7-d6d4-4dec-9348-a83f17e50c23`, tree `179371a0fcfbe7dbdc41d405f88273fa6fad5475`, setup 0, completed 22:26:30 UTC: format 0 (`check-format-1794435927063-624229.log`), typecheck 0 (`check-typecheck-1794435929666-624229.log`), test 0 (`check-test-1794435990528-624229.log`: 1,170 pass, 0 fail across 82 files). Commands match the configured check set. No skip, filter or disabled runner introduced. Earlier criterion proofs remain applicable because their product/test inputs are unchanged.

No covered operations, paid activity or test runs launched by B. The one B run-check only compares Git ranges. All 32 leaf check logs match their timing check_end paths; no capture files remain. No known-red judgment needed.

### Repair Test-Change trailer

```text
Test-Change: tests/docs-links.test.ts removes the added prose assertions ('is not a real test title', 'timed out', 'the command ended by its own verdict') per check.review finding F1; wording is not the contract, the name literals and symlink check stay; no existing expectation changed
```

Accepted against F1 and the exact diff. Only the new phrase assertions are removed; no base regression assertion is changed. The phrase “no existing expectation changed” refers to base expectations, as in the earlier test commit.

No reusable Nit held, so no lesson write required. Request merge with verdict ready.

Phase result: `akrogon phase failure-names merge --slot B --verdict ready` printed `moved merge`.
