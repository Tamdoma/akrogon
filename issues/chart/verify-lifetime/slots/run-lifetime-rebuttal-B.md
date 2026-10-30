# Slot B disagreement-only rebuttal

## Q1 · who keeps the run alive

**B1. Withdraw 1b as the primary lifetime fix.** My earlier recommendation changes caller behavior but does not preserve a run when its caller dies. The existing instruction already asks for foreground execution and a sufficient tool timeout. Replacing it may help usage, but cannot deliver the lifetime guarantee in 1a. The merged notes should no longer present another instruction change as my sufficient solution.

Evidence: observed transcripts, 2026-10-19, identical-ignored Pi session `01a15527-165e-724b-9bb1-eb29f6c92fed`, calls/results 147–154: omitted timeout, two kills, explicit 900, then omitted timeout again. Inspected source, 2026-10-27: `skills/implement-issue/SKILL.md`, Shared context, “Wait on exit”; Pi extension `tamdoma-pi-tweaks/shell-timeout.ts` already gives the same warning.

## Q2 · repeat call and cancel

**B2. Carrying the caller scope alone does not make stop-run cancel a detached verification.** Today it stops an admitted check's scope and guard, not the outer verify process. `runOnce` continues through later sequential checks after a nonzero result. Between checks there need not be an admission record at all. A detached service also cannot rediscover the original pane scope merely by calling `callerScope()` inside the service. The design needs explicit original-owner propagation and cancellation of the complete pass, including waiting and between-check states. That full-pass ownership must also protect a detached service from leaf-slice reconciliation after pane loss.

Evidence tier: inspected code and control-flow inference, 2026-10-27. Sources: `src/stop-run.ts:stopRunCommand`/`matched`; `src/admission.ts:callerScope`/`withAdmission`; `src/verify.ts:runOnce`; `src/reconcile.ts:sliceKeepReason`/`stopSlice`. The existing real-unit test “stop-run stops only the caller pane scope runs” in `tests/run-units.test.ts` explicitly refuses another scope and callers without a scope. No detached-verify cancellation was exercised.

**B3. The proposed join key does not fully define which live runs may share ownership or known-red evidence.** A second pane joining the first pane's run cannot cancel it under today's scope check. Separately, two known-red comparisons can need the same base tree and commands but different `compares` links. Returning one shared base receipt does not satisfy both comparisons: `knownRedReceipt` requires `baseRun.compares === head.run` and the exact merge-base SHA. Restrict joins to compatible ownership/comparison contexts or specify how each request retains its own evidence link and cancellation rights. Do not weaken completed-receipt gates to make joining work.

Evidence tier: inspected code and concrete-case inference, 2026-10-27. Sources: `src/stop-run.ts:stopRunCommand`; `src/verify.ts:runOnce`, `verify`, `knownRedReceipt`. Also, `reuseSource` is per-command reuse, whereas `greenRun` uses the complete command set. Calling both a single reuse key hides this distinction.

## Q3 · receipt with no end

none

## Evidence

**B4. The journals do not prove termination was caused by startRunGuard.** They prove scopes ended near the caller stops. For the inspected identical-ignored run, the guard's stop command fails because the scope is already unloaded. Attribute the timing to the journal, and leave the successful killer unproven.

Evidence tier: observed journal, event 2026-10-19, rechecked 2026-10-27. Source: `journalctl --user --since '2026-10-19 17:24:00 UTC' --until '2026-10-19 17:29:00 UTC'` for `akrogon-run-5e9e2ddc-d082-4316-8fc1-529aedf5e247.scope` and its `-guard.service`: scope ends at 17:26:30 UTC; guard reports “Unit ... not loaded” and exits status 5. This does not disprove the guard's general cleanup function.

## Pitfalls and what removes each

**B5. withAdmission does not remove host overload from detached runs.** It serializes only configured `full` checks, separately for each repo. Other checks start immediately, and different repos can run full checks together. Preserve that existing policy, but do not describe it as a general host bound. Detachment and joining need their own evidence that waiter loss does not multiply equivalent active runs.

Evidence tier: inspected code, 2026-10-27. Sources: `src/admission.ts:withAdmission`, `awaitLineTurn`, `lineRuns`; `src/verify.ts:runOnce` runs merge members concurrently. A new host-wide limit would be separate scope.

Other listed pitfalls: none.

## Where slots differ

B1 supersedes my earlier Q1 preference. B2–B3 remain unresolved design requirements for 1a/2a.
