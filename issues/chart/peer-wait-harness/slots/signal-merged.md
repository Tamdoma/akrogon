# Signal notes, merged (2026-10-15)

Sources: signal-A.md, signal-B.md (codex), signal-C.md (pi). Tags name the slots whose own notes state the line.

## Agreed
1. agy: no agy reader and no herdr upstream fix now; agy stays possible as an unproven peer kind, because peer-wait reads the kind from herdr per pane, not from akrogon config (peer-wait.ts:94-108) (A,B,C).
2. No codex or pi false failure is recorded; the work hardens codex and pi against the class proven on agy (A,B,C).
3. Q1 pick: `failure` only on an affirmative end signal proven for that harness; every unproven kind waits out the budget (A,B,C).
   - claude: transcript check, unchanged (A,B,C).
   - pi: herdr idle counts only when hook authority is in effect, shown by `agent_session.source == "herdr:pi"` and `screen_detection_skipped: true`; the installed hook publishes idle only on `agent_settled` with `ctx.isIdle()` (~/.pi/agent/extensions/herdr-agent-state.ts:243-259) (A,B,C). peer-wait's list schema must keep those fields (peer-wait.ts:16-26) (C).
   - codex: rollout `task_started` / `task_complete` (and `turn_aborted`) events with `turn_id`; herdr codex status is screen-only (codex.toml; no hook authority, herdr src/detect/mod.rs) (A,B,C). Live counts 19/18 while working, 19/19 after idle (C).
   - Missing proof (no session, zero or several rollout matches, hook fields absent) means unproven: keep waiting, never failure (B,C).
4. Old Q2 dissolves: herdr `done` is Idle not yet seen, not process exit (herdr src/app/api_helpers.rs:96-107, agent_view.rs:391-404); `done` and `idle` get the same handling (A,B,C).
5. A dead peer under "keep waiting" returns `budget` again on every rerun, and the door reruns at once on `budget`, so waiting can go on without end (B,C).
6. No new machinery leaf: tests extend fake herdr and peer-wait fixtures (B,C).

## Disagreements (rebuttal targets)
- D1. Codex turn binding. B: the reader must bind to the task started by this dispatch; "last event is task_complete" can read the previous turn's end, and peer-wait's interface carries no turn identity. A, C: the last of `task_started`/`task_complete`/`turn_aborted` decides, because peer-ask confirms `working` before the wait starts (peer-ask.ts:19-21) and the turn's `task_started` is then already written.
- D2. Session change mid-wait. B: re-read identity before an end verdict; a changed session is an explicit error, never a switch to the new transcript. C: re-read at each grace check and key readers to the current session.
- D3. Endless budgets. C: the chart skill bounds it: an idle-status `budget` repeated with no `working` seen is reported to the operator instead of rerun. B: do not invent a total timeout in the leaf; budget is per call, and the operator chooses.
- D4. Fake herdr. B: a wait sequence already exists (tests/fake-herdr.ts:24-26,50,247-253). C: it does not persist status across `agent wait` and `agent list`, has no session source or `screen_detection_skipped`, no mid-wait session change, and tests use the real `HOME`.
