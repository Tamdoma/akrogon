# Blind notes, slot C: queue-order

Question: queue order, wait bound, and visibility for the one host permit. Read 2026-10-13.

## 1. Pick: merge-first at acquisition only, unbounded interruptible wait, visible by heartbeat, holder line, and timing

Three parts, all inside the permit helper from permit-release. No ticket queue, no preemption, no timeout.

### Order: two classes, whatever flock gives inside each

A run is merge-class when the run-check target resolution already says so: `phase` is `merge` for a leaf-scope run, or a base-scope run carrying a merge `attempt` (`leafFields` and the base-run branch in `src/run-check.ts:80-130` produce exactly these fields). No new classification, and not the check name, which is per-repo free text.

Mechanism: a merge-class waiter first drops a small record file (its run id, pid, start time, boot id, the sidecar pattern from permit-release) into a merge-waiting directory under akrogon home, then waits for the permit. A non-merge acquirer that wins the flock then checks that directory: if any record names a live process (pid plus start time plus boot id verified), it releases the permit, sleeps briefly, and retries. The merge waiter removes its record once it holds the permit, in the same finally that would run on any exit. Priority therefore applies only at the moment of acquisition: a run already executing is never interrupted, and inside each class the order is whatever flock's wake order gives, which no source I found promises as FIFO (model knowledge; man7 flock(2) is silent on fairness, searched 2026-10-13).

Why merge goes first at all: a merge run is the only run other leaves are queued behind structurally. The merge holder occupies the repo's one merge turn (`mergeTurn` builds one batch and dispatches one holder, `src/next.ts:1041-1075`), its batch may carry several leaves, and the stack it tests was built on a base that ages while it waits. An implement or check run delays only its own leaf. At roughly 239 s a run (fork carries), three implement runs ahead of a merge verification are twelve-plus minutes of pure merge latency for the whole repo, every merge.

Costs, accepted: implement runs can be repeatedly yielded past in a merge-heavy stretch. That is bounded by construction: one merge turn per repo at a time, each verification finite, and every implementing leaf is itself heading for the merge class. The yield check also has an inherent one-run leak: a non-merge run that acquires in the gap between the merge record appearing and its own check completing keeps the permit. Priority here is a strong bias, not a guarantee, and should be worded that way to the operator.

### Wait: unbounded, interruptible, and distinguishable from a hang

No acquisition timeout in akrogon. A timed-out acquire has no honest meaning for the seat: run-check exiting nonzero is indistinguishable from a red run in every skill path that consumes it, and the red-with-no-cause machinery would then buy a retry plus a base run, tripling demand on the permit that is already the bottleneck. A wait that ends is ended by existing hands: seat abort or leaf stop kills the waiting process, and the kernel removes its flock request and its merge record becomes a dead pid that verify-and-ignore handles.

The wait is a poll loop (non-blocking tries with a short sleep) rather than one blocking FFI call, for exactly one reason: so it can speak. Every 60 seconds the waiter writes one line to its own stderr naming the holder from the holder sidecar ("waiting for run permit, held by framework/<slug> <name>"). The seat sees that streamed, and it can never be mistaken for test output or a red result if the call is later aborted. Run-check itself sets no spawn timeout today (`src/run-check.ts:173` through `spawnCaptured` with none set); the timeouts that can kill a queued run belong to the calling seat's tool invocation, which akrogon does not control. The leaf's skill text should say printed check commands are run without a short tool timeout, because queue time is now part of a run's wall time from the seat's chair.

### Visibility: holder in status, wait in timing, no queue registry

- `akrogon status` prints one permit line when the holder sidecar names a verified live process: repo, slug, check name. Status already reads host-level files and marks paused repos there (`src/status.ts:350-360,405`); this is the same read shape. A stale sidecar (holder SIGKILLed, permit-release fog) verifies dead and prints nothing.
- Timing gets the number, not a new event: `check_start` gains the wait the run spent acquiring, recorded at acquisition where `check_start` already moves inside the permit (permit-release taken design). Duration in `check_end` already excludes queue time by that same move. One optional field on the existing check core (`src/timing.ts:13-19`), no new event kind, and the timing report can show queue cost per leaf when someone asks the cohort question.
- No live queue depth or position. That needs a waiter registry with crash cleanup, which is a second state system to answer a question nobody has asked yet. Holder plus heartbeat plus recorded waits cover "is it stuck, who is ahead of me right now, and what did queueing cost" without it.

## 2. Rejected options

- Arrival order via a real ticket queue: rejected as the most machinery for the least gain. Tickets need creation under a guard lock, head-of-line arbitration, and dead-ticket reaping by pid checks on every acquisition, all to guarantee an ordering property no part of the system depends on. Runs are finite, holders are finite, and starvation inside a class is a theoretical flock property, not an observed one. If it is ever observed, the timing field in this pick is what shows it.
- Whatever flock gives, no classes: rejected. It treats a leaf's third worker run and the repo's only merge verification as equals, and merge latency is the one the leaf-speed work has been measuring all along. The two-class yield gets most of a priority queue's value for one directory check.
- Bounded wait with a timeout exit: rejected above. Under legitimate load (six leaves, last one ~20 min out per the fork carries) any bound short enough to mean anything fires during normal operation, and every firing manufactures a red-looking result plus retry pressure. A bound long enough never to fire normally is a comment, not a mechanism.
- Preempting or killing the running holder for a merge run: rejected. It destroys up to a full run's nearly finished work, leaves the killed run's leftovers in its pane box, and turns a four-minute wait into a four-minute waste plus a rerun. Priority at acquisition gets the ordering benefit without ever discarding executed work.
- A second permit reserved for merge: rejected by the taken lock (strictly one), and on the merits: two heavy runs at once is the load this chart exists to prevent, whoever they belong to.
- Fail fast when busy ("host busy, seat retries later"): rejected. The seat has nowhere better to be; it would poll with model turns instead of a sleep loop, burning the expensive resource to save the cheap one, and every retry is a fresh chance to misrecord the outcome.

## 3. Evidence

- better-than-training · `src/run-check.ts:36-66,80-173` and `src/base-run.ts:108-164`, read 2026-10-13 · run target resolution already yields phase, scope, and merge attempt before anything spawns, and both commands converge on the one `spawnLogged` the permit wraps · merge classification needs no new plumbing or name sniffing.
- better-than-training · `src/next.ts:1041-1110` (`mergeTurn`, one holder and batch per repo), read 2026-10-13 · merge verification is the structurally serial, multi-leaf run · grounded merge-first in the merge path rather than in intuition.
- better-than-training · `src/timing.ts:13-59,67-104`, `src/status.ts:350-360,405`, `src/next.ts:222-258` (busy-stall notice at 60 min), read 2026-10-13 · check events, host-file status reads, and an existing stall alarm are the visibility surfaces already present · sized the visibility work to one optional field, one status line, and a heartbeat.
- better-than-training · taken locks: permit-release (in-process flock, strictly one, sidecar holder record with pid/start time/boot id) and limit-boundary (one run alone peaks at load 40; measurement 2 run of 239 s), read 2026-10-13 · the sidecar the heartbeat and status read already has to exist for nested admission, so visibility here reuses it instead of minting queue state.
- model-knowledge · searched man7 flock(2) 2026-10-13 and found no wake-order or fairness guarantee · the reason this pick promises priority between classes and nothing inside a class. Also model knowledge: a process killed while blocked or polling on flock leaves no kernel wait entry behind, so cancellation needs no cleanup code beyond ignoring dead merge records.

## 4. Pitfalls, and what removes each

- A merge record outlives its dead waiter and non-merge runs yield to a ghost forever: removed by verifying pid, start time, and boot id before treating any record as live, the same triple as the holder sidecar. One missed verification here wedges the whole host, so the leaf's tests should include a killed merge waiter followed by a normal run acquiring at once.
- Yield livelock: several non-merge waiters wake, yield, and retry in lockstep while the merge waiter's own poll misses the free window. Removed by a small randomized delay on the yield path only; the merge waiter polls without it. Worst case stays one extra non-merge run, never zero progress, because a holder always finishes.
- A merge-class run that is itself nested inside another leaf's admitted run: impossible in the dispatch shape (merge seats run in the holder leaf's worktree, not inside another run), but if it ever occurred the token reuse from permit-release takes precedence and no record is written. Order of checks in the helper must be: nested first, then merge record, then acquire.
- The seat's tool timeout fires during the queue wait and the seat records a red run that never ran. Partially removed by the heartbeat text (the aborted output reads as a permit wait, not test output) and by the skill wording in the leaf. Not fully removable from akrogon's side; if it bites in practice, the fix is seat-side timeout guidance, not an akrogon wait bound.
- Queue plus run crosses the 60-minute busy-stall notice and the operator gets a stall alarm for a healthy leaf. Accepted: the notice names the leaf, `akrogon status` now names the permit holder ahead of it, and that is the answer. Suppressing stall notices for queued seats would need next.ts to consult permit state, one coupling too many for v1.
- Two repos' merge runs flag at once and one removes the shared indication while the other still waits. Removed by per-run record files (each waiter removes only its own), never a single flag file.

## 5. Missing questions

- Should `check.fix` replays of a rejected merge command count as merge-class? They run under `check.fix`, not `merge`, but they gate a leaf's return to the merge queue. Same question for the merge seat's own base-run comparisons, which this pick does class as merge via the attempt; is a comparison run really as urgent as the verification it may vindicate?
- When ceiling-values settles how much work the host should feel, does the answer change the right class boundary here (for example, merge runs first only above some host pressure)? This fork as taken assumes the classes are worth having at permit 1 unconditionally.
- Who sees heartbeat lines in the end: they go to the seat's live tool output but not into the kept check log, so a later reader of the leaf folder cannot tell a queued-then-run check from a slow one except through the timing field. Is that enough provenance for check review?
