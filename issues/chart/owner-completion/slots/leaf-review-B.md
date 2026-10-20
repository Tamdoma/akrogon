# Slot B leaf draft review

Reviewed both complete draft contracts and the two fork Taken sections against akrogon HEAD `abfee125b4ab68bec34bd73325c077c12c74fc47`. Disagreements below concern `twin-guard/design.md` in the supplied scratchpad.

## F16. The merge-phase exception contradicts the binding decision

The merge-queue consumer says: “if one can, the refusal applies only to leaves not already in `merge`.” Remove that proposed exception. `forks/owner-reuse.md`, Taken, requires refusing dispatch of **any leaf** under a colliding open owner, with no phase exemption. The brief also promises that behavior. A planner cannot weaken it to keep an existing merge running. Preserve existing state and refuse dispatch, with any required operator recovery stated separately.

## F17. Filtering discover alone can block an unrelated merge owner

The consumer statement that excluded twins simply drop out of TURN ordering misses the second queue read in `src/next.ts:1007-1015`. `mergeTurn` first chooses its holder from `discover(...).leaves` at `:983`, then enters the lock and checks the queue again using unfiltered `allLeaves(repo)`.

Concrete failure: a colliding merge leaf sorts ahead of a healthy merge leaf. Filtered discovery selects the healthy leaf, but the locked queue selects the twin, so the holder check returns before creating a batch. The healthy owner never dispatches, contradicting the brief's other-owner guarantee. Name this consumer and require the same twin eligibility rule in both holder selections. The repair fits the existing owned `src/next.ts` surface.

## F18. Dropping merged twins also changes dependency satisfaction

The missing consumer is `blockDetail` / `unmergedDeps` in `src/turn.ts:11-30`, reached with `inventory.leaves` by `dispatchLeaf` in `src/next.ts:784`. If a merged twin is removed from that inventory, a healthy owner's leaf depending on it stops recognizing the prerequisite as merged. `hasLeafFolder` instead labels it unreadable. `mergeQueue` has the same dependency issue through `eligibility` at `src/turn.ts:38`.

Refusing dispatch must not erase a readable merged prerequisite from dependency context. Specify that invariant and cover a healthy owner depending on an already merged twin, alongside the unrelated merge-holder case in F17. Keep the collision predicate in one place while distinguishing inventory needed for dependencies from leaves eligible to dispatch.

## F19. The name-resolution open item is answerable now

`src/next.ts:1177` (`resolveName`) and `:1225-1237` (`selectLeaves`) use the discovered inventory for slug, owner and path selection. Excluding a twin there prevents each route from selecting it. However, merely reporting and filtering it without recording an inventory refusal leaves `unreadable`, `unknown` and `foreign` clear. An explicit slug then throws an additional `Missing leaf`, while a path throws `No leaves match`.

Settle this before handoff: explicit selection must retain the owner-conflict diagnostic without the extra missing-target error. The existing duplicate-slug path already increments `unreadable` when excluding a leaf (`src/next.ts:169-171`), and `selectLeaves` uses that condition to return an empty selection without another error. The new refusal needs equivalent accounting rather than leaving its diagnostic behavior unresolved.
