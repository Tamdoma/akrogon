# Slot B review

Date 2026-11-21. Verdict `fix`.

Base `1502fbdf362e2b6dc3c721722532d6fce8a9b622`. Reviewed head `5a91890aae943ed254b352dfc412ff09ddce86ea`.

## Fixes

- **F1. The machine config example makes Akrogon reject the config.** An operator following `docs/reference/config.md:34` gets `slots.consultant.harness: agy` at line 40 with only `claude` and `codex` declared in `harnesses`. Running the documented `slots` and `harnesses` through the same `globalSchema` that `readGlobal()` uses exits 1 with `slots.consultant` and `Missing harness template: agy`. This prevents the example from loading or printing the recipe under criterion 1 and D7. Include a matching harness entry or use an existing one. Evidence is `check-review-b-config-example-1795285801278-1274966.log` in `implementation/`.
- **F2. The launch tests leave criterion 3's recipe arguments and start result unproved.** The real caller starts its configured recipe with `--task` and consumes the address plus the shared start result. In `tests/watch-consult.test.ts:67` and `:104`, the checks accept exit 0 and stdout containing the address, which also accepts the unconfirmed response from `src/seat.ts:212`. The fake stand-in can log the argv task in idle mode without starting a turn, and the stand-in discards effort. Neither case checks the recipe's model and effort on the recorded launch argv. The suite would also pass if the watch command dropped the failed-result exit mapping at `src/akrogon.ts:160`. Use the existing hc shim and stand-in modes to prove the configured argv and distinguish the shared confirmed and failed or unconfirmed results at the watch CLI boundary. Record the deliberate break evidence for the named behavior. The current product shares `firstTask` and `announce`, as D5 requires.
- **F3. The refusal tests leave criterion 4's conflict reason and task-less missing-recipe call unproved.** The four flag cases at `tests/watch-consult.test.ts:146` pass when the parser rejects an unknown watch flag because the usage line contains every supported flag alongside `--watch-consultant`. The planning log `check-plan-criteria-hc-1795285326391-213664.log` shows all four passing with this behavior. That log cannot prove D6's named conflict for the real combined invocations, and there is no deliberate-break run showing those checks catch a wrong reason. The missing-recipe case always supplies `--task`, leaving the bare command named by criterion 4 untested. Exercise that invocation and make the combined-flag cases distinguish a conflict refusal from a generic parser refusal without pinning the message wording.

## Verification

- The leaf receipt `652911cc-e764-41da-9bf3-1e5715acb2f7` in `issues/verify-runs.jsonl` records exit 0 for format, typecheck and the configured test command on the reviewed head. Read back `check-format-1795285496949-414758.log`, `check-typecheck-1795285502245-414758.log` and `check-test-1795285664406-414758.log` in `implementation/`. The full suite ran 1,261 tests across 85 files.
- Replayed the planned `bun test --timeout=30000` scopes for criteria 1–4 through `akrogon run-check` on the reviewed head. `check review-b-criteria: 0` in `check-review-b-criteria-1795285806381-1274954.log` ran exactly `tests/config.test.ts`, 36 passing. `check review-b-criteria-hc: 0` in `check-review-b-criteria-hc-1795285803771-1274943.log` ran exactly `tests/watch-consult.test.ts`, nine passing. The cited implementation config log ran 45 tests across both files. The report lists 36 config tests for that run. The two exact review runs supply current-head evidence. No runner or skip configuration changed.
- Criterion 5's implementation logs `check-impl-regress-a-1795285488370-358820.log` and `check-impl-regress-b-1795285491001-412118.log` show the planned scopes after the reviewed commit. Door exchange and hc start passed 13 tests. CLI help, command reference and seat passed 30 tests. The door exchange suite invokes the existing `--slot` form.
- Traced the strict repo and index schemas, the `seats()` reader's explicit `a` and `b` lookups, the watch CLI option into the shared launch and proof, and the watch labels through leaf selection. Read the commands and settings references from the docs index and checked the unchanged door and watch entry points against the exclusions. No AREA file changed.
- The leaf grants are empty. Timing rows and kept output show Bun, git and isolated stand-in harness checks. Zero covered launches and no abandoned capture files.

## Test-Change trailers

| Commit | Trailer path and cited source | Slot B judgment |
| --- | --- | --- |
| `8fa6fb9d` | `tests/watch-consult.test.ts`, brief criteria 3–4 and `check-plan-criteria-hc-1795285326391` | Criteria authorize the new cases. F2–F3 describe the proof gaps in the cited run and cases. |
| `8fa6fb9d` | `tests/config.test.ts`, brief criteria 1–2 and the planning red and break logs | The additions implement these criteria. The cited logs show machine config load and harness rejection, plus repo and index refusal sensitivity. |
| `8fa6fb9d` | `tests/command-reference.test.ts`, design item 7 | The new literal CLI form changes the contract as cited. |
| `8fa6fb9d` | `docs/reference/commands.md`, design item 7 | The cited verb authorizes the docs change. The path falls outside `src/test-files.ts` and is covered by the frozen-path rule. |
| `8fa6fb9d` | `docs/reference/config.md`, design item 6 | The cited config change authorizes the docs edit. The path falls outside `src/test-files.ts` and is covered by the frozen-path rule. F1 covers the invalid example. |
| `5a91890a` | `tests/config.test.ts`, `bun run typecheck` and unknown spread | The diff narrows the parsed slots object and preserves the config inputs and expectations. The current typecheck passed. |
| `5a91890a` | `tests/watch-consult.test.ts`, Prettier | Formatting only. The current format check and watch cases passed. |

## 2026-11-21 check.repair

Reviewed head `5a91890a`. Repair head `27f26ea96503638efd7f8a01324e7ba8e91304f4`.

- **F1 repaired in `27f26ea9`.** The machine example now lists `agy: agy --model {model} --effort {effort} --mode auto` under `harnesses`, matching the existing launch template exercised by `tests/seat.test.ts`. The same schema probe on the example's `slots` and `harnesses` exited 1 with `Missing harness template: agy` before the edit (`check-review-b-config-example-1795285801278-1274966.log)) and exited 0 after it (`check-repair-b-config-example-1795285972548-1638247.log`). The planned config proof ran on the repair commit and passed all 36 tests (`check-plan-criteria-1795285979731-1653299.log`). Logs are in `implementation/`.
- The repair changes only the config reference example. The prior criterion 5 proofs still apply. The criterion 3 and 4 proof gaps below remain open. Zero covered launches.

### Handed to A

- **F2, criterion 3, missing acceptance cases.** Use the existing `hcCore` shim argv log and stand-in modes in `tests/watch-consult.test.ts` to prove the configured model and effort and the CLI's start outcome, including the exit status and address of a failed start or the unconfirmed result. Record a deliberate break that the new proof catches.
- **F3, criterion 4, test expectation correction and missing acceptance case.** Use the existing `cli` and `hcCore` cases to distinguish each named flag conflict from a generic parser refusal and prove that the bare command with a missing recipe names the key and starts nothing. Show the corrected conflict proof fail under a deliberate break.

## 2026-11-21 check.review after repair

Base `1502fbdf362e2b6dc3c721722532d6fce8a9b622`. Prior reviewed head `5a91890aae943ed254b352dfc412ff09ddce86ea`. Reviewed repair head `0357e7875610640a70fb59ef35c0b3c094091e18`. Verdict `fix`.

- **F1 closed.** `27f26ea9` adds the missing harness template to the config example. The successful schema probe on that edit remains applicable.
- **F2 still open on criterion 3.** `0357e787` checks the recipe model and effort on the launch argv and checks the exit status and address for an exiting harness. The normal and agy launch cases at `tests/watch-consult.test.ts:83` and `:148` still accept any stdout containing the child address with exit 0. For a configured watch consultant that takes its task and starts, a regression that reports its confirmed start as unconfirmed would pass both assertions and give the caller the wrong start result. The unconfirmed form in `src/seat.ts:210` meets those assertions, and the watch CLI reports that outcome with exit 0. Prove the confirmed result at the watch CLI with the returned address as the success output. The only recorded deliberate break leaves both launch cases and the new failed-start case green, so add red evidence for the corrected criterion 3 proof, including the new failure case.
- **F3 closed.** The corrected flag cases reject the generic parser response that passed in the planning log. The missing-recipe case runs both command forms, checks the config key and file, and sees zero labelled launches. Removing the conflict guard made all four flag cases fail on exit status in `check-fix-break-hc-1795286046676-1690465.log`. The broken combined calls exited 0 through the watch branch.

The scoped implementation log completed before `0357e787` was committed. The leaf receipt `9fcb1094-cb3e-4ea1-8f22-c1bd768927a0` ties green format, typecheck and 1,262 tests to that commit and includes the new failed-start case. The exact planned watch test scope independently passed all 10 cases on the committed head in `check-plan-criteria-hc-1795286288357-2282920.log`. No runner or skip configuration changed. No grants were used, and every capture has a completed check.

The repair trailers cite `review-B.md` F1 for `docs/reference/config.md` in `27f26ea9` and F2/F3 for `tests/watch-consult.test.ts` in `0357e787`. The cited findings authorize both edits. The latter trailer's deliberate-break log supports the flag refusals only.

## 2026-11-21 check.repair after re-check

Reviewed head `0357e7875610640a70fb59ef35c0b3c094091e18`. F2 is the sole open finding. The first repair covered the recipe argv and the failed-start path and left the success assertions unchanged. Searching the watch launch tests found two address-substring assertions that can accept an unconfirmed result, in the fake and agy success cases at `tests/watch-consult.test.ts:83` and `:148`. The failed-start case at line 111 already checks nonzero exit and the launched address. The recorded conflict-guard break leaves all three start cases green. The planned watch scope passed all 10 cases on this head in `check-plan-criteria-hc-1795286288357-2282920.log`. F2 needs an acceptance assertion correction and its evidence, so it stays with A under the test exception. No commits in this pass.

### Handed to A

- **F2, criterion 3, test expectation correction and missing break evidence.** In the existing `bun test --timeout=30000 tests/watch-consult.test.ts` scope with `hcCore`, make both successful forms require stdout containing only the real launched address after trimming. Record a deliberate break that reports confirmed starts as unconfirmed and makes the corrected cases fail. Also record a break of the watch verb's failed-start exit mapping that makes the existing exiting-harness case fail. Restore the product and run the planned scope on the committed repair head.

## 2026-11-21 check.review after round 2

Base `1502fbdf362e2b6dc3c721722532d6fce8a9b622`. Prior reviewed head `0357e7875610640a70fb59ef35c0b3c094091e18`. Reviewed head `eb4d64e9b3fd27307cce1f9ac794a5211b72433b`. Verdict `ready`.

- **F2 closed.** Both fake and agy success cases check that the trimmed CLI output equals the actual launch address. The helper trims the trailing newline, and the address is the confirmed-start output contract. Reporting a confirmed start as unconfirmed made both cases fail on the address check in `check-fix-break2-hc-1795286388803-2432396.log`. Dropping the failed-start exit mapping made the exiting-harness case fail on exit 0 in `check-fix-break3-hc-1795286395056-2454252.log`. The recipe argv assertions and failed-start address check are still present. The `Test-Change` trailer in `eb4d64e9` cites F2 and both break logs, which support tightening the two assertions.
- **F1 and F3 remain closed.** The repair diff is limited to the two success assertions and their explanatory comment. The previous config example and refusal evidence still applies, and the current watch run passed the refusal cases.

The scoped implementation run completed before the repair commit. Slot B reran the planned command, `bun test --timeout=30000 tests/watch-consult.test.ts`, on the committed head through `akrogon run-check`. All 10 passed in `check-plan-criteria-hc-1795286673194-3065990.log`. Leaf receipt `a0751610-a61b-498e-8ed1-0d229596812f` ties green format, typecheck, and all 1,262 tests to the same commit. The runner settings and proof scope match the plan. No grants were used and there are no abandoned captures.
