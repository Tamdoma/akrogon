# Slot D review, owner roots, round 2

## owner-locks

Verdict ready

- Base `0a74a994869d81c28487e5b5d454aaa6ee942f45`
- First release `82a3d4b3d043c5c04fa71fc7b07b4e4337e46a61`
- Head `dbfbc3baafd93742ddfed7532481dc7bbfc65938`

1. **F1 fixed with the first release deployed and old reconcile callers drained.** The same-slice stop and admission probe waited in both directions across each adjacent release pair. A base stop and final-release admission still overlapped. Self-update fetches and deploys the remote tip (`src/self-update.ts:229–243`), so publish the first release separately. The drain needs to include old commands that can enter reconcile, including `start` (`src/stop.ts:101–110`) and `unpause` (`src/akrogon.ts:237–241`).

All 16 touched tests passed at the first release and all 53 passed at head.

## owner-workers

Verdict fix

- Base `0a74a994869d81c28487e5b5d454aaa6ee942f45`
- Head `fb74665a0a321d8636009b83758c5930df99a4a4`

2. **F2 fixed for the original case.** A primary checkout on the legitimate `workers-u1` leaf now allows the peer `workers` phase move.
3. **F6. A historical slug can hide a real worker checkout.** `src/phase.ts:429–435` exempts every slug from `allLeaves`, which includes `issues/closed` (`src/state.ts:267–269`, `:311–313`). I left a completed `workers-u1` record in `issues/closed` and created a new detached worker at that freed path for `workers`. The previous head refused the move while the worker remained. This head advanced to `check.review`. Base the exemption on evidence that the registered worktree is the peer's primary checkout, rather than a historical slug alone.

All 69 touched tests passed.

## owner-skills

Verdict fix

- Base `0a74a994869d81c28487e5b5d454aaa6ee942f45`
- Head `6aea7fa41125a46d9ce67881552aa1023b40aa39`, including consult fix `a508526d`

4. **F3 remains open for a linked status file.** `skills/watch-issues/scripts/consults.ts:250–257` now refuses the original linked case directory and preserves its target. In a real case directory, the `status` entry survives the trim and `writeFileSync` follows it (`:238`, `:271–273`). I linked `status` to a file outside the case. `close` returned zero and replaced that file's content with `closed`. Validate the status entry before teardown or replace the directory entry without following the link.
5. **F4 and F5 fixed.** The new recipe checked out source files sparsely and retained its Git worktree lock. Reconcile kept the dirty `verify-new` and `verify-legacy` attempts. The documented unlock and remove steps then cleaned up both clean worktrees. The handoff and abandon steps also restore unlocking.

All eight touched tests passed. The branch diffs passed `git diff --check`. Tests used `--timeout=120000 --max-concurrency=5`, and the behavior probes used disposable fixtures.
