# Slot B review

Base `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444`. Reviewed head `daeec29a4816f7b2ffb6d6e57cbc608e5f590407`. Verdict `fix`.

## Findings

- **F1 · Fix · Criterion 2. Capacity waits are counted after dispatch.** With `max_active: 1`, run `akrogon next` for a new leaf while another holds the seat. Free capacity and dispatch the new leaf, then finish its planning visit and run `akrogon timing <slug>`. The dispatch prompt causes `recordWait` to treat the wait as closed and suppress the terminal `none` row (`src/timing.ts:116–122`). The report uses prompts as interval boundaries but `reasonAt` reads only wait rows (`src/timing-report.ts:84–105`). It continues charging the capacity wait through the work that followed and drops that span from prompted time. The CLI reproduction used a real throwaway hc core, actual `next` dispatches and a real `phase` move. Its wait began at `21:01:24.698Z`, the first prompt was delivered at `21:01:27.141Z`, and the closed visit reported `wait capacity 6s` for a 2.443-second wait. `check review-capacity-end: 1`, read back with `akrogon log`, in `implementation/check-review-capacity-end-1795294890839-3988136.log`. Make the reader and writer agree on when the wait ends and cover the sequence of capacity refusal, delivered prompt and closed visit in the report proof. The committed dispatch test checks only the list of wait rows after admission. The report fixture places its capacity event after its only planning prompt.
- **F2 · Fix · Criterion 1 proof.** The refused-session boundary test at `tests/next.test.ts:4692–4716` checks admission with a merge waiter and refusal with a `check.repair` waiter. The `implement` refusal runs only against a reachable hc session at `tests/next.test.ts:4660–4690`. The brief requires refusal with an `implement` waiter when its repo session is refused too. A phase-specific regression in the refused-session arm could pass both tests. Add the missing case to the existing two-repo fixture and run the planned `cap-count` command. The shared predicate counts `implement` today.

## Verification

- The configured `akrogon verify` receipt for the reviewed head, run `63aa60eb-a2e5-4d54-9de5-8e71a7092a42`, is green for format, tests and typecheck. The kept suite log `implementation/check-test-1795294754341-3167052.log` shows 1,267 passes across 85 files, including all four new cases and the existing unreadable and unknown capacity cases.
- The three recorded planned proof commands ran after the last changes to their tests and inputs. Read back `check cap-count: 0` (2 cases, `implementation/check-cap-count-1795294480190-3147386.log`), `check cap-wait: 0` (1 case, `implementation/check-cap-wait-1795294479438-3147390.log`) and `check cap-report: 0` (1 case, `implementation/check-cap-report-1795294477553-3147392.log`). No runner or filter changes. The planning logs show red before merge exclusion and wait recording, red for duplicate waits, and red when the report order or old `parked` decoding is broken. F1 and F2 explain the green proofs' limits.
- The three cap docs and the `seatCommand` error describe the merge exemption. `docs/reference/files.md` names `capacity`. The guide and index links resolve, and `skills/init-akrogon/` has no corresponding cap text. No `AREA.md` in the diff. The allocation exemption for existing live seats and the broadcast path retain their previous behavior. No grants or covered launches. The check log and timing entry for the isolated reproduction agree on its exit.

## Test-Change trailers

- `d49b7bb8` · `tests/next.test.ts` adds two criterion 1 CLI cases. The diff appends tests and preserves the pre-existing assertions.
- `d49b7bb8` · `tests/timing.test.ts` adds the criterion 2 refusal and dedup case. The diff appends a test and preserves the pre-existing assertions.
- `d49b7bb8` · `tests/timing-report.test.ts` adds the criterion 2 named-kind and old-row parsing case. The diff appends a test and preserves the pre-existing assertions.
- `ad2cb3fd` · `tests/next.test.ts` corrects the tab expectation in the newly planned test. The cited live contract is `mergedWorktree` in `src/reconcile.ts:768–787`, where the next reconcile closes a tab that still belongs to an unbatched merged leaf. The current `cap-count` run confirms the corrected expectation. The cited `plan-break-exclude2` log stops at the earlier worktree assertion and serves as negative evidence for the `check.repair` capacity case.

## check.repair · 2026-11-21

F1 is repaired on `3598b89a`. The report and recorder now use the same wait lookup. A prompt ends the prior recorded wait for its leaf, so the report starts counting prompted time at the delivered prompt. Both the per-visit and cohort reports use this lookup. The timing ledger schema and the rule that repo pause takes priority stay the same.

- `456bccbc` adds the CLI regression for the refusal, prompt and visit-close sequence captured in F1. `check cap-report: 1` on the reviewed product code with the new test reproduced `wait capacity 10m` where the actual wait was 3m. Log `implementation/check-cap-report-1795295024558-83603.log`.
- `3598b89a` fixes the reader and reuses the same lookup in the recorder. `check cap-report: 0` on that commit passed the regression (3m capacity, 7m prompted) and the original mixed-ledger case. Log `implementation/check-cap-report-1795295076015-192587.log`.
- The other planned proofs passed on `3598b89a`: `check cap-wait: 0` (one case, `implementation/check-cap-wait-1795295077855-192573.log`) and `check cap-count: 0` (two current cases, `implementation/check-cap-count-1795295078586-192600.log`). The full timing-report test file passed all 16 cases, including the existing non-capacity wait and cohort cases (`check repair-timing-report: 0`, `implementation/check-repair-timing-report-1795295077112-192593.log`). The configured full check set is pending after A's proof update.

## Handed to A

- F2 · Criterion 1 lacks only a proof case. In the existing two-repo hc fixture in `tests/next.test.ts`, assert that `next` refuses a new leaf when a leaf in `implement` fills `max_active` and its repo session is refused. Keep the `merge` admission and `check.repair` refusal cases and run the planned `cap-count` command on the updated test.

## check.review after check.fix · 2026-11-21

Base `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444`, prior reviewed head `daeec29a4816f7b2ffb6d6e57cbc608e5f590407`, reviewed head `ef2b5c6ede284d7f9e3517e10508f25e4478b3f4`. Range diff matched the four initial commits and showed the three repair commits. Verdict `ready`.

- F1 verified. The timing reader and recorder share the wait lookup added by `3598b89a`. The `456bccbc` trailer for `tests/timing-report.test.ts` cites the CLI-produced ledger sequence in F1. The targeted timing proofs on `3598b89a` still apply, and the original and new report tests passed in the full run on the reviewed head. The change makes accounting match the documented wait and prompted durations.
- F2 verified. `ef2b5c6e` extends the refused-session CLI fixture to test both `check.repair` and `implement` with separate dispatch targets. The `Test-Change:` trailer names `tests/next.test.ts` and cites brief criterion 1. The merge admission and repair refusal assertions still run. `check fix-impl-arm-red: 1` (`implementation/check-fix-impl-arm-red-1795295138343-378264.log`) shows the deliberate break allocated `queued-implement`. `check cap-count: 0` (`implementation/check-cap-count-1795295144360-381589.log`) ran the planned filter on the final commit and passed both capacity tests.
- Read back the configured verify receipt `2585b6cd-d3a4-4089-9fc0-09f7d67c56e7` and its logs. Format and typecheck passed, and `implementation/check-test-1795295368199-384438.log` shows 1,268 passing tests across 85 files on the reviewed head. The repair added no runner, filter or fixture helper changes. The checks are current. No grants or covered launches.
