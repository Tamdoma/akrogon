# Config walls

## Question

Q1. How should akrogon handle a `worktree_root` that resolves inside the registered checkout, which trips `checkLocation` once the checkout root holds package.json (#114, #115 duplicates)? Candidates from the maps: (a) refuse an in-checkout `worktree_root` at config read, naming the key, and delete init's in-checkout gitignore line and the setup.md sentence that sanctions it (A; C proposes the same refusal at init); (b) keep the key, migrate the consumer to the default store and only clarify docs (B); (c) delete `worktree_root` entirely (tests use it as a fixture seam).

Q2. How should akrogon handle a repo with package.json and no `setup`, where verify's setup step is `akrogon guard own-modules` and always fails (#113)? Candidates: (a) when `setup` is unset, the own-modules refusal names `setup` in issues/config.yaml as the fix (A); (b) derive the installer from the committed lockfile when `setup` is unset (C); (c) no akrogon change, consumer adds `setup` (B).

Q3. One leaf or two?

### Carries

- Lock 2026-10-10, issues/closed/worktree-isolation/worktree-store/design.md, Boundary 2a: leaf worktrees live in one akrogon-owned store outside every checkout; ancestor guard refuses when a canonical ancestor holds node_modules or package.json, or the worktree's own node_modules is missing.
- src/reconcile.ts already treats `<root>/issues/worktrees` as a legacy root (reconcileNeedsPanes, sweep roots); src/next.ts ensureWorktree refuses a recorded path that differs from `<store>/<slug>` with a move instruction.
- Gljive (CastrumS/gljive) is on another operator's machine; akrogon cannot edit its config.

## Findings

Maps: [A](../slots/map-A.md) (G2), [B](../slots/map-B.md) (C4, C5), [C](../slots/map-C.md) (G3). Blind notes: [B](../slots/walls-B.md), [C](../slots/walls-C.md). Merged: [walls-merged](../slots/walls-merged.md). Rebuttals: [B](../slots/walls-rebuttal-B.md), [C](../slots/walls-rebuttal-C.md).

- Research (better-than-training, inspected 2026-10-22 at 92dddada): src/config.ts worktreeStore, setupCommand, readRepo, within; src/guard.ts checkLocation, guard own-modules; src/init.ts writes config before resolving the store and adds an in-checkout .gitignore line; docs/guide/setup.md "worktree_root" bullet; lock issues/closed/worktree-isolation/worktree-store/design.md Boundary 2a (store outside every checkout). No registered repo on this machine sets worktree_root (all 11 `issues/config.yaml` read 2026-10-22), so a refusal has no local blast radius.
- Q1: 1a (A,B,C); placement in worktreeStore (A,C), B accepted it in rebuttal. Symlink-canonical comparison (B,C). Init resolves the store before its first write (B,C).
- Q2: 2a (A,B); 2b `akrogon install` verb deriving the installer from lockfiles (C).
- Q3: one leaf (A,C); two leaves (B).
- Rebuttals: B R1 recovery is not "change config, run reconcile": the legacy-root sweep removes eligible old-root worktrees and clears their recorded paths. B D3 holds two leaves. C D1 holds 2b as the reduce-first option; C D2 receipt matching may key on the setup string (moot under 2a, which changes no command string).

## Taken

Autopilot, A's picks (session cdda5a46, 2026-10-22), not operator words.

- Q1: 1a. `worktreeStore` refuses a store whose canonical path equals or lies inside the registered checkout, naming `worktree_root` in issues/config.yaml, the resolved store and the checkout, and saying to remove the key (default `~/.akrogon/worktrees/<repo>`) or point it outside the checkout. Comparison is on canonical paths: the nonexistent store suffix resolves against its deepest existing ancestor, so a symlinked root or ancestor cannot bypass it; equality and prefix siblings (`/a/repo` vs `/a/repo2`) are covered. `init` resolves the store before writing anything. Delete init's in-checkout .gitignore addition and the setup.md sentence "Only a store inside the checkout is gitignored." Reason: lock Boundary 2a already forbids an in-checkout store; this removes the class instead of guarding a case, and it deletes code. Commands that never resolve the store (status, pull) keep working on a refused repo. No migrator: ensureWorktree's mismatch refusal already names moving a recorded worktree. Rejected: 1b consumer-only migration (class stays armed), 1c delete the key (external overrides are legitimate; 31 test uses), checkLocation at config read (live ancestor state in config parsing), readRepo placement (blocks status/pull on a broken repo). Standing dissent: none.
- Q2: 2a. The own-modules refusal keeps its path and exit 1 and adds that `setup` in issues/config.yaml must install dependencies in each fresh checkout. One unconditional message, true whether setup is unset or failed to install. Reason: the guard is right; only its message hides the fix. One line of change versus a new verb. Rejected: 2b derive the installer from lockfiles (adds a verb, a package-manager mapping and precedence rule in code, docs and skill edits, for a case the init skill already proposes and the message now names), 2c no change. Standing dissent: C holds 2b (moves existing skill prose into code and removes the config copy that went stale).
- Q3: one leaf, one issue. Reason: both changes are small; one lifecycle costs half of two. The two parts are separate commits so either can be dropped. Standing dissent: B holds two leaves (independent acceptance).
- Off-leaf: Gljive's unblock stays its operator's config edits (add `setup`, remove `worktree_root`, move active worktrees). B R1: reconcile's legacy-root sweep is not a lossless move; the close note says so.
