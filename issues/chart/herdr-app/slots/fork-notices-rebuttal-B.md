# Notices rebuttal: B

- F1: Q2 misattributes “exit 0 = shown” to B. My pick requires an explicit `{shown, reason}` result. A successful command can legitimately return `shown: false`. Persist shown only from that result, not the exit status.
- F2: C's mod option has not established a synchronous acknowledgement. The documented mod interface receives commands through asynchronous `nextCommand()` (`AGENTS.md`, “The herdr module”); dispatch reaching a shown copy does not prove its callback posted a toast. A docked copy fixes availability, not acknowledgement. Before choosing C, probe whether `herdr-app do` actually waits for mod execution and propagates a posting error. Without that proof, C cannot inherit B's synchronous native-command semantics. Adding a reply protocol changes its cost and pick.
- F3: Q3's “old default unverified” omits B's verification. Old source `.../herdrdev/herdr-worktrees/focused-pane-border/src/cli/notification.rs:62` initializes sound to `NotificationShowSound::None`, with a default-sound test at `:189`. Busy stays silent. This is source evidence, not a live installed-binary probe.

The native patch still requires accessible herdr-app source and a proven update/install path before handoff, as my original D1 states. I do not claim that capability already exists.
