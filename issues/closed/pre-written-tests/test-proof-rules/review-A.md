# Review A: test-proof-rules

Base `354c80e14aca6483c430312c61ae5c1397bb548e`, reviewed head `667712df23607f4523b53698fae3ded94c2dc586`, 11 files, +34/-32, no test files touched, no `Test-Change` trailers owed or present. `debate: no`, so no positions/rebuttals — expected. Verdict: **nits**.

## Verification evidence

- C1/C2: `plan-issue` plan.synthesis has the red-first planner-test step after `plan.md`, runner-at-`AKROGON_BASE`/direct-invocation requirement, `failed` naming criterion and missing machinery. Read at head.
- C3/C4/C5: implement-issue :57, brief-template :13/:31/:45, worker-protocol :15/:25-27 all carry no-worker-tests, planned-tests-in-sub-brief, A-only correction, count rule; inline same rules, standalone/direct order-only. Read at head.
- C6: check-issue :55 gone; Nit-no-test-no-issue sentence present; planned-commands/no-skip check sits beside :53; :51/:53 intact including the deliberately kept "new test needs no cited source" (it judges diffs, doesn't authorize seats).
- C7: check-issue :79, implement-issue :76 and merge-issue :55 all state the red-first reproduction with source-citing `Test-Change` trailer; no "new test needs no cited source" remains at those lines (verified by grep).
- C8: standing-design machinery definition by function once at :10; shapes.md:286 refusal + `blocked-by` + propose-or-narrow; chart-issues :69 names machinery per live criterion and carries the proposal sentence.
- C9: implement-issue :36 unrunnable-proof = required `failed`, never machinery-writing; check-issue :75 missing-machinery finding is the stop cause; live-rerun product defect still Handed to A.
- C10: sweeps for `new test needs no cited source`, `write the smallest test set`, `tests derived before code`, `worker.*test.*writ` over `skills/ docs/ README.md` — only new-rule lines and kept :53 hit. Out-of-scope hits: `skills/watch-issues/scripts/fixtures/*.jsonl` (recorded session fixtures), `merge-issue:51` trailer mechanics (frozen-test-guard's line, kept).
- C11: fresh subagent classified all 7 cases correctly (report.md records the transcript path and verdicts); (g) routes via the base-run rule to `failed`, matching the brief.
- Report ran the commands `plan.md` names: format (drift reverted), typecheck clean, `bun test` 691/0, changed-tests no-op, sweep greps, classifier. No planned test was skipped, filtered or disabled — the leaf adds none.

## Nits

- N1: `docs/guide/idea.md` pass table now reads Implement = `code`; a reader could take implement A as skipping test execution entirely ("runs the planned tests"). Deferred: phases.md :92 states it correctly; promotion evidence would be an operator or agent misreading it.
- N2: deleting check-issue :55 also removed "Look-alike code alone is not a Fix" and "these triggers add no review rerun". :51's handcrafted-reproduction bar covers most of the substance; promotion evidence would be a review that Fix-flags look-alike code or adds a rerun and needs the old sentence.

## Fixes

None.
