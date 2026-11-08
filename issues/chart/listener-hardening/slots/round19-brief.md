# Round 19 (door A): herdr-app 0.1.14 vs akrogon

herdr-app 0.1.14 is downloaded and staged at ~/.local/share/herdr-app.new/ (not running yet: the live windows are 0.1.13 from ~/.local/share/herdr-app/). hc (herdr-core) stays 0.1.18. The full 0.1.14 changelog is below, copied from the new binary (`strings -n 20 ~/.local/share/herdr-app.new/herdr-app | grep -n -A40 '## \[0.1.14\]'`).

Question: is there anything in akrogon (repo /home/ivan/Work/infra/akrogon, main 873fac4c) that we can REMOVE because 0.1.14 fixes what it works around, or that we must FIX because 0.1.14 changes behavior akrogon relies on? Less code is the goal. Do not propose new features just because the API grew (pane.swap, exec timeout, focused terminal) unless one replaces existing akrogon code with something simpler.

Places worth checking (not exhaustive): src/notice.ts and the akrogon-notices mod it installs (top-of-file state is now shared by all copies of a mod), src/install.ts (any `herdr-app check` use), src/seat.ts and src/hc.ts (cwd when several terminals open at once, sub-agent/parent display, agent names), skills/chart-issues/scripts/peer-create.ts and peer-restart.ts, tests/fake-herdr-app.ts, and the workaround lessons learnings/history/2026-11-03-headless-output-freezes-window.md, 2026-11-07-run-check-ends-detached-window.md, 2026-11-08-herdr-app-window-log-while-running.md. Also anything that started codex via the + menu path (#657).

For each item: the changelog line, akrogon file:line, remove or fix, and the evidence that 0.1.14 really covers it (a changelog line alone is a claim, not proof; say what would prove it once 0.1.14 runs). Say "nothing" if nothing applies. Read-only: no edits, no herdr-app restart, no `herdr-app check` against the live app, no changes to labels or terminals. Write round19-<letter>.md and reply with the path.

## Changelog 0.1.14 (2026-11-08)

- Settings > Add machine tells you what to run when a machine needs a password, a new host key or herdr-core installed there, instead of opening a setup terminal. Once you've added it yourself, the list shows it as added.
- Mods can swap two panes by id with `pane.swap`. (#665, thanks @sQVe)
- Kimi Code gets its own icon. (#647, thanks @SuTang-vain)
- Mods can give `exec` a timeout: `exec(cmd, args, { timeout })` in milliseconds, up to 10 minutes (30 seconds by default). Opening a worktree in a large repository uses it.
- **Mods no longer all break at once after a while.** Opening Settings, the palette or a picker, or switching layouts, slowly filled up the mods' memory until every mod showed "This view could not be re-rendered". Mods also open faster now. For mod authors: the top of a mod's file now runs once and is shared by all its copies; keep per-copy state in the class.
- **On macOS, `herdr-app check` no longer leaves a second Herdr icon in the Dock.** Quitting that icon, or switching Herdr off under Background App Activity in Settings, ended every terminal. (#398, thanks @revofusion)
- Cmd+W and Cmd+Shift+W with Settings, the palette or a picker open close that window, not the terminal behind it.
- A pane that opens while the window is still laying out shows all of its output: a long line could lose its end, on screen and when copied.
- Layouts you've edited by hand keep all their pieces when a terminal in them ends or can't be reached.
- Two agents in one tab show their own names in the agents list.
- Codex started from the + menu keeps its own session, so closing one Codex no longer ends the others. This needs Codex 0.156 or newer. (#657, thanks @martintrifunov)
- On Windows, the + menu no longer marks installed agents as not installed.
- When Herdr can't reach a running core, it says why and how to fix it, instead of showing the install screen.
- On Linux with fcitx4, Chinese and other input methods keep working. (#558, thanks @SailorMoonQ)
- On Linux, the input method keeps working after switching windows.
- On KDE, the window no longer opens tiny. (#601, thanks @zdziejowski)
- New terminals start in the right folder when you open several at once, and start in your home folder when the folder they'd inherit is gone. (#511, thanks @JJLiebig)
- Zooming into a pane while moving between agents shows the right pane. (#568, thanks @martintrifunov)
- A kept sub-agent shows once in the agents list, under its parent. (#539, thanks @mertkaradayi)
- Toasts name agents by their proper name. (#530, thanks @thuanlm215)
- Find highlights all of a wide character. (#587, thanks @chanyang721)
- Clicking in a program that takes the mouse clears your selection. (#369, thanks @sundarshahi)
- The Changes list fills its panel and scrolls to every changed file. (#474, thanks @shadownrx)
- The palette scrolls past group titles, and shows 
 only on macOS. (#531, thanks @patrick-xin; #478, thanks @JJLiebig)
- Dialogs, the confirm dialog and Settings look right: sized to their content, rounded corners, layout previews and long theme names stay in their cards. (#593, thanks @karlAlnebratt; #570, #437, #621, thanks @martintrifunov; #457, thanks @yankewei)
- The sidebar rail's items line up. (#453, thanks @log4b)
- Pressing rename again closes the rename prompt. (#569, thanks @martintrifunov)
- Idle windows no longer wake every mod 20 times a second. (#548, thanks @abhijit-s)
- `herdr-app check` no longer touches the running app's shared mod state. (#516, thanks @JJLiebig)
- The terminal menu leaves out pane items where there's no pane, and mods see which terminal has the keyboard. (#553, #554, thanks @thuanlm215)
