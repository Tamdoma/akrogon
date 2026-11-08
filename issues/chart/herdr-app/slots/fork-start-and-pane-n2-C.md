# start-and-pane Q2b N2 check, C (2026-11-06)

Mechanism works as written: `tab.rename` takes `id` and `name` (`herdr-app commands`), and a closed window is detectable, since `herdr-app ls` with `HERDR_APP_HOME` pointing at a session without a window answers "no Herdr window at <home>/herdr-app.sock: Connection refused" (run live on `mdconsultingny`). Three gaps in the record:

1. Window address. The record pins `HERDR_APP_HOME` per session but names no source. The mapping is herdr-setup's convention, `~/.config/herdr-app-sessions/<session>` (`bin/herdrapp` line 62), and the `default` session has no such dir. Without it the placement check and the rename ask no window or the wrong one. Record where akrogon gets it (config fork).
2. Closed vs broken. The engine pass must read only the "no Herdr window" answer as closed and report any other `herdr-app` error; probe: window closed, pass ends clean with status showing the tab unnamed (F5).
3. Sweep scope. "First engine pass" runs per leaf (`next <slug>`), so leaf Y's tab stays numbered until Y's own turn ends even after X's pass saw the window. Either the pass renames every recorded leaf tab of the repo, or the cost line says "that leaf's next turn".

Note, not an objection: renaming any leaf tab "whose name is not its slug" also undoes an operator's manual rename of that tab.
