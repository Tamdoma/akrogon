# Final-shape check: kept-run-root (slot B)

Read: slots/kept-run-root-final-shape.md, `tests/run-check.test.ts` `scratchRuns` and its two uses. Code held from earlier rounds: `src/run-check.ts` `checkedRun`, `src/reconcile.ts` `reconcile` run-root loop, `ownerKeeps`, `dropChecked`.

Defects: none.

Checked per [changed] item:

- Item 1 (`.owner` stays): no consumer reads a marked root's `.owner` once item 2 lands. An older `reconcile` drops the root as a dead-owner root and never pins it.
- Item 2 (marker before `.owner`): consistent with item 1. A late publish refusal on a red run can leave both `refusal.json` and `.akrogon-kept`; the loop checks `refusal.json` first, so the visible refusal keep is unchanged.
- Item 6 (AREA run-check line): wording matches items 3 and 4.
- Item 7 (lessons stay): no conflict with any code item.
- Item 8: `scratchRuns` asserts no run roots in two tests. One is the listed flip. The other is the forbidden-env refusal, which starts no run, so it stays green.

Not checked: `tests/verify.test.ts` body of the listed flip, whether `self-update` calls `checkedRun` (item 4 names it; harmless if it does not).
