# Review B: expiring-time-rule

Date: 2026-10-17
Base: `c55432b7c93b9e6269f4748d6b36b80af9248688`
Reviewed head: `483c693771e83aa46aa074c7576bc3e3b5beb1b3`
Verdict: **ready**

## Scope and findings

Reviewed the brief, design, plan, implementation report and complete base-to-head diff. No positions-B or rebuttal-B artifacts exist. The worktree is clean. No Fixes, Nits or operator actions.

The sole changed file is `skills/plan-issue/SKILL.md`. Its criterion-test paragraph adds the design's calendar-time expectation rule once, including the elapsed-time and deadline carve-out, and removes the false receipt-gate premise. All remaining paragraph text is unchanged. Both done-criteria and D1–D4 are satisfied. No source, tests, runner configuration, AREA.md or lessons changed.

Read the affected planning documentation in `docs/guide/phases.md`, following `docs/reference-index.md` and `skills/AREA.md`. The guide's synthesis description remains consistent. The three consumer skills reference test-proof-rules without copying the new rule. No other documented behavior changed.

## Evidence

- `check review-B-context: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/expiring-time-rule/implementation/check-review-B-context-1792228460519-1140449.log` — full diff, head, clean status, unique leaf location, commit history, documentation and test-file path rule inspected. Read back with `akrogon log`.
- `check review-B-proof: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/expiring-time-rule/implementation/check-review-B-proof-1792228467946-1141025.log` — replayed the plan's grep proofs. Rule count is `1`; the other-skills/docs sweep and receipt-gate search are empty (expected grep exit 1, explicitly checked). Read back with `akrogon log`.
- Existing committed-head verification retained: implementation report records `akrogon verify` green on the reviewed head. Read back `implementation/check-format-1792228285666-697459.log`, `implementation/check-test-1792228431662-697459.log` and `implementation/check-typecheck-1792228433734-697459.log`: formatting green, 994 tests passed with 0 failures, and `tsc --noEmit` succeeded. No code or test changed afterward, so no verification rerun is needed.

## Test-Change trailers

None in `c55432b7c93b9e6269f4748d6b36b80af9248688..483c693771e83aa46aa074c7576bc3e3b5beb1b3`. No changed path matches `src/test-files.ts`. No test was added, altered, deleted, filtered or disabled. Reading the prose and searching for duplicate/stale claims proves the criteria, as the locked design requires.

## Merge — 2026-10-17

Attempt: `33eb2008-73c5-4edc-94a7-5b14caa25688`; base `c55432b7c93b9e6269f4748d6b36b80af9248688`; tested top `483c693771e83aa46aa074c7576bc3e3b5beb1b3`; no members. Clean worktree, no rebase or repair needed.

`akrogon verify --attempt 33eb2008-73c5-4edc-94a7-5b14caa25688` succeeded by reusing receipt `2c7aea96-7d1d-40a8-9718-19f6e69feeef` for identical tree `54bf26146db9509f607b0085b41ab861d41983bc`. Format, test and typecheck logs were read during review above. No merge_checks or advisory configured. `akrogon phase expiring-time-rule merged --slot B --check --attempt 33eb2008-73c5-4edc-94a7-5b14caa25688` returned `ok`.

Context evidence, read back with `akrogon log`:
- `check merge-B-context: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/expiring-time-rule/implementation/check-merge-B-context-1792228495746-1143907.log` — head and clean status confirmed; attempted parent brief path does not exist (owner uses ISSUE.md).
- `check merge-B-owner: 1 /home/ivan/Work/infra/akrogon/issues/open/main-red/expiring-time-rule/implementation/check-merge-B-owner-1792228500840-1144444.log` — owner inventory and batch state confirmed; exit 1 is the final optional receipt-file search finding no match, not a configured check failure.

Completion context gathered from main-red/ISSUE.md and all three leaf briefs:
`check merge-B-completion-context: 0 /home/ivan/Work/infra/akrogon/issues/open/main-red/expiring-time-rule/implementation/check-merge-B-completion-context-1792228511508-1147913.log` (read back with `akrogon log`).

Final command: `akrogon phase expiring-time-rule merged --slot B --attempt 33eb2008-73c5-4edc-94a7-5b14caa25688` succeeded: `moved merged`; `deployed c55432b7c93b..483c693771e8; deployed 483c693771e8`. No issue/epic completion line was printed, so no completion broadcast was due.
