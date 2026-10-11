# Keep running, slot C

Blind notes. Read 2026-10-11. LC marks a low-confidence claim.

## Q1 What guarantees a pass overnight with no agent event

### 1. Pick
Keep the operator-started watch as the one periodic pass and make it unable to die on its own: delete the stop rule (`skills/watch-issues/SKILL.md:45`) so a watch ends only on `/watch-issues stop`. Nothing changes in `src/next.ts`.

Reason. The tick already covers the three cases in the question. Its Waiting rule (`SKILL.md:36`) runs `akrogon next <slug>` for any leaf whose required seat is idle or absent, which is exactly a never-started seat after failed-exits S5 and a merge waiter after stop-rules S1. What failed in #84 was not the tick's judgment but its life: the watch deleted itself on an empty tree, the handoff came after, and no watch existed for 6.4h (INTAKE.md, #84 Observation and Reproduction step 2). The watch is visible, operator-started and reports every fire, so it is not the hidden clock the stall-detection lock forbids (`issues/chart/seat-stall-detection/CHART.md:15`).

Cost. A Claude Code session must stay open overnight with the job in it, latency is up to 20 minutes, and the job still expires after 7 days (`SKILL.md:14-18`), so the watch is a weekly operator restart. Those are harness limits, not akrogon code.

### 2. Rejected
- O1 OS-level timer (systemd user timer or crontab) running `akrogon next --all`. Foreclosed by the lock in exact words ("Any systemd user timer ... Operator rule: no hidden watchdogs, clocks or polling", seat-stall-detection CHART.md:15). It also releases every open leaf, which breaks "You still choose when to release new work" (`docs/guide/install.md:86`) and `next.md:147`.
- O2 akrogon re-arming itself from existing events. The re-arming that can exist already does: a committed phase move and pass end run `mergeWake`, which re-sweeps merge leaves and self-updates on `merged` (`src/next.ts:1374-1390`, `next.md:109`); a completion starts same-repo dependents (`next.md:133`); herdr startup runs `pull --all` then `next --resume` (`plugin/herdr-plugin.toml:7-12`). The three cases in Q1 have no event source: no pane exists for a never-started seat, an external push to main raises no local event, idle seats raise nothing. Any new source would be a clock, which the lock forbids.
- O3 Long-lived `akrogon watch` process. Foreclosed by the same lock line.
- O4 Startup `next --all` instead of `--resume`. Same release problem as O1, and only fires when herdr restarts.

### Passes that exist today and what each misses
- P1 Herdr plugin events `pane.agent_status_changed`, `pane.exited`, `pane.closed`, `tab.closed` (`plugin/herdr-plugin.toml:14-28`, schema `src/next.ts:93-114`; a `working` status returns at once, `:1526`). Misses: anything without a pane, so a seat whose launch produced no agent (S5), a leaf waiting at merge (S1), and all-idle repos. LC: a hooked pane event runs a targeted pass, not a sweep (`src/next.ts:1532`), so another seat's event does not reach the never-started seat.
- P2 Startup `pull --all` then `next --resume`: allocated work only (`next.md:53`). Misses everything between herdr restarts.
- P3 Merge wake after each committed phase move and at pass end (`next.md:109`, `src/next.ts:1374-1390`). Misses a base moved by a push from outside this checkout: no pass is running, so no wake.
- P4 Dependents on completion, same repo only (`next.md:133`). Misses cross-repo and non-dependent leaves.
- P5 Manual `next` / `next --all` (`next.md:51-55,147`). Misses the night.
- P6 Watch tick every 20 min, Claude Code only, operator-started, self-deleting on stop rule, 7-day expiry (`SKILL.md:12-18,45`). Misses: after self-deletion (#84), after session close, after expiry.

With the stop rule gone, P6 covers P1 through P4's gaps for the open repos it is told to watch, as long as the session lives.

### 3. Evidence
- Operator, lock: seat-stall-detection CHART.md:15, read 2026-10-11.
- Operator, binding words: night-flow INTAKE.md operator notes, read 2026-10-11.
- Operator, #84 timeline and the "watch stopped on an empty tree and new leaves were handed off after" step: INTAKE.md #84 Observation and Reproduction, read 2026-10-11.
- Practitioner, passes: `docs/guide/next.md:51-55,109,133,147`; `src/next.ts:93-116,1374-1390,1522-1536`; `plugin/herdr-plugin.toml`; `plugin/next.sh`, `plugin/pull.sh`, read 2026-10-11.
- Practitioner, watch rules: `skills/watch-issues/SKILL.md:12-18,36-45`, read 2026-10-11.
- Practitioner, no herdr schedule hook configured: grep of `plugin/` and `docs/guide/install.md` for schedule/timer/cron/interval returned nothing; `herdr plugin --help` lists no schedule command, read 2026-10-11.
- Model-knowledge, LC: whether a current herdr version exposes a timed plugin event at all. Not verified.

### 4. Pitfalls
- R1 Session closes overnight, watch dies with it. Removed only by a trigger outside the session, which the lock forbids. Operator practice is the removal: one dedicated session hosts the watch. Named in Q5.
- R2 7-day job expiry ends the watch silently. The tick never creates a job (`SKILL.md:16`), by design. Removal: the tick reports the job's remaining life when under one day so the operator reruns `/watch-issues`. Cheaper than letting a tick re-create jobs, which reopens the duplicate-job problem the identity rule exists for.
- R3 Watch running on a repo with nothing to do forever. Not a fault: a tick that finds nothing prints nothing and costs one observe script. The stop rule bought nothing except #84.
- R4 Tick's recovery rule ends after two unproductive cycles (`SKILL.md:39`). After S4/S5, delivery faults no longer produce `failed`, so this rule sees fewer cases. Leave it.
- R5 A merge waiter whose base is moved only by an external push waits up to 20 minutes. Acceptable, and the only alternative is polling git, foreclosed.

### 5. Questions this fork does not ask
- Q1a Does the operator count the visible, operator-started session cron as outside "no hidden watchdogs, clocks or polling"? My pick assumes yes. If no, nothing event-driven covers the three cases and the honest answer is that nights need an operator-run session.
- Q1b Does herdr expose a scheduled or timed plugin event? If it does, the operator's own words ("use Herdr's machinery if possible") make it the elegant replacement for the session cron: no Claude Code session, no 7-day expiry, same tick. Verify before taking any leaf text.

## Q2 Landed work reaching the checkout when local is ahead

### 1. Pick
Self-update syncs instead of skipping when the ahead commits touch only sync-eligible issue records. At `src/self-update.ts:46-47`: list `git diff --name-only <target>...HEAD`; if every path passes the sync eligibility predicate (`src/sync.ts:22-31`: under `issues/`, not `issues/seeds`, not `.lock`, not the worktree store), run `git rebase --autostash <target>` and `git push <remote> HEAD:<default>` (`src/sync.ts:122-136`) under the globalHome `.lock` that the fast-forward already takes (`self-update.ts:51-53`), then continue to `bun install` and skill reconcile. If any path is code, keep today's skip line. Delete the "ahead of or diverged ... run `akrogon sync`" operator action at `docs/guide/install.md:40`. Share the predicate and the rebase-push sequence between `sync.ts` and `self-update.ts` as one function.

Reason. #80 is exactly this shape: one local handoff commit `add issues`, 26 behind, and the step refused to do what `akrogon sync` does by hand (INTAKE.md #80 Observation; `gacp.md:31` shows the handoff commit text). Records are the only thing the lifecycle commits locally, so records-only ahead is the normal state, not an exception. A code commit ahead on main is an operator decision and stays one.

Cost. Self-update now writes to origin during a `next` pass, and a rebase of records can conflict. Both already exist in `akrogon sync`; this moves them to the trigger.

### 2. Rejected
- O5 Door pushes at handoff. The handoff already commits and pushes (`docs/guide/gacp.md:31`). #80 shows the push did not land because main was 26 behind, so a door push needs the same rebase, and every seat's record commit creates the ahead state again. Fixes one producer of many.
- O6 Separate runtime checkout. Removes the collision by adding a second checkout, its links and its install path (`install.md:33-35` says the links point at this checkout and that is the program). Records still need pushing from the operator checkout. More parts, already off route (CHART.md:21).
- O7 Self-update calls `syncCommand` directly. `sync` takes the globalHome `.lock` at entry and self-update takes it for the fast-forward; `withLock` is `flock -x` (`src/state.ts:204-214`) so a nested take on the same path waits forever. Share the inner sequence, not the command.
- O8 Push every ahead commit regardless of content. Deploys untested code from a local main on a `next` trigger. No.

### 3. Evidence
- Operator, #80 verbatim with the skip line and the local commit: INTAKE.md #80, read 2026-10-11.
- Practitioner, skip and lock order: `src/self-update.ts:19,28-29,44-53,62-74`, read 2026-10-11.
- Practitioner, sync predicate and sequence: `src/sync.ts:18-33,105-136`, read 2026-10-11.
- Practitioner, lock blocks forever when nested: `src/state.ts:204-214`, read 2026-10-11.
- Practitioner, operator action documented: `docs/guide/install.md:33-40`, read 2026-10-11.
- Practitioner, handoff commit: `docs/guide/gacp.md:31,98`, read 2026-10-11.
- Practitioner, current checkout is level with origin now: `git status -sb` prints `main...origin/main`, read 2026-10-11, so the #80 state is not reproducible here today.

### 4. Pitfalls
- R6 Push rejected because origin moved between fetch and push. Removed by the existing retry: the step reports the failing step and retries at the next trigger (`install.md:38`).
- R7 Autostash or rebase conflict on records. Report the conflict paths in the line as `sync.ts:127-134` does; this is a real operator case and the only residual manual step.
- R8 Lock nesting between `akrogon-install.lock` and globalHome `.lock`. Removed by O7's shape: one take of `.lock` around rebase and push, same as the fast-forward today.
- R9 Rebasing main while seats run in worktrees. Worktrees hold their own branches; a rebase of the checkout's main does not touch them. The merge seat already pushes under the same `.lock`.
- R10 Tracked `held.yaml` at toolRoot creating ahead commits. Gone with stop-rules S1.
- R11 `bun install --frozen-lockfile` after a rebase that brings a lockfile change. Already the normal fast-forward path.

### 5. Questions this fork does not ask
- Q2a Are local code commits ahead on the akrogon main ever intentional overnight? If never, the skip line for code-ahead should say what to do (`git push` or drop) instead of `run akrogon sync`, which will now refuse the same way.
- Q2b Should the merge seat's own push of records be the push of record, so self-update rarely finds ahead at all? If seats already push at each phase move, the pick covers only the handoff and any missed push, and is still correct.
