# Keep running: blind fork notes, Slot B

Read date for every source below: 2026-10-11. Repository paths are relative to `/home/ivan/Work/infra/akrogon`. These are proposals, not installed changes or proven unattended runs. S1–S5 remain binding.

## Q1: What guarantees another pass without an agent event?

### 1. Pick, reason and cost

**D1: One systemd user timer invokes the existing `akrogon next --resume` pass.** Keep the event hooks for immediate progress. The timer stays enabled when the queue is empty and stops only by operator action. Use one timer and one ordinary oneshot service for the whole registered machine, not one scheduler per leaf or repo. A nominal five-minute calendar schedule with missed-run catch-up is my starting policy, not a measured optimum.

This supplies a trigger independent of agent activity and the operator's chat session. `--resume` already sweeps allocated work across registered repos, respects pause, performs cleanup and runs merge passes. A delivery failure happens after allocation, so the never-started agent can be retried through that path. S1 must still fetch before excluding all merge waiters and returning. Scheduling cannot compensate for a pass that never observes remote main.

I reject the literal scheduled `next --all` form under today's release rules. It starts unallocated work and deliberately bypasses pause. `--resume` closes the stated gap without changing which work the operator released. If every new handoff should start automatically, that is a separate release decision.

Cost: two installed unit files, an installation/lifecycle check, periodic Git/Bun work and nominal five-minute retry latency plus scheduling and execution delay. Today even an empty resume sweep reaches self-update, which fetches and runs installation. The timer guarantees recurring attempts only while its user manager and host run and the preceding invocation can finish. It cannot promise a successful proof, login or merge.

### 2. Rejected options

- **O1: Keep the watch session cron alive forever.** Removing self-deletion fixes the empty-tree race, but not session loss, seven-day expiry or its Claude Code-only dependency. It spends agent work judging the whole inventory to provide a trigger that needs no judgment. Keep it available for deliberate supervision, not as the required dispatch clock.
- **O2: A timer running unchanged `next --all`.** Its pause bypass and new allocations are material behavior changes, not scheduling details. Running it outside a registered checkout also changes its reach to every registered repo.
- **O3: OS cron instead of systemd.** It can supply the missing trigger, but this host already has a user service manager. systemd provides timer status, journal output and one service instance without adding a shell wrapper to serialize cron invocations. Pick cron only for a destination without systemd, not as a second scheduler here.
- **O4: Re-arm solely from existing events.** No event occurs when a launch never produced an agent, every seat stays idle, or remote main changes elsewhere. An event can start an independent clock, but then the clock is the missing mechanism. Keeping a `next` process alive with its own retry loop would add runtime ownership and restart handling to a command that currently exits after one pass.

### 3. Evidence and current coverage

**E1 — operator:** `issues/chart/night-flow/INTAKE.md:185` records the absent watch and later handoff. `:243` supplies the request for unattended movement and fewer stops. `forks/failed-exits.md:26-30` settles retry without phase failure. `forks/stop-rules.md:26-32` settles the merge wait and fetch requirement.

**E2 — better-than-training:** inspected current code and documentation establish these passes:

| Pass | What exists today | What it misses |
| --- | --- | --- |
| P1 Manual target, bare next, `--all` | Explicitly releases eligible work. `docs/guide/next.md:39-53`, `src/next.ts:1557-1585`. | Requires a caller. Typed dispatch bypasses pause. |
| P2 Herdr startup `--resume` | Plugin startup invokes one allocated-work sweep. `plugin/herdr-plugin.toml:10-11`, `src/next.ts:1586-1602`. | No recurring pass while Herdr stays running. No release of unrelated unallocated leaves. |
| P3 Herdr status, pane exit/close, tab close | Hooks dispatch owned work and then its repo's merge queue. Working-status events are skipped. `plugin/herdr-plugin.toml:13-27`, `src/next.ts:1523-1526`, `:1603-1669`. | No external-main-change event, no clock when all activity stops. |
| P4 Phase merge wake and completion dependents | Merge wake checks pause and runs a merge pass. Completion starts same-repo dependents. `src/next.ts:1374-1406`, `docs/guide/next.md:55`, `:127`. | A transition must happen first. Unrelated repos or leaves are not thereby released. |
| P5 Unpause | One pass over allocated work and merged cleanup, followed by merge. `src/next.ts:1679-1695`. | Requires operator action. |
| P6 Watch | Initial check, then a 20-minute Claude Code session cron, with seven-day expiry and automatic deletion. `skills/watch-issues/SKILL.md:12-18`, `:36-45`. | No session means no job. A tick cannot re-create its missing job. |

**E3 — better-than-training:** the [systemd timer manual](https://github.com/systemd/systemd/blob/main/man/systemd.timer.xml) documents recurring activation, calendar catch-up with `Persistent=`, and no additional activation while the service remains active. The [loginctl manual](https://github.com/systemd/systemd/blob/main/man/loginctl.xml) documents lingering across logout. Read-only observations here found systemd 262, `Linger=yes`, and the user manager responding with `degraded`. That establishes availability, not a healthy or installed akrogon timer. A practitioner search for Lennart Poettering's timer guidance did not yield a verified case stronger than these mechanism documents. Five minutes is my policy recommendation.

### 4. Lifetime pitfalls and what removes them

- **R1: Starting work the operator paused or never released.** Use the existing automatic `--resume` path. Preserve its allocated-work filter and pause checks, plus current dependency, input, capacity and busy-seat rules. This is not automatic recovery of human-only `failed` leaves.
- **R2: A timer fires but the waiter never sees the changed base.** Carry S1's fetch-before-empty-return into implementation and verify an all-waiting queue wakes on a code change without any agent event. Record-only commits remain excluded from the wake comparison.
- **R3: Logout, reboot or an empty queue removes the clock.** Install/enable the user timer independently of chat sessions and queue contents. Verify startup and catch-up with the declared account and required CLI/Herdr environment. Lingering is already enabled here. A powered-off or sleeping host still cannot execute work.
- **R4: Duplicate dispatch or a stuck service.** Use one oneshot service without `RemainAfterExit`, retaining akrogon's locks, prompt grace and S5's session-bound delivery reconciliation. A hung pass prevents further service activation. Do not solve that by blindly timing out a mutating `next`; safe cancellation and command-duration bounds are not established by this timer proposal. Show the service's last result and running duration through the existing service manager.

### 5. Missing question

**Q3:** Does unattended operation continue only already-released work, or also release every new eligible handoff? I recommend the former with `--resume`. Also settle the acceptable retry delay and whether the required overnight guarantee includes logout, host sleep or a hung dispatcher. Otherwise “guarantee” hides conditions the timer cannot satisfy.

## Q2: How does landed work deploy past local record commits?

### 1. Pick, reason and cost

**D2: Self-update integrates and normally pushes committed issue-only local history, using the existing sync integration logic.** Keep one linked running checkout. Fetch, classify every local-only commit's touched paths, rebase eligible commits onto the fetched default branch, push without force, then finish dependency installation and link reconciliation. Handle ahead-only history too, rather than waiting for divergence.

Reuse sync's integration and preservation checks through a shared internal operation. Do not invoke its CLI blindly: `sync` also stages and commits current issue-file edits. Automatic deployment should integrate existing commits, not publish a chart or peer return still being written. Preserve those dirty files using the existing preservation rules. Manual sync retains its explicit record-staging operation.

The eligibility boundary must cover committed history, not just the current index or the net endpoint diff. A local code commit remains ineligible even if another local commit reverses its code changes. Use sync's eligible issue paths and exclusions, including seeds, active locks and worktree contents. A mixed commit does not become safe because its message says “handoff.”

Reason: the deployment trigger is the common point that can repair both existing and future divergence. Pushing the door's current handoff treats one producer only. Cost: self-update acquires push authority over eligible committed records, rebases their SHAs, and encounters real record conflicts and network races. This removes the routine manual sync step, not every possible Git conflict.

### 2. Rejected options

- **O5: Door pushes at handoff as the only fix.** It reduces the common source of ahead commits, but does not repair the already-diverged checkout or a handoff whose push failed. It introduces another required push path while the next deployment pass still refuses local history.
- **O6: Separate runtime checkout.** It avoids local record divergence in that checkout, but adds checkout ownership, installation/link destinations and coordination with the registered record checkout. The command, skills and Herdr plugin currently point at one source tree. That is too much machinery for issue-only local history.
- **O7: Call unrestricted `sync` on every deployment trigger.** Its index guard does not validate all existing local commits. It could push committed source changes, and its staging step could publish unfinished record edits. Share the relevant operation with an explicit committed-history boundary.
- **O8: Keep fast-forward-only deployment plus a manual remedy.** Repeated triggers reproduce #80's documented skip. A persistent Q1 clock would merely repeat the same message against stale code.

### 3. Evidence

- **E4 — operator:** `issues/chart/night-flow/INTAKE.md:60-80` records one local handoff commit and 26 upstream commits, the operator's request for automation, and the previously unverified lock/scope questions.
- **E5 — better-than-training:** `src/self-update.ts:19-59` checks the linked root, holds the install lock, fetches, rejects every ahead checkout, and takes the global lock for a fast-forward. `:62-78` installs and reconciles links even in the skip case. `docs/guide/install.md:34-40` establishes that the linked checkout is the deployed program. `src/install.ts:15-20`, `:60-61` shows the command, skills and plugin linkage.
- **E6 — better-than-training:** `src/sync.ts:9-33` holds the global lock and restricts staged paths. `:46-75` checks fetched/replayed active locks, `:78-106` protects ignored paths, and `:109-136` stages records, commits, rebases with autostash, refuses restoration conflicts and pushes. It does not validate every replayed commit against the issue-only boundary. `tests/sync.test.ts:124-138` covers preservation after an autostash conflict, and `:250-274` covers lock ownership through push. Tests were inspected, not run.
- **E7 — better-than-training:** the [Git rebase manual](https://git-scm.com/docs/git-rebase) confirms that replay can stop at a conflict and autostash restoration can conflict after a successful rebase. This supports keeping preservation and explicit conflict reporting. The source does not establish that arbitrary record conflicts are safely resolvable without judgment.

### 4. Lifetime pitfalls and what removes them

- **R5: Automatic deployment publishes source work or unfinished records.** Validate every ahead commit before integration. Separate manual sync's staging from automatic committed-history integration. Retain excluded-path, ignored-file and dirty-edit preservation behavior.
- **R6: Concurrent hooks, sync and deployment race or deadlock.** Keep self-update before the dispatch lock, as at `src/next.ts:1541-1556`. Preserve the install-lock-then-global-lock order and keep integration/push under the global lock. Share an operation whose caller owns the lock, rather than recursively acquiring it through `syncCommand`. Do not introduce an inverse acquisition order.
- **R7: Remote advances or a record edit conflicts.** Push normally. A rejected push or transient network error remains pending for a later fetched attempt. Rebase/restoration conflicts preserve the user's edits and recovery information and name the conflicting paths. Never force-push, choose an arbitrary side, or call a partial update deployed. A conflicting active rebase needs a settled recovery rule before repeated automation can be called safe.
- **R8: Git advances but the running code or installed links stay stale.** Complete install/link reconciliation and report which stage failed. Retry through the existing update trigger. A process that already imported modules is not refreshed by changing files beneath it. The next timer invocation loads the new checkout. S1 owns the active merge-seat refresh, not a restart of every working agent.

### 5. Missing question

**Q4:** When two writers change the same issue record, who resolves the conflict and how does the next automatic pass recognize the pending rebase or restoration state? B recommends preserving both versions and refusing guessed resolution. Settle that recovery behavior, and confirm that automatic push authority covers committed eligible records only, before describing this as unattended deployment.
