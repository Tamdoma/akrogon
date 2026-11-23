# Intake: footprint

## Operator source (2026-11-22, chat)

"One more question. The work trees—I saw that one of the problems was that they were copying the node modules files. Are we addressing that? We want to minimize the size footprint everywhere where possible."

"f6, do the cleanup, and make sure the node_modules are optimally loaded. In fact, there should be no redundancies, and the minimal file size and no overgrowth MUST be maintained in Akrogon and akrogon consumed repos."

"send it to consultants as well, and chart if needed, but continue also working on what you're working on, please."

## Agent findings (A, 2026-11-22)

- Worktree node_modules: every JS repo installs with `bun install --frozen-lockfile --backend=copyfile` (operator rule 2026-10-27, Tamdoma/akrogon#122, chart bun-copyfile). On btrfs, the copies share extents: a framework worktree's node_modules shows 1.19-1.22 GiB total, 76 MiB exclusive and 1002 MiB shared (`btrfs filesystem du -s`). 20 node_modules dirs in the store show 21 G apparent and about 1.5 G real. ext4 PCs get no sharing.
- About 18 framework worktrees are in the store, some with -u1/-u2/-u3 copies. Which are dead is not yet known (census pending: slots/census-A.md).
- Related: run-scratch (run roots removed at end, RAM step parked), k1 (no compile cache, landed 0383d600), land-own-reds Q4 (a home deletes only names it derives).

## Operator answer Q1 (2026-11-22, chat)

"q1 - I have opened them from time to time, but not myself. I'm actually asking the agents what happened, where, etc. If only the git logs are enough, then we don't have to keep anything physical."
