# Signal notes, slot A (2026-10-15)

## Facts
- A1. `akrogon config` `harnesses:` lists claude, codex, pi only; agy is not configured. The operator swapped the agy seat for pi today.
- A2. This session: zero `failure` outcomes across codex (w8:pNQ), Claude (w8:pPM) and agy-then-pi (w8:pPY); `budget` reruns only. The #91 failures were only the framework door's agy pane.
- A3. herdr v0.9.1 (source /home/ivan/Work/infra/herdrdev/herdr at tag v0.9.1; Explore read, A spot-checked):
  - pi has full lifecycle hook authority (src/detect/mod.rs:327-337). The pi hook sets working on `agent_start` and idle only on `agent_settled` with `ctx.isIdle() === true` (src/integration/assets/pi/herdr-agent-state.ts:243-260). herdr idle for pi is a turn end, as long as the hook is effective.
  - codex has no hook state; status is screen-only: spinner in the OSC title or the `esc to interrupt` timer line, else idle fallback (distribution/agent-detection/codex.toml:15-20,82-102; src/detect/manifest.rs:565-581). Silent codex work without those signals reads idle.
  - `done` is Idle not yet seen, not process exit (src/app/api_helpers.rs:96-107). A pane whose process died is published Idle with process_exited, so `done` when unseen (src/app/actions.rs:1784-1810). An agent exiting to a live shell probably reads `unknown` (src/pane.rs:682-696, src/detect/mod.rs:304-311), low confidence, unproven.
  - agy is session-identity only (src/detect/mod.rs:339-347): status from screen rules only.
- A4. codex rollout `~/.codex/sessions/YYYY/MM/DD/rollout-*-<session>.jsonl` writes `event_msg` payloads `task_started` and `task_complete` with matching `turn_id` (B's own rollout, lines 1082/1170 and 1172/1264). The last of these says whether the turn is open, exactly like `claudeTurnOpen` reads Claude's transcript.

## Picks
- Scope: agy is off route (not a configured harness). The problem class is "herdr status is not a turn signal for this harness". Today's members: claude (transcript, done), codex (screen-only, needs a rollout check), pi (hook-authoritative, herdr idle is enough).
- Q1: per-harness turn check, and for a kind with no proven check, never report `failure` on idle: wait out the budget (`budget`), so an added harness can never produce a false failure. claude: transcript (today). codex: last `task_started`/`task_complete` in the rollout. pi: herdr idle is the signal (hook authority), so idle after grace means ended.
- Q2: the idle/done split carries no meaning (both are herdr Idle), so Q2 dissolves. The real dead-peer signal is the agent leaving herdr (`agent_not_found`, `unknown`) or the transcript or rollout closing the turn with no file. Proof needed: what `herdr agent wait`/`list` report for a pi and a codex pane after the agent process exits to the shell.
- Pitfalls: codex rollout path lookup by session id (glob like Claude's, one match required); session replacement mid-wait (identity read once, peer-wait.ts:156); fake herdr needs a status sequence for tests (tests/fake-herdr.ts:218-235); a wait on a dead unknown-kind peer costs one budget per rerun, and the door must stop after a stated number of budgets.
- Lesson: learnings/history/2026-10-15-peer-wait-antigravity-idle.md is the source's lesson; the leaf owning the turn check retires it.
