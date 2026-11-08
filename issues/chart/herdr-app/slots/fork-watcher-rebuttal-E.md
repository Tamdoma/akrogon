# Rebuttal: watcher (Seat E)

## Q1. Timer — why B's and D's cron replacements fail

- **B's transcript file-change notifications invert the signal:** A healthy `working` agent appends to its transcript on every model chunk and tool call (firing constant watcher wakes during normal work), whereas a silent `working` stall (Codex waiting on an in-TUI question, or a hung tool subcommand) stops appending and emits zero file events.
- **D's edge-only wakes + check-armed recheck miss mid-turn stalls for 60 minutes:** Unless the listener wakes the watcher on every normal `idle -> working` turn edge (prohibitive noise), no check runs during a turn to arm D's recheck until the 60-minute busy deadline fires. Keeping the 20-minute cron alongside anomaly event wakes catches in-turn tool loops and silent `working` stalls within 20 minutes without waking on normal turns, and survives a dead listener.
- **Attribution note:** My practitioner reference was not unsourced; `fork-watcher-E.md` cited OpenHands (`StuckDetector`), SWE-agent, and LangGraph supervisor patterns combining event triggers with periodic liveness/trajectory checks.

## Q3. Scope — one watcher per repo

- Keep one watcher per repo (`<root>`), labeled with the repo (`akrogon.watch=<repo>` or `akrogon.role=watcher` + `akrogon.repo=<repo>`), so `/watch-issues tick <root>` and `observe.ts <root>` stay scoped to one `.akrogon/` tree even when multiple repos share an `hc` session.
