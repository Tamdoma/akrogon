# Implementation report 1

Changed files and reasons:
- src/shell.ts: added herdrError, retryable calls it, agent_session requires kind id|path.
- src/state.ts: added deliveryErrorSchema strict shape and delivery_error default {}.
- src/phase.ts: commitMove writes delivery_error {}.
- tests/shell.test.ts: herdrError structured/unstructured/truncate, retryable non-JSON false, kind required.
- tests/state.test.ts: default {}, strict shape plus offset checks, legacy file parses; added delivery_error {} to supported fixture to keep full equality strict.
- tests/phase.test.ts: phase move clears delivery_error via saveState then cli phase then readState.

Tests run:
- bun test tests/shell.test.ts tests/state.test.ts tests/phase.test.ts -> 77 pass, 0 fail.
- export AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090; bun test --changed="$AKROGON_BASE" -> 180 pass, 68 fail across 11 files. All 68 fails are in tests/next.test.ts. Touched files shell/state/phase have 0 fails in that run. Next failures are expected: kind is now required and fake-herdr update is brief 2.
- Phase test uses fixture temp repo, real state.yaml and cli run, no real panes or herdr.

Known limitations:
- Full --changed stays red until brief 2 updates fake-herdr and next.test.ts kind literals.

Unverified criteria:
- none. Criteria 1-4 pass via new tests. Criterion 5 passes for touched test files.
