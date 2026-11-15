# Review B: door-step-files

Date: 2026-11-11. Phase: check.review. Verdict: ready.

Base: `81c6bc8338846fb397c55fd46988bcd03d945573`.
Reviewed head: `5a289acfaf818debe097a2b2ed63dddf8a35e4fc`.

## Findings

No Fixes, Nits or operator actions. Reviewed the whole nine-file diff against the brief, locked design, plan D1–D8 and implementation report. No code or test changes made during review. No paid or live operations are required or recorded for this leaf.

## Reading-path audit

Compared the base's complete Direct route, Autopilot and Handover sections with the report's old-to-new table and the four resulting files, including every landing substep, wait/proposal condition and handover limit. The mapped blocks preserve their clauses. Changes beyond movement are relative-link repoints, read directives and the mode-specific resume sentence required by D4.

| Path | Result |
| --- | --- |
| Manual lifecycle handoff | SKILL.md retains refusals, route question, mode definitions and handoff end-marker packing. Neither direct-route.md nor autopilot.md is required. Handover detail is read only on the chart switch. |
| Direct route | The chosen-route directive opens direct-route.md before attempt creation. Protocol, known-red judgment, repair/push bounds, growth stop, both continuations and the live-branch prohibition remain present. |
| Autopilot | Operator start and latest-mode reading stay in SKILL.md. The mode directive and Open/Handoff/Drain citations reach autopilot.md, including self-answers, approvals, waits, proposals, drops, mode exit and chart records. |
| Full autopilot | The retained definition distinguishes who answers signposts. The same step file retains A's signposts picks, attribution and the prohibition on dropping handed work. |
| Old A at switch | Drain reaches handover.md for record creation, reset launch, prompt and helper limits. An autopilot session also holds autopilot.md's handed-list/folder/resume overrides. |
| Fresh A with start prompt | SKILL.md retains the address/chart/mode-entry and distinct-transcript checks before chart work. Attended and autopilot resume entries follow their mode. A-seat/span creation and failure behavior remain reachable. |
| Compaction resume | The opening re-read rule and CHART.md/fork resume rule are unchanged. The retained latest-mode/transcript rule preserves the mode, and the step directives reach the applicable detail. |

## Criteria and documentation

| Criterion | Evidence and judgment |
| --- | --- |
| C1 | All three read directives name the correct trigger and existing step file. |
| C2 | Followed the clause table against base and head on the paths above. No rule is lost or inaccessible when needed. |
| C3 | Refusal list, route question, three modes, operator-only start, mode-record read and fresh-A check remain in SKILL.md. |
| C4 | The three headings remain. Open, Drain, Handoff, questions.md and shapes.md repoints target the moved rules. Step-file Markdown links stay within the installed skill folder. |
| C5 | Exact known-red command remains in direct-route.md. Packing remains at Handoff, direct landing and abandon. The existing literal/link tests pass over their new locations. |
| C6 | Confirmed word counts: SKILL.md 8,387 before and 5,412 after. New files: direct-route 1,055, autopilot 1,476, handover 531. Initial manual load falls 35.5%. |
| C7 | AREA.md names all new files. Its named paths exist. The docs audit confirms files.md's procedure citation now names handover.md. Other matches retain valid entry-point links or describe unchanged behavior. |

Opened docs/use/quick-fix.md, docs/use/autopilot.md and docs/reference/files.md alongside the changed procedure. The documented behavior is preserved. Followed docs/reference-index.md to skills/AREA.md and checked affected citations. No scripts, runner configuration or lifecycle skills changed. No lesson removal or lesson claim appears in the diff.

Independent kept observations, read back with `akrogon log`:

- `check review-b-area-paths-current: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/implementation/check-review-b-area-paths-current-1794394174571-3771396.log` lists all 26 AREA.md file references from the repository root, including contextual asset/script names. Every path exists.
- `check review-b-docs-and-size: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/implementation/check-review-b-docs-and-size-1794394139420-3735791.log` records baseline/current word counts, docs matches and all branch commit messages. The earlier `review-b-area-paths` capture was empty because run-check did not forward the heredoc to Python. It supplies no evidence and is replaced by the explicit shell listing above.

## Test-Change audit

The only trailer in `81c6bc83..HEAD` is in `6a105a3588714893ee9cc185426929a2f1fbccd4`:

> Test-Change: tests/docs-links.test.ts door-step-files done-criterion 5: the pinned literals move to assets/direct-route.md, so both tests read the files that now carry them; no expectation changed

Accepted against brief C5 and plan D7. `src/test-files.ts` classifies this existing test file. Only its source reads change. The known-red literal, marker assertions and packing minimum remain unchanged. No other existing test, fixture, assertion or runner configuration changes. The tests exercise actual skill text and filesystem links without mocking the subject.

## Verification

Read the planned deliberate-break logs with `akrogon log`: `check literal-tests-prered: 1 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/implementation/check-literal-tests-prered-1794393745734-2358097.log` shows both literal tests failing on the absent new file. `check link-check-missing-target: 1 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/implementation/check-link-check-missing-target-1794393748639-2361020.log` shows the temporary missing-target link rejected. These are planned red observations, not unresolved check failures.

Read back `check changed-tests-after-a-fix: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/implementation/check-changed-tests-after-a-fix-1794393937127-2899344.log`: `bun test tests/docs-links.test.ts` ran all 11 tests, 0 failures, after the last skill change. The test edits precede all implementation commits and have no later helper/fixture changes. No proof-command correction, skipped planned test or disabled runner was found.

The completed leaf verification receipt `52615e3c-2ee4-4b4a-a4d4-b04aa257dab2` records reviewed head `5a289acfaf818debe097a2b2ed63dddf8a35e4fc`, setup 0 and each configured command exit 0. Read back its logs:

- Format: `implementation/check-format-1794393950206-2952569.log`, Prettier clean.
- Typecheck: `implementation/check-typecheck-1794393953634-2952569.log`, tsc clean.
- Test: `implementation/check-test-1794394042059-2952569.log`, 1,163 pass, 0 fail across 82 files, using `bun test --timeout=30000 --parallel=4 --no-isolate`.

These are the plan's required checks on the final head. No rerun is needed because the diff is unchanged and no specific test concern remains. The worktree is clean. No outstanding criterion, reusable Nit or operator action remains.
