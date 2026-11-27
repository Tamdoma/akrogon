# Slot B review for nested-temp-root

- Phase `check.review`, 2026-11-25
- Base `646819159203d8ba256d0990f85fd17b44c1bd78`
- Reviewed head `011d47575accb875bdf898f5b52f67d016a1120f`
- Verdict `ready`

The diff adds the two names to `copied` beside `AKROGON_HOME`. The existing copy loop skips names absent from the caller. A nested check reads the forwarded leaf root through `ensureLeafTemp` before creating its run directory. The schema's reserved-name set and the host sweep are untouched. No documented behavior changed. The checks reference describes a general environment allowlist and a private scratch directory, and the area indexes still describe the changed files.

## Verification

- C1 forwarding and default-root absence. Read the base and per-name red logs through `akrogon log`. The unpatched CLI reports `unset:unset`, and each one-name edit is red for the omitted name. Those reds stop at the environment assertion. The planned single-case command ran on the committed head and passed all three assertions. The implementation report's initial green run included the allowlist case too.
  - `check nested-roots-base: 1 implementation/check-nested-roots-base-1795612628251-2833360.log`
  - `check nested-roots-leafonly: 1 implementation/check-nested-roots-leafonly-1795612694407-2837525.log`
  - `check nested-roots-retiredonly: 1 implementation/check-nested-roots-retiredonly-1795612702354-2838221.log`
  - `check nested-roots-green: 0 implementation/check-nested-roots-green-1795612864705-2845104.log`
  - `check nested-roots-c1: 0 implementation/check-nested-roots-c1-1795613085304-3490459.log`
- C1 run directory and C2 compatibility. The supplemental CLI probe checked the live `TMPDIR/.owner` in the inner command, the exact run directory parent, and both environment values. Separate runs declaring the leaf root in `env` and `pass_env` each parsed and returned the exact caller value. The first probe stopped before executing the CLI because it imported `command` from the wrong module. Correcting the probe import produced the completed result without a branch change.
  - `check nested-roots-review: 1 implementation/check-nested-roots-review-1795613128581-3513385.log`
  - `check nested-roots-review: 0 implementation/check-nested-roots-review-1795613148579-3519198.log`
- Required checks. Read receipt `b0a1e520-47c9-4bcf-be6f-5f8a6c926a70` and its kept logs on the exact reviewed commit and tree. Format, typecheck and test exited 0. The full suite passed 1,466 tests including the declared-root fixtures and the shared `TMPDIR` path check. The changed-file leg ran all 37 cases five times for 185 passes. No planned case or runner configuration was skipped or changed. No paid session or grant use.
  - `check format: 0 implementation/check-format-1795612882146-2846071.log`
  - `check typecheck: 0 implementation/check-typecheck-1795612884701-2846071.log`
  - `check test: 0 implementation/check-test-1795612983987-2846071.log`

## Test-Change trailers

`src/test-files.ts` classifies `tests/run-check.test.ts` as a test path and there are two trailers in `origin/main..HEAD`.

- `40e4f50f` — `Test-Change: tests/run-check.test.ts brief done-criterion 1: red-first reproduction of the nested run-check temp-root drop, planned at plan.synthesis`. The test commit adds the real nested CLI case required by criterion 1. The kept base log shows the expected regression.
- `011d4757` — `Test-Change: tests/run-check.test.ts expectation update: the exact allowlist gains the two copied names; no existing expectation changed`. The source is the brief's checked-command environment change and the design's explicit allowlist decision. The existing test keeps its assertions and allows the two newly copied names.
