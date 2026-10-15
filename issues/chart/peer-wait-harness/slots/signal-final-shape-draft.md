# Final shape draft: turn end signal

Operator 2026-10-15: `1a | 2a`.

1. peer-wait's turn check returns one of open, ended or unproven per peer kind, read from `herdr agent list` (peer-wait.ts `readPeerAgent`, `turnOpen`):
   - claude: the transcript check (`claudeTurnOpen`), unchanged.
   - pi: ended when herdr reports `idle` or `done` and the entry has `agent: pi`, `agent_session.source: herdr:pi` and `screen_detection_skipped: true`; with those fields absent, unproven. The list schema keeps `agent_session.source` and `screen_detection_skipped`, both optional.
   - codex: the rollout `~/.codex/sessions/*/*/*/rollout-*-<session>.jsonl` (exactly one match). At the first grace check the wait binds the newest `task_started` `turn_id`; the turn is ended when that id's `task_complete` or `turn_aborted` exists, open otherwise. No session, zero or several matches, or no `task_started` found: unproven.
   - every other kind: unproven.
2. After the existing 10 s grace with no return file and no `working`: ended → `failure`; open or unproven → keep waiting; at the deadline → `budget`. `idle` and `done` are handled the same (`done` is herdr Idle not yet seen).
3. Identity is re-read at each grace check. A session changing from one non-null value to another is an error naming both sessions, for every kind; a session that was null at start and is now set is adopted, not an error. An agent gone from the list is the existing `No herdr agent on pane` error.
4. chart-issues questions.md rule for `budget`: a `budget` outcome with status `idle` or `done` for a peer whose kind has no proven end signal (not claude, pi with hook authority, or codex) is reported to the operator before any rerun; the operator's answer decides whether the wait continues. Every other `budget` is rerun at once, as today.
5. Tests extend the existing fake herdr and peer-wait fixtures: a per-pane status persisted across `agent wait` and `agent list`, list entries with session `source`, `kind` and `screen_detection_skipped`, a scripted session change, and a temporary HOME holding fixture claude and codex session files. No machinery leaf.
6. agy: no reader; an agy peer is an unproven kind.
