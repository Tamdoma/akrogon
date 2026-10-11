# Review A: worktree-store

Base: `309d742605a0516067840863ffdf3be29b03fc0c`. Reviewed head: `6f709e4` (7 commits, incl. trailer-only `docs: test-change citation for tests/AREA.md`).

## Verification evidence

- Full suite on reviewed head: `bun test --timeout=30000` → 729 pass, 0 fail (74 s). `bun test --changed="$AKROGON_BASE" --timeout=30000` → 701 pass, 0 fail. `bun run typecheck` clean. `bun run format` clean after reverting pre-existing prettier drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts` (untouched files; known lesson 2026-10-08).
- Live on this worktree (`bun src/akrogon.ts`): `guard ancestors` → exit 1 naming `/home/ivan/Work/infra/akrogon` (holds node_modules/package.json); `guard own-modules` → exit 1 naming `<wt>/node_modules` before `bun install`, 0 after. `config` prints `worktree_store: /home/ivan/Work/infra/akrogon/issues/worktrees` under the still-explicit `worktree_root`.
- Deliberate breaks recorded in report.md: `withSetup` without `guard ancestors` → refusal test red; `createSparseWorktree` without `sparse-checkout set` → sparse tests red.

## Criteria check

1. Default/`~` store + printed `worktree_store` — `tests/config.test.ts` store-shape table (unset/`~/x`/custom/absolute + linked-worktree caller) and `tests/worktree-store.test.ts` tilde case. ✔
2. Sparse leaf: no `issues/`, clean status, worktree-local `core.sparseCheckout`, root keeps tree — dispatch test asserts all four, root `git config --worktree` returns 1. ✔
3. Sparse rebase across an `issues/` change + two-leaf `buildStack` under the store (git-shim log shows add/sparse under `storeDir`, dir removed after). ✔
4. Create refusal naming the ancestor with nothing created — dispatch test with `worktree_root` under a `node_modules`-holding dir; `git worktree list` unchanged, no `trees/` created. ✔
5. Printed-check refusals — `tests/guard.test.ts`: dirty-ancestor case asserts non-zero + ancestor path + setup marker absent; missing-own-`node_modules` case asserts non-zero + path + check marker absent. ✔
6. Resolution isolation — sparse store leaf: foreign `left-pad` resolves at root but not in leaf, vendored `local-dep` resolves, `require("definitely-absent-pkg")` fails leaving `node_modules` empty. ✔
7. `checkLocation` on a nonexistent target — accepts clean chain, refuses naming ancestor when one holds `node_modules`. ✔

## Judgment notes

- `checkLocation` inside `createSparseWorktree` (plan D11) is the right placement: every caller (`ensureWorktree`, `buildStack`, future base-run/reconciler) is guarded at one point; the design's call-site list is satisfied semantically.
- `sh -c <quoted cmd>` as the composed tail keeps `X || Y` checks atomic after a failed guard — correct reading of the design's "then the command".
- `ensureWorktree` adoption path is unguarded, matching the design's refusal-on-creation; runtime guards cover adopted worktrees at check time.
- Composed order run-check → ancestors → flock+setup → own-modules → cmd matches the design's fresh-worktree flow (install before own-modules check).
- Pre-S2 nested stores will fail `guard ancestors` at check time and `checkLocation` at creation — designed cutover, recorded in plan.md and report.md as an open limitation with operator step S2; not a defect.
- `batch.ts` → `next.ts` import edge: Bun resolves it; all tests green; helper placement is design-pinned to `src/next.ts`.
- Doc lines verified live: README guard row exists in command table; `src/AREA.md` guard command line; `tests/AREA.md` guard.test.ts line; setup/cheat/limits store paths; init-akrogon template line removed; chart-issues `worktree_store` tokens — all match reality.

## Fixes

None.

## Nits

- N1: `src/AREA.md` names the `guard` command but its "Non-obvious patterns" does not mention that leaf/stack worktrees are now sparse with no `issues/` materialized — a reader investigating worktree behavior would not find the mechanism there. Deferred: the file documents commands/key files, and the sparse behavior is fully specified in `tests/worktree-store.test.ts` names and the design. Promotes to Fix only if a future reader reports acting on the stale mental model.
- N2: `tests/AREA.md` key-files adds `guard.test.ts` but not `tests/worktree-store.test.ts` — deferred, key-files list is selective by the file's own convention.

## Verdict

`nits` — two doc-completeness nits, no defects, every done-criterion has a real test or live evidence, checks all green.
