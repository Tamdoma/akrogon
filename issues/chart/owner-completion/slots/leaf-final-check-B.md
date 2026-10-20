# Slot B focused final-shape check

Against akrogon HEAD `abfee125b4ab68bec34bd73325c077c12c74fc47`, two disagreements remain in the changed `twin-guard/design.md` Leaf architecture section.

## F20. next --all does not use the unpicked branch

The design assigns owner-keyed reporting to “Unpicked twin leaves in next --all” and throwing to picked leaves. However, `src/next.ts:1343` calls `sweep(..., true, false)` for `--all`; `sweepAll` also passes `picked=true`. `sweep` forwards that value to `dispatchLeaf` at `:863`.

Following the specified picked branch therefore throws for every colliding leaf. The existing catch reports by **leaf path and slug** (`src/next.ts:828`), producing multiple errors for a multi-leaf twin instead of the one owner error required by criterion 1. Specify owner-keyed reporting for both explicit selection and `--all`; do not use `picked` to distinguish those invocation forms.

## F21. Applied twin batches do not necessarily require manual recovery

The design says an already applied twin batch needs manual recovery while leaving `reconcileBatch` unchanged. That is not what the retained code does. `mergeTurn` iterates every recorded batch at `src/next.ts:975-977` before consulting `mergeQueue` at `:983`. `reconcileBatch` checks whether the candidate landed and calls `commitMove(..., 'merged', ...)` at `:956`, independently of `eligibility`.

Describe that automatic recovery as retained if leaving the consumer unchanged. Manual recovery is needed only where normal recovery cannot finish. In particular, a closed twin can make completion throw after the merged state is saved, while a parked twin does not trigger completeOwner's closed-destination guard. The new Block alone does not stop these recovery effects. If the intended contract instead forbids them, the recovery path also needs the shared twin check and must be included in owned surfaces.
