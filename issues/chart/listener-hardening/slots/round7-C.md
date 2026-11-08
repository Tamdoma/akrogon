# Round 7, slot C: disagreements only

## 1. Who writes the flips: I withdraw my round 6 P3 ("automatic revert to the window's focus"); D is right

Evidence: `moshi-hook logs` records every prompt the operator sends from the phone with its pane. Laid against the selection flips (doc versions and A's attach.log), every flip follows a phone prompt into the *other* chat by 10-50 s, in both directions, not only towards t6x:

| phone prompt (pane) | next selection write |
|---|---|
| 12:12:23 t15 | 12:12:34 t6x |
| 12:14:44 t6x | 12:14:54 t15 |
| 12:15:22-12:16:09 t15 (3) | 12:16:53 t6x |
| 12:18:25, 12:18:45 t6x | 12:18:54 t15 |
| 12:26:30 t6x | 12:26:34 t15 |
| 12:27:09 t15 | 12:28:58 t6x |

The operator was working two chats (Himne = t6x, akrogon door = t15) and switching between them after each message; the app focuses the chat's workspace on each switch (`handleWorkspacesFocus -> FocusWorkspace -> focusHeadless -> writeSelection`, D's path, symbols present in the binary). The desktop window's focus on t6x was a coincidence, not a writer. Supporting: from 12:28:58 to 12:45:11 no prompt was sent and the document stayed at version 57; 210 s of 0.2 s process sampling caught no `herdr-app status` call from the daemon or the wrappers, which a host-side focus poll would have shown. What stays open is only whether each write was a tap or the app re-asserting on resume; that is inside the app. If anyone still wants a host-side test: select c-akrogon on the phone, lock the phone for five minutes, watch the document version; a change with the phone locked would be the only evidence for a host writer, and I now expect none.

## 2. The fix: disagree with my own O2 as the first move; agree with O1, O3 is harmless but fixes nothing

- O2 (`HC_SESSION=infra exec hc`): `hc` is `herdr-core` itself (`~/.local/bin/hc -> herdr-core`) and its picker attaches in the same process. The gateway binds the phone session to a pane by finding a `herdr-core attach <t>` child under the mosh shell (round 6 P4; "no shell child for mosh-server on UDP %d" in the binary). With the picker there is no such child, so the sidebar and chat binding would most likely be lost, which is worse than today. Low confidence either way; it is a test, not a fix.
- O4: there is no switch. `moshi-hook hc attach` has only `--session`; `moshi-hook set` lists no attach or follow setting (full list read); no config dir under `~/.config/moshi-hook`, config is `~/.config/moshi/config.toml` with those same keys.
- O3: closing the stale 11:37 mosh session removes one follower that nobody sees; the visible session still re-execs on every chat switch. Pinning Mosh changes nothing about this (all four transports run the same shell command). Free, harmless, not a fix.
- O1 is the fix and the proof is complete: moshi-hook's follower tears down and rebuilds `herdr-core attach` on every selection write, the write is the app's own chat switch, and the app then shows "Connecting…" until its session binding catches up with the swap. Upstream needs two things: switch the viewer in place (detach/attach without killing the child, or a per-session selection so other sessions do not restart), and stop showing "Connecting…" once the bound pane equals the selection. Cost to the operator meanwhile: none they can remove locally; switching chats on the phone will redraw the terminal each time until moshi-hook changes.

One line for the report to upstream: "0.4.50, hc 0.1.18: `moshi-hook hc attach` re-execs `herdr-core attach --history 1000 <t>` on every `moshi-hook.selection` write; the app writes it on every chat switch; every attached session restarts and the app shows Connecting… for the swap; timings above."
