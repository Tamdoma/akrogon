# Slot B rebuttal

D-unreadable: I revise my earlier position and agree with C for collisions involving an owner with an unreadable or unknown descendant. Reporting an error does not establish that the owner's full leaf set equals another target's set. Previously this collision refused; collapsing it can now dispatch despite the unresolved sibling. Preserve ambiguity refusal when that uncertainty prevents proving equality. This need not change non-colliding owner selection or discovery.

Evidence: `operator` · intake Scope, read 2026-10-21 · acceptance requires matches to select the same leaves. `better-than-training` · src/next.ts resolveName/selectLeaves, inspected 2026-10-21 · owner candidates select from inventory.leaves, while selection can return a nonempty result despite inventory failures. The merged notes' discover error reporting is not a dispatch barrier.

The evidence claim that the leaf side has at most one candidate is too strong. findLeaf refuses duplicates, but resolveName independently filters inventory.leaves and maps every matching leaf. Keep the general all-candidate comparison rather than relying on findLeaf to establish this invariant.

Evidence: `better-than-training` · src/state.ts findLeaf and src/next.ts resolveName, inspected 2026-10-21.

For the remaining “Points where slots differ,” no disagreement: keep the general equal-set rule (D-scope), existing closed-leaf matching (D-closed), and the stated scope limits and parts.md clarification (D-extras).
