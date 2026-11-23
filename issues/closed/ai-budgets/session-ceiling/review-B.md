# Session ceiling review, slot B

Verdict: **fix**  
Phase: initial check.review, 2026-11-22  
Base: fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8  
Reviewed head: cd24a3e48192061722a937ffb3b2051bca7df3eb  
Reviewed tree: ad3d8a0b4dbf16d8fdc31a70a0c3e7dafed18aa6

## Fixes

- **F1. A queued reservation can exceed a ceiling the operator has already lowered.** In src/budget.ts:51–55, the command reads the machine config before waiting for the host lock. The CLI probe used real flock and waited until the two-session CLI had reached that lock under a cap of three. The operator then set the cap to one before releasing it. The waiting command exited 0, wrote a two-session row and started. A fresh invocation refused the same request. C2 and C5 require the reservation to check the ceiling while it owns the budget lock. The same snapshot supplies session_minutes. Evidence: implementation/check-budget-review-b-cap-1795354712345-2436625.log.
- **F2. The ledger reader and append disagree on row boundaries.** After an operator restores a complete final JSON record without its final LF, src/budget.ts:31–38 accepts it. The append at lines 73–76 joins two JSON objects, and the now-malformed ledger blocks every later reservation until repaired. I took the row produced by a real invocation, removed only its final LF and observed one launch and then a row-1 refusal. The same reader strips all trailing newlines, so an extra blank ledger row also admits and writes when C4 and D2 require a malformed row to refuse. Ensure an admitted append leaves valid separate records, and handle a blank row as malformed. Evidence: implementation/check-budget-review-b-1795354606479-2430303.log.
- **F3. The C6 owner-refusal test bypasses ownerRefusal.** tests/budget.test.ts:384–394 moves the owner to issues/closed/ and then passes its former open leaf path. src/run-check.ts:167–169 throws from readState before checkedRun or the reservation is reached. I observed ENOENT at the former path and an owner-closed refusal with no ledger row when the same CLI targeted the actual closed leaf path. Use a real closed or closing target and prove that moving the reserve ahead of ownerRefusal makes the test fail. Evidence: implementation/check-budget-review-b-1795354606479-2430303.log.
- **F4. C4 has no automated case for an unreadable ledger.** The cases at tests/budget.test.ts:281–315 cover bad JSON and an append refusal on a readable mode-0444 file. A caller with mode-000 budget.jsonl reaches the read-error branch, where the CLI correctly reports the path and starts no command in the probe. The existing cases would miss a regression that swallows this read error. Add the missing CLI case to the existing runner and check the ledger bytes after restoring read permission. Evidence: implementation/check-budget-review-b-1795354606479-2430303.log.
- **F5. The config printer changes the operator's verbatim approval string.** The locked budget-shape decision 1 requires the approval answer to be preserved and shown by akrogon config. src/config.ts:35 trims the value as part of validating it, then the effective config prints the transformed string. A quoted machine-config answer containing leading indentation and a trailing newline round-tripped without either. The C8 case uses an answer with no significant whitespace and misses this. Validate nonblank without changing the stored approval text. Evidence: implementation/check-budget-review-b-1795354606479-2430303.log.
- **F6. A fractional count can pass C3 when Number rounds it to an integer.** The CLI accepts the operator's literal --sessions 0.99999999999999999, starts the command and records one session under a cap of one. src/budget.ts:49–50 validates the rounded Number, and the current C3 test covers only fractions that remain fractional after conversion. Refuse fractional input before any rounding and show the refusal at the CLI boundary. Evidence: implementation/check-budget-review-b-cap-1795354712345-2436625.log.
- **F7. The required deliberate-break evidence is missing.** The design says each criterion shows a deliberate break turning its test red. The plan's condition trace and red logs only show the missing feature, mostly an unknown flag or schema key. The report records no deliberate breaks on implemented behavior. F3 demonstrates why a red on an absent flag does not establish that a case exercises the refusal named by its criterion. Record the deliberate violations and red outputs against the implemented behavior using the existing CLI tests, then discard the temporary changes.

## Verification

- Full configured leaf receipt 1eee7386-013c-4e4e-9d53-1737a445e662 is green for 074e2e0b5ea35dc91f027de7a403da3ceb2ccf87. The later trailer-only cd24a3e4 has the identical tree. The receipt matches setup, format, typecheck and test, and the kept implementation/check-test-1795354430969-2121749.log shows 1,331 pass and zero fail. No runner, fixture or file changed after the receipt.
- Read back the report's current budget-c1, budget-c7, budget-c8, budget-contract and budget-help logs. The combined budget-c7 selector runs both planned config cases. B also ran the exact planned separate selectors on the reviewed tree, each with one pass. Logs: implementation/check-budget-c7-1795354641563-2433283.log and implementation/check-budget-c7-1795354641478-2433284.log. No planned case was filtered out of the combined result and no runner config changed. F7 covers the missing deliberate-break verification.
- Two completed CLI probes used a temporary machine home, a temporary registered repo and stub commands. Both were read back with akrogon log. The first lock-order probe ended with a harness observation error. Its retry used a fixture hook at the real flock entry and reproduced F1. The checks completed and no abandoned captures remained. The grant list is empty and planned and review proofs use no paid calls or live fixture writes.
- Followed docs/reference-index.md into src/AREA.md and tests/AREA.md. A path listing confirmed the source, test and docs paths from the repository root, and the documented issues/ records from the registered checkout. Reviewed the changed docs/reference/commands.md and docs/reference/config.md against the CLI and schema. The reference contract test passed. There are no lesson changes in the reviewed diff.
- C1 startup ordering, failed-command persistence, holder slug and run-ID linkage are exercised by tests/budget.test.ts. The C2 stale/foreign row, fits-at and inclusive ceiling cases pass under a stable cap. C5 lock wait, the C6 late failed refusal, C7 env isolation and C8 state-home copy also have current green boundary tests.

## Test-Change trailers

- 7517bdf0 — tests/command-reference.test.ts adds the flag to the literal command contract (brief C1–C6). tests/config.test.ts adds the printed config and reserved-name cases (C7 and C8). tests/state-home.test.ts adds the ledger copy case (C8). The cited criteria match the actual changes.
- 5876acf8 — tests/budget.test.ts changes the fits-at regex. The cited red log shows the prior assertion received NaN. The fresh CLI log implementation/check-budget-review-b-1795354606479-2430303.log confirms the old regex captured the echoed source frame and the new regex reaches the ISO timestamp in the actual refusal. The correction preserves the expected timestamp.
- 074e2e0b — tests/budget.test.ts was formatted only. The diff has no assertion or fixture changes.
- cd24a3e4 — tests/AREA.md matches src/test-files.ts by directory. The later trailer cites the 98c82d25 change adding the new test's documentation. Test behavior is unaffected.

## 2026-11-22 check.repair

Initial reviewed head `cd24a3e48192061722a937ffb3b2051bca7df3eb`. Repaired head `268948f71cde17a42e904b418446133530c2a184`.

| Finding | Reproduction commit | Fix commit | Change |
| --- | --- | --- | --- |
| F1 | `8ad8e087` | `d5bd8d00` | Read the current budget under the exclusive lock. A queued two-session command now refuses when the ceiling drops to one before acquisition. |
| F2 | `9f9871a8` | `e20f71b0` | Append a delimiter after a complete unterminated record. Strip only the file's final separator during parsing so a trailing blank row is refused. |
| F5 | `73e3ce9d` | `68f7b3b6` | Check that the approval answer is nonblank without changing the value printed by config. |
| F6 | `1f7b7ec8` | `268948f7` | Validate a positive decimal integer before conversion. A fractional input that formerly rounded to one now refuses without writing a row. |

Read the red and green results through `akrogon log`. Paths are relative to the leaf.

| Finding | Command | Red result | Green result |
| --- | --- | --- | --- |
| F1 | `akrogon run-check --name budget-f1 -- bun test tests/budget.test.ts -t 'uses the lowered ceiling'` | `check budget-f1: 1 implementation/check-budget-f1-1795354956513-2459583.log` | `check budget-f1: 0 implementation/check-budget-f1-1795354969374-2460298.log` |
| F2 | `akrogon run-check --name budget-f2 -- bun test tests/budget.test.ts -t 'ledger row boundaries'` | `check budget-f2: 1 implementation/check-budget-f2-1795354995298-2461456.log` | `check budget-f2: 0 implementation/check-budget-f2-1795355014188-2462975.log` |
| F5 | `akrogon run-check --name budget-f5 -- bun test tests/config.test.ts -t 'approval answer verbatim'` | `check budget-f5: 1 implementation/check-budget-f5-1795355046691-2464511.log` | `check budget-f5: 0 implementation/check-budget-f5-1795355050357-2464827.log` |
| F6 | `akrogon run-check --name budget-f6 -- bun test tests/budget.test.ts -t 'non-integer or non-positive'` | `check budget-f6: 1 implementation/check-budget-f6-1795355062818-2465379.log` | `check budget-f6: 0 implementation/check-budget-f6-1795355074296-2466057.log` |

The planned CLI proofs passed on the repaired head, including the cases written before repair. The full leaf verify receipt for this head remains pending slot A's proof work. All runs used local fixtures. No grant was used or paid session launched, and no capture was abandoned.

- C1–C6 and C7b, `bun test tests/budget.test.ts`, 15 pass. `check budget-c1: 0 implementation/check-budget-c1-1795355092704-2466845.log`.
- C7a, `bun test tests/config.test.ts -t 'AKROGON_SESSIONS'`, one pass. `check budget-c7: 0 implementation/check-budget-c7-1795355091254-2466847.log`.
- C8a, `bun test tests/config.test.ts -t 'paid_budget'`, two pass. `check budget-c7: 0 implementation/check-budget-c7-1795355091155-2466846.log`.
- C8b, `bun test tests/state-home.test.ts -t 'budget ledger'`, one pass. `check budget-c8: 0 implementation/check-budget-c8-1795355091254-2466848.log`.
- Command reference and help/run-check regressions, 44 pass. `check budget-contract: 0 implementation/check-budget-contract-1795355090967-2466850.log` and `check budget-help: 0 implementation/check-budget-help-1795355093305-2466849.log`.
- Prettier on the four touched files and TypeScript typecheck passed. `check budget-repair-static: 0 implementation/check-budget-repair-static-1795355094112-2466851.log`.

### Handed to A

- **F3** correct the existing C6 proof in `tests/budget.test.ts`. Use its CLI fixture with the actual closed or closing leaf target, so the test reaches `ownerRefusal` and detects a reservation introduced ahead of it.
- **F4** add the C4 unreadable-ledger case using the existing `tests/budget.test.ts` CLI fixture. Use an unreadable ledger with a valid row, assert a path-bearing read refusal and no spawn, then restore read permission and check the bytes are intact.
- **F7** capture the design-required deliberate-break evidence using the criterion tests and existing `akrogon run-check` commands. Record the failure under each criterion and remove the temporary mutations. The four red-to-green captures above already exercise the repaired defects.

## 2026-11-22 check.review after check.fix

Verdict **ready**. Base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`, initial reviewed head `cd24a3e48192061722a937ffb3b2051bca7df3eb`, B repair head `268948f71cde17a42e904b418446133530c2a184`, and current reviewed head `d8957dad4249f5bcd13645a94011636ff1f7448d`. There was no base refresh.

- **F3 closed.** The corrected C6 test invokes the relocated closed leaf, asserts the owner-closed refusal and checks that no command or ledger row was created. The C6 deliberate-break log shows a ledger row in the early-refusal case after reservation was placed ahead of the refusal. `check budget-db-c6: 1 implementation/check-budget-db-c6-1795355261952-2517101.log`.
- **F4 closed.** The C4 test reaches the unreadable-file path, asserts the path and read diagnostic, confirms no command started, and checks the restored ledger still has the reservation. Swallowing the read error made the new test fail on an append error. A separate B CLI probe compared the original and final bytes and confirmed they were identical. `check budget-f4: 1 implementation/check-budget-f4-1795355227330-2506270.log` and `check budget-recheck-bytes: 0 implementation/check-budget-recheck-bytes-1795365831045-2932180.log`.
- **F7 closed.** Read each kept deliberate-break log listed in plan.md. The intended test failed for C1 through C6 and both parts of C7 and C8. No mutation remains in the reviewed tree. The prior F1, F2, F5 and F6 regression cases also passed in the current full suite.

B ran the exact budget and config proof selections on the reviewed head. `check budget-c1: 0 implementation/check-budget-c1-1795365832573-2932159.log` had 16 pass. The reserved-name and paid-budget selectors had one and two pass respectively, in `check budget-c7: 0 implementation/check-budget-c7-1795365831152-2932158.log` and `check budget-c7: 0 implementation/check-budget-c7-1795365831082-2932162.log`. The state-home and command reference cases also ran in the full configured suite. All proofs used temporary local fixtures and no paid sessions.

Configured receipt `b9fedba2-1e2c-420a-b0fa-9c794d83b883` matches the reviewed head and tree `557011357262d1d3413df355e640042154caea85`. Setup, format, typecheck and test all exited 0. The test log `implementation/check-test-1795365750589-2225645.log` shows 1,335 pass and zero fail. Earlier timeouts are recorded in the report. Acceptance uses the completed whole-green receipt.

The `e7fb4b09` Test-Change trailer cites F3 and brief C4 for the actual test changes. The `d8957dad` trailer covers the formatting-only diff in `0b593c47` and has the same tree as that commit. No new blocking finding or nit.
