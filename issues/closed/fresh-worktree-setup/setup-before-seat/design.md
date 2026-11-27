# Design: setup-before-seat

## Binding decisions, verbatim

### Signposts, from forks/signposts.md

A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

### Setup before seat, from forks/setup-before-seat.md

A's autopilot pick, 2026-11-25. Not operator words. Revised after the final-shape check, marked [R]. The [R] lines adopt the checkers' own fixes and add no mechanism beyond reusing the existing `liveRuns` guard, so no second check runs.

1. Q1 b. The marker sits at the worktree's `git rev-parse --git-path akrogon-setup` and holds the exact `setup` string. It is written only after setup and the guard succeed. Setup is due when the marker is missing or holds another string. [R] `src/batch.ts:move` deletes the marker before it runs `git reset --keep` in the leaf worktree (C). There is no `node_modules` existence trigger.
   - Reason: the setup runs once per new checkout state, not on every delivery. Under B's unconditional option, every pi-extensions `check.review` reruns four `npm ci` installs inside the home lock while seat A works (B, C, D rebuttals). Retry is keyed on success, so a failed or partial install reruns (B F13).
   - Rejected: a (unconditional, B withdrew it). Creation only (G1).
   - Standing dissent: C keeps the missing-`node_modules` trigger for a manual or external wipe.
2. Q2 b. The setup step runs inside `ensureWorktree`, after `writeLeafEnv` and before the final `saveState`, so start, re-prompt, `seatCommand` and `broadcastPass` all pass it.
   - [R] `allocate` computes busy from the seats it already found (`found`) and from `liveRuns()` for this leaf, and passes it in (D B2, C 3).
   - [R] Busy means a recorded seat is live with status `working`, `blocked` or null, or the leaf has a live run-check (D B1, C 3). `error` and `done`/`idle` are not busy.
   - [R] `ensureLeafTemp` runs before the setup step (D B2, C 1).
   - [R] When setup is due and the leaf is busy, `allocate` returns a distinct busy result, not `null` (C 2). `dispatchLeaf` ends the leaf's pass with no capacity row and no error. `broadcastPass` returns. `seatCommand` refuses, naming the busy seat or run. The listener's `turn` wake runs the next pass.
   - Reason: one call site that every delivery passes, and it keeps the first-allocation refusal shape (no `worktree:` on failure, `tests/first-allocation.test.ts`) (C, D). The busy gate, not a live gate, keeps the restack repair covered, since seats stay live and idle across phases (F2).
   - Rejected: a (delivery point, B). It leaves an allocated-looking leaf on failure and changes `capRefusal` counting (C, D).
   - Standing dissent: B keeps a.
3. Q3 a. No new deadline.
   - Reason: no named source exists for a value (standing design, bound line). The listener already kills each pass's process group at `PASS_DEADLINE_MS`, and a manual run dies with its foreground group (F6).
   - Stated residual: a hung setup holds the home `.lock` until one of those ends it. A setup run from a seat's `akrogon phase` (phaseWake) hangs that tool call the same way.
   - Standing dissent: C and D keep b (deadline with a process-group kill).
4. Q4 a. The env is `constructedEnv(repo, <root>)` unchanged, and `refuse()` is not called. [L] `<root>` is the leaf temp itself, the `TMPDIR` seats already get (`src/seat.ts`). This replaces a `setup-` scratch dir, which no sweep would collect after a killed pass (leaf review B B1).
   - Reason: same env as verify's setup, and `AKROGON_RUN`, `CLAUDECODE` and the forbidden names are left out by construction (B, C, D).
5. Q5 b. A setup or guard failure in a worktree this call created removes that worktree under `worktreeLock` with `git worktree remove --force` and records no `worktree:`. [R] This is new code around the setup step in `ensureWorktree`, not in `createSparseWorktree`, which verify and `buildStack` share (D B3). An existing or adopted worktree is kept, without a marker.
   - Reason: a failed setup that dirties a just-created worktree makes the leftover branch refuse forever (F5).
   - Rejected: a (B: no state difference). It does not hold for a dirtied tree.
6. Q6 a. With `setup` unset, nothing runs and dispatch is unchanged (B, C, D).
7. The command is `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <setup>` in the worktree with stdin ignored. Then comes in-process `guard(worktree, ['own-modules'])`. [R] A non-zero return throws (C). Then the marker is written. A failure throws with exit code, stdout and stderr through the per-leaf report path, and the next pass retries (G4).
8. Q7 a. The leaf removes the "fresh worktree skips setup (2026-11-25)" line from learnings/LESSONS.md and appends `Applied <date> by <commit>` to learnings/history/2026-11-25-fresh-worktree-skips-setup.md (B, C, D). A seat's own mid-task rebase is a different mechanism, covered by check-time `withSetup`.
9. Docs: `docs/reference/config.md` and `docs/reference/checks.md` say `setup` also runs in a leaf worktree before a seat works there, once per checkout state.
10. Exclusions: worker (`-uN`) and direct-route worktrees made by skills, verify, `buildStack`, `self-update`, check-side `withSetup`, and repos with no `setup`.

[L] Leaf review corrections (slots/leaf-review-{B,C,D}.md, 2026-11-25), applied in the leaf drafts:
- B B1: no scratch dir (item 4). B B2: `src/AREA.md` update made unconditional.
- C 1 and D 1: `Applied` names file:line, not the leaf's own commit. C 2: guard message exported from `src/guard.ts`. C 3: busy returns before `writeLeafEnv`. C 4: other callers go through `dispatchLeaf`. C 5: `worktree:` wording limited to first allocation.
- D 2: a differing marker is deleted before the run. D 3: the busy outcome names the seat or run. D 5: run through `spawnCaptured` with a resolved lock path. D 6: marker helpers in `src/config.ts`. D 4 is answered by C 2.

Installed path: /home/ivan/.akrogon/releases/ce0cbbd825cbed80742e58947a4aff39847145a4/skills/chart-issues/assets/standing-design.md. How it applies here:
- Each criterion is proven by the cheapest test at the real boundary: the `akrogon next`, `akrogon seat` and `move` paths in the repo's fixture home with temp git repos and the fake hc core, as `tests/first-allocation.test.ts` does. `setup` in the fixture is a shell command that records cwd, env, lock state and a call count, or creates `node_modules`. No network, no paid call, no live run.
- The bug-fix rule applies. Criteria 1, 2, 3 and 5 fail on the current base (setup never runs and the seat starts) and pass after. Criteria 4 and 6 are new behaviour, each shown red by one deliberate break (dropping the busy test, dropping the unset check).
- No new machinery. The tests reuse the existing fixture helpers.
- The key parts resting on outside tools are reached by charting observations: per-worktree `--git-path` (B O-A, C Obs 1, D OBS1), marker lifetime across checkout and worktree removal (D OBS2), install idempotence and the stale `node_modules` after `git reset --keep` (C Obs 2), and `git worktree remove` with ignored files (B O-E).

## Leaf architecture

- Owned surfaces:
  - `src/next.ts:allocate`:
    - It calls `ensureLeafTemp` before `ensureWorktree`.
    - It computes busy from the `found` seats (live, with `status.state` `working` or `blocked` or a null status) and from `liveRuns()` entries whose repo and leaf match. It passes busy into `ensureWorktree`.
    - It returns a distinct busy outcome beside `Allocation` and the capacity `null`. The outcome carries the busy seat's slot and address, or the live run's record, so `seatCommand` can name it (D).
  - `src/next.ts:dispatchLeaf`, `broadcastPass` and `seatCommand` handle the busy outcome:
    - `dispatchLeaf` ends the leaf's pass with no capacity timing row and no error.
    - `broadcastPass` returns.
    - `seatCommand` throws naming the busy seat address or the live run.
  - `src/next.ts:ensureWorktree`: the setup step after `writeLeafEnv` and before the final `saveState`, in every branch that ends with a worktree on disk (created, recreated, adopted, kept).
    - When setup is due and busy is true, it returns the busy outcome before `writeLeafEnv`, so `.env` and `env_names`/`env_generation` stay in step (C).
    - On failure in a worktree this call created, it removes the worktree under `worktreeLock` with `git worktree remove --force`, as the catch in `createSparseWorktree` does, and rethrows. `createSparseWorktree` itself is unchanged, because verify and `buildStack` share it.
  - Marker helpers in `src/config.ts` beside `setupCommand`: the marker path and its deletion. They are imported by the setup step in `src/next.ts` and by `src/batch.ts:move`, which avoids the `next`/`batch` and `config`/`run-check` import cycles (D).
  - The setup step in `src/next.ts`:
    - Due test: `repo.config.setup !== undefined` and the marker is missing or its content differs from `repo.config.setup`. A differing marker is deleted before the run (D).
    - Run: resolve the install lock with `git rev-parse --git-path akrogon-install.lock` in the worktree, then `spawnCaptured(['flock', <lock>, 'sh', '-c', setup], { cwd: worktree, env: constructedEnv(repo, leafTemp(repo, slug)) })` from `src/shell.ts`. Stdin is ignored and output is captured. `constructedEnv` (`src/run-check.ts`, exported) does not call `refuse()`. The leaf temp is the root that seats already get as `TMPDIR` (`src/seat.ts`), so no scratch dir kind is added and none can leak (B B1 answered by removal).
    - A non-zero result throws a `CommandError` with argv, cwd, exit code and captured output (D).
    - Then the `own-modules` check: `src/guard.ts` exports a function returning the refusal message or null. `guard()` prints it and the setup step throws it, so the message lives in one place (C).
    - Then the marker write.
    - `dispatchLeaf`'s existing catch reports the failure through `report`.
  - `src/guard.ts`: the exported own-modules message function (C).
  - `src/batch.ts:move`: delete the marker (absent is fine) before `git reset --keep` in the leaf worktree.
  - `docs/reference/config.md` `setup` row and `docs/reference/checks.md` `setup` paragraph.
  - `learnings/LESSONS.md` line removal and the `Applied` line in `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` (lesson rule Retire).
  - `src/AREA.md`: the first-allocation pattern paragraph and the `akrogon config` composition note gain the dispatch-time setup duty (marker, busy gate, removal on failure) (B).
- Literal interfaces:
  - Marker: file `akrogon-setup` in the worktree's own git dir, content exactly `repo.config.setup`.
- Consumers of changed state:
  - `src/next.ts:capRefusal` keys on `leaf.state.worktree === undefined`. A failed first allocation still records no `worktree:`, so counting is unchanged.
  - `tests/first-allocation.test.ts` `expectRefusal` (no `worktree:` and no seat on a refused first allocation) holds for setup failures.
  - `src/reconcile.ts` removes leaf worktrees without `--force`. An installed `node_modules` is ignored-untracked, and `git worktree remove` accepts it (charting observation B O-E).
  - Open for the plan: whether the install-lock name `akrogon-install.lock` is shared with `setupCommand` as one constant, so the two never drift.
  - `src/next.ts:dispatchSlot`'s `liveRuns` guard and status gate are unchanged. The busy outcome happens before `dispatchSlot`.
  - `src/listen.ts` queues `next --wake` on hc `turn` events, which runs the pass after a busy seat's turn ends.
  - `phaseWake`, `unpausePass` and `landedWake` reach `allocate` only through `dispatchLeaf`. A busy end there adds nothing to `invocation.skipped`, so they need no handling of their own (C).
- Exclusions:
  - Worker (`-uN`) and direct-route worktrees made by skills.
  - `src/verify.ts` (already runs setup), `src/batch.ts:buildStack`, `src/self-update.ts`.
  - Check-side `withSetup` and `setupCommand` stay as they are.
  - Repos with no `setup`.
  - A seat's own mid-task rebase or dependency edit (covered by check-time setup).
  - No deadline on setup (Taken 3).
