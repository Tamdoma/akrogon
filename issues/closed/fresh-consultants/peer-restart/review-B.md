# Review B: peer-restart

Date: 2026-10-17. Phase: check.review. Verdict: **fix**.

Base: `14ccc591373956ecb3915b8975af2e379173ef5a`.
Reviewed head: `4fa309ab47a06a23cff95aa107337c6cb130a552`.

Initial blind review of the whole diff. Debate is off, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. Worktree was clean, and no code was changed or committed.

## Fix

### F1: The guide omits required restart safety and failure behavior

Location: `docs/guide/chart.md:172`, with the related summary at `skills/chart-issues/assets/questions.md:46`.

The guide says supplied consultant panes may be recreated by “this one command” without naming the command or linking its rule. It does not explain that all prompted exchanges must first be collected, that idle alone is insufficient, or that a failed restart ends an attended turn and drops every non-restarted seat under autopilot. These are operating conditions explicitly required by brief done-criterion 4, not wording preferences. An operator reading this guide cannot identify the authorized command or determine whether a restart is safe and which consultants survive a partial failure. The question instructions link the Open rule, but their local failure paragraph still describes only prompt refusal, failure and blocked outcomes before saying a nonzero exit alone identifies no consultant to drop. Make the restart exception clear there as well.

Repair the summaries so these safety and failure outcomes are discoverable, identifying `peer-restart.ts` and the canonical Open rule rather than duplicating its implementation details. Also cover the remaining criterion-4 trigger qualifications and printed-pane/session rules through an explicit, accurate reference or concise prose. No prose-matching test is requested.

Evidence: `check B final contract audit: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-B%20final%20contract%20audit-1792233662687-1270193.log`, read back using `akrogon log`; the criterion-4 implementation sweep below shows the same omission. SKILL.md Open itself contains the required rule. D9's shorter summaries do not override the brief's done-criterion.

## Verification and scope

Inspected the CLI, fixture changes, all new tests, changed documentation, existing peer-ask/peer-wait contracts, reference index and relevant area pointers, plus the chart's recorded live proofs. No AREA.md changes or lesson removals are in this diff. No code correctness defect found for the planned seat/pane input contract. The implementation preserves array argv, completes refusal checks before closing, closes in reverse order, splits and starts in naming order, and stops on each herdr command failure while emitting seat states.

Read back the following saved evidence using `akrogon log`. The report records these green runs on the reviewed head after the final test formatting and fixture changes. No checks or runner configuration were skipped, filtered or disabled by this diff. Reused current evidence rather than rerunning unchanged checks.

- `check peer-restart tests: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-peer-restart%20tests-1792233440226-814580.log`: planned CLI proof, 8 pass, 0 fail, covering criteria 1–3.
- `check peer-restart tests red: 1 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-peer-restart%20tests%20red-1792233180173-357641.log`: planned red-first run, 0 pass, 8 fail before the command existed.
- `check criterion-4 doc sweep: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-criterion-4%20doc%20sweep-1792233596365-1264474.log`: grep succeeds, but its output does not establish all criterion-4 outcomes. F1 is the inspection result.
- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-format-1792233443569-815811.log`: formatting passes.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-test-1792233587417-815811.log`: verify's configured full test command, 1020 pass, 0 fail across 61 files.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-typecheck-1792233589542-815811.log`: typecheck passes.

No live mutations or credentials were needed. Existing chart proofs cover the external close/split/start operations as the locked design permits. No operator actions or additional Nits.

## Test-Change trailers

Listed from `14ccc591373956ecb3915b8975af2e379173ef5a..HEAD`, using `src/test-files.ts` for the path rule:

- `6aaf284`: `Test-Change: tests/fake-herdr.ts plan.synthesis D7: seeded foreground_processes, foreground_process_group_id, agent_name and closeScript; no existing expectation changed`. Accepted: additive fixture fields and the close-failure hook implement D7. Existing process-info defaults are retained.
- `4fa309a`: `Test-Change: tests/peer-restart.test.ts prettier formatting only, no expectation changed`. Accepted: inspected that commit's test diff, which only reformats expressions and changes no assertions or fixtures.

The new test file in `b7d551c` requires no old-test trailer. No existing assertion was deleted or weakened.

## check.repair: 2026-10-17

Read both initial reviews: A has no findings, B has F1. Repaired F1 in commit `30030e644d0fb87c0fda3e4d73f8b46bc9629608`, based on reviewed head `4fa309ab47a06a23cff95aa107337c6cb130a552`.

The guide identifies `peer-restart.ts`, links the canonical Open rule and covers the trigger qualifications, collection prerequisite, supplied-pane authorization, printed-pane usage, session recording and attended/autopilot failure outcomes. The questions summary links that rule for trigger/session details, explicitly requires collection before restart and distinguishes restart-state drops from other nonzero script exits. No product code, tests, locked decisions or live actions changed. No Handed to A items, operator actions or Nits remain.

Before: the guide's entire restart instruction referred only to “this one command” and had no collection prerequisite or failure outcome. Evidence: `check B repair before: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-B%20repair%20before-1792233712017-1272879.log`.

After: reran the plan's criterion-4 restart grep and supplied-pane prose sweep, inspected their output against the criterion and checked the diff. Both summaries now expose the required safety and failure behavior, with remaining detail linked to Open. Evidence: `check B repair criterion-4: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-B%20repair%20criterion-4-1792233724650-1273428.log`. Verified both new links resolve to the existing file and Open heading: `check B repair links: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-B%20repair%20links-1792233752856-1351078.log`. These logs were read back with `akrogon log`.

Criteria 1–3 retain the prior green CLI proof because their script, tests, fixtures and configuration are unchanged. No prose-matching test was added. The planned criterion-4 proof was inspection and greps, which predate this repair and were not authored by B.

`akrogon verify` on committed head `30030e644d0fb87c0fda3e4d73f8b46bc9629608` completed green. Evidence, read back with `akrogon log`:

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-format-1792233729776-1273804.log`.
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-test-1792233873383-1273804.log`: 1020 pass, 0 fail, 61 files, 143.51 seconds.
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/fresh-consultants/peer-restart/implementation/check-typecheck-1792233875422-1273804.log`.

F1 is resolved. Repair verdict: **ready**. Worktree is clean. No merge checks were run.

## merge: 2026-10-17

Applied memberless attempt `2ff9fade-b640-4629-bff7-d216c7a84e91`, top `30030e644d0fb87c0fda3e4d73f8b46bc9629608`. Worktree HEAD matches the supplied top and is clean. No fetch, rebase or additional commits were needed.

`akrogon verify --attempt 2ff9fade-b640-4629-bff7-d216c7a84e91` exited 0 and reused green receipt `7a26f727-7b98-4bd2-bf78-215461e81cc1` for tree `76140ec923a1e08a27a1c27855f5306a584d3e03`. This is the same tested head as the repair verification recorded above, whose format, test and typecheck logs were read back. No configured merge checks, merge covers or advisory checks exist. Completion owner is the standalone issue `fresh-consultants`, whose only leaf brief is peer-restart and has been gathered for the completion broadcast.
