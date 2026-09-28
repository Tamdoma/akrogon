# Plan: worker-path

Direct synthesis. `debate: no`, so no positions or rebuttals. Built from `brief.md`, `design.md`, and the live checkout. No brief/design conflict found. If one appears, the design wins.

## Decisions

- D1. One shared resolver owns the path. Add `export function worktreeStore(repo: Repo): string` in `src/config.ts` returning `resolve(repo.root, repo.config.worktree_root)`. This matches current leaf creation byte for byte. Do not use `expandPath` here. That keeps leaf and worker paths identical and leaves the `~` behavior in `src/sync.ts` and `src/init.ts` untouched per design.
- D2. `effectiveConfig` prints the derived key on every registered call. Add `...(repo !== null ? { worktree_store: worktreeStore(repo) } : {})` next to `repo`. Print from the registered root and from any linked worktree. Omit the key when `repo: none`. Keep `worktree_root` exactly as configured. Unlike `AKROGON_BASE`, this key does not depend on `top !== repo.root`.
- D3. `src/next.ts` stops computing the path inline. `:231` in `ensureWorktree` becomes `resolve(worktreeStore(repo), leaf.state.slug)`. `:290` in `allocate` uses the same expression. Import `worktreeStore` from `./config`. Keep the mismatch error text and all git logic unchanged. After this, no `resolve(repo.root, repo.config.worktree_root` remains in `src/next.ts`.
- D4. Tests run the real CLI on real temp repos. Add focused coverage in `tests/config.test.ts` using existing `fixture()` and `cli()`: default root, custom relative root, absolute root, call from root, call from linked worktree, call from unregistered cwd. Assert `worktree_store` is absolute, equals `resolve(root, worktree_root)`, is identical from root and linked worktree, that `worktree_root` output still equals the configured string, and that the key is absent outside a repo. Never mock the resolver.
- D5. Protocol names one absolute path and drops the old reasons. Rewrite `skills/implement-issue/worker-protocol.md:11` so a delegated leaf worker lives at `<worktree_store>/<slug>-u<N>` read from `akrogon config`, created with `git worktree add --detach` at the leaf's committed HEAD. Say B uses that one absolute path unchanged for the sub-brief worktree path, spawn cwd, inspection path, and `git worktree remove` target. Delete `<lane>` as a path segment and delete the "inside pi's parent root" and "inside the repo so it is gitignored" reasons. Keep standalone workers sequential in the current checkout. Keep `:17` and `:25` retained-worker resume at the recorded path, including an old nested path. Add: an occupied `<slug>-u<N>` path is reported to the operator, never deleted, forced, or reused.
- D6. Real-run evidence lives outside tracked paths. Implementation does one real run in a temp registered repo with a leaf worktree holding a commit ahead of main: `akrogon config` from the leaf, then `git worktree add --detach <worktree_store>/<slug>-u1 HEAD`, showing the worker is a sibling of the leaf at the leaf's HEAD. Keep full output in one file outside `issues/` (for example under the shell temp dir) and record that path in the implementation report. Then run the configured checks.

Terms: `worktree_root` is the configured string. `worktree_store` is the resolved absolute dir. A leaf worktree is `<worktree_store>/<slug>`. A worker worktree is `<worktree_store>/<slug>-u<N>`. The worker starts at the leaf's committed HEAD, not at a branch tip.

Credentials: none. The brief and design name no variable, so no env presence check applies.

## Read-first

- `docs/reference-index.md`
- `src/AREA.md`
- `tests/AREA.md`
- `skills/AREA.md`
- `src/config.ts`
- `src/next.ts`
- `src/sync.ts`
- `src/init.ts`
- `tests/helpers.ts`
- `tests/config.test.ts`
- `skills/implement-issue/worker-protocol.md`
- `learnings/LESSONS.md`

## Needed interfaces

- `worktreeStore(repo: Repo): string` in `src/config.ts`, exported, returns absolute store.
- `worktree_store: <absolute path>` in `akrogon config` YAML whenever a registered repo resolves, absent when `repo: none`.
- Worker path `<worktree_store>/<slug>-u<N>` consumed by the protocol's `git worktree add --detach`, spawn cwd, inspection, and `git worktree remove`.

## Acceptance criteria

- A1. `akrogon config` from the registered root or any linked worktree prints `worktree_store` as an absolute path equal to the parent of the `ensureWorktree` path, with one resolver shared by both. The key is absent when `repo: none`. Printed `worktree_root` stays exactly as configured.
- A2. `tests/config.test.ts` drives the real CLI against real temp git repos and covers default `issues/worktrees`, a custom relative root, an absolute root, invocation from root and from a linked worktree, and an unregistered cwd with no key.
- A3. `worker-protocol.md:11` names `<worktree_store>/<slug>-u<N>` from `akrogon config` with `git worktree add --detach` at the leaf's committed HEAD, says B uses that one absolute path unchanged for sub-brief path, spawn cwd, inspection, and `git worktree remove`, and no longer uses `<lane>` as a path or the pi-confirm and gitignored reasons.
- A4. The protocol keeps retained workers resuming at their recorded path including an old nested path, says an occupied `<slug>-u<N>` path is reported to the operator and never deleted, forced, or reused, and keeps standalone workers sequential in the current checkout.
- A5. The implementation report records one real run with output kept outside tracked `issues/` paths and its path in the report, showing a worker created as a sibling of the leaf at the leaf's HEAD in a temp registered repo, and the configured checks pass.

## Checklist, in order

1. `src/config.ts` — add `worktreeStore`, wire it into `effectiveConfig` per D2. Covers A1.
2. `src/next.ts` — replace both inline resolves per D3, keep behavior and errors. Covers A1.
3. `tests/config.test.ts` — add the real-CLI matrix per D4. Covers A2.
4. `skills/implement-issue/worker-protocol.md` — rewrite the worker path rule per D5. Covers A3 and A4.
5. Real-run evidence plus `bun run format`, `bun test`, `bun run typecheck` — per D6. Covers A5.
6. Agent doc affected: `skills/implement-issue/worker-protocol.md` — worker path rule updated per D5.
7. Human docs affected: none — `README.md` and `docs/guide/setup.md` mention `worktree_root` only in generic terms and describe no worker path.

## Verification

- `bun test tests/config.test.ts` passes, including the new matrix.
- `grep -rn "resolve(repo.root, repo.config.worktree_root" src/next.ts` returns nothing.
- `grep -n "worktree_store" src/config.ts tests/config.test.ts skills/implement-issue/worker-protocol.md` shows the resolver, output, tests, and protocol.
- `grep -n "<lane>/\|parent root\|gitignored" skills/implement-issue/worker-protocol.md` returns nothing for the worker path paragraph.
- Real run in a temp dir: init a registered repo, create a leaf worktree with one commit ahead of main, run `akrogon config` from the leaf, read `worktree_store`, run `git worktree add --detach <worktree_store>/<slug>-u1 HEAD`, then show `git -C <leaf> rev-parse HEAD`, `git -C <worker> rev-parse HEAD`, and both paths sharing the same parent. Save the transcript outside `issues/` and cite its path.
- Full `bun run format`, `bun test`, `bun run typecheck` pass.

## Open limitation

A `~` in `worktree_root` keeps its current split: leaf and worker paths use plain `resolve` and do not expand `~`, while sync and init use `expandPath` and do. This plan preserves that behavior without unifying it.

## Dependencies

None.
