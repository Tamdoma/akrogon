# failed-refusal, slot A notes (blind)

Q1 pick: refuse every leaf- and worker-scoped run while the leaf phase is `failed`; holder/checkout runs untouched; no other phase. Error text: "Refusing run-check for <repo>/<slug>: the leaf is failed (<failure.reason>); recover with akrogon phase <slug> <failure.phase>". Rejected: paid-only (run-check cannot tell paid argv), more phases (no observed case).

Q2 pick: read in `leafTarget` (early) and re-read the leaf state right before the child starts, after admission, following the early/late `ownerRefusal` pattern in `checkedRun` (src/run-check.ts). A refusal appends one timing row (existing `appendTiming`) so it is durable (signpost hard limit C L3).

Q3 pick: leave runs already started; a refusal stops new spending only.

Q4 pick: verify goes through `checkedRun` and is refused the same way; a failed leaf does no work until recovered. Open for the plan: confirm no merge or batch flow verifies a leaf whose phase is `failed`.

Evidence: better-than-training, src/run-check.ts leafTarget/leafFields/checkedRun and src/verify.ts read 2026-11-16; lesson history 2026-11-15-background-wait-fails-leaf.md names this guard.
