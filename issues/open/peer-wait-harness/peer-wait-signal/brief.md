# Brief: peer-wait-signal

## What
chart-issues `peer-wait.ts` reports `failure` for an idle peer with no return file only when the peer's harness gives a proven end signal for the prompted turn: claude transcript, pi hook authority, codex rollout turn. Every other kind keeps waiting to the budget. The outcome line says whether the signal was proven, and the chart door asks the operator before rerunning an unproven idle `budget`. The lesson this guards is retired.

## Why
Tamdoma/akrogon#91: an antigravity peer that was still working read idle in herdr, and peer-wait's 10-second rule returned `failure` twice (learnings/history/2026-10-15-peer-wait-antigravity-idle.md). The rule treats every non-Claude idle as a finished turn.

## Done-criteria
1. A peer of a kind with no proven end signal (antigravity, or any kind other than claude, pi and codex) that shows `idle` or `done` with no return file never gets `failure`; the wait ends `done` when the file is written, or `budget` at the deadline with `signal: unproven`.
2. A pi peer whose herdr entry has `agent: pi`, `agent_session.source: herdr:pi` and `screen_detection_skipped: true` gets `failure` after the 10 s grace when idle with no return file; with `screen_detection_skipped` null or absent, or another source, it is unproven. A list holding a pi peer and a codex peer whose `screen_detection_skipped` is null parses.
3. A codex peer gets `failure` after the grace only when its rollout file (exactly one `rollout-*-<session>.jsonl` under `~/.codex/sessions`) holds `task_complete` or `turn_aborted` for the `turn_id` of a `task_started` written after the boundary recorded before the prompt was sent; a task completed before that boundary never ends the wait; no session, zero or several rollout matches, or no `task_started` after the boundary is unproven.
4. A claude peer keeps today's transcript check.
5. A herdr status of `blocked` read at a grace check ends the wait with outcome `blocked`.
6. Identity is re-read at each grace check: a kind change is an error for every kind; a session change between two non-null values is an error naming both for claude and codex; a pi session change is ignored while its hook authority holds, and losing that authority makes it unproven; a session null at start and set later is adopted; an agent gone from the list is the existing `No herdr agent on pane` error.
7. Every `budget` rerun carries the exchange's original kind and first adopted non-null session, and applies criterion 6 against that carried identity rather than starting a new identity baseline. Codex additionally carries the original pre-prompt boundary and any bound turn id, so a rerun never binds a different turn. The pi authority/session exception remains as stated in criterion 6. (B)
8. Every outcome line carries `signal: proven` or `signal: unproven`; chart-issues questions.md tells the door to report an outcome `budget` with status `idle` or `done` and `signal: unproven` to the operator before any rerun, and to rerun every other `budget` at once.
9. The lesson line for peer-wait-antigravity-idle is removed from `learnings/LESSONS.md` and `learnings/history/2026-10-15-peer-wait-antigravity-idle.md` gains `Applied <YYYY-MM-DD> by <guard file:line>: <what it enforces>`, in this leaf's diff.
