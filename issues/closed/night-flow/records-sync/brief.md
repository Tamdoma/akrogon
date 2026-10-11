# Brief: records-sync

## What
Every registered checkout keeps itself in step with its remote's default branch, without a person running `akrogon sync`, and without touching files agents are writing.

- When self-update already runs (after a merge, for the selected repo on typed `akrogon next <slug>`, and for every registered repo on `--all` or `--resume`), it now runs for every registered repo's root checkout on its default branch, not only akrogon's. Install and skill links stay akrogon-only.
- When every local-only commit, checked one by one, touches only sync-eligible issue records (the `eligibleRecord` rule, `src/sync.ts:6-13`), they are replayed onto the fetched default branch in a temporary worktree under `~/.akrogon/scratch/<repo>/`, pushed with a normal push, and the checkout moves to the pushed commit with `git reset --keep`. Then the existing fast-forward and akrogon deploy run as today.
- Uncommitted record edits are never staged or committed by this path. `akrogon sync` keeps that job.
- No stash and no autostash. A file with uncommitted edits is never rewritten.
- Sync's incoming-tree checks (active lock paths, ignored operator path collisions) apply to every incoming move, including a behind-only update.
- Outcomes are reported separately in the self-update line: pushed and moved; pushed with the checkout pending (an incoming change touches a dirty file), keeping local history and edits; not pushed. A record file changed on both sides pushes nothing, names the paths and `akrogon sync` as the route, and leaves no rebase in progress and no temporary worktree behind. A local code commit keeps today's skip. Never force-push.
- Lock order stays: the install lock outside, the global `.lock` inside, taken once by a shared inner sequence that `akrogon sync` also uses. `syncCommand` itself is not called.

Owned: `src/self-update.ts`, `src/sync.ts` (the shared inner sequence), `src/next.ts` (self-update call sites only, if scope needs it), their tests, `docs/guide/install.md` (today `:36-40`), `README.md` (the self-update line, today `:82`), `docs/guide/files.md` (the sync section, only if the shared sequence changes what it says) (A,B,C).

## Why
Tamdoma/akrogon#80: self-update skipped every deploy while the akrogon checkout held one local handoff commit and was 26 behind, so fixes merged on GitHub never ran that night. The operator asked for everything to stay synced so desynced files never cause errors, with care not to disturb leaves while main moves (chart night-flow, fork keep-running, R).

## Done-criteria
1. A registered checkout whose local-only commits each touch only eligible issue records ends a self-update trigger with those commits on the remote's default branch, the checkout at the pushed commit, any incoming commits applied, and its uncommitted edits unchanged and unstaged. This holds for akrogon's checkout and for another registered repo's checkout.
2. A local-only commit touching any path outside eligible issue records, including a code change undone by a later commit, leaves the checkout and the remote unchanged, and the line keeps today's skip.
3. When an incoming change touches a file with uncommitted edits, nothing is stashed and that file is unchanged. The line says the push happened (if one did) and the checkout is pending, naming the path. A later trigger after the edit is committed or gone moves the checkout without pushing the same records again.
4. A record file changed both locally and on the remote pushes nothing and leaves the checkout unchanged. The line names the paths and `akrogon sync`. No rebase is left in progress and no temporary worktree remains.
5. An incoming tree that adds a tracked active lock path, or that collides with an ignored operator path, is refused as `akrogon sync` refuses it, also on a behind-only update.
6. `akrogon sync` keeps its behavior, including staging eligible uncommitted records.
7. `docs/guide/install.md` and `README.md` describe self-update for every registered checkout and the record replay, drop the manual sync step for record-only ahead or diverged history, and keep the operator actions for a wrong branch, detached HEAD, local code commits and overlapping edits (A,B,C).
