# Tasks board (A4)

## Question

Q1 when a row is red; Q2 what a click does; Q3 opening and its key; Q4 last merges; Q5 open charts; 3b Q1 the key; 3b Q2 the red rule.

### Carries

[Status JSON](status-json.md). Panels in herdr-setup's right panel, opened full width through the tabs clone (`issues/chart/herdr-panels/forks/panel-width.md`). Look and palette: `issues/chart/herdr-panels/forks/look.md`.

## Findings

`issues/chart/herdr-panels/slots/tasks-panel-{A,B,C,D}.md`, merged, rebuttals, final shape `tasks-panel-final.md`, focused checks `tasks-panel-final-check-{B,C,D}.md`.

## Taken

Operator, verbatim: "1b - because it's not unusual for the agents to work for more than 1h. The red is when something's really blocked, not time-dependent | 2a | 3a - ... | 4a | 5a | File the seed." Round 3b: "1a | 2a".

- Red marks real blocks only, never time: failed, prompt not delivered, Missing key, deploy failed, unreadable repo; after the herdr-app port also a seat `blocked` on a prompt. Time shows uncolored. Slow merge stays an amber alert line.
- 2a: a click expands the row (history, seats, plan path, kept paths) with buttons that point Files and Changes at the leaf's worktree. Go to A / Go to B wait for the port.
- 3a + 3b 1a: closed until opened; Tasks button in herdr-setup's top bar; `ctrl-b t` opens Tasks and closes it when Tasks shows.
- 4a: folded "Last merges (5)" across repos with age and total time. 5a: open charts folded under each repo.
- Defaults: `--json` always covers all registered repos; each leaf's detail is embedded; read-only; repo groups with epic/issue folders; alerts on top and tagged on their row; two-line rows with Program logos; current space's repo first; a 60 s redraw while visible; watch each repo's `issues/` plus `~/.akrogon` control paths only.
