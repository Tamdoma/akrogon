# Review B: claude-seat-no-questions

Initial `check.review`, slot B, 2026-11-16. Reviewed independently without reading or contacting the peer review.

- Base: `f774816753aa5fbe3e379444604ed345fb826247`.
- Reviewed head: `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3`.
- Reviewed tree: `174ae3c92a8d58ab9084d62a492101462445acdd`.
- Verdict: **ready**. No Fixes, Nits or operator actions.

## Criteria and diff

E1. Criterion 1 holds at the shared `harnessArgv` boundary: only claude receives one added argv element, `--disallowedTools=AskUserQuestion`. Traced both consumers in `src/seat.ts`: `startSeat` and `startConsultant` append the task after `harness.argv`. The real-core launch test checks the recorded command and the stand-in's received task. Its assertions check literal CLI arguments and task delivery, not prose wording. The deliberate space-form break failed both the unit and launch tests as required by the brief.

E2. Criterion 2 holds: codex and agy retain the template argv, and pi retains its existing `--session-id <uuid>` append. The unit tests independently assert those results. The fixture changes reuse the existing real-core fixture and stand-in. All existing `setSeat` callers use fake or agy and retain the same template values. No existing assertion, fixture recording or runner configuration was removed or weakened.

E3. Read `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `docs/reference/config.md` and the seat command in `docs/reference/commands.md`. No documented behavior changed: the existing descriptions cover template selection and task launch without specifying the appended Claude flags. No AREA.md is changed in this diff. No lesson is removed. The design's operator-started-session and preconfigured-duplicate-flag limits remain explicit and unchanged.

## Verification evidence

E4. Read the kept logs with `akrogon log`. Current criterion runs:

- `check crit-proofs: 0 implementation/check-crit-proofs-1794844773793-755493.log` — `bun test tests/seat.test.ts`, 4 pass, 0 fail. This is the plan's full unit command and also runs the case selected by its narrower `-t disallowedTools` command.
- `check crit-proofs-launch: 0 implementation/check-crit-proofs-launch-1794844774087-755657.log` — `bun test tests/hc-start.test.ts -t AskUserQuestion`, 1 pass, 0 fail.

E5. Required deliberate break, read from the planning logs:

- `check plan-red-spaceform: 1 implementation/check-plan-red-spaceform-1794844615523-744116.log` — expected equals-form argument, received `--disallowedTools`.
- `check plan-red-spaceform-launch: 1 implementation/check-plan-red-spaceform-launch-1794844617754-744479.log` — the same literal argument mismatch at the recorded launch boundary.

E6. The completed `akrogon verify` receipt `f3bdf286-c428-4441-bbe4-8a4fa7bf515e` in the registered checkout's `issues/verify-runs.jsonl` records setup, format, typecheck and test all exit 0 on `3318a2293a64a9c8192ade2b96632abf4b46dacd`. That commit and the reviewed head have the identical tree recorded above. The later commit only adds a trailer. The full test log includes all five new criterion cases after the latest test/helper formatting changes: 1188 pass, 0 fail, 83 files. No planned case is skipped, filtered out of the full suite or disabled, and no proof-command correction needs an equivalence judgment.

- `check format: 0 implementation/check-format-1794844779769-756007.log`.
- `check typecheck: 0 implementation/check-typecheck-1794844782067-756007.log`.
- `check test: 0 implementation/check-test-1794844844978-756007.log`.

The earlier formatter failure was corrected before that green receipt. No check was rerun during this review because the reviewed tree already has complete current evidence.

## Test-Change trailers

Audited `f774816753aa5fbe3e379444604ed345fb826247..HEAD` against the path rule in `src/test-files.ts`:

T1. `00106a116d6f798b612eb8746fd570880e70585d`: `Test-Change: tests/hc-start.test.ts adds one launch-argv case for a claude-kind seat; no existing expectation changed`. Accepted against brief criterion 1 and plan D2. Existing assertions are unchanged.

T2. `00106a116d6f798b612eb8746fd570880e70585d`: `Test-Change: tests/hc-fixture.ts adds the claude stand-in name and lets setSeat point a slot at any harness; no existing expectation changed`. Accepted against plan D3 and criterion 1's launch proof. Existing fake/agy callers retain their command values.

T3. `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3`: `Test-Change: tests/seat.test.ts new criterion tests for the claude disallowedTools append; added at plan.synthesis, reformatted by prettier during implement`. Accepted against brief criteria 1 and 2. This is a new test file and its final contents are covered by the green full-suite receipt.

## Launch accounting

`readiness.yaml` has no grants. This review launches no paid or live operation. The earlier chart stub probe remains outside this leaf's proof launches, as the locked design requires. The leaf has 21 completed check logs matching 21 check_start and 21 check_end timing events, with no unsettled run or abandoned capture pair. These are local tests/setup, including the initial missing-dependency diagnostic and its later installed, passing checks. No unexplained paid activity or grant overrun is present.
