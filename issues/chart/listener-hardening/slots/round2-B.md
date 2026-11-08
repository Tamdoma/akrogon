# Round 2 B

Akrogon paths are relative to `/home/ivan/Work/infra/akrogon`. `HS/` means `/home/ivan/Work/infra/herdr-setup`. Confidence is high for source-backed control-flow conclusions. Unverified native behavior is marked below.

## Part 1 — K3 diff

Verdict: ready

## Part 2 — B's hierarchy and pane

### D1 — The live-pair case is supported

When A is live, launch B with A's actual address as parent, retain the existing repo/leaf/seat and tab labels, and use `--outlive-parent --no-notify` for B. The current leaf launch is parentless and already supplies those labels (`src/seat.ts:219-230`); the runner currently exposes only the parent choice (`src/hc.ts:284-303`). Extend that launch policy for leaf B specifically, preserving the consultant policy (`src/seat.ts:312-324`).

Observed public CLI: `hc run --help` provides `--parent`, `--outlive-parent`, and `--no-notify`. `hc schema` describes `outlive_parent` and `no_notify`; it says the old `die_with_parent` argument is ignored. Use the supported flags, not that legacy argument.

Actual parentage already drives the custom sidebar. `HS/mods/agents-by-tab/tree.js:8-20` selects the live ancestor, and `HS/mods/agents-by-tab/main.js:154-188` draws live children with tree lines. The flat layout mounts this mod (`HS/layouts/flat.json:40-43`). Explicit tab labels are the documented pane-adoption surface (`/home/ivan/.config/herdr-app/AGENTS.md:136-146`), while unplaced children normally have no pane (`:154-157`). A previous real probe already placed labelled children in their parent's tab (`issues/chart/herdr-app/forks/proofs.md:72-73`).

**Ownership:** akrogon owns parent/notification/lifetime flags and seat labels. herdr-setup owns sidebar presentation and A/B geometry. herdr-app supplies existing label adoption and layout commands. An A-left/B-right row with equal weights can use the existing public document/CAS approach, which herdr-setup already uses (`HS/lib/consultant-column.js:76-92`, `:119-138`). No new herdr-app capability is needed for the live pair. `herdr-app commands` lists `terminal.keep` and `layout.resize`, but the latter targets layout nodes, not an arbitrary pane id. Do not assume it is a pane-resize API.

The existing consultant helper requires a door block and builds a consultant column (`HS/lib/consultant-column.js:49-51`, `:76-90`). Reuse its document-writing pattern, rather than silently making a leaf pair inherit its consultant-roster semantics. Apply initial 50/50 placement once, preserve unrelated nodes/focus, and verify the same result after restart and delayed window adoption.

### D2 — Literal parentage cannot preserve every requested state

The conflict is not pane placement. A native parent is an actual terminal address, while the leaf lifecycle does not require A to exist whenever B works: check.repair, merge, and later check.review rounds can require B alone (`src/routing.ts:38-50`), and command-run completion can start broadcast-only B (`src/next.ts:939-960`). The dispatcher starts a missing seat directly rather than ensuring another slot first (`src/next.ts:439-448`).

Observed `hc schema`: the terminal method list contains run/get/list/kill/rm/keep/label/read/attach/send/wait/keys/interrupt/put, with no parent-changing operation. The production wrapper sets parent only at launch (`src/hc.ts:284-303`), and its label operation changes labels (`:324-326`). A replacement A gets a new start after the old terminal is killed/removed (`src/next.ts:439-444`, `src/hc.ts:329-331`). Existing B cannot follow that new address through a documented reparent call.

| State | Consequence for true native parentage |
|---|---|
| A live, including idle A during a B-only phase | Parent B to that exact A address, with the two flags above. Phase does not prove liveness (`src/routing.ts:38-50`, `src/reconcile.ts:397-410`). |
| A never started / no recorded A | There is no actual A address. Starting B cannot unconditionally name a nonexistent parent (`src/next.ts:439-448`). Ensuring an extra idle A would change the current B-only lifecycle. |
| A finished but retained | **Low confidence:** the API's acceptance of a finished parent was not probed. Even if accepted, the current sidebar drops finished ancestors from its parent map, so B becomes top-level (`HS/mods/agents-by-tab/tree.js:9-15`). |
| A killed and removed | The recorded address is retired by the kill/rm path (`src/hc.ts:329-331`). It is not a stable logical slot identifier. |
| A restarted under a new address while B survives | B's old parent relationship does not identify the new A. The runner has launch-time parent selection only (`src/hc.ts:284-303`). Restarting B just to reattach it loses B's current conversation. |
| B restarted after A was lost | The dispatcher can currently restart B alone (`src/next.ts:439-448`). A mandatory live-A parent would introduce an additional prerequisite. |
| Stop, merge cleanup, or reconcile | Both recorded seats are explicitly ended today, A first (`src/reconcile.ts:414-416`, `:432-435`). Native parentage must not become the substitute for that ownership-based cleanup. |

There is no single actual-parent address that satisfies this table. An “A live ? child : parentless” branch would make lifetime/wait semantics depend on timing. I do not recommend it.

### D3 — Simplest design I would defend

**Use the existing leaf/seat labels for logical sidebar nesting and keep native leaf seats parentless.** Always represent the logical A/B pair in the sidebar, including an inactive A heading when only B exists. This uses the identities already emitted by the leaf start (`src/seat.ts:223-229`) and avoids needing a live parent. It is an alternative to the operator's literal native-child request, not a claim that the request already authorizes cosmetic grouping.

This alternative removes parent-exit coupling, notification injections, child-wait interference, reparenting, synthetic anchor processes and phase-dependent parent selection. Execution ownership remains the recorded session/address plus labels, as it is today (`src/reconcile.ts:395-410`). herdr-setup alone owns the display grouping, while akrogon keeps its current launch contract (`src/seat.ts:219-230`).

If literal native child status is mandatory, resolve the stable-parent/lifetime requirement before implementation. The live-pair recipe in D1 is insufficient for the missing/replaced-A cases. Maintaining an otherwise-unneeded A or restarting B to change ancestry would change the stated workflow.

**Geometry with no live A needs an explicit choice too:** a sole B cannot fill its tab and simultaneously occupy only its right half. A left-side empty region can preserve the geometry without another terminal. **Low confidence:** its exact public model-node representation was not probed. Any proposed placeholder must also be accepted by the engine's document parser, whose content object currently requires a terminal field (`src/hc.ts:160-164`). Do not promise an unverified mod/empty-node shape.

### D4 — Side effects to account for if native child status is chosen

1. **Automatic input.** `--no-notify` suppresses native child notes according to `hc run --help`; it does not prevent B deliberately sending A a message. Adding a parent must not silently replace the phase/report protocol: phase tasks are still generated by `promptFor` (`src/next.ts:399-405`) and completion still follows routing (`src/routing.ts:34-50`).
2. **A's waits change.** `hc wait --help` says `--children all/any` includes the parent's children. B is then part of that set even with `--no-notify`. Wait for explicit worker addresses when A intends only its implementation workers. Do not assume the notification flag changes membership.
3. **Natural exit versus explicit kill.** `--outlive-parent` is the documented protection when A's program ends. **Low confidence:** explicit `hc kill`/`rm` cascade behavior for outliving children was not probed. Test A exit, kill, rm and recovery separately before relying on the flag for A-only restart.
4. **Teardown order.** Prefer B then A for pair teardown, ending each recorded address explicitly. Current order is A then B (`src/reconcile.ts:414-416`, `:435`), and stop invokes that path before stopping the leaf slice (`src/stop.ts:53-58`). Prove A-only recovery does not terminate B, and whole-leaf stop leaves neither seat.
5. **Keep role-based engine selection.** The current seat lookup uses repo/leaf/seat labels and recorded address, not root-parent status (`src/reconcile.ts:397-410`). The listener recognizes seat events by labels (`src/listen.ts:77-84`), and watcher observation reuses `leafSeats` (`skills/watch-issues/scripts/observe.ts:90-97`). Do not introduce a parentless-only filter for leaf seats.
6. **Sidebar status changes too.** The generic child status routine converts done to idle (`HS/mods/agents-by-tab/tree.js:46-50`), and family status aggregates descendants (`:53-63`). A leaf reviewer is not an ephemeral worker whose completion attention can automatically disappear. Preserve the needed B status presentation when introducing its nested row. The tab-bar owner also follows ancestors (`HS/mods/panel-bar/routine.js:41-50`), so verify the tab's icon/status after the change.

## Part 3 — Remaining ways a leaf can stop

Order below is my relative likelihood judgment, not a measured incident rate. Source-backed failure paths are high confidence unless marked otherwise.

### R1 — An awaited operation never finishes

The pass queue awaits one child exit indefinitely (`src/listen.ts:29-35`). Raw hc calls have no deadline unless a caller supplies one (`src/hc.ts:87-96`), the socket probe has no deadline (`:129-138`), and scan waits for every initial subscription snapshot (`src/listen.ts:60`, `:117-118`). Any one can keep a service active while all useful work waits.

**Smallest fix:** use the existing process timeout boundary and `DISCOVERY_DEADLINE_MS` for bounded discovery/RPC operations (`src/hc.ts:110-112`). Give pass execution and first subscription readiness explicit failure bounds, propagate failure to existing supervision/catch-up, and close owned child processes. Do not apply the short discovery bound to an entire legitimate deploy. Set a pass bound from its actual operations. This needs no parallel health daemon or periodic state poll.

**Proof:** a held child or missing initial snapshot must yield a named failure and recovery, while an unrelated healthy session continues. A single hanging probe must not block all subscription discovery. A listener merely remaining systemd-active is not success.

### R2 — A failed pass consumes its only wake

The queue removes a pass before execution, logs a nonzero exit, then forgets it (`src/listen.ts:29-35`). Next can return nonzero after per-repo refusals (`src/next.ts:1339`). With no later terminal fact, nothing tries the work again.

**Smallest fix:** acknowledge reconciliation only after success. Use the existing supervised restart/startup catch-up path for failed passes rather than add a separate retry scheduler. Preserve the per-leaf error and delivery guards (`src/next.ts:487-509`), so a partially completed pass does not mean “send every task again.”

**Proof:** fail one pass, restore its dependency and emit no new hc event. The pending work must reconcile, with no duplicate task for a dispatch already committed before failure.

### R3 — Topology repair produces no reconciliation signal

A workspace rename/document repair can clear `uniqueness unknown` or duplicate-name refusals (`src/hc.ts:239-263`), but the listener subscribes with a terminal-label filter (`src/listen.ts:87`) and immediately ignores events without a terminal (`:75`). Document events reach only unfiltered subscriptions (`src/hc.ts:334-358`). Likewise, a departed session is removed and scanned, but reconciliation is deferred until that same session reconnects (`src/listen.ts:90-94`, `:72`). Closing an empty duplicate core can therefore remove the blocker without waking the surviving repo.

**Smallest fix:** make topology changes dirty the existing reconciliation queue. Use an unfiltered transport and filter terminal facts locally by the already-maintained label map (`src/listen.ts:58`, `:63`, `:77`), while accepting relevant `herdr-app` document changes and session departure. Keep conservative uniqueness refusal. Delete the special rule that recovery requires the failed session to return.

**Proof:** start with a refused duplicate, then rename its workspace or stop the duplicate core, without creating a labelled turn event. The healthy repo must resume. Unlabelled user terminal activity must still not cause an engine pass.

### R4 — First discovery misses a completed turn

New-session snapshots request resume only if the session was already in `catchUp` (`src/listen.ts:62-73`), but only previous stream termination populates that set (`:90-94`). A new core's still-live seat can already be idle/done before subscription. The finished-process check does not cover it (`:65-68`).

**Smallest fix:** reconcile after every successful initial snapshot. The existing deduplicating queue can absorb startup's already-queued resume (`src/listen.ts:25`, `:37-39`). This can consolidate the snapshot/reconnect special cases from R3 and remove `catchUp`.

**Proof:** introduce a core after the listener's startup, with a labelled stand-in that completed its turn before subscription and remains alive. Its next phase must start with no further terminal event.

### R5 — An optional watcher failure reaches the essential listener's fatal promise

The watcher can disappear between list and get/send (`src/hc.ts:560-578`). That rejection is sent to global `fail` (`src/listen.ts:50`). With the hot-fix supervisor this normally causes a restart rather than permanent death, but optional watcher failure still interrupts all dispatch and can recur during catch-up.

**Smallest fix:** isolate named watcher disappearance/unavailable outcomes at the per-repo wake boundary, with structured failure attention. Continue essential dispatch. Keep protocol/programming errors explicit and do not resend an uncertain message blindly. The existing watcher lock and wake function are enough (`src/hc.ts:575-578`).

**Proof:** make a watcher disappear just before delivery, then finish a leaf turn. The listener must dispatch that leaf and report the watcher failure without restarting.

### R6 — Delivery uncertainty is a permanent hold without active attention

An unconfirmed start records `delivery_error` (`src/seat.ts:265-284`), and a later send that reports not started records another such hold (`src/next.ts:470-483`). The dispatcher correctly refuses to resend while the turn is unchanged (`:493-495`). A new-seat path returns without making that outcome a pass failure (`:444-448`). A quiet seat can therefore remain held despite a live listener and even subsequent successful reconciliation passes.

**Smallest fix:** preserve this uncertainty guard, but send the existing watcher/attention signal when entering the hold. The user or watcher must inspect the seat and explicitly recover it. This is an error-resolution path, not permission to retry an uncertain task. **Confidence:** high for the hold/no-resend control flow, medium for whether an external scheduled watcher currently bounds the delay in every installation. The defect is absence of an immediate actionable wake, not the intentional hold itself.

**Proof:** a first task that never starts or a `started:false` send must cause attention and watcher inspection while keeping the original turn guarded. Recovery must not duplicate a task that was actually delivered late.

### R7 — A hung working seat has no busy-deadline event

Busy elapsed time is checked only during a pass (`src/next.ts:146`, `:169-188`). The new-seat path returns before `observeBusy` (`:444-450`), so its start may not yet be recorded. The listener queues only terminal fact changes (`src/listen.ts:79`), and heartbeats are ignored (`src/hc.ts:361`, `:381`). A lone hung seat can therefore exceed the deadline indefinitely.

**Smallest fix:** record the working start and schedule one semantic deadline using the existing `busy_since`/`STALL_MS`, waking the same queue. Restore it on restart and cancel it on settlement. This is one deadline, not a polling loop.

**Proof:** start a fresh seat, advance controlled time beyond the limit while delivering only heartbeats, and observe one busy notice/watcher wake. Settling before the deadline must cancel both. Do not seed `busy_since` artificially and miss the new-seat case.

### R8 — The manual e2e launchers retain the old shared-runtime route

The Part 1 diff changes the ordinary fixture, but the e2e launchers still start cores with `XDG_RUNTIME_DIR: realRuntime` (`tests/e2e/tier.ts:55-63`, `tests/e2e/watch-tier.ts:110-120`). Their launches do not use the new fixture's private-core runtime policy (`tests/hc-fixture.ts:191-210`). They remain a route for production discovery contamination and native shutdown-unit accumulation when those tiers run.

**Smallest fix:** apply the same private-core runtime and scope-only real-manager boundary to those owned launchers, reusing the reviewed fixture policy rather than another global cleanup sweep. This is residual coverage outside the Part 1 diff, not a defect newly introduced by it.

**Proof:** a free stand-in e2e cycle must leave production discovery unchanged and create no retained core/marker units, while its seat remains in the expected leaf scope. Relative likelihood is lower because these tiers are not every ordinary verification run.
