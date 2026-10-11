# Worktree location: blind notes B

## Q1. Where do leaf and base checkouts live, and what happens to existing worktrees?

### 1. Pick, reason and cost

D1. Pick both: an external default plus enforcement of the same location rule for explicit configuration. A simple default is a sibling directory named `<checkout-basename>-worktrees`, with leaves beneath it. For framework that is `/home/ivan/Work/infra/tamdoma/framework-worktrees/<slug>`. Preserve custom external roots. Resolve the actual filesystem location and reject a root inside the registered checkout, including a symlink that points back inside. If a registered checkout itself lies inside another registered checkout, the chosen root must also avoid that checkout. A sibling default that fails this rule needs an explicit external root, not a silent fallback.

This removes the reported parent lookup into main without containers, dependency rewriting, a new global storage setting or automatic migration machinery. Cost: a small path-boundary check and a one-time move for repositories using the old layout. This is protection against checkout ancestry, not a promise that every filesystem read is isolated.

D2. Keep fresh detached base checkouts under the exported leaf `$TMPDIR`, using the existing `mktemp -d` allocation and cleanup. Today its normal location is already `/tmp/akrogon-<uid>/<leaf-and-hash>/`, outside main. Require the actual temporary location to obey the same checkout-ancestry boundary. An `AKROGON_LEAF_TEMP_ROOT` override inside a registered checkout is invalid for this purpose. Standalone or direct seats must establish an external `$TMPDIR` before allocation too. Do not put bases under the leaf checkout or share its installed dependencies. The comparison still requires equivalent material conditions and a fresh base run, not identical absolute paths.

D3. Change framework's explicit `worktree_root: issues/worktrees` to `../framework-worktrees` as a coordinated rollout step. Changing the default cannot affect that explicit value. The akrogon repository also explicitly uses `issues/worktrees` and needs the same treatment for its own deployment. Handle existing worktrees once, outside the dispatch algorithm: when no seat or check is using an affected tree, move it with Git, reconcile the corresponding `state.worktree`, and restart seats with the new working directory. Preserve its branch, HEAD and dirty contents. Do not move a directory under a running process. Do not grandfather nested worktrees and call isolation complete.

Owner: the rollout operator. Status: pending. The chart must explicitly include or authorize these repository configuration and migration steps before claiming the live problem removed. Until then, current worktrees retain their exposure. This brief authorizes notes only, so no config or worktree was changed here.

### 2. Rejected options

- O1. Default only: framework and akrogon both pin the old root, and existing recorded paths remain unchanged.
- O2. Per-repo config only: fixes today's consumer but leaves the defective layout as the next initialized repository's default.
- O3. Under `globalHome()` by default: that function defaults to the tool repository itself. For akrogon's own leaves this repeats the same ancestry defect.
- O4. Automatic moves, silent path overrides or permanent acceptance of old nested trees: adds runtime migration behavior, risks live working directories, or leaves the claimed defect present. The current explicit path-mismatch error is useful during a deliberate migration.
- O5. Fix C8 or alter module lookup instead of placement: consumer test repair is outside this chart and leaves other parent-folder lookups exposed.

### 3. Evidence

Read on 2026-10-10.

- operator: this brief's complexity correction and requested smallest change. `INTAKE.md`, #76 reproduction, reports parent `node_modules` changing C8 behavior. This is a reported observation, not a fresh reproduction by B.
- better-than-training: `src/config.ts:42,172-177,232-245` defines the nested default, tool-root global home, inconsistent tilde expansion surfaces, and the already external normal leaf temp root. `src/next.ts:413` exports that scratch path as `TMPDIR`. The claim that base allocation has no location today is therefore too strong: the skills prescribe `mktemp` under that exported path.
- better-than-training: `skills/check-issue/SKILL.md:63` and `skills/implement-issue/SKILL.md:38` allocate detached bases with `mktemp -d`, install independently and remove them. The settled comparison and base-evidence-reuse forks require equivalent conditions and fresh counterpart evidence.
- better-than-training: framework `issues/config.yaml:3` and akrogon `issues/config.yaml:3` explicitly set the nested root. `src/next.ts:276-307` rejects a recorded path differing from the configured one. `docs/guide/setup.md:77` already requires reconciling checkout and recorded paths before dispatch after a root change. `src/next.ts:747-754` cleans completed trees using recorded paths.
- better-than-training: `src/sync.ts:17` expands paths while `src/config.ts:233` and `src/init.ts:60` use plain resolution. Any selected root must have one effective interpretation across config, allocation, initialization and sync.
- better-than-training: [Node module resolution](https://nodejs.org/api/modules.html#loading-from-node_modules-folders) walks parent directories. This supports the ancestry mechanism, not a claim about all Bun behavior. [Git worktree documentation](https://git-scm.com/docs/git-worktree) provides move/list/repair operations and says linked trees containing submodules cannot use `worktree move`. Neither source proves a live consumer migration safe.

No consumer worktree inventory was inspected. The permitted consumer context names only its config, so the number, dirtiness and current users of its live trees remain unverified.

### 4. Pitfalls and their removal

- R1. A lexical external path resolves through a symlink back into main. Validate the real destination ancestry at the shared allocation boundary, including existing parent directories for a new destination. Use the same rule for base temp placement.
- R2. A config-only switch strands existing leaves at the path-mismatch check. Inventory Git worktrees and lifecycle paths, quiesce their users, reconcile both before resuming dispatch, and verify branch, HEAD, contents and the restarted working directory. Unsupported moves remain a rollout blocker rather than forcing deletion or inventing a fallback.
- R3. Moving a leaf changes its environment. Rerun required checks and any changed/base comparison after migration. Do not use pre-move red evidence for acceptance. Verify setup and the existing deliberate `.env` link still work externally.
- R4. Two same-named checkouts or a custom root collide. A sibling derived from the registered checkout avoids ordinary same-parent collisions. Existing Git identity checks remain necessary for custom roots. Do not weaken adoption checks to accommodate migration.
- R5. The implementation tests only the configured string. A functional fixture should place a dependency only in main, show nested lookup reaches it, then show both external leaf and base cannot resolve it through that main ancestor. Also exercise a nested explicit root, a symlink into main and an external custom root. No production module monkeypatch is needed.

### 5. Questions not asked

Q2. Does the approved handoff include changing framework's config and reconciling its live worktrees, or is that a named operator prerequisite? The destination is akrogon and fixing consumer checks is excluded. The migration responsibility must be explicit.

Q3. Will the rollout wait for current trees to finish, or quiesce and migrate them? Waiting is a deployment choice, not a new leaf health wait state. Either choice must identify when existing nested trees cease being used and isolation can be verified.
