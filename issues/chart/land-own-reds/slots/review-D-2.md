# Slot D review, round 2

Verdict `fix`

Base `9c6ae0db739efcde19edff0d1b173da0ab7b234d`  
Head `3e855a964c517929bf0ca9b5dabe4e3de679a4e1`

- **F1 · `src/verify.ts:259` at `301e7762`.** The writer fixes the linked-base gate, but rolling back to the schema release reopens it on receipts the writer has already saved. I generated a real linked pair through the updated CLI. The head receipt retained `alpha`, while the rerun log and base both named `beta`. The updated writer refused it. The rollback release accepted the same receipt through `requireGreenReceipt(..., 'merge')`. The rollback target can therefore clear a failure that was never covered by the base. `docs/reference/files.md:71` also still says the gate never reads stored names.
- **F8 · `src/flaky.ts:168`.** The F7 repair deduplicates the original case but skips all historical pairing for any green rerun row. In two real verifies of the same tree, the first finished red on `alpha` and `beta`. The second's original command failed only `alpha`, and its rerun passed. `akrogon flaky` reported `alpha` once and dropped `beta` entirely. Only the already-counted `alpha` recovery is a duplicate. `beta` passed in the second run and should still appear.

## Recheck

- **F4 fixed.** The schema release describes acceptance only. The writer release documents executable reruns.
- **F5 remains as an accepted limit in the chart design.** Two homes selected only through different `HOME` values still share a slice if they use the same repo key and leaf slug.
- **F6 fixed.** Both store-sweep cases pass, with the checks for removed entries in owned paths preserved. The source-area description now reflects the restricted host sweep.
- **F7's original duplicate fixed.** The new test covers the same-name recovery. F8 covers an earlier failure name absent from the rerun.

## Verification

`bun test --timeout=45000 --max-concurrency=4 tests/flaky.test.ts tests/receipt-gates.test.ts tests/store-sweep-safety.test.ts tests/verify.test.ts` passed all 101 tests. The new gate and deduplication assertions failed against round-one source. Both revised store assertions failed against pre-Q4 reconcile source. The `Test-Change` trailers match those changes and `git diff --check` passed.
