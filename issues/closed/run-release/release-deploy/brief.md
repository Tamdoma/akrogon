# Brief: release-deploy

## What
The installed `akrogon` command, its skill links, the systemd slice link and the herdr plugin link all point through `~/.akrogon/current`, a link to a complete release folder `~/.akrogon/releases/<commit>` built from the akrogon repo's merged main. Deploying a new release is separate from moving the workspace checkout: an uncommitted edit in the workspace never blocks a deploy, never goes live and is never undone into a revert. Consumes state-home's state home in `~/.akrogon`, so a release never holds state.

## Why
Today the command runs from the workspace checkout. An uncommitted edit there ran live, then blocked self-update ("checkout pending: ... commit or finish the overlapping edit", src/self-update.ts), and restoring it removed the feature (operator 2026-10-16, chart run-release).

## Done-criteria
1. After the akrogon repo's main moves, the next `akrogon next` pass builds `releases/<commit>` from that commit (sources plus `bun install --frozen-lockfile`) under a temporary name, renames it into place only when complete, then points `current` at it by renaming a temporary link; the pass prints the deployed commit.
2. An uncommitted edit to a tracked code file in the akrogon workspace checkout does not change what the installed command runs, and the next deploy still succeeds while the records move of that checkout reports pending.
3. The CLI link, every skill link (including a skill added or removed between releases), the systemd slice link and the herdr plugin link resolve through `current`; a deploy that adds or removes a skill leaves no dangling skill link.
4. A failed build (fetch, install or link step) leaves `current` on the previous release, dispatch continues, and plain `akrogon status` prints one line naming the attempted commit, the active commit and the failing step until a later deploy succeeds; a half-built folder is never linked.
5. Releases other than current and previous are deleted 24 hours after they were replaced; current and previous are never deleted.
6. On a host still running from the workspace checkout, the first `akrogon next` pass after this change merges switches the CLI and links to a release with no hand step, and the switch is printed.
7. Skill steps that locate the akrogon source through the resolved `akrogon` command keep working: the chart-issues presence check and merge-issue lesson helper import `src/*.ts` from the release, and seed-issue finds the akrogon repo without `git rev-parse` on a release folder.
8. The deploy stage reads a hold record in the state home naming one commit and never builds or flips to that commit while it is main; with no hold record it deploys as today. (B,C)
