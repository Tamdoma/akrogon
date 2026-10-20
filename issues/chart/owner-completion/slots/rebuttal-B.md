# Slot B disagreement-only rebuttal

- D2, shared-source witness: I still prefer the triggering-leaf slug over an owner-name exception. It keeps one attribution rule for private and shared sources and uses the existing leaf input. The contract must say it identifies the completion trigger, not every contributor or a landed commit. Different retry order can produce a different trigger, which this meaning permits.

- R7, owner-reuse pitfall: “the guard fires before any log exists” is too strong. Dispatch refusal prevents further work after detection. It does not prove a colliding owner never ran before the guard was installed or before a closed twin appeared. The merged notes themselves record 708 existing logs. Any repair involving a rename must check recorded paths rather than infer their absence from the new guard. This does not select a stuck-repair route.

- F9, attribution corrections: Remove B from the claims that the two live EPIC.md files differ and that today's triggering HEAD “may be a pre-rebase tip.” I did not compare those files or establish that landing-path claim. B supports the existence of both owners and the fact that closeSources reads the triggering leaf's worktree HEAD. Keep the additional claims attributed to seats that checked them.
