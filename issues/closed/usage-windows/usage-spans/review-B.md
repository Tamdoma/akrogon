# Review B: usage-spans

Date: 2026-10-17. Phase: check.review. Verdict: **fix**.

Base: `30030e644d0fb87c0fda3e4d73f8b46bc9629608`.
Reviewed head: `c7309ce43d3a04f0d9f5df182a33091186c0905f`.
Worktree clean. Initial blind review, no peer review read. Debate is off, so positions-B.md and rebuttal-B.md are absent as expected. No code edited or committed.

## Fixes

### F1. Cumulative Codex totals include usage in gaps

`skills/chart-issues/scripts/chart-usage.ts:324-343` filters counter snapshots to spans, then subtracts the baseline before the first span from the final snapshot. Cumulative counters include intervening work, so filtering snapshots does not remove gap increments. The same problem affects `spanOutput` across multiple spans.

Source/scenario: the supported cumulative-only rollout path, exercised with the existing `codex/codex-diff.jsonl` fixture, when the door leaves and re-enters a chart. Use spans `[10:00,10:03)` and `[11:30,11:40)` on 2026-10-06, until 12:00. The 11:01 and 11:05 snapshots are outside the spans. Expected input is `100 + (760-260) = 600`, output `10 + (140-70) = 80`. Actual input is 760, output 140. Another chart's work is attributed to this chart today. This violates brief C1's exclusion of gap records. Sum counter deltas attributed to in-span records using their actual preceding snapshots, preserving reset refusal.

Evidence: `check review-b-codex-probes: 0 implementation/check-review-b-codex-probes-1792235961689-3141351.log`, read back with `akrogon log`. The probe exits 0 to capture observed output, not to assert acceptance. No existing criterion test catches this path with disjoint spans.

### F2. Codex operator turns crossing the opening edge disappear

`skills/chart-issues/scripts/chart-usage.ts:388-395` removes user messages outside the spans before constructing operator intervals. A user message before a chart span whose response completes inside it therefore contributes no operator wait.

Source/scenario: Codex as door seat A, supported by the existing Codex door test and metadata contract. With existing `codex/rollout-tur.jsonl`, set a span `[2026-10-06T10:04:00Z,2026-10-06T10:20:00Z)`. The operator message is at 10:00:03 and its associated completion at 10:19. Expected operator turns 1 and wait 15.0 minutes. Actual operator turns 0 and wait 0.0, while working minutes correctly prints 15.0. Brief C1 explicitly requires an operator turn crossing an edge to count its in-span minutes. Construct operator intervals before intersecting them with spans, including outside-span messages as interval boundaries.

Evidence: the `crossing` case in `check review-b-codex-probes: 0 implementation/check-review-b-codex-probes-1792235961689-3141351.log`, read back. The implementation report acknowledges this limitation, but it contradicts the criterion. Existing tests start the Codex operator message inside the span and miss this failure.

### F3. Legacy windows include the excluded until boundary

`skills/chart-issues/scripts/chart-usage.ts:530` uses `untilMs + 1`, admitting a record exactly at until. Brief C1 explicitly defines legacy windows as `[opened, <until>)`; the design's window section repeats that rule. The plan's inclusive-legacy exception is not authorized by either locked artifact.

Criterion scenario: existing `claude/claude-spans.jsonl`, no spans, opened `2026-10-06T11:00:00Z`, until `2026-10-06T12:00:00Z`. Only g7 lands exactly at until. Expected calls 0 and zero token totals. Actual calls 1 and output_tokens 7. A boundary call is assigned outside the requested legacy window.

Evidence: the `legacy-until` case in `check review-b-boundary-probes: 0 implementation/check-review-b-boundary-probes-1792235949912-3140833.log`, read back. Its first two Codex cases used an incorrect temporary session directory depth and were unmeasured; they are superseded by the successful F1/F2 probes above. The legacy case located its fixture correctly.

The new legacy boundary assertion in `tests/chart-usage.test.ts:491-494` encodes the wrong behavior. Correct the expectation to the brief's half-open outcome. This expectation correction belongs to A under the repair split.

### F4. Required nonzero pi error outcome has no test

Brief C2 explicitly requires an assistant error with nonzero usage to count. The planned pi test and its fixture cover only a zero-usage error. Every nonzero assistant in `pi/pi-A.jsonl` has stopReason `stop` or `toolUse`; `pi-zero.jsonl` also contains only a zero error. Dropping all error responses would leave these tests green. This is a missing proof of a named done outcome, rather than a request for extra coverage. Add a nonzero error case with hand-computed calls, context and token totals through the existing CLI test runner. Existing implementation appears correct at line 475. The missing criterion case belongs to A under the repair split.

Evidence: `check review-b-test-audit: 0 implementation/check-review-b-test-audit-1792235979543-3142317.log`, read back, plus the planned `pi calls, compaction and error entries` test.

## Verification and documentation

Read brief, design, plan, report, ponytail guidance, reference index, affected script, tests, fixtures and the chart guide describing this behavior. No AREA.md is changed. No lessons are removed. No external mutation or operator action is required. Probe charts and fixture homes were temporary and automatically removed.

Saved current verification is green: format, 1027 tests, typecheck. Read back `implementation/check-format-1792235745661-2687605.log`, `implementation/check-test-1792235889227-2687605.log` and `implementation/check-typecheck-1792235891290-2687605.log`. The dedicated current criterion run is `check chart-usage-final: 0 implementation/check-chart-usage-final-1792235742222-2686964.log` (19 pass), also read back. The final commit only formats product code, with no later test/helper/fixture edit. No missing full-check run warrants repeating verify. These green checks do not establish the missing outcomes above.

The report's whole-file criterion run includes the planned filtered test cases. Reported initial red runs precede implementation, and corrected tests have a recorded red run against the worker implementation. Savings tables include the three charts, seat/session identifiers, windows, B/C percentages and required observational qualifications. Savings are informative only.

Changed prose documents span lifecycle, legacy windows, per-call context and pi measurement across SKILL.md, shapes.md and docs/guide/chart.md. The skill records collecting outstanding consultant turns, re-entry and shared-map allocation. No further prose defect found.

## Test-Change trailers

Audited `30030e644d0fb87c0fda3e4d73f8b46bc9629608..HEAD` using the changed-file rule in `src/test-files.ts`.

1. `7b9b668`: `tests/chart-usage.test.ts` — added seven criterion cases and renamed assistant-message assertions. New cases require no old-expectation source; the rename follows brief C2.
2. `7b9b668`: `tests/fixtures/chart-usage/README.md` — entries for new fixtures, no prior expectation removed.
3. `b608935`: `tests/chart-usage.test.ts` — corrected criterion numbers, seats and legacy totals. Whole-session Claude placement and final counters are justified by brief C1 and the existing real Claude fixture. Seat A operator sourcing follows the existing CLI contract. Hand-computed synthetic group totals agree with the fixture. The inclusive legacy boundary assertion is rejected under F3, despite the plan claiming compatibility.
4. `b608935`: `tests/fixtures/chart-usage/claude/claude-spans.jsonl` — added g3 in-span member and g7 at until. These additions exercise brief C1's final-group placement and boundary outcome. The fixture additions are valid; g7's legacy expectation is not.

No other commit changes an existing file matched by the test-file rule. No Nits or operator actions.

## check.repair — 2026-10-17

Repair starts from reviewed head `c7309ce43d3a04f0d9f5df182a33091186c0905f`. Read both initial reviews. A's F1 and B's F1 describe the same defect and are repaired together. No grants or external mutations were needed. Only the script and two new reproduction tests changed.

### Repaired

- F1 (both seats): reproduction commit `dd58a5f`, fix commit `482229b`. Compute each cumulative snapshot's delta against its immediate predecessor before selecting in-span deltas. Both token totals and operator output now sum the same deltas. Negative counted deltas still refuse measurement as a counter reset. CLI reproduction uses the existing cumulative fixture and the criterion's disjoint-span scenario. Its input/output change from 760/140 to the required 600/80, and second operator-row output is 70.
- F2 (B): reproduction commit `419a997`, fix commit `5f93974`. Construct Codex operator intervals from all operator messages, then intersect them with chart spans. Cap completion lookup at both the next operator message and until. The crossing case now reports one operator turn and 15.0 minutes.

Each behavior Fix has its own reproduction and product commits. Both reproduction commits carry a `Test-Change: tests/chart-usage.test.ts` trailer citing brief C1 and the corresponding finding. No existing test expectation or fixture was changed.

Evidence, all read back with `akrogon log`:

- `check repair-b-f1-red: 1 implementation/check-repair-b-f1-red-1792236063919-3147901.log` — `bun test tests/chart-usage.test.ts -t "cumulative codex spans"`, before the F1 fix.
- `check repair-b-f1-green: 0 implementation/check-repair-b-f1-green-1792236082423-3149706.log` — same command after the fix.
- `check repair-b-f2-red: 1 implementation/check-repair-b-f2-red-1792236091584-3150242.log` — `bun test tests/chart-usage.test.ts -t "codex operator turns crossing"`, before the F2 fix.
- `check repair-b-f2-green: 0 implementation/check-repair-b-f2-green-1792236099148-3150768.log` — same command after the initial fix.
- `check repair-b-criteria-final: 0 implementation/check-repair-b-criteria-final-1792236107560-3151962.log` — `bun test tests/chart-usage.test.ts`, 21 pass after the final until cap. This includes the planned proofs B did not write, including the original Codex door case, counter reset cases and all seven planned criterion tests. An intermediate whole-file run exposed completion beyond until after collecting outside-span messages; the final cap repairs that cause without changing its existing assertion.
- `check repair-b-savings: 0 implementation/check-repair-b-savings-1792236120527-3197398.log` — reran the three planned local savings commands on scratch copies, using base-red until `2026-10-17T09:04:40.067Z`, fresh-consultants until `2026-10-17T10:22:40Z` and usage-windows until `2026-10-17T10:35:45Z`, with CLAUDE_CONFIG_DIR and CODEX_HOME unset. All seat figures in the implementation report are unchanged. Scratch directories were automatically removed. No source chart file was written.

### Handed to A

- F3 (B): correction of an existing test expectation. Brief C1 and design require `[opened, until)`; remove the legacy `untilMs + 1` product exception together with correcting the inclusive-boundary assertion in the existing `spans filter` case. B leaves this Fix intact for A because the skill assigns all expectation corrections to A.
- F4 (B): C2 lacks only the nonzero pi error case. Existing tool: `bun test tests/chart-usage.test.ts -t 'pi calls'` and its CLI fixture helpers. Add the missing error-with-nonzero-usage case, with hand-computed call/context/token totals and deliberate-break evidence. No new runner or fixture machinery is needed.

Peer N1–N3 remain deferred as in review-A.md. B holds no additional reusable Nit. No operator actions are open. F3 and F4 still block completion of the leaf, so the destination is check.fix.

Final verification: `akrogon verify` on committed head `5f939742990877d2761b919b6c2f9b49c40486ff` is green: format 0, test 0 (1029 pass), typecheck 0. Logs read back: `implementation/check-format-1792236109656-3152661.log`, `implementation/check-test-1792236255453-3152661.log`, `implementation/check-typecheck-1792236257493-3152661.log`. Worktree clean and `git diff --check c7309ce..HEAD` passes. No merge checks run. F1/F2 are repaired; this green receipt does not resolve the F3/F4 handoff.

## check.review re-check — 2026-10-17

Verdict: **ready**. Reviewed head `bed019d122f9e894fffa5ed97d5e95686dd41e8e`, original base `30030e644d0fb87c0fda3e4d73f8b46bc9629608`, prior reviewed head `c7309ce43d3a04f0d9f5df182a33091186c0905f`. Reviewed repairs only. B's F1/F2 repairs through handoff head `5f939742990877d2761b919b6c2f9b49c40486ff` retain their earlier evidence; A added `80bbb14` and `bed019d`. No branch refresh or rejected merge is recorded, and the prior reviewed head is an ancestor, so no range-diff or rejected-merge rerun is applicable. Worktree clean. No code changed or committed during this re-check.

### Findings resolved

- F1 (A and B): in-span cumulative deltas and operator output remain covered by the passing reproduction test.
- F2 (B): the crossing operator interval remains covered, and the existing Codex door test still passes with completion capped at until.
- F3 (B): `bed019d` removes the legacy `untilMs + 1`. `80bbb14` corrects the until-boundary assertion to calls 0 and excludes g6 at 10:45 from the legacy Claude example. Hand arithmetic agrees: five groups, context 46800 / 5 = 9360, output 10030. Brief C1 and the locked design justify these expectation corrections despite the old plan's inclusive exception.
- F4 (B): `80bbb14` adds an in-span error assistant with nonzero usage. The pi test now expects five calls, context `(12400 + 610) / 5 = 2602`, input 1050, cache read 10500, cache creation 1460, output 290 and reasoning 10. The zero-usage error remains in the fixture and excluded. The deliberate-break log shows skipping every error response makes this case fail at calls 5 versus 4.

### Evidence

Read the current brief, design, plan, report, skill and ponytail reference. Reopened the chart guide describing the changed behavior. No documented behavior changed beyond restoring the specified legacy boundary, no AREA.md or lessons changed, no runner configuration changed, and no planned test was skipped or disabled.

Read back all following saved logs with `akrogon log`:

- `check f4-nonzero-error-red: 1 implementation/check-f4-nonzero-error-red-1792236344719-3607859.log` — deliberate break rejects dropping the nonzero error call.
- `check f3-f4-green2: 0 implementation/check-f3-f4-green2-1792236393777-3611265.log` — all 21 usage tests pass after the final test/fixture/product edits, including every planned filtered case and both B reproductions.
- Current verification logs: `implementation/check-format-1792236538811-4034023.log` (format green), `implementation/check-test-1792236682653-4034023.log` (1029 pass, 0 fail), `implementation/check-typecheck-1792236684792-4034023.log` (typecheck green). These runs follow the final commits and there are no later edits, so another full run is unnecessary.
- `check savings-rerun: 0 implementation/check-savings-rerun-1792236402355-3612273.log` — all three live chart copies report outcome done and unchanged output summaries. Informative savings evidence remains in the implementation report.

Inspection commands were kept by `check recheck-b-diff: 0 implementation/check-recheck-b-diff-1792236708874-293899.log` and `check recheck-b-lineage: 0 implementation/check-recheck-b-lineage-1792236714688-294709.log`. The latter confirms ancestry and a clean diff check.

### Repair Test-Change trailers

The original trailer audit remains above. Additional trailers in the repair range, judged using `src/test-files.ts`:

1. `dd58a5f`, `tests/chart-usage.test.ts`: new F1 reproduction, citing brief C1's exclusion of gap increments. Accepted.
2. `419a997`, `tests/chart-usage.test.ts`: new F2 reproduction, citing brief C1's crossing operator interval. Accepted.
3. `80bbb14`, `tests/chart-usage.test.ts`: F3 legacy expectation corrections cite brief C1; F4 pi totals cite the new nonzero error required by brief C2. Fixture arithmetic independently checked above. Accepted.
4. `80bbb14`, `tests/fixtures/chart-usage/pi/pi-A.jsonl`: adds the nonzero error for brief C2 without removing existing records or assertions. Accepted.

No new blocking finding, Nit or operator action. B holds no reusable Nit requiring a lesson entry. All earlier Fixes are resolved. Request merge.

## merge — 2026-10-17

Attempt `b2d56a00-f704-4003-99ee-810c4e46762a`, memberless applied top `bed019d122f9e894fffa5ed97d5e95686dd41e8e`, built on `30030e644d0fb87c0fda3e4d73f8b46bc9629608`. HEAD matches the recorded top and the worktree is clean. No fetch, rebase, repair or commit was needed.

`akrogon verify --attempt b2d56a00-f704-4003-99ee-810c4e46762a` exited 0 and reused receipt `8aa24fec-30e8-4869-a28a-4fed12467b43`, tree `9bbc0ecbfcae7804f7afdf7fbfa085bd4a34b5ee`. Its format, 1029-test and typecheck logs are recorded and read back in the re-check above. Config has no merge_checks or advisory commands. No changed code or integration requires another run.

`check merge-b-check: 0 implementation/check-merge-b-check-1792236764998-297752.log` records `akrogon phase usage-spans merged --slot B --check --attempt b2d56a00-f704-4003-99ee-810c4e46762a` returning `ok`; log read back. Completion owner is standalone issue `usage-windows`, whose ISSUE.md names only this leaf. Its brief has been gathered for the completion broadcast. No other members or completion owners are present.
