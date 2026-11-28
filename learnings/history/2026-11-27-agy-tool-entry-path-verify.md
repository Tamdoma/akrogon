# agy tool-entry PATH leaks into verify and run-check

## Case

On 2026-11-27, during `implement-issue charting-guide slot=A phase=implement` on an `agy` seat (`t42h`, docs-only diff under `docs/guide/04`–`08` and `docs/README.md`), `akrogon verify` and the `akrogon run-check` retry of `checks.test` passed 1548/1549 tests and failed deterministically on `tests/tool-entry.test.ts:141` (`"the entry places a bash tool shell exactly once at the scope root and nowhere else"`). `akrogon verify --known-red` exited 1 (`verify known-red dcfd9332ed839ab41c4bdeeeb0a7791c5d97faeb: fail`) because the merge-base commit `562611bd309252ddcbe7a18a04a88629d0e82c0e` already held a whole-green merge-scope verify row (`ae3e87a6-4e75-4ab3-b166-28e222dc1711`), blocking `charting-guide` from moving to `check.review`.

## Evidence

- Seat `PATH`: `/home/ivan/.gemini/antigravity-cli/bin:/home/ivan/.akrogon/tool-entry:...` (prepended for `agy` seats by `src/seat.ts` `startSeat`).
- `src/verify.ts` (`launchPass`) and `src/run-check.ts` (`constructedEnv`) forward `PATH` verbatim; `tests/isolation.ts` does not filter `<home>/tool-entry` out of `PATH`.
- `tests/tool-entry.test.ts` sets `export AKROGON_SEAT_CGROUP="$root"` (line 42) and runs the unwired reference `OUT="$OUT" N=r bash "$OUT/cmd.sh"` (line 62) with `{ env: { ...process.env, ...env } }` (line 124). `bash` resolved to `/home/ivan/.akrogon/tool-entry/bash`, placing `r` into `$root/tools/t-296126-9174273` instead of leaving it at `$root` (line 141).
- Kept logs on `dcfd9332ed839ab41c4bdeeeb0a7791c5d97faeb` (base `562611bd309252ddcbe7a18a04a88629d0e82c0e`):
  - `verify test: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-guide/charting-guide/implementation/check-test-1795773659995-103283.log`
  - `check test: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-guide/charting-guide/implementation/check-test-1795773912547-469711.log`
- Filed GitHub intake: https://github.com/Tamdoma/akrogon/issues/164

## Abstract learning

Seat-injected `PATH` wrappers (such as `agy`'s `<home>/tool-entry` shim for `bash`) propagate into child check/verify environments unless filtered by the check runner or test harness isolation layer; any test asserting unwired shell behavior inside a scope with `AKROGON_SEAT_CGROUP` set becomes harness-dependent and fails exclusively on `agy` seats while remaining green on other harnesses and `akrogon land`.

Applied 2026-11-28 by tests/isolation.ts:85: the preload drops every tool-entry PATH entry by name and unsets BASH_ENV, so a direct run from a wired seat behaves like a clean shell, and src/tool-cgroup.ts:91 makes isToolEntryDir name-based with no home argument, so the leak's mechanism — the seat's wrapper surviving into test and check environments — is stopped on every reachable path.
