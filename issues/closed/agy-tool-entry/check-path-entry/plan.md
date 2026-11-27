# Plan: check-path-entry

Serial-solo, one unit.

1. Red first: one case in tests/run-check.test.ts (criterion 1), committed with a Test-Change trailer.
2. src/tool-cgroup.ts: export `isToolEntryDir(dir, home)` from realBash's filter; realBash uses it (criterion 2).
3. src/run-check.ts constructedEnv: drop PATH entries where `isToolEntryDir(dir, homePath())`, keeping empty segments and order.
4. Proofs: the new case; `PATH="$HOME/.akrogon/tool-entry:$PATH" bun src/akrogon.ts run-check -- bun test tests/tool-entry.test.ts` from the worktree (criterion 3); `akrogon verify` (criterion 4).
