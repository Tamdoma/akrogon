# Brief: setup-before-seat

## What

akrogon runs the repo's configured `setup` in a leaf worktree before any seat works there.

1. `ensureWorktree` gets a setup step after `writeLeafEnv` and before its final `saveState`. Every allocate passes it: dispatch start, re-prompt, `akrogon seat` and `broadcastPass`.
2. Setup is due when `repo.config.setup` is set and the marker file at the worktree's `git rev-parse --git-path akrogon-setup` is missing or holds another string. The step first deletes a marker holding another string (D). It then runs `flock <the worktree's install lock> sh -c <setup>` in the worktree with `constructedEnv(repo, <leaf temp>)` and stdin ignored, followed by the `own-modules` check in-process. Only on success does it write the marker with the exact `setup` string.
3. `src/batch.ts:move` deletes the marker before it runs `git reset --keep` in a leaf worktree.
4. When setup is due and the leaf is busy, `allocate` returns a busy result naming the busy seat or run (D). Busy means a recorded seat is live with status `working`, `blocked` or null, or the leaf has a live run-check. The leaf is then not dispatched this pass, with no error and no capacity row. `akrogon seat` refuses, naming the busy seat or run.
5. A setup or guard failure throws through the per-leaf report path, and no seat starts. A worktree this call created is removed and no `worktree:` is recorded. An existing or adopted worktree is kept, without a marker. The next pass retries.
6. With `setup` unset, nothing new runs.
7. `docs/reference/config.md`, `docs/reference/checks.md` and `src/AREA.md` state the new duty. The leaf retires the lesson "fresh worktree skips setup (2026-11-25)".

## Why

Tamdoma/akrogon#158. A new leaf worktree has no `node_modules`, because `setup` runs only inside checks (`src/config.ts:setupCommand`) and verify. In the framework repo, the PreToolUse Skill hook imports `js-yaml`, so it failed and blocked the dispatched `plan-issue` call until the seat installed packages itself. The same class reopens after akrogon moves a leaf worktree onto a new top (`src/batch.ts:move`, `git reset --keep`). There, `node_modules` survives without a dependency that main added (charting observation C Obs 2).

## Done-criteria

These are the door's criteria. The seed holds no operator decision.

1. In a registered repo with `setup` configured, `akrogon next` on a fresh leaf runs `setup` in the leaf worktree before the seat's first task is delivered. It runs with the worktree as cwd, the worktree's install lock held, the leaf `.env` present and no `AKROGON_RUN` or `CLAUDECODE` in its env. Afterwards the marker holds the `setup` string. Later dispatches of the same leaf (a re-prompt after a phase move, `akrogon seat`) do not rerun it, and a changed `setup` string reruns it once. Proof: own test at the CLI boundary (fixture home, temp git repos, fake hc, as in the first-allocation tests) with a `setup` that records its cwd, env, lock state and call count. It fails on the base.
2. A first allocation that adopts an existing worktree whose branch has its own commits runs `setup` there before the first delivery. Proof: own test, red on the base.
3. After `move` resets a leaf worktree onto a new top, the marker is gone. The next dispatch, a re-prompt of a live idle seat in `check.repair`, runs `setup` before the send. Proof: own test that drives `applyTop` or `move` on a fixture leaf and then dispatches. It fails on the base.
4. When setup is due and a recorded seat of the leaf is live with status `working`, `blocked` or null, or the leaf has a live run-check:
   - no setup runs and nothing is delivered to that leaf in the pass;
   - the pass records no capacity wait and reports no error for it, and other leaves still dispatch;
   - `akrogon seat` on that leaf exits non-zero naming the busy seat or run;
   - once the seat is `idle` or `done`, the next pass runs setup and then delivers;
   - a seat with status `error` does not hold the leaf.
   Proof: own test.
5. When `setup` exits non-zero, or the guard finds no own `node_modules` after it:
   - `akrogon next` exits non-zero with a report naming the leaf, the exit code and the output, and starts no seat for that leaf;
   - a worktree that pass created is removed, and on a first allocation state.yaml records no `worktree:` (C);
   - an existing or adopted worktree stays, with no marker;
   - a sibling leaf in the same pass is still dispatched;
   - after the cause is fixed, the next pass runs setup and delivers.
   Proof: own test, red on the base (the base starts the seat).
6. In a repo with no `setup`, dispatch behaves as on the base, also with a root `package.json` and no `node_modules`: no marker is written and no guard runs. Proof: own test.
7. `docs/reference/config.md` (`setup` row), `docs/reference/checks.md` (`setup` paragraph) and `src/AREA.md` (first-allocation pattern and `setup` composition note) (B) say that `setup` also runs in a leaf worktree before a seat works there, once per checkout state. Proof: the reviewing seat reads the diff.
8. The line "fresh worktree skips setup (2026-11-25)" is gone from `learnings/LESSONS.md`. `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` ends with `Applied <YYYY-MM-DD> by <file:line of the setup step in src/next.ts:ensureWorktree>: <what stops it>` (C, D). Proof: the reviewing seat reads the diff.
