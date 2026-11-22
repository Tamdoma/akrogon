# Slot B review

2026-11-20. Base `a52d3dad76ee78769b62a18c6798a84030a75a18`. Reviewed head `efb6ca4c7790707ef9d311676df73f38e74bc5c7`.

Verdict `fix`.

## Fixes

### F1. Recorded inner tool failures print `unknown`

The pi code-mode `DelegateToolExecutor.invoke` records thrown tool errors as `trace.status = "error"` and preserves their diagnostic in `trace.error`. The framework `design-close-evidence-u3` worker recording `2026-11-18T19-54-32-148Z_01a1f039-a554-765a-a7d2-21860b1c24dc.jsonl`, records 49–50, contains a real failed `edit` with this status. At `skills/watch-issues/scripts/log-tail.ts:340`, plan D2's mapping turns it into `unknown` and drops its diagnostic. The CLI prints `old#ee3b736a new#5842e868 -> unknown:`. The watch cannot recognize it as an error for its consecutive-error rule. This contradicts criterion 1's requirement to print the recorded inner outcome. Cover the recorded failed edit at the existing CLI boundary. D2 calls for the behavior that causes this gap, so the repair must account for that decision.

`check review-b-recorded-status: 0 implementation/check-review-b-recorded-status-1795201135507-2621888.log` (the CLI ran successfully and printed the wrong outcome).

### F2. A yielded bash command stays `running` after pi records its exit

In the framework `resolver-log-path-u4` worker recording `2026-11-12T23-00-45-260Z_01a1d1fd-fa4c-7494-a60c-f399eca2d400.jsonl`, records 364–367, `exec` yields with bash trace `51f8ec26-7093-45ce-9116-82f6efd104d7:175:tool-1`; `wait` records that same trace as `done` with `capture.termination.exitCode: 1`. Pi's `wait` tool returns these trace updates through `toCodeModeToolResult`. At `skills/watch-issues/scripts/log-tail.ts:640`, the join only uses traces from `exec` entries. The CLI prints the command as `#15457a9c -> running:` and prints `wait -> ok`. The watcher misses the recorded failure and sees a command that has ended as still active. This hits criterion 1's bash exit-code outcome and the Busy rule's meaning of `running`. The leaf's own watch-timer U1 recording shows the same join gap on records 78–81, with exit code 0. The plan covers the yielded record only. Cover the yielded and completed records together at the existing CLI boundary so the same inner call shows its final exit once.

`check review-b-recorded-exit: 0 implementation/check-review-b-recorded-exit-1795201200359-2687209.log`; `check review-b-recorded-status: 0 implementation/check-review-b-recorded-status-1795201135507-2621888.log`.

## Verification

- The configured verify receipt on the reviewed head is green. Read back format, typecheck and `implementation/check-test-1795200942409-2277566.log` (1,233 pass, 0 fail, including the watch-issues script test and typecheck wrapper).
- The implementation report lists the planned c1/c2/c3 commands, but its kept targeted runs preceded the final test edit. Reran the exact planned commands on the reviewed head. `check c1: 0 implementation/check-c1-1795201041108-2556521.log`; `check c2: 0 implementation/check-c2-1795201041113-2556524.log`; `check c3: 0 implementation/check-c3-1795201041129-2556522.log` (19 pass, including Codex). The red c1 and c3 logs in the plan show the baseline failing at the CLI for trace expansion and running-call scanning. The red c2 filename in the plan exercised the running tests, while the planned c2 filter and current green proof exercise traced path and edit identities.
- Verified all 15 fixture lines byte for byte against the named U1 recording. The tests cover ordinary trace expansion and order, repeated command identity, bash exits, literal path and edit identities, running nonliteral commands, and the untraced syntax error. They omit the actual error and wait-update cases in F1/F2.
- Read `skills/watch-issues/SKILL.md` Busy and `docs/use/watch-while-away.md`. The existing Busy contract exposes the F1/F2 gaps. No area or documentation files changed.
- No grants or paid activity. The completed verification and diagnostic checks were free and have kept logs and timing rows. Worktree clean.

## Test-Change trailers

- `c2764116` `skills/watch-issues/scripts/log-tail.test.ts` cites the brief's What paragraph. Its changed existing expectation uses the same recorded records, with bash targets and hashes now required in place of the old exec placeholders. Justified.
- `c2764116` `skills/watch-issues/scripts/fixtures/pi-exec-u1-excerpt.jsonl` cites the U1 recording. The fixture is new and its provenance matches the source.
- `a095fce2` `skills/watch-issues/scripts/log-tail.test.ts` cites the recorded fixture content. It corrects expected lines for an unpaired call and the untraced call's timestamp in the test added on this branch. The source confirms both.
- `efb6ca4c` `skills/watch-issues/scripts/log-tail.test.ts` cites the watch-issues typecheck failure. The transcript has `toolCallId` inside `message`; the change corrects the test's type and the final verify passed.

## check.repair · 2026-11-20

Repaired head `62ceba61`. Both findings fall under brief criterion 1 and the existing `details.traces` design. The implementation notes name the two missing steps. The regression commits add byte-verified excerpts of the recordings cited above.

- F1. `814208a1` reproduces the failed edit. `29a81530` renders the recorded `error` outcome with its diagnostic. `check repair-b-f1-red: 1 implementation/check-repair-b-f1-red-1795201331005-2832169.log`; `check repair-b-f1-green: 0 implementation/check-repair-b-f1-green-1795201353420-2839232.log`.
- F2. `e2ad1ff7` reproduces the stale bash status. `62ceba61` applies the terminal `wait` outcome by trace ID and keeps the original line position and timestamp. `check repair-b-f2-red: 1 implementation/check-repair-b-f2-red-1795201371806-2845326.log`; `check repair-b-f2-green: 0 implementation/check-repair-b-f2-green-1795201400039-2856028.log`.
- Reran all planned criterion proofs on the committed repaired head. `check c1: 0 implementation/check-c1-1795201418147-2866237.log`; `check c2: 0 implementation/check-c2-1795201418166-2866240.log`; `check c3: 0 implementation/check-c3-1795201418192-2866239.log` (21 pass, 0 fail).
- Required verification is blocked. `akrogon verify` passed setup, format, and typecheck. `verify test: 1 implementation/check-test-1795201490597-2869459.log` finished 1,232 pass, 1 fail. `tests/hc-identity.test.ts:130` saw the test core still listening immediately after `SIGKILL`, the same failure title seen before repair in `implementation/check-test-1795200774418-1734404.log`. The watcher test and typecheck wrapper passed.
- Retried the configured test command through `akrogon run-check` on the same head. `check test: 1 implementation/check-test-1795201568874-3155528.log` finished 1,232 pass, 1 fail. The stale-socket test passed, while `tests/hc-identity.test.ts:95` failed when `akrogon next` returned 1 after a test core changed. The diff affects only log-tail and its tests and fixtures. `akrogon verify --known-red` returned `fail`, so the required test check remains blocking under the check-issue retry rule. The leaf stays in `check.repair` pending a passing verification receipt.

### check.repair resume · 2026-11-20

Same repaired head `62ceba61`. The planned criterion proofs still apply. `verify test: 1 implementation/check-test-1795201703578-3457712.log` recorded an unrelated Herdr fixture timing out after 15 seconds in `tests/fixture-repo-identity.test.ts`. The exact configured test command passed on retry. `check test: 0 implementation/check-test-1795201773678-3730074.log` (1,233 pass, 0 fail). The check is inconsistent on the same head.

- The next receipt run finished red on a different Herdr test. `verify test: 1 implementation/check-test-1795201847161-3999185.log` records the listener-restart timeout in `tests/hc-listener.test.ts`. The exact test command passed on retry without changes. `check test: 0 implementation/check-test-1795201927088-80318.log` (1,233 pass, 0 fail), again inconsistent.
- The following receipt run failed in `tests/next.test.ts:382` when `next` returned 1 for the busy-seat fixture. `verify test: 1 implementation/check-test-1795202022186-350324.log` (1,232 pass, 1 fail). Waited for host load to drop and ran verification again with the same commit and commands. The last run failed in the stale-socket test at `tests/hc-identity.test.ts:130`, also seen before repair. `verify test: 1 implementation/check-test-1795202235234-867328.log` (1,232 pass, 1 fail). Setup, format, typecheck and the watcher test and typecheck wrapper passed. `akrogon verify --known-red` returned `fail`. The leaf remains in `check.repair` without the required passing receipt.

### check.repair verification · 2026-11-20

`akrogon verify` passed on repaired head `62ceba61cce217cd77295c2c424404da56338d31`, with setup, format and typecheck green and all 1,233 tests passing. `verify test: 0 implementation/check-test-1795202346505-1158800.log`. The green receipt resolves the verification blocker.

The merge guard flagged missing `Test-Change` trailers for the two repair fixtures. Citation-only commit `ceb444fa08d15c8f39ccbbe1bcf5edea0bae2b40` adds both transcript sources. Its tree is identical to `62ceba61`, and `akrogon verify` reused the green receipt `a70fb761-ddb1-4c2e-9944-f57dbd108a89`.
