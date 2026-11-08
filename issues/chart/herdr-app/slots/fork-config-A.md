# Fork notes A: config

## Q1 codex
- Pick: add `--no-daemon` and keep `-a never -s danger-full-access` as today. Reason: hc requires `--no-daemon` or codex's commands run outside hc (`hc --skill`), and with containment Taken the leaf seat is already boxed by its systemd scope, as today; full access is today's leaf behavior and reaches the hc socket. The sandbox network flag matters only for sandboxed codex, which leaf seats are not. Cost: none beyond one flag.
- Rejected: workspace-write plus network flag for leaf seats (changes what leaf seats may do today; a new behavior, against "closest to today").

## Q2 agy
- Pick: leave agy out of `harnesses:` for now. Reason: no slot uses it today; it is used only as a hand-started consultant, and it showed a silent stop and a scroll viewer that swallowed a send (INTAKE 2026-11-06). Adding it is a new feature. The chart door starts consultants with the operator's named kind and arguments (chart-door Taken), so agy consultants keep working without a `harnesses:` entry. Ask: does the start verb need a `harnesses:` entry for every kind it starts?

## Q3 permissions
- Pick: no change to leaf argv. The engine starts leaf seats from the listener, outside any Claude session. For consultants, the operator adds one Claude permission rule allowing akrogon's start verb, so a door in auto mode can start consultants; recorded as a needs-sheet item. Reason: the classifier refusal is about a door starting a full-access agent; one allow rule for the one start verb removes it without weakening seats.

## Q4 app home
- Pick: herdr-setup's convention, resolved in one place in akrogon's hc module: `HERDR_APP_HOME` when the caller's environment has it for the same session, else `~/.config/herdr-app-sessions/<session>`, else `~/.config/herdr-app` for `default`. Reason: herdr-setup's `bin/herdrapp` defines the homes; no new config key.
- Pitfall: the convention lives in another repo; if herdr-setup changes it, akrogon breaks. Removed by: the patch-mechanism post-update check and an e2e test that writes a notice into a named session's home.
