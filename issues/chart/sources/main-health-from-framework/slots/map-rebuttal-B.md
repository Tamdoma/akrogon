# Main-health map rebuttal, slot B, 2026-10-10

Disagreements only. Read the merged map and its cited code. No lifecycle commands or other mutations were performed.

## R1: Release must invalidate evidence, not certify green

The proposed “moved main releases everyone” loop confuses a new baseline with a healthy baseline. An unrelated code change can move main while preserving the failing behavior. An unhold after a machine repair can leave the SHA unchanged. Both should invalidate the applicable red result and reopen validation, not declare the required commands green or automatically approve waiting leaves. Refreshing AKROGON_BASE alone also does not replace missing leaf evidence.

**Correction:** Distinguish release of a hold from passing verification. Record an explicit invalidation/recovery generation for a same-SHA repair. Resume only leaves dependent on that incident through their normal required checks, and prohibit reuse of the superseded red evidence. Keep command/scope and declared material inputs in the applicability key. A generic environment fingerprint is not a substitute for deciding which inputs affect the result.

**Evidence:** T3, `/home/ivan/Work/infra/akrogon/src/next.ts:1062-1072` drops the existing hold on a content change without executing a health check there. `/home/ivan/Work/infra/akrogon/src/hold.ts:104-110` unhold only deletes the record. `/home/ivan/Work/infra/akrogon/src/phase.ts:142-153` resets phase bookkeeping but records no evidence invalidation generation. Inspected 2026-10-10. The correction is T4 design judgment.

## R2: A lightweight periodic pass cannot detect silent drift by itself

The second difference combines two distinct outcomes. A lightweight periodic pass can notice a lost validation owner or an overdue busy episode. It cannot know that a browser/toolchain or another material input changed unless that input is actually observed or a check executes. “Periodic backstop for silent environment drift” therefore has no proven sensor in the stated lightweight design.

**Correction:** Choose the required detection guarantee explicitly. Event-driven evidence plus periodic reconciliation supplies liveness for recorded state. Detecting otherwise unobserved drift requires a named input sensor or periodic validation, with its execution cost and delay stated. Keep the rejection of unconditional post-merge duplicate verification separate from this decision.

**Evidence:** T3, `/home/ivan/Work/infra/akrogon/src/next.ts:230-258` senses pane status and elapsed recorded busy time, not baseline behavior. Its dispatch observation at `:663-667` likewise observes seats. The merged map itself leaves browser/toolchain versions material in difference 1. Inspected 2026-10-10. Sensor insufficiency is T4 inference from those inputs.

## R3: Confirmation count does not establish a repo-wide base defect

Before isolation lands, two completed runs or a second seat can reproduce the same environment-specific failure without showing that every consumer of the baseline is affected. Repeating the wrong conditions is not stronger attribution. A repo-wide refusal of any base-red failed move merely because some hold exists can also hide a different command, scope or environment failure.

**Correction:** Publish after a completed, attributed comparison under recorded material conditions. Apply reuse/holds only to compatible evidence. A second confirmation is useful only when it resolves a named ambiguity through an independent or corrected condition. Do not impose a vote count, and do not make an unrelated hold block reporting a distinct failure. More than one incident must remain representable if required commands fail for different reasons.

**Evidence:** T3, the current hold is one record per repo (`/home/ivan/Work/infra/akrogon/src/hold.ts:10-18,55-60`) with command and SHA but no execution-condition identity. Current publication verifies the fetched SHA (`/home/ivan/Work/infra/akrogon/src/phase.ts:844-863`), not every condition's equivalence. The merged map's own live-state and key discussion distinguish the C8 environment condition from motion-probe. Inspected 2026-10-10. The proposed attribution and applicability rule is T4 judgment.

## R4: Do not attribute “measure PSI before a limiter” to B, or claim dispatch prevents a release surge

My position is that command admission and health deduplication are separate outcomes. PSI can inform capacity research, but it does not count admitted heavy commands and is not an established prerequisite for deciding the admission contract. Releasing through ordinary dispatch does not by itself remove the bulk-load pitfall: existing seats can all start heavy checks after release.

**Correction:** Keep #69 explicitly partial unless actual heavy commands receive admission. A shared tick for observation is compatible with separate outcomes, but a tick is not a limiter. Do not mark the release-surge pitfall removed solely by normal dispatch.

**Evidence:** T3, `/home/ivan/Work/infra/akrogon/src/next.ts:336-367` counts active leaves and applies max_active when allocating a new tab. `/home/ivan/Work/infra/akrogon/src/next.ts:1059` samples pressure for a merge attempt, not as an admission decision. Inspected 2026-10-10. The distinction between a resource observation and admission is T4 judgment.

## R5: Path overlap must not automatically nominate a fix, and nomination is not proof it will merge

“A merge-queued leaf whose diff touches the failing path becomes the fix automatically” is too weak. An edit can touch that path without repairing the cause. The safe automatic candidate needs actual repair evidence or a deliberate nomination, not path overlap.

On the merged map's reported state, **`akrogon hold-fix page-measure-full-id` is a bounded nomination through the existing mechanism**. It preserves the hold and names its fix. The command validates a live hold and merge-queue membership under the lock. It does not push, bypass verification or clear the hold. An active first queue member's batch can still take precedence. This supports nomination, not the claims “it waits only because nobody ran hold-fix” or “the mechanism would have merged it around 14:47.” Those outcomes depend on the subsequent live merge attempt, current inputs and its checks. I did not independently read live state or execute the command because this brief is read-only.

**Correction:** Say nomination opens the existing repair attempt while its normal gates remain required. Preserve hold-fix as the deliberate action unless a stronger automatic-fix criterion is selected and proven. Remove the asserted historical merge time and sole-obstruction claim.

**Evidence:** T3, `/home/ivan/Work/infra/akrogon/src/hold.ts:90-101` performs the nomination only. `:83-87` preserves active-batch precedence. `/home/ivan/Work/infra/akrogon/src/next.ts:1044-1049,1062-1076` admits the nominated holder while keeping other held work out and suppressing carried members for that held fix. Inspected 2026-10-10. Sufficiency of path overlap is rejected as T4 judgment.

## R6: A global lock prevents interleaved writes, not stale or destructive publication

The concurrent-writer pitfall is not fully removed by placing writeHeld under a lock. A second reporter can acquire it later and overwrite a newer result, a fix nomination, or another command's incident. Serialization does not decide which result remains applicable.

**Correction:** Re-read and compare the tested baseline/input identity when publishing. Preserve a nomination for the same incident, reject obsolete publication, and explicitly settle how a second incident is retained. Do not let a later stale reporter reset recovery.

**Evidence:** T3, `/home/ivan/Work/infra/akrogon/src/hold.ts:59-70` replaces the repo record; locking is around that replacement. `/home/ivan/Work/infra/akrogon/src/phase.ts:857-864` constructs a fresh record without fix or a publication generation. Inspected 2026-10-10. The stale-writer scenario and remedy are T4 inference/design.
