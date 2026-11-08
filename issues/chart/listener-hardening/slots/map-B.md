# Independent map B

Inspected akrogon main `75f61f00`, the herdr-setup working-tree draft, installed hc documentation and read-only systemd unit files. Tests below are proposed regressions, not executed tests. Current user-manager RPC reads returned `No data available`, so I do not claim a fresh service-state measurement. The incident evidence in the brief and lesson is distinct from that limitation.

## K1 — One disappearing endpoint becomes a global outage

**Root.** `src/hc.ts:124-151` makes discovery a `Promise.all` over every socket. A reset rejects the entire inventory; a pending connection has no deadline. `src/listen.ts:115-120` promotes that failure to process death. Related instances of the same lifetime race remain: `lstatSync`/`realpathSync` after the probe (`:107-109`), a rejected event stream (`:90-95`), and watching a socket directory that does not yet exist (`:124`). Merely adding `ECONNRESET` to `listening()` leaves those instances. The source and installed listener unit have `Restart=on-failure` with no restart delay or explicit start-limit policy. The recorded incident shows the default limiter exhausted its retries.

**Existing mechanisms.** One hc boundary (`src/hc.ts`), schema validation there, `DISCOVERY_DEADLINE_MS` (`src/shell.ts:195`), per-session subscriptions, directory-change wakes, one engine-pass queue, startup catch-up and systemd supervision already exist. `src/status.ts:732-736` reports live/down only when someone invokes status. It does not alert anyone.

**Fix.** Make session disappearance a per-session transport outcome throughout discovery, subscription and socket inspection. Distinguish gone endpoints from unreadable ones. Record session, operation, socket and errno for unreadable endpoints; do not call permission failure “stopped” or relax the uniqueness/cleanup refusals in other consumers. Contain an individual session's transport failure while other subscriptions continue, and reconnect through the existing lifecycle events and catch-up path. Bound connection and initial-snapshot waits with the existing discovery deadline. Handle socket-directory creation/replacement through its stable parent rather than assuming the directory exists forever. Keep invalid configuration/protocol failures explicit.

For process failures, use the existing supervisor: a deliberate cooldown such as `RestartSec=5s` and `StartLimitIntervalSec=0` removes permanent retry exhaustion without a hot restart loop. Add failure attention from the supervisor, independent of the listener's own event loop. With unlimited automatic restart, do not assume `OnFailure=` alone will announce each failed attempt. `ExecStopPost` receives the failure result and can invoke the installed `/usr/bin/notify-send` on failure; verify the actual desktop delivery before taking that interface. No second polling health daemon is needed.

**What could break.** Treating every error as “dead” can make unsafe uniqueness or filesystem-cleanup decisions. Retrying malformed protocol data as if it were a disconnect can spin forever. Unthrottled restarts can overload the manager. An alert depending on the broken hc discovery path can fail with the listener. Preserve the no-autostart intent when contacting stopped sessions.

**Regression.** Keep a healthy session delivering labelled turn ends while a second owned endpoint closes during discovery, disappears before `lstat`, or loses its stream. The same listener must continue dispatching the healthy session and reconcile the restarted one. Separately inject a permission error and observe a named refusal, not successful absence. Start with no socket directory, create it, and observe subscription. Exercise a stuck probe/snapshot and observe a bounded diagnostic. In an isolated test unit, fail more times than the former burst allowance, then succeed: the unit must recover without `reset-failed`, emit the failure notification, and run catch-up. Test the installed unit behavior, not merely its text.

**Sources.** systemd documents restart rate limiting and a default 100 ms restart delay in [systemd.service 262](https://www.freedesktop.org/software/systemd/man/262/systemd.service.html). [systemd.unit 262](https://raw.githubusercontent.com/systemd/systemd/v262/man/systemd.unit.xml) states that reaching the limit ends automatic retries and that interval zero disables this limiter. The service manual also documents `ExecStopPost` failure-result variables. hc process/stream behavior: `hc --skill`, inspected 2026-11-08; implementation boundaries: `src/hc.ts:359-401`.

## K2 — Test isolation protects the test from production, but not production from the test

**Root.** `tests/hc-fixture.ts:163-203` starts the real core in the real runtime, then gives akrogon a private directory containing a symlink back to that public socket. Production still sees the original socket. The same pattern exists in `tests/e2e/tier.ts:146-153` and `tests/e2e/watch-tier.ts:110-124`; fixing only unit fixtures leaves another route into production discovery.

**Existing mechanisms.** Each fixture already owns a short runtime directory (`hc-fixture.ts:190`), scratch state, explicit session, and bus/systemd links (`:195-196`). `tests/isolation.ts:61-66` already demonstrates private runtime discovery with the real user manager reachable.

**Fix.** Start the core itself in the owned short runtime. Use that same runtime for its clients, holders and cleanup. Keep the real user bus available through the explicit bus address and existing links. Remove the real-runtime socket plus reverse-link arrangement. Update `core.socket`, `link`, abandoned-fixture discovery and the e2e launchers together. Keep socket paths below hc's existing length bound. Do not teach production to ignore an `akt*` naming convention: that masks the leak and does not isolate its resources.

**What could break.** `systemd-run --user` and detached holders need their bus/runtime environment to remain usable. The core launches holders in their own processes, so a test-side environment change alone is insufficient. Abandoned-core cleanup must find the new location. Private sockets do not isolate the shared user manager, hence K3 remains necessary.

**Regression.** Run two private fixtures with a listener watching only a production-like discovery root. Fixture sockets and labels must never appear there, while the test listener sees only its explicitly linked fixtures. A stand-in must still run in its expected real user scope. After normal cleanup and an abandoned-worker cleanup, owned sockets/state must be absent and the other fixture must remain usable. Repeat the same isolation check for the free e2e launchers.

## K3 — Fixture ownership ends at files, not at all resources hc created

**Root.** `tests/hc-fixture.ts:335-338` stops a core and deletes files, but never stops its shutdown marker. `discard` and `sweepAbandoned` also omit it. The inspected transient marker files confirm `RemainAfterExit=yes` plus `CollectMode=inactive-or-failed`; an active/exited unit is not collected. Cleanup is registered only at `:341`, after startup and several other operations that can throw, so partially constructed fixtures can also escape teardown.

**Existing mechanisms.** `started`, `afterAll`, `core.stop`, `discard` and `sweepAbandoned` already carry fixture ownership. There is an exact native ownership link: `/run/user/1000/systemd/transient/hc-serve-85d55b26.service` identifies test session `akt18oo6-15` in its log path and has `After=hc-shutdown-b66d434aecab4705.service`. The inspected default core service instead names `hc-shutdown-324e839eddaba0d4.service`; its holder names the same marker in `Before=`. This removes the need to guess hc's hash or use global before/after unit-set differences.

**Fix under operator O1.** After starting an owned core, obtain its server PID, identify its actual service/cgroup and record the exact `hc-shutdown-*` dependency before stopping it. Retain this ownership record through teardown and worker-abandonment recovery. Stop the core, then stop its recorded marker and verify absence. Cover partial initialization, restart, explicit stop, killed-core discard and abandoned workers. Use the real systemctl/bus for fixture cleanup, not the fake systemctl supplied to the akrogon code under test. Do not glob-stop the user's markers or infer ownership from a global count difference while suites run concurrently.

**What could break.** Using a terminal's harness PID instead of the server PID can identify the wrong unit. Cleaning markers while their core/holders still run can disturb lifecycle ordering. A fake cleanup command can turn a leak into a false green. A changed hc service layout must fail ownership discovery visibly, rather than broaden deletion.

**Regression.** Start two owned cores and retain one as a sentinel. Clean the other through success, initialization failure and killed-core paths. Its recorded shutdown unit must disappear, while the sentinel core and marker remain. Restart one core before teardown and prove all resources owned by that fixture are removed. Recover an abandoned fixture from its recorded ownership. Repeating these cycles must leave zero owned markers, regardless of unrelated units being added concurrently.

**Sources.** Incident and same-head red/green evidence: `learnings/history/2026-11-08-hc-shutdown-unit-leak.md`. [systemd-run 262](https://www.freedesktop.org/software/systemd/man/262/systemd-run.html) documents that remain-after-exit keeps a service until explicitly stopped and that `--collect` changes collection of completed/failed units. [CollectMode documentation](https://raw.githubusercontent.com/systemd/systemd/v262/man/systemd.unit.xml) confirms that active units are outside those collection states. The test-only teardown is the authorized local fix; it does not require patching hc's source.

## K4 — The compatibility check measures the operator's chosen daemon and unused fields

**Root.** `tests/hc-identity.test.ts:129-133` runs unqualified `hc schema`. It does not use a fixture's endpoint or clean environment. `pinnedSchema` at `tests/hc-fixture.ts:471-482` then compares entire selected schema components, including Terminal fields the product does not consume. `src/hc.ts:22-34` parses the consumed fields with ordinary Zod objects, which accept and strip extra properties. Thus additive `first_message` can fail the test without breaking that reader.

**Existing mechanisms.** `hcCore`, `core.hc`, its explicit session/environment, pinned recordings and the real consumer decoders already exist.

**Fix.** Fetch the schema from a freshly started private fixture running the installed hc binary. Clear inherited terminal/socket selectors through the fixture, and clean it through K3. Make compatibility assertions about fields/methods and accepted values actually used by akrogon, instead of demanding equality of unrelated properties/descriptions. Refresh the observed recording for the supported installed version, but do not treat refreshing a snapshot alone as the isolation fix.

**What could break.** Ignoring all schema changes would lose real breaking-change detection. Keep negative checks for a required consumed field/type or RPC parameter changing. Do not restart or downgrade the operator's default core to make verification pass.

**Regression.** The test must pass with the caller pointed at an unrelated old endpoint, an invalid endpoint, or no operator core: only its fixture supplies the schema. An extra unused Terminal field must remain compatible. A removed or incompatible consumed contract must fail through the real decoder/consumer with a useful error. No operator socket or core is created or changed.

## K5 — Append behavior belongs to tab creation, not one view's first observation

**Root.** In herdr-setup, `mods/panel-bar/main.js:41,120-122` owns `seenTabs` per view. `routine.js:59-62` mistakes “not yet seen by this copy” for “newly created” and derives order from the current visual array. `layouts/board.json:35` uses shipped `tabs`, bypassing the hook entirely; returning to flat seeds a fresh baseline and does not repair the missed insertion.

The concrete two-observer case remains: both know `[a,w]`; A places x at the tail and closes before B renders. Then y arrives beside a, yielding `[a,y,w,x]`. B moves y to index 4, then x to index 4, leaving `[a,w,y,x]`. The newest tab is not at the end. This is not solved by adding more independent `seen` sets.

**Existing mechanisms.** Native `tab.move` accepts an explicit tab id and a 1-based index, including machine-qualified ids. The installed app manual and `herdr.d.ts` document shared core layout ownership and per-screen selection. herdr-setup already has pure transforms, public core document CAS and its own shared document namespace in `lib/consultant-column.js:3-4,119-167`.

**Fix.** Keep this wholly in herdr-setup. Put append eligibility/history at the shared session/space ownership boundary, rather than in each bar's render history, and drive it from creation/layout changes. Reuse the public core-document/CAS pattern for a single idempotent append decision that every supported bar can invoke. Record completion only after the actual layout change succeeds; a duplicate callback must not undo a later insertion or a manual move. Seed existing tabs as the startup baseline. Wire the same policy into board as well as flat. This needs a concrete ownership/commit design before taking the draft, not a global sort of leaf tabs or an artificial leaf group. There is no documented append-position setting in the inspected app command interface to assume instead.

**What could break.** Reordering existing tabs at window/layout start, undoing manual drag order, changing focus, losing concurrent core-document edits, or applying an unqualified id to a remote space. Shared history must represent tab births, not just a process's latest array, and must not require a polling daemon.

**Regression.** Run two independent observers through the sequence above and require `[a,w,x,y]` regardless of which callback runs last. Repeat a callback and require no further move. Create a labelled leaf while board is active and observe it at the end without switching layouts. Cover startup, layout/space switch, closure, an inactive space and machine-qualified remote ids. Assert actual resulting tab order/focus using a command-applying model or an owned window tier, not only the list of commands returned by the routine.

**Sources.** `/home/ivan/.config/herdr-app/AGENTS.md`, sections “The model”, “Commands” and “Mods”; `/home/ivan/.config/herdr-app/herdr.d.ts`, `TabInfo`, `SpaceInfo`, `run` and `spaces`; `herdr-app commands` from the preceding review of this same draft.

## Additional confirmed stop paths

### K6 — A new session's completed turn can be missed forever

**Root/evidence.** `src/listen.ts:62-73` queues catch-up only when `catchUp.delete(session)` succeeds. That set is populated only after an earlier stream ends (`:90-94`). A session first discovered after startup therefore gets no catch-up pass. Its snapshot may already contain an idle/done, still-live seat whose turn ended before subscription. It is not covered by the finished-process wake at `:64-70`, and there may never be another event.

**Fix/reuse.** Every successful subscription snapshot must request reconciliation, including first discovery. The existing deduplicating queue and phase/turn guards already carry this safely; startup's queued resume can absorb the duplicate.

**Risk/test.** Preserve pull-before-resume startup order and single flight. Start the listener, then expose a new core whose labelled stand-in has already finished its turn but remains alive. Its next-phase prompt must arrive without any subsequent terminal event. The current restart tests do not exercise first discovery after startup.

### K7 — A failed pass consumes the only wake

**Root/evidence.** `src/listen.ts:29-35` removes a pass before executing it, logs a nonzero exit and forgets it. `src/next.ts:1339` returns nonzero after skipped/error work. If that error was transient and no further turn arrives, the service remains “live” while the leaf remains stuck.

**Fix/reuse.** A failed reconciliation must not count as an acknowledged wake. Surface the failure and arrange catch-up through the existing supervised restart/startup path instead of creating an independent unbounded retry loop. Preserve existing state/turn delivery guards when replaying.

**Risk/test.** A nonzero next may include a permanent per-leaf refusal, so recovery must retain its diagnostic and avoid treating every replay as permission to resend work. Inject a single failed next pass, recover its dependency, and emit no additional hc event. Reconciliation must still complete or an actionable failure must reach the operator. Also prove no duplicate task when the failed pass already committed another leaf's dispatch.

### K8 — An optional watcher failure kills essential dispatch

**Root/evidence.** `src/listen.ts:50` routes a rejected watcher wake into the same global fatal promise as an essential listener failure. `src/hc.ts:555-573` lists a watcher, then gets/sends to it later. A watcher exiting between those calls can therefore kill dispatch for every repo.

**Fix/reuse.** Keep this failure at the existing per-repo watcher boundary. Handle named disappearance/unavailable-send outcomes with structured diagnostics and attention, while preserving the main pass queue. Leave unexpected protocol/programming errors explicit. The watcher is optional, so its liveness cannot be a prerequisite for the engine's.

**Risk/test.** Do not hide a failed watcher wake or blindly resend an uncertain send. Remove an owned watcher between listing and delivery, then complete a labelled leaf turn. The listener must stay up, dispatch the leaf and report the watcher failure with its repo/address.

### K9 — The 60-minute busy deadline has no wake of its own

**Root/evidence.** `src/next.ts:146,169-188` checks elapsed busy time only inside an engine pass. A newly started seat returns at `:444-448` before `observeBusy` at `:450`, so even its busy start may remain unrecorded until another pass. `src/listen.ts:79` schedules passes from turn/blocked/finished/lost events; it has no busy-deadline wake. `src/hc.ts:356,376` deliberately ignores heartbeats. A lone working seat that hangs without new facts can therefore exceed the deadline indefinitely without the promised notice or watcher wake.

**Fix/reuse.** Record the working start on start confirmation/status transition, then use the existing `busy_since` and `STALL_MS` to schedule the next semantic deadline as a one-shot wake of the same queue. Restore it on startup, and cancel/recompute when the seat settles. This is a deadline, not periodic hc polling.

**Risk/test.** Avoid duplicate notices and stale timers after phase changes/restarts. With controlled time, start one fresh seat, keep it working and deliver only heartbeats. Crossing its deadline must produce the busy notice and one watcher wake without another terminal event; settling before the deadline must suppress both. Do not prepopulate `busy_since` in the test and thereby hide the missing start observation.

K2–K4 make verification safe and trustworthy before broad reruns. K1 and K6–K9 share the listener's existing transport/queue/supervisor boundaries. K5 stays a separate herdr-setup outcome.
