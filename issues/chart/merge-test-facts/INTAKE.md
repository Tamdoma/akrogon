# Intake: merge-test-facts

## Scope

After a leaf closes, its merge verify record still answers which failures were timeouts and how long tests ran, and a land attempt joins to its verify run. Destination repo: akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#154
- Operator: door session 2026-11-24 (handed list of five seeds)

## Source: Tamdoma/akrogon#154

# Framework merge verify logs are gone after leaf close (b9fe5027); no remaining record says which failures were timeouts or how long each test ran

Source: Tamdoma/akrogon#154
URL: https://github.com/Tamdoma/akrogon/issues/154

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

Since akrogon b9fe5027 (2026-11-23 03:38 +0100, "delete a completed owner's plain logs instead of packing them"), every framework merge verify log is deleted when its leaf closes, green and red. On 2026-11-23, 13 of 13 merge-scope `verify` command logs in `issues/verify-runs.jsonl` with `start` at or after 01:13Z no longer exist at their recorded `log` path.

What survives per red run is the row: `run`, `sha`, `tree`, `slow`, and per command `name`, `command`, `exit`, `log` (path only) and `failures` (test names). No surviving record holds:

- whether a failing test timed out (`this test timed out after 300000ms`) or failed an assertion;
- any per-test duration, green or red.

`issues/merge-attempts.jsonl` rows (`attempt`, `built_on`, `end`, `holder`, `outcome`, `pressure`, `repo`, `start`, `tested_top`) carry no verify `run` id. A consultant count on 2026-11-23 found 7 of 73 red attempts since 2026-11-21 that cannot be joined to their verify run.

Consequence seen: the framework chart merge-suite-truth (2026-11-23) removes two test-load sources from `hooks:selftest` and planned to read, over the following merges, which reds were timeouts and how long the replay-consumer tests run at merge. That reading has no data source now. Before b9fe5027 the same questions were answered from kept `check-verify-*.log` files: 900 parsed logs gave per-test medians (for example `capture-review.test.ts` 88-169 s daily median at merge against 3.3 s alone).

## Location

- akrogon owner completion (b9fe5027): plain-log deletion at completion.
- `issues/verify-runs.jsonl` row shape (verify pass, `checkedRun` captures `failures`).
- `issues/merge-attempts.jsonl` row shape (land attempt).
- Consumer: framework merge verify `bun run framework:verify`.

## Reproduction

After any framework leaf merges and closes, open the `log` path of its merge `verify` row in `issues/verify-runs.jsonl`: the file does not exist. Frequency: every closed leaf since b9fe5027.

## Expected behavior

Not provided. The reporter's need: after a leaf closes, the merge path still answers which failures were timeouts and how long tests ran, and an attempt can be joined to its verify run.

## Urgency

Load reds at merge cost a repair round each. The planned measure for whether removing test load ended them cannot be read. Workaround: the door copies each merge verify log before its leaf closes, by hand.

## Suspected cause

b9fe5027 judged that the archive "answered nothing the verify-runs rows, reports and reviews did not already answer", based on a check of 12 closed red leaves. Its commit moved failure names into the row, so names survive. Timeout status and per-test durations exist only in the log bytes and were not moved, so they leave with the log. The missing `run` id on attempt rows is separate and predates b9fe5027.
Whose view: agent.
Files read: akrogon commit message b9fe5027 (`git show --stat`), `src/admission.ts` (admission comment) in `/home/ivan/Work/infra/akrogon`; the last row of framework `issues/verify-runs.jsonl` and `issues/merge-attempts.jsonl`; a red merge row (2026-11-23T10:41Z, review-findings-by-cause). The 7-of-73 count and the 900-log parse are consultant counts recorded in `issues/chart/merge-suite-truth/slots/` of the framework repo, not re-run by the agent.
Not inspected: the completion code itself, `checkedRun`, and the attempt writer in `src/land.ts`.
Related reports: Tamdoma/akrogon#134 (closed; failure names lost with deleted evidence packs, fixed by names in the row, the same evidence class), Tamdoma/akrogon#147 (closed; framework land reds under load). Searched Tamdoma/akrogon, all states: own reports since 2026-11-21 (limit 30), "verify log deleted" (limit 6), "admission pressure" (limit 6).

## Source: operator door message 2026-11-24

5 issues pulled. We need to chart them out. Use the following consultants: slot b: pi swe-2-1-max, slot c: agy neon high, slot d: pi muse wonder full 1.0. Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance.

## Agent findings

Imported at door open 2026-11-24T22:57:50Z (pull time). No identity match in open/closed leaf sources or chart intakes. Territory map findings are added after the shared opening map (issues/chart/seat-turn-idle/slots/map-merged.md).
