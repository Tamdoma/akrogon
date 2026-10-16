# Direct contract re-check B

Base and reviewed code head: `568556b99236a3463e2eec416a625700e8990b06` (unchanged).
Verdict: **fix**.

Scope: only review-B-3 F1's rollout correction in `forks/writer-gate.md` and the Pitfalls in `CHART.md`.

## F1 retained — The rollout still permits pre-barrier admissions during cutover

The Rollout paragraph correctly identifies all commands loaded before `568556b`, including commands started after state-home. However, step 1 only checks a momentary absence of processes. The following text explicitly says “Leaves keep running” and accepts a pre-barrier command admitting during the copy. Running the sequence in one shell script does not exclude launches by those leaves between the check and deployment.

The realistic source remains an installed `83b9279` command, such as `verify`, launched in that permitted interval. Its loaded admission code does not take the new barrier. A record written after the final source check and before destination publication can therefore be missing from the active home. As established in review-B-3, reconciliation can stop the running check's slice while that record is missing. Step 3's later manual copy cannot undo that stop. The claim that the “only harm” is a missing record omits this concrete consequence. Calling the interval seconds or accepting the residual does not resolve F1 under the direct-review Fix bar.

`CHART.md` consequently overstates the result when its Pitfalls says the old-home write is “Removed” by the barrier plus this rollout. The Rollout paragraph itself says it is not prevented.

**Required correction:** exclude launches using the old implementation, drain existing pre-barrier writers, and maintain that exclusion until deployment makes subsequent launches use the repaired barrier, before allowing cutover. State the actual means of enforcing that window in the door's rollout contract. Replace the post-cutover record-recovery exception and align the Pitfalls claim with the corrected sequence. No additional product change is requested.

Verification: read the two requested current contract sections and compared them with review-B-3 F1. Code and test evidence from review-B-3 are unchanged and were not rerun. F2 and F3 remain resolved. No new findings, product edits, deployment, host cutover, commits or phase commands.

Last operation: contract-only direct re-check recorded `fix`; F1 remains open.
Next: chart door corrects the rollout exclusion and returns the contract for B's re-check.
