# Merged map: fresh-worktree-setup

Sources: slots/map-A.md, map-B.md, map-C.md, map-D.md (blind, 2026-11-25). Tags name the slots whose map holds the line.

## Settled facts

- M1 Every dispatch path (`nextCommand`, `phaseWake`, `unpausePass`, `landedWake`, `broadcastPass`, `seatCommand`) holds the home `.lock` around allocate and delivery. Anything added there runs under it. Network work (`checkBase`, fetches) and `startSeat`'s up-to-60 s start proof already run under it (A,B,C,D).
- M2 `ensureWorktree` runs on every dispatch. Neither `state.worktree` nor path existence tells "setup ran here" (B F2, C, D).
- M3 Delivery has two shapes: a fresh `startSeat` (dispatchSlot, seatCommand) and `hc send` to a live idle seat (`dispatchSlot` `deliver`). A hook at `startSeat` alone misses re-prompts (B F3, C 1B.2, D O2).
- M4 `src/batch.ts:move` (via `applyTop`, from the merge turn and `restack`) runs `git reset --keep` in the leaf worktree. `node_modules` survives, so a new dependency on main is missing while `guard own-modules` passes (C Obs 2, B F4, D).
- M5 First allocation adopts an existing worktree whose branch has its own commits (direct route) (B F5, C, D).
- M6 `git rev-parse --git-path akrogon-install.lock` is per worktree, not per repo (B O-A, C Obs 1, D OBS1). A's map said per repo: corrected.
- M7 Installs: framework warm 1.95 s, repeat about 10 ms, cold cache 33.5 s (B O-B). akrogon 6 ms / 0 ms (A O1). pi-extensions' setup is `npm ci` per package dir, which deletes `node_modules` every run (B, C, D). varhop's is unfrozen `bun install`. mdcny-ghl-data-pulls and clinique-la-roya have `package.json` and no `setup`. herdr-setup has neither (B F7, C P5, D).
- M8 A file at the worktree's `git rev-parse --git-path <name>` survives checkout, stays out of `git status` and goes with `git worktree remove` (D OBS2, C).
- M9 `checkedRun` is wrong at dispatch: admission queues behind a land hold (deadlock risk inside the home lock), `ownerRefusal` refuses closed owners (`broadcastPass`), captures land in `implementation/`, `refuse()` blocks on operator env (B F10, C 2b-1, D).
- M10 bun auto-loads `.env` from cwd for installs, and `writeLeafEnv` runs before any delivery (B F9, C P8).
- M11 `src/shell.ts:run` kills only the direct child on a deadline, so a timeout would leave `bun`/`npm` grandchildren holding the install flock (C P3).
- M12 Partial installs are real. `node_modules` existence proves nothing (B F13, D O8).

## Agreed

- G1 Not at creation only (A,B,C,D): misses adoption, recreation with recorded state, retry after failure, and M4.
- G2 Plain spawn, not `checkedRun` (B,C,D; A did not weigh it).
- G3 Inside the home `.lock` (A,B,D; C names it the simpler choice and asks for a decision).
- G4 A failed setup throws inside the per-leaf dispatch: report, skip, retry next pass, no seat starts, no `failed` move (A,B,C,D).
- G5 Do not touch verify, `buildStack`, `self-update` or check-side `withSetup` (B P7, C, D F5).
- G6 Worker (`-uN`) and chart direct-route worktrees are out of scope, recorded as an exclusion (B Q5, D Q4; C offers a one-line doc step as an option).

## Open

- Q1 Trigger. B: before every delivery, unconditionally. C, D: only when a success marker in the worktree git dir is missing, or names another `setup` string. `move` deletes it when files move, plus a cheap `package.json`-without-`node_modules` trigger. A: every seat start (A withdraws: M3).
- Q2 Call site. B: at the head of `startSeat` and before `deliver`'s send. D: inside `ensureWorktree` before the final `saveState`, skipped while a seat is live. C: before dispatch, never while a seat in the worktree is working.
- Q3 Bound. C: 300 s default with env override and a process-group kill. A: a bound. B: none, matching checks, and the listener's 20 min pass deadline. D: open.
- Q4 Env. B, C: `constructedEnv`'s copy list without `refuse()` throwing. D: the caller env as is.
- Q5 Fresh worktree after failure. C: remove a worktree this call just created. B, D: keep it and retry.
- Q6 Repo with `package.json` and no `setup`. C, D: skip entirely, so dispatch behaves as today. A, B: run the guard, so dispatch refuses until deps exist.
- Q7 Lesson retirement. D Q1: a seat's own mid-task rebase stays uncovered. B P8, C 5A: retire, since the lesson is about akrogon-made leaf worktrees.
- Q8 Docs. `docs/reference/config.md` and `docs/reference/checks.md` describe `setup` as check-time only (B P6, C P10).
