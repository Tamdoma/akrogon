# Switch fork notes, slot C (blind)

Skill lines at `f7baddc`. No new code, config or timer. The record lives in files the door already writes and reads: temp seat record, then `INTAKE.md`, `CHART.md`, `seats.yaml` (`:37`).

## Q1 Switch on, and the record

Pick: the operator switches on in words in the door pane when starting the door: autopilot, the work handed over, consultants by pane or none. That message is the authorization. Silence is not (`questions.md:31`). The first reply, which already names panes (`:25`), echoes mode, handed work and consultants. After the handed work is read (`:33`) it shows the best-guess needs list (Boundary Taken). The operator supplies what he can, then leaves.

Record: verbatim switch-on text in each handed chart's `INTAKE.md` as an operator source, plus one `CHART.md` line: mode, date/time, door pane. Contents: handed items (note paths, issue identities, chart folders), consultants or none, stated out-of-scope and exceptions, needs guessed and supplied (names only). Before a chart folder exists it sits with the temp seat record (`:37`) and lands at creation.

Rejected: config key or command switch. Config is per repo or machine, the mode is per tab, and concurrent tabs differ. A key also becomes the refused default if forgotten. The mode attaches to a door plus a handed list. The chart record names the door pane, so another tab reading the chart is not in autopilot. Cost: one fuller operator message per session.

## Q2 Switch off

Pick: three endings, each a superseding mode line in the chart. Any operator message in the door pane turns it off from the next decision point, except one explicitly continuing or extending it, which is a new switch-on record. The handed list exhausted (all handed off, held or waiting) ends it: no lingering for later work. Session end ends it, subject to Q3. Mid-exchange, an open peer turn is collected and recorded first. Nothing after it is decided.

Rejected: only an explicit "off" ends it. An operator back and steering has ended it in fact. Treating his steering as autopilot input gives one chart two drivers.

## Q3 Crash, compaction, replacement

Pick: compaction is the same session, resumes from `CHART.md` (`:6`), continues. A replacement A session continues only when all read true from disk: chart folder exists with mode line, chart is in the handed list, `seats.yaml` A pane is this pane (replacement appends its entry as today, `:37`), and no operator answer sits in the chart after switch-on. It re-reads skill, intake, chart and current fork before any pick.

Rejected: continue on a mode line alone (another tab would inherit it) and never continue (session loss kills every overnight run, a recorded failure pattern, and the chart record exists to survive sessions). If only the temp record existed and is gone, nothing durable remains and that work stops. Cost: one full re-read per chart after replacement.

## Q4 Concurrent doors

Pick: ownership is per chart, read from `seats.yaml` A entries (pane, session). An autopilot door writes or answers only handed-list charts where no `seats.yaml` exists yet (its own new chart, seat record written first) or the A pane is its own. Before recording each answer it re-reads mode line, seats and latest Taken. Any change by another session holds that chart.

Drain (`:47`) is cut to the handed list in handed order. The global oldest-chart and next-seed steps never run (Boundary Taken). Another door's chart is never written, not even to note a skip. It is named only in this door's own record. If the operator hands one chart to two doors, the second finds a foreign A pane and holds. The mistake surfaces instead of being guessed away.

Rejected: a lock file or door registry. Seats already record this per chart. A second registry is a second stale source.

## Evidence

- Operator · INTAKE.md 2026-10-16 · concurrent tabs, some autopilot; Boundary answers: handed work only, needs guessed at start, autopilot never changes its own switch.
- Better-than-training · `SKILL.md:6,25,37,47`; `questions.md:31`.

## Pitfalls

- Stale mode line read as live by a later attended pass. Removed by pane match, superseding off line, and exhaustion. Another pane's line is history, not authority.
- Two doors creating one chart folder at once. Removed by checking for an existing folder and foreign seat record before creating.
- Handed work charted at a different destination. Removed by the record travelling into that chart's intake, destination named.

## Missing questions

- May the operator switch on mid-chart, after attended rounds are taken? My reading: yes, if switch-on names the chart, earlier answers standing. The fork does not ask.
- If the operator returns only to supply a missing need, Q2 turns the door attended. Is a two-minute supply visit an off, or a continue?

END switch-C
