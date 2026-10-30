# Slot B blind notes: killed-run-stop

Independent position, 2026-10-28. Read the permitted intake sections, my own map from `## #124 material forks` onward, and this fork's Question and Carries. No A draft, Findings or other peer notes read. Recommendations below describe proposed behavior, not existing guarantees. No runtime or cloud cleanup proof was attempted.

## Q1 · Promise after interruption

### Pick, reason and cost

**D1. Pick (a): refuse advancement until the returning seat resolves the interrupted run.** Retain containment on wrapper death. Promise recovery before handoff, not eventual external cleanup when no seat returns. A refusal must identify the run and captures and explain the recovery action. Its cost is a liveness mechanism, a durable per-run resolution record and an explicit recovery path, rather than skill prose alone.

Amend “cleans what the pair printed”: captures identify leads, not necessarily every fixture. Require the original grant's bounded discovery, cleanup and authenticated absence check for that run. A creation can succeed before its identifier is printed. A successful retry does not settle the interrupted attempt. This is an inference from the unverified #124 account in `INTAKE.md`, `## Source: Tamdoma/akrogon#124`, not a verified property of the external probe.

### Rejected options

- **O1. (b), survive wrapper death.** It changes execution ownership but cannot guarantee cleanup after machine loss or an uncatchable kill. In this repo, `src/scope.ts` `startRunGuard` deliberately stops the scope after wrapper death, and `src/run-check.ts` `checkedRun` ties admission release and unit stopping to the wrapper's execution path. Changing that contract needs its own admission and cancellation design. Do not make it a prerequisite for this recovery gate.
- **O2. (c), automatic cleanup without a returning seat.** Generic captures do not provide provider credentials or a deletion protocol. The inspected `src/run-check.ts` `checkedRun` records command output and timing, not an external cleanup transaction. Automatic cleanup would add authority, durable ownership and failure handling beyond a phase refusal. The Carries lock also rules out a new hidden watchdog or polling janitor.
- **O3. (d), skill prose only.** Existing instructions already call stopped or killed runs incomplete evidence (`skills/check-issue/SKILL.md`, `## check.review`, stop-run paragraph, and `skills/implement-issue/SKILL.md`, `## implement`, stop-run paragraph). The reported omission was a seat rerunning and handing off anyway. Prose remains necessary to explain recovery, but does not enforce it.

### Evidence, tier, source and date

- **F1. Primary local source, inspected 2026-10-28:** `src/run-check.ts` `spawnLogged` passes capture files directly to the child. `checkedRun` creates the captures before execution, then publishes the combined log and `check_end` and removes the captures after a result returns. Wrapper death can bypass publication and removal.
- **F2. Primary local source, inspected 2026-10-28:** `src/scope.ts` `startRunGuard` removes the admission record before requesting scope stop. `runUnitArgv` configures `TimeoutStopSec=5`. Neither function performs provider cleanup.
- **F3. Unverified incident evidence, dated 2026-10-28:** `INTAKE.md`, `## Source: Tamdoma/akrogon#124`, reports a later green attempt cleaning only its own fixture and the earlier fixture remaining. The wrapper's cause of death is unknown. This supports a recovery obligation, not a claim that this exact failure was reproduced here.

### Pitfalls and what removes them

- **R1. Promise exceeds enforcement.** A phase gate does not prevent a rerun before that phase call or clean resources after permanent seat loss. State that limit explicitly. Require recovery before retry in the skills. A mechanical rerun gate would be an additional scope choice.
- **R2. Capture bytes become the entire fixture inventory.** Remove this by using grant-authorized discovery and absence evidence, including related resources and the creation-before-output interval. If the grant cannot establish ownership or absence, retain the obligation and move to failed.
- **R3. Ordinary red results are mistaken for interrupted cleanup.** Define interruption separately from assertion failure. `src/run-check.ts` `checkedRun` currently publishes and removes captures after returned nonzero results too. That behavior matters to Q2.

### Additional question

**Q4. Is the promise specifically orphan-capture recovery, or must it also retain an obligation when a killed test returns through a surviving wrapper?** The latter needs an interruption outcome rule, not just a search for leftover pairs.

## Q2 · Tell live captures from abandoned captures

### Pick, reason and cost

**D2. Use per-run execution/publication liveness, preferably an on-demand nonblocking lock probe.** A pending capture is abandoned only after neither its execution chain nor its result publisher can still write or finalize it. Establish the per-run lock before exposing the captures, retain ownership without a gap across wrapper/child startup and wrapper death, and release it after final publication or execution loss. Nested runs need their own identity and lifetime, even when they inherit admission. Probe during the command, without a watcher, timeout or age threshold.

Keep the existing owner `.lock` for pack coordination. It cannot provide the per-run answer: `src/run-check.ts` `checkedRun` takes that lock shared for the wrapper and launches a shared-lock execution chain, while `src/pack.ts` `packFolder` takes it exclusively. One active run therefore hides whether another run under the same owner is dead. The cost of D2 is an additional per-run lifetime mechanism and careful startup/publication ordering. This is a design requirement, not a claim that the current lock helper already supplies it.

**The current surface cannot satisfy Q2 as literally written.** `src/run-check.ts` `checkedRun` removes captures after a returned result regardless of its exit code. If a killed test returns a result through that path, there is no leftover pair to refuse. Choose Q4 before implementation: either limit this gate to abandoned captures or retain a recoverable interruption record for killed/stopped execution that publishes a result. Do not infer interrupted cleanup from every nonzero exit.

### Rejected options

- **O4. Capture existence or age.** Existence also describes active execution. Age adds a clock and still does not establish death. The current creation/publication order is in `src/run-check.ts` `checkedRun`.
- **O5. Admission membership alone.** `src/admission.ts` `liveRuns` checks wrapper identity using boot ID and process start time. `withAdmission` returns inherited admission for a nested run without writing its own run record. `src/scope.ts` `startRunGuard` removes a parent record before stopping its scope. Missing membership therefore does not establish that all capture writers have stopped.
- **O6. Owner lock alone.** `src/run-check.ts` `checkedRun` uses one owner lock for distinct captures. An exclusive probe cannot distinguish an abandoned pair beside an active pair, and a blocking probe would wait on the live run.
- **O7. A guessed scope name for each capture UUID.** `src/run-check.ts` `checkedRun` launches nested admission directly through `spawnLogged`, bypassing `startRunGuard` and `runUnitArgv` for that nested run. A nested capture UUID does not imply a corresponding independently created scope.

### Evidence, tier, source and date

- **F4. Primary local source, inspected 2026-10-28:** `src/admission.ts` `withAdmission`, `nested`, `liveRuns` and the `live` predicate distinguish inherited admission from a separately recorded wrapper. They are admission evidence, not complete per-capture writer evidence.
- **F5. Primary local source, inspected 2026-10-28:** `src/flock.ts` `flockHold` owns a helper lock until wrapper death or explicit release. `src/run-check.ts` `checkedRun` additionally launches the execution through shared `flock`. D2 must preserve both publisher and execution lifetime, rather than copy only the helper lifetime.
- **F6. Design inference from F1, F2, F4 and F5, 2026-10-28:** per-run lifetime is needed to distinguish dead and live siblings and nested captures without polling. Exact descriptor inheritance and startup ordering still require an isolated runtime proof.

### Pitfalls and what removes them

- **R4. An unlocked startup interval produces a false dead result.** Require continuous ownership before capture visibility and across process launch. Prove wrapper death during startup, child execution and result publication. A separate lock acquired later by a child is not enough without that ordering proof.
- **R5. Nested parent admission masks a dead nested execution, or the nested wrapper dies while its execution continues.** Give each capture its own lifetime and test both cases. Never equate the inherited token with the nested capture's run identity.
- **R6. Reboot or archive operations erase the apparent obligation.** Locks should become unheld after reboot while pending evidence stays durable. `src/pack.ts` `packFolderLocked` archives all `.log` members and unlinks their plain files, so checking only loose captures lets pack bypass the gate. Inspect pending evidence in both representations, or retain independent durable pending state.

### Additional question

**Q5. Does “live” include a surviving wrapper finalizing a result after its test exits?** Recommend yes, until publication finishes. Otherwise the interval in `src/run-check.ts` `checkedRun` between child return and capture removal becomes a false refusal. Abruptly killed execution still needs the explicit outcome rule in Q4.

## Q3 · Coverage, allowed moves and resolution

### Pick, reason and cost

**D3. Apply to every leaf's own unresolved interrupted runs, regardless of fixture declarations.** Include its worker capture locations. Do not make one leaf's captures block unrelated siblings merely because they share the owner lock. For final owner completion, require all of that owner's pending obligations resolved before irreversible completion work. A capture establishes incomplete recovery evidence, not proof of an external leak. A run with no external mutation can be resolved with that explanation.

Refuse ordinary non-failed seat advancement, including recording one slot's completion and `phase --check`. Keep moves to failed, evidence reads, inspection and authorized cleanup available. Allow operator recovery from failed back into work while preserving the pending obligation. Do not give an operator a general bypass into merge or completion.

Use an explicit per-run resolution action that records the run, recovery account and evidence references while preserving capture names and bytes. Keep resolution evidence durable through pack and owner movement. This is an agent's accountable attestation of recovery, not generic akrogon verification of cloud deletion. Refuse resolution while that run can still write. The cost is a small durable acknowledgment protocol and discovery of packed pending captures. Renaming or deleting captures alone is not resolution.

### Rejected options

- **O8. Only fixture-declaring leaves.** This makes a generic interruption gate depend on declarations that may omit the mutation responsible for the incident. All-leaf coverage also avoids treating an undeclared interrupted mutation as automatically resolved. No claim is made here about the current readiness schema, which was not re-inspected for this exchange.
- **O9. Block failed and all operator recovery.** This traps the seat when credentials or ownership prevent cleanup. `src/phase.ts` `transition` already allows the failed move before `moveGuards` and restricts failed-state resumption to the operator. Preserve that recovery route and retain the obligation on resumption.
- **O10. Delete or rename the pair to clear it.** Deletion loses evidence. Renaming without a recorded resolution changes the trigger without explaining recovery. `src/pack.ts` `packFolderLocked` preserves `.log` members by name and verifies their bytes. Preserve those members and add resolution evidence instead.
- **O11. A later green run or a phase-history entry clears it.** Neither is tied to recovery of the interrupted run. `src/log.ts` `logMove` records phase diagnostics, and `readLog` parses that history. Neither inspected function records per-run fixture absence.

### Evidence, tier, source and date

- **F7. Primary local source, inspected 2026-10-28:** `src/phase.ts` `transition` runs `moveGuards` before check-only success and before partial slot completion. Its failed branch comes first. `moveGuards` currently enforces cleanliness and citations, with no capture recovery gate.
- **F8. Primary local source, inspected 2026-10-28:** `src/phase.ts` `landGates` also calls `moveGuards`, while `commandMerged` calls `commitMove` directly. `commitMove` saves merged state before invoking `completeOwner`. `completeOwner` calls `closeSources` before its exclusive pack-and-move section. A recovery check only in post-commit completion work would be too late to promise refusal before those effects.
- **F9. Primary local source, inspected 2026-10-28:** `src/run-check.ts` `captureOwner` distinguishes holder and issue ownership. `src/pack.ts` `packFolderLocked` combines loose and archived logs. Coverage must follow the leaf's capture locations within that ownership structure rather than treating the lock directory as the affected leaf.

### Pitfalls and what removes them

- **R7. Archived captures disappear from the gate.** Discover unresolved runs across loose and packed evidence and retain acknowledgments across both. Packing must not count as cleanup.
- **R8. A refusal occurs after state commitment, source closure or push.** Place the check in the relevant preflight paths and recheck at the completion boundary before side effects. F8 identifies inspected paths that need coverage. Prove refused advancement leaves state and completion effects unchanged.
- **R9. Recovery acknowledgment invents cleanup authority.** Keep all provider operations within the original grant. Unknown ownership, missing credentials or failed absence evidence leaves the obligation pending and failed available.

### Additional question

**Q6. Should a review return to check.fix remain available during recovery?** My default is failed plus operator recovery, because it already supplies a recovery path without allowing an unresolved run to be handed to another seat. If check.fix is explicitly chosen as a recovery destination, retain the obligation and refuse its later advancement.
