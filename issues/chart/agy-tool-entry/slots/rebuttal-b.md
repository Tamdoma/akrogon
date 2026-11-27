# Rebuttal B

One disagreement, with my own proof line (merged map, "Proof").

- `PATH="$HOME/.akrogon/tool-entry:$PATH" akrogon run-check test` does not prove the fix before it is installed. `akrogon` on PATH is `/home/ivan/.local/bin/akrogon` -> `/home/ivan/.akrogon/releases/562611bd.../src/akrogon.ts`, the installed release, not the worktree. That command runs the old `constructedEnv` and stays red.
- Use the worktree entry for the end-to-end proof: `PATH="$HOME/.akrogon/tool-entry:$PATH" bun <worktree>/src/akrogon.ts run-check test`. Red at `r` on base, green with the fix.
- Same fact, one consequence for the route: the fix's own verify and land run the installed release, so they must not start from an agy seat. From t126 (claude) this holds. Agy-seated leaves such as charting-guide go green only after the new release is installed.

No disagreement on the rest: `constructedEnv` only, `homePath()` only, F5 and F6 seeded as one report.
