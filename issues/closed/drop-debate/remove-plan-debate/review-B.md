# Review B: remove-plan-debate

Date: 2026-10-25. Phase: check.review. Verdict: ready.

Base: `6939013807f1ec1f32c664520426157dbc99e525`.
Reviewed head: `1deb1fb0d750e3f21154697743aa797ff15dd79d`.

No Fixes, Nits or operator actions. Reviewed independently without reading A's review. No code changes or commits during review.

## Contract review

| Criterion | Judgment |
| --- | --- |
| 1 | `withoutKey` removes only the named legacy key before strict parsing. `readRepo` and both init input paths use `parseRepoConfig`. The tests cover both legacy values and refusal of unrelated keys. |
| 2 | State parsing drops `debate`; fresh states load and saving a legacy state omits the key. The canonical fixture now exercises states without it throughout the suite. |
| 3 | Log moves, timing phase fields and failure metadata accept historical phases. Live states and CLI destinations remain restricted to live phases. Timing gaps use A+B for retired visits without indexing live routing. The history tests exercise parsing and the timing CLI. |
| 4 | No route enters either retired phase. Recovery uses live destinations. Existing dispatch and frozen-record cases prove a single A synthesis prompt and the move to implement. |
| 5 | Read all six affected skills and the shapes changes. Planning is A synthesis from brief/design, review reads no debate artifacts, route choices are lifecycle/direct, state templates omit debate, init omits rebuttal and the watcher lists only live phases. |
| 6 | Reviewed the changed human docs and SVG against the routing and rollback contract, starting from state-and-phases, config and plan-work. The diagram starts at synthesis and retains the existing review/repair flow. Rollback explicitly restores `debate: 'no'` for records created or saved without it. Chart consultant exchange, its picture and quick-fix story are unchanged. |

No AREA.md changed. Followed reference-index and the source/test/skill area indexes. No issues, lessons, recorded session fixture or excluded charting surface changed on the branch. No lesson retirement to audit.

## Verification evidence

Read the following kept logs with `akrogon log`. Paths below are relative to this leaf's `implementation/` directory. These are A's completed runs on the reviewed head, reused because no code, test, helper, fixture or runner changed afterward.

| Evidence | Kept result |
| --- | --- |
| Legacy/state/history/live-route criteria | `check proof-criteria: 0 .../check-proof-criteria-1792913196896-999514.log`, 6 pass |
| Planned port regression files | `check proof-ports: 0 .../check-proof-ports-1792913272684-999977.log`, 504 pass across 13 files |
| Synthesis dispatch | `check proof-concurrent: 0 .../check-proof-concurrent-1792913273927-1273742.log`, 1 pass |
| Synthesis move and frozen records | `check proof-frozen: 0 .../check-proof-frozen-1792913275126-1274753.log`, 6 pass |
| Skill/docs links, shapes and command references | `check proof-docs: 0 .../check-proof-docs-1792913283554-1277073.log`, 37 pass across 6 files |
| Types | `check proof-typecheck: 0 .../check-proof-typecheck-1792913285695-1279396.log` |
| Required verify test check | `check test: 0 .../check-test-1792913487203-1279718.log`, 1167 pass, 0 fail |
| Required verify format check | `check format: 0 .../check-format-1792913294543-1279718.log`, all matched files pass |
| Required verify typecheck | `check typecheck: 0 .../check-typecheck-1792913489423-1279718.log`, tsc completes |

The implementation report records a green `akrogon verify` receipt for the reviewed head. Planned tests are all present in the recorded runs. Combining the two planned docs commands into one run preserves every named test file and adds three files. The concurrent and frozen filters match the plan. No planned case or runner configuration is disabled or skipped by this diff. Proofs run after the latest changes to their tests and inputs. No material proof-command correction is needed.

Read the preimplementation and deliberate-break logs: `check retired-debate-red: 1 .../check-retired-debate-red-1792912420245-87253.log` shows the four missing legacy/removal behaviors fail. `check retired-debate-break: 1 .../check-retired-debate-break-1792912372109-83454.log` shows both history cases fail when live phase removal lacks historical schemas. `check retired-debate-routing-break: 1 .../check-retired-debate-routing-break-1792912394910-85044.log` shows the timing CLI fails on the removed live routing lookup. The green criteria run covers all six cases on the final code.

Review traces include `check review-b-src: 0 .../check-review-b-src-1792913554987-1878392.log`, `check review-b-docs: 0 .../check-review-b-docs-1792913555110-1878447.log`, `check review-b-test-ports: 0 .../check-review-b-test-ports-1792913569640-1879209.log` and `check review-b-final-surfaces: 0 .../check-review-b-final-surfaces-1792913578765-1879726.log`. The last confirms a clean worktree and unchanged excluded files.

## Test-Change review

Inspected `src/test-files.ts` and all test diffs. All 13 modified existing test paths have trailers on `a170a2ad`; the criterion test file is new. Every trailer cites the design's explicit fixture/port outcome. Fixture key removals follow the removed state contract. The two-slot busy, exited-hook, seat-selection, observation and race tests retain their assertions on check.review. The stray-artifact case exercises synthesis-to-implement and still refuses branch-owned issue files. The duplicate rebuttal-setting stop cases become one synthesis stop because that setting and route are removed. The removed dispatch-guard test describes behavior explicitly removed by the brief. Single-A dispatch remains covered by the concurrent-hooks case. Accepted each trailer against those sources.

Exact trailers follow.

```text
Test-Change: tests/helpers.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): leaf() drops debate
Test-Change: tests/batch.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): drops debate
Test-Change: tests/leaf-stop.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): drops debate
Test-Change: tests/pause-next.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): drops debate
Test-Change: tests/release-any-phase.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): drops debate
Test-Change: tests/session-routing.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): drops debate
Test-Change: tests/state-inventory.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): drops debate, stray notes key keeps the refusal
Test-Change: tests/state.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): canonical drops debate
Test-Change: tests/timing-report.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): drops debate
Test-Change: tests/next.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): busy, exited and seat-resolution cases move to check.review, debate guard test deleted with the guard
Test-Change: tests/phase.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): race moves to check.review, stray-artifact move to plan.synthesis, stops drop rebuttal config
Test-Change: skills/watch-issues/scripts/observe.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): mix-leaf moves to check.review, drops debate
Test-Change: skills/watch-issues/scripts/observe-log-tail.test.ts design.md Tests and Agreed-at-opening-map (retired phases ported to a surviving phase, debate dropped from fixtures): drops debate
```

Phase result: `akrogon phase remove-plan-debate merge --slot B --verdict ready` returned `moved merge`.
