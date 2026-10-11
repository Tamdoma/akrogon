# Keep running

## Question
Q1 What guarantees an `akrogon next` pass overnight when no agent event fires (a seat that never started, a leaf waiting at merge for main to move, all seats idle)?
Q2 How does landed akrogon work reach the running checkout when the local checkout holds unpushed commits (#80)?

### Carries
- failed-exits Taken S5: retry on the next pass needs a trigger (B F3, C D2).
- stop-rules Taken S1: a leaf waits at merge until the base moves; something must notice the move.
- `docs/guide/next.md:53,147`: passes come from herdr events, startup resume, merge wake and dependents; otherwise a manual `akrogon next`.
- `skills/watch-issues/SKILL.md:14-18,36-46`: the watch is a session cron that deletes itself under its stop rule.
- `src/self-update.ts:46-47`: any local-ahead commit skips the deploy (#80).

## Findings
Merged notes: slots/keep-running-merged.md (B: slots/keep-running-B.md, C: slots/keep-running-C.md). Rebuttals: slots/keep-running-rebuttal-B.md, slots/keep-running-rebuttal-C.md.

- better-than-training · `skills/watch-issues/SKILL.md:12-18,36-45`, `src/next.ts:1374-1406`, `plugin/herdr-plugin.toml`, read 2026-10-11 · no pass is guaranteed to recur once agent activity stops; a live watch covers idle and absent seats but deletes itself under its stop rule (B,C; B F1 narrowing).
- operator · `issues/chart/seat-stall-detection/CHART.md:15-16`, `forks/stall-detection.md:34-36`, 2026-09-18 · "no hidden watchdogs, clocks or polling", forecloses the systemd user timer by name; herdr v0.9.1 has no periodic trigger (A,C). B did not have this lock in the blind brief and claims no authority to override it (B F2).
- better-than-training · `loginctl show-user ivan -p Linger` prints `Linger=yes`, 2026-10-11 · a user timer would run while logged out; proves possibility, not permission (B,C RB2).
- better-than-training · `src/next.ts:1543-1572` · typed `akrogon next <slug>` is non-automatic and ignores pause; the watch skill never mentions pause, so the watch can restart a paused repo (C RB5, verified by A).
- better-than-training · `src/self-update.ts:28-30,46-53`, `src/sync.ts:9,22-31,109-136`, `src/state.ts:204-216` · self-update skips on any ahead commit; sync's CLI stages unfinished edits and lacks a per-commit boundary; record integration must take the global lock under the install lock with explicit ownership (B F3, C).
- Per-commit classification of ahead commits, not net diff: a reverted code commit still lands code when history is pushed (B, C RB6 agrees).
- Intake does not establish why the handoff commit stayed local (B F4, `INTAKE.md:60,80`).

## Taken
Operator, 2026-10-11, verbatim: "1a - but this shouldn't be formal. I always do it, but there should be NO dependencies on this so we don't overcomplicate. | 2a - make sure they're always synced when appropriate, so I don't get errors. Be careful when updating Maine when other leaves are running so it doesn't create conflicts. Just follow my intent. My intent is to have it all synced up so that the problems never arise because of desynced files. |"

Final shape checked by B and C: slots/keep-running-final-shape.md, slots/keep-running-final-check-B.md, slots/keep-running-final-check-C.md.

### W watch-steady (Q1)
- The watch is an informal operator habit. No leaf, done-criterion, doc or design depends on it; S1 and S5 are correct with no watch and move on the next pass from any existing source (herdr event, startup `--resume`, merge wake, dependents, manual).
- Skill text only, `skills/watch-issues/SKILL.md`: the watch never self-deletes; remove the stop rule (`:45`) and every reference to it, including the refusal to create a job when the rule holds (`:16-18`), the tick's delete path (`:38`) and the automatic-stop notice (B F1). The wording is "never self-deletes": session loss and the 7-day job expiry remain.
- The tick runs nothing for a repo `akrogon status` reports paused, since typed `next <slug>` ignores pause (`src/next.ts:1572`, C RB5).
- No expiry warning and no doc stating the watch is required.

### R records-sync (Q2)
1. Triggers stay as today: self-update runs after a merge (`src/next.ts:1382`), for the selected repo on typed `next <slug>`, and for every registered repo on `--all`/`--resume` (`:1531-1543`); herdr-hooked passes do not run it (B F2). No new trigger. The #80 case resolves at the next merge or startup.
2. Scope: every registered repo's root checkout on its default branch; install and skill links stay akrogon-only. Fetch cost matches today's one fetch per pass per selected repo (C F5).
3. Committed history only: when every local-only commit, classified per commit, touches only sync-eligible issue records (`src/sync.ts:22-31`), replay them onto the fetched default branch off the working tree, push, then move the checkout with `git reset --keep <pushed>` (C F2; `--ff-only` refuses after a replay, `reset --hard` destroys edits). Uncommitted record edits are never staged by this path; `akrogon sync` keeps that job. Reason: every push to framework main runs its release workflow (`release-branch.yml:3-5`), so per-pass record commits would add a workflow run per pass; an issue-only change publishes no release commit (B F6, `:29-44`).
4. No stash, autostash or rewrite of a file with uncommitted edits: seats write records in the root checkout while leaves run. The replay runs in a temporary worktree under `~/.akrogon/scratch/<repo>/`, never under the repo root; on any stop it is aborted and removed before the line is returned (C F3).
5. Incoming-tree checks from sync apply to every incoming move, including a behind-only update: incoming or replayed active lock paths (`src/sync.ts:35-75`) and ignored operator path collisions (`:78-106`) (B F4).
6. Outcomes are reported separately: pushed and checkout moved; pushed but checkout pending (the keep move refused because an incoming change touches a dirty file), keeping local history and dirty edits; not pushed. A record file changed on both sides stops that repo's integration and the line names the paths and `akrogon sync` as the resolution route; never guess, never force-push. A local code commit ahead keeps today's skip (B F5).
7. Lock order as today: install lock outside, global `.lock` inside, taken explicitly by the shared inner sequence; `syncCommand` is not called (B F3, C F6).
8. Docs: `docs/guide/install.md:40` loses the sync remedy for record-only ahead or diverged history only; wrong branch, detached HEAD, local code commits and overlapping edits keep their operator actions (B F7).

### Dropped after the check
- Persisting merge test stamps through a rejected push: a records-only main move already reuses the test result in the same seat run, because the refusal returns the in-memory stamped record (`src/phase.ts:626`) and `restack` reads it (`:660-669,:882`); a full re-check happens only if the process stops between refusal and restack, and an `issues/config.yaml` change correctly re-checks (B F3, C F1). Record pushes therefore do not disturb merging leaves with no change.
- Leaf branches carrying rewritten record commits (C F4): new leaf worktrees branch from the tracking ref (`src/next.ts:334`), never from local-only commits.

## Proof after Taken (door, 2026-10-11)
- Operation: `git push <remote> <sha>:refs/heads/<default>` to GitHub with the operator's identity, the push records-sync performs.
- Evidence of real calls with that identity and command shape (`src/phase.ts:603`), made by akrogon's merge turn from the registered root:
  - akrogon: `issues/merge-attempts.jsonl` attempt d3c90131-d9be-4d46-a094-d3826502665b, outcome `merged`, tested_top 01ca1fbe8, end 2026-10-11T06:50:38Z; `git ls-remote origin refs/heads/main` now reads 9ed8865 (a later operator push). Remote https://github.com/Tamdoma/akrogon.git.
  - framework: `issues/merge-attempts.jsonl` outcome `merged`, tested_top ee8255d11, end 2026-10-11T07:25:36Z; `git ls-remote origin refs/heads/main` reads ee8255d11. Remote https://github.com/Tamdoma/tamdoma-framework.git.
- Identity: GitHub account ivanjuras through the https credential helper (gh keyring, scopes repo, workflow). Git 2.56.0. Read 2026-10-11.
- Cleanup: none; no proof fixture was created.
- Limits: proves push rights and command shape on two of the registered repos; does not cover other registered repos' remotes, a push from a temporary worktree (same repository credentials), or GitHub branch protection changes after this date. Leaf tests use local bare remotes; no live push during implementation.
