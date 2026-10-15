# Slot B: leaf draft disagreements

Reviewed the named drafts and Taken against origin/main `38d7a95722540ea3da8a9de1913d8d88431b4091`. The supplied worktree is clean at `ae5ce87821dab514215223bcfb21d3710db5fb96`, containing the committed leftovers change, rather than the older base named in the brief. No tests or live mutations run.

## F1: plain removal and force removal are conflicting contracts

Evidence: `issues/chart/live-worktree-guard/forks/removal-rule.md:15` requires every store deletion to use plain `git worktree remove`. The draft `worktree-keep-rule/design.md:10` copies that decision, but `design.md:41` preserves scratch-copy-removal's single-force removal, and `brief.md:12` assigns force removal to that leaf. Its existing contract explicitly requires force removal of an untracked worker copy (`issues/open/worktree-cleanup/scratch-copy-removal/brief.md:14`, `design.md:19–21`). A single force refusing a lock proves lock protection, not compliance with the separate plain-command requirement. Landing order cannot satisfy both contracts.

The late store-sweep edits match Taken: `issues/open/worktree-cleanup/store-sweep/brief.md:4,18–19` and `design.md:35–36` correctly move display to leftovers, restrict prefix ownership to unregistered entries, and retain plain removal and lock protection. Store-sweep's own narrowed scope remains deliverable. The combined contracts remain inconsistent while its prerequisite scratch-copy-removal must force-remove the same registered kinds.

Exact replacement for draft `design.md:41`:

> Registered scratch copies obey the same plain-removal and lock rules as every other registered store worktree. The door must reconcile scratch-copy-removal's conflicting force-removal criteria and binding decisions before handoff; landing order does not resolve that conflict, and the implementer must not choose which contract to violate.

Replace the final clause of draft `brief.md:12` with:

> All these removals use plain `git worktree remove`; no criterion requires bypassing its dirty-worktree refusal.

If single-force removal of unlocked scratch copies is intended to survive, the door instead needs an explicit correction to Taken and the matching store-sweep line. Do not silently infer that exception from proof P1.

## F2: the draft both removes and keeps an unrecorded batch

Evidence: draft `brief.md:12` removes a batch that no leaf records and no live owner record keeps. Draft `design.md:31` then calls that same batch unmanaged when it has neither an attempt nor a builder record. Its first batch rule also uses absence from `state.batch` as sufficient, without requiring a dead builder. On the inspected base, `src/batch.ts:115–116` creates a randomly named copy without an owner record, and `src/batch.ts:117–153` uses it while building. An absent record is therefore not yet proof of a finished builder. The promised producer has not landed.

Exact replacement for the batch clause in draft `brief.md:12` and the batch rule in `design.md:31`:

> A batch copy is removable under this leaf only when its builder owner record exists and proves the builder dead; a live owner keeps it, and an absent owner record keeps it as unmanaged. Before scratch-copy-removal delivers its owner-record producer, this leaf keeps unrecorded batch copies.

Also replace the final coordination sentence in draft `design.md:41` with:

> Before handoff, the door reconciles scratch-copy-removal's missing-record outcomes with this leaf's classification: its brief criteria 4 and 9 currently require removal of recordless batch and verify copies, while this design keeps both as unmanaged; neither leaf may leave that choice to landing order.

The latter conflict is explicit in `issues/open/worktree-cleanup/scratch-copy-removal/brief.md:13,18` and `design.md:27,77`. The conservative replacement above makes the new leaf independently implementable, but changing those existing outcomes still needs a recorded contract correction by the door.
