# Design: records-sync

## Binding decisions, verbatim

From `issues/chart/night-flow/forks/keep-running.md`, Taken. Operator, 2026-10-11, verbatim: "1a - but this shouldn't be formal. I always do it, but there should be NO dependencies on this so we don't overcomplicate. | 2a - make sure they're always synced when appropriate, so I don't get errors. Be careful when updating Maine when other leaves are running so it doesn't create conflicts. Just follow my intent. My intent is to have it all synced up so that the problems never arise because of desynced files. |"

R records-sync (Q2)
1. Triggers stay as today: self-update runs after a merge (`src/next.ts:1382`), for the selected repo on typed `next <slug>`, and for every registered repo on `--all`/`--resume` (`:1531-1543`); herdr-hooked passes do not run it (B F2). No new trigger. The #80 case resolves at the next merge or startup.
2. Scope: every registered repo's root checkout on its default branch; install and skill links stay akrogon-only. Fetch cost matches today's one fetch per pass per selected repo (C F5).
3. Committed history only: when every local-only commit, classified per commit, touches only sync-eligible issue records (`eligibleRecord`, `src/sync.ts:6-13`), replay them onto the fetched default branch off the working tree, push, then move the checkout with `git reset --keep <pushed>` (C F2; `--ff-only` refuses after a replay, `reset --hard` destroys edits). Uncommitted record edits are never staged by this path; `akrogon sync` keeps that job. Reason: every push to framework main runs its release workflow (`release-branch.yml:3-5`), so per-pass record commits would add a workflow run per pass; an issue-only change publishes no release commit (B F6, `:29-44`).
4. No stash, autostash or rewrite of a file with uncommitted edits: seats write records in the root checkout while leaves run. The replay runs in a temporary worktree under `~/.akrogon/scratch/<repo>/`, never under the repo root; on any stop it is aborted and removed before the line is returned (C F3).
5. Incoming-tree checks from sync apply to every incoming move, including a behind-only update: incoming or replayed active lock paths (`src/sync.ts:37-78`) and ignored operator path collisions (`:80-109`) (B F4).
6. Outcomes are reported separately: pushed and checkout moved; pushed but checkout pending (the keep move refused because an incoming change touches a dirty file), keeping local history and dirty edits; not pushed. A record file changed on both sides stops that repo's integration and the line names the paths and `akrogon sync` as the resolution route; never guess, never force-push. A local code commit ahead keeps today's skip (B F5).
7. Lock order as today: install lock outside, global `.lock` inside, taken explicitly by the shared inner sequence; `syncCommand` is not called (B F3, C F6).
8. Docs: `docs/guide/install.md:40` loses the sync remedy for record-only ahead or diverged history only; wrong branch, detached HEAD, local code commits and overlapping edits keep their operator actions (B F7).

Current anchors on main `c53f619` (the Taken lines above are older): merge self-update `src/next.ts:1387`, selected and all calls `:1540-1548`, refused push's in-memory record `src/phase.ts:671`, reuse `:714-719`, restack continuation `:932`, push `:652-654`. `src/self-update.ts`: non-akrogon early return `:19`, `ahead > 0` skip `:46-47`, `--ff-only` under the global `.lock` `:51-53`. `docs/guide/install.md:36-38` and `README.md:82` describe an akrogon-only, strictly-behind fast-forward and change with this leaf (B,C).

Dropped after the check (recorded in the fork): persisting merge test stamps through a rejected push, because a records-only main move already reuses the test result in the same seat run (`src/phase.ts:626,660-669,882`); and leaf branches carrying rewritten record commits, because new leaf worktrees branch from the tracking ref (`src/next.ts:334`). Record pushes therefore do not disturb merging leaves with no change.

Foreclosed (fork Findings and rebuttals): a systemd or other OS timer; door-only pushing at handoff; a separate runtime checkout for records; calling unrestricted `sync` on every trigger.

Exclusions: the watch belongs to `watch-steady`; the merge turn and its push are unchanged; `akrogon sync`'s staging is unchanged.

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: the properties are git state on a checkout and a remote, so the cheapest sufficient proof is the existing `tests/sync.test.ts` and self-update test style: real temporary repos with a local bare remote, real commits, dirty files, an ignored path and a lock path, and a second registered repo. Each criterion gets one case and one deliberate break turning it red (for example, replacing `reset --keep` with `--ff-only`). The GitHub push identity is the recorded door proof (readiness.yaml); no live push during implementation.

## Leaf architecture

- Shared inner sequence (`src/sync.ts`): the fetch, incoming-tree checks, replay and push, with explicit lock ownership, used by both `syncCommand` (after its own staging) and self-update (with no staging).
- Per-commit classification: `git log --format= --name-only --no-renames <target>..HEAD` per commit against the eligibility rule; any ineligible path keeps today's skip.
- Replay: a temporary worktree under `~/.akrogon/scratch/<repo>/` at the fetched tip, cherry-picking or rebasing the local-only commits there; patches already upstream drop out. Push the result with a normal push; a rejected push is reported and retried at the next trigger.
- Move: `git reset --keep <pushed>` in the root checkout; a refusal is the "checkout pending" outcome.
- Scope: `selfUpdate`'s early return for non-akrogon repos becomes a branch: the record sync runs for every repo, install and links only for akrogon's own root.
- Docs: `install.md:36-40` and `README.md:82` state the new scope and the replay (B H6, C F5).
- Not in scope: committing uncommitted records automatically, a new trigger, merge-turn changes, `.gitattributes` merge drivers.
