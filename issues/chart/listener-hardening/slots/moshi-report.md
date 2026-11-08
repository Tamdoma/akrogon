Subject: herdr-core (hc): every tab switch restarts the terminal and shows "Connecting…"

Setup
- moshi-hook 0.4.50 on Linux (Arch), herdr-core (hc) 0.1.18, Android Moshi app.
- Host connection: Auto (resolves to Mosh). The phone runs `moshi-hook hc attach --session infra`.
- moshi-hook doctor: all checks pass.

Steps
1. Connect to the host from Moshi. Two hc terminals each run a Claude agent (two tabs).
2. Switch between the two tabs, or between their chats in Chat View.

What happens
- Every switch restarts the terminal: the screen reloads and the header shows "<workspace> • Connecting…". Sometimes it stays on "Connecting…" until I reconnect manually.
- With old herdr (`herdr --session infra`) switching tabs was instant and never reconnected.

What we found on the host
- The mosh-server and the hc core stay up the whole time. Only the inner terminal view restarts.
- Each switch writes the core document `moshi-hook.selection` (version went 40 → 57 in 17 minutes).
- In the same second, `moshi-hook hc attach` kills its `herdr-core attach --history 1000 <terminal>` child and starts a new one, which replays 1000 lines of history. Every attached phone session on that core restarts, not only the one that switched.
- Writes come from the workspace-focus path (FocusWorkspace → focusHeadless → writeSelection). Nothing else on the host writes that document.
- Old herdr switched tabs inside one running client with a focus command, so nothing restarted. The hc path replaces the attach process instead.
- A stale mosh session (dead UDP port) left from an earlier connection made "Connecting…" more likely to stick. Killing it helped that part, not the restart.

Expected
- Switching tabs on hc behaves like old herdr: the view changes in place with no reload and no "Connecting…".

Suggestions
1. Switch terminals inside one attach client (detach the old channel, attach the new one on the same core connection) instead of re-execing `herdr-core attach` on every change.
2. Keep the selection per phone session, so one session's switch does not restart every other session.
3. Clear "Connecting…" as soon as the bound terminal matches the selected one.

Happy to run a verbose build or send logs.
