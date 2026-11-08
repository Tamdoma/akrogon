The observed Auto connections use **Mosh**. Host-side automatic hc detection works for both current sessions. The evidence still points to Moshi's view/subscription handoff, but does not identify the exact mobile failure behind “Connecting…”.

## F4 — Auto selected Mosh for the observed connections

I inspected `round6-connect-with.jpg`. The menu shows a saved preference, not the negotiated transport. To establish the latter I ran:

```sh
hc exec -- ps -C mosh-server,sshd,sshd-session,sshd-auth,etserver,moshi-hook -o pid,ppid,lstart,args
hc exec -- sh -c 'ss -uapn | rg "mosh-server|:600[0-9][0-9]"'
```

Observed host state:

```text
mosh-server PID 2845920, started 11:37:55, UDP 100.84.11.83:60003
mosh-server PID 3862188, started 12:25:33, UDP 100.84.11.83:60001
both run: moshi-hook hc attach --session infra
```

An older second session has now been replaced by the 12:25:33 connection. This establishes one new outer connection since my original sample, not continuous mosh-server churn.

The screenshot's `:22` is consistent with SSH bootstrap followed by Mosh's UDP terminal connection. That is Mosh's documented operation. [Mosh documentation](https://mosh.org/#usage)

I cannot infer Auto's complete preference order or fallback rules from this observation.

## F5 — The sidebar has a separate metadata/control path, and host discovery succeeds

The installed binary describes a “sidebar of tmux windows / herdr tabs with agent status”. It includes gateway handlers `handleWorkspaces`, `handleWorkspacePanes`, `handleEvents`, `/v1/workspaces/focus`, and the hc driver's `WatchWorkspaces`. This is Moshi's workspace/terminal/agent list, not the old Herdr TUI sidebar rendered inside the terminal stream.

`moshi-hook --help` describes a local bridge and persistent WebSocket to Moshi. The daemon log records:

```text
11:38:46.725 gateway: listening listen=127.0.0.1:24543
11:38:47.812 ws bridge connected
```

Host `ss -tapn` confirms the loopback gateway listener and established outbound TLS sockets owned by the daemon. A working Mosh UDP terminal does not establish that the mobile client's gateway/event subscription is ready. The loopback API needs a supported proxy/control route from the phone. The available evidence does not identify whether this Android client uses an SSH tunnel, Moshi relay, or another route for that API.

Crucially, the installed preflight succeeds automatically for both actual Mosh ports:

```sh
hc exec -- moshi-hook context --mosh-host 100.84.11.83 --mosh-port 60001
hc exec -- moshi-hook context --mosh-host 100.84.11.83 --mosh-port 60003
```

Both return:

```json
{"kind":"hc","mux":{"session":"infra","pane":"t6x","sessionLabel":"Himne"},"agent":{"source":"claude","session":"00fe88c3-c31c-4ea6-98ee-ec84195a2cf5","pane":"t6x"}}
```

Thus the host can locate the terminal and agent without a manual terminal selection. What remains unproved is why the mobile client fails to acquire/rebind its sidebar or Chat View subscription automatically after a switch/resume. Missing hc detection is not demonstrated. “Connecting…” alone does not distinguish discovery, gateway access, subscription startup, and stale mobile state.

## F6 — No transport switch is an evidenced fix yet

Only Mosh was observed. SSH, Osewa, and ET were not exercised because the brief prohibits changing the operator's connection. There is no controlled comparison establishing that one resolves this failure. The previous stable workflow also used Mosh according to the operator, while today's changed program inside it is the hc selection follower.

A different terminal transport may change how a broken terminal link recovers. It does not establish that Moshi will correctly bind its workspace list, conversation, readiness state, and prompt destination. My original mixed-identity finding remains independently relevant.

The smallest justified next step is in **Moshi's client/hc integration**: trace the existing connection's selected-terminal preflight and gateway/event subscription through a tab change and app resume, then repair the failing handoff. Record the effective terminal/agent identity and subscription-ready result together. The host already returns the required identity. No local network, daemon, or terminal change is justified by this read-only evidence.
