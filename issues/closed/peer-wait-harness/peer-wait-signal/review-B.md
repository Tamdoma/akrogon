# Review B

2026-10-16, initial `check.review`. Verdict: **fix**.

Base: `76e7f93d48a97f08b304dc40b13fde45e9e2f5f5`.
Reviewed head: `87f9a4810ff4bdd11e08e766a5bd8c4d8c2be623`.

Read brief, design, plan, implementation report, affected code/tests, questions.md, chart-issues skill references, reference index and test-path rule. Debate is off and there are no B debate artifacts. Reviewed independently without reading the peer review. Worktree was clean. No AREA.md changes.

## Fixes

### F1. A carried Codex turn incorrectly keeps the signal proven after rollout lookup fails

`skills/chart-issues/scripts/peer-wait.ts:217-219` derives `proven` from `exchange.turn !== null`, although `codexEnded` returns `unproven` when the rollout is missing or ambiguous. A bound turn survives budget reruns by design, so the bound ID does not establish that the current lookup succeeded.

Criterion scenario: run an idle Codex exchange with one rollout containing a post-boundary `task_started`; take its emitted exchange containing the bound turn; remove that fixture rollout; rerun using that exact emitted exchange. The rerun reports `budget`, `status: idle`, `signal: proven`. Expected `signal: unproven` under brief C3's zero-match condition, carried through C7. This also defeats C8's operator gate: the documented door immediately reruns this budget instead of reporting it to the operator. Several matches have the same faulty branch.

Evidence: `check B codex real exchange rerun: 0 implementation/check-B%20codex%20real%20exchange%20rerun-1792109079855-3574450.log`, read back with `akrogon log`. The command runs the real peer-wait process against fake herdr and a temporary HOME, first binds `turn-A`, then removes the rollout and reuses the emitted exchange. Both lines print `signal: proven`. This is a failed criterion outcome despite the diagnostic command itself exiting zero.

Repair: derive signal proof from the current verdict, retaining the original bound turn for subsequent reruns. Add a regression at this existing process boundary. Current missing/ambiguous-rollout cases all start with `turn: null`, so they cannot catch this.

### F2. Session changes incorrectly abort unproven harness waits

`skills/chart-issues/scripts/peer-wait.ts:146` checks `exchange.kind !== 'pi'`, extending the session-change error to every unknown harness. Brief C6 and design decision 3 restrict that error to Claude and Codex. Other kinds must keep waiting under C1 unless the kind itself changes.

Criterion scenario: an idle `antigravity` peer starts with session `session-A`; fake herdr's grace wait changes only its session to `session-B`. The real process exits 1 with `Peer pane w8:pX changed session: session-A → session-B` and prints no outcome. Expected continued waiting followed by `budget` with `signal: unproven` when no return file arrives. The chart door currently stops on this nonzero exit, violating the requested unproven-harness behavior.

Evidence: `check B edge outcome probes: 0 implementation/check-B%20edge%20outcome%20probes-1792109042014-3555157.log`, read back with `akrogon log`. Its second scenario records the process exit and error above. This scenario is grounded in the explicit C1/C6 outcome contract, rather than a claim about an observed Antigravity session transition. The diagnostic command exits zero while recording the failing product outcome.

Repair: restrict non-null session mismatch errors to Claude and Codex, preserving kind-change checks for every harness and pi's authority rule. Add a process-boundary regression for another kind's session change. Existing tests cover only Claude/Codex mismatches and pi's exception.

## Verification

Reused current-head evidence because no product/test files changed during review. Read back these logs using `akrogon log`:

- `check final peer-wait fmt: 0 implementation/check-final%20peer-wait%20fmt-1792108813936-2925066.log`: 33 pass, 0 fail. This is the planned `bun test tests/peer-wait.test.ts` command.
- `check final peer-ask fmt: 0 implementation/check-final%20peer-ask%20fmt-1792108814227-3039364.log`: 7 pass, 0 fail. This is the planned `bun test tests/peer-ask.test.ts` command.
- `check test: 0 implementation/check-test-1792108945483-3043818.log`: 945 pass, 0 fail, from the final reported `akrogon verify`.
- `check format: 0 implementation/check-format-1792108819178-3043818.log`: all matched files formatted.
- `check typecheck: 0 implementation/check-typecheck-1792108947335-3043818.log`: `tsc --noEmit` completed.

The report records red-before implementation and the pi-authority, Codex-turn-ID and Claude deliberate-break proofs. Final targeted runs follow the latest test/helper changes. No planned tests were skipped, filtered or disabled by this diff. The green checks do not exercise F1 or F2.

Additional retained inspection logs: `check B review inventory: 0 implementation/check-B%20review%20inventory-1792109004849-3538247.log`, `check B diff and contracts: 0 implementation/check-B%20diff%20and%20contracts-1792109008074-3540160.log`, and `check B tests and proof inventory: 0 implementation/check-B%20tests%20and%20proof%20inventory-1792109015596-3543593.log`. An inspection command (`B review line references`) exited 1 because the installed sibling lesson-rule path was absent. Read the repository's `skills/lesson-rule.md` instead in `check B remaining proof records: 0 implementation/check-B%20remaining%20proof%20records-1792109057450-3563067.log`. This was an inspection-path error, not a failed product check.

## Documentation and lesson retirement

questions.md documents the carried exchange argument, signal field and operator gate as required. SKILL.md refers to that rule and does not duplicate the rerun command. The removed lesson concerns false `failure` outcomes for idle unproven kinds. The running default `turnVerdict` branch mechanically prevents that outcome. The history gains its Applied entry. F2 concerns an erroneous process error, distinct from the retired false-failure mechanism.

## Test-Change trailers

Compared every trailer in `76e7f93..HEAD` with `src/test-files.ts` and the corresponding diff:

- `4f89012`, `tests/fake-herdr.ts`: agent-list fields, persisted status, scripted identity changes and append targets. Source: brief C2/C3/C5/C6/C7 and design's existing-fake extension. Valid fixture changes.
- `4f89012`, `tests/peer-wait.test.ts`: criterion cases and existing idle/done expectations changed to budget with signal/exchange. Source: brief C1/C8. Valid behavior change, with prior pass-through, return-file, blocked and budget checks retained.
- `4f89012`, `tests/peer-ask.test.ts`: boundary/missing-pane cases and expanded outcome objects. Source: brief C7/C8 and plan D3. Valid additions and changed interface assertions.
- `48bba1a`, `tests/peer-ask.test.ts`: boundary case budget 10 to 12. Source: recorded `impl peer-ask U2` output showing budget truncates the grace. Consistent with the existing full-grace requirement and final green boundary proof. No expectation correction.
- `87f9a48`, `tests/peer-wait.test.ts`: Prettier reflow only. Confirmed no behavior/assertion change.
- `87f9a48`, `tests/peer-ask.test.ts`: Prettier reflow only. Confirmed no behavior/assertion change.

No operator actions or deferred Nits. Temporary probe fixtures were removed by TemporaryDirectory on exit. No code changes or commits during review.

## 2026-10-16 check.repair

Read both initial reviews on `87f9a4810ff4bdd11e08e766a5bd8c4d8c2be623`. A has no blocking finding. Repaired B's F1 and F2 in separate test/fix commit pairs. Repaired head: `4302113941815b45cceaec5a90480945949ba36f`.

### F1 repaired

- Reproduction test commit `ed37244`: real peer-wait process binds an open Codex turn, reuses its emitted exchange after removing the rollout, then checks the same exchange with two matching rollouts. Both unavailable-channel cases must report `budget` / `signal: unproven` while retaining the bound identity.
- Fix commit `0a4a936`: signal proof comes from the current `codexEnded` verdict rather than the presence of a carried turn ID.
- Red: `check B F1 red: 1 implementation/check-B%20F1%20red-1792109179563-3903540.log`. Missing rollout incorrectly printed `proven` instead of `unproven` before the product fix.
- Green: `check B F1 green: 0 implementation/check-B%20F1%20green-1792109189110-3922329.log`. The same reproduction passes after the fix, including the ambiguous rollout case.

### F2 repaired

- Reproduction test commit `1d3d5be`: an idle Antigravity peer changes session at the grace check, reaches an unproven budget, and reruns with the emitted original exchange without an identity error.
- Fix commit `4302113`: session mismatch errors apply only to Claude and Codex. Kind mismatch checks remain common to all harnesses.
- Red: `check B F2 red: 1 implementation/check-B%20F2%20red-1792109198305-3938106.log`. The original session check caused process exit 1 before the product fix.
- Green: `check B F2 green: 0 implementation/check-B%20F2%20green-1792109206464-3941070.log`. The same reproduction reaches both expected budgets after the fix.

Each reproduction was run before its product fix and committed separately with a `Test-Change: tests/peer-wait.test.ts` trailer citing the affected brief criteria and finding. No old expectation changed, and these are the only new tests. All four red/green logs were read back with `akrogon log`.

### Criterion proofs and verification

The repaired product and test files change inputs to C1–C8, so reran the planned peer-wait/peer-ask boundary proofs, including the original proofs written by A. C9's text is unchanged and retains its reviewed evidence. No additional documentation behavior changed.

The first invocation used the plan's bare `bun test tests/peer-wait.test.ts tests/peer-ask.test.ts`: `check B repaired criteria: 1 implementation/check-B%20repaired%20criteria-1792109226554-3951221.log`, with 28 pass and 14 default five-second timeouts on intentional 11/22-second waits. This was a deterministic command timeout, not a new product failure. Added one dated Implementation notes line to plan.md requiring the configured `--timeout=30000` limit for brief C1/C7. No test or assertion was changed to resolve the command error.

Corrected planned proof: `bun test tests/peer-wait.test.ts tests/peer-ask.test.ts --timeout=30000`, through `run-check` after locked frozen install. `check B repaired criteria timeout30: 0 implementation/check-B%20repaired%20criteria%20timeout30-1792109271950-4011989.log`: **42 pass, 0 fail** on `4302113`. Both criterion-run logs were read back with `akrogon log`.

Full `akrogon verify` on committed head `4302113941815b45cceaec5a90480945949ba36f`: **green**. Read back all three check logs with `akrogon log`:

- `verify format: 0 implementation/check-format-1792109275593-4128243.log`.
- `verify test: 0 implementation/check-test-1792109401758-4128243.log`: **947 pass, 0 fail**, including both reproductions.
- `verify typecheck: 0 implementation/check-typecheck-1792109403592-4128243.log`.

No merge checks run. No Handed to A items, operator actions or reusable Nits remain. No external action or grant was needed. Fixtures use temporary HOME and existing cleanup in the test's finally block. Both findings are resolved and the repaired head is ready for merge.

## 2026-10-16 merge

Attempt `a11b5e93-9b47-4880-a36d-78a9e7d7e6a2`, applied memberless top `4302113941815b45cceaec5a90480945949ba36f`, built on `76e7f93d48a97f08b304dc40b13fde45e9e2f5f5`. Worktree clean and HEAD matches the prompted top. No fetch, rebase or commits needed.

`akrogon verify --attempt a11b5e93-9b47-4880-a36d-78a9e7d7e6a2` returned `reuse receipt 47c56504-c209-4dcd-a881-fc3952c02f61 tree=dcaf96191110397a4c88255bc1ee0870dca507df`. Read back the receipt's existing format/test/typecheck logs listed above: all green, 947 tests passed. Config has no merge checks or advisory commands.

`akrogon phase peer-wait-signal merged --slot B --check --attempt a11b5e93-9b47-4880-a36d-78a9e7d7e6a2` returned `ok`, accepting the receipt, top and test-change trailers. Gathered completion owner `peer-wait-harness/ISSUE.md` and its sole leaf brief before the final merged call.
