# Round 6: D — Moshi reconnects

## Cause I can prove

The reconnect on a tab change is moshi-hook's selection-follow design, not a dropping mosh/core connection:

1. The phone's PTY does not run a multiplexer client. It runs a follower supervisor, `moshi-hook hc attach --session infra`, which execs one `herdr-core attach --history 1000 <terminal>` child for the currently selected terminal. Both live mosh sessions show that shape, with the `mosh-server` and wrapper processes staying up while only the attach child changes:

   ```text
   2845920 11:37:55 mosh-server new ... exec moshi-hook hc attach --session 'infra'
   2845921 11:37:55 moshi-hook hc attach --session infra
   3862188 12:25:33 mosh-server new ... exec moshi-hook hc attach --session 'infra'
   3862189 12:25:33 moshi-hook hc attach --session infra
   4035624 12:28:57 herdr-core attach --history 1000 t6x   (child of 2845921)
   4035646 12:28:57 herdr-core attach --history 1000 t6x   (child of 3862189)
   ```

2. The selected terminal is one global core document per hc session:

   ```text
   $ doc.get moshi-hook.selection  -> {"value":{"terminal":"t6x"},"version":40}   (12:12)
   $ doc.get moshi-hook.selection  -> {"value":{"terminal":"t15"},"version":55}   (12:28)
   $ doc.get moshi-hook.selection  -> {"value":{"terminal":"t6x"},"version":57}   (12:30)
   ```

   The clean attach log lines up with the value changes, same second: `12:14:54 attach=[...:t15]`, `12:16:53 attach=[...:t6x]`, `12:21:00 t1`, `12:21:03 t15`, `12:21:07 t6w`, `12:21:10 t6x`, `12:21:14 t15`, `12:28:58 t6x`. So a tab change does not ask the existing attach client to show another terminal; the follower kills it and execs a new one, which replays first paint plus 1000 lines of history into the mosh PTY. That process replacement is the reconnect the operator sees.

3. It is the *value* change that restarts followers, not every write. My 5-second samples on 2026-11-08 showed `t15 v49` at 12:21:19 and `t15 v50` at 12:21:29 with no attach pid change between `12:21:14` and `12:22:29` in the clean log. The follower compares terminal strings, as its binary's `watch`/`settle` code does (`github.com/rjyo/moshi/app-hook/internal/mux/hc.watch`, `hc.settle` in `strings ~/.local/bin/moshi-hook`).

4. Who writes the document: only moshi-hook. `grep -R moshi-hook.selection` over akrogon `src/`+`skills/`, herdr-setup `lib/`, `bin/` and the relevant mods returns nothing. In the moshi-hook binary, the call graph around the document is:

   ```text
   hc.(*Driver).focusHeadless      -> hc.writeSelection
   hc.reselect                      -> hc.writeSelection   (called by closeHeadless, pruneFinished)
   hc.(*Driver).documentLayout    -> hc.writeSelection   (only on the not-found repair branch)
   hc.(*followSelection).selected  -> hc.readSelection
   gateway.(*Server).handleWorkspacesFocus -> ... -> hc.(*Driver).FocusWorkspace -> focusHeadless
   ```

   So the normal writer is the daemon's workspace-focus path: the phone app asks the daemon to focus a workspace/tab, the daemon writes `moshi-hook.selection`, and every attach follower on that core sees the doc event and re-attaches. The other writers are repair paths that fire only when the recorded terminal has finished or is absent from the layout; t15 and t6x were live throughout (`hc ls --json`: both `state:live`).

5. Nothing of ours fights it. While the selection moved `t15 -> t6x -> t15`, the desktop window's own selection never moved:

   ```text
   $ HERDR_APP_HOME=~/.config/herdr-app-sessions/infra herdr-app status
   {"space":"spa29b47...","tab":"tbf1f2bc...","agent":"t6x","layout":"flat", ...}   (12:18, 12:19, 12:30)
   ```

   Akrogon never calls `doc.set` (`grep -R "doc\.set" src/` is empty). Herdr-setup's only core-document writer is the consultant column helper, and it writes only the `herdr-app` layout document (`/home/ivan/Work/infra/herdr-setup/lib/consultant-column.js:3` sets `LAYOUT = "herdr-app"`; its `doc.set` is at line 164). The desktop window, akrogon and the mods therefore do not write or overwrite `moshi-hook.selection`.

6. The core and the mosh servers are not dropping. `HC_SESSION=infra hc server status --json` reports the same core with `uptime_ms` ≈ 3 days across the whole window; the two `mosh-server` processes and their wrappers keep their start times while attach children churn underneath them.

That is also the systemic difference from old herdr. Old herdr was one server that owned workspaces, tabs, panes and the selection; the mosh PTY ran one long-lived herdr client and a tab change was a state change *inside* that client/server protocol. Nothing was exec'd, no history was replayed. The new stack splits it: herdr-core owns terminals, herdr-app owns the desktop window's selection (in its own view state), and Moshi invents a third selection — a core document — plus a supervisor that can only display a terminal by execing a fresh `herdr-core attach` process per selection. Every tab change is therefore a process replacement and a full repaint by construction.

## Transport and the sidebar (operator addition)

1. **Auto picks Mosh on this host, proven from the host side.** The interactive PTY trees are `mosh-server -> moshi-hook hc attach -> herdr-core attach`, and the UDP listeners are the mosh servers:

   ```text
   $ ss -uapn | grep mosh-server
   UNCONN 100.84.11.83:60001 users:(("mosh-server",pid=3862188))
   UNCONN 100.84.11.83:60003 users:(("mosh-server",pid=2845920))
   $ moshi-hook context --mosh-host 100.84.11.83 --mosh-port 60003
   {"kind":"hc","mux":{"session":"infra","pane":"t6x","sessionLabel":"Himne"}, ...}
   $ moshi-hook context --mosh-host 100.84.11.83 --mosh-port 60002
   no UDP listener on port 60002
   ```

   The SSH sessions from the phone in `journalctl -u ssh` are short bootstrap/preflight connections (most close within a second; `moshi-hook context --help` says the app captures `$SSH_CONNECTION` via ssh-exec right after a session opens). No terminal runs under them. Osewa cannot be what Auto picked: `moshi-hook osewa status` returns `{"installed":false,"running":false,"port":7322}` and nothing listens on 7322. ET is absent: no `et`/`etterminal` binary or process on the host.

2. **What the sidebar is.** Moshi's "Workspaces & Jump To" feature is, in `moshi-hook doctor --json`'s words, the "sidebar of tmux windows / herdr tabs with agent status". It is fed by the moshi-hook daemon's gateway (`/v1/workspaces`, `/v1/workspaces/layout`, `events.watch.workspaces`), which the phone reaches through the daemon's cloud WebSocket bridge, not through the mosh PTY. On the host all of that is up: the daemon is running and paired (`moshi-hook status`), the gateway listens on `127.0.0.1:24543`, the log shows `ws bridge connected` at 11:38:47 with no drop since, and doctor reports the workspaces feature `ok`.

   But the layout data is session-scoped: `GET /v1/workspaces/layout` without a terminal session returns `400 {"error":"a terminal session is required"}`. The app therefore has to bind the sidebar to a live terminal session context (resolved by SSH preflight or by mosh port, per `moshi-hook context`) before the list can populate. That binding is exactly what is fragile here: at 12:29 there were two live mosh servers (60003 from 11:37, 60001 from 12:25) and one dead port (60002, whose server exited at 12:25:21). If the app resumes holding the dead session's port, its context lookup gets the same `no UDP listener on port 60002` answer I got, and the sidebar cannot bind by itself until the user reconnects and the app captures a fresh session. I cannot prove from the host which port the phone held at the screenshot moment (see below).

3. **Would another transport change the tab-change reconnect? No.** SSH, Mosh, ET and Osewa are only carriers for the same PTY command, `moshi-hook hc attach`; the selection document, the follower and the attach-child replacement all sit above the carrier. Evidence: attach children churn at selection changes while the carrier processes (`mosh-server`, wrappers) keep their PIDs and start times. What the choice does change is network recovery: Mosh roams and resyncs after IP/background loss, SSH dies with the TCP connection, and ET/Osewa have their own session-id based resume — Osewa is not installed here and ET is absent, so neither is testable on this host today. Forcing "Mosh" instead of "Auto" would only remove Auto's extra SSH preflight/fallback probing; it would not stop a tab change from replacing the attach child.

## What I could not prove

- Why the phone sometimes stays on "Connecting…" after the host-side attach child is already running (host replacement is same-second in the log). From the host I can rule out the usual suspects — core restart (3-day uptime), daemon or gateway down (doctor `ok`, ws bridge connected), UFW drops (journal UFW blocks in the window are only router multicast `224.0.0.1`; `tailscale status` shows the phone `active; direct 192.168.178.73:33172`, and `tailscale netcheck` reports `UDP: true`) — but I have no phone-side log, so I cannot distinguish the app waiting on mosh resync, waiting on a gateway live-session event, or holding a dead mosh port as in (2) above.
- Which of the two live mosh sessions the phone was actually displaying at any given moment. Both resolve through `moshi-hook context` to the same selected terminal because both wrappers follow the same global selection document.
- Whether each selection write was a deliberate phone tab tap or the app re-asserting its current chat's workspace on resume. The daemon logs gateway prompts but no focus/selection events, and the doc event carries no author. The rapid sequence at 12:21 (`t1 -> t15 -> t6w -> t6x -> t15` in 14 s) reads like swiping through tabs, but that is inference, not proof.
- Whether Osewa's auto-connect would behave better. It is not installed, and enrolling it would be a change, which this read-only round forbids.

## Smallest fix that removes the cause

Owner: **moshi-hook / the Moshi app** (`github.com/rjyo/moshi/app-hook`, `internal/mux/hc` follow path), not akrogon and not herdr-setup.

- Make the follower switch terminals inside one attach client instead of execing a new `herdr-core attach` process per selection: keep the core connection open, detach the old terminal's channel and attach the new one (the core attach protocol already separates connection from terminal channel), or at minimum start the new attach and cut over only after its first paint, so the PTY never goes blank. Either removes the process-per-selection reconnect.
- Make the selection per phone session instead of one global document per core, or have only the session that requested the focus re-attach. Today one write restarts every follower on the core, including stale mosh sessions.
- Until then, the local workaround that only reduces the churn (operator action, not a code fix): close the stale mosh session so one follower remains, and pin the host's connection type to Mosh so Auto does not add SSH preflight sessions on top. Tab changes will still restart the attach child.

Old herdr was stable because the thing the operator is asking for — one persistent client whose view of workspaces/tabs/panes changes in place — was its native model. The new model reconstructs that view from three pieces (core terminals, a separate selection document, a process-per-terminal attach client), and the seams between those pieces are exactly where the reconnects appear.
