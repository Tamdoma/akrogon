# Review B: cli-help

Phase: check.review. Date: 2026-11-11. Verdict: **fix**.

Base: `a33d967b5dd07829b81b9dd87802c8a72f8effbd`.
Reviewed head: `43a3d7a75ad7b1219ced4328618dad3f49fe131e`.
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/cli-help`, clean throughout review.

## Fix

### F1: Wrong timing forms migrate state before rejecting the argument

Location: `src/akrogon.ts:64`, before the timing form validation at lines 248–269.

Realistic source: a user runs either of the brief's exact malformed commands on an installation whose `config.yaml` remains in the tool root, with an empty destination home:

```sh
akrogon timing --flow --since 2026-10-25T00:00:00Z
akrogon timing --cohort --since 2026-10-25
```

Trace: the new help and unknown-option exits precede `migrateStateHome()`, but the new wrong-form exit remains inside dispatch. `migrateStateHome()` therefore copies state and config before `z.iso.date()` or `z.iso.datetime()` rejects the argument. This is the supported startup migration exercised by `tests/state-home.test.ts`, not an invented invalid internal input.

Consequence today: both invocations create `config.yaml`, `.lock`, and `admission.lock` in the previously empty home. They also print a migration line before usage. A rejected argument has changed state. A migration error could prevent the promised usage error entirely.

Contract: design's binding question 1 requires “the help and argument-error path finishes before `migrateStateHome()`”, and its order decision explicitly includes both argument-error exits. This also violates brief criterion 5's no-command-work requirement. Plan D5/D6 and the implementation leave this required timing path after migration.

Reproduction used an isolated copy of the reviewed `src`, the installed dependency tree, a tool-root `config.yaml` containing only `repos: {}`, and separate empty homes. Both real CLI invocations returned 1 and produced the files above. The no-files assertion failed. All temporary sources and homes were removed on exit.

```text
check review-b-timing-side-effect-file: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-review-b-timing-side-effect-file-1794393200047-689163.log
```

Repair: reject malformed timing forms before migration, preserving migration before successful command work and preserving other error contracts. Add the red-first CLI regression for this supported migration state and both named malformed forms. The current no-work test checks help and unknown flags but never malformed timing forms, and a worktree with no tool-root config cannot expose this failure.

## Verification

- E1: The completed verify receipt `54836918-7c11-4506-863f-8dffa67963b4` matches the reviewed SHA and tree `2233daf5adcf16065c6c0a85376d0820000661c4`. Setup, format, typecheck and the configured unfiltered test command all exited 0. Read the kept logs through `akrogon log`. Test result: 1159 pass, 0 fail, including all seven current CLI-help tests and the existing timing/run-check/guard/reference suites. This current run follows the latest test formatting commit. No planned tests, runner settings or fixtures were skipped or disabled. No full-suite rerun was needed.

```text
check format: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-format-1794392983981-3928523.log
check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-typecheck-1794392987034-3928523.log
check test: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-test-1794393077603-3928523.log
```

- E2: Read the deliberate-break logs for help fallthrough, flag handling/child forwarding, and timing error leakage. The planning natural-red logs fail at importing the then-absent `src/usage.ts`, so those alone do not prove the timing bug. Independently ran identical real CLI assertions on archived base and reviewed-head sources with separate empty homes and no migration config. Both named timing inputs produce ZodError dumps and fail the usage assertion on base, then pass on the reviewed head. This supplies behavioral before/after evidence for criterion 4 without changing a planned proof command. These narrow proofs do not replace configured checks or clear F1.

```text
check review-b-since-base: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-review-b-since-base-1794393264672-875052.log
check review-b-since-head: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-review-b-since-head-1794393264863-875368.log
check cli-help-te6: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-cli-help-te6-1794392781582-2890843.log
check cli-help-te45: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-cli-help-te45-1794392775623-2859134.log
check cli-help-te8: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-cli-help-te8-1794392787943-2928590.log
```

- E3: Read the whole six-file diff, brief, design, plan, report, standing design, command reference and affected area/index pointers. Public flags and order match the old declaration and public verb list. Shared usage constants preserve the old five usage lines. `verify-pass` remains documented Internal. No AREA.md or lesson file changed. The command reference accurately describes the intended new help/unknown-flag behavior. No additional documentation defect found.

```text
check review-b-context: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-review-b-context-1794393104277-369639.log
check review-b-final-scope: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-review-b-final-scope-1794393220915-788486.log
```

Two diagnostic-command failures are not product evidence: `review-b-diff` ended 1 because its final receipt-filename search found no leaf-local receipt (the authoritative receipt is in `issues/verify-runs.jsonl`), and `review-b-timing-side-effect` ended 1 because run-check does not forward stdin to `bun -`. Both emitted completed check lines. The file-based reproduction above replaces the stdin attempt. No abandoned capture remains from these runs.

## Test-Change trailers

Only trailer in base..HEAD:

```text
43a3d7a75ad7b1219ced4328618dad3f49fe131e
Test-Change: tests/cli-help.test.ts prettier formatting only, no expectation changed
```

Accepted: `tests/cli-help.test.ts` matches `src/test-files.ts`. The commit only expands one array literal across lines, with no changed assertion, input or expectation. The initial test file was added in planning commit `c8075967`; no old test expectation was changed or removed.

## Nits and operator actions

None. No paid or live operations, grants, or count lines apply. No peer review was read and no peer was contacted. No code edits or commits were made during review.

## Phase result

Submitted `akrogon phase cli-help check.repair --slot B --verdict fix` through run-check. It printed `moved check.repair`, then exited 1 with `MoveCommittedError`: the move committed, but transcript/log collection and the wake could not discover hc sessions because `XDG_RUNTIME_DIR` was absent in the command environment. Read-back of `state.yaml` confirms `phase: check.repair`. The phase command was not repeated. The repair pass should run in the normal hc session environment.

```text
check review-b-verdict: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-review-b-verdict-1794393342385-955186.log
```

## check.repair — 2026-11-11

Reviewed both initial reviews on `43a3d7a75ad7b1219ced4328618dad3f49fe131e`. F1 is the only Fix. A's N1–N3 remain non-blocking concerns, with no current defect requiring repair. No operator action or handoff to A is needed.

F1 repaired in two commits:

- `821359674a20a911d13ee8fd3eac1b391711d7ad`: one reproduction test in `tests/state-home.test.ts`, using its existing copied-tool-root fixture. Both brief inputs must leave the empty destination and tool root unchanged and print only the timing usage line. The test was shown red before the product change and carries a `Test-Change` trailer citing F1's real startup source.
- `51969f713f4aa457da24529a6efb7551ac5488f9`: defer timing's migration until its existing shape/form validation finishes. Other verbs retain their original migration path. Valid timing modes still migrate before `timingCommand`; the specific ZodError handler still wraps only the argument parses.

Added one dated implementation note to `plan.md` for the required pre-migration timing rejection omitted by the plan, citing the binding design. No other plan text, locked decision, old expectation, or documentation changed.

The committed reproduction failed before the fix because the malformed flow invocation created `.akrogon`. The identical test passed after the fix, exercising both malformed forms. Logs read back with `akrogon log`:

```text
check repair-b-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-repair-b-f1-red-1794393441958-1303556.log
check repair-b-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-repair-b-f1-green-1794393458578-1320500.log
```

On the committed repaired head, reran the planned proof B did not write, exactly `bun test tests/cli-help.test.ts`: all seven criteria tests passed. Also reran the planned compatibility suites plus the existing state-home suite: 62 tests passed, including valid cohort/flow forms and startup migration. Every criterion's changed CLI input was re-exercised. Setup ran under the configured install lock before each dependency-using proof.

```text
check repair-b-planned: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-repair-b-planned-1794393476076-1337642.log
check repair-b-compat: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-repair-b-compat-1794393487500-1337636.log
```

No proof machinery, live operation, paid launch, or additional test was introduced. No reusable Nit is held by B. No temporary helper was added to the worktree.

Final `akrogon verify` passed on repaired head `51969f713f4aa457da24529a6efb7551ac5488f9`, receipt `5a69ae91-fc2b-42ab-9765-0b854882ebd3`, tree `0183d4886d461db223819c95de364b83de6d4a46`: setup, format, typecheck, and configured unfiltered test command all exited 0. The suite passed 1160 tests with no failures, including the reproduction. No merge_checks ran. Read the final logs through `akrogon log`. The two-file repair diff passes `git diff --check` and the worktree is clean.

```text
check format: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-format-1794393532419-1615745.log
check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-typecheck-1794393535189-1615745.log
check test: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/cli-help/implementation/check-test-1794393608155-1615745.log
```

F1 is resolved. No Fix, operator action, or `Handed to A` item remains. Requesting merge. The phase command restores the caller's hc session identity and runtime directory explicitly inside run-check, avoiding the earlier review handoff's scrubbed-environment failure.
