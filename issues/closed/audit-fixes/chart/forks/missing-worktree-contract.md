# F6: what "missing worktree" covers

## Question
Q3. Does done-criterion 4 cover only transitions that reach `requireClean`, or every `akrogon phase` path on a leaf with a missing worktree?

### Carries
No existing locks. Note text: "At the top of requireClean in src/phase.ts, throw Missing worktree: <path>". Criterion 4: "akrogon phase on a leaf whose worktree folder is gone reports the missing path, not a spawn error."

## Findings
(both) `transition` calls `requireClean` at `src/phase.ts:127` after phase and slot validation. `recoverMerge` calls it at :169. The narrow check covers both.
(B) `phase <slug> merged` on an already-merged sourced leaf runs `completeOwner` before `transition` (:192), and `closeSources` spawns `git rev-parse HEAD` in the worktree at `src/pull.ts:192`. That path still fails with ENOENT. A deleted command cwd fails earlier in repo resolution. Covering those needs more checks than the note asks for.
(A) The narrow contract matches the note's fix text. Criterion 4 as written is broader than the fix.

## Taken
Operator answer: `3a`, 2026-09-14. Criterion 4 covers transitions and merge recovery that reach `requireClean`. Reason: matches the fix text. Foreclosed: a second check in `closeSources` or a shell-wide missing-cwd guard.
