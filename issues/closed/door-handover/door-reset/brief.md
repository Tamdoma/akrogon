# Brief: door-reset

## What
Under chart-issues autopilot, when door seat A switches from a finished chart to the next runnable chart in its handed list, A hands itself to a fresh conversation in its own pane.

A creates the next chart's folder when it has none (INTAKE.md and CHART.md with its mode record, as at chart creation). It then appends a `handover` mode entry to every handed chart still open, the next one included, runs a new helper `skills/chart-issues/scripts/door-reset.ts`, and ends its turn normally. The helper does three things:
- It waits for A's proven turn end.
- It sends the harness's own new-conversation command (`/clear` for claude, `/new` for codex and pi) into the same running process.
- It sends a start prompt.

The fresh A matches the prompt to the latest mode entry, appends `continue autopilot (handover <time>)` and continues the same pass. Claude, codex and pi are supported, with any model and launch flags, because the process is never restarted.

Attended mode is unchanged:
- A new session without the handover prompt still starts attended.
- Panes, layout, consultant handling and the handed list are unchanged.

## Why
Under autopilot A keeps one session across every chart. Its context, and the cost of every call, grows chart after chart: 122k–164k average context per call and about 4.4–5.8M cache read per chart, from issues/closed/usage-windows/usage-spans/implementation/report.md. A fresh session today cannot continue autopilot without the operator's words (Tamdoma/akrogon#101).

## Done-criteria
1. A live autopilot run with two handed items is run for each of claude, codex and pi as door A, side by side, each on its own throwaway pane and scratch repo with its own log. The second item has no chart folder when the first chart hands off. After the first chart, each A creates the second chart's folder, appends the `handover` entry, runs the helper and ends its turn. (A,B) Then, with no operator input:
   - the same pane and process hold a new session of the same kind (for codex the session appears after the first exchange);
   - the new session appends `continue autopilot (handover <time>)` with its own session id to the second chart's mode record;
   - it starts the second chart.
   Layout and pane ids are unchanged. For claude, a second fresh session in that pane, invoked on the same chart without the start prompt, asks the operator instead of continuing.
2. The helper exits non-zero and sends nothing to the pane when that pane's herdr agent is not claude, codex or pi, or when its session differs from the session A passed.
3. The helper sends the new-conversation command only after the kind's proven turn end for A's turn:
   - claude: the transcript's `turn_duration` after the last prompt;
   - codex: the rollout's `task_complete` or `turn_aborted` for the last `task_started`;
   - pi: hook authority idle or done.
   It sends nothing when the turn is still open at its bound, or when the session changed before sending, and it logs which case happened.
4. The helper sends the start prompt only after herdr shows a session different from A's. For codex, which shows its new session only after an exchange, the helper first sends one harmless check prompt that asks for no chart work. When no new session appears within the bound, it logs an unconfirmed reset and sends no start prompt. (A,B)
5. A start prompt or check prompt that herdr reports as stalled is logged as a failure. Every step's outcome is one line in the log the `handover` entry names, and no step is retried.
6. The skill rules, the mode-record shape and the chart guide describe the handover step, the `handover` and `continue autopilot (handover <time>)` entries, the supported kinds and the footer wording "handover queued". Attended-mode text is otherwise unchanged.
