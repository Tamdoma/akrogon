# Setup before seat: when and how the configured setup runs for a leaf seat

## Question

The map settled the class: akrogon runs the repo's configured `setup` in the leaf worktree itself, before a seat works there, as a plain spawn inside the home `.lock`. A failure is reported per leaf, skipped and retried next pass (slots/map-merged.md G1-G6). These questions shape the leaf contract.

- Q1 Trigger. a. Before every delivery, unconditionally. b. Only when a success marker at the worktree's git path is missing or names another `setup` string, with `move` deleting it when files move.
- Q2 Call site. a. Before each delivery: the head of the start path and before the re-prompt send. b. In `ensureWorktree` before the final `saveState`.
- Q3 Bound. a. None (as checks today). b. A deadline with a process-group kill.
- Q4 Env. a. `constructedEnv`'s copy list without the refusal. b. The caller's env.
- Q5 Failed first run. a. Keep the worktree, retry. b. Remove a worktree this call created.
- Q6 No `setup` configured. a. Skip entirely. b. Run the guard.
- Q7 Lesson. a. Retire on the leaf. b. Keep.

### Carries

- Locks: forks/signposts.md `## Taken` (A's picks: 1a fix in the failing mechanism, 2a free tests at the real boundary, 3a extend existing records, 4a one leaf per chart, 5a order rule, 6a old records keep parsing).
- Seed: Tamdoma/akrogon#158 (INTAKE.md). No seed decision section.
- Operator corrections: none.

## Findings

Map: slots/map-merged.md M1-M12, G1-G6.
- Rebuttals: slots/rebuttal-{B,C,D}.md (2026-11-25). Corrections to the merged map: M1 holds only for `checkBase`, since fetches in `mergeTurn`, `reconcileBatch` and `finishPush` run outside the lock (C, D). M7: `npm ci` replaces package dirs and drops extraneous entries, with no wholesale wipe window (B RB1, npm 11.20.0). M9 is a hard AB-BA deadlock, not a queue (B). M10's registry-auth path is model knowledge (D).
- F1 Convergence: B withdrew Q1a and Q6b, D withdrew the live gate. All of B, C and D now hold Q1b, Q4a, Q6a and Q7a.
- F2 Working sibling (the must-weigh point): a stale marker can meet a working sibling seat through a changed `setup` string, the first pass after the release, a manual `akrogon seat`, or the extra missing-`node_modules` trigger (C 1-4, B, D). The `move` invalidation cannot meet one, because `merge` is entered only when every required slot is `done` (`src/phase.ts` `transition`, B). A live gate reopens #158 after restack, because seats stay live and idle across phases (`commitMove` keeps `seat`, B, C, D). The gate that closes all of these is busy (status not `idle`/`done`), not live.
- F3 `setupCommand` shells out to `akrogon guard own-modules` on `PATH`, which is the installed release or nothing in the fixture (C, confirmed by B). Run the flock and setup in the shell and the guard in-process.
- F4 `constructedEnv` (`src/run-check.ts`) is an allowlist and does not call `refuse()` (called separately in `runCheck`). It leaves out `AKROGON_RUN`, `CLAUDECODE` and the forbidden names by construction (A read, B Q4, C Q4).
- F5 A setup that fails in a just-created worktree and dirties it (varhop's unfrozen `bun install` rewriting `bun.lock`) makes the next pass's first-allocation leftover branch refuse forever on `worktreeRemovable` (C, D). A clean leftover is removed and recreated anyway (B, C).
- F6 No check or setup has a timeout today. `src/listen.ts` runs each pass `detached` and kills its process group at `PASS_DEADLINE_MS`, and a manual `akrogon next` dies with its foreground group on Ctrl-C (A read).

## Proposed final shape (A's picks, autopilot)

1. Q1 b. After a successful setup, akrogon writes the marker at the worktree's `git rev-parse --git-path akrogon-setup` holding the exact `setup` string. Setup is due when the marker is missing or holds another string. `src/batch.ts:move` deletes the marker when it moves the worktree's files. There is no `node_modules` existence trigger (removing over adding, and it is C's path 4). Dissent: C keeps it.
2. Q2 b. The setup step runs in `ensureWorktree`, after `writeLeafEnv` and before the final `saveState`, so every allocate (start, re-prompt, `seatCommand`, `broadcastPass`) passes it. When setup is due and a recorded seat of the leaf is busy (live with status not `idle`/`done`), the leaf is not dispatched this pass and waits without an error. `seatCommand` refuses, naming the busy seat. The next pass after that turn ends runs setup. Dissent: B keeps the delivery-point call site.
3. Q3 a. No new deadline: no named source exists for a value (standing design, bound line), and the existing bounds hold (F6). Dissent: C and D keep b. Stated residual: a hung setup holds the home `.lock` until the listener's pass deadline or an operator kill.
4. Q4 a. Env is `constructedEnv(repo, <scratch dir under the leaf temp>)` as is, with the scratch dir removed after the run.
5. Q5 b. A failed or refused setup in a worktree this call just created removes it, extending the existing remove-on-failure in `createSparseWorktree`, and records no `worktree:`. An existing or adopted worktree is kept, without a marker.
6. Q6 a. With `setup` unset, nothing runs and dispatch is unchanged.
7. Command: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <setup>` in the worktree with stdin ignored, then in-process `guard(worktree, ['own-modules'])`, then the marker. A failure throws with exit code and output through the per-leaf report path, and the next pass retries.
8. Q7 a. The leaf removes the LESSONS line and appends `Applied` to learnings/history/2026-11-25-fresh-worktree-skips-setup.md.
9. Docs: `docs/reference/config.md` and `docs/reference/checks.md` state that `setup` also runs before a seat works in a fresh or moved leaf worktree. Check-side `withSetup` and verify are unchanged.
10. Exclusions: worker (`-uN`) and direct-route worktrees made by skills, verify, `buildStack`, `self-update`.
- F7 Final-shape checks: slots/final-check-{B,C,D}.md (2026-11-25). B found no blocker. D B1: `error` is an ended seat (`src/seat.ts` `ended`), and `observeBusy` counts only `working`/`blocked`. D B2 and C 1: `ensureWorktree` gets only the `live` boolean, and `ensureLeafTemp` runs after it. D B3: `createSparseWorktree` is shared with verify and `buildStack`. C 2: `allocate`'s `null` means capacity to `dispatchLeaf` and `seatCommand`. C 3: a leaf's live run-check runs in the worktree while its seat is idle (`dispatchSlot` already guards on `liveRuns`). C: `guard` returns 1 and does not throw. C: `move` changes files before it can return `dirty-ref`.

## Taken

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
