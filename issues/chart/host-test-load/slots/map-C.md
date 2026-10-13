# Territory map, slot C: host overload from concurrent leaf test runs

Intake: Tamdoma/akrogon#88 (`issues/seeds/88-six-framework-leaves-ran-full-test.md`). Claims below re-verified against live files 2026-10-13. File paths under akrogon root unless named otherwise.

## F: verified findings

- F1 Nothing caps heavy runs across leaves. `max_active` counts leaves with a live pane/tab only (`src/next.ts:411-421`), is checked only when creating a new tab (`src/next.ts:440-442`), and is 20 live (`config.yaml:1`; schema default 3 at `src/config.ts:25`). Pi workers are in-process children with no pane, so they are never counted.
- F2 The multipliers stack. Plan waves allow 3 units (`skills/plan-issue/SKILL.md:59`). A runs up to 3 workers per wave (`skills/implement-issue/SKILL.md:55`), each worker runs the resolved `test_changed` command (`skills/implement-issue/brief-template.md:37`, `skills/implement-issue/worker-protocol.md:25`), and A reruns lane changed-tests after every cherry-pick plus final proof (`worker-protocol.md:11`). The pi manager cap is 3 per parent session, not per host (`tamdoma-subagents/manager.ts:288`; one manager per parent at `tamdoma-subagents/index.ts:99`).
- F3 `run-check` has no admission control. It builds env and spawns directly (`src/run-check.ts:112-125` via `spawnLogged` at `src/run-check.ts:63-71`); `Bun.spawn` in `src/shell.ts:38-45` sets no process group, timeout, or lock. Deadline kill in `src/shell.ts:97` kills only the direct child.
- F4 The install flock is weaker than reported. `withSetup` wraps only setup, check runs after `&&` outside (`src/config.ts:315`). Verified by probe: `git rev-parse --git-path akrogon-install.lock` inside a linked worktree resolves to `.git/worktrees/<name>/akrogon-install.lock`, a different file per worktree. So setup is not serialized across leaf or worker worktrees either.
- F5 One framework selection is usually the whole suite. Any changed path outside every owned folder selects all leaf scripts (`framework/.claude/workflow/scripts/run-test-changed.ts:120-122`), and "all" runs `framework:verify:core` (`run-test-changed.ts:201-202`), which is `bun run --parallel` over 8 branches including motion and playback probes (`framework/package.json:165`). The open framework leaf `test-changed-shared-files` targets exactly this; its replay says 125 of 143 merged leaves selected all (its `brief.md:10-11`).
- F6 Inside one Playwright suite, parallelism is already 1 (`workers: 1` in framework `.claude/skills/dev-build-astro/test/mpa-navigation/playwright.config.ts` and `.claude/skills/test-audit-design-impeccable/test/motion-probe/playwright.config.ts`). Browser count multiplies across suites and runs, not inside a suite.
- F7 Pause cannot stop running work. `akrogon pause` only writes `paused.yaml` (`src/pause.ts:51-59`). `isPaused` is read at dispatch and merge points only (`src/next.ts:688,789` and merge paths). There is no stop or kill verb (`src/akrogon.ts:52-167` verb list).
- F8 Esc not reaching workers is by design in pi-extensions. Aborting a waiter leaves the child running, covered by tests (`tamdoma-subagents/manager.test.ts:1652`, `:2163`); `wait()` passes the abort signal only to its own waiting (`manager.ts:491-503`). Children are cancelled on manager shutdown (`manager.ts:505-520`), which runs on `session_shutdown` (`index.ts:261`), not on a turn abort.
- F9 Process-group reaping exists in both shells, with a named escape. Pi core bash spawns detached and kills the group on abort (installed pi `dist/core/tools/bash.js:52,66-69`, `dist/utils/shell.js:203`). The worker shell does the same (`tamdoma-subagents/worker-shell.ts:124-133,184-191`) and states the limit plainly: "Explicit setsid/daemon escapes remain outside this process-group guarantee" (`worker-shell.ts:156`).
- F10 At least one browser launcher uses that escape. Blepsis launches Chrome with `detached: true` plus `child.unref()` (`blepsis/scripts/cdp-core.mjs:628-629`), so it leads its own process group and survives any group kill of the runner. Its render path does not detach (`blepsis/scripts/render.mjs:462-465`).
- F11 A red under load buys up to two more full runs. One same-command retry, then a base run of the same command (`skills/implement-issue/SKILL.md:38`; base-run spawns through the same unlocked path at `src/base-run.ts:164`).
- F12 Existing building blocks: an flock helper (`src/state.ts:205-226`), per-leaf temp roots under `/tmp/akr-<uid>/` with `.owner` files recording pid (`src/config.ts:288-296`, `src/run-check.ts:106-113`), and `/proc/pressure` reads used only as merge telemetry (`src/attempts.ts:13-26`, `src/next.ts:1063`), never for admission. Framework's temporary workaround is a hardcoded flock path in its `issues/config.yaml:11-14`.
- F13 Host facts (probed): 32 threads, systemd 262 with a user manager, unified cgroup v2 (`cgroup2fs`), util-linux flock, `systemd-run`, `prlimit`, `setsid` all present.

## D: material forks

### D1 What does the budget count?

- O1 Count of heavy runs (semaphore, N runs at once). Simple, enforceable with locks. Breaks when one run alone oversubscribes (F5: core is internally 8-way parallel; seed records one run at 370% CPU, unverified). Invites gaming the definition of "heavy".
- O2 Weighted tokens (a full-suite run costs more than a targeted run). Matches reality better. Needs a cost table that drifts as suites change, and someone must classify every command.
- O3 Fewer leaves (lower `max_active`). One-line change, but counts panes, not workers or runs (F1). Serializes cheap planning and review work along with heavy tests, and 6 leaves times 3 workers still fits under most settings.
- O4 CPU share instead of count (cgroup `CPUQuota` per run or per leaf). Bounds total damage even when counts are wrong. Slows single runs, which pushes browser tests into their own timeouts and can create the flakes this work wants to remove.

### D2 Where is admission enforced?

- O1 In `akrogon run-check` only. Every printed check command already routes through it (`src/config.ts:317-318`). Misses ad-hoc worker commands (`bun run test:changed`, `/tmp/u3-run.sh` in the seed), criterion proofs, and B-seat reruns that do not use printed commands.
- O2 In the consumer entry point (framework `run-test-changed.ts` self-limits). Catches ad-hoc calls to that one entry. Each repo re-implements it, and it cannot see other repos or other heavy commands on the host.
- O3 At the seat or worker shell (pi-extensions worker-shell / pi bash intercept heavy commands). Sees everything an agent runs. Needs a rule for which commands are heavy, lives in the harness layer so codex and claude seats need their own version, and turns a shell into a policy engine.
- O4 At the OS boundary around the whole run: `run-check` (and base-run) execute inside a `systemd-run --user --scope` unit. Admission still needs a counter somewhere, but the scope gives reaping and optional quotas for free (see D5). Linux and systemd only.

### D3 Scope of the budget

- O1 Per repo. Matches the current framework workaround lock. Two repos times N still overloads the host, and registered repos share one machine (`config.yaml:15-25` lists 11).
- O2 Host-wide, one pool for all akrogon work. Matches the actual scarce resource. Needs a host-level home for state (global config already is host-level, `src/config.ts:23-30`) and headroom reserved for the operator's own work, which no counter sees.

### D4 When the budget is full: queue, fail, or preempt?

- O1 Block and queue (plain flock). No lost work. A queued worker looks identical to a hung one, burns its turn and time budget waiting, and flock gives no FIFO or priority guarantee (model knowledge; flock(2) wake order is not specified as fair).
- O2 Fail fast with a clear "host busy" exit. Visible immediately. Agents will retry in a loop or record a red check, and the retry-plus-base-run rule (F11) turns one refusal into three attempts.
- O3 Queue with priority classes (merge verify ahead of worker runs ahead of base runs). Fixes the worst inversion: a merge waiting behind six worker runs. Needs a real queue, not a lock file, and a way to show position (`akrogon status`).

### D5 How does stop reach browsers?

- O1 Fix each launcher (blepsis stops detaching, framework harnesses close browsers). Correct at the source. Long tail: every future harness reintroduces it, and Playwright or Chrome internals are outside all four repos.
- O2 Process-group kill everywhere. Already the shell behavior (F9) and it demonstrably did not reach detached Chrome (F10).
- O3 cgroup scope per heavy run, stopped as a unit. `setsid` cannot escape a cgroup; `systemctl --user stop <unit>` or `cgroup.kill` reaps everything (kernel cgroup v2 docs, below). Ties akrogon to systemd hosts.
- O4 Sweep by leaf temp dir and cwd (what the operator did by hand, using `/tmp/akr-<uid>/` ownership at `src/config.ts:288-296`). Works regardless of process grouping. Racy, can kill a new run that reused the dir, and is a cleanup tool, not a stop button with a contract.

### D6 What should pause and Esc mean?

- O1 Keep current split: pause stops dispatch, Esc stops the turn, explicit cancel stops a worker. Honest but leaves the operator without one lever during an incident.
- O2 `akrogon pause` also stops running work for that repo (kill leaf scopes; signal seats). Pause becomes destructive; a leaf mid-merge or mid-write loses state, and akrogon cannot cancel pi in-process children from outside the pi process.
- O3 New explicit verb (`akrogon stop <slug>` or `stop --repo`) that kills that leaf's run scopes and optionally its seat panes, leaving pause as dispatch-only. Clear contract. Needs per-leaf unit naming from D5-O3, and a decision on whether killing panes is in scope.
- O4 Change pi-extensions so parent turn abort cancels children. Fights an intentional, tested behavior (F8) that other workflows may rely on: aborting a wait to check status would kill the work being checked.

### D7 Reduce the work, not only the concurrency

- O1 Cap only, leave selection and reruns as they are. Smallest change. With 87% of leaves selecting everything (F5), a cap of 1 turns overload into a long serial queue and leaves may get slower overall.
- O2 Rely on the in-flight framework selector leaf (skip lists and shared-file maps, its `brief.md:3-8`) and add a cap sized for the reduced world. The two changes interact: sizing N before the selector lands bakes in today's waste.
- O3 Treat the shared suite as a shared test resource in planning. Waves already serialize on shared fixtures, accounts, or sites (`skills/plan-issue/SKILL.md:59`); naming the full suite and host browsers as such a resource serializes heavy units and extends the settled serial-solo rule (`issues/chart/leaf-speed/forks/chained-units.md`). Prompt text only, no enforcement.
- O4 Workers run targeted tests for their unit; one `test_changed` per lane landing, not per worker. Cuts the per-worker full run (F2). Risks a worker landing code its targeted tests did not cover, discovered only at lane run time.

### D8 Fixed cap or load-adaptive admission?

- O1 Fixed N from config. Predictable, testable. Wrong whenever the operator is also compiling, on a call, or away.
- O2 Admit based on `/proc/pressure` or load average. The read code exists (F12) and PSI is the kernel's stall metric (source below). Feedback loops are easy to get wrong: every waiter sees pressure drop and starts at once. Harder to test and to explain after an incident.

## Q: questions a practitioner would ask

- Q1 What does one full framework run cost alone on an idle host: wall time, CPU-seconds, peak browser count? The seed's 370% figure is unverified, and every D1 sizing depends on it.
- Q2 What is the host budget in plain terms: how many of 32 threads must stay free for the operator, herdr, and the model processes themselves?
- Q3 Which commands count as heavy, and who declares it: akrogon config per check name, the consumer, or a list in the run-check wrapper? What happens to criterion proofs and B's reruns?
- Q4 Should merge verify preempt or outrank implement runs? A blocked merge blocks every later leaf, so priority inversion has a real cost (D4-O3).
- Q5 Is a queued run's wait bounded? Which timeout fires first today: bash tool timeout, worker turn budget, or seat stall notice (`STALL_MS` at `src/next.ts:222`)?
- Q6 Can admission be nested safely: base-run of a printed check command would re-enter run-check (`src/base-run.ts:164` plus `src/config.ts:317-318`). Same-lock re-entry deadlocks unless the hold is passed down explicitly, for example an env token.
- Q7 Do detached descendants inherit the lock fd? If Chrome inherits flock's open file description, the lock outlives the runner. `flock --close` exists for exactly this (local flock man page). Needs a probe before any flock design is trusted.
- Q8 Is akrogon ever run on a non-systemd or non-Linux host? The worker shell supports darwin (`tamdoma-subagents/worker-shell.ts:218-220`); a systemd-only design forecloses that.
- Q9 Who else starts browsers on this host outside leaves: the operator, watch-issues cron passes, standalone implement runs, chart doors? A pool that ignores them overstates capacity.
- Q10 Journal and unit lifetime: if runs become systemd scopes, who cleans dead units, and does `--scope` exit status and signal forwarding behave the same as direct spawn for run-check's captured output (`src/shell.ts:25-45`)?

Outside sources (fetched 2026-10-13 unless noted):

- systemd-run, transient scopes and `--property`: https://www.freedesktop.org/software/systemd/man/latest/systemd-run.html
- systemd resource control (`CPUQuota`, `MemoryMax`, `TasksMax`): https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html
- cgroup v2, including `cgroup.kill` and `cpu.max`: https://docs.kernel.org/admin-guide/cgroup-v2.html
- Pressure Stall Information: https://docs.kernel.org/accounting/psi.html
- GNU make jobserver (shared token pool across recursive processes): https://www.gnu.org/software/make/manual/html_node/Job-Slots.html
- flock, including `--close` for children that should not hold the lock: https://man7.org/linux/man-pages/man1/flock.1.html (also local man page)
- Playwright workers and parallelism: https://playwright.dev/docs/test-parallel
- Model knowledge, nothing stronger fetched: Node `detached` puts the child in a new process group and `unref` lets the parent exit without waiting; flock wake order is not guaranteed FIFO; Chrome runs many processes per browser (renderer, GPU, network), so process count overstates browser count.

## P: pitfalls over the work's lifetime

- P1 Lock fd inherited by a detached browser keeps the semaphore held after the run dies, silently shrinking the pool to zero. Removed by Q7 probe plus `--close` or a cgroup design that does not rely on fd lifetime.
- P2 Self-deadlock through nested run-check or base-run re-entry (Q6). Removed by an env-passed hold token checked at admission.
- P3 Queued workers look stalled, get their waits aborted or their turns spent, then restart the same run. Removed by visible queue state and a wait that is distinguishable from a hang in `akrogon status`.
- P4 Priority inversion: merge verify queued behind worker runs while more leaves finish and queue behind it. Removed by D4-O3 priority or a separate reserved slot for merge.
- P5 Retry amplification under load (F11): load causes a flake, the flake buys two more full runs. Removed by making retry and base-run go through the same admission, and by not retrying when the run was refused or killed for load.
- P6 The definition of heavy rots. New suites arrive unclassified and bypass the pool, same failure mode the selector's ownership map refuses (`run-test-changed.ts:5-9`). Removed by defaulting unclassified check names to heavy, or refusing to run them unclassified.
- P7 Knot of local workarounds: framework keeps its hardcoded flock (`framework/issues/config.yaml:11-14`, absolute `/home/ivan/...` path) after akrogon grows a pool, giving two locks and double serialization. Removed by deleting the consumer lock in the same change that lands the pool.
- P8 CPU quotas turn overload reds into timeout reds (Playwright 30s timeouts in framework configs). Removed by preferring admission counts over quota, or setting quota per leaf well above one run's need (Q1 measurement first).
- P9 Killing a scope mid-run leaves git index locks, half-written build output, and browser profile locks in worktrees and `/tmp/akr-<uid>/`. Removed by TERM-then-KILL staging in the stop path and by treating a stopped run as incomplete, never red.
- P10 The pool becomes a single point of contention for cheap checks too, slowing every leaf (framework `cheap` is under the same workaround lock today). Removed by classifying checks (D1) so cheap checks never touch the heavy pool.
- P11 Model and seat processes are outside the pool but on the same host. Twenty seats thinking and streaming is itself load. Removed only by sizing the pool with headroom (Q2), not by counting seats as runs.

## Ownership and proposed split

- akrogon (this repo): admission in run-check and base-run, host budget config, `withSetup` generation (`src/config.ts:310-324`), pause/stop verbs (`src/pause.ts`, `src/akrogon.ts`), skill text (`plan-issue` shared resource, `implement-issue` worker and retry rules), `docs/guide/limits.md` and `problems.md`. This is the only repo that sees all registered repos on the host.
- pi-extensions (`/home/ivan/.pi/agent/extensions`, registered as `pi-extensions` at `config.yaml:19`): only if D6-O4 or a cross-parent worker cap is chosen. The wait-abort behavior is tested and intentional (F8), so the burden of proof sits with changing it. Worker-shell already reaps its process group (F9).
- framework: the selector leaf already in flight, `framework:verify:core` internal parallelism (`package.json:165`), removal of the local flock workaround, and optionally a self-limit inside `run-test-changed.ts` if D2-O2 is chosen as a second line.
- blepsis: the detached Chrome launch (`scripts/cdp-core.mjs:628-629`). Either a non-detached mode for test use or a recorded pid and profile that a reaper can find. Small, separate, and independently shippable.

Proposed split by destination: one akrogon leaf for run admission (run-check plus base-run plus config plus skills text), one akrogon leaf for stop semantics (scope wrapping plus stop verb) that depends on the first only if they share unit naming, one blepsis leaf for the Chrome launch, framework changes limited to deleting its workaround lock once admission lands (config edit, direct route candidate). Pi-extensions gets nothing unless D6-O4 is taken.

## R: my recommendation per fork

- R1 (D1) Count of heavy runs, host-wide, N=1 at first for the full-suite class. Reason: one full run is internally 8-way parallel (F5) on a 32-thread host, so N=1 still uses the machine; weights can come later with Q1 numbers. Cost: leaves serialize on tests until the framework selector lands.
- R2 (D2) Enforce in run-check and base-run, with the framework entry point as a second line only if ad-hoc bypass shows up in practice. Reason: printed commands already route through run-check (F12 pattern exists); shell interception makes every harness a policy engine. Cost: prompt-only bypass remains possible and must be named as a known limit, not papered over.
- R3 (D3) Host-wide pool, budget in global config next to `max_active`. Reason: the host is the resource that failed. Cost: one repo's long verify can starve another repo's leaves, accepted until priority exists.
- R4 (D4) Block and queue, but with a reserved priority for merge verify and queue visibility in `akrogon status`. Reason: fail-fast feeds the retry rule (F11). Cost: this is a small queue, not a bare flock; it is the largest single piece of work here.
- R5 (D5) systemd scope per admitted run (`systemd-run --user --scope`), named by repo, leaf, and check. Reason: it is the only option that also reaps `setsid` escapes (F9, F10) and gives stop a target; host already runs systemd with cgroup v2 (F13). Cost: Linux and systemd only (Q8), and unit lifecycle edges (Q10) need probes.
- R6 (D6) New explicit `akrogon stop <slug>` that stops that leaf's scopes; pause stays dispatch-only; do not change pi wait-abort semantics. Reason: pause that sometimes kills is worse than two verbs with clear contracts, and F8 is intentional behavior. Cost: stopping scopes does not stop a worker from starting a new run seconds later; stop must pair with pause or seat handling to hold.
- R7 (D7) Take O3 (name the shared suite and host browsers as a shared test resource in planning) plus rely on the in-flight selector leaf; do not switch workers to targeted-only tests in this work. Reason: O3 is one skill sentence extending a settled rule, and the selector leaf is already scoped and measured. Cost: prompt text only, so it lowers frequency, not the ceiling.
- R8 (D8) Fixed N. Reason: adaptive admission on PSI is a feedback controller nobody here can test cheaply, and `/proc/pressure` stays as telemetry to size N later. Cost: N is wrong when the operator's own load changes; mitigated by sizing with headroom (Q2).

First step regardless of fork choices: measure one full run alone (Q1) and probe the flock fd question (Q7). Both are hours, and D1, D4, and P1 cannot be settled honestly without them.

Most important: the ceiling must be enforced below the agent layer. Every current limit is either prompt text or counts the wrong thing (F1, F2), so any solution that only edits skills will fail the same way at the next incident. Run-check admission plus a systemd scope per run (R2, R5) is the smallest change that caps the load and gives the operator a stop that reaches browsers.
