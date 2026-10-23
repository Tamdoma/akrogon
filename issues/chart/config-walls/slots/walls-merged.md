# Walls: merged notes (A merge of slots/walls-A view, walls-B.md, walls-C.md)

## Q1 in-checkout worktree_root
- 1a refuse a store equal to or inside the registered checkout, naming `worktree_root` in issues/config.yaml, the resolved path and the external default; delete init's in-checkout .gitignore branch (src/init.ts additions) and the setup.md sentence "Only a store inside the checkout is gitignored" (A,B,C). Reason: lock worktree-store Boundary 2a already says the store lives outside every checkout; the config value only passed while the checkout root lacked package.json, and #115's trigger was a checkout move, not a config edit. Cost: in-checkout test fixtures (config.test.ts, init.test.ts, possibly sync/next) switch to external paths; Gljive's operator must remove the key and move active worktrees.
- Placement: in `worktreeStore` (A,C), the funnel every store consumer passes (next, verify, batch, config, reconcile, init); commands that never resolve the store (status, pull, chart) keep working on a broken repo, so recovery stays possible (B's pitfall). B proposed readRepo plus init proposal validation; init calls worktreeStore after writeRepoConfig today, so init must resolve the store before its first write (B).
- 1b migrate consumer + docs only: rejected, leaves the class armed (A,B,C).
- 1c delete worktree_root: rejected, external overrides are legitimate and 31 test uses are a fixture seam (A,B,C).
- Not chosen: run checkLocation on the store at config read: drags live ancestor state into config parsing (C); the creation guard stays for external-ancestor cases (B).
- Pitfalls: lexical `within` misses symlink aliases; compare canonical paths, including a nonexistent store under a symlinked ancestor; cover equality and prefix siblings (B,C). Done-criteria carry this. Existing in-checkout worktrees: ensureWorktree's mismatch error already names the move and reconcile already sweeps the legacy root; no migrator (A,B,C). The refusal text names the recovery: remove the key (or point it outside), then move active worktrees (B).

## Q2 package.json without setup
- 2a own-modules refusal names `setup` in issues/config.yaml as the remedy; one unconditional message ("configure or fix setup"), true whether setup is unset or failed to install; path and nonzero exit kept (A,B). Cost: diagnostic only; consumer still edits config.
- 2b derive the installer from committed lockfiles at run time via a new `akrogon install` verb when setup is unset (C). Reason: config duplicates what the tree says and went stale. Cost: new verb, lockfile->installer mapping moved from init skill prose to code, precedence rule, skill trim, docs.
- 2c no change (rejected A,B,C).
- Differ: C picks 2b; A,B pick 2a (2b adds package-manager policy the explicit setup key already covers; operator asked to reduce code first).
- Pitfalls: own-modules also runs after a configured setup, so message must not claim setup is absent (B). Do not create empty node_modules as a fix (B). Setup-red runs stay ineligible for receipts (B).

## Q3 split
- One leaf, two separable commits (A,C): both diffs are small; one lifecycle instead of two.
- Two leaves (B): separate acceptance; fixing either leaves the other failure intact.
- Proof boundary: the leaf proves framework behavior; Gljive's end-to-end unblock is its operator's config edits, outside the leaf (A,B,C).

## Open questions
- C: should `akrogon config` print the refusal instead of throwing? A: no, it throws like any other config error; one path.
