# Fork test-facts, final-shape check: slot D

One concrete defect. Preferences already recorded in my rebuttal are not repeated.

## D1. Item 2's timeout pattern as written matches no framework timeout line

Item 2 defines the timeout line as ``  ^ this test timed out after <n>ms. `` with no wrapper chain, while item 1 writes the chain form `[<chain> | ](pass|fail) ...` for timed lines. Every real framework timeout line I can find is chain-prefixed, so an implementer who builds item 2's pattern literally records no timeouts at all.

Evidence (T1, on-disk framework merge verify logs, read 2026-11-25):

- `check-verify-1795549654908-735600.log`: `framework:core-lane-a | test:cf-workers-deploy | (fail) capture rejects naming a registered service worker and settles every handler [300002.91ms]` followed by `framework:core-lane-a | test:cf-workers-deploy |   ^ this test timed out after 300000ms.`
- `check-verify-1795566622096-2368929.log`: `framework:verify:rest-c | test:cf-pages-deploy | (fail) first-publication holder cleanup ... [5009.97ms]` followed by `framework:verify:rest-c | test:cf-pages-deploy |   ^ this test timed out after 5000ms.`
- Both logs repeat the same `(fail)` plus timeout pair again in the end summary (`1 tests failed:`), with identical ms, so the unique-set rule in item 2 is needed and is enough.

Code fit (T2, `src/flaky.ts` `failureNames`, read 2026-11-25): the grammar item 6 pins already treats the chain before Bun's `|` as part of the line shape for `(fail)` lines. Item 2 needs the same written form, `[<chain> | ] ^ this test timed out after <n>ms.`, attached to the last `(fail)` in the same chain.

Consequence if built as written: Q2 ships with `timeouts` absent on every real framework merge row, which under item 2 also reads as "no timeout recorded". The main seed fact is silently missing until someone re-parses a surviving log by hand.
