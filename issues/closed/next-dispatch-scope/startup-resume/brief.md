# Brief: startup-resume

## What
Add `akrogon next --resume`. Across all registered repos it dispatches only leaves that are already allocated (state has `tab` or `worktree`) or in phase `merged`, then runs the existing cleanup. It never allocates a new leaf. The Herdr plugin startup runs `next.sh --resume` instead of `next.sh --all`. A manual `akrogon next --all` keeps its current behavior.

## Why
Tamdoma/akrogon#29 follow-on: Herdr startup runs `next.sh --all` (`plugin/herdr-plugin.toml:7-11`) from outside any repo, which calls `sweepAll` and starts every ready leaf in every registered repo on each Herdr restart.

## Done-criteria
1. `src/akrogon.ts` accepts `--resume` for `next`, rejects it combined with a target or `--all`, and the usage and command-reference contract (`tests/command-reference.test.ts`, which checks `README.md` against `src/akrogon.ts`) list it.
2. `plugin/herdr-plugin.toml` startup runs `["sh", "next.sh", "--resume"]`.
3. New test in `tests/next.test.ts`: two registered repos, each with one allocated leaf at an idle pending seat and one unallocated ready leaf. `next --resume` advances both allocated leaves and leaves both unallocated leaves without a tab or attempts.
4. New test: a merged leaf still in `issues/open/` under `--resume` gets owner completion and cleanup (keep `startup retains completed issue resources while an epic sibling remains unfinished` passing, switching it to `--resume` if it models startup), and its unallocated dependent is not started.
5. `docs/guide/next.md` (the "Startup also runs a sweep" line) describes startup as resume-only. Startup cleanup wording in `limits.md:10`, `problems.md:51` and `merge.md:27` stays true, or is corrected if it no longer is.
6. `bun run format`, `bun run typecheck` and `bun test` pass.

## Credentials
None.
