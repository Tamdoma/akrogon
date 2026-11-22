# Slot E re-check, round 4

Verdict `fix`, pending the scope decision below.

Chart base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`. Prior reviewed head `0ee30c91a0157e87861171f8c0e2a30b3f78a7ae`. Reviewed repair head `73d36b71757e334a765698f4956930799a827aed`.

**F6 resolved.** The direct seat refusal no longer records a capacity wait, so that refusal cannot make refill open the other review seat. The manual seat contract and `docs/use/run-work.md:54` agree with the current behavior.

**F2 reopened.** With a machine cap of 1, start one leaf and run `akrogon seat waiter A` on a new leaf. The command reports the capacity refusal. Once room opens, `next --wake` still leaves the refused leaf idle. The repair deliberately restores that outcome in `src/next.ts:1257-1261` and asserts it in `tests/pause-next.test.ts:787-798`. `INTAKE.md:19` still commits to refilling capacity-refused leaves. `direct/report.md:26` describes this narrowing as A's call. It records notification to the operator and gives no operator approval. Record the operator's decision to limit refill to `next` refusals, or retain the taken scope and preserve the requested seat and task when a queued seat request runs. The removed test represented F2 and its replacement is appropriate once the narrower scope is approved.

## Verification

- `check slot-e-round4: 0 direct/check-slot-e-round4-1795365790056-2799910.log`. All eight focused feature tests passed on the reviewed head.
- `check slot-e-round4-prior: 1 direct/check-slot-e-round4-prior-1795365798766-2859101.log`. The replacement test failed at the final tab assertion using the prior head's `src/next.ts` in a scratch tree. The scratch tree was removed after the run.
- `git diff --check 0ee30c91..73d36b71` passed. No `AREA.md` changed. `direct/plan.md` remains absent. Slot A owns the full suite and direct verification.
