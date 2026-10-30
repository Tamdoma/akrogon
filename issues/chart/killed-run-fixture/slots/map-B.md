# Slot B independent opening map

Two destinations, two charts. #123 has an operator-set outcome and needs design choices. #124 has a reproduced architectural mechanism but no stated expected outcome. Set its recovery guarantee before selecting a supervisor or gate. Shared files do not make these one problem.

## Evidence and limits

Evidence tiers below: **operator** = recorded operator choice, **practitioner** = the originating incident report, **better-than-training** = inspected current code, records, tests or primary documentation, **model-knowledge** = my recommendation or predicted consequence inferred from those sources. No outside practitioner was consulted. Tests were inspected, not executed. No cloud resources, notifications or repository files were changed.

- **F1. Current source matches the reported release identity.** Local HEAD is `3e49c3d5ddc7a178a9c5ff448015e525b85fb345`. Inspected `src/verify.ts`, `src/run-check.ts`, `src/scope.ts`, `src/land.ts`, `src/phase.ts` move guards and transitions, fixture/grant schemas in `src/readiness.ts`, and relevant readers. The reported behavior is present. This does not independently establish what killed the Klobuk run. [better-than-training]
- **F2. Timing records exist without a slowdown reader.** `src/verify.ts:runOnce` appends before checkout and sets `end` after commands settle, before final record rewrite, notice delivery and checkout removal. Thus recorded duration includes checkout, setup and admission waits inside checked commands, but excludes final cleanup and notification delivery. `requireGreenReceipt`, `greenRun`, `reuseSource` and `knownRedReceipt` use command results and trees. Targeted searches in `src/status.ts`, `src/timing-report.ts`, `skills/watch-issues/SKILL.md` and `skills/broadcast-issue/SKILL.md` found no recent-normal comparison. Timing report formats individual durations. [better-than-training]
- **F3. The framework slowdown is real, but intake totals are a snapshot.** Read `/home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl`, scope merge, October 24–28. First slow `renderer-package-cutover` run: `52382dbb-936e-4d9c-b10a-7ee9d8abaf3b`, October 27 00:10:35Z, 15.95 min, red. Its next run: 18.01 min, green. `site-nav-routes` at 02:28:18Z: 20.56 min, green. Latest inspected runs on October 28 are 20.96–21.41 min. The current file yields 45 completed green pre-October-27 runs, median 5.86 min; excluding `compares` yields 39, median 5.90 min. It contains 51 records after October 27 02:28. These differ from the intake's 41 / 5.95 / about 45, so define the cohort rather than reproducing those counts as a contract. All nonempty inspected command signatures were `verify = bun run framework:verify`. [better-than-training; the historical impact totals remain practitioner claims in seed #123]
- **F4. Interruption evidence already survives.** `checkedRun` creates and prints run-specific capture paths before launch and `check_start`. Combined log publication, `check_end`, capture unlink and the final `check` line occur after the child returns. `tests/durable-capture.test.ts`, named SIGKILL and normal-exit cases, already encode this distinction. A successful later run has a different run UUID and proves nothing about the earlier fixture. [better-than-training]
- **F5. Current containment intentionally kills orphaned checks.** `startRunGuard` waits for wrapper death, removes its admission record, then stops its scope. `runUnitArgv` sets `TimeoutStopSec=5`. Nested checks take a separate branch without their own run guard/scope. `src/phase.ts:transition` checks receipts, cleanliness and citations, not unfinished live-fixture cleanup. Existing grant schemas carry marker, naming, cleanup identity and authenticated absence check, but no per-run cleanup-obligation state. Review and merge skills already require success/failure cleanup and treat leftovers as blockers. [better-than-training]
- **F6. Verify already has different ownership from run-check.** `verifyPassCommand` runs in a service, `passOnce` joins a live pass, and callers wait for its status. `land` can complete a green merge without B running verify interactively. `broadcastPass` supplies a completion-owner handoff to B without a timing warning. Therefore printing only to an unattended land service does not itself prove operator/merge-seat visibility. [better-than-training: `src/verify.ts`, `src/land.ts`, `src/next.ts:broadcastPass`, `landedWake`; `issues/chart/verify-lifetime/CHART.md` Destination]

## Locked boundaries

- **D1. #123 warns after a completed merge verify, compares against recent normal for the repo/scope, and names the first affected leaf.** No wall-clock cap or red merge caused by duration. The +50% figure in seed #123 is an example, not an operator-fixed algorithm. [operator: framework `issues/chart/verify-time-tradeoffs/forks/tradeoffs.md` Taken D3; seed Expected behavior]
- **D2. Add no elapsed-time stall detection, watchdog, timer or long-lived watcher.** Completion-time comparison is compatible because it uses an existing event. An on-demand recovery check can also avoid a new watcher. [operator: `issues/chart/seat-stall-detection/forks/no-akrogon-detector.md` Taken, 2026-09-18]
- **D3. Caller-surviving run-check was off route for #120, not permanently forbidden.** Reopening it for #124 requires an explicit destination choice because it changes cancellation/admission ownership. Do not quietly treat it as a small logging fix. [operator/process record: `issues/chart/killed-check-log/CHART.md` Off route]

## #123 material forks

### K1. Which durations are comparable?

- **O1. One recent median over every completed merge receipt.** Smallest implementation, but known-red base runs, partially reused runs and blocked command stages can pull the median downward. Mixing different command sets can compare different workloads. On a sustained regression the median eventually becomes slow. [model-knowledge from F2–F3 and `verify.ts:reuseSource`, `runOnce`, `verify`]
- **O2. Recent comparable, freshly executed head passes.** Exclude incomplete/setup-failed/base-comparison/reused/blocked passes from the normal cohort; define whether completed red heads are eligible. Compare before admitting the current observation. This removes obvious workload contamination, but exact command-set equality creates a cold start when a leaf changes configuration. A changed-command leaf must not silently bypass the alarm. [model-knowledge from the same paths]
- **O3. Timing each command separately.** Better diagnosis, but neither command timings nor summing parallel members equals total merge wall time. It expands the destination into profiling. Keep off route unless total-duration evidence proves insufficient. [better-than-training: parallel members in `runOnce`; inference]

Proposed direction: O2 for the recent normal, with an explicit policy for workload changes and insufficient history. Keep the duration definition already recorded unless the operator wants whole-command latency. Do not introduce thresholds into merge admission.

### K2. Detect a jump once, or keep its origin visible?

- **O4. Recalculate a rolling normal and print every crossing.** No extra incident state. Repeated retries can spam, and enough slow runs erase both the warning and its first affected leaf. This is exactly the long plateau in F3. [model-knowledge]
- **O5. Preserve a detected slowdown's first run/leaf and pre-jump reference until observed recovery.** Later slow runs can cite the same origin while notification delivery is deduplicated. It adds state, recovery semantics and concurrency handling. A second independent increase during the same plateau needs an explicit policy. [model-knowledge; existing locked reservation/delivery pattern in `verify.ts:newRedUnits`, `sendMainRedNotice` is relevant precedent, not a drop-in algorithm]
- **O6. Warn once and allow the normal to adapt.** Lowest ongoing noise, but accepts that later merge slots may never see the unresolved slowdown. That consequence conflicts with the intended visibility unless another durable surface carries it. [model-knowledge from F6]

Proposed direction: preserve the first observation in durable evidence and distinguish operator delivery from per-run output. Prefer deriving history from existing receipts where sufficient before adding another file. Do not reuse the main-red `notice` field for a separate concern without deciding how the two coexist.

### K3. What does “leaf whose merge first showed it” mean?

- **O7. Earliest qualifying head observation in the slowdown episode, including red attempts.** Correctly names `renderer-package-cutover` in F3 and does not blame the later green leaf. It identifies first observed cost, not proven causation. A rejected candidate should remain labelled as an attempt. [better-than-training F3; inference]
- **O8. First slow green/landed merge.** Avoids attributing a lasting main slowdown to a candidate that never landed, but misses the first slow attempt and may misname the next leaf. Resolving landed ancestry adds work and must not confuse base comparison receipts with candidate heads. [model-knowledge; `verify.ts` receipt `leaf`, `sha`, `compares`, existing `newRedUnits` ancestry distinction]

Proposed direction: O7 with run ID, SHA, measured duration and reference duration. Say “first observed at” rather than asserting that this leaf caused it. Name a landed origin only if evidence establishes it.

### K4. Where is the warning delivered?

- **O9. Verify output plus durable receipt evidence.** Covers interactive verify and has no new external integration. Alone it does not prove visibility during command-owned green land. [F6]
- **O10. Existing Herdr notice plus a readable merge-seat surface.** Closest available operator channel and can announce even a red attempt. Delivery failure must leave verify's result intact, retain evidence and have an event-driven retry policy. Prove the actual resolved session sees it. [better-than-training: `sendMainRedNotice`; model-knowledge for proposed use]
- **O11. Completion broadcast.** Reaches an existing audience, but can be delayed until an epic finishes and cannot announce an attempt that never completes. Current broadcast content excludes test statistics. Changing it is an explicit scope choice, and a broadcast alone is insufficient for immediate attempt visibility. [better-than-training: `skills/broadcast-issue/SKILL.md` Context and message, `src/next.ts:broadcastPass`]

Proposed direction: O9 plus a specifically chosen operator/seat surface. Require a green command-owned land scenario as proof, not just a direct `verify` invocation.

### #123 practitioner questions

- **Q1.** What recent sample size, minimum history and relative increase distinguish useful warnings from ordinary shared-host variation? Should there also be a minimum absolute increase to avoid noisy tiny checks? These are choices, not fixed by D3.
- **Q2.** On a changed command set, do we compare with the previous workload and label the change, or explicitly report insufficient comparable history? Silently treating the changed suite as normal would miss a common source of cost.
- **Q3.** Should completed red heads enter the reference cohort, and should every completed red head still be evaluated for a warning? F3's first slow run was red.
- **Q4.** Must the first slow run immediately alert, with occasional host-load false positives accepted, or may a later confirmation delay the operator notice? The seed says after each merge verify, so immediate evaluation is the starting interpretation.
- **Q5.** What clears an episode, how does a second increase behave, and how does a newly dispatched merge slot learn an unresolved warning after its one operator notification was sent?

## #124 material forks

### K5. What outcome are we promising?

- **O12. Recovery before rerun or handoff.** On a live proof with no completed result, read its captures, establish that the old run is no longer writing, enumerate that run's fixtures using the grant, clean them and authenticate the absence check before retrying or claiming readiness. Use the existing skills/grants and record both attempts. This directly fixes the observed seat omission with few moving parts, but relies on the agent and does not clean anything if the seat never returns. [model-knowledge grounded in F4–F5 and seed #124 Workaround]
- **O13. Durable per-run cleanup obligation and a gate.** Record fixture ownership/recovery information before mutation, and retain unresolved cleanup until absence is proven. A command can refuse advancement or another live proof. This survives seat forgetfulness, but introduces state and a trusted resolution action. A blanket “capture exists” gate also catches active/non-live checks and can prevent the cleanup command itself. A resolution path and attribution are part of this option, not follow-up polish. [model-knowledge grounded in `readiness.ts` schemas, `phase.ts:transition`, F4]
- **O14. Automatic cleanup without a returning seat.** Requires an independent cleanup owner with the right credential, durable identities or marker enumeration, and a defined trigger. It adds external execution authority and crash/retry semantics. A new polling janitor is foreclosed by D2. Reusing wrapper-death handling or another existing lifecycle event still needs proof of ordering and authority. This is a materially larger destination. [model-knowledge from `scope.ts:startRunGuard`, existing grant contract]

Proposed direction: present O12 as the narrow fix and O13 only if mechanical enforcement is wanted. Do not invent O14 as the expected behavior of an intake that supplies none. If the operator requires eventual cleanup after complete seat loss, O12 cannot satisfy that requirement.

### K6. Keep kill-on-wrapper-death, or let the proof survive?

- **O15. Keep containment and recover externally.** Prevents abandoned work continuing indefinitely. `finally` remains best effort, and the recovery contract must cover a killed runtime. [F5; primary systemd source below]
- **O16. Run-check service ownership like verify.** Ordinary caller loss could let the probe finish and clean itself, but also lets writes and spend continue after the caller disappears. It needs join, cancellation, status, admission ownership and fixture recovery after service failure. It does not remove the need for cleanup after machine loss or hard kill. Existing verify services are evidence this architecture is possible, not evidence it is the right run-check contract. [F6; inference]

Proposed direction: retain O15 unless the operator explicitly selects a surviving-run destination. Adding a longer stop timeout or a SIGTERM handler cannot make cleanup reliable under SIGKILL and should not be offered as complete repair.

### K7. What is sufficient cleanup evidence?

- **O17. Recover IDs from stdout.** Already available through `akrogon log` and needs no new protocol. It misses the interval where the API created a fixture but the process died before printing its ID, and cannot prove related Auth, data and photo resources all disappeared. [seed #124 plus F4; inference]
- **O18. Use the approved run-specific naming/marker and authenticated enumeration/absence check.** Handles creation-before-ID-output when the marker was attached during creation and avoids inferring cleanup from a green rerun. Broad markers can include another active run, so grant bounds and run ownership matter. A `pwa-test-` prefix alone is not permission to delete all matching users. [better-than-training: existing fixture schema and review/merge grant rules; inference]
- **O19. Predeclare a fixture manifest/identifier in akrogon.** Makes obligations explicit before the external write, but requires a protocol that existing arbitrary probes do not implement and still needs provider discovery when IDs are server-assigned. This is only justified with O13/O14. [model-knowledge]

Proposed direction: use existing grant marker/naming and absence checks first. Do not parse arbitrary log text into a universal cloud deletion command.

### #124 practitioner questions

- **Q6.** Is the required outcome recovery before retry/phase movement, or guaranteed cleanup even when no seat returns? This missing destination decides the architecture.
- **Q7.** Does the actual grant let a replacement seat enumerate and clean the interrupted run's Auth user, claims, document and photo using an independent cleanup identity? The intake reports an eventual cleanup but does not include that grant.
- **Q8.** How does the real probe identify a fixture if killed after creation but before printing its ID? Is naming unique to the run or only a shared prefix?
- **Q9.** What proves the previous writer has stopped before cleanup, especially for nested checks and binaries that start their own units? The guard removes the admission record before its scope stop finishes, so record absence alone is insufficient. [inspected `startRunGuard`; existing lesson `learnings/LESSONS.md` Chrome self-scoping and pattern-kill entries]
- **Q10.** Must recovery run before any new proof or only before handoff, and how are cleanup failure, expired credentials and intentionally retained resources recorded? A green retry must not discharge the old obligation.

## Pitfalls and what removes them

- **R1.** A timing alarm becomes a merge gate. Remove this by separating warning computation/delivery from existing exit status and receipt eligibility, and prove a slow green run still lands. [D1; `reportRun`, `land`]
- **R2.** A reused, base or incomplete run invents a cheap normal, or a slow plateau erases its origin. Remove this with an explicit cohort and episode/origin policy, proven against seeded receipt histories and the framework step change. [F2–F3; K1–K2]
- **R3.** Repeated concurrent completions double-send or lose a warning. Use the existing receipt lock for atomic evidence/reservation and keep external delivery outside it, as main-red already does. Its dedup identity and recovery logic must be specific to timing. [inspected `runOnce`, `sendMainRedNotice`; inference]
- **R4.** An ordinary live capture is labelled a leak, or a completed run leaves captures between `check_end` and unlink. Separate outcome state, liveness and fixture absence. A missing final `check` line means unknown completion, not proof of leaked cloud data. [F4–F5]
- **R5.** A retry cleans only its own fixture, or a prefix sweep deletes another run's data. Preserve per-run ownership and require authenticated absence for the interrupted run under its original grant. [seed #124, `fixtureSchema`, skill grant rules]
- **R6.** A cleanup gate blocks cleanup itself, or “resolved” means someone deleted the evidence files. If O13 is chosen, design the recovery command/authority with the gate and make resolution depend on absence evidence. Raw capture deletion is not cleanup. [K5; `checkedRun`, `phase.ts:transition`]

## Chart split, proof and external operations

- **A1. Chart #123 separately**, destination: a completed merge verify exposes a material increase against the repo/scope's recent normal and the first observed leaf without changing merge success. Set K1–K4 before handing off. One leaf can own detector, durable evidence and chosen delivery. Splitting delivery away would leave the stated destination incomplete. Reuse `tests/verify.test.ts` receipt/reuse/notice seams and command-owned land scenarios from `tests/green-merge.test.ts`. Prove normal, cold-start, config change, red-first jump, sustained plateau, recovery, incomplete/base/reused exclusions and notification failure only as the chosen policies require. Do not rerun 21-minute framework checks to test arithmetic.
- **A2. Chart #124 separately**, destination chosen by Q6. For O12, one workflow leaf can cover implement, check.review/check.repair and merge recovery using existing grant/evidence contracts. Prove behavior with a realistic interrupted-probe scenario and agent judgment, not exact wording tests. For O13, one leaf must jointly own interruption identity, durable cleanup state, recovery and the chosen boundary gate. Extending `tests/durable-capture.test.ts`, `tests/run-units.test.ts` and `tests/receipt-gates.test.ts` is preferable to inventing a parallel harness. A Firebase-specific probe repair belongs to Klobuk if its cleanup contract is incomplete, not to generic akrogon cloud code.
- **A3. External proof for #123 depends on delivery choice.** Console/receipt computation needs no external account operation. Herdr delivery needs a bounded test-session notice and observation of the intended session, with simulated failure/race tests around it. A Discord path needs the configured target and approved sender flow proven, and must address green command-owned land and red attempts. Do not silently add a new broadcast destination.
- **A4. External proof for #124 must cover the chosen guarantee.** Local run ownership changes require a real isolated systemd user slice: kill only the test wrapper, observe the exact owned unit/descendants, recover or finish as designed, and leave no process. Actual cloud absence requires the existing target repo's grant and cleanup credential, exact account, marker, bounded create/read/delete operations and authenticated read-back covering every fixture resource. A local file fixture can prove interruption bookkeeping but cannot prove Firebase deletion, claims cleanup or photo absence. No grant was supplied here and no such operation was attempted.

## Outside grounding and searches

- **S1. Better-than-training, primary systemd manual:** [systemd.kill](https://www.freedesktop.org/software/systemd/man/248/systemd.kill.html). Default unit termination uses SIGTERM, then can escalate to SIGKILL after the stop timeout. This supports the limited claim that a stop request does not guarantee application cleanup. It does not identify the signal used in the reported incident. Checked through web search `site.freedesktop.org software systemd man latest systemd.kill SIGTERM SIGKILL TimeoutStopSec control-group scope`.
- **S2. Better-than-training, primary GNU manual:** [tail invocation](https://www.gnu.org/s/coreutils/manual/html_node/tail-invocation.html). `tail --pid` checks process liveness periodically. Search: `site.gnu.org software coreutils manual tail --pid`. Important boundary: the existing guard already uses this mechanism. Its existence is not permission to add a fixture watchdog or treat existing code as a new operator exception to D2.
- **S3. Local searches:** function/symbol searches for receipt completion, `notice`, `reuse`, `compares`, captures, `check_end`, `requireGreenReceipt`, fixture/grant cleanup and the phase transition; slowdown/duration/wall-time searches in status, timing-report, watch and broadcast surfaces. These support the bounded findings above, not a claim that every historical chart or every connected repo was inspected.

The unresolved decision with the largest scope effect is Q6: whether #124 promises recovery when work resumes or cleanup even when it never does.
