# Leaf review, Slot C: `fresh-worktree-setup` (`setup-before-seat`)

1. **File**: `setup-before-seat/brief.md`, Criterion 8 (line 42)
   - **Defect**: Requires `Applied <date> by <commit>: <what stops it>`, omitting `<file:line>`. A leaf cannot write its own commit SHA inside the commit that lands the fix, and an earlier commit SHA on the branch is rewritten when `buildStack` rebases onto `origin/main` at merge. Existing 2026-11-25 retirements in `learnings/history/` use `by <file:line>`.
   - **Rule / code path broken**: `skills/lesson-rule.md` Retire clause (`Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>`); `src/batch.ts:buildStack` (rebase rewrites branch SHAs).
   - **Replacement text**:
     > 8. The line "fresh worktree skips setup (2026-11-25)" is gone from `learnings/LESSONS.md`. `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` ends with `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>`, naming the setup step in `ensureWorktree`. Proof: the reviewing seat reads the diff.

2. **File**: `setup-before-seat/design.md`, Leaf architecture — Owned surfaces (lines 57–80, specifically line 73)
   - **Defect**: Line 73 requires `guard(worktree, ['own-modules'])` from `src/guard.ts` to throw "with the guard's message" (and `brief.md` Criterion 5 requires the thrown report to carry the output), but `src/guard.ts` is not listed as an owned surface. `src/guard.ts:guard` writes `missing own node_modules: ...` directly to `console.error` and returns `1` without returning the text, so the implementer cannot include the guard's message in the thrown `Error` without either duplicating the string in `src/next.ts` or editing an unowned file.
   - **Code path broken**: `src/guard.ts:guard` (`Promise<number>`, logs only to `console.error`) vs `src/next.ts:report` (records `error.message`).
   - **Replacement text**:
     - Add under `Owned surfaces`:
       > - `src/guard.ts`: export a helper returning the `own-modules` refusal message (or `null`) that `guard()` prints and the setup helper throws directly, keeping the message in one place.
     - Replace line 73:
       > - Then the `own-modules` check from `src/guard.ts`: a refusal throws with that message.

3. **File**: `setup-before-seat/design.md`, Leaf architecture — Owned surfaces (`src/next.ts:ensureWorktree`, lines 66–67)
   - **Defect**: Ordering `writeLeafEnv(repo, path, live)` before the busy check mutates `<worktree>/.env` without updating `state.yaml` when no seat is live (`live === false`) but a `run-check` is live (`liveRuns()` matches, so `busy === true`) and setup is due. `src/next.ts:writeLeafEnv` skips writing only when `live` is `true`, so it rewrites `.env` under the active `run-check` and then `ensureWorktree` returns the busy outcome before `saveState`, leaving `state.env_names`/`state.env_generation` out of sync with disk.
   - **Code path broken**: `src/next.ts:ensureWorktree` and `src/next.ts:writeLeafEnv` (`if (live) return false`).
   - **Replacement text** (lines 66–67):
     > - `src/next.ts:ensureWorktree`: passes `live || busy` to `writeLeafEnv`, then runs the setup step after `writeLeafEnv` and before the final `saveState`, in every branch that ends with a worktree on disk (created, recreated, adopted, kept).
     >   - When setup is due and busy is true, it returns the busy outcome without running setup or rewriting `.env`.

4. **File**: `setup-before-seat/design.md`, Leaf architecture — Consumers of changed state (line 90)
   - **Defect**: Marks `phaseWake`, `unpausePass`, and `landedWake` as "other `allocate` caller[s]" left `Open for the plan:`. None of those three calls `allocate` directly; all three route through `dispatchLeaf` (directly or via `resumeRepos`/`dispatchDependents` -> `sweep`), and `unpausePass` only throws on `invocation.skipped.size > 0`, which a busy `'waiting'` return does not touch. The only direct `allocate` callers are `dispatchLeaf`, `broadcastPass`, and `seatCommand` (already handled on line 62).
   - **Code path broken**: `src/next.ts:phaseWake`, `src/next.ts:unpausePass`, `src/next.ts:landedWake` (route through `src/next.ts:dispatchLeaf`).
   - **Replacement text** (line 90):
     > - `src/next.ts:phaseWake`, `unpausePass` and `landedWake` all route through `dispatchLeaf` (never calling `allocate` directly), so `dispatchLeaf`'s `'waiting'` return with no `report()` leaves `invocation.skipped` empty and needs no separate busy handling there.

5. **File**: `setup-before-seat/brief.md`, Criterion 5 bullet 2 (line 35)
   - **Defect**: States `a worktree that pass created is removed and state.yaml records no worktree:;`. That holds for a first allocation (`leaf.state.worktree === undefined`), but when `ensureWorktree` recreates a manually deleted worktree for an already-allocated leaf (`leaf.state.worktree` already set), throwing before `saveState` leaves the pre-existing `worktree:` field in `state.yaml` rather than erasing it.
   - **Code path broken**: `src/next.ts:ensureWorktree` (omits `saveState` on failure; does not strip a pre-existing `state.worktree`).
   - **Replacement text** (line 35):
     > - a worktree that pass created is removed, and on first allocation `state.yaml` records no `worktree:`;
