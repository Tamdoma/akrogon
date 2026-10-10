# Proposed final shape 3 (A), within operator's 1c, answering check2 B F1-F3, C D1-D4

One self-update step, `selfUpdate`, keyed on identity realpath(repo.root) == realpath(toolRoot).
Triggers (only these):
 a. mergeWake for the akrogon repo, after a lifecycle landing (src/akrogon.ts:82 -> next.ts:1287), independent of whether a merge holder remains.
 b. `akrogon next --resume` and `next --all` (herdr startup) and a manual `akrogon next` whose selected repos include akrogon.
Not triggers: per-pane hooked events (they touch only the pane's owning repo; adding a fetch per event is load for no landing). Direct route: akrogon has `direct: false`; out of scope, recorded Off route. By-ancestry completion and other-machine landings deploy at the next trigger (startup or next akrogon merge or manual next): accepted.
Step:
 1. Own `git fetch <remote> <default_branch>` (no reliance on a prior fetch).
 2. Root on default_branch, HEAD ancestor of and behind <remote>/<default_branch>: `git pull --ff-only <remote> <default_branch>` under the global lock. Lock released before step 3.
 3. Every run of the step (not only after a moved HEAD): `bun install --frozen-lockfile` and skill-link reconciliation split out of install() (links only; no herdr integration/plugin calls; a conflict is printed, not thrown). This makes a failed install or link retry at the next trigger without pending state.
 4. One printed line: `deployed <old>..<new>` only when pull, install and links all succeeded; `akrogon current <sha>` when nothing to pull and setup succeeded silently or omitted; otherwise the failing step, git/bun error, lag count and remedy (`akrogon sync` when ahead/diverged; commit or finish overlapping edits). Never throws; never alters the merge/next result.
 5. Never checkout, stash, reset, rebase, or merge root state. Other branch, detached, diverged: skip and report.
