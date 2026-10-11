# Plan: worktree-store

Debate off (`debate: "no"`); synthesized directly from brief and locked design. check-env is merged, so `withSetup` and `akrogon run-check` exist in this worktree and are consumed, not rebuilt.

## Read first

- `src/config.ts` — `repoSchema.worktree_root` (line 42), `expandPath` (194), `worktreeStore` (250), `withSetup` (274), `effectiveConfig` (298)
- `src/next.ts` — `ensureWorktree` (277), `linkEnv` (312), `allocate` (357), dispatch worktree path (713)
- `src/batch.ts` — `buildStack` (93), `leafTemp` usage (95)
- `src/run-check.ts` — composed env the wrapped command runs under; `leafTarget` leaf/holder resolution
- `src/akrogon.ts` — verb parse/dispatch (~line 140), Usage string (165)
- `src/sync.ts` — `worktree_root` exclusion (17, 109-114)
- `src/init.ts` — gitignore `worktree_root` line (60-62), `writeRepoConfig` (7)
- `tests/helpers.ts` — `fixture`, `cli`, `printedChecks`, `fakeAkrogon`
- `tests/config.test.ts`, `tests/next.test.ts`, `tests/run-check.test.ts`, `tests/batch-merge.test.ts`
- `docs/reference-index.md`, `README.md` command table, `docs/guide/setup.md`

## Decisions

- D1 `repoSchema.worktree_root` becomes `text.optional()`. `worktreeStore(repo)` returns `expandPath(repo.config.worktree_root, repo.root)` when set (so `~/x` home-expands and relative paths keep resolving at the repo root) and `resolve(homedir(), '.akrogon/worktrees', repo.name)` when unset. `homedir()` reads `HOME`, so fixture subprocesses stay isolated. `effectiveConfig` keeps printing the resolved `worktree_store`.
- D2 New exported helper in `src/next.ts`: `createSparseWorktree(repo, path, ref, opts)` where `opts` is `{ detach?: boolean; branch?: string }`. Sequence: `git worktree add --no-checkout [--detach | -b <branch>] <path> <ref>`, then `git -C <path> sparse-checkout set --no-cone '/*' '!/issues/'`, then `git -C <path> checkout`. It calls `checkLocation(path)` before allocation, so every caller is guarded in one place. The registered checkout is never made sparse.
- D3 New `src/guard.ts`: an `offendingAncestor(target)` walk that skips nonexistent literal parents, canonicalizes the deepest existing ancestor with `realpathSync`, and returns the first canonical ancestor (target excluded) holding `node_modules` or `package.json`, or null at filesystem root. `checkLocation(targetPath)` throws naming that ancestor. `guard ancestors` runs the walk on `git rev-parse --show-toplevel` of cwd; `guard own-modules` refuses when `<toplevel>/node_modules` is missing. Each prints the offending path to stderr and exits 1; exit 0 otherwise.
- D4 `withSetup` composes exactly: `akrogon run-check --name <n> -- sh -c 'akrogon guard ancestors && flock <git-path akrogon-install.lock> sh -c <quoted setup> && akrogon guard own-modules && <cmd>'`, and without `setup`, `sh -c 'akrogon guard ancestors && akrogon guard own-modules && <cmd>'`. Order: run-check env, ancestor guard, locked setup, own-modules guard, command.
- D5 `src/akrogon.ts` gains `case 'guard'` dispatching `positionals[0]` of `ancestors|own-modules` to `src/guard.ts`, setting `process.exitCode`; Usage string gains `guard`; `README.md` command table gains the row and `tests/command-reference.test.ts` gains the contract `guard: '<ancestors|own-modules>'`.
- D6 `src/batch.ts` `buildStack` creates its detached checkout through `createSparseWorktree(repo, resolve(worktreeStore(repo), 'batch-' + attemptId()), builtOn, { detach: true })`, still removed in `finally`.
- D7 `src/sync.ts` exclusion uses `worktreeStore(repo)` instead of `expandPath(repo.config.worktree_root, repo.root)` (field becomes optional).
- D8 `src/init.ts` gitignore check uses `worktreeStore(...)`; the existing `within` guard already writes no line for an outside store. `writeRepoConfig` writes parsed config, so an absent `worktree_root` stays absent and new repos take the home store.
- D9 Fixture changes: `cli()` passes `HOME: f.home` (required for `~` store resolution and `~/.bunfig.toml` isolation inside run-check). The fixture `issues/config.yaml` keeps `worktree_root` unset so dispatch exercises the default `f.home/.akrogon/worktrees/repo` store broadly; tests that need a different root set `worktree_root` explicitly per case. Tests that write under `issues/` inside a worktree (phase stray-artifact cases, status snapshot) keep full worktrees by creating them with `git worktree add` directly, or read records from the registered root.
- D10 Manual `git worktree add` call sites in tests and skill text (worker protocol, base-run skill paragraph, chart door) stay non-sparse by design; only `ensureWorktree`, `buildStack`, and the exported helper create sparse worktrees.
- D11 `checkLocation` lives inside `createSparseWorktree` rather than at three call sites; same refusal surface, one guard point. Noted for review against the design's wording.

## Interfaces provided to sibling leaves

- `worktreeStore(repo): string` — base-run, worktree-reconciler.
- `createSparseWorktree(repo, path, ref, opts)` — base-run (`{ detach: true }`), worktree-reconciler recreate.
- `checkLocation(targetPath): void` — base-run, worktree-reconciler.
- `akrogon guard ancestors|own-modules` — composed check commands, base-run own-modules step.
- `worktree_store` in `akrogon config` output — already printed; implement-issue workers and chart-issues door read it.

## Known open limitation

Until operator step S2 removes `worktree_root` from `issues/config.yaml` on main, every leaf worktree (including this one) sits under the registered checkout whose ancestors hold `package.json` and `node_modules`, so its printed check commands correctly refuse via `guard ancestors`. This leaf's own check.review therefore runs the underlying `checks` commands (`bun test --timeout=30000`, `bun run typecheck`, `bun run format`) directly in the worktree; the composed refusal is itself covered by guard tests. Recorded, not worked around.

## Waves

### Wave 1

**U1 — store resolution, guards, command surface.**
Owns: `src/config.ts`, `src/guard.ts` (new), `src/akrogon.ts`, `tests/helpers.ts`, `tests/config.test.ts`, `tests/command-reference.test.ts`, `tests/guard.test.ts` (new), `README.md`.
Covers: D1, D3, D4, D5, D9 (helpers only).
Shared test resources: none. Prerequisites: none.

### Wave 2

**U2 — sync/init surfaces and docs.**
Owns: `src/sync.ts`, `src/init.ts`, `tests/init.test.ts`, `tests/sync.test.ts`, `docs/guide/setup.md`, `docs/guide/cheat.md`, `docs/guide/limits.md`, `skills/init-akrogon/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`.
Covers: D7, D8, doc updates.
Shared test resources: none. Prerequisites: U1 (`worktreeStore`, helpers `HOME`).

**U3 — sparse worktree creation and stack.**
Owns: `src/next.ts`, `src/batch.ts`, `tests/next.test.ts`, `tests/batch.test.ts`, `tests/batch-merge.test.ts`, `tests/culprit.test.ts`, `tests/hold.test.ts`, `tests/merge-attempts.test.ts`, `tests/phase.test.ts`, `tests/status.test.ts`, `tests/pull.test.ts`, `tests/direct-guards.test.ts`, `tests/worktree-store.test.ts` (new).
Covers: D2, D6, D9 (worktree-touching tests), D10.
Shared test resources: none. Prerequisites: U1 (`checkLocation`, `worktreeStore`, helpers `HOME`).

U2 and U3 share Wave 2: disjoint owned paths, no shared fixture, both depend only on U1.

## Done-criteria → proof

| # | Criterion | Proof command | Failure caught | Size | Rerun trigger |
|---|-----------|---------------|----------------|------|---------------|
| 1 | Default and `~` store resolution; `worktree_store` printed | `bun test tests/config.test.ts` + store-location case in `tests/next.test.ts` | wrong resolution, missing or relative `worktree_store` | seconds | `src/config.ts` |
| 2 | Sparse leaf: no `issues/`, clean status, sparse flag local, root full | `bun test tests/worktree-store.test.ts` | materialized issues tree, dirty status, sparse leaking to root | seconds | `src/next.ts` |
| 3 | Sparse rebase across `issues/` changes; stack of two in store | `bun test tests/worktree-store.test.ts tests/batch.test.ts` | rebase breakage, stack built under leafTemp | seconds | `src/next.ts`, `src/batch.ts` |
| 4 | Create refused naming bad ancestor; nothing created | `bun test tests/worktree-store.test.ts tests/guard.test.ts` | unguarded allocation, wrong named path | seconds | `src/guard.ts`, `src/next.ts` |
| 5 | Printed checks refuse bad ancestor / missing own `node_modules` before setup/check | `bun test tests/guard.test.ts tests/config.test.ts tests/batch-merge.test.ts` | guard order wrong, setup ran, missing path in output | seconds | `src/config.ts`, `src/guard.ts` |
| 6 | Leaf resolution isolation: foreign pkg fails, local resolves, missing pkg fails without fetch | `bun test tests/worktree-store.test.ts` | root `node_modules` leak, bun auto-install on | seconds | fixture, `src/next.ts` |
| 7 | `checkLocation` accepts nonexistent target, refuses it naming ancestor | `bun test tests/guard.test.ts` | crash on nonexistent path, silent pass | seconds | `src/guard.ts` |

Regression: `bun run typecheck` (seconds), `bun test --timeout=30000` full suite (minutes — restart boundary: rerun only the leaf `checks.test` name, then the full suite once before `phase`), `bun run format` (seconds). No `merge_checks` configured; none added.

## Affected docs, one line each

- `README.md` — `guard` command row; sync exclusion line names the worktree store.
- `docs/guide/setup.md` — `worktree_root` entry states the `~/.akrogon/worktrees/<repo>` default and `~` expansion.
- `docs/guide/cheat.md`, `docs/guide/limits.md` — example worktree path updated to the store form.
- `skills/init-akrogon/SKILL.md` — proposal template drops the `worktree_root` line (default is the store).
- `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md` — `<worktree_root>` token renamed to `worktree_store`.
- `skills/implement-issue/worker-protocol.md` — already reads `worktree_store`; no change.
- `src/AREA.md`, `tests/AREA.md` — sparse worktree behavior and guard verb noted if the implementer judges the existing lines stale.
