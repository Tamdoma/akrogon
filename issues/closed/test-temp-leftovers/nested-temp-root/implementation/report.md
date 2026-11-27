# Report: nested-temp-root

Slot A implement pass, 2026-11-25. Serial-solo run (plan D5: one wave, one unit — A implemented directly, no workers).

Base: `646819159203d8ba256d0990f85fd17b44c1bd78` (origin/main; the Shared context refresh before the first unit and after the last commit were both no-ops — branch already on the tip, no commits moved).
Committed head: `011d4757` (`fix: run-check copies the leaf temp roots into checked commands`), on top of the plan-phase red-first test commit `40e4f50f`.

## Changed files and reasons

- `src/run-check.ts` — `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` added to `copied` beside `AKROGON_HOME`, with the reason comment (a nested akrogon call resolves the same leaf temp roots; without them it falls back to the default root and leaves its leaf dir there). This is the whole fix (plan D1): run-check was the one boundary that dropped the names; verify (`passForwarded`) and land (`launchLand`) already forward both. When the caller holds neither name the copy loop's existing `value !== undefined` skip keeps production env unchanged.
- `tests/run-check.test.ts` — the exact-allowlist expectation gains the two names (plan D4). Committed in the same commit with the `Test-Change:` trailer the locked-tests rule requires.
- No other file touched. `repoSchema`'s reserved `constructed` set unchanged (D2), `reconcile.ts` unchanged, the seven existing fixture crutches and all other design exclusions untouched (D8). No doc affected (D7).

## Commands run with results

Kept through `akrogon run-check` from the leaf worktree; cited lines are its stderr `check` lines.

Criterion 1 proof — `a nested run-check inherits the caller temp roots`:

- Red on base, plan phase (commit `40e4f50f` tree, no product code): `check nested-roots-base: 1` — `/home/ivan/Work/infra/akrogon/issues/open/test-temp-leftovers/nested-temp-root/implementation/check-nested-roots-base-1795612628251-2833360.log`; fails with `Received: "unset:unset"`, and the run created exactly `/var/tmp/akr-1000/7afc/77a63c18` (empty after its `run-*` removal, verified on the host) — the production bug reproduced.
- Green after the fix, commit `011d4757` uncommitted-then-committed tree, duration 0.2 s: `check nested-roots-green: 0` — `/home/ivan/Work/infra/akrogon/issues/open/test-temp-leftovers/nested-temp-root/implementation/check-nested-roots-green-1795612864705-2845104.log`; both the criterion test and the allowlist test pass, 29 expect() calls. The green covers the exit chain, exact caller-value equality of both names, and absence of the computed default-root leaf dir.
- Per-name teeth (plan phase, temporary edits discarded): `check nested-roots-leafonly: 1` (`<…>/leaf-temp:unset`) and `check nested-roots-retiredonly: 1` (`unset:<…>/retired-temp`) — each half of the value assertion discriminates independently; logs in the implementation folder.

Criterion 2 proof — configs already declaring the names keep parsing and forwarding:

- `akrogon verify` on committed head `011d4757`, receipt `b0a1e520` in `issues/verify-runs.jsonl`: `format` exit 0 (2.7 s), `typecheck` exit 0 (2.5 s), `test` exit 0 (99.3 s wall). The `test` leg runs the whole suite plus the changed-file `--rerun-each=5` leg, which includes `tests/run-check.test.ts`; the declaring fixtures (`tests/run-check.test.ts` nested tests and `.env` case, `tests/run-permit.test.ts`, `tests/run-units.test.ts` incl. the `pass_env` declaration, `tests/close-pack.test.ts`, `tests/timing.test.ts`, `tests/durable-capture.test.ts`, `tests/abandoned-capture.test.ts`) all pass — config parse and value forwarding intact.

## Verification

- `akrogon verify` (leaf scope) on `011d4757`: green, all three checks exit 0, receipt `b0a1e520`. No `merge_checks` run (land-run only). No red anywhere in the pass, so no retry or known-red judgment was needed.
- No slow, live or paid run: all proofs are free tests; no budget sizing applied. No grant used.
- No `Implementation notes` section needed in plan.md: no implementation-only constraint appeared and nothing reads as a model choice.

## Known limitations and unverified criteria

- None unverified. The open limitations recorded in `plan.md` stand unchanged: the default-root absence assertion is criterion-required insurance whose red cannot exist once values compare equal; pre-existing host leftovers under `/var/tmp/akr-<uid>` are out of scope (design exclusion, host sweep policy #151); the worktree-store clause is Off route in the chart.
