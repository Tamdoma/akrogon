# Switch, notes A (before reading B and C)

## Q1 On
Pick: the operator types it with the invocation, e.g. `/chart-issues autopilot <work>`, naming consultant panes as today. Right after reading the handed work (SKILL.md:33) A writes one `Mode: autopilot` block into each handed chart's CHART.md: start time, the operator's words verbatim, the handed work, the consultants, and the best-guess needs list (Boundary Taken). No config key, no file switch. Reason: the operator's words recorded in the chart survive compaction and are what every later pick cites; 08-19's agent-written autopilot YAML broke gates (slots/history-repos-A.md). Cost: re-said each night.
Rejected: a config key or `paused.yaml`-style file (C map O3): new code, and an agent can flip a file. Medin out-of-scope line as a required field: operator answered "handed work only", which already bounds scope; an optional line costs nothing.
## Q2 Off
Pick: explicit off in the door pane ("autopilot off" or plain words saying so). A appends `Mode: attended <time>` to each chart it holds and the next question goes to the operator. Any other operator message is an input A applies while staying in autopilot. Leaves already handed off keep running. Reason: last night the operator sent mid-run inputs (source file) that were not stop orders. Cost: the operator must say off.
Rejected: any message ends it (C): a correction mid-night would stop the whole run. Off undoes picks (none proposed).
## Q3 Replacement session
Pick: a replacement A session continues autopilot when the chart holds a `Mode: autopilot` block with no later `Mode: attended`, and records itself in seats.yaml as today. Reason: crashes and compaction happen at night; returning to attended parks everything (largest historical stall cost). The operator's words are on disk. Cost: a stale mode could carry into a session the operator meant to be attended. Removed by: the mode ends with the pass, i.e. when the door's handed set is done, A appends `Mode: attended` itself, so a later session opens attended.
Rejected: replacement returns to attended (B map Q1): stalls the night.
## Q4 Concurrent doors
Pick: an autopilot door works only charts in its handed set, each marked by its Mode block naming the door's pane and session. Drain's "next chart" (SKILL.md:47) is limited to that set. A chart with another door's Mode block, or any chart not handed, is never touched. Reason: one marker answers both ownership and mode. Cost: none beyond the block.
## Evidence
operator · INTAKE.md (several doors at once, handed work only, never changes its own switch); history 08-19 agent YAML; SKILL.md:31 seats record, :47 Drain.
## Pitfalls
Stale mode carried over: ended by the pass's own `Mode: attended`. Two doors on one chart: Mode block names the owner.
END switch-A
