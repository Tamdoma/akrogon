# Cleanup after release: B rebuttal

Read only the merged notes for this round. Source evidence below is retained from the independent map reads.

## Q1 Where does cleanup follow the batch release?

R1. **Disagree that the release-point option is established safe in every caller.** Lock nesting is not the remaining problem. `src/next.ts`, `mergeWake`, also runs from a phase command. `src/phase.ts`, `phaseCommand`/`transition`/`commitMove`, can leave a seat-owned holder merged with its batch retained and no command-owned broadcast handoff. `reconcileBatch` can release that batch during the reporting seat's own wake. Calling `reconcileRepos` there makes the still-running reporting seat eligible for teardown.

`src/reconcile.ts`, `closeTabOf` → `closeLeaf` → `endSeats`, ends the recorded A and B terminals. `endFinishedSeats` also calls `endSeats`; its name does not mean it verifies the seat has finished. Neither path checks whether the caller is executing inside that terminal. `sliceKeepReason`/`reconcileHost`'s own-slice veto protects the slice stop, not these terminal calls. The result can terminate the phase command or the merge seat before its remaining completion work. `tests/batch-dispatch.test.ts`, `a green merge clears the record once the holder lands`, explicitly expects phase completion to clear the batch without closing the holder's own tab.

This matters even if the new call is limited to command-owned releases: it sweeps the whole repository, so another eligible merged leaf may be the phase caller. Restricting the released holder alone does not prove that all other teardown candidates are safe.

Keep the release-point option open only with a concrete answer for caller-owned seats. Do not label it safe merely because `landAlive` passed for the released holder. In a land-unit caller, that gate prevents releasing that same active command attempt, and the own-slice veto protects the caller's slice during a sweep. Those facts do not establish safety for phase-seat callers.

R2. **Disagree with “clear at the merged move also misses the recovery route” as a general rejection reason.** `src/next.ts`, `reconcileBatch`, calls `commandMerged` for the merge-holder recovery route. `src/phase.ts`, `commandMerged`, calls `commitMove`, as does the normal land path through `landPush`/`batchPush`. Clearing at that shared move could cover both routes. A patch limited to normal land completion would miss recovery, but that is a narrower implementation. The live-land and follow-up-work objections remain, so this correction does not endorse early clearing.

No disagreement with the other options' stated coverage and tradeoffs. No disagreement with the separate-stage option remaining disfavored, although the notes attribute a definitive rejection to B where my map required a concrete benefit before adding it.

## Q2 Proof

R3. **The proposed release-ordering tests are appropriate but insufficient for the proposed shared release-point call.** Both start from an external pass with the land unit inactive. They cannot detect R1.

Keep those red/green tests and add caller-safety proof before choosing this placement. At minimum, retain the existing batch-dispatch test's no-tab-close assertion during seat-owned phase completion. Also exercise a phase wake executing from a recorded seat while release of another holder causes the proposed repo-wide cleanup. The reporting terminal must finish its authorized completion work, and the phase command must return successfully. Use the existing isolated hc fixture and stand-in task hook, not the operator's session.

If preserving the caller requires excluding or deferring cleanup, prove the command-owned reported case still cleans in its one releasing invocation. Do not fix R1 by restoring the original dependency on an unrelated later pass.

No disagreement with the primary closed-holder test, the second recovery-route test, first-invocation assertions, or retaining the existing fetch-failure, live-attempt and broadcast guards.

## Pitfalls

No disagreement with fresh inventory, non-nested locking, pause/mode preservation or the open-owner distinction. Add R1: own-slice protection does not protect the caller's terminal from `endSeats`.

## Points where slots differ

The release-point call is a candidate, not an option B has independently established safe. B's shared-boundary option did not specifically endorse calling full repository reconciliation inside every locked release. R1 is the material unresolved difference.
