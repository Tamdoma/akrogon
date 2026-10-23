# Brief: config-refusals

## What

Two repo config mistakes that make `akrogon verify` fail every run get a refusal that names the key to fix.

1. A `worktree_root` whose store resolves to the registered checkout or inside it is refused wherever akrogon resolves the store, naming `worktree_root` in issues/config.yaml, the resolved store and the checkout, and saying to remove the key (default `~/.akrogon/worktrees/<repo>`) or point it outside the checkout. `akrogon init` refuses such a proposal before writing any file and no longer adds a store line to `.gitignore`.
2. The `akrogon guard own-modules` refusal keeps its missing path and exit 1 and adds that `setup` in issues/config.yaml must install dependencies in each fresh checkout.
3. docs/guide/setup.md says the store must lie outside the checkout and drops the sentence that sanctions an in-checkout store.

## Why

Gljive set `worktree_root: issues/worktrees`. Once its checkout root held package.json, every verify, new leaf worktree and merge batch hit `Refusing location: canonical ancestor … holds node_modules or package.json` with no hint that the config key was the cause (#114, #115). The same repo had package.json and no `setup`, so every verify failed with `missing own node_modules` and no hint that `setup` was missing (#113). The worktree-store lock (issues/closed/worktree-isolation/worktree-store/design.md, Boundary 2a) already puts the store outside every checkout; the config never enforced it.

## Done-criteria

1. With `worktree_root` resolving to the registered checkout itself or a path inside it (a relative value such as `issues/worktrees`, an absolute value, and a value reaching the checkout through a symlinked alias), `akrogon config` and `akrogon verify` exit non-zero naming `worktree_root`, issues/config.yaml, the resolved store and the checkout, and `akrogon verify` creates no checkout. Shown by tests in the `test` check.
2. A `worktree_root` outside the checkout is accepted: `~/…`, an absolute external path, and a sibling whose name starts with the checkout's name (`<checkout>2/trees`). Shown by tests in the `test` check.
3. `akrogon init` with an in-checkout `worktree_root` in its proposal exits non-zero before writing issues/config.yaml, `.gitignore` or any other file, and `akrogon init` with any accepted proposal adds no worktree store line to `.gitignore`. Shown by tests in the `test` check.
4. `akrogon guard own-modules` in a checkout holding package.json and no node_modules exits 1 with a message holding the missing node_modules path and naming `setup` in issues/config.yaml; with no package.json, or with node_modules present, it exits 0. Shown by tests in the `test` check.
5. docs/guide/setup.md's `worktree_root` bullet says the store must lie outside the checkout and that akrogon refuses one inside it, and no longer says an in-checkout store is gitignored. The `test` check passes.
6. (A) Lesson retirement: #114 and #115 name the lesson history `learnings/history/2026-10-22-in-repo-worktree-store-guard.md`, absent from origin/main at 92dddada. If that file exists at the leaf's base, the leaf removes its line from `learnings/LESSONS.md` and appends `Applied <YYYY-MM-DD> by <file:line or commit>: worktreeStore refuses an in-checkout worktree_root` to it in the same diff; if absent, the implementation report says so and nothing is written.
