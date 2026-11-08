# Map D: bugs that stopped leaves

## K1 Listener died and stayed dead

Root cause: three layers each turn one dying socket into a global outage.

- `src/hc.ts:124-153`: `listening()` rejects every connect error except `ECONNREFUSED` and `ENOENT`, and `sessions()` uses `Promise.all`, so one `ECONNRESET` rejects the whole session list. It also has no connect deadline. The same `sessions()` failure reaches ordinary engine work through `src/hc.ts:216-219`, `src/next.ts:207` and `src/transcript.ts:123`.
- `src/listen.ts:20-21,112-127`: every scan rejection goes to one process-wide `fail`. The listener has no per-session failure boundary.
- `systemd/akrogon-listener.service:5-6` only sets `Restart=on-failure`. The installed unit currently resolves to `RestartUSec=100ms`, `StartLimitIntervalUSec=10s`, `StartLimitBurst=5`, so a fast crash loop becomes `start-limit-hit` and then manual recovery only.

Fix that removes the class:

1. Make socket discovery return a result per socket, never one failed list: `live`, `stopped` or `unreadable`. Treat the normal race with a closing core (`ENOENT`, `ECONNREFUSED`, `ECONNRESET`, `EPIPE`) as stopped; keep other errors, and a bounded connect timeout, as unreadable with the socket and error code in the result. Existing consumer rules then stay honest: `resolveSpace` refuses when uniqueness is unknown, `hostTerminals` returns unknown, and the listener keeps its existing subscriptions and logs the unreadable socket. Do not classify every error as stopped, because that could let dispatch choose one of two sessions while the unreadable one also holds the repo's space.
2. Make the listener a supervisor of independent session streams. A stream error, scan error or watcher wake error removes or retries only that piece and uses the existing catch-up path (`src/listen.ts:54,72,90-95`). Watcher wakes are optional by contract, so a wake failure must be logged, never process-fatal. Only invariant startup failures, such as no runtime directory or an unreadable global config at startup, should exit.
3. Let systemd be the last line, not a five-try limit: exponential restart delay with a bounded maximum and `StartLimitIntervalSec=0`. systemd documents `RestartSteps=`/`RestartMaxDelaySec=` for exponential restart intervals and says an interval of `0` disables start rate limiting (`systemd.service(5)`, https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html#RestartSteps= ; `systemd.unit(5)`, https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html#StartLimitIntervalSec=).

What it could break: a permanently broken release would restart forever and run `pull --all` on each start. The bounded exponential delay caps that churn, and the existing structured journal lines keep the error visible. Returning `unreadable` changes the `sessions()` shape for its three callers; each caller must keep its current refusal or unknown behavior rather than treating unreadable as stopped.

Test: with two fixture cores under one listener, kill one core so its socket is reset or stale during `scan()`, then end a labelled turn on the other. Before: the listener process exits and no `next --wake` runs. After: the listener stays alive, the dead session is recorded stopped, and the other core's `next --wake` runs. Add the direct probe case where a Unix socket peer resets the connection: `sessions()` returns it as stopped and still returns the healthy session as live.

## K2 Test cores share the operator's runtime directory

Root cause: `tests/hc-fixture.ts:163-203` deliberately starts the real core with the operator's `XDG_RUNTIME_DIR`, then symlinks its socket into a scratch runtime for akrogon. That isolates akrogon's view, not the operator listener's view: the real listener watches `/run/user/<uid>/herdr-core`, subscribes to every test core, runs real passes for test turn ends and probes their sockets while they close.

Fix that removes the class: start the fixture core itself with the scratch runtime the fixture already builds at `tests/hc-fixture.ts:188-196`. That directory already symlinks the real `bus` and `systemd` entries, and `cleanEnv` already gives an explicit real `DBUS_SESSION_BUS_ADDRESS`, which is what `systemd-run --user` needs. The core socket then lives only under `/run/user/<uid>/<fixture-session>/herdr-core/`; no production code needs a test-session name filter. `sweepAbandoned` must sweep those per-fixture runtime roots and their state instead of scanning the operator's socket directory for `akt*` sockets.

What it could break: seat scopes if `systemd-run --user` inside a terminal turns out to need more than the bus address and the linked `systemd` directory, and socket-path length if the scratch runtime moves back under a long temp path. Keep the runtime root directly under `/run/user/<uid>/` as today.

Test: start one fixture core and a leaf seat. Before: `akt*.sock` exists in the real `herdr-core` directory and the seat is inside its leaf slice. After: no `akt*.sock` appears in the real directory, the core answers through its scratch socket, and the seat's `/proc/<pid>/cgroup` is still inside the leaf slice.

## K3 hc shutdown-unit leak

Root cause: `tests/hc-fixture.ts:335-339` stops a core and deletes its sockets and state, but never removes the transient `hc-shutdown-*.service` hc created in the real user manager. `sweepAbandoned` at `tests/hc-fixture.ts:47-65` has the same hole for cores left by dead workers. The leaked unit is `Type=oneshot`, `RemainAfterExit=yes`, `CollectMode=inactive-or-failed`, so it stays loaded as `active exited` until stopped; `systemd-run(1)` documents `--collect` in terms of unloading after completion, which `RemainAfterExit=yes` defeats by keeping the unit active (https://www.freedesktop.org/software/systemd/man/latest/systemd-run.html#%2D%2Dcollect).

Fix that removes the class: make the fixture own the complete core lifecycle in one place.

- Record the `hc-shutdown-*` unit ids created by each fixture core by diffing the unit list around every server start, restart and stop that goes through the fixture. Serialize just those snapshot windows with the existing `withLock` helper (`src/state.ts:353`) so parallel test files do not claim each other's units.
- In `stop()`, first require `hc server stop` to actually succeed (today its result code is ignored), then stop exactly the recorded units with the real `systemctl --user` and the real bus, then discard files. Route `sweepAbandoned` through the same helper.
- Keep the upstream report open: the durable fix is still hc not leaving a `RemainAfterExit` anchor per throwaway core. Operator decision O1 makes the akrogon test setup responsible until then.

What it could break: stopping an anchor while its core is still alive could remove hc's shutdown ordering for that core, so anchors must be stopped only after the core is confirmed down. A snapshot diff without the lock can claim another worker's unit; the lock window must cover snapshot, server call and second snapshot.

Test: start and stop one fixture core while recording its shutdown units. Before: at least one recorded unit remains `active exited` after `stop()`. After: every recorded unit is `not-found` or inactive and unloaded after `stop()`, and a second core started in the same file still works.

## K4 The schema test reads the operator's core

Root cause: `tests/hc-identity.test.ts:129-134` runs plain `hc schema` with the test process environment. `hc schema` answers from the core that environment selects, so the test pins akrogon to whichever core version happens to be running, not to the binary and core the fixture started. It then deep-equals whole selected components (`tests/hc-fixture.ts:471-485`), so even an additive field such as `Terminal.first_message` fails although akrogon's own Zod objects ignore unknown fields.

Fix that removes the class: run the schema call through a fixture core (`core.hc(['schema'])` with the fixture's clean environment), so the version under test is the version the suite started. Then make `pinnedSchema` pin the contract akrogon parses, not the whole document: keep the selected methods and, for each component, only the properties and required entries akrogon's schemas consume. Additions pass; a removed field, a changed type or a changed method still fails.

What it could break: narrowing the pin could miss an upstream change in a field akrogon reads indirectly through a passthrough object. The real-core tests remain the backstop because they parse live replies on every run.

Test: run the schema test with the ambient environment pointing at a stale or absent operator session. Before: it fails or answers from the wrong core. After: it answers from the fixture core and passes, an added optional `Terminal` property still passes, and removing `turn` from the fixture document makes it fail.

## K5 New tabs at the end of the line (herdr-setup)

Root cause: the policy lives in one visual tab strip and in per-view memory.

- `mods/panel-bar/main.js:41,120-122` runs `tailMoves` from `panel-bar`'s render with `this.seenTabs`, one set per view instance.
- `layouts/flat.json:82` uses `panel-bar` for its tab strip, but `layouts/board.json:35` uses the shipped `tabs` mod, so the policy never runs in the board layout.
- With two windows on one session, each view derives "new" from its own previous snapshot. One window can move `x`, and the second can then read the intermediate order, treat `y,x` as the newly appeared order and move them again in the wrong sequence.

Fix that removes the class: move the policy out of the tab strip into the one herdr-setup mod already present in both layouts, `session-status` (`layouts/flat.json:162`, `layouts/board.json:116`), and remove it from `panel-bar` so there is one owner in every layout. Keep `seen` in herdr-app shared state rather than in a view: AGENTS.md says `shared(key)`/`setShared(key, value)` is seen by every mod copy and setting it re-renders all (`/home/ivan/.config/herdr-app/AGENTS.md:88,924-926`). The first view to render a changed tab list claims it by writing the new seen set before issuing its moves; the second view reads the claimed set and issues none. Keep the pure move calculation in a routine file both the owner and its tests use.

What it could break: a future herdr-setup layout without `session-status` would silently lose the policy, so the layout test below must cover every shipped layout. Running moves from `session-status` render is still a render side effect, as in `panel-bar` today; writing `seen` before the moves is what prevents a move/render loop.

Test: at routine level, simulate two views over one shared backing store: view 1 sees `[x,a,y,w]` against seen `{a,w}` and emits moves for `x` then `y`; view 2 then sees the intermediate `[a,y,w,x]` and emits no moves; the final order is `[a,w,x,y]`. At layout level, assert every herdr-setup layout that contains a tab strip also contains the policy owner mod exactly once. The current draft fails both: board has no owner and the second per-view call emits reordering moves.

## Missed ways a leaf can stop silently

### F1 A failed or hung pass loses the only wake

Root cause: `src/listen.ts:27-40` runs passes one at a time with no deadline. A nonzero pass is only logged at line 33 and never retried; a hung `akrogon` child blocks every later pass. For a seat that already ended its turn, there may be no second event, so one transient failure inside `next --wake` (for example the same socket reset in `sessions()`) leaves the leaf idle forever.

Fix: when `next --wake` fails, enqueue exactly one existing `next --resume` recovery pass; if that also fails, log it and stop retrying until the next event or resubscription. Bound a pass so a hung child is killed and reported instead of holding the queue forever; systemd's watchdog is the documented outer form of this (`WatchdogSec=` requires regular `WATCHDOG=1` pings and restarts with `Restart=on-watchdog`, `systemd.service(5)`), but a pass deadline inside the listener is the smaller change because the listener knows which child is stuck.

Test: make the first `next --wake` shim exit nonzero (and in a second case hang), then let the recovery pass succeed. Before: exactly one failed or stuck pass and no delivery. After: one `next --resume` follows and the seat receives its task, with no overlapping passes.

### F2 Optional watcher work and event parsing can kill the listener

Root cause: `src/listen.ts:44-51` routes every `wakeWatcher` rejection to `fail`, although the watcher is optional. In the event path, `src/hc.ts:375-378` parses every line with strict schemas and `src/listen.ts:77-78` parses status and label payloads inside the callback; any throw rejects that session's `ended` promise and reaches `fail` at `src/listen.ts:90-95`. One malformed event, one hc schema addition or one failing watcher send can therefore stop all dispatch, not just one session or one wake.

Fix: apply K1's per-session boundary here too. A parse or stream failure ends and resubscribes only that session, with its existing catch-up resume. A watcher wake failure is logged with repo and reason and dropped; the engine pass queue is never downstream of watcher health.

Test: feed one session a status event with an unexpected payload shape, and separately make the watcher send fail. Before: the listener exits. After: the listener stays alive, that session resubscribes or that wake is logged, and a labelled turn on another session still runs `next --wake`.

### F3 One hung subscription can block startup, and a dead stream is never noticed

Root cause: `src/listen.ts:57-96` resolves a subscription only when its first snapshot arrives, `scan()` waits for every fresh session, and startup passes start only after the first scan at lines 124-127. A session whose `hc events` child hangs before its snapshot blocks all passes. After startup, `src/hc.ts:376` discards heartbeats without recording their time, although `hc schema` (`events.subscribe`) says the stream sends a heartbeat every 15 seconds; a wedged client or core therefore looks subscribed forever.

Fix: track the last heartbeat or snapshot time per stream inside `follow` and end that stream after a bounded silence (several heartbeat intervals), which flows into the existing resubscribe-and-catch-up path. A subscription that produces no snapshot within the same bound is ended and retried as one dead session, not allowed to hold the whole listener's first pass.

Test: point the listener at one healthy fixture core and one `hc` shim whose `events` emits nothing. Before: no startup pass runs. After: the healthy core's passes run, the silent stream is restarted after the bound, and its catch-up `next --resume` runs when it finally answers.

### F4 A missing socket directory at boot is fatal

Root cause: `src/listen.ts:101-110,124` watches `$XDG_RUNTIME_DIR/herdr-core` before the first scan, and `sessions()` calls `readdirSync` on it without an existence check (`src/hc.ts:142`). At a boot where the listener starts before any hc core has created that directory, the listener crash-loops on `ENOENT`; with today's start limit it can be permanently down before the first session exists.

Fix: treat a missing socket directory as "no sessions yet" and watch the runtime directory for its creation, then watch the socket directory itself. This is part of K1's per-socket result contract: absent is a state, not an exception.

Test: start `akrogon listen` with an `XDG_RUNTIME_DIR` that has no `herdr-core` folder, then create the folder and start a fixture core inside it. Before: the listener exits immediately. After: it stays alive, subscribes to the new core and runs its startup passes.

## Order

K1 and K2 remove the outage and its trigger. K3 and K4 stop the test suite from degrading the machine and from depending on it. F1-F4 are the same outage class inside the listener and belong with K1. K5 is separate herdr-setup work.
