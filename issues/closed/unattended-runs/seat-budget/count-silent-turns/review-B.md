# Review B: count-silent-turns

2026-11-16, initial `check.review`, slot B. Verdict: **fix**.

Base: `fdb5fdc2e0c2b022a57b736ab878f06476396c4d`.
Reviewed head: `c3ecd3350f026a1bdc219c70ddf968b5a51c0981`.
Reviewed tree: `76bef14bff7b652b4bbde3fd302ff6f5d9112103`.
No peer review was read. No code was changed or committed.

## Fixes

### F1: The recorded-address probe bypasses terminal ownership

Location: `src/next.ts:474-475`, with the probe in `src/next.ts:466-468`.

Real source: a repository reopened in a different hc session while its leaf still records the old session and terminal address. hc addresses are local to a session, so a new session's unrelated terminal can have the same address. This is reachable through normal core shutdown, terminal startup, and `akrogon next`, without editing leaf state.

`leafSeats` (`src/reconcile.ts:397-410`) deliberately requires both the recorded session and the repo/leaf/slot labels. When it returns no matching seat, the new fallback probes `ref.address` in `place.session` without checking `ref.session` or the returned terminal's ownership labels. That turns an unrelated terminal into the dispatch target.

Confirmed on two real fixture hc cores using the existing stand-in and CLI boundary:

1. Create a fixture leaf and start its seat with `next`. State records old session `akt22zp4-1`, address `t1`.
2. Stop that core. In a second core holding the same repository space, start an unlabelled stand-in named `unrelated` with task `USER_TASK`. Its address is also `t1`. Wait for that user task to end.
3. Run `next` with the second core's environment. It exits 0 and sends `plan-issue review-session slot=A phase=plan.synthesis leaf=...` to the unrelated terminal. State still records the first session.

Consequence today: another agent receives and can execute the leaf's task, while the controller charges its turn against the leaf. The same unchecked target reaches `end()` when finished, allowing removal of another terminal and its screen history. The reproduced consequence is prompt misdelivery.

Contract/gap: the existing `leafSeats` ownership contract and the documented `seat` identity, which consists of **session plus terminal address** (`docs/reference/state-and-phases.md`). Brief criterion 4 concerns replacement of the recorded seat, not another session's terminal. The ownership bypass is introduced by this diff, rather than inherited from the old replacement branch.

Evidence: `check review-b-session: 1 /home/ivan/Work/infra/akrogon/issues/open/unattended-runs/seat-budget/count-silent-turns/implementation/check-review-b-session-1794846640837-3498746.log`, read back with `akrogon log`. The log records both session identities, equal addresses, the CLI result and the task list before/after. The assertion that the unrelated terminal received only `USER_TASK` fails because the leaf prompt was appended. Matching `check_start`/`check_end` rows record run `1f14e0c7-e734-4fe1-aaa2-a52485341ef3`, exit 1. The command completed normally.

Repair: preserve the existing session and label ownership rules when probing a recorded terminal absent from `leafSeats`. Never send to, read as loss evidence, or remove an unowned terminal. Add the reproduced session-switch case as the regression test and show it red before the repair and green after. This is a product repair within the current design, suitable for B.

The diagnostic used `fixture`, `hcCore`, `setSeat`, `cli`, `readState` and the existing cleanup helpers through `akrogon run-check --name review-b-session -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile --backend=copyfile" && bun test --timeout=30000 <temporary-proof.test.ts>'`. Both fixture cores and the fixture leaf scope were stopped in `finally`, the fixture was cleaned, and the temporary proof file was deleted. No production terminal was touched.

## Verification and plan audit

- C1/C2: the atomic count-and-clear write precedes redelivery, starts/deliveries no longer increment attempts, and the third silent end fails. `check-plan-c1-1794845438186-2089853.log` is red on the old delivery increment. `check-impl-c1-1794846351716-3212870.log` and `check-impl-c2-1794846356331-3215572.log` are green, including the throwing-send retry. The C1 assertion remains unchanged from its base-red version, satisfying the deliberate-break requirement.
- C3: `liveRuns()` includes live and waiting records after process-identity checks, and both counting branches filter by repo and leaf before charging. The proof uses real admission records. `check-impl-c3-1794846357683-3216167.log` is green.
- C4/C5: loss charging, reset, third-loss failure without another start, start-proof death, finished silent-end replacement, timing fields and read-before-removal order are covered by `check-impl-c4c5-1794846359192-3216808.log` (2 passing tests). `check-impl-c4r-1794846363411-3219047.log` proves phase reset. The hc turn-semantics correction is consistent with the real-core tests and preserves the brief's finished-turn carve-out.
- C6: `check-impl-c6-1794846362262-3218315.log` and `check-impl-c6b-1794846363139-3218408.log` prove default parsing and dispatch of older state without `lost`.
- All listed logs were read through `akrogon log`. The criterion proofs were run after the final product/test commit `fd8a14d9`. The later two trailer-only commits leave its tree unchanged. No changed runner configuration, skipped planned tests or disabled assertions were found.
- Proof-command correction accepted: widening C4/C5 from `-t 'lost seat'` to `-t 'lost seat|start proof'` retains the loss test and includes the existing start-proof case. Both cases run in the kept green log. The unchanged C1 base-red assertion supplies the required deliberate-break evidence. Other reported command shorthand selects the planned cases.
- Verify receipt `942fcd90-c728-4a7b-a78b-8e1b62e6766d` covers the reviewed tree: setup, format, typecheck and configured test command all exit 0. Test command: `bun test --timeout=30000 --parallel=4 --no-isolate`. `check-test-1794846429573-3219342.log`, read via `akrogon log`, ends with 1208 pass, 0 fail, 83 files. The new ownership reproduction is outside that suite and exposes F1 despite the green receipt. No full-suite rerun was needed for this review.
- Grant/count audit: readiness grants are empty and all checks use free local fixtures. There are 19 leaf check logs, 19 matching `check_start` rows and 19 `check_end` rows, including this review's diagnostic. No abandoned capture pair or unexplained paid activity was found. There is no known-red disposition: the diagnostic failure is caused by the changed fallback.

## Documentation and area paths

Opened `docs/reference/state-and-phases.md`, `docs/reference/files.md`, `docs/reference/commands.md`, `docs/reference-index.md` and `src/AREA.md` against the changed behavior. The attempts/lost/timing descriptions reflect the planned mechanism. The unchanged identity description supports F1. The index continues to point to the affected area and reference pages.

For the changed `src/AREA.md`, one shell command extracted its backticked `src/`, `tests/`, `docs/` and `skills/` paths and tested each with `Path.exists()` from the worktree root. Every concrete path exists. `skills/<name>` is a documented placeholder rather than a dead link. No deleted area file or lesson retirement occurs in this diff. `learnings/LESSONS.md` was not used as review input.

## Test-Change trailers in base..HEAD

All nine trailers were inspected against `src/test-files.ts`, the diff and their cited source:

- `f6438cdb`: `tests/hc-delivery.test.ts` cites brief criteria 1–5 for silent-turn assertions, run suppression and loss evidence. Accepted.
- `f6438cdb`: `tests/next.test.ts` cites criterion 1 for replacing old start/delivery count expectations and recording replacement losses. Accepted, together with the later hc-semantics correction below.
- `f6438cdb`: `tests/phase.test.ts` cites criterion 4 for loss reset on a phase move. Accepted.
- `f6438cdb`: `tests/state.test.ts` cites criterion 6 for zero-default loss counts. Accepted.
- `fd8a14d9`: `tests/hc-delivery.test.ts` cites observed hc turn advancement, delivery-error settlement and admission's configured full-line requirement. The revised tests exercise actual terminal removal, the finished-turn carve-out, and actual admission records. Accepted.
- `fd8a14d9`: `tests/next.test.ts` cites hc turn advancement for changing the replacement setup from kill alone to kill plus removal. The finished silent-end case remains covered in `hc-delivery.test.ts`. Accepted.
- `b04d036f`: `src/AREA.md` cites the attempts/lost documentation update and states that no test expectation changed. Accepted as an additional frozen-path citation.
- `c3ecd335`: `docs/reference/state-and-phases.md` cites the attempts/lost documentation update with no changed test expectation. Accepted as an additional frozen-path citation.
- `c3ecd335`: `docs/reference/files.md` cites the new timing kind with no changed test expectation. Accepted as an additional frozen-path citation.

The path rule matches the changed test files. No existing test was deleted or replaced with a mock of the unit under test. F1 needs a regression test because the existing suite does not protect the ownership contract against the new probe.

## Nits and operator actions

None. F1 is the only blocking finding.

## check.repair — 2026-11-16

Repair base: `c3ecd3350f026a1bdc219c70ddf968b5a51c0981`.
Repaired head: `ea55ea7ed4cfee0cbfb0d7db9803ac67ba92ccb1`.
Both initial reviews were read. A reported no Fixes. B's F1 is repaired.

### F1 repair and regression

- Reproduction commit: `dda01020b83182b0c73c5b67d21df87dbb9e27d8`, adding only the F1 regression in `tests/hc-identity.test.ts` and its required imports. Its `Test-Change` trailer cites reopening a repository in another hc session, where an unrelated agent reuses address `t1`.
- Fix commit: `ea55ea7ed4cfee0cbfb0d7db9803ac67ba92ccb1`. Removed the recorded-address fallback from `dispatchSlot`; it now refreshes only a terminal returned by `leafSeats`. That existing boundary already validates session, repo, leaf and slot, including finished terminals. Missing seats still charge `lost` from their recorded reference. A terminal disappearing after discovery retains the specific `not_found` handling.
- The new regression fails before the product fix because the unrelated terminal receives the leaf prompt. It passes after the fix, checking that the unrelated task list stays unchanged and a replacement seat is recorded in the current session at another address. All state comes from actual fixture CLI starts, with no handwritten seat state.
- Searched `src/next.ts`, `src/seat.ts` and `src/reconcile.ts` for recorded-address probes and terminal lookups. This was the only dispatch fallback bypassing `leafSeats`; removing it preserves the ownership decision for every subsequent send, screen read and removal. No new ownership predicate or fallback was added.

Kept red/green evidence, read back using `akrogon log`:

```text
check repair-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/unattended-runs/seat-budget/count-silent-turns/implementation/check-repair-f1-red-1794846923648-3534490.log
check repair-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/unattended-runs/seat-budget/count-silent-turns/implementation/check-repair-f1-green-1794846945667-3541893.log
```

Both use `bun test --timeout=30000 tests/hc-identity.test.ts -t 'repo core changes'`, through `akrogon run-check`, after the configured flocked setup. The red run uses the pre-fix product at `c3ecd335` plus the subsequently committed reproduction. The green run uses exactly the files committed at `ea55ea7e`. No test changed between those runs.

### Planned proofs on the repaired head

Every planned proof was rerun after the `src/next.ts` change, through `akrogon run-check`, with the configured flocked setup first. All seven commands pass. These tests were written in planning/implementation, not by B, and independently accept the product repair.

| Criteria | Command after setup | Kept log under `implementation/` | Result |
| --- | --- | --- | --- |
| C1 | `bun test --timeout=30000 tests/hc-delivery.test.ts -t 'silent stops are re-prompted'` | `check-repair-c1-1794846978274-3544772.log` | 1 pass |
| C2 | `bun test --timeout=30000 tests/hc-delivery.test.ts -t 'counted once'` | `check-repair-c2-1794846974171-3544797.log` | 1 pass |
| C3 | `bun test --timeout=30000 tests/hc-delivery.test.ts -t 'live or waiting'` | `check-repair-c3-1794846974119-3544857.log` | 1 pass |
| C4/C5 | `bun test --timeout=60000 tests/hc-delivery.test.ts -t 'lost seat\|start proof'` | `check-repair-c4c5-1794846974413-3544934.log` | 2 pass |
| C4 reset | `bun test --timeout=30000 tests/phase.test.ts -t 'failed exits by command'` | `check-repair-c4r-1794846973135-3545325.log` | 1 pass |
| C6 parse | `bun test --timeout=30000 tests/state.test.ts -t 'retain defaults'` | `check-repair-c6-1794846972939-3545048.log` | 1 pass |
| C6 dispatch | `bun test --timeout=30000 tests/next.test.ts -t 'keep the leaf in phase'` | `check-repair-c6b-1794846973730-3545178.log` | 1 pass |

All seven logs were read back with `akrogon log`. Existing expectations needed no correction. In particular, the loss test's call list already includes the initial owned terminal lookup, so removing the later redundant probe does not make its `get` assertion fail. No proof command or locked decision changed.

### Handoff and limits

No items are handed to A. No operator action is open. No reusable Nit is held. Only `src/next.ts` and the F1 reproduction test changed. The repair restores the documented seat identity contract, so no documentation change is needed. Fixture cores and leaf scopes are cleaned in `finally`; all proof commands completed with their own result. No grant, paid operation, secret read or production terminal was involved.

### Final verification and disposition

`akrogon verify` passed on committed head `ea55ea7ed4cfee0cbfb0d7db9803ac67ba92ccb1`, tree `7ecb33360137d24821e21eb50a273b63f6654812`, receipt `07dbea7e-a3bf-4ae8-aa5e-06d9a9f82ec7`. Setup, format, typecheck and the configured test command all exit 0. The full suite reports **1209 pass, 0 fail across 83 files**, including the new F1 regression.

```text
verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/unattended-runs/seat-budget/count-silent-turns/implementation/check-format-1794847014586-3551351.log
verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/unattended-runs/seat-budget/count-silent-turns/implementation/check-typecheck-1794847017135-3551351.log
verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/unattended-runs/seat-budget/count-silent-turns/implementation/check-test-1794847074224-3551351.log
verify leaf ea55ea7ed4cfee0cbfb0d7db9803ac67ba92ccb1: green
```

All three check logs were read back using `akrogon log`. There are now 32 leaf check logs with 32 matching starts and 32 matching ends, and no abandoned capture pairs. `git diff --check c3ecd335..HEAD` passes and the worktree is clean. No merge checks were run.

Disposition: F1 closed, **ready for merge**. No `Handed to A` items or operator actions remain.
