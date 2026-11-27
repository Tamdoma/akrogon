# Leaf review, slot D: setup-before-seat

### 1. Criterion 8 requires a self-referential commit hash

File: `setup-before-seat/brief.md`, done-criterion 8. Defect: `Applied <date> by <commit>: ...` cannot be met in the leaf's own diff, because the commit containing that line cannot contain its own hash. It also breaks the standing format in `learnings/history/2026-11-24-leaf-worktree-stale-base.md` (`Applied 2026-11-25 by src/next.ts:315: ...`). Replacement text: "`learnings/history/2026-11-25-fresh-worktree-skips-setup.md` ends with `Applied <date> by the setup step in src/next.ts:ensureWorktree: <what stops it>`."

### 2. A changed `setup` string leaves a marker behind on failure

File: `setup-before-seat/brief.md`, What point 5 and done-criterion 5 ("an existing or adopted worktree stays, with no marker"). Defect: when setup is due because the `setup` string changed, the worktree already holds a marker with the old string, and nothing in the brief or design deletes it. A failed run then leaves a marker on disk, so criterion 5's proof observes one and fails for the wrong reason. The code path is the due test in the design's setup helper (marker content differs from `repo.config.setup`). Replacement text, in What point 2: "The step first deletes any marker whose content differs from the current `setup` string, then runs setup and the guard, and only on success writes the marker with the exact `setup` string."

### 3. The busy outcome carries nothing `akrogon seat` can name

File: `setup-before-seat/design.md`, Leaf architecture, `src/next.ts:allocate` ("It returns a distinct busy outcome") against `brief.md` done-criterion 4 ("`akrogon seat` on that leaf exits non-zero naming the busy seat or run"). Defect: `seatCommand` in `src/next.ts` receives only what `allocate` returns, so a bare busy outcome cannot name the seat address or the live run, and `seatCommand` holds neither `found` nor the `liveRuns()` entries to recompute it. Replacement text: "It returns a distinct busy outcome beside `Allocation` and the capacity `null`, carrying the busy seat's slot and address or the live run's record, so `seatCommand` can name it in its refusal."

### 4. The guard's message cannot reach the thrown error within the owned surfaces

File: `setup-before-seat/design.md`, setup helper ("a non-zero return throws with the guard's message"), and `brief.md` done-criterion 5 (a report naming "the exit code and the output" also for the guard case). Defect: `src/guard.ts` `guard` returns a number and writes its message with `console.error`; it returns no message or output for the helper to put in the thrown error, and `src/guard.ts` is not an owned surface. The report line from `src/next.ts` `report` would name neither. Replacement text: "Then `guard(worktree, ['own-modules'])` from `src/guard.ts`: a non-zero return throws `setup left no own node_modules in <worktree> (akrogon guard own-modules)`, and criterion 5's exit-code and output wording applies to the setup command itself."

### 5. The run form does not say how the flock line gets a shell, an env, or captured output

File: `setup-before-seat/brief.md` What point 2 (shell form `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <setup>`) against `design.md` setup helper ("`flock <install lock> sh -c <setup>` as argv"). Defect: taken literally as argv, `$(git rev-parse ...)` is never expanded, so `flock` locks a literal path in the worktree instead of the per-worktree install lock `src/config.ts` `setupCommand` uses. No owned surface or named call carries the env either: `src/shell.ts` `run` and `command` accept no env, so `constructedEnv` and stdin-ignored plus captured stdout and stderr (criterion 5) have no stated route. Replacement text: "Run: resolve the install lock with `git rev-parse --git-path akrogon-install.lock` in the worktree, then `spawnCaptured(['flock', <lock>, 'sh', '-c', setup], {cwd: worktree, env: constructedEnv(repo, scratch)})` from `src/shell.ts` (stdin ignored by default, output captured); a non-zero result throws a `CommandError` with that argv, cwd and captured output."

### 6. The marker path has two consumers and no named single home

File: `setup-before-seat/design.md`, Leaf architecture (setup helper marker path, and `src/batch.ts:move` marker deletion), Literal interfaces. Defect: the `akrogon-setup` git-path name is spelled by both the setup helper (in `src/config.ts` "or in `src/next.ts`") and `src/batch.ts:move`, with no single home named; `src/batch.ts` importing a helper from `src/next.ts` would add to the existing `next` and `batch` cycle, and a helper in `src/next.ts` importing `constructedEnv` from `src/run-check.ts` is fine, but one in `src/config.ts` would cycle with `src/run-check.ts`, which imports `setupCommand` from config. The existing Open line covers only the install-lock expression. Replacement text: "The marker path and deletion helper live in `src/config.ts` beside `setupCommand` and are imported by the setup step in `src/next.ts` and by `src/batch.ts:move`; the step that runs setup lives in `src/next.ts`."

Most important defect: number 2, because it makes criterion 5's changed-string case unprovable as written, and the same stale marker would survive a setup process killed after the config changed.
