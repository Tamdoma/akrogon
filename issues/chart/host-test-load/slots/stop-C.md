# Blind notes, slot C: stop

Question: new stop verb per leaf or pause itself stops, how redispatch is fenced, and whether pi Esc changes. Read 2026-10-13.

## 1. Pick: pause unchanged, new `akrogon stop <slug>` / `akrogon start <slug>`, pi Esc unchanged

### The stop verb

`akrogon stop <slug>` runs in the leaf's repo, in this order:

1. Write the fence first, under the existing akrogon lock: add `repo/slug` to a `stopped.yaml` in akrogon home, mirroring `paused.yaml` and `setPaused` almost line for line (`src/pause.ts:47-59`). Host-local runtime state beside the pause file, not a new field in the leaf's committed `state.yaml`.
2. Stop the leaf slice by its derived name (the same encoding helper the seat-scope code uses; the name must be shared, never rederived by string surgery in two places): `systemctl --user stop <leaf-slice>`, blocking, treating not-loaded as already stopped. Pane scopes are created with a short `TimeoutStopSec` (seconds, not the user manager's 1min 30s default, read from `systemctl --user show` today), so a stop is TERM, brief grace, KILL to the whole cgroup (`systemd.kill` man page, control-group), with no custom kill-escalation code in akrogon.
3. Print the outcome. If the systemd stop errors in a way that is not not-loaded, the verb fails with the error and the fence stays in place: the leaf is fenced and unstopped, the operator retries, and nothing has been half-resumed.

Fence before kill is the whole game. Stopping the slice closes both panes, and herdr's pane-closed hooks fire akrogon passes; without the fence already committed, the first such pass allocates a fresh tab and relaunches the seat, recreating exactly what the operator killed. Order plus one file removes the race without touching hook plumbing.

The fence is consulted in two places. In `dispatchLeaf`, next to the existing early exits and before allocation, for automatic and manual passes alike: an automatic pass ends quietly, a picked manual pass (`akrogon next <slug>`) errors with "stopped, run akrogon start", mirroring how picked dispatch of a failed leaf already errors instead of proceeding (`src/next.ts:738-750`). And in the merge path, after batch reconciliation (which records ground truth about already-landed batches and causes no seat load) but before a new stack is built or a merge seat dispatched for a stopped holder. `akrogon status` marks a stopped leaf, as it already marks paused repos.

`akrogon start <slug>` is the only thing that clears the fence. It removes the entry under the same lock, then runs the same targeted pass a manual `akrogon next <slug>` runs, so the tab, panes, and seats come back through the normal boxed allocation in the same operator action. Clearing without a pass would leave the leaf waiting for some unrelated hook to notice.

### Why pause does not become the stop

Pause has a documented, used meaning: freeze automatic dispatch for the whole repo, running seats keep running, manual `next` still runs in full, unpause resumes (`docs/guide/next.md:106-117`; gates read `isPaused` only under `isAutomatic` throughout `src/next.ts`, e.g. `:715`). The incident's own workaround used exactly that: framework paused while the selector leaf was deliberately left running. Making pause kill slices would retroactively make every existing pause destructive, at repo granularity, destroying sessions of leaves doing no heavy work at all. Two verbs with two contracts is the low-complexity answer here, not one verb whose blast radius depends on when you learned it.

### Pi Esc: no change

Aborting a waiter leaving the child running is tested, intended behavior (`tamdoma-subagents/manager.test.ts:1652`, also `:2163` for event-driven waits). Esc is how a parent interrupts, inspects, and steers; the explicit soft cancel already exists beside it (`subagent_cancel`, `tamdoma-subagents/tools.ts:197-198`). Making Esc cancel children would change semantics for every pi workflow on the host, do nothing for codex or claude seats, and still not be an akrogon-level stop. It is also no longer needed for load: workers an Esc leaves running are boxed in the pane scope and their test runs hold the one host permit, so the incident consequence is bounded by the taken locks whether or not Esc reaches them. Cost accepted: Esc remains a seat-local interruption, and anyone who wants work dead uses `akrogon stop`, not Esc. The guide should say that in one line where pause is explained.

### Costs of the pick

One new verb pair, one small state file, two gate reads, one systemd call. The seat sessions of a stopped leaf are lost (inherent to killing the slice, already settled in seat-scope). Repo-wide emergencies still need two gestures: `akrogon pause` to stop new dispatch instantly, then per-leaf stops for what is already hot. Load drops progressively as each slice dies, so this is slower than a single repo-wide kill; whether a `stop --all` earns its keep is a missing question below, not part of this pick.

## 2. Rejected options

- Pause stops slices: rejected above. Wrong granularity, breaks a documented and actively used contract, and pause has no per-leaf anything: its state is repo keyed (`src/pause.ts:10`, `readPaused`/`isPaused`), so leaf-shaped stopping through it needs new state anyway, ending with two mechanisms wearing one name.
- Fence through `phase: failed`: rejected despite looking free. The failure record is shaped for seat-reported blockers (`cause: blocked | attempts`, plus phase and slot, `src/state.ts:12-18`); an operator stop has neither cause nor slot, and forcing it in drags failure notifications, tab renaming, and batch-failure reconciliation behind it. Recovery would also inherit the failed-leaf rule that a seat cannot resume it and an operator phase move must guess the pre-stop phase. A stop is not a failure, and the record should not say it was.
- Fence by parking: rejected. Park refuses any issue with a running leaf (`src/park.ts` `running()` and its error), moves folders, and operates per issue, not per leaf. Even after a slice stop, `state.tab` and `state.worktree` still read as running to park. It solves queue membership, not live processes.
- Stop by closing the herdr tab or killing seat PIDs from akrogon: rejected. Seat-scope already settled that the cgroup is the kill target because process-tree and process-group kills miss `setsid` descendants; a tab close reaches even less. This was the incident's manual step 3 and 4, and encoding it would preserve the failure.
- Pi Esc cancels workers, in pi-extensions: rejected above. Separate repo, tested opposite semantics, no effect on other harnesses, and unnecessary once workers are boxed and permitted.
- Stop only, no fence (kill the slice, let the operator also pause): rejected. Redispatch is automatic and hook-driven; the panes dying is itself a hook event. An unfenced stop is a restart with extra steps.

## 3. Evidence

- better-than-training · `src/pause.ts` (whole file), `src/akrogon.ts:126-134`, `docs/guide/next.md:106-117`, `grep isPaused src/next.ts`, read 2026-10-13 · pause is per-repo, dispatch-only, bypassed by manual `next` by design, and unpause runs a resuming pass · fixed the fence shape (mirror pause's file, but gate manual dispatch too, with an error instead of silence) and rejected bending pause into the stop.
- better-than-training · `src/state.ts:12-18,78-107`, `src/phase.ts:349-372`, `src/next.ts:738-750`, `src/park.ts`, read 2026-10-13 · failed and parked are real fences with the wrong shapes: failure is slot-and-cause shaped with its own recovery law, park refuses running leaves who stay "running" in state after a kill · rejected both as fence substrates.
- better-than-training · `tamdoma-subagents/manager.test.ts:1652,2163` and `tools.ts:197-198`, read 2026-10-13 · wait-abort deliberately leaves children running and an explicit cancel tool exists · closed the pi Esc question with no pi-extensions work.
- better-than-training · taken locks: seat-scope (pane scope stop kills the shell and closes the pane; redispatch must be fenced by leaf state), restore (allocate replaces panes outside their box), permit-release (leftovers end with the leaf stop; this fork is the stop that sentence promised), all read 2026-10-13 · the slice is the kill target and the fence is owed to three earlier forks, not optional.
- better-than-training · `systemctl --user show -p DefaultTimeoutStopUSec` = 1min 30s and local `systemd.kill` man page, read 2026-10-13 · a plain slice stop can legally take 90 seconds against a TERM-ignoring process · forced the short `TimeoutStopSec` on pane scopes into this pick instead of kill-escalation code.
- model-knowledge · nothing stronger for: `systemctl stop` on a never-loaded transient slice exits cleanly or as not-loaded (either way the verb must treat it as stopped), and slice stop propagates to member scopes. Both sit inside the still-pending scope-control proof from earlier forks and should be confirmed there on a disposable leaf.

## 4. Pitfalls, and what removes each

- Race the other way: a dispatch pass reads state, allocates, and is about to start the agent in the same moment `stop` writes the fence and stops the slice; the newly started seat lands in a scope already being torn down, or the ensure step recreates it under the dying slice. Removed by taking the fence write and the dispatch allocation under the same akrogon lock discipline already used for pause and state (`withLock` on the global home lock), and by the generation check failing closed on the next pass if anything slipped through. Worst surviving case is one seat start that the stop's own slice teardown kills anyway.
- Stop during `merge` with an applied batch: the seat dies mid-merge-check, batch state remains, and on `start` the merge seat is redispatched with the attempt context as after any dead merge seat. Removed by fencing new stack building while still letting reconciliation record a batch that already landed; what must never happen is losing the batch record, and nothing in this pick touches it.
- A stopped leaf that is a dependency of others blocks dependents silently. They already wait with the dependency's phase as label; `status` marking the stopped leaf is what keeps that wait legible. Named, and the reason the status mark is in the pick rather than a nicety.
- Stop leaves the leaf unparkable and unresumable by seat phase moves, which will surprise the first operator who tries either. Removed only by the error text pointing at `akrogon start` (picked manual dispatch, above) and one guide paragraph: stop/start for load, pause/unpause for dispatch, park/unpark for queue membership.
- The fence file and the slice disagree after a reboot: slices are gone, `stopped.yaml` persists, so the leaf comes back fenced with nothing running. That is the safe direction and is accepted: a leaf the operator stopped stays stopped across reboots until started.
- `TimeoutStopSec` too short turns every pane teardown (tab close at merge, restore replacement) into a SIGKILL-first shutdown, losing orderly seat cleanup and possibly truncating session writes. The value wants seconds in single digits, and its proof belongs with the scope-control proof: a normal merged-leaf tab close must still end cleanly.

## 5. Missing questions

- Repo-wide emergency: is `akrogon stop --all` (every leaf slice in the repo, park's `--all` shape at `src/akrogon.ts:120-124`) wanted for the next meltdown, or is pause plus per-leaf stops fast enough in practice? The incident had six hot leaves; this pick makes the operator name each while the host is thrashing.
- Should `stop` refuse, warn, or just proceed when the leaf's seat is mid-write in `check.fix` with uncommitted worktree edits? The worktree survives a scope stop today, but nobody has stated that as a guarantee an operator can rely on.
- Who may run `stop`: only an operator shell by construction (it is a CLI verb), but should a seat ever be able to stop another leaf, and does anything today prevent a worker shell from running `akrogon stop` on its own leaf to escape a red run?
