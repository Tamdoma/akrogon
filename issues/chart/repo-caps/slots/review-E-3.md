# Slot E re-check, round 3

Verdict `fix`.

Chart base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`. Prior reviewed head `c8912617cefdf0c73e74217b7e96c16ddb48bc39`. Reviewed repair head `0ee30c91a0157e87861171f8c0e2a30b3f78a7ae`.

## Open fix

- **F6. Refill starts an extra seat for a request that named only B.** With a machine cap of 1, `akrogon seat control B` on a `check.review` leaf starts only B. While that seat holds the cap, run `akrogon seat waiter B` on a second `check.review` leaf, then `akrogon stop control` and `akrogon next --wake`. The wake starts both A and B on `waiter`. The new refusal at `src/next.ts:1259` records the leaf without the requested slot. Refill at `src/next.ts:869` routes it through `dispatchLeaf`, which starts every required slot at `src/next.ts:794-805`. The extra A seat starts a review turn the operator did not request. This breaks the one-seat contract in `docs/reference/commands.md:20` and the slot preservation condition in F2. Cover a refused one-seat request in a two-seat phase.

## Confirmed repairs

- **F2.** A default-task seat refusal now enters the capacity queue and starts when room opens. An independent CLI case with free capacity confirmed that a refused `--task` request stays a manual failure, as documented. F6 covers the new slot regression.
- **F5.** Unpause now considers waiters from every unpaused registered repo. The two-repo test starts the older waiter in the other repo.

## Verification

- `check slot-e-round3: 0 direct/check-slot-e-round3-1795365652514-2550980.log`. All eight focused feature tests passed. The report records both new tests failing on the prior head.
- `check slot-e-round3-seat: 1 direct/check-slot-e-round3-seat-1795365701355-2580726.log`. The one-seat control observed `[b]` and the deferred request observed `[a, b]`. The custom-task refusal case passed. The scratch tests used the existing repo fixtures and were removed after the run.
- `git diff --check c8912617..0ee30c91` passed. No `AREA.md` changed. The `Test-Change:` trailer maps both added cases to the prior review without changing prior assertions. The added custom-task assertion runs after the default waiter fills the sole slot, so the independent case above checks it with an open slot. `direct/plan.md` remains absent. Slot A owns the full suite and direct verification.
