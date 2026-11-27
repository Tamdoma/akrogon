# Leaf review, slot D: test-temp-leftovers

## Part 1, final shape

none

## Part 2, leaf drafts

D1. `brief.md`, opening words "1. A nested `akrogon run-check` run inside", and `design.md`, opening words "The default-root path is computed": criterion 1 says the nested call "receives the caller's values of both names", but the specified proof proves only `AKROGON_LEAF_TEMP_ROOT`. A nested run-check creates its run dir through `ensureLeafTemp` in `src/run-check.ts` `checkedRun` and never reads `AKROGON_RETIRED_TEMP_ROOT`, so the default-root absence assertion says nothing about the retired root reaching it. The allowlist update does not close this either: the test "run-check builds an allowlisted env..." in `tests/run-check.test.ts` only asserts every printed name is in the allowed set, never that a given name is present. Consequence: an implementation that adds only `AKROGON_LEAF_TEMP_ROOT` to `copied` passes both the new test and the updated allowlist test while criterion 1 is false. Fix: make the proof assert receipt of both names, e.g. in that same allowlist test add `expect(names.has('AKROGON_LEAF_TEMP_ROOT')).toBe(true)` and `expect(names.has('AKROGON_RETIRED_TEMP_ROOT')).toBe(true)` (the `cli()` caller in `tests/helpers.ts` sets both), or have the boundary test's checked command record both values and compare them to the caller's; or drop "both names" from what criterion 1 claims the nested run receives.
